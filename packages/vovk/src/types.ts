import type { NextRequest } from 'next/server';
import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas31';
import type { JSONLinesResponse } from './JSONLinesResponse';
import type { VovkStreamAsyncIterable } from './client/types';
import type { PackageJson } from 'type-fest';

export type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type StaticClass = Function; // eslint-disable-line @typescript-eslint/no-unsafe-function-type

export type VovkHandlerSchema = {
  path: string;
  httpMethod: string; // HttpMethod type makes JSON incompatible with VovkHandlerSchema type
  validation?: {
    query?: VovkBasicJSONSchema;
    body?: VovkBasicJSONSchema;
    params?: VovkBasicJSONSchema;
    output?: VovkBasicJSONSchema;
    iteration?: VovkBasicJSONSchema;
  };
  operationObject?: VovkOperationObject;
  misc?: Record<string, KnownAny>;
};

export type VovkControllerSchema = {
  rpcModuleName: string;
  originalControllerName?: string;
  prefix?: string;
  forceApiRoot?: string;
  handlers: { [key: string]: VovkHandlerSchema };
};

export type VovkSegmentSchema = {
  $schema: typeof VovkSchemaIdEnum.SEGMENT | (string & {});
  emitSchema: boolean;
  segmentName: string;
  segmentType: 'segment' | 'mixin' | (string & {});
  forceApiRoot?: string;
  controllers: { [key: string]: VovkControllerSchema };
  meta?: {
    openAPIObject?: Partial<Omit<OpenAPIObject, 'paths'>>;
    package?: PackageJson;
    // [key: string]: KnownAny; // additional metadata can be added here
  };
};

export type VovkMetaSchema = {
  $schema: typeof VovkSchemaIdEnum.META | (string & {});
  config: RequireFields<Partial<VovkStrictConfig>, '$schema'>;
  package?: PackageJson;
  openAPIObject?: Partial<OpenAPIObject>;
  // [key: string]: KnownAny;
};

export type VovkSchema = {
  $schema: typeof VovkSchemaIdEnum.SCHEMA | (string & {});
  segments: { [key: string]: VovkSegmentSchema };
  meta?: VovkMetaSchema;
};

export type VovkErrorResponse = {
  cause?: unknown;
  statusCode: HttpStatus;
  message: string;
  isError: true;
};

export type VovkControllerInternal = {
  _rpcModuleName?: VovkControllerSchema['rpcModuleName'];
  _prefix?: VovkControllerSchema['prefix'];
  _handlers: VovkControllerSchema['handlers'];
  _handlersMetadata?: Record<string, { staticParams?: Record<string, string>[] }>;
  _onError?: (err: Error, req: VovkRequest) => void | Promise<void>;
};

export type VovkController = StaticClass &
  VovkControllerInternal & {
    [key: string]: unknown;
  };

export type DecoratorOptions = {
  cors?: boolean;
  headers?: Record<string, string>;
  staticParams?: Record<string, string>[];
  before?: (this: VovkController, req: VovkRequest) => unknown;
};

export type RouteHandler = ((
  req: VovkRequest,
  params: Record<string, string>
) => Response | Promise<Response> | Iterable<unknown> | AsyncIterable<unknown>) & {
  _options?: DecoratorOptions;
};

export interface VovkRequest<
  BODY extends KnownAny = undefined,
  QUERY extends KnownAny = undefined,
  PARAMS extends KnownAny = undefined,
> extends Omit<NextRequest, 'json' | 'nextUrl'> {
  json: () => Promise<BODY>;
  nextUrl: Omit<NextRequest['nextUrl'], 'searchParams'> & {
    searchParams: Omit<
      NextRequest['nextUrl']['searchParams'],
      'get' | 'getAll' | 'entries' | 'forEach' | 'keys' | 'values'
    > & {
      get: <KEY extends keyof QUERY>(key: KEY) => QUERY[KEY] extends readonly (infer ITEM)[] ? ITEM : QUERY[KEY];
      getAll: <KEY extends keyof QUERY>(key: KEY) => QUERY[KEY] extends KnownAny[] ? QUERY[KEY] : QUERY[KEY][];
      entries: () => IterableIterator<[keyof QUERY, QUERY[keyof QUERY]]>;
      forEach: (
        callbackfn: (
          value: QUERY[keyof QUERY],
          key: keyof QUERY,
          searchParams: NextRequest['nextUrl']['searchParams'] // original searchParams
        ) => void
      ) => void;
      keys: () => IterableIterator<keyof QUERY>;
      values: () => IterableIterator<QUERY[keyof QUERY]>;
    };
  };
  vovk: {
    body: () => Promise<BODY>;
    query: () => QUERY;
    meta: <T = Record<KnownAny, KnownAny>>(meta?: T | null) => T;
    form: <T = BODY>() => Promise<T>;
    params: () => PARAMS;
  };
}

export type ControllerStaticMethod<
  REQ extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<unknown, unknown, unknown>,
  PARAMS extends { [key: string]: string } = KnownAny,
> = ((req: REQ, params: PARAMS) => unknown) & {
  _controller?: VovkController;
};

export type VovkTypedMethod<
  T extends (...args: KnownAny[]) => KnownAny,
  B = KnownAny,
  Q = KnownAny,
  P = KnownAny,
  O = KnownAny,
  I = KnownAny,
  IS_FORM extends boolean = false,
> = T & {
  __types: {
    body: B;
    query: Q;
    params: P;
    output: O;
    iteration: I;
    isForm: IS_FORM;
  };
  isRPC?: boolean;
};

export type VovkControllerBody<T extends (...args: KnownAny) => KnownAny> = Awaited<
  ReturnType<Parameters<T>[0]['vovk']['body']>
>;

export type VovkControllerQuery<T extends (...args: KnownAny) => KnownAny> = ReturnType<
  Parameters<T>[0]['vovk']['query']
>;

export type VovkControllerParams<T extends (...args: KnownAny) => KnownAny> = Parameters<T>[1] extends object
  ? Parameters<T>[1]
  : ReturnType<Parameters<T>[0]['vovk']['params']>;

export type VovkControllerYieldType<T extends (req: VovkRequest<KnownAny, KnownAny>) => KnownAny> = T extends (
  ...args: KnownAny[]
) => AsyncGenerator<infer Y, KnownAny, KnownAny>
  ? Y
  : T extends (...args: KnownAny[]) => Generator<infer Y, KnownAny, KnownAny>
    ? Y
    : T extends (...args: KnownAny[]) => Promise<JSONLinesResponse<infer Y>> | JSONLinesResponse<infer Y>
      ? Y
      : never;

export type VovkOutput<T> = T extends { __types?: { output?: infer O } } ? O : KnownAny;

export type VovkIteration<T> = T extends {
  __types?: { iteration?: infer I };
}
  ? I
  : KnownAny;

export type VovkClientBody<T extends (opts: KnownAny) => KnownAny> = Parameters<T>[0] extends { body: infer B }
  ? B
  : undefined;

export type VovkClientQuery<T extends (opts: KnownAny) => KnownAny> = Parameters<T>[0] extends { query: infer Q }
  ? Q
  : undefined;

export type VovkClientParams<T extends (opts: KnownAny) => KnownAny> = Parameters<T>[0] extends { params: infer P }
  ? P
  : undefined;

export type VovkClientYieldType<T extends (...args: KnownAny[]) => unknown> = T extends (
  ...args: KnownAny[]
) => Promise<VovkStreamAsyncIterable<infer Y>>
  ? Y
  : never;

export type VovkBody<T extends (...args: KnownAny[]) => unknown> = T extends { isRPC: true }
  ? VovkClientBody<T>
  : VovkControllerBody<T>;

export type VovkQuery<T extends (...args: KnownAny[]) => unknown> = T extends { isRPC: true }
  ? VovkClientQuery<T>
  : VovkControllerQuery<T>;

export type VovkParams<T extends (...args: KnownAny[]) => unknown> = T extends { isRPC: true }
  ? VovkClientParams<T>
  : VovkControllerParams<T>;

export type VovkYieldType<T extends (...args: KnownAny[]) => unknown> = T extends { isRPC: true }
  ? VovkClientYieldType<T>
  : VovkControllerYieldType<T>;

export type VovkReturnType<T extends (...args: KnownAny) => unknown> = Awaited<ReturnType<T>>;

export type StreamAbortMessage = {
  isError: true;
  reason: KnownAny;
};

export type VovkValidationType = 'body' | 'query' | 'params' | 'output' | 'iteration';

// Enums

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export enum HttpStatus {
  NULL = 0,
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  TRequest_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TRequestED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_TRequestS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
}

// -----

export interface VovkLLMTool {
  execute: (
    input: {
      body?: KnownAny;
      query?: KnownAny;
      params?: KnownAny;
    },
    options?: KnownAny
  ) => Promise<KnownAny>;
  name: string;
  description: string;
  parameters?: {
    type: 'object';
    properties?: {
      body?: VovkBasicJSONSchema;
      query?: VovkBasicJSONSchema;
      params?: VovkBasicJSONSchema;
    };
    required?: ('body' | 'query' | 'params')[];
    additionalProperties?: boolean;
  };
  models:
    | {
        body?: KnownAny;
        query?: KnownAny;
        params?: KnownAny;
        output?: KnownAny;
        iteration?: KnownAny;
      }
    | undefined;
  type: 'function';
}

export type VovkBasicJSONSchema = {
  $schema?: string;
  type?: string | string[];
  format?: string;
  $ref?: string;
  items?: VovkBasicJSONSchema;
  enum?: KnownAny[];
  title?: string;
  description?: string;
  properties?: { [key: string]: VovkBasicJSONSchema };
  required?: string[];
  examples?: KnownAny[];
  // support both $defs and definitions
  $defs?: { [key: string]: VovkBasicJSONSchema };
  definitions?: { [key: string]: VovkBasicJSONSchema };
  additionalProperties?: boolean;
  anyOf?: VovkBasicJSONSchema[];
  oneOf?: VovkBasicJSONSchema[];
  allOf?: VovkBasicJSONSchema[];
  // older schema
  const?: KnownAny;
  example?: KnownAny;
  // binary
  contentEncoding?: string;
  contentMediaType?: string;
  minLength?: number;
  maxLength?: number;
  // 'x-foo' extensions
  [key: `x-${string}`]: KnownAny;
};

export type VovkOperationObject = OperationObject & {
  'x-tool-disable'?: boolean;
  'x-tool-description'?: string;
  'x-tool-successMessage'?: string;
  'x-tool-errorMessage'?: string;
  'x-tool-includeResponse'?: boolean;
};

// -----

export enum VovkSchemaIdEnum {
  META = 'https://vovk.dev/api/schema/v3/meta.json',
  CONFIG = 'https://vovk.dev/api/schema/v3/config.json',
  SEGMENT = 'https://vovk.dev/api/schema/v3/segment.json',
  SCHEMA = 'https://vovk.dev/api/schema/v3/schema.json',
}

export type VovkReadmeConfig = {
  banner?: string;
  installCommand?: string;
  description?: string;
};

export type VovkSnippetsConfig = {
  apiRoot?: string;
  headers?: Record<string, string>;
};

type ClientConfigCommon = {
  enabled?: boolean;
  outDir?: string;
  fromTemplates?: string[];
  prettifyClient?: boolean;
} & (
  | {
      excludeSegments?: never;
      includeSegments?: string[];
    }
  | {
      excludeSegments?: string[];
      includeSegments?: never;
    }
);

type ClientConfigComposed = ClientConfigCommon;

type ClientConfigSegmented = ClientConfigCommon;

type BundleConfig = {
  requires?: Record<string, string>;
  prebundleOutDir?: string;
  keepPrebundleDir?: boolean;
  tsdownBuildOptions?: Parameters<typeof import('tsdown').build>[0];
  generatorConfig?: VovkGeneratorConfigCommon;
} & (
  | {
      excludeSegments?: never;
      includeSegments?: string[];
    }
  | {
      excludeSegments?: string[];
      includeSegments?: never;
    }
);

export interface VovkGeneratorConfigCommon {
  origin?: string | null;
  package?: PackageJson;
  readme?: VovkReadmeConfig;
  snippets?: VovkSnippetsConfig;
  openAPIObject?: Partial<OpenAPIObject>;
  reExports?: Record<string, string>;
}

export type ClientTemplateDef = {
  extends?: string;
  templatePath?: string | null;
  composedClient?: Omit<ClientConfigComposed, 'fromTemplates' | 'enabled'>;
  segmentedClient?: Omit<ClientConfigSegmented, 'fromTemplates' | 'enabled'>;
  requires?: Record<string, string>;
  generatorConfig?: VovkGeneratorConfigCommon;
};

export type GetOpenAPINameFn = (config: {
  operationObject: VovkOperationObject;
  method: HttpMethod;
  path: string;
  openAPIObject: OpenAPIObject;
}) => string;

export interface VovkOpenAPIMixin {
  source:
    | {
        file: string;
      }
    | {
        url: string;
        fallback?: string;
      }
    | {
        object: OpenAPIObject;
      };
  package?: PackageJson;
  readme?: VovkReadmeConfig;
  snippets?: VovkSnippetsConfig;
  apiRoot?: string;
  getModuleName?: // if not provided, will use 'api' by default
  | 'nestjs-operation-id' // UserController from 'UserController_getUser' operation ID
    | (string & {}) // literal module name, like MedusaRPC, GithubReposRPC, etc.
    | 'api' // declared for documentation purposes as default
    | GetOpenAPINameFn;
  getMethodName?: // if not provided, will use 'camel-case-operation-id' if operationId is snake_case, in other cases will use 'auto' strategy
  | 'nestjs-operation-id' // getUser from 'UserController_getUser' operation ID
    | 'camel-case-operation-id' // operation ID to camelCase
    | 'auto' // auto-detect based on operationObject method and path
    | GetOpenAPINameFn;
  errorMessageKey?: string;
}

export interface VovkOpenAPIMixinNormalized
  extends Omit<VovkOpenAPIMixin, 'source' | 'getMethodName' | 'getModuleName'> {
  source: Exclude<
    NonNullable<VovkOpenAPIMixin['source']>,
    { file: string } | { url: string } // "object" only
  >;
  getMethodName: GetOpenAPINameFn;
  getModuleName: GetOpenAPINameFn;
}

export interface VovkSegmentConfig extends VovkGeneratorConfigCommon {
  rootEntry?: string;
  segmentNameOverride?: string;
  openAPIMixin?: VovkOpenAPIMixin;
}

export interface VovkGeneratorConfig extends VovkGeneratorConfigCommon {
  segments?: Record<string, VovkSegmentConfig>;
}

interface ProjectConfigStrict extends Omit<VovkGeneratorConfig, 'origin' | 'segments'> {
  origin: string;
  segments?: Record<string, Omit<VovkSegmentConfig, 'openAPIMixin'> & { openAPIMixin: VovkOpenAPIMixinNormalized }>;
}

type VovkUserConfig = {
  $schema?: typeof VovkSchemaIdEnum.CONFIG | (string & {});
  emitConfig?: boolean | (keyof VovkStrictConfig | (string & {}))[];
  schemaOutDir?: string;
  modulesDir?: string;
  rootEntry?: string;
  logLevel?: 'error' | 'trace' | 'debug' | 'info' | 'warn' | (string & {});
  libs?: {
    ajv: KnownAny; // set by providing the typedoc comment in config
    [key: string]: KnownAny;
  };
  devHttps?: boolean;
  composedClient?: ClientConfigComposed;
  segmentedClient?: ClientConfigSegmented;
  bundle?: BundleConfig;
  clientTemplateDefs?: Record<string, ClientTemplateDef>;
  imports?: {
    fetcher?: string | [string, string] | [string];
    validateOnClient?: string | [string, string] | [string];
    createRPC?: string | [string, string] | [string];
  };
  rootSegmentModulesDirName?: string;
  moduleTemplates?: {
    service?: string;
    controller?: string;
    [key: string]: string | undefined;
  };
  generatorConfig?: VovkGeneratorConfig;
};

export type VovkConfig = VovkUserConfig;

export type VovkStrictConfig = Required<
  Omit<
    VovkUserConfig,
    | 'emitConfig'
    | 'libs'
    | 'imports'
    | 'composedClient'
    | 'segmentedClient'
    | 'bundle'
    | 'extendClientWithOpenAPI'
    | 'generator'
  >
> & {
  emitConfig: (keyof VovkStrictConfig | string)[];
  bundle: RequireAllExcept<NonNullable<VovkUserConfig['bundle']>, 'includeSegments' | 'excludeSegments'>;
  imports: {
    fetcher: [string, string] | [string];
    validateOnClient: [string, string] | [string] | null;
    createRPC: [string, string] | [string];
  };
  libs: Record<string, KnownAny>;
  composedClient: RequireFields<ClientConfigComposed, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  segmentedClient: RequireFields<ClientConfigSegmented, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  generatorConfig: ProjectConfigStrict;
};

// utils
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type RequireAllExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;
export type IsEmptyObject<T> = T extends object
  ? keyof T extends never
    ? true // Empty object
    : T extends Partial<T>
      ? Partial<T> extends T
        ? true // All properties are optional
        : false
      : false
  : false;
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
