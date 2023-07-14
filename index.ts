import { NextRequest, NextResponse } from 'next/server';

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
type HttpMethod = ArrayElement<typeof httpMethods>;

export enum HttpStatus {
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

const getPath = (params: Record<string, string[]>) => {
  const keys = Object.keys(params);
  const path = typeof keys[0] === 'string' ? params[keys[0]].join('/') : '';

  return path.endsWith('/') ? path.slice(0, -1) : path;
};

export class HttpException extends Error {
  status: HttpStatus;

  message: string;

  constructor(status: HttpStatus, message: unknown) {
    super(String(message));
    this.status = status;
    this.message = String(message);

    throw this;
  }
}

class CombinedRoute {
  _routes: Record<
    HttpMethod,
    Record<string, (req: NextRequest, params: Record<string, string[]>) => NextResponse | Promise<NextResponse>>
  > = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {},
  };

  GET = (req: NextRequest, data: { params: Record<string, string[]> }) => {
    return this.#callMethod('GET', req, data.params);
  };

  POST = (req: NextRequest, data: { params: Record<string, string[]> }) => {
    return this.#callMethod('POST', req, data.params);
  };

  PUT = (req: NextRequest, data: { params: Record<string, string[]> }) => {
    return this.#callMethod('PUT', req, data.params);
  };

  DELETE = (req: NextRequest, data: { params: Record<string, string[]> }) => {
    return this.#callMethod('DELETE', req, data.params);
  };

  #callMethod = async (httpMethod: HttpMethod, req: NextRequest, params: Record<string, string[]>) => {
    const path = getPath(params);
    if (!path) {
      return new NextResponse('Path is not given', { status: 400 });
    }

    const method = this._routes[httpMethod][path];

    if (!method) {
      return new NextResponse('Route is not found', { status: 404 });
    }

    try {
      // console.log(JSON.stringify(method.call(this, req, params)), method.call(this, req, params))
      return NextResponse.json(await method.call(this, req, params));
    } catch (e) {
      const err = e as HttpException;

      if (err.status && err.message) {
        return new NextResponse(
          JSON.stringify({
            status: err.status,
            message: err.message,
            error: true,
          }),
          { status: err.status ?? 400 }
        );
      }
    }
  };
}

export function createRouter() {
  const r = new CombinedRoute();

  const getDecorator = (httpMethod: HttpMethod) => {
    return (givenPath = '') => {
      const path = givenPath.startsWith('/') ? givenPath.slice(1) : givenPath;
      // eslint-disable-next-line @typescript-eslint/ban-types
      return (target: KnownAny, _propertyKey: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        r._routes[httpMethod][path] = target[_propertyKey] as (req: NextRequest) => NextResponse<unknown>;
      };
    };
  };

  return {
    get: getDecorator('GET'),
    post: getDecorator('POST'),
    put: getDecorator('PUT'),
    del: getDecorator('DELETE'),
    GET: r.GET,
    POST: r.POST,
    PUT: r.PUT,
    DELETE: r.DELETE,
  };
}
