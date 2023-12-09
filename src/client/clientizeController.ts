import {
  type _KnownAny as KnownAny,
  type _SmoothieControllerMetadata as SmoothieControllerMetadata,
  type _SmoothieControllerMetadataJson as SmoothieControllerMetadataJson,
  type _ControllerStaticMethod as ControllerStaticMethod,
  type _SmoothieParams as SmoothieParams,
  type _SmoothieQuery as SmoothieQuery,
} from '../types';
import {
  type _SmoothieClientFetcher as SmoothieClientFetcher,
  type _SmoothieClientOptions as SmoothieClientOptions,
  type _SmoothieClient as SmoothieClient,
  type _PromiseWithStream as PromiseWithStream,
} from './types';

import { _defaultStreamFetcher as defaultStreamFetcher } from './defaultStreamFetcher';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');

const getHandlerPath = <T extends ControllerStaticMethod>(
  endpoint: string,
  params?: SmoothieParams<T>,
  query?: SmoothieQuery<T>
) => {
  let result = endpoint;
  for (const [key, value] of Object.entries(params ?? {})) {
    result = result.replace(`:${key}`, value as string);
  }

  const searchParams = new URLSearchParams();
  let hasQuery = false;
  for (const [key, value] of Object.entries(query ?? {})) {
    searchParams.set(key, value);
    hasQuery = true;
  }

  return `${result}${hasQuery ? '?' : ''}${searchParams.toString()}`;
};

export const _clientizeController = <T, OPTS extends Record<string, KnownAny> = Record<string, never>>(
  givenController: SmoothieControllerMetadataJson,
  fetcher: SmoothieClientFetcher<OPTS, T>,
  options?: SmoothieClientOptions<OPTS>
): SmoothieClient<T, OPTS> => {
  const controller = givenController as T & SmoothieControllerMetadata;
  const client = {} as SmoothieClient<T, OPTS>;
  if (!controller) throw new Error(`Unable to clientize. Controller metadata is not provided`);
  if (!fetcher) throw new Error(`Unable to clientize. Fetcher is not provided`);
  const metadata = controller._handlers;
  if (!metadata)
    throw new Error(`Unable to clientize. No metadata for controller ${String(controller?.controllerName)}`);
  const prefix = trimPath(controller._prefix ?? '');
  const { streamFetcher = defaultStreamFetcher } = options ?? {};

  for (const [staticMethodName, { path, httpMethod, clientValidators }] of Object.entries(metadata)) {
    const getPath = (params: { [key: string]: string }, query: { [key: string]: string }) =>
      getHandlerPath([prefix, path].filter(Boolean).join('/'), params, query);

    const validate = ({ body, query }: { body?: unknown; query?: unknown }) => {
      if (options?.disableClientValidation) return;
      return options?.validateOnClient?.({ body, query }, clientValidators ?? {});
    };

    const handler = (
      input: {
        body?: unknown;
        query?: { [key: string]: string };
        params?: { [key: string]: string };
        isStream?: boolean;
      } & OPTS = {} as OPTS
    ) => {
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      const internalOptions: Parameters<typeof fetcher>[0] = {
        name: staticMethodName as keyof T,
        httpMethod,
        getPath,
        validate,
        setReader: (r) => {
          reader = r;
        },
      };
      const internalInput = {
        ...input,
        body: input.body ?? null,
        query: input.query ?? {},
        params: input.params ?? {},
        ...options?.defaultOptions,
      };

      if (input.isStream) {
        type Handler = (message: unknown) => void;
        const handlers: Handler[] = [];
        const messages: unknown[] = [];
        if (!streamFetcher) throw new Error('Stream fetcher is not provided');

        internalOptions.onStreamMessage = (message: unknown) => {
          messages.push(message);
          handlers.forEach((handler) => handler(message));
        };

        const fetcherPromise = streamFetcher(internalOptions, internalInput) as Promise<unknown>;

        if (!(fetcherPromise instanceof Promise)) throw new Error('Stream fetcher must return a promise');

        const resultPromise = fetcherPromise.then(() => messages) as PromiseWithStream<unknown>;

        resultPromise.onMessage = (handler: Handler) => {
          handlers.push(handler);
          return resultPromise;
        };

        resultPromise.cancel = () => {
          if (!reader) throw new Error('Unable to cancel: reader is not set. Check your stream fetcher');
          return reader.cancel();
        };

        return resultPromise;
      }

      const fetcherPromise = fetcher(internalOptions, internalInput) as PromiseWithStream<unknown>;

      if (!(fetcherPromise instanceof Promise)) throw new Error('Fetcher must return a promise');

      fetcherPromise.onMessage = () => {
        throw new Error('onMessage is not supported for non-streaming requests');
      };

      fetcherPromise.cancel = () => {
        throw new Error('cancel is not supported for non-streaming requests');
      };

      return fetcherPromise;
    };

    // @ts-expect-error TODO: Fix this
    client[staticMethodName] = handler;
  }

  return client;
};
