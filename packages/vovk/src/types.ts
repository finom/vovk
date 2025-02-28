import type { NextRequest } from 'next/server';
import type { OperationObject } from 'openapi3-ts/oas31';
import type { StreamJSONResponse } from './StreamJSONResponse';
import { VovkStreamAsyncIterable } from './client/types';

export type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type StaticClass = Function; // eslint-disable-line @typescript-eslint/no-unsafe-function-type

export type VovkHandlerSchema = {
  path: string;
  httpMethod: string; // HttpMethod type makes JSON incompatible with VovkHandlerSchema type
  validation?: { query?: KnownAny; body?: KnownAny; params?: KnownAny; output?: KnownAny; iteration?: KnownAny };
  openapi?: OperationObject;
  custom?: Record<string, KnownAny>;
};

export type VovkControllerSchema = {
  controllerName: string;
  originalControllerName: string;
  prefix?: string;
  handlers: Record<string, VovkHandlerSchema>;
};

export type VovkSegmentSchema = {
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
  _controllerName?: VovkControllerSchema['controllerName'];
  _prefix?: VovkControllerSchema['prefix'];
  _handlers: VovkControllerSchema['handlers'];
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
    : T extends (...args: KnownAny[]) => Promise<StreamJSONResponse<infer Y>> | StreamJSONResponse<infer Y>
      ? Y
      : never;

export type VovkControllerOutput<
  T extends ((...args: KnownAny) => KnownAny) & {
    __output?: KnownAny;
  },
> = T['__output'];

export type VovkControllerIteration<
  T extends ((...args: KnownAny) => KnownAny) & {
    __iteration?: KnownAny;
  },
> = T['__iteration'];

export type VovkBody<T extends (...args: KnownAny[]) => unknown> = Parameters<T>[0]['body'];

export type VovkQuery<T extends (...args: KnownAny[]) => unknown> = Parameters<T>[0]['query'];

export type VovkParams<T extends (...args: KnownAny[]) => unknown> = Parameters<T>[0]['params'];

export type VovkYieldType<T extends (...args: KnownAny[]) => unknown> = T extends (
  ...args: KnownAny[]
) => Promise<VovkStreamAsyncIterable<infer Y>>
  ? Y
  : never;

export type VovkReturnType<T extends (...args: KnownAny) => unknown> = Awaited<ReturnType<T>>;

export type StreamAbortMessage = {
  isError: true;
  reason: KnownAny;
};

// CLI types are moved here in order to be able to be able to build VovkFullSchema type that is used by the core

type LogLevelNames = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export type VovkEnv = {
  PORT?: string;
  VOVK_CLIENT_OUT_DIR?: string;
  VOVK_SCHEMA_OUT_DIR?: string;
  VOVK_FETCHER_PATH?: string;
  VOVK_VALIDATE_ON_CLIENT_PATH?: string;
  VOVK_CREATE_RPC_PATH?: string;
  VOVK_MODULES_DIR?: string;
  VOVK_ORIGIN?: string;
  VOVK_ROOT_ENTRY?: string;
  VOVK_API_ENTRY_POINT?: string;
  VOVK_ROOT_SEGMENT_MODULES_DIR_NAME?: string;
  VOVK_LOG_LEVEL?: LogLevelNames;
  VOVK_PRETTIFY_CLIENT?: string;
  VOVK_DEV_HTTPS?: string;
  __VOVK_START_WATCHER_IN_STANDALONE_MODE__?: 'true';
  __VOVK_EXIT__?: 'true' | 'false';
};

export type GenerateFromTemplate = {
  templatePath: string;
  outDir?: string;
  templateName?: string;
  fullSchema?: string | boolean;
};

type GenerateFrom = (string | GenerateFromTemplate)[];

export type VovkConfig = {
  emitConfig?: boolean | (keyof VovkStrictConfig)[];
  clientOutDir?: string;
  schemaOutDir?: string;
  fetcherImport?: string | string[];
  validateOnClientImport?: string | string[] | null;
  createRPCImport?: string | string[];
  modulesDir?: string;
  rootEntry?: string;
  origin?: string;
  rootSegmentModulesDirName?: string;
  logLevel?: LogLevelNames;
  prettifyClient?: boolean;
  devHttps?: boolean;
  generateFrom?: GenerateFrom | ((value: GenerateFrom) => GenerateFrom);
  templates?: {
    service?: string;
    controller?: string;
    [key: string]: string | undefined;
  };
  custom?: Record<string, KnownAny>;
};

export type VovkStrictConfig = Required<
  Omit<
    VovkConfig,
    'emitConfig' | 'validateOnClientImport' | 'fetcherImport' | 'createRPCImport' | 'generateFrom' | 'custom'
  >
> & {
  emitConfig: (keyof VovkStrictConfig)[];
  validateOnClientImport: string[] | null;
  fetcherImport: string[];
  createRPCImport: string[];
  generateFrom: GenerateFrom;
  custom: Record<string, KnownAny>;
};

export type VovkFullSchema = {
  config: Partial<VovkStrictConfig>;
  segments: Record<string, VovkSegmentSchema>;
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
