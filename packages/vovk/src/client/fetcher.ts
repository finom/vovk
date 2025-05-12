import type { VovkDefaultFetcherOptions, VovkClientFetcher } from './types';
import { HttpStatus } from '../types';
import { HttpException } from '../HttpException';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at default fetcher';

function createFetcher<T = unknown>({
  prepareRequestInit,
  transformResponse,
}: {
  prepareRequestInit?: (
    init: RequestInit,
    options: VovkDefaultFetcherOptions & T
  ) => RequestInit | Promise<RequestInit>;
  transformResponse?: (resp: unknown, options: VovkDefaultFetcherOptions & T, init: RequestInit) => unknown;
} = {}) {
  // fetcher uses HttpException class to throw errors of fake HTTP status 0 if client-side error occurs
  // For normal HTTP errors, it uses message and status code from the response of VovkErrorResponse type
  const newFetcher: VovkClientFetcher<VovkDefaultFetcherOptions & T> = async (
    { httpMethod, getEndpoint, validate, defaultHandler, defaultStreamHandler },
    options
  ) => {
    const { params, query, body, apiRoot = '/api', disableClientValidation, init, interpretAs } = options;
    const endpoint = getEndpoint({ apiRoot, params, query });
    const unusedParams = new URL(endpoint).pathname.split('/').filter((segment) => segment.startsWith(':'));

    if (unusedParams.length) {
      throw new HttpException(HttpStatus.NULL, `Unused params: ${unusedParams.join(', ')} in ${endpoint}`, {
        body,
        query,
        params,
        endpoint,
      });
    }

    if (!disableClientValidation) {
      try {
        await validate({ body, query, params, endpoint });
      } catch (e) {
        // if HttpException is thrown, rethrow it
        if (e instanceof HttpException) throw e;
        // otherwise, throw HttpException with status 0
        throw new HttpException(HttpStatus.NULL, (e as Error).message ?? DEFAULT_ERROR_MESSAGE, {
          body,
          query,
          params,
          endpoint,
        });
      }
    }

    let requestInit: RequestInit = {
      method: httpMethod,
      ...init,
      headers: {
        accept: 'application/jsonl, application/json',
        ...init?.headers,
      },
    };

    if (body instanceof FormData) {
      requestInit.body = body as BodyInit;
    } else if (body) {
      requestInit.body = JSON.stringify(body);
    }

    requestInit = prepareRequestInit ? await prepareRequestInit(requestInit, options) : requestInit;

    let response: Response;

    try {
      response = await fetch(endpoint, requestInit);
    } catch (e) {
      // handle network errors
      throw new HttpException(HttpStatus.NULL, (e as Error)?.message ?? DEFAULT_ERROR_MESSAGE, {
        body,
        query,
        params,
        endpoint,
      });
    }

    const contentType = interpretAs ?? response.headers.get('content-type');

    let resp;

    if (contentType?.startsWith('application/jsonl')) {
      resp = defaultStreamHandler(response);
    } else if (contentType?.startsWith('application/json')) {
      resp = defaultHandler(response);
    } else {
      resp = response;
    }

    resp = await resp;

    return transformResponse ? await transformResponse(resp, options, requestInit) : resp;
  };

  return newFetcher;
}

export const fetcher = Object.assign(
  createFetcher({
    transformResponse: (resp) => resp,
  }),
  { create: createFetcher }
);
