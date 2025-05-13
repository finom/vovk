import type { NextRequest } from 'next/server';
import type { OperationObject } from 'openapi3-ts/oas31';
import type { JSONLinesResponse } from './JSONLinesResponse';
import { VovkStreamAsyncIterable } from './client/types';
import type { PackageJson } from 'type-fest';

export type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type StaticClass = Function; // eslint-disable-line @typescript-eslint/no-unsafe-function-type

export type VovkHandlerSchema = {
  path: string;
  httpMethod: string; // HttpMethod type makes JSON incompatible with VovkHandlerSchema type
  validation?: { query?: KnownAny; body?: KnownAny; params?: KnownAny; output?: KnownAny; iteration?: KnownAny };
  openapi?: OperationObject;
  misc?: Record<string, KnownAny>;
};

export type VovkControllerSchema = {
  rpcModuleName: string;
  originalControllerName: string;
  prefix?: string;
  handlers: Record<string, VovkHandlerSchema>;
};

export type VovkSegmentSchema = {
  $schema: string;
  emitSchema: boolean;
  segmentName: string;
  controllers: Record<string, VovkControllerSchema>;
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
  _activated?: true;
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
  BODY extends KnownAny = null,
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
      // TODO (?) append, delete, set
    };
  };
  vovk: {
    body: () => Promise<BODY>;
    query: () => QUERY;
    meta: <T = Record<KnownAny, KnownAny>>(meta?: T | null) => T;
    form: <T = KnownAny>() => Promise<T>;
    params: () => PARAMS;
  };
}

export type ControllerStaticMethod<
  REQ extends VovkRequest<KnownAny, KnownAny> = VovkRequest<undefined, Record<string, KnownAny>>,
  PARAMS extends { [key: string]: string } = KnownAny,
> = ((req: REQ, params: PARAMS) => unknown) & {
  _controller?: VovkController;
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

export type VovkOutput<
  T extends ((...args: KnownAny) => KnownAny) & {
    __output?: KnownAny;
  },
> = T['__output'];

export type VovkIteration<
  T extends ((...args: KnownAny) => KnownAny) & {
    __iteration?: KnownAny;
  },
> = T['__iteration'];

export type VovkClientBody<T extends (...args: KnownAny[]) => unknown> = Parameters<T>[0]['body'];

export type VovkClientQuery<T extends (...args: KnownAny[]) => unknown> = Parameters<T>[0]['query'];

export type VovkClientParams<T extends (...args: KnownAny[]) => unknown> = Parameters<T>[0]['params'];

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

export type VovkFullSchema = {
  $schema: string;
  config: Partial<VovkStrictConfig>;
  segments: Record<string, VovkSegmentSchema>;
};

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
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
}

type ClientConfigCommon = {
  enabled?: boolean;
  outDir?: string;
  fromTemplates?: string[];
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

type ClientConfigFull = ClientConfigCommon & {
  package?: PackageJson;
};
type ClientConfigSegmented = ClientConfigCommon & {
  packages?: Record<string, PackageJson>;
};

export type ClientTemplateDef = {
  extends?: string;
  templatePath?: string | null;
  origin?: string | null;
  fullClient?: Omit<ClientConfigFull, 'fromTemplates' | 'enabled'>;
  segmentedClient?: Omit<ClientConfigSegmented, 'fromTemplates' | 'enabled'>;
  segmentConfig?: false | Record<string, { origin?: string; rootEntry?: boolean }>;
  requires?: Record<string, string>;
};

export type VovkConfig = {
  $schema?: string;
  emitConfig?: boolean | (keyof VovkStrictConfig)[];
  schemaOutDir?: string;
  fullClient?: ClientConfigFull;
  segmentedClient?: ClientConfigSegmented;
  bundle?: {
    outDir?: string;
    noReadme?: boolean;
    noPackage?: boolean;
    tsClientOutDir?: string;
    dontDeleteTsClientOutDirAfter?: boolean;
    sourcemap?: boolean;
  };
  imports?: {
    fetcher?: string | [string, string] | [string];
    validateOnClient?: string | [string, string] | [string];
    createRPC?: string | [string, string] | [string];
  };
  modulesDir?: string;
  rootEntry?: string;
  origin?: string;
  rootSegmentModulesDirName?: string;
  logLevel?: 'error' | 'trace' | 'debug' | 'info' | 'warn';
  prettifyClient?: boolean;
  devHttps?: boolean;
  clientTemplateDefs?: Record<string, ClientTemplateDef>;
  moduleTemplates?: {
    service?: string;
    controller?: string;
    [key: string]: string | undefined;
  };
  libs?: Record<string, KnownAny>;
  /** @todo this is an experimental feature */
  segmentConfig?: false | Record<string, { origin?: string; rootEntry?: boolean }>;
};

export type VovkStrictConfig = Required<
  Omit<VovkConfig, 'emitConfig' | 'libs' | 'imports' | 'fullClient' | 'segmentedClient' | 'bundle'>
> & {
  emitConfig: (keyof VovkStrictConfig)[];
  bundle: Exclude<Required<VovkConfig['bundle']>, undefined>;
  imports: {
    fetcher: [string, string] | [string];
    validateOnClient: [string, string] | [string] | null;
    createRPC: [string, string] | [string];
  };
  libs: Record<string, KnownAny>;
  fullClient: RequireFields<ClientConfigFull, 'enabled' | 'fromTemplates' | 'outDir'>;
  segmentedClient: RequireFields<ClientConfigSegmented, 'enabled' | 'fromTemplates' | 'outDir'>;
};

// utils

type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
