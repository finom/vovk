import {
  type _VovkControllerMetadata as VovkControllerMetadata,
  type _ControllerStaticMethod as ControllerStaticMethod,
  type _VovkControllerParams as VovkControllerParams,
  type _VovkControllerQuery as VovkControllerQuery,
  type _KnownAny as KnownAny,
} from '../types';
import {
  type _VovkClientOptions as VovkClientOptions,
  type _VovkClient as VovkClient,
  type _VovkDefaultFetcherOptions as VovkDefaultFetcherOptions,
  _VovkValidateOnClient,
} from './types';

import defaultFetcher from './defaultFetcher';
import { _defaultHandler as defaultHandler } from './defaultHandler';
import { _defaultStreamHandler as defaultStreamHandler } from './defaultStreamHandler';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');

const getHandlerPath = <T extends ControllerStaticMethod>(
  endpoint: string,
  params?: VovkControllerParams<T>,
  query?: VovkControllerQuery<T>
) => {
  let result = endpoint;
  for (const [key, value] of Object.entries(params ?? {})) {
    result = result.replace(`:${key}`, value as string);
  }

  const searchParams = new URLSearchParams();
  let hasQuery = false;
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value instanceof Array) {
      for (const val of value) {
        searchParams.append(key, val);
      }
    } else {
      searchParams.set(key, value);
    }
    hasQuery = true;
  }

  return `${result}${hasQuery ? '?' : ''}${searchParams.toString()}`;
};

export const _clientizeController = <T, OPTS extends Record<string, KnownAny> = VovkDefaultFetcherOptions>(
  givenController: VovkControllerMetadata,
  options?: VovkClientOptions<OPTS>
): VovkClient<T, OPTS> => {
  const controller = givenController as T & VovkControllerMetadata;
  const client = {} as VovkClient<T, OPTS>;
  if (!controller) throw new Error(`Unable to clientize. Controller metadata is not provided`);
  const metadata = controller._handlers;
  if (!metadata)
    throw new Error(`Unable to clientize. No metadata for controller ${String(controller?._controllerName)}`);
  const controllerPrefix = trimPath(controller._prefix ?? '');
  const { fetcher: settingsFetcher = defaultFetcher } = options ?? {};

  for (const [staticMethodName, { path, httpMethod, clientValidators }] of Object.entries(metadata)) {
    const getEndpoint = ({
      prefix,
      params,
      query,
    }: {
      prefix: string;
      params: { [key: string]: string };
      query: { [key: string]: string };
    }) => {
      const mainPrefix =
        (prefix.startsWith('http://') || prefix.startsWith('https://') || prefix.startsWith('/') ? '' : '/') +
        (prefix.endsWith('/') ? prefix : `${prefix}/`);
      return mainPrefix + getHandlerPath([controllerPrefix, path].filter(Boolean).join('/'), params, query);
    };

    const handler = (
      input: {
        body?: unknown;
        query?: { [key: string]: string };
        params?: { [key: string]: string };
        validateOnClient?: _VovkValidateOnClient;
        fetcher?: VovkClientOptions<OPTS>['fetcher'];
        transform?: (response: unknown) => unknown;
      } & OPTS = {} as OPTS
    ) => {
      const fetcher = input.fetcher ?? settingsFetcher;
      const validate = async ({ body, query, endpoint }: { body?: unknown; query?: unknown; endpoint: string }) => {
        await (input.validateOnClient ?? options?.validateOnClient)?.(
          { body, query, endpoint },
          clientValidators ?? {}
        );
      };

      const internalOptions: Parameters<typeof fetcher>[0] = {
        name: staticMethodName as keyof T,
        httpMethod,
        getEndpoint,
        validate,
        defaultHandler,
        defaultStreamHandler,
      };
      const internalInput = {
        ...options?.defaultOptions,
        ...input,
        body: input.body ?? null,
        query: input.query ?? {},
        params: input.params ?? {},
        // TS workaround
        fetcher: undefined,
        validateOnClient: undefined,
      };

      delete internalInput.fetcher;
      delete internalInput.validateOnClient;

      if (!fetcher) throw new Error('Fetcher is not provided');

      const fetcherPromise = fetcher(internalOptions, internalInput) as Promise<unknown>;

      if (!(fetcherPromise instanceof Promise)) return Promise.resolve(fetcherPromise);

      return input.transform ? fetcherPromise.then(input.transform) : fetcherPromise;
    };

    // @ts-expect-error TODO: Fix this
    client[staticMethodName] = handler;
  }

  return client;
};
