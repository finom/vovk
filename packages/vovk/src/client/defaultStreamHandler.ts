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
        if (canceled) break;
        ({ value, done } = await reader.read());
        if (done) break;
      } catch (error) {
        // await reader.cancel(); // TODO in which cases it needs to be canceled?
        const err = new Error('JSONLines stream error. ' + String(error));
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
          prepend = prepend.slice(line.length + 1);
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
            canceled = true;
            controller.abort(data.reason);

            if (typeof upcomingError === 'string') {
              throw new Error(upcomingError);
            }

            controller.abort('Stream disposed');

            throw upcomingError;
          } else if (!canceled) {
            yield data;
          }
        }
      }
    }
  }

  const asPromise = async () => {
    const items = [];
    for await (const item of asyncIterator()) {
      items.push(item);
    }
    return items;
  };

  return {
    status: response.status,
    asPromise,
    [Symbol.asyncIterator]: asyncIterator,
    [Symbol.dispose]: () => {
      canceled = true;
      controller.abort('Stream disposed');
    },
    [Symbol.asyncDispose]: () => {
      canceled = true;
      controller.abort('Stream async disposed');
    },
    onIterate: (cb) => {
      if (canceled) return () => {};
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    cancel: (reason?: string | Error) => {
      canceled = true;
      return controller.abort(reason ?? 'Stream aborted intentionally');
    },
  };
};
