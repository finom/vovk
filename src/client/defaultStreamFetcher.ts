import type { _DefaultFetcherOptions as DefaultFetcherOptions } from './defaultFetcher';
import { _HttpStatus as HttpStatus, type _VovkErrorResponse as VovkErrorResponse } from '../types';
import type { _StreamAsyncIterator as StreamAsyncIterator, _VovkClientFetcher as VovkClientFetcher } from './types';
import { _HttpException as HttpException } from '../HttpException';
import { _StreamResponse as StreamResponse } from '../StreamResponse';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultStreamFetcher';

export const _defaultStreamFetcher: VovkClientFetcher<DefaultFetcherOptions> = async (
  { httpMethod, getPath, validate },
  { params, query, body, prefix = '/api', ...options }
): Promise<StreamAsyncIterator<unknown>> => {
  const endpoint =
    (prefix.startsWith('http://') || prefix.startsWith('https://') || prefix.startsWith('/') ? '' : '/') +
    (prefix.endsWith('/') ? prefix : `${prefix}/`) +
    getPath(params, query);

  try {
    validate({ body, query });
  } catch (e) {
    // if HttpException is thrown, rethrow it
    if (e instanceof HttpException) throw e;
    // otherwise, throw HttpException with status 0
    throw new HttpException(HttpStatus.NULL, (e as Error).message ?? DEFAULT_ERROR_MESSAGE);
  }

  const init: RequestInit = {
    method: httpMethod,
    ...options,
  };

  if (body instanceof FormData) {
    init.body = body as BodyInit;
  } else if (body) {
    init.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(endpoint, init);
  } catch (e) {
    // handle network errors
    throw new HttpException(HttpStatus.NULL, (e as Error).message ?? DEFAULT_ERROR_MESSAGE);
  }

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
        throw new Error('Stream error. ' + String(error));
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

  return {
    // @ts-expect-error xxx
    status: response.status,
    [Symbol.asyncIterator]: asyncIterator,
    cancel: () => {
      canceled = true;
      return reader.cancel();
    },
  };
};
