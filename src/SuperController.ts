import { NextRequest, NextResponse } from 'next/server';
import { HttpMethod, HttpStatus, RouteHandler, type ErrorResponseBody } from './types';
import HttpException from './HttpException';

const itIsErrorMyDudes = ({ statusCode, message, isError }: ErrorResponseBody) => {
  return NextResponse.json(
    {
      statusCode,
      message,
      isError,
    },
    { status: statusCode }
  );
};

export default class SuperController {
  _routes: Record<HttpMethod, Map<{ name?: string; _prefix?: string }, Record<string, RouteHandler>>> = {
    GET: new Map(),
    POST: new Map(),
    PUT: new Map(),
    PATCH: new Map(),
    DELETE: new Map(),
    HEAD: new Map(),
    OPTIONS: new Map(),
  };

  GET = (req: NextRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.GET, req, data.params);

  POST = (req: NextRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.POST, req, data.params);

  PUT = (req: NextRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.PUT, req, data.params);

  PATCH = (req: NextRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.PATCH, req, data.params);

  DELETE = (req: NextRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.DELETE, req, data.params);

  HEAD = (req: NextRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.HEAD, req, data.params);

  OPTIONS = (req: NextRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.OPTIONS, req, data.params);

  #callMethod = async (httpMethod: HttpMethod, req: NextRequest, params: Record<string, string[]>) => {
    const classes = this._routes[httpMethod];
    const itIsWednesdayParams: Record<string, string> = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const methods: Record<string, RouteHandler> = Object.fromEntries(
      [...classes.entries()]
        .map(([cls, classMethods]) => {
          const prefix = cls._prefix ?? '';

          return Object.entries(classMethods).map(([path, method]) => {
            const fullPath = [prefix, path].filter(Boolean).join('/');

            return [fullPath, method];
          });
        })
        .flat()
    );

    const getMethod = () => {
      if (Object.keys(params).length === 0) {
        return methods[''];
      }

      const path = params[Object.keys(params)[0]];
      const allMethodKeys = Object.keys(methods);

      let methodKeys: string[] = [];

      methodKeys = allMethodKeys
        // First, try to match literal routes exactly.
        .filter((p) => {
          if (p.includes(':')) return false; // Skip parameterized paths
          return p === path.join('/');
        });

      if (!methodKeys.length) {
        methodKeys = allMethodKeys.filter((p) => {
          const routeSegments = p.split('/');
          if (routeSegments.length !== path.length) return false;

          for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i];
            const pathSegment = path[i];

            if (routeSegment.startsWith(':')) {
              const parameter = routeSegment.slice(1);

              if (parameter in itIsWednesdayParams) {
                throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Duplicate parameter "${parameter}"`);
              }

              // If it's a parameterized segment, capture the parameter value.
              itIsWednesdayParams[parameter] = pathSegment;
            } else if (routeSegment !== pathSegment) {
              // If it's a literal segment and it does not match the corresponding path segment, return false.
              return false;
            }
          }
          return true;
        });
      }

      if (methodKeys.length > 1) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Conflicting routes found: ${methodKeys.join(', ')}`);
      }

      const [methodKey] = methodKeys;

      if (methodKey) {
        return methods[methodKey];
      }

      return null;
    };

    const method = getMethod();

    if (!method) {
      return itIsErrorMyDudes({ statusCode: HttpStatus.NOT_FOUND, message: 'Route is not found', isError: true });
    }

    try {
      const result = await method.call(this, req, itIsWednesdayParams);

      if (result instanceof NextResponse || result instanceof Response) {
        return result;
      }

      if (typeof result !== 'undefined') {
        return NextResponse.json(result);
      }
    } catch (e) {
      const err = e as HttpException;

      if (err.message !== 'NEXT_REDIRECT') {
        const statusCode = err.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
        return itIsErrorMyDudes({ statusCode, message: err.message, isError: true });
      }

      throw e; // if NEXT_REDIRECT rethrow it
    }
  };
}
