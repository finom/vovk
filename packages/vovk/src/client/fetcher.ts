import type { VovkDefaultFetcherOptions, VovkClientFetcher } from './types';
import { HttpStatus, KnownAny } from '../types';
import { HttpException } from '../HttpException';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at default fetcher';

export function createFetcher<T>({
  prepareRequestInit,
  transformResponse,
  onError,
}: {
  prepareRequestInit?: (init: RequestInit, options: VovkDefaultFetcherOptions<T>) => RequestInit | Promise<RequestInit>;
  transformResponse?: (
    respData: KnownAny,
    response: Response,
    options: VovkDefaultFetcherOptions<T>,
    init: RequestInit
  ) => unknown | Promise<unknown>;
  onError?: (error: HttpException, response: Response | null) => void | Promise<void>;
} = {}) {
  // fetcher uses HttpException class to throw errors of fake HTTP status 0 if client-side error occurs
  // For normal HTTP errors, it uses message and status code from the response of VovkErrorResponse type
  const newFetcher: VovkClientFetcher<VovkDefaultFetcherOptions<T>> = async (
    { httpMethod, getEndpoint, validate, defaultHandler, defaultStreamHandler, schema },
    options
  ) => {
    let response: Response | null = null;

    try {
      const { params, query, body, meta, apiRoot, disableClientValidation, init, interpretAs } = options;
      const endpoint = getEndpoint({ apiRoot, params, query });
      const unusedParams = Array.from(
        new URL(endpoint.startsWith('/') ? `http://localhost${endpoint}` : endpoint).pathname.matchAll(/\{([^}]+)\}/g)
      ).map((m) => m[1]);

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
          ...(body instanceof FormData ? {} : { 'content-type': 'application/json' }),
          ...(meta ? { 'x-meta': JSON.stringify(meta) } : {}),
          ...init?.headers,
        },
      };

      if (body instanceof FormData) {
        requestInit.body = body as BodyInit;
      } else if (body) {
        requestInit.body = JSON.stringify(body);
      }

      requestInit = prepareRequestInit
        ? await prepareRequestInit(requestInit, options as unknown as VovkDefaultFetcherOptions<T>)
        : requestInit;

      const controller = new AbortController();

      requestInit.signal = controller.signal;

      try {
        response = await fetch(endpoint, requestInit);
      } catch (e) {
        // handle network errors
        throw new HttpException(HttpStatus.NULL, ((e as Error)?.message ?? DEFAULT_ERROR_MESSAGE) + ' ' + endpoint, {
          body,
          query,
          params,
          endpoint,
        });
      }

      const contentType = interpretAs ?? response.headers.get('content-type');

      let resp;

      if (contentType?.startsWith('application/jsonl')) {
        resp = defaultStreamHandler({ response, controller, schema });
      } else if (contentType?.startsWith('application/json')) {
        resp = defaultHandler({ response, schema });
      } else {
        resp = response;
      }

      resp = await resp;

      resp = transformResponse
        ? await transformResponse(resp, response, options as unknown as VovkDefaultFetcherOptions<T>, requestInit)
        : resp;

      return [resp, response];
    } catch (error) {
      await onError?.(error as HttpException, response);

      throw error;
    }
  };

  return newFetcher;
}

export const fetcher = createFetcher();
