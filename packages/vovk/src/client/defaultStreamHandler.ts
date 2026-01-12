import { HttpStatus, type VovkErrorResponse } from '../types.js';
import type { VovkStreamAsyncIterable } from './types.js';
import { HttpException } from '../core/HttpException.js';
import '../utils/shim.js';

export const DEFAULT_ERROR_MESSAGE = 'An unknown error at defaultStreamHandler';

export const defaultStreamHandler = ({
  response,
  abortController,
}: {
  response: Response;
  abortController: AbortController;
}): VovkStreamAsyncIterable<unknown> => {
  // Handle error responses by creating a stream that fails on first iteration
  if (!response.ok) {
    let cachedError: HttpException | null = null;
    let errorParsed = false;

    // Parse error asynchronously and cache it
    void response
      .json()
      .then((res) => {
        cachedError = new HttpException(response.status, (res as VovkErrorResponse).message ?? DEFAULT_ERROR_MESSAGE);
      })
      .catch((e) => {
        cachedError = new HttpException(response.status, (e as Error).message ?? DEFAULT_ERROR_MESSAGE, e);
      })
      .finally(() => {
        errorParsed = true;
      });

    const getError = async (): Promise<HttpException> => {
      // Wait for error to be parsed
      while (!errorParsed) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return cachedError ?? new HttpException(response.status, DEFAULT_ERROR_MESSAGE);
    };

    const errorIterator = (): AsyncIterator<unknown> => ({
      async next() {
        throw await getError();
      },
    });

    const noop = () => {};

    return {
      status: response.status,
      asPromise: async () => {
        throw await getError();
      },
      abortController,
      [Symbol.asyncIterator]: errorIterator,
      [Symbol.dispose]: noop,
      [Symbol.asyncDispose]: async () => {},
      abortWithoutError: noop,
      onIterate: () => noop,
    };
  }

  if (!response.body) {
    throw new HttpException(HttpStatus.NULL, 'Stream body is falsy. Check your controller code.');
  }

  const reader = response.body.getReader();
  const subscribers = new Set<(data: unknown, i: number) => void>();

  // State
  let isAbortedWithoutError = false;
  let streamExhausted = false;
  let streamError: unknown = null;
  let errorIndex = -1;
  let primaryStarted = false;
  const cachedItems: unknown[] = [];

  type Waiter = {
    index: number;
    resolve: (value: IteratorResult<unknown>) => void;
    reject: (error: unknown) => void;
  };
  const waiters: Waiter[] = [];

  // --- Helper functions ---

  const notifyWaiters = () => {
    for (let i = waiters.length - 1; i >= 0; i--) {
      const waiter = waiters[i];
      let handled = false;

      if (streamError && waiter.index >= errorIndex) {
        waiter.reject(streamError);
        handled = true;
      } else if (waiter.index < cachedItems.length) {
        waiter.resolve({ value: cachedItems[waiter.index], done: false });
        handled = true;
      } else if (streamExhausted || (abortController.signal.aborted && isAbortedWithoutError)) {
        waiter.resolve({ value: undefined, done: true });
        handled = true;
      }

      if (handled) {
        waiters.splice(i, 1);
      }
    }
  };

  const setStreamError = (error: unknown) => {
    errorIndex = cachedItems.length;
    streamError = error;
    notifyWaiters();
  };

  const disposeStream = (reason: string) => {
    isAbortedWithoutError = true;
    streamExhausted = true;
    notifyWaiters();
    abortController.abort(reason);
    reader.cancel().catch(() => {});
  };

  // --- Primary reader ---

  const runPrimaryReader = async () => {
    let buffer = '';
    let iterationIndex = 0;

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
          setStreamError(err);
          return;
        }

        const chunk = typeof value === 'number' ? String.fromCharCode(value) : new TextDecoder().decode(value);
        buffer += chunk;
        const lines = buffer.split('\n').filter(Boolean);

        for (const line of lines) {
          if (abortController.signal.aborted && isAbortedWithoutError) {
            break;
          }

          let data: object | undefined;
          try {
            data = JSON.parse(line) as object;
            buffer = buffer.slice(line.length + 1);
          } catch {
            break; // Incomplete JSON line, wait for more data
          }

          if (data) {
            subscribers.forEach((cb) => {
              if (!abortController.signal.aborted) cb(data, iterationIndex);
            });

            iterationIndex++;

            if ('isError' in data && 'reason' in data) {
              const upcomingError = (data as { reason: unknown }).reason;
              abortController.abort(upcomingError);
              const error = typeof upcomingError === 'string' ? new Error(upcomingError) : upcomingError;
              setStreamError(error);
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

  // --- Async iterator ---

  async function* asyncIterator(): AsyncGenerator<unknown> {
    if (!primaryStarted) {
      primaryStarted = true;
      void runPrimaryReader();
    }

    let index = 0;

    while (true) {
      // Check error first
      if (streamError && index >= errorIndex) {
        throw streamError;
      }

      // Clean exit on abort without error
      if (abortController.signal.aborted && isAbortedWithoutError) {
        return;
      }

      // Yield from cache if available
      if (index < cachedItems.length) {
        yield cachedItems[index++];
        continue;
      }

      // Stream finished
      if (streamExhausted) {
        return;
      }

      // Wait for next item or completion
      const result = await new Promise<IteratorResult<unknown>>((resolve, reject) => {
        // Re-check state inside promise to handle race conditions
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

  // --- Public API ---

  const asPromise = async () => {
    const items: unknown[] = [];
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

  return {
    status: response.status,
    asPromise,
    abortController,
    [Symbol.asyncIterator]: asyncIterator,
    [Symbol.dispose]: () => disposeStream('Stream disposed'),
    [Symbol.asyncDispose]: async () => disposeStream('Stream async disposed'),
    abortWithoutError,
    onIterate: (cb) => {
      if (abortController.signal.aborted) return () => {};
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
  };
};
