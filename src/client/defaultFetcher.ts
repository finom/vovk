import type {
  _VovkDefaultFetcherOptions as VovkDefaultFetcherOptions,
  _VovkClientFetcher as VovkClientFetcher,
} from './types';
import { _HttpStatus as HttpStatus } from '../types';
import { _HttpException as HttpException } from '../HttpException';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultFetcher';

// defaultFetcher uses HttpException class to throw errors of fake HTTP status 0 if client-side error occurs
// For normal HTTP errors, it uses message and status code from the response of VovkErrorResponse type
const defaultFetcher: VovkClientFetcher<VovkDefaultFetcherOptions> = async (
  { httpMethod, getEndpoint, validate, defaultHandler, defaultStreamHandler },
  { params, query, body, prefix = '/api', ...options }
) => {
  const endpoint = getEndpoint({ prefix, params, query });

  if (!options.disableClientValidation) {
    try {
      await validate({ body, query, endpoint });
    } catch (e) {
      // if HttpException is thrown, rethrow it
      if (e instanceof HttpException) throw e;
      // otherwise, throw HttpException with status 0
      throw new HttpException(HttpStatus.NULL, (e as Error).message ?? DEFAULT_ERROR_MESSAGE);
    }
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
    throw new HttpException(HttpStatus.NULL, (e as Error)?.message ?? DEFAULT_ERROR_MESSAGE);
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return defaultHandler(response);
  }

  if (response.headers.get('content-type')?.includes('text/event-stream')) {
    return defaultStreamHandler(response);
  }

  return response;
};

export default defaultFetcher;
