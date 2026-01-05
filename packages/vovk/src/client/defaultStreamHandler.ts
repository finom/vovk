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
  }

  if (!response.body) throw new HttpException(HttpStatus.NULL, 'Stream body is falsy. Check your controller code.');

  const reader = response.body.getReader();

  const subscribers = new Set<(data: unknown, i: number) => void>();

  let isAbortedWithoutError = false;

  // Caching state
  const cachedItems: unknown[] = [];
  let streamExhausted = false;
  let streamError: unknown = null;
  let errorIndex: number = -1;
  let primaryStarted = false;

  const waiters: Array<{
    index: number;
    resolve: (value: IteratorResult<unknown>) => void;
    reject: (error: unknown) => void;
  }> = [];

  const notifyWaiters = () => {
    for (let i = waiters.length - 1; i >= 0; i--) {
      const waiter = waiters[i];
      if (streamError && waiter.index >= errorIndex) {
        waiters.splice(i, 1);
        waiter.reject(streamError);
      } else if (waiter.index < cachedItems.length) {
        waiters.splice(i, 1);
        waiter.resolve({ value: cachedItems[waiter.index], done: false });
      } else if (streamExhausted || (abortController.signal.aborted && isAbortedWithoutError)) {
        waiters.splice(i, 1);
        waiter.resolve({ value: undefined, done: true });
      }
    }
  };

  const runPrimaryReader = async () => {
    let prepend = '';
    let i = 0;

    try {
      while (true) {
        if (abortController.signal.aborted && isAbortedWithoutError) {
          break;
        }

        let value: Uint8Array | undefined;
        let done: boolean;

        try {
          ({ value, done } = await reader.read());
          if (done) break;
        } catch (error) {
          if ((error as Error)?.name === 'AbortError' && isAbortedWithoutError) {
            break;
          }
          const err = new Error('JSONLines stream error. ' + String(error));
          err.cause = error;
          errorIndex = cachedItems.length;
          streamError = err;
          notifyWaiters();
          return;
        }

        const string = typeof value === 'number' ? String.fromCharCode(value) : new TextDecoder().decode(value);
        prepend += string;
        const lines = prepend.split('\n').filter(Boolean);

        for (const line of lines) {
          if (abortController.signal.aborted && isAbortedWithoutError) {
            break;
          }

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
              errorIndex = cachedItems.length;
              streamError = error;
              notifyWaiters();
              return;
            } else if (!abortController.signal.aborted) {
              cachedItems.push(data);
              notifyWaiters();
            }
          }
        }

        if (abortController.signal.aborted && isAbortedWithoutError) {
          break;
        }
      }
    } finally {
      streamExhausted = true;
      notifyWaiters();
    }
  };

  const asPromise = async () => {
    const items = [];
    for await (const item of asyncIterator()) {
      items.push(item);
    }
    return items;
  };

  const abortWithoutError = (reason?: unknown) => {
    isAbortedWithoutError = true;
    streamExhausted = true;
    notifyWaiters();
    abortController.abort(reason);
    reader.cancel().catch(() => {});
  };

  // Define asyncIterator as a method that creates fresh generators
  async function* asyncIterator(): AsyncGenerator<unknown> {
    // Start the primary reader on first iteration ever
    if (!primaryStarted) {
      primaryStarted = true;
      runPrimaryReader();
    }

    let index = 0;

    while (true) {
      // Check error FIRST
      if (streamError && index >= errorIndex) {
        throw streamError;
      }

      // Only exit cleanly on abort if it was abortWithoutError
      if (abortController.signal.aborted && isAbortedWithoutError) {
        return;
      }

      if (index < cachedItems.length) {
        yield cachedItems[index++];
        continue;
      }

      if (streamExhausted) {
        return;
      }

      if (streamError && index >= errorIndex) {
        throw streamError;
      }

      const result = await new Promise<IteratorResult<unknown>>((resolve, reject) => {
        if (streamError && index >= errorIndex) {
          reject(streamError);
          return;
        }
        if (abortController.signal.aborted && isAbortedWithoutError) {
          resolve({ value: undefined, done: true });
          return;
        }
        if (index < cachedItems.length) {
          resolve({ value: cachedItems[index], done: false });
          return;
        }
        if (streamExhausted) {
          resolve({ value: undefined, done: true });
          return;
        }

        waiters.push({ index, resolve, reject });
      });

      if (result.done) {
        return;
      }

      index++;
      yield result.value;
    }
  }

  return {
    status: response.status,
    asPromise,
    abortController,
    [Symbol.asyncIterator]: asyncIterator,
    [Symbol.dispose]: () => {
      isAbortedWithoutError = true;
      streamExhausted = true;
      notifyWaiters();
      abortController.abort('Stream disposed');
      reader.cancel().catch(() => {});
    },
    [Symbol.asyncDispose]: () => {
      isAbortedWithoutError = true;
      streamExhausted = true;
      notifyWaiters();
      abortController.abort('Stream async disposed');
      reader.cancel().catch(() => {});
    },
    abortWithoutError,
    onIterate: (cb) => {
      if (abortController.signal.aborted) return () => {};
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
  };
};
