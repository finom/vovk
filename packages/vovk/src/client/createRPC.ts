import type {
  ControllerStaticMethod,
  VovkControllerParams,
  VovkControllerQuery,
  KnownAny,
  HttpMethod,
  VovkSchema,
} from '../types';
import type {
  ClientMethod,
  VovkClient,
  VovkClientFetcher,
  VovkDefaultFetcherOptions,
  VovkValidateOnClient,
} from './types';

import { fetcher as defaultFetcher } from './fetcher';
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
    result = result.replace(`{${key}}`, value as string);
  }
  return `${result}${queryStr ? '?' : ''}${queryStr}`;
};

export const createRPC = <T, OPTS extends Record<string, KnownAny> = Record<string, never>>(
  schema: VovkSchema,
  segmentName: string,
  rpcModuleName: string,
  fetcher?: VovkClientFetcher<OPTS>,
  options?: VovkDefaultFetcherOptions<OPTS>
): VovkClient<T, OPTS> => {
  fetcher ??= defaultFetcher as NonNullable<typeof fetcher>;
  const segmentNamePath = options?.segmentNameOverride ?? segmentName;
  const segmentSchema = schema.segments[segmentName];
  if (!segmentSchema)
    throw new Error(`Unable to create RPC module. Segment schema is missing for segment "${segmentName}".`);
  const controllerSchema = schema.segments[segmentName]?.controllers[rpcModuleName];
  const client = {} as VovkClient<T, OPTS>;
  if (!controllerSchema) {
    throw new Error(
      `Unable to create RPC module. Controller schema is missing for module "${rpcModuleName}" from segment "${segmentName}".`
    );
  }
  const controllerPrefix = trimPath(controllerSchema.prefix ?? '');

  for (const [staticMethodName, handlerSchema] of Object.entries(controllerSchema.handlers ?? {})) {
    const { path, httpMethod, validation } = handlerSchema;
    const getEndpoint = ({ apiRoot, params, query }: { apiRoot?: string; params: unknown; query: unknown }) => {
      const forceApiRoot = controllerSchema.forceApiRoot ?? segmentSchema.forceApiRoot;
      apiRoot = apiRoot ?? forceApiRoot ?? options?.apiRoot ?? '/api';
      const endpoint = [
        apiRoot.startsWith('http://') || apiRoot.startsWith('https://') || apiRoot.startsWith('/') ? '' : '/',
        apiRoot,
        forceApiRoot ? '' : segmentNamePath,
        getHandlerPath([controllerPrefix, path].filter(Boolean).join('/'), params, query),
      ]
        .filter(Boolean)
        .join('/')
        .replace(/([^:])\/+/g, '$1/'); // replace // by / but not for protocols (http://, https://)
      return endpoint;
    };

    const handler = (async (
      input: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
        meta?: unknown;
        validateOnClient?: VovkValidateOnClient<OPTS>;
        transform?: (respData: unknown, resp: Response) => unknown;
      } & OPTS = {} as OPTS
    ) => {
      const validate: Parameters<typeof fetcher>[0]['validate'] = async (
        validationInput,
        {
          endpoint,
        }: {
          endpoint: string;
        }
      ) => {
        const validateOnClient = input.validateOnClient ?? options?.validateOnClient;
        if (validateOnClient && validation) {
          if (typeof validateOnClient !== 'function') {
            throw new Error('validateOnClient must be a function');
          }
          return (
            (await validateOnClient({ ...validationInput }, validation, { fullSchema: schema, endpoint })) ??
            validationInput
          );
        }

        return validationInput;
      };

      const internalOptions: Parameters<typeof fetcher>[0] = {
        name: staticMethodName,
        httpMethod: httpMethod as HttpMethod,
        getEndpoint,
        validate,
        defaultHandler,
        defaultStreamHandler,
        schema: handlerSchema,
      };
      const internalInput = {
        ...options,
        ...input,
        body: input.body ?? null,
        query: input.query ?? {},
        params: input.params ?? {},
      };

      if (!fetcher) throw new Error('Fetcher is not provided');

      const [respData, resp] = await fetcher(internalOptions, internalInput);

      return input.transform ? input.transform(respData, resp) : respData;
    }) as ClientMethod<KnownAny, KnownAny, KnownAny>;

    // TODO use Object.freeze, Object.seal or Object.defineProperty to avoid mutation
    handler.schema = handlerSchema;
    handler.controllerSchema = controllerSchema;
    handler.segmentSchema = segmentSchema;
    handler.fullSchema = schema;
    handler.isRPC = true;
    handler.path = [segmentNamePath, controllerPrefix, path].filter(Boolean).join('/');
    handler.queryKey = (key?: unknown[]) => [
      handler.segmentSchema.segmentName,
      handler.controllerSchema.prefix ?? '',
      handler.controllerSchema.rpcModuleName,
      handler.schema.path,
      handler.schema.httpMethod,
      ...(key ?? []),
    ];

    // @ts-expect-error TODO
    client[staticMethodName] = handler;
  }

  return client;
};
