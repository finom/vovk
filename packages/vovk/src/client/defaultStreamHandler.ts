import { HttpStatus, VovkHandlerSchema, type VovkErrorResponse } from '../types';
import type { VovkStreamAsyncIterable } from './types';
import { HttpException } from '../HttpException';
import '../utils/shim';

export const DEFAULT_ERROR_MESSAGE = 'An unknown error at defaultStreamHandler';

export const defaultStreamHandler = ({
  response,
  abortController,
}: {
  response: Response;
  abortController: AbortController;
  schema: VovkHandlerSchema;
}): VovkStreamAsyncIterable<unknown> => {
  if (!response.ok) {
    response
      .json()
      .then((res) => {
        throw new HttpException(response.status, (res as VovkErrorResponse).message ?? DEFAULT_ERROR_MESSAGE);
      })
      .catch((e) => {
        throw new HttpException(response.status, (e as Error).message ?? DEFAULT_ERROR_MESSAGE, e);
      });
    // handle server errors
  }

  if (!response.body) throw new HttpException(HttpStatus.NULL, 'Stream body is falsy. Check your controller code.');

  const reader = response.body.getReader();

  const subscribers = new Set<(data: unknown, i: number) => void>();

  async function* asyncIterator() {
    let prepend = '';
    let i = 0;

    while (true) {
      let value: Uint8Array | undefined;

      try {
        let done;
        if (abortController.signal.aborted) break;
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
            if (!abortController.signal.aborted) cb(data, i);
          });

          i++;
          if ('isError' in data && 'reason' in data) {
            const upcomingError = data.reason;
            abortController.abort(data.reason);

            if (typeof upcomingError === 'string') {
              throw new Error(upcomingError);
            }

            throw upcomingError;
          } else if (!abortController.signal.aborted) {
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
    abortController,
    [Symbol.asyncIterator]: asyncIterator,
    [Symbol.dispose]: () => {
      abortController.abort('Stream disposed');
    },
    [Symbol.asyncDispose]: () => {
      abortController.abort('Stream async disposed');
    },
    onIterate: (cb) => {
      if (abortController.signal.aborted) return () => {};
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
  };
};
