import type { NextRequest } from 'next/server';

export type _KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type _VovkErrorResponse = {
  statusCode: _HttpStatus;
  message: string;
  isError: true;
};

export type _HandlerMetadata = {
  path: string;
  httpMethod: _HttpMethod;
  clientValidators?: { query?: _KnownAny; body?: _KnownAny };
};

export type _VovkControllerMetadata = {
  controllerName: string;
  _prefix?: string;
  _handlers: Record<string, _HandlerMetadata>;
};

export type _HandlerMetadataJson = {
  path: string;
  httpMethod: string;
  clientValidators?: { query?: _KnownAny; body?: _KnownAny };
};

export type _VovkControllerMetadataJson = {
  controllerName: string;
  _prefix?: string;
  _handlers: Record<string, _HandlerMetadataJson>;
};

export type _VovkWorkerMetadata = {
  workerName: string;
  _handlers: Record<
    string,
    {
      isGenerator?: true;
    }
  >;
};

export type _VovkControllerInternal = _VovkControllerMetadata & {
  _activated?: true;
  _onError?: (err: Error) => void;
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

export type _RouteHandler = (
  req: NextRequest,
  params: Record<string, string>
) => Response | Promise<Response> | Iterable<unknown> | AsyncIterable<unknown>;

export interface _VovkRequest<BODY = undefined, QUERY extends Record<string, string> | undefined = undefined>
  extends Omit<NextRequest, 'json' | 'nextUrl'> {
  json: () => Promise<BODY>;
  nextUrl: Omit<NextRequest['nextUrl'], 'searchParams'> & {
    searchParams: Omit<NextRequest['nextUrl']['searchParams'], 'get'> & {
      get: <KEY extends keyof QUERY>(key: KEY) => QUERY[KEY];
      readonly __queryType: QUERY;
    };
  };
}

export type _ControllerStaticMethod<
  REQ extends _VovkRequest<undefined, _KnownAny> = _VovkRequest<undefined, Record<string, string>>,
  PARAMS extends { [key: string]: string } = _KnownAny,
> = ((req: REQ, params: PARAMS) => unknown) & {
  _controller?: _VovkController;
};

export type _VovkBody<
  T extends _ControllerStaticMethod<REQ, PARAMS>,
  REQ extends _VovkRequest<undefined, _KnownAny> = Parameters<T>[0],
  PARAMS extends { [key: string]: string } = _KnownAny,
> = Awaited<ReturnType<Parameters<T>[0]['json']>>;

export type _VovkQuery<
  T extends _ControllerStaticMethod<REQ, PARAMS>,
  REQ extends _VovkRequest<undefined, _KnownAny> = Parameters<T>[0],
  PARAMS extends { [key: string]: string } = _KnownAny,
> = Parameters<T>[0]['nextUrl']['searchParams']['__queryType'];

export type _VovkParams<
  T extends _ControllerStaticMethod<REQ, PARAMS>,
  REQ extends _VovkRequest<undefined, _KnownAny> = Parameters<T>[0],
  PARAMS extends { [key: string]: string } = _KnownAny,
> = Parameters<T>[1];

// TODO Implement for streams
export type _VovkReturnType<
  T extends _ControllerStaticMethod<REQ, PARAMS>,
  REQ extends _VovkRequest<undefined, _KnownAny> = Parameters<T>[0],
  PARAMS extends { [key: string]: string } = _KnownAny,
> = Awaited<ReturnType<T>>;

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
