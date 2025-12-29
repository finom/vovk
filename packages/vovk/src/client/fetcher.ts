import type { VovkFetcherOptions, VovkFetcher } from './types';
import { HttpStatus, type VovkHandlerSchema } from '../types';
import { HttpException } from '../core/HttpException';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at default fetcher';

/**
 * Creates a customizable fetcher function for client requests.
 * @see https://vovk.dev/imports
 */
export function createFetcher<T>({
  prepareRequestInit,
  transformResponse,
  onSuccess,
  onError,
}: {
  prepareRequestInit?: (init: RequestInit, options: VovkFetcherOptions<T>) => RequestInit | Promise<RequestInit>;
  transformResponse?: (
    respData: unknown,
    options: VovkFetcherOptions<T>,
    info: { response: Response; init: RequestInit; schema: VovkHandlerSchema }
  ) => unknown | Promise<unknown>;
  onSuccess?: (
    respData: unknown,
    options: VovkFetcherOptions<T>,
    info: { response: Response; init: RequestInit; schema: VovkHandlerSchema }
  ) => void | Promise<void>;
  onError?: (
    error: HttpException,
    options: VovkFetcherOptions<T>,
    info: {
      response: Response | null;
      init: RequestInit | null;
      respData: unknown | null;
      schema: VovkHandlerSchema;
    }
  ) => void | Promise<void>;
} = {}) {
  // fetcher uses HttpException class to throw errors of fake HTTP status 0 if client-side error occurs
  // For normal HTTP errors, it uses message and status code from the response of VovkErrorResponse type
  const newFetcher: VovkFetcher<VovkFetcherOptions<T>> = async (
    { httpMethod, getURL, validate, defaultHandler, defaultStreamHandler, schema },
    inputOptions
  ) => {
    let response: Response | null = null;
    let respData: unknown | null = null;
    let requestInit: RequestInit | null = null;

    try {
      const { meta, apiRoot, disableClientValidation, init, interpretAs } = inputOptions;
      let { body, query, params } = inputOptions;
      const endpoint = getURL({ apiRoot, params, query });
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
          ({ body, query, params } = (await validate(inputOptions, { endpoint })) ?? { body, query, params });
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

      requestInit = {
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

      const abortController = new AbortController();

      requestInit.signal = abortController.signal;

      requestInit = prepareRequestInit ? await prepareRequestInit(requestInit, inputOptions) : requestInit;

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

      if (contentType?.startsWith('application/jsonl')) {
        respData = defaultStreamHandler({ response, abortController, schema });
      } else if (contentType?.startsWith('application/json')) {
        respData = await defaultHandler({ response, schema });
      } else {
        respData = response;
      }

      respData = transformResponse
        ? await transformResponse(respData, inputOptions, { response, init: requestInit, schema })
        : respData;

      await onSuccess?.(respData, inputOptions, { response, init: requestInit, schema });

      return [respData, response];
    } catch (error) {
      await onError?.(error as HttpException, inputOptions, { response, init: requestInit, respData, schema });

      throw error;
    }
  };

  return newFetcher;
}

/**
 * Default fetcher implementation for client requests.
 * @see https://vovk.dev/imports
 */
export const fetcher = createFetcher();
