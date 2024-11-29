import type { NextRequest } from 'next/server';
import type { _StreamJSONResponse as StreamJSONResponse } from './StreamJSONResponse';
import { _StreamAsyncIterator as StreamAsyncIterator } from './client/types';

export type _KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type _StaticClass = Function; // eslint-disable-line @typescript-eslint/no-unsafe-function-type

export type _VovkSchema = {
  emitSchema: boolean;
  segmentName: string;
  workers: Record<string, _VovkWorkerSchema>;
  controllers: Record<string, _VovkControllerSchema>;
};

export type _VovkErrorResponse = {
  cause?: unknown;
  statusCode: _HttpStatus;
  message: string;
  isError: true;
};

export type _HandlerSchema = {
  path: string;
  httpMethod: _HttpMethod;
  validation?: { query?: _KnownAny; body?: _KnownAny };
  custom?: Record<string, _KnownAny>;
};

export type _VovkControllerSchema = {
  controllerName: string;
  originalControllerName: string;
  prefix?: string;
  handlers: Record<string, _HandlerSchema>;
};

export type _VovkWorkerSchema = {
  workerName: string;
  originalWorkerName: string;
  handlers: Record<
    string,
    {
      isGenerator?: true;
    }
  >;
};

export type _VovkControllerInternal = {
  _controllerName?: _VovkControllerSchema['controllerName'];
  _prefix?: _VovkControllerSchema['prefix'];
  _handlers: _VovkControllerSchema['handlers'];
  _activated?: true;
  _onError?: (err: Error, req: _VovkRequest) => void | Promise<void>;
};

export type _VovkController = _StaticClass &
  _VovkControllerInternal & {
    [key: string]: unknown;
  };

export type _VovkWorker = _StaticClass & {
  _handlers: _VovkWorkerSchema['handlers'];
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
    };
  };
  vovk: {
    body: () => Promise<BODY>;
    query: () => QUERY;
    meta: <T = Record<_KnownAny, _KnownAny>>(meta?: T | null) => T;
  };
}

export type _ControllerStaticMethod<
  REQ extends _VovkRequest<_KnownAny, _KnownAny> = _VovkRequest<undefined, Record<string, string | string[]>>,
  PARAMS extends { [key: string]: string } = _KnownAny,
> = ((req: REQ, params: PARAMS) => unknown) & {
  _controller?: _VovkController;
};

export type _VovkControllerBody<T extends (...args: _KnownAny) => _KnownAny> = Awaited<
  ReturnType<Parameters<T>[0]['vovk']['body']>
>;

export type _VovkControllerQuery<T extends (...args: _KnownAny) => _KnownAny> = ReturnType<
  Parameters<T>[0]['vovk']['query']
>;

export type _VovkControllerParams<T extends (...args: _KnownAny) => _KnownAny> = Parameters<T>[1];

export type _VovkControllerYieldType<T extends (req: _VovkRequest<_KnownAny, _KnownAny>) => _KnownAny> = T extends (
  ...args: _KnownAny[]
) => AsyncGenerator<infer Y, _KnownAny, _KnownAny>
  ? Y
  : T extends (...args: _KnownAny[]) => Generator<infer Y, _KnownAny, _KnownAny>
    ? Y
    : T extends (...args: _KnownAny[]) => Promise<StreamJSONResponse<infer Y>> | StreamJSONResponse<infer Y>
      ? Y
      : never;

export type _VovkBody<T extends (...args: _KnownAny[]) => unknown> = Parameters<T>[0]['body'];

export type _VovkQuery<T extends (...args: _KnownAny[]) => unknown> = Parameters<T>[0]['query'];

export type _VovkParams<T extends (...args: _KnownAny[]) => unknown> = Parameters<T>[0]['params'];

export type _VovkYieldType<T extends (...args: _KnownAny[]) => unknown> = T extends (
  ...args: _KnownAny[]
) => Promise<StreamAsyncIterator<infer Y>>
  ? Y
  : never;

export type _VovkReturnType<T extends (...args: _KnownAny) => unknown> = Awaited<ReturnType<T>>;

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
