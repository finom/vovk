import { HttpStatus } from '../types/enums.js';
import { HttpException } from '../core/HttpException.js';
import type { VovkFetcherOptions, VovkFetcher } from '../types/client.js';
import type { VovkHandlerSchema } from '../types/core.js';
import { fileNameToDisposition } from '../utils/fileNameToDisposition.js';
export const DEFAULT_ERROR_MESSAGE = 'Unknown error at default fetcher';

export type { VovkFetcher };

export type CreateFetcherOnSuccess<T> = (
  respData: unknown,
  options: VovkFetcherOptions<T>,
  info: { response: Response; init: RequestInit; schema: VovkHandlerSchema }
) => void | Promise<void>;

export type CreateFetcherOnError<T> = (
  error: HttpException,
  options: VovkFetcherOptions<T>,
  info: {
    response: Response | null;
    init: RequestInit | null;
    respData: unknown | null;
    schema: VovkHandlerSchema;
  }
) => void | Promise<void>;

/**
 * Creates a customizable fetcher function for client requests.
 * @see https://vovk.dev/imports
 */
export function createFetcher<T>({
  prepareRequestInit,
  transformResponse,
  onSuccess: onSuccessInit,
  onError: onErrorInit,
}: {
  prepareRequestInit?: (init: RequestInit, options: VovkFetcherOptions<T>) => RequestInit | Promise<RequestInit>;
  transformResponse?: (
    respData: unknown,
    options: VovkFetcherOptions<T>,
    info: { response: Response; init: RequestInit; schema: VovkHandlerSchema }
  ) => unknown | Promise<unknown>;
  onSuccess?: CreateFetcherOnSuccess<T>;
  onError?: CreateFetcherOnError<T>;
} = {}) {
  const onSuccessCallbacks: CreateFetcherOnSuccess<T>[] = onSuccessInit ? [onSuccessInit] : [];
  const onErrorCallbacks: CreateFetcherOnError<T>[] = onErrorInit ? [onErrorInit] : [];
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

      const resolvedContentType =
        body instanceof FormData
          ? undefined // browser sets multipart/form-data with boundary automatically
          : body instanceof URLSearchParams
            ? 'application/x-www-form-urlencoded'
            : typeof body === 'string'
              ? 'text/plain'
              : body instanceof Blob
                ? body.type || 'application/octet-stream'
                : body instanceof ArrayBuffer || body instanceof Uint8Array
                  ? 'application/octet-stream'
                  : 'application/json';
      const resolvedFileName = body instanceof File ? body.name : undefined;

      // Default headers (lowercase keys)
      const defaultHeaders: Record<string, string> = {
        accept: 'application/jsonl, application/json',
        ...(resolvedContentType ? { 'content-type': resolvedContentType } : {}),
        ...(resolvedFileName ? { 'content-disposition': fileNameToDisposition(resolvedFileName) } : {}),
        ...(meta ? { 'x-meta': JSON.stringify(meta) } : {}),
      };

      // Normalize user headers to lowercase keys via Headers API (handles plain objects, arrays, and Headers instances)
      const userHeaders = init?.headers ? Object.fromEntries(new Headers(init.headers as HeadersInit).entries()) : {};

      requestInit = {
        method: httpMethod,
        ...init,
        headers: { ...defaultHeaders, ...userHeaders },
      };

      if (body instanceof FormData || body instanceof URLSearchParams) {
        requestInit.body = body as BodyInit;
      } else if (body instanceof Blob) {
        requestInit.body = body as BodyInit;
      } else if (body instanceof ArrayBuffer || body instanceof Uint8Array) {
        requestInit.body = body as BodyInit;
      } else if (typeof body === 'string') {
        requestInit.body = body;
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
        throw new HttpException(HttpStatus.NULL, `${(e as Error)?.message ?? DEFAULT_ERROR_MESSAGE} ${endpoint}`, {
          body,
          query,
          params,
          endpoint,
        });
      }

      const contentType = interpretAs ?? response.headers.get('content-type');

      if (contentType?.startsWith('application/jsonl')) {
        respData = defaultStreamHandler({ response, abortController });
      } else if (contentType?.startsWith('application/json')) {
        respData = await defaultHandler({ response, schema });
      } else {
        respData = response;
      }

      respData = transformResponse
        ? await transformResponse(respData, inputOptions, { response, init: requestInit, schema })
        : respData;

      for (const cb of onSuccessCallbacks) {
        await cb(respData, inputOptions, { response, init: requestInit, schema });
      }

      return [respData, response];
    } catch (error) {
      for (const cb of onErrorCallbacks) {
        await cb(error as HttpException, inputOptions, { response, init: requestInit, respData, schema });
      }

      throw error;
    }
  };

  return Object.assign(newFetcher, {
    onSuccess(cb: CreateFetcherOnSuccess<T>) {
      onSuccessCallbacks.push(cb);
    },
    onError(cb: CreateFetcherOnError<T>) {
      onErrorCallbacks.push(cb);
    },
  });
}

/**
 * Default fetcher implementation for client requests.
 * @see https://vovk.dev/imports
 */
export const fetcher = createFetcher();
