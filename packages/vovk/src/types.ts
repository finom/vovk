import type { NextRequest } from 'next/server';
import type { OpenAPIObject, OperationObject } from 'openapi3-ts/oas31';
import type { JSONLinesResponse } from './core/JSONLinesResponse';
import type { VovkStreamAsyncIterable } from './client/types';
import type { PackageJson } from 'type-fest';
import type { VovkToolOptions } from './tools/types';

type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type StaticClass = Function; // eslint-disable-line @typescript-eslint/no-unsafe-function-type

export type VovkPackageJson = PackageJson & {
  rs_name?: string;
  py_name?: string;
};

/**
 * Schema for an individual handler, available as MyRPC.myHandler.schema and MyController.myHandler.schema
 */
export type VovkHandlerSchema = {
  path: string;
  httpMethod: string; // HttpMethod type makes JSON incompatible with VovkHandlerSchema type
  validation?: {
    query?: VovkJSONSchemaBase;
    body?: VovkJSONSchemaBase;
    params?: VovkJSONSchemaBase;
    output?: VovkJSONSchemaBase;
    iteration?: VovkJSONSchemaBase;
  };
  operationObject?: VovkOperationObject;
  misc?: Record<string, unknown>;
};

/**
 * Represents the schema of a controller
 */
export type VovkControllerSchema = {
  rpcModuleName: string;
  originalControllerName?: string;
  prefix?: string;
  forceApiRoot?: string;
  handlers: { [key: string]: VovkHandlerSchema };
};

/**
 * Represents the schema of a segment
 */
export type VovkSegmentSchema = {
  $schema: typeof VovkSchemaIdEnum.SEGMENT | (string & {});
  emitSchema: boolean;
  segmentName: string;
  segmentType: 'segment' | 'mixin' | (string & {});
  forceApiRoot?: string;
  controllers: { [key: string]: VovkControllerSchema };
  meta?: {
    openAPIObject?: Partial<Omit<OpenAPIObject, 'paths'>>;
    package?: VovkPackageJson;
  };
};

/**
 * Represents the meta schema
 */
export type VovkMetaSchema = {
  $schema: typeof VovkSchemaIdEnum.META | (string & {});
  config: RequireFields<Partial<VovkStrictConfig>, '$schema'>;
  openAPIObject?: Partial<OpenAPIObject>;
};

/**
 * Represents the full schema of composed client or a segment in segmented client.
 */
export type VovkSchema = {
  $schema: typeof VovkSchemaIdEnum.SCHEMA | (string & {});
  segments: { [key: string]: VovkSegmentSchema };
  meta?: VovkMetaSchema;
};

/**
 * The shape of error responses
 */
export type VovkErrorResponse = {
  cause?: unknown;
  statusCode: HttpStatus;
  message: string;
  isError: true;
};

export type VovkControllerInternal = {
  _segmentName: string;
  _rpcModuleName?: VovkControllerSchema['rpcModuleName'];
  _prefix?: VovkControllerSchema['prefix'];
  _handlers: VovkControllerSchema['handlers'];
  _handlersMetadata?: Record<string, { staticParams?: Record<string, string>[] }>;
  _onError?: (err: Error, req: VovkRequest) => void | Promise<void>;
  _onSuccess?: (resp: unknown, req: VovkRequest) => void | Promise<void>;
  _onBefore?: (req: VovkRequest) => void | Promise<void>;
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

export interface VovkRequest<TBody = unknown, TQuery = unknown, TParams = unknown> extends Omit<
  NextRequest,
  'json' | 'nextUrl'
> {
  json: () => Promise<TBody>;
  nextUrl: Omit<NextRequest['nextUrl'], 'searchParams'> & {
    searchParams: Omit<
      NextRequest['nextUrl']['searchParams'],
      'get' | 'getAll' | 'entries' | 'forEach' | 'keys' | 'values'
    > & {
      get: <KEY extends keyof TQuery>(key: KEY) => TQuery[KEY] extends readonly (infer ITEM)[] ? ITEM : TQuery[KEY];
      getAll: <KEY extends keyof TQuery>(key: KEY) => TQuery[KEY] extends unknown[] ? TQuery[KEY] : TQuery[KEY][];
      entries: () => IterableIterator<[keyof TQuery, TQuery[keyof TQuery]]>;
      forEach: (
        callbackfn: (
          value: TQuery[keyof TQuery],
          key: keyof TQuery,
          searchParams: NextRequest['nextUrl']['searchParams'] // original searchParams
        ) => void
      ) => void;
      keys: () => IterableIterator<keyof TQuery>;
      values: () => IterableIterator<TQuery[keyof TQuery]>;
    };
  };
  vovk: {
    body: () => Promise<TBody>;
    query: () => TQuery;
    meta: <T = Record<KnownAny, KnownAny>>(meta?: T | null) => T;
    form: <T = TBody>() => Promise<T>;
    params: () => TParams;
  };
}

export type ControllerStaticMethod<
  REQ extends VovkRequest = VovkRequest,
  TParams extends { [key: string]: string } = KnownAny,
> = ((req: REQ, params: TParams) => unknown) & {
  _controller?: VovkController;
};

export type VovkTypedMethod<
  T extends (...args: KnownAny[]) => unknown,
  B = unknown,
  Q = unknown,
  P = unknown,
  O = unknown,
  I = unknown,
  TIsForm extends boolean = false,
> = T & {
  __types: {
    body: B;
    query: Q;
    params: P;
    output: O;
    iteration: I;
    isForm: TIsForm;
  };
  isRPC?: boolean;
};

export type VovkControllerBody<T extends (...args: KnownAny[]) => unknown> = Awaited<
  ReturnType<Parameters<T>[0]['vovk']['body']>
>;

export type VovkControllerQuery<T extends (...args: KnownAny[]) => unknown> = ReturnType<
  Parameters<T>[0]['vovk']['query']
>;

export type VovkControllerParams<T extends (...args: KnownAny[]) => unknown> = Parameters<T>[1] extends object
  ? Parameters<T>[1]
  : ReturnType<Parameters<T>[0]['vovk']['params']>;

export type VovkControllerYieldType<T extends (req: VovkRequest<KnownAny, KnownAny>) => unknown> = T extends (
  ...args: KnownAny[]
) => AsyncGenerator<infer Y, unknown, unknown>
  ? Y
  : T extends (...args: KnownAny[]) => Generator<infer Y, unknown, unknown>
    ? Y
    : T extends (...args: KnownAny[]) => Promise<JSONLinesResponse<infer Y>> | JSONLinesResponse<infer Y>
      ? Y
      : never;

export type VovkOutput<T> = T extends { __types?: { output?: infer O } } ? O : unknown;

export type VovkIteration<T> = T extends {
  __types?: { iteration?: infer I };
}
  ? I
  : unknown;

export type VovkClientBody<T extends (opts: unknown) => unknown> = Parameters<T>[0] extends { body: infer B }
  ? B
  : undefined;

export type VovkClientQuery<T extends (opts: unknown) => unknown> = Parameters<T>[0] extends { query: infer Q }
  ? Q
  : undefined;

export type VovkClientParams<T extends (opts: unknown) => unknown> = Parameters<T>[0] extends { params: infer P }
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

export type VovkValidationType = 'body' | 'query' | 'params' | 'output' | 'iteration' | 'tool-input';

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
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
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

export type VovkJSONSchemaBase = {
  $schema?: 'https://json-schema.org/draft/2020-12/schema' | 'http://json-schema.org/draft-07/schema#';
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'integer';
  format?: string;
  pattern?: string;
  $ref?: string;
  items?: VovkJSONSchemaBase;
  enum?: KnownAny[];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minItems?: number;
  maxItems?: number;
  title?: string;
  description?: string;
  properties?: { [key: string]: VovkJSONSchemaBase };
  required?: string[];
  examples?: KnownAny[];
  // support both $defs and definitions
  $defs?: { [key: string]: VovkJSONSchemaBase };
  definitions?: { [key: string]: VovkJSONSchemaBase };
  additionalProperties?: boolean;
  anyOf?: VovkJSONSchemaBase[];
  oneOf?: VovkJSONSchemaBase[];
  allOf?: VovkJSONSchemaBase[];
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
  'x-tool'?: VovkToolOptions;
};

// -----
/**
 * IDs of the JSON Schema files that can be generated by Vovk.ts
 */
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

export type VovkSamplesConfig = {
  apiRoot?: string;
  headers?: Record<string, string>;
};

type IncludeExcludeSegments =
  | {
      excludeSegments?: never;
      includeSegments?: string[];
    }
  | {
      excludeSegments?: string[];
      includeSegments?: never;
    };

type ClientConfigCommon = {
  enabled?: boolean;
  outDir?: string;
  fromTemplates?: string[];
  prettifyClient?: boolean;
  outputConfig?: VovkOutputConfig<GeneratorConfigImports>;
} & IncludeExcludeSegments;

type ClientConfigComposed = ClientConfigCommon;

type ClientConfigSegmented = ClientConfigCommon;

type BundleConfig = {
  requires?: Record<string, string>;
  prebundleOutDir?: string;
  keepPrebundleDir?: boolean;
  outDir?: string;
  build: (options: { outDir: string; prebundleDir: string; entry: string }) => Promise<void>;
  outputConfig?: VovkOutputConfig<GeneratorConfigImports>;
} & IncludeExcludeSegments;

type GeneratorConfigImports = {
  fetcher?: string | [string, string] | [string];
  validateOnClient?: string | [string, string] | [string] | null;
  createRPC?: string | [string, string] | [string];
};

type SegmentConfigImports = {
  fetcher?: string | [string, string] | [string];
  validateOnClient?: string | [string, string] | [string] | null;
};

export interface VovkOutputConfig<TImports extends GeneratorConfigImports = GeneratorConfigImports> {
  origin?: string | null;
  package?: VovkPackageJson;
  readme?: VovkReadmeConfig;
  samples?: VovkSamplesConfig;
  openAPIObject?: Partial<OpenAPIObject>;
  reExports?: Record<string, string>;
  imports?: TImports;
}

export type ClientTemplateDef = {
  extends?: string;
  templatePath?: string | null;
  composedClient?: Omit<ClientConfigComposed, 'fromTemplates' | 'enabled'>;
  segmentedClient?: Omit<ClientConfigSegmented, 'fromTemplates' | 'enabled'>;
  requires?: Record<string, string>;
  outputConfig?: VovkOutputConfig<GeneratorConfigImports>;
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
  mixinName?: string;
}

export interface VovkOpenAPIMixinNormalized extends Omit<
  VovkOpenAPIMixin,
  'source' | 'getMethodName' | 'getModuleName'
> {
  source: Exclude<
    NonNullable<VovkOpenAPIMixin['source']>,
    { file: string } | { url: string } // "object" only
  >;
  getMethodName: GetOpenAPINameFn;
  getModuleName: GetOpenAPINameFn;
}

export interface VovkSegmentConfig extends VovkOutputConfig<SegmentConfigImports> {
  rootEntry?: string;
  segmentNameOverride?: string;
  openAPIMixin?: VovkOpenAPIMixin;
}

type VovkUserConfig = {
  $schema?: typeof VovkSchemaIdEnum.CONFIG | (string & {});
  exposeConfigKeys?: boolean | (keyof VovkStrictConfig | (string & {}))[];
  schemaOutDir?: string;
  modulesDir?: string;
  rootEntry?: string;
  logLevel?: 'error' | 'trace' | 'debug' | 'info' | 'warn';
  libs?: {
    ajv?: KnownAny; // set by providing the typedoc comment in config
    [key: string]: KnownAny;
  };
  devHttps?: boolean;
  composedClient?: ClientConfigComposed;
  segmentedClient?: ClientConfigSegmented;
  bundle?: BundleConfig;
  clientTemplateDefs?: Record<string, ClientTemplateDef>;
  rootSegmentModulesDirName?: string;
  moduleTemplates?: {
    service?: string;
    controller?: string;
    [key: string]: string | undefined;
  };
  outputConfig?: VovkOutputConfig<GeneratorConfigImports> & {
    segments?: Record<string, VovkSegmentConfig>;
  };
};

export type VovkConfig = VovkUserConfig;

export type VovkStrictConfig = Required<
  Omit<VovkUserConfig, 'exposeConfigKeys' | 'libs' | 'composedClient' | 'segmentedClient' | 'bundle'>
> & {
  exposeConfigKeys: (keyof VovkStrictConfig | string)[];
  bundle: Required<Omit<NonNullable<VovkUserConfig['bundle']>, 'includeSegments' | 'excludeSegments'>> &
    IncludeExcludeSegments;
  libs: Record<string, KnownAny>;
  composedClient: RequireFields<ClientConfigComposed, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  segmentedClient: RequireFields<ClientConfigSegmented, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  outputConfig: VovkOutputConfig<GeneratorConfigImports> & {
    segments?: Record<string, Omit<VovkSegmentConfig, 'openAPIMixin'> & { openAPIMixin?: VovkOpenAPIMixinNormalized }>;
  };
};

// utils
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
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
