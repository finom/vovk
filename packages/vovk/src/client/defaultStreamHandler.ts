import { HttpStatus, VovkHandlerSchema, type VovkErrorResponse } from '../types';
import type { VovkStreamAsyncIterable } from './types';
import { HttpException } from '../HttpException';
import '../utils/shim';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultStreamHandler';

export const defaultStreamHandler = async ({
  response,
  controller,
}: {
  response: Response;
  controller: AbortController;
  schema: VovkHandlerSchema;
}): Promise<VovkStreamAsyncIterable<unknown>> => {
  if (!response.ok) {
    let result: unknown;
    try {
      result = await response.json();
    } catch {
      // ignore parsing errors
    }
    // handle server errors
    throw new HttpException(response.status, (result as VovkErrorResponse).message ?? DEFAULT_ERROR_MESSAGE);
  }

  if (!response.body) throw new HttpException(HttpStatus.NULL, 'Stream body is falsy. Check your controller code.');

  const reader = response.body.getReader();

  // if streaming is too rapid, we need to make sure that the loop is stopped
  let canceled = false;

  const subscribers = new Set<(data: unknown, i: number) => void>();

  async function* asyncIterator() {
    let prepend = '';
    let i = 0;

    while (true) {
      let value: Uint8Array | undefined;

      try {
        let done;
        ({ value, done } = await reader.read());
        if (done) break;
      } catch (error) {
        await reader.cancel();
        const err = new Error('Stream error. ' + String(error));
        err.cause = error;
        throw err;
      }

      // typeof value === 'number' is a workaround for React Native
      const string = typeof value === 'number' ? String.fromCharCode(value) : new TextDecoder().decode(value);
      prepend += string;
      const lines = prepend.split('\n').filter(Boolean);
      for (const line of lines) {
        let data;
        try {
          data = JSON.parse(line) as object;
          prepend = '';
        } catch {
          break;
        }

        if (data) {
          subscribers.forEach((cb) => {
            if (!canceled) cb(data, i);
          });

          i++;
          if ('isError' in data && 'reason' in data) {
            const upcomingError = data.reason;
            await reader.cancel();

            if (typeof upcomingError === 'string') {
              throw new Error(upcomingError);
            }

            throw upcomingError;
          } else if (!canceled) {
            yield data;
          }
        }
      }
    }
  }

  return {
    status: response.status,
    [Symbol.asyncIterator]: asyncIterator,
    [Symbol.dispose]: () => controller.abort(),
    [Symbol.asyncDispose]: () => controller.abort(),
    onIterate: (cb) => {
      if (canceled) return () => {};
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    abort: () => {
      canceled = true;
      return controller.abort();
    },
  };
};
