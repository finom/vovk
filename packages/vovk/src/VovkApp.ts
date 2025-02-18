import type { NextRequest } from 'next/server';
import {
  HttpMethod,
  HttpStatus,
  type RouteHandler,
  type VovkErrorResponse,
  type VovkController,
  type DecoratorOptions,
  type KnownAny,
  type VovkRequest,
} from './types';
import { HttpException } from './HttpException';
import { StreamJSONResponse } from './StreamJSONResponse';
import reqQuery from './utils/reqQuery';
import reqMeta from './utils/reqMeta';
import reqForm from './utils/reqForm';

export class VovkApp {
  private static getHeadersFromOptions(options?: DecoratorOptions) {
    if (!options) return {};

    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
      'access-control-allow-headers': 'content-type, authorization',
    };

    const headers = {
      ...(options.cors ? corsHeaders : {}),
      ...(options.headers ?? {}),
    };

    return headers;
  }

  routes: Record<HttpMethod, Map<VovkController, Record<string, RouteHandler>>> = {
    GET: new Map(),
    POST: new Map(),
    PUT: new Map(),
    PATCH: new Map(),
    DELETE: new Map(),
    HEAD: new Map(),
    OPTIONS: new Map(),
  };

  GET = async (req: NextRequest, data: { params: Promise<Record<string, string[]>> }) =>
    this.#callMethod(HttpMethod.GET, req, await data.params);

  POST = async (req: NextRequest, data: { params: Promise<Record<string, string[]>> }) =>
    this.#callMethod(HttpMethod.POST, req, await data.params);

  PUT = async (req: NextRequest, data: { params: Promise<Record<string, string[]>> }) =>
    this.#callMethod(HttpMethod.PUT, req, await data.params);

  PATCH = async (req: NextRequest, data: { params: Promise<Record<string, string[]>> }) =>
    this.#callMethod(HttpMethod.PATCH, req, await data.params);

  DELETE = async (req: NextRequest, data: { params: Promise<Record<string, string[]>> }) =>
    this.#callMethod(HttpMethod.DELETE, req, await data.params);

  HEAD = async (req: NextRequest, data: { params: Promise<Record<string, string[]>> }) =>
    this.#callMethod(HttpMethod.HEAD, req, await data.params);

  OPTIONS = async (req: NextRequest, data: { params: Promise<Record<string, string[]>> }) =>
    this.#callMethod(HttpMethod.OPTIONS, req, await data.params);

  respond = (status: HttpStatus, body: unknown, options?: DecoratorOptions) => {
    return new Response(JSON.stringify(body), {
      status,
      headers: {
        'content-type': 'application/json',
        ...VovkApp.getHeadersFromOptions(options),
      },
    });
  };

  #respondWithError = (statusCode: HttpStatus, message: string, options?: DecoratorOptions, cause?: unknown) => {
    return this.respond(
      statusCode,
      {
        cause,
        statusCode,
        message,
        isError: true,
      } satisfies VovkErrorResponse,
      options
    );
  };

  #getHandler = ({
    handlers,
    path,
    params,
  }: {
    handlers: Record<string, { staticMethod: RouteHandler; controller: VovkController }>;
    path: string[];
    params: Record<string, string[]>;
  }) => {
    const methodParams: Record<string, string> = {};

    if (Object.keys(params).length === 0) {
      return { handler: handlers[''], methodParams };
    }

    const allMethodKeys = Object.keys(handlers);

    let methodKeys: string[] = [];
    const pathStr = path.join('/');

    methodKeys = allMethodKeys
      // First, try to match literal routes exactly.
      .filter((p) => {
        if (p.includes(':')) return false; // Skip parameterized paths
        return p === pathStr;
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

            if (parameter in methodParams) {
              throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Duplicate parameter "${parameter}" at ${p}`);
            }

            // If it's a parameterized segment, capture the parameter value.
            methodParams[parameter] = pathSegment;
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
      return { handler: handlers[methodKey], methodParams };
    }

    return { handler: null, methodParams };
  };

  #callMethod = async (httpMethod: HttpMethod, nextReq: NextRequest, params: Record<string, string[]>) => {
    const req = nextReq as unknown as VovkRequest;
    const controllers = this.routes[httpMethod];
    const path = params[Object.keys(params)[0]];
    const handlers: Record<string, { staticMethod: RouteHandler; controller: VovkController }> = {};
    controllers.forEach((staticMethods, controller) => {
      const prefix = controller._prefix ?? '';

      if (!controller._activated) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Controller "${controller.name}" found but not activated`
        );
      }

      Object.entries(staticMethods).forEach(([path, staticMethod]) => {
        const fullPath = [prefix, path].filter(Boolean).join('/');
        handlers[fullPath] = { staticMethod, controller };
      });
    });

    const { handler, methodParams } = this.#getHandler({ handlers, path, params });

    if (!handler) {
      return this.#respondWithError(HttpStatus.NOT_FOUND, `Route ${path.join('/')} is not found`);
    }

    const { staticMethod, controller } = handler;

    req.vovk = {
      body: () => req.json(),
      query: () => reqQuery(req as VovkRequest),
      meta: <T = KnownAny>(meta?: T | null) => reqMeta<T>(req, meta),
      form: <T = KnownAny>() => reqForm<T>(req),
      params: <T = KnownAny>() => methodParams as T,
    };

    try {
      const result = await staticMethod.call(controller, req, methodParams);

      const isIterator =
        typeof result === 'object' &&
        !!result &&
        ((Reflect.has(result, Symbol.iterator) &&
          typeof (result as Iterable<unknown>)[Symbol.iterator] === 'function') ||
          (Reflect.has(result, Symbol.asyncIterator) &&
            typeof (result as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function'));

      if (isIterator && !(result instanceof Array)) {
        const streamResponse = new StreamJSONResponse({
          headers: {
            ...StreamJSONResponse.defaultHeaders,
            ...VovkApp.getHeadersFromOptions(staticMethod._options),
          },
        });

        void (async () => {
          try {
            for await (const chunk of result as AsyncGenerator<unknown>) {
              streamResponse.send(chunk);
            }
          } catch (e) {
            return streamResponse.throw(e);
          }

          return streamResponse.close();
        })();

        return streamResponse;
      }

      if (result instanceof Response) {
        return result;
      }

      return this.respond(200, result ?? null, staticMethod._options);
    } catch (e) {
      const err = e as HttpException;
      try {
        await controller._onError?.(err, req);
      } catch (onErrorError) {
        // eslint-disable-next-line no-console
        console.error(onErrorError);
      }

      if (err.message !== 'NEXT_REDIRECT' && err.message !== 'NEXT_NOT_FOUND') {
        const statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        return this.#respondWithError(statusCode, err.message, staticMethod._options, err.cause);
      }

      throw e; // if NEXT_REDIRECT or NEXT_NOT_FOUND, rethrow it
    }
  };
}
