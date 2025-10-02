import type {
  ControllerStaticMethod,
  VovkControllerParams,
  VovkControllerQuery,
  KnownAny,
  HttpMethod,
  VovkSchema,
} from '../types';
import type { ClientMethod, VovkRPCModule, VovkFetcher, VovkFetcherOptions, VovkValidateOnClient } from './types';

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
  givenSchema: unknown,
  segmentName: string,
  rpcModuleName: string,
  givenFetcher?: VovkFetcher<OPTS> | Promise<{ fetcher: VovkFetcher<OPTS> }>,
  options?: VovkFetcherOptions<OPTS>
): VovkRPCModule<T, OPTS> => {
  const schema = givenSchema as VovkSchema; // fixes incompatibilities with JSON module
  // fetcher ??= defaultFetcher as NonNullable<typeof fetcher>;
  const segmentNamePath = options?.segmentNameOverride ?? segmentName;
  const segmentSchema = schema.segments[segmentName];
  if (!segmentSchema)
    throw new Error(`Unable to create RPC module. Segment schema is missing for segment "${segmentName}".`);
  const controllerSchema = schema.segments[segmentName]?.controllers[rpcModuleName];
  const client = {} as VovkRPCModule<T, OPTS>;
  if (!controllerSchema) {
    throw new Error(
      `Unable to create RPC module. Controller schema is missing for module "${rpcModuleName}" from segment "${segmentName}".`
    );
  }
  const controllerPrefix = trimPath(controllerSchema.prefix ?? '');

  const forceApiRoot = controllerSchema.forceApiRoot ?? segmentSchema.forceApiRoot;
  const originalApiRoot = forceApiRoot ?? options?.apiRoot ?? '/api';

  for (const [staticMethodName, handlerSchema] of Object.entries(controllerSchema.handlers ?? {})) {
    const { path, httpMethod, validation } = handlerSchema;
    const getEndpoint = ({ apiRoot, params, query }: { apiRoot?: string; params: unknown; query: unknown }) => {
      apiRoot = apiRoot ?? originalApiRoot;
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
      const fetcher =
        givenFetcher instanceof Promise
          ? (await givenFetcher).fetcher
          : (givenFetcher ?? (defaultFetcher as unknown as VovkFetcher<OPTS>));
      const validate: Parameters<typeof fetcher>[0]['validate'] = async (
        validationInput,
        {
          endpoint,
        }: {
          endpoint: string;
        }
      ) => {
        const validateOnClient =
          input.validateOnClient ??
          (options?.validateOnClient instanceof Promise
            ? ((await options?.validateOnClient)?.validateOnClient as VovkValidateOnClient<OPTS>)
            : options?.validateOnClient);
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
    handler.apiRoot = originalApiRoot;
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
