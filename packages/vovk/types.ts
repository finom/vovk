import type { NextRequest } from 'next/server';
import type { _StreamResponse as StreamResponse } from './StreamResponse';
import { _StreamAsyncIterator as StreamAsyncIterator } from './client/types';

export type _KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type _VovkMetadata = Record<string, _VovkControllerMetadata> & { workers?: Record<string, _VovkWorkerMetadata> };

export type _VovkErrorResponse = {
  statusCode: _HttpStatus;
  message: string;
  isError: true;
};

export type _HandlerMetadata = {
  path: string;
  httpMethod: _HttpMethod;
  clientValidators?: { query?: _KnownAny; body?: _KnownAny };
  customMetadata?: Record<string, _KnownAny>;
};

export type _VovkControllerMetadata = {
  _controllerName: string;
  _prefix?: string;
  _handlers: Record<string, _HandlerMetadata>;
};

export type _VovkWorkerMetadata = {
  _workerName: string;
  _handlers: Record<
    string,
    {
      isGenerator?: true;
    }
  >;
};

export type _VovkControllerInternal = _VovkControllerMetadata & {
  _activated?: true;
  _onError?: (err: Error, req: _VovkRequest) => void | Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type _VovkController = Function &
  _VovkControllerInternal & {
    [key: string]: unknown;
  };

// eslint-disable-next-line @typescript-eslint/ban-types
export type _VovkWorker = Function &
  _VovkWorkerMetadata & {
    [key: string]: unknown;
  };

export type _DecoratorOptions = {
  cors?: boolean;
  headers?: Record<string, string>;
};

export type _RouteHandler = ((
  req: _VovkRequest,
  params: Record<string, string>
) => Response | Promise<Response> | Iterable<unknown> | AsyncIterable<unknown>) & {
  _options?: _DecoratorOptions;
};

export interface _VovkRequest<BODY = undefined, QUERY extends object | undefined = undefined>
  extends Omit<NextRequest, 'json' | 'nextUrl'> {
  json: () => Promise<BODY>;
  nextUrl: Omit<NextRequest['nextUrl'], 'searchParams'> & {
    searchParams: Omit<
      NextRequest['nextUrl']['searchParams'],
      'get' | 'getAll' | 'entries' | 'forEach' | 'keys' | 'values'
    > & {
      get: <KEY extends keyof QUERY>(key: KEY) => QUERY[KEY] extends readonly (infer ITEM)[] ? ITEM : QUERY[KEY];
      getAll: <KEY extends keyof QUERY>(key: KEY) => QUERY[KEY] extends _KnownAny[] ? QUERY[KEY] : QUERY[KEY][];
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
      readonly __queryType: QUERY;
    };
  };
  vovk: {
    body: () => Promise<BODY>;
    query: () => QUERY;
    meta: <T = Record<_KnownAny, _KnownAny>>(metadata?: T | null) => T;
  };
}

export type _ControllerStaticMethod<
  REQ extends _VovkRequest<undefined, _KnownAny> = _VovkRequest<undefined, Record<string, string | string[]>>,
  PARAMS extends { [key: string]: string } = _KnownAny,
> = ((req: REQ, params: PARAMS) => unknown) & {
  _controller?: _VovkController;
};

export type _VovkControllerBody<
  T extends _ControllerStaticMethod<REQ, PARAMS>,
  REQ extends _VovkRequest<undefined, _KnownAny> = Parameters<T>[0],
  PARAMS extends { [key: string]: string } = _KnownAny,
> = Awaited<ReturnType<Parameters<T>[0]['json']>>;

export type _VovkControllerQuery<
  T extends _ControllerStaticMethod<REQ, PARAMS>,
  REQ extends _VovkRequest<undefined, _KnownAny> = Parameters<T>[0],
  PARAMS extends { [key: string]: string } = _KnownAny,
> = Parameters<T>[0]['nextUrl']['searchParams']['__queryType'];

export type _VovkControllerParams<
  T extends _ControllerStaticMethod<REQ, PARAMS>,
  REQ extends _VovkRequest<undefined, _KnownAny> = Parameters<T>[0],
  PARAMS extends { [key: string]: string } = _KnownAny,
> = Parameters<T>[1];

export type _VovkBody<
  T extends (options: OPTIONS) => _KnownAny,
  OPTIONS extends { body: B; [key: string]: _KnownAny } = Parameters<T>[0],
  B = _KnownAny,
> = Parameters<T>[0]['body'];

export type _VovkQuery<
  T extends (options: OPTIONS) => _KnownAny,
  OPTIONS extends { query: Q; [key: string]: _KnownAny } = Parameters<T>[0],
  Q = _KnownAny,
> = Parameters<T>[0]['query'];

export type _VovkParams<
  T extends (options: OPTIONS) => _KnownAny,
  OPTIONS extends { params: P; [key: string]: _KnownAny } = Parameters<T>[0],
  P = _KnownAny,
> = Parameters<T>[0]['params'];

export type _VovkControllerReturnType<
  T extends _ControllerStaticMethod<REQ, PARAMS>,
  REQ extends _VovkRequest<undefined, _KnownAny> = Parameters<T>[0],
  PARAMS extends { [key: string]: string } = _KnownAny,
> = Awaited<ReturnType<T>>;

export type _VovkControlerYieldType<
  T extends _ControllerStaticMethod<REQ, PARAMS>,
  REQ extends _VovkRequest<undefined, _KnownAny> = Parameters<T>[0],
  PARAMS extends { [key: string]: string } = _KnownAny,
> = T extends (...args: _KnownAny[]) => AsyncGenerator<infer Y, _KnownAny, _KnownAny>
  ? Y
  : T extends (...args: _KnownAny[]) => Generator<infer Y, _KnownAny, _KnownAny>
    ? Y
    : T extends (...args: _KnownAny[]) => Promise<StreamResponse<infer Y>> | StreamResponse<infer Y>
      ? Y
      : never;

export type _VovkReturnType<T extends (...args: _KnownAny) => unknown> = Awaited<ReturnType<T>>;

export type _VovkYieldType<T extends (...args: _KnownAny[]) => unknown> = T extends (
  ...args: _KnownAny[]
) => Promise<StreamAsyncIterator<infer Y>>
  ? Y
  : never;

export type _StreamAbortMessage = {
  isError: true;
  reason: _KnownAny;
};

export enum _HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export enum _HttpStatus {
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
