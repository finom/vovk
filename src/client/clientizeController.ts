import {
  type _VovkControllerMetadata as VovkControllerMetadata,
  type _VovkControllerMetadataJson as VovkControllerMetadataJson,
  type _ControllerStaticMethod as ControllerStaticMethod,
  type _VovkParams as VovkParams,
  type _VovkQuery as VovkQuery,
  type _KnownAny as KnownAny,
} from '../types';
import { type _VovkClientOptions as VovkClientOptions, type _VovkClient as VovkClient } from './types';

import { default as defaultFetcher, type _DefaultFetcherOptions as DefaultFetcherOptions } from './defaultFetcher';
import { _defaultHandler as defaultHandler } from './defaultHandler';
import { _defaultStreamHandler as defaultStreamHandler } from './defaultStreamHandler';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');

const getHandlerPath = <T extends ControllerStaticMethod>(
  endpoint: string,
  params?: VovkParams<T>,
  query?: VovkQuery<T>
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

export const _clientizeController = <T, OPTS extends Record<string, KnownAny> = DefaultFetcherOptions>(
  givenController: VovkControllerMetadataJson,
  options?: VovkClientOptions<OPTS>
): VovkClient<T, OPTS> => {
  const controller = givenController as T & VovkControllerMetadata;
  const client = {} as VovkClient<T, OPTS>;
  if (!controller) throw new Error(`Unable to clientize. Controller metadata is not provided`);
  const metadata = controller._handlers;
  if (!metadata)
    throw new Error(`Unable to clientize. No metadata for controller ${String(controller?._controllerName)}`);
  const prefix = trimPath(controller._prefix ?? '');
  const { fetcher = defaultFetcher } = options ?? {};

  for (const [staticMethodName, { path, httpMethod, clientValidators }] of Object.entries(metadata)) {
    const getPath = (params: { [key: string]: string }, query: { [key: string]: string }) =>
      getHandlerPath([prefix, path].filter(Boolean).join('/'), params, query);

    const validate = async ({ body, query }: { body?: unknown; query?: unknown }) => {
      await options?.validateOnClient?.({ body, query }, clientValidators ?? {});
    };

    const handler = (
      input: {
        body?: unknown;
        query?: { [key: string]: string };
        params?: { [key: string]: string };
      } & OPTS = {} as OPTS
    ) => {
      const internalOptions: Parameters<typeof fetcher>[0] = {
        name: staticMethodName as keyof T,
        httpMethod,
        getPath,
        validate,
        defaultHandler,
        defaultStreamHandler,
      };
      const internalInput = {
        ...input,
        body: input.body ?? null,
        query: input.query ?? {},
        params: input.params ?? {},
        ...options?.defaultOptions,
      };

      if (!fetcher) throw new Error('Fetcher is not provided');

      const fetcherPromise = fetcher(internalOptions, internalInput) as Promise<unknown>;

      if (!(fetcherPromise instanceof Promise)) return Promise.resolve(fetcherPromise);

      return fetcherPromise;
    };

    // @ts-expect-error TODO: Fix this
    client[staticMethodName] = handler;
  }

  return client;
};
