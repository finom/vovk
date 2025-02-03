import {
  type VovkControllerSchema,
  type ControllerStaticMethod,
  type VovkControllerParams,
  type VovkControllerQuery,
  type KnownAny,
} from '../types';
import { type VovkClientOptions, type VovkClient, type VovkDefaultFetcherOptions, VovkValidateOnClient } from './types';

import defaultFetcher from './defaultFetcher';
import { defaultHandler } from './defaultHandler';
import { defaultStreamHandler } from './defaultStreamHandler';
import serializeQuery from '../utils/serializeQuery';

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

  const queryStr = query ? serializeQuery(query) : null;

  return `${result}${queryStr ? '?' : ''}${queryStr}`;
};

const createRPC = <T, OPTS extends Record<string, KnownAny> = VovkDefaultFetcherOptions>(
  controllerSchema: VovkControllerSchema,
  segmentName?: string,
  options?: VovkClientOptions<OPTS>
): VovkClient<T, OPTS> => {
  const schema = controllerSchema as T & VovkControllerSchema;
  const client = {} as VovkClient<T, OPTS>;
  if (!schema) throw new Error(`Unable to clientize. Controller schema is not provided`);
  if (!schema.handlers)
    throw new Error(`Unable to clientize. No schema for controller ${String(schema?.controllerName)} provided`);
  const controllerPrefix = trimPath(schema.prefix ?? '');
  const { fetcher: settingsFetcher = defaultFetcher } = options ?? {};

  for (const [staticMethodName, handlerSchema] of Object.entries(schema.handlers)) {
    const { path, httpMethod, validation } = handlerSchema;
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
        validateOnClient?: VovkValidateOnClient;
        fetcher?: VovkClientOptions<OPTS>['fetcher'];
        transform?: (response: unknown) => unknown;
      } & OPTS = {} as OPTS
    ) => {
      const fetcher = input.fetcher ?? settingsFetcher;
      const validate = async ({ body, query, endpoint }: { body?: unknown; query?: unknown; endpoint: string }) => {
        await (input.validateOnClient ?? options?.validateOnClient)?.({ body, query, endpoint }, validation ?? {});
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

    handler.schema = handlerSchema;
    handler.controllerSchema = schema;

    // @ts-expect-error TODO
    client[staticMethodName] = handler;
  }

  return client;
};

export default createRPC;
