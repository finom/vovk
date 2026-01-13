import { fetcher as defaultFetcher } from './fetcher.js';
import { defaultHandler } from './defaultHandler.js';
import { defaultStreamHandler } from './defaultStreamHandler.js';
import { serializeQuery } from './serializeQuery.js';
import { deepExtend } from '../utils/deepExtend.js';
import type { VovkHandlerSchema } from '../internal.js';
import type { VovkRequest } from '../types/request.js';
import type { ControllerStaticMethod, VovkSchema } from '../types/core.js';
import type { VovkControllerParams, VovkControllerQuery } from '../types/inference.js';
import type { HttpMethod } from '../types/enums.js';
import type { ClientMethod, VovkRPCModule, VovkFetcher, VovkFetcherOptions } from '../types/client.js';
import type { CombinedSpec, VovkValidateOnClient } from '../types/validation.js';
import type { KnownAny } from '../types/utils.js';

export type { VovkHandlerSchema, VovkRequest, CombinedSpec };

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
  return `${result}${queryStr ? `?${queryStr}` : ''}`;
};

/**
 * Creates a client-side RPC module for interacting with server-side controllers.
 * @see https://vovk.dev/typescript
 */
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
  let controllerSchema = schema.segments[segmentName]?.controllers[rpcModuleName];
  const client = {} as VovkRPCModule<T, OPTS>;
  if (!controllerSchema) {
    // eslint-disable-next-line no-console
    console.warn(
      `🐺 Unable to create RPC module. Controller schema is missing for module "${rpcModuleName}" from segment "${segmentName}". Assuming that schema is not ready yet and a segment is importing an uncompiled RPC module.`
    );

    controllerSchema = {
      rpcModuleName,
      prefix: '',
      handlers: {},
    };
  }
  const controllerPrefix = trimPath(controllerSchema.prefix ?? '');

  const forceApiRoot = segmentSchema.forceApiRoot;
  const configRootEntry = schema.meta?.config?.rootEntry;
  const originalApiRoot = forceApiRoot ?? options?.apiRoot ?? (configRootEntry ? `/${configRootEntry}` : '/api');

  for (const [staticMethodName, handlerSchema] of Object.entries(controllerSchema.handlers ?? {})) {
    const { path, httpMethod, validation } = handlerSchema;
    const getURL = ({ apiRoot, params, query }: { apiRoot?: string; params?: unknown; query?: unknown } = {}) => {
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
      const optionsResolvedValidateOnClient =
        options?.validateOnClient instanceof Promise
          ? ((await options?.validateOnClient)?.validateOnClient as VovkValidateOnClient<OPTS>)
          : options?.validateOnClient;
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
        const validateOnClient = input.validateOnClient ?? optionsResolvedValidateOnClient;
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
        getURL,
        validate,
        defaultHandler,
        defaultStreamHandler,
        schema: handlerSchema,
      };
      const internalInput = {
        ...(deepExtend(
          {},
          options,
          {
            validateOnClient: optionsResolvedValidateOnClient,
          },
          input
        ) as OPTS),
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
    handler.getURL = getURL;
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

  client.withDefaults = (newOptions?: VovkFetcherOptions<OPTS>) => {
    return createRPC<T, OPTS>(schema, segmentName, rpcModuleName, givenFetcher, {
      ...options,
      ...newOptions,
    } as VovkFetcherOptions<OPTS>);
  };

  return client;
};
