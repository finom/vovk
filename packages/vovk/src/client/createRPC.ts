import type {
  ControllerStaticMethod,
  VovkControllerParams,
  VovkControllerQuery,
  KnownAny,
  HttpMethod,
  VovkFullSchema,
} from '../types';
import type { VovkClientOptions, VovkClient, VovkDefaultFetcherOptions, VovkValidateOnClient } from './types';

import { fetcher } from './fetcher';
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
  const queryStr = query ? serializeQuery(query) : null;
  for (const [key, value] of Object.entries(params ?? {})) {
    result = result.replace(`:${key}`, value as string);
  }
  return `${result}${queryStr ? '?' : ''}${queryStr}`;
};

export const createRPC = <T, OPTS extends Record<string, KnownAny> = VovkDefaultFetcherOptions<Record<string, never>>>(
  fullSchema: VovkFullSchema,
  segmentName: string,
  rpcModuleName: string,
  options?: VovkClientOptions<OPTS>
): VovkClient<T, OPTS> => {
  const segmentSchema = fullSchema.segments[segmentName];
  if (!segmentSchema) throw new Error(`Unable to create RPC object. Segment schema is missing. Check client template.`);
  const controllerSchema = fullSchema.segments[segmentName]?.controllers[rpcModuleName];
  const client = {} as VovkClient<T, OPTS>;
  if (!controllerSchema)
    throw new Error(`Unable to create RPC object. Controller schema is missing. Check client template.`);
  const controllerPrefix = trimPath(controllerSchema.prefix ?? '');
  const { fetcher: settingsFetcher = fetcher } = options ?? {};

  for (const [staticMethodName, handlerSchema] of Object.entries(controllerSchema.handlers)) {
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
      const validate = async ({
        body,
        query,
        params,
        endpoint,
      }: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
        endpoint: string;
      }) => {
        const validateOnClient = input.validateOnClient ?? options?.validateOnClient;
        if (validateOnClient && validation) {
          if (typeof validateOnClient !== 'function') {
            throw new Error('validateOnClient must be a function');
          }
          await validateOnClient({ body, query, params, endpoint }, validation, fullSchema);
        }
      };

      const internalOptions: Parameters<typeof fetcher>[0] = {
        name: staticMethodName as keyof T,
        httpMethod: httpMethod as HttpMethod,
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
    handler.controllerSchema = controllerSchema;
    handler.segmentSchema = segmentSchema;
    handler.fullSchema = fullSchema;
    handler.isRPC = true;

    // @ts-expect-error TODO
    client[staticMethodName] = handler;
  }

  return client;
};
