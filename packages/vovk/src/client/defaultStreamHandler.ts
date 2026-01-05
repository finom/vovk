import { HttpStatus, type VovkErrorResponse } from '../types';
import type { VovkStreamAsyncIterable } from './types';
import { HttpException } from '../core/HttpException';
import '../utils/shim';

export const DEFAULT_ERROR_MESSAGE = 'An unknown error at defaultStreamHandler';

export const defaultStreamHandler = ({
  response,
  abortController,
}: {
  response: Response;
  abortController: AbortController;
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

  let isAbortedWithoutError = false;

  // Caching state
  const cachedItems: unknown[] = [];
  let streamExhausted = false;
  let streamError: unknown = null;
  let activeIterator: AsyncGenerator<unknown> | null = null;
  const waitingIterators: Array<{
    resolve: (value: IteratorResult<unknown>) => void;
    reject: (error: unknown) => void;
  }> = [];

  async function* primaryIterator() {
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
        if ((error as Error)?.name === 'AbortError' && isAbortedWithoutError) break;
        const err = new Error('JSONLines stream error. ' + String(error));
        err.cause = error;
        streamError = err;
        // Notify waiting iterators of the error
        for (const waiter of waitingIterators) {
          waiter.reject(err);
        }
        waitingIterators.length = 0;
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

            const error = typeof upcomingError === 'string' ? new Error(upcomingError) : upcomingError;
            streamError = error;
            // Notify waiting iterators of the error
            for (const waiter of waitingIterators) {
              waiter.reject(error);
            }
            waitingIterators.length = 0;
            throw error;
          } else if (!abortController.signal.aborted) {
            // Cache the item before yielding
            cachedItems.push(data);
            // Notify waiting iterators that new data is available
            for (const waiter of waitingIterators) {
              waiter.resolve({ value: data, done: false });
            }
            waitingIterators.length = 0;
            yield data;
          }
        }
      }
    }

    streamExhausted = true;
    // Notify waiting iterators that stream is done
    for (const waiter of waitingIterators) {
      waiter.resolve({ value: undefined, done: true });
    }
    waitingIterators.length = 0;
  }

  async function* cachedIterator() {
    let index = 0;

    while (true) {
      // If we have cached items available, yield them
      if (index < cachedItems.length) {
        yield cachedItems[index++];
        continue;
      }

      // If stream is exhausted, we're done
      if (streamExhausted) {
        return;
      }

      // If there was an error, throw it
      if (streamError) {
        throw streamError;
      }

      // Wait for more data from the primary iterator
      const result = await new Promise<IteratorResult<unknown>>((resolve, reject) => {
        // Double-check cache in case data arrived while we were setting up
        if (index < cachedItems.length) {
          resolve({ value: cachedItems[index], done: false });
          return;
        }
        if (streamExhausted) {
          resolve({ value: undefined, done: true });
          return;
        }
        if (streamError) {
          reject(streamError);
          return;
        }
        waitingIterators.push({ resolve, reject });
      });

      if (result.done) {
        return;
      }

      index++;
      yield result.value;
    }
  }

  function asyncIterator(): AsyncGenerator<unknown> {
    // First iterator becomes the primary one that reads from the stream
    if (!activeIterator) {
      activeIterator = primaryIterator();
      return activeIterator;
    }

    // Subsequent iterators use cached data and wait for new items
    return cachedIterator();
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
      isAbortedWithoutError = true;
      abortController.abort('Stream disposed');
    },
    [Symbol.asyncDispose]: () => {
      isAbortedWithoutError = true;
      abortController.abort('Stream async disposed');
    },
    abortWithoutError: (reason?: unknown) => {
      isAbortedWithoutError = true;
      abortController.abort(reason);
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
