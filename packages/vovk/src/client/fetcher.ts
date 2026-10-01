import { HttpException } from '../core/http-exception.js';
import type { VovkFetcher, VovkFetcherOptions, VovkStreamAsyncIterable } from '../types/client.js';
import type { VovkHandlerSchema } from '../types/core.js';
import { HttpStatus } from '../types/enums.js';
import { fileNameToDisposition } from '../utils/file-name-to-disposition.js';
export const DEFAULT_ERROR_MESSAGE = 'Unknown error at default fetcher';

// header values must be ByteString, escape non-ASCII as \uXXXX which JSON.parse reads natively
const toAsciiJson = (value: unknown) =>
  JSON.stringify(value).replace(/[\u007f-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);

// invokes emitError once for errors that surface during stream consumption, after the fetcher has returned
function wrapStreamErrors(
  stream: VovkStreamAsyncIterable<unknown>,
  emitError: (error: unknown) => Promise<void>
): VovkStreamAsyncIterable<unknown> {
  let emitted = false;
  const emitOnce = async (error: unknown) => {
    if (emitted) return;
    emitted = true;
    await emitError(error);
  };
  const getIterator = stream[Symbol.asyncIterator].bind(stream);
  const asPromise = stream.asPromise.bind(stream);

  return Object.assign(stream, {
    [Symbol.asyncIterator]: (): AsyncIterator<unknown> => {
      const iterator = getIterator();
      return {
        next: async () => {
          try {
            return await iterator.next();
          } catch (error) {
            await emitOnce(error);
            throw error;
          }
        },
        return: iterator.return?.bind(iterator),
        throw: iterator.throw?.bind(iterator),
      };
    },
    asPromise: async () => {
      try {
        return await asPromise();
      } catch (error) {
        await emitOnce(error);
        throw error;
      }
    },
  });
}

// AbortSignal.any is missing in React Native and Safari before 17.4, where the given signal aborts the controller
function anySignal(controller: AbortController, signal: AbortSignal): AbortSignal {
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([controller.signal, signal]);
  if (signal.aborted) controller.abort(signal.reason);
  else signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  return controller.signal;
}

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
// a string body goes out as the type the procedure declares, e.g. application/jsonl, so the server accepts it;
// a form, JSON or wildcard type says nothing about a string, so it falls back to text/plain
const getStringBodyContentType = (schema: VovkHandlerSchema) => {
  const declared = schema.validation?.body?.['x-contentType'] as string[] | undefined;
  const isTextLike = (type: string) =>
    !type.includes('*') &&
    !['multipart/form-data', 'application/x-www-form-urlencoded', 'application/json'].includes(type) &&
    !type.endsWith('+json');
  return declared?.find(isTextLike) ?? 'text/plain';
};

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

      if (!disableClientValidation) {
        const endpoint = getURL({ apiRoot, params, query });
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

      // built from the validated query and params, which are the ones to send
      const endpoint = getURL({ apiRoot, params, query });
      // a given param replaces its placeholder with an encoded value, so a brace left in the path is a missing one
      const missingParams = Array.from(endpoint.split('?')[0].matchAll(/\{([^}]+)\}/g), ([, name]) => name);

      if (missingParams.length) {
        throw new HttpException(HttpStatus.NULL, `Missing params: ${missingParams.join(', ')} in ${endpoint}`, {
          body,
          query,
          params,
          endpoint,
        });
      }

      const hasBody = body !== undefined && body !== null;
      const resolvedContentType = !hasBody
        ? undefined // no body, no content type: a cross-origin GET then needs no preflight
        : body instanceof FormData
          ? undefined // browser sets multipart/form-data with boundary automatically
          : body instanceof URLSearchParams
            ? 'application/x-www-form-urlencoded'
            : typeof body === 'string'
              ? getStringBodyContentType(schema)
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
        ...(meta ? { 'x-meta': toAsciiJson(meta) } : {}),
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
      } else if (hasBody) {
        requestInit.body = JSON.stringify(body);
      }

      const abortController = new AbortController();

      // keep the internal controller for stream disposal but let a user-provided init.signal abort too
      requestInit.signal = init?.signal ? anySignal(abortController, init.signal) : abortController.signal;

      requestInit = prepareRequestInit ? await prepareRequestInit(requestInit, inputOptions) : requestInit;

      try {
        response = await fetch(endpoint, requestInit);
      } catch (e) {
        // an abort, an AbortError or the caller's own reason, is not a network failure
        if (requestInit.signal?.aborted) throw e;
        throw new HttpException(HttpStatus.NULL, `${(e as Error)?.message ?? DEFAULT_ERROR_MESSAGE} ${endpoint}`, e);
      }

      const contentType = interpretAs ?? response.headers.get('content-type');

      if (contentType?.startsWith('application/jsonl')) {
        // route mid-stream errors to onError callbacks, which otherwise never see them
        respData = wrapStreamErrors(defaultStreamHandler({ response, abortController }), async (error) => {
          for (const cb of [...onErrorCallbacks]) {
            await cb(error as HttpException, inputOptions, { response, init: requestInit, respData, schema });
          }
        });
      } else if (contentType?.startsWith('application/json')) {
        respData = await defaultHandler({ response, schema });
      } else if (response.status >= 400) {
        // a proxy's error page or a plain text error; a lower non-ok status comes from redirect: 'manual' or no-cors
        const text = await response.text().catch(() => '');
        throw new HttpException(response.status, text || response.statusText || DEFAULT_ERROR_MESSAGE);
      } else {
        respData = response;
      }

      respData = transformResponse
        ? await transformResponse(respData, inputOptions, { response, init: requestInit, schema })
        : respData;

      // a copy, so a callback that unsubscribes itself doesn't make the next one skip
      for (const cb of [...onSuccessCallbacks]) {
        await cb(respData, inputOptions, { response, init: requestInit, schema });
      }

      return [respData, response];
    } catch (error) {
      for (const cb of [...onErrorCallbacks]) {
        await cb(error as HttpException, inputOptions, { response, init: requestInit, respData, schema });
      }

      throw error;
    }
  };

  return Object.assign(newFetcher, {
    onSuccess(cb: CreateFetcherOnSuccess<T>) {
      onSuccessCallbacks.push(cb);
      return () => {
        const index = onSuccessCallbacks.indexOf(cb);
        if (index !== -1) onSuccessCallbacks.splice(index, 1);
      };
    },
    onError(cb: CreateFetcherOnError<T>) {
      onErrorCallbacks.push(cb);
      return () => {
        const index = onErrorCallbacks.indexOf(cb);
        if (index !== -1) onErrorCallbacks.splice(index, 1);
      };
    },
  });
}

/**
 * Default fetcher implementation for client requests.
 * @see https://vovk.dev/imports
 */
export const fetcher = createFetcher();
