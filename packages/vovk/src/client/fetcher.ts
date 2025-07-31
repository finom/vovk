import type { VovkDefaultFetcherOptions, VovkClientFetcher } from './types';
import { HttpStatus, KnownAny } from '../types';
import { HttpException } from '../HttpException';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at default fetcher';

export function createFetcher<T>({
  prepareRequestInit,
  transformResponse,
  onSuccess,
  onError,
}: {
  prepareRequestInit?: (init: RequestInit, options: VovkDefaultFetcherOptions<T>) => RequestInit | Promise<RequestInit>;
  transformResponse?: (
    respData: KnownAny,
    options: VovkDefaultFetcherOptions<T>,
    response: Response,
    init: RequestInit
  ) => unknown | Promise<unknown>;
  onSuccess?: (
    respData: KnownAny,
    options: VovkDefaultFetcherOptions<T>,
    response: Response,
    init: RequestInit
  ) => void | Promise<void>;
  onError?: (
    error: HttpException,
    options: VovkDefaultFetcherOptions<T>,
    response: Response | null,
    init: RequestInit | null,
    respData: unknown | null
  ) => void | Promise<void>;
} = {}) {
  // fetcher uses HttpException class to throw errors of fake HTTP status 0 if client-side error occurs
  // For normal HTTP errors, it uses message and status code from the response of VovkErrorResponse type
  const newFetcher: VovkClientFetcher<VovkDefaultFetcherOptions<T>> = async (
    { httpMethod, getEndpoint, validate, defaultHandler, defaultStreamHandler, schema },
    inputOptions
  ) => {
    let response: Response | null = null;
    let respData: unknown | null = null;
    let requestInit: RequestInit | null = null;

    try {
      const { params, query, body, meta, apiRoot, disableClientValidation, init, interpretAs } = inputOptions;
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
          await validate(inputOptions, { endpoint });
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

      requestInit = prepareRequestInit ? await prepareRequestInit(requestInit, inputOptions) : requestInit;

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

      if (contentType?.startsWith('application/jsonl')) {
        respData = defaultStreamHandler({ response, controller, schema });
      } else if (contentType?.startsWith('application/json')) {
        respData = defaultHandler({ response, schema });
      } else {
        respData = response;
      }

      respData = await respData;

      respData = transformResponse ? await transformResponse(respData, inputOptions, response, requestInit) : respData;

      await onSuccess?.(respData, inputOptions, response, requestInit);

      return [respData, response];
    } catch (error) {
      await onError?.(error as HttpException, inputOptions, response, requestInit, respData);

      throw error;
    }
  };

  return newFetcher;
}

export const fetcher = createFetcher();
