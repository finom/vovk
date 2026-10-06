import { HttpException } from '../core/http-exception.js';
import type { VovkStreamAsyncIterable } from '../types/client.js';
import type { VovkErrorResponse } from '../types/core.js';
import { HttpStatus } from '../types/enums.js';
import '../utils/shim.js';

export const DEFAULT_ERROR_MESSAGE = 'An unknown error at the default stream handler';

type StreamErrorLine = { isError: true; reason: unknown; statusCode?: unknown };

const ERROR_LINE_KEYS = new Set(['isError', 'reason', 'statusCode']);

// only the envelope a responder writes ends the stream, not a data item that happens to have these keys
const isErrorLine = (data: unknown): data is StreamErrorLine =>
  typeof data === 'object' &&
  data !== null &&
  (data as { isError?: unknown }).isError === true &&
  'reason' in data &&
  Object.keys(data).every((key) => ERROR_LINE_KEYS.has(key));

// a thrown value that isn't a string is rethrown as is, a missing one becomes an Error
const toStreamError = ({ reason, statusCode }: StreamErrorLine) => {
  if (reason !== null && reason !== undefined && typeof reason !== 'string') return reason;
  const message = reason ?? DEFAULT_ERROR_MESSAGE;
  return typeof statusCode === 'number' ? new HttpException(statusCode, message) : new Error(message);
};

const toJSONLinesError = (cause: unknown) => {
  const error = new Error(`JSONLines stream error. ${String(cause)}`);
  error.cause = cause;
  return error;
};

// also used without a Response: deriveTools reads a JSONLinesResponder's stream with it
export const readableStreamToAsyncIterable = <T = unknown>({
  readableStream,
  abortController,
}: {
  readableStream: ReadableStream<Uint8Array | string>;
  abortController?: AbortController;
}): Omit<VovkStreamAsyncIterable<T>, 'abortController' | 'status'> => {
  const reader = readableStream.getReader();
  const subscribers = new Set<(data: T, i: number) => void>();
  // one decoder for the whole stream keeps a multi-byte character that a chunk boundary splits
  const decoder = new TextDecoder();
  let text = '';

  // the items a running iteration hasn't passed yet, kept[0] is item number keptFrom
  const kept: T[] = [];
  let keptFrom = 0;
  // the index of the next item for each running iteration
  const cursors = new Set<{ index: number }>();

  let exhausted = false; // nothing more is read
  let stopped = false; // aborted silently or disposed, iterations end at once
  // a thrown value may be falsy, as 0
  let hasStreamError = false;
  let streamError: unknown = null;
  let errorIndex = -1;
  let reading: Promise<void> | null = null;
  let collecting: Promise<T[]> | null = null;

  const dropPassed = (leftAt = keptFrom) => {
    let oldest = cursors.size ? Number.POSITIVE_INFINITY : leftAt;
    for (const cursor of cursors) oldest = Math.min(oldest, cursor.index);
    if (oldest > keptFrom) {
      kept.splice(0, oldest - keptFrom);
      keptFrom = oldest;
    }
  };

  const fail = (error: unknown) => {
    hasStreamError = true;
    streamError = error;
    errorIndex = keptFrom + kept.length;
    exhausted = true;
  };

  const release = (reason: unknown) => {
    exhausted = true;
    abortController?.abort(reason);
    reader.cancel().catch(() => {});
  };

  const stop = (reason?: unknown) => {
    stopped = true;
    kept.length = 0;
    release(reason);
  };

  const isStopped = () => stopped || !!abortController?.signal.aborted;

  // false when the stream ends at this line
  const handleLine = (line: string): boolean => {
    if (!line.trim()) return true;
    let data: T;
    try {
      data = JSON.parse(line) as T;
    } catch (error) {
      fail(toJSONLinesError(error));
      release(error);
      return false;
    }

    // the error envelope is a control message, not data, subscribers must not see it
    if (isErrorLine(data)) {
      fail(toStreamError(data));
      release(data.reason);
      return false;
    }

    const index = keptFrom + kept.length;
    for (const cb of subscribers) {
      if (!isStopped()) cb(data, index);
    }
    if (isStopped()) return false;
    kept.push(data);
    return true;
  };

  const handleText = (isLast: boolean) => {
    let lineStart = 0;
    let newlineIndex = text.indexOf('\n');
    while (newlineIndex !== -1) {
      const line = text.slice(lineStart, newlineIndex);
      lineStart = newlineIndex + 1;
      if (!handleLine(line)) {
        text = '';
        return;
      }
      newlineIndex = text.indexOf('\n', lineStart);
    }
    text = text.slice(lineStart);
    // the last line may come without a trailing newline
    if (isLast && text.trim()) handleLine(text.trim());
  };

  const readChunk = async () => {
    let result: ReadableStreamReadResult<Uint8Array | string>;
    try {
      result = await reader.read();
    } catch (error) {
      if (!exhausted) fail(toJSONLinesError(error));
      return;
    }
    // the stream ended, failed or was released while this chunk was on its way
    if (exhausted) return;
    const { done, value } = result;
    text += done
      ? decoder.decode()
      : typeof value === 'string'
        ? value
        : typeof value === 'number'
          ? String.fromCharCode(value)
          : decoder.decode(value, { stream: true });
    try {
      handleText(done);
    } catch (error) {
      // an onIterate callback threw: the stream ends with its error
      text = '';
      fail(error);
      release(error);
      return;
    }
    if (done) exhausted = true;
  };

  // a chunk is read only when an iteration needs an item past the kept ones, iterations waiting together share it
  const read = () => {
    reading ??= readChunk().finally(() => {
      reading = null;
    });
    return reading;
  };

  async function* iterate(): AsyncGenerator<T> {
    // a later iteration starts at the oldest kept item
    const cursor = { index: keptFrom };
    cursors.add(cursor);

    try {
      while (!stopped) {
        if (cursor.index < keptFrom + kept.length) {
          const item = kept[cursor.index - keptFrom];
          cursor.index++;
          dropPassed();
          yield item;
        } else if (hasStreamError && cursor.index >= errorIndex) {
          throw streamError;
        } else if (exhausted) {
          return;
        } else {
          await read();
        }
      }
    } finally {
      cursors.delete(cursor);
      dropPassed(cursor.index);
      // a consumer that stopped early releases the connection; the items already read stay for a later one
      if (!cursors.size && !exhausted) release('Stream iteration stopped');
    }
  }

  // one consumer collects the items for every call
  const asPromise = async () => {
    collecting ??= (async () => {
      const items: T[] = [];
      for await (const item of iterate()) items.push(item);
      return items;
    })();
    return [...(await collecting)];
  };

  return {
    asPromise,
    [Symbol.asyncIterator]: iterate,
    [Symbol.dispose]: () => stop('Stream disposed'),
    [Symbol.asyncDispose]: async () => stop('Stream async disposed'),
    abortSilently: stop,
    onIterate: (cb) => {
      if (abortController?.signal.aborted) return () => {};
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
  };
};

export const defaultStreamHandler = ({
  response,
  abortController,
}: {
  response: Response;
  abortController: AbortController;
}): VovkStreamAsyncIterable<unknown> => {
  if (!response.ok) {
    let cachedError: HttpException | null = null;
    let errorParsed = false;

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
      abortSilently: noop,
      onIterate: () => noop,
    };
  }

  if (!response.body) {
    throw new HttpException(HttpStatus.NULL, 'Stream body is falsy');
  }

  return {
    status: response.status,
    abortController,
    ...readableStreamToAsyncIterable({
      readableStream: response.body,
      abortController,
    }),
  };
};
