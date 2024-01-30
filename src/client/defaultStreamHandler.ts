import { _HttpStatus as HttpStatus, type _VovkErrorResponse as VovkErrorResponse } from '../types';
import type { _StreamAsyncIterator as StreamAsyncIterator } from './types';
import { _HttpException as HttpException } from '../HttpException';
import { _StreamResponse as StreamResponse } from '../StreamResponse';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultStreamHandler';

export const _defaultStreamHandler = async (response: Response): Promise<StreamAsyncIterator<unknown>> => {
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

  async function* asyncIterator() {
    let prepend = '';

    while (true) {
      let value: Uint8Array | undefined;
      let done = false;

      try {
        ({ value, done } = await reader.read());
      } catch (error) {
        await reader.cancel();
        const err = new Error('Stream error. ' + String(error));
        err.cause = error;
        throw err;
      }

      if (done) {
        return;
      }

      const string = new TextDecoder().decode(value);
      const lines = (prepend + string).split(StreamResponse.JSON_DIVIDER).filter(Boolean);
      for (const line of lines) {
        let data;
        try {
          data = JSON.parse(line) as object;
          prepend = '';
        } catch (error) {
          prepend += string;
          break;
        }

        if (data) {
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

  if (typeof Symbol.dispose !== 'symbol') {
    Object.defineProperty(Symbol, 'dispose', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: Symbol.for('dispose'),
    });
  }

  if (typeof Symbol.asyncDispose !== 'symbol') {
    Object.defineProperty(Symbol, 'asyncDispose', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: Symbol.for('asyncDispose'),
    });
  }

  return {
    status: response.status,
    [Symbol.asyncIterator]: asyncIterator,
    [Symbol.dispose]: () => reader.cancel(),
    [Symbol.asyncDispose]: () => reader.cancel(),
    cancel: () => {
      canceled = true;
      return reader.cancel();
    },
  };
};
