import {
  type _VovkControllerSchema as VovkControllerSchema,
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

export const ARRAY_QUERY_KEY = '_vovkarr';

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
  const arrayKeys: string[] = [];
  for (const [key, value] of Object.entries(query ?? {})) {
    if (typeof value === 'undefined') continue;
    if (value instanceof Array) {
      arrayKeys.push(key);
      for (const val of value) {
        searchParams.append(key, val);
      }
    } else {
      searchParams.set(key, value);
    }
    hasQuery = true;
  }

  if (arrayKeys.length) {
    searchParams.set(ARRAY_QUERY_KEY, arrayKeys.join(','));
  }

  return `${result}${hasQuery ? '?' : ''}${searchParams.toString()}`;
};

export const _clientizeController = <T, OPTS extends Record<string, KnownAny> = VovkDefaultFetcherOptions>(
  controllerSchema: VovkControllerSchema,
  segmentName?: string,
  options?: VovkClientOptions<OPTS>
): VovkClient<T, OPTS> => {
  const schema = controllerSchema as T & VovkControllerSchema;
  const client = {} as VovkClient<T, OPTS>;
  if (!schema) throw new Error(`Unable to clientize. Controller schema is not provided`);
  if (!schema.handlers)
    throw new Error(`Unable to clientize. No schema for controller ${String(schema?.controllerName)}`);
  const controllerPrefix = trimPath(schema.prefix ?? '');
  const { fetcher: settingsFetcher = defaultFetcher } = options ?? {};

  for (const [staticMethodName, { path, httpMethod, validation }] of Object.entries(schema.handlers)) {
    const getEndpoint = ({
      apiRoot,
      params,
      query,
    }: {
      apiRoot: string;
      params: { [key: string]: string };
      query: { [key: string]: string };
    }) => {
      const mainPrefix =
        (apiRoot.startsWith('http://') || apiRoot.startsWith('https://') || apiRoot.startsWith('/') ? '' : '/') +
        (apiRoot.endsWith('/') ? apiRoot : `${apiRoot}/`) +
        (segmentName ? `${segmentName}/` : '');
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
          validation ?? {}
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
