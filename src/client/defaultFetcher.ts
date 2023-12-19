import { type _VovkClientFetcher as VovkClientFetcher } from './types';
import { type _ErrorResponseBody as ErrorResponseBody, _HttpStatus as HttpStatus } from '../types';
import { _HttpException as HttpException } from '../HttpException';

// `RequestInit` is the type of options passed to fetch function
export interface _DefaultFetcherOptions extends Omit<RequestInit, 'body' | 'method'> {
  prefix?: string;
  isStream?: boolean;
}

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultFetcher';

// defaultFetcher uses HttpException class to throw errors of fake HTTP status 0 if client-side error occurs
// For normal HTTP errors, it uses message and status code from the response of ErrorResponseBody type
export const _defaultFetcher: VovkClientFetcher<_DefaultFetcherOptions> = async (
  { httpMethod, getPath, validate },
  { params, query, body, prefix = '', ...options }
) => {
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

  let result: unknown;
  let response: Response;

  try {
    response = await fetch(endpoint, init);
  } catch (e) {
    // handle network errors
    throw new HttpException(HttpStatus.NULL, (e as Error)?.message ?? DEFAULT_ERROR_MESSAGE);
  }

  try {
    result = await response.json();
  } catch (e) {
    // handle parsing errors
    throw new HttpException(response.status, (e as Error)?.message ?? DEFAULT_ERROR_MESSAGE);
  }

  if (!response.ok) {
    // handle server errors
    throw new HttpException(response.status, (result as ErrorResponseBody)?.message ?? DEFAULT_ERROR_MESSAGE);
  }

  return result;
};
