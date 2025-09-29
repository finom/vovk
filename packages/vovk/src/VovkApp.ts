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
import { JSONLinesResponse } from './JSONLinesResponse';
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
    let methodParams: Record<string, string> = {};

    if (Object.keys(params).length === 0) {
      return { handler: handlers[''], methodParams };
    }

    const pathStr = path.join('/');

    let methodKey = handlers[pathStr] ? pathStr : null;

    if (!methodKey) {
      const methodKeys = Object.keys(handlers).filter((p) => {
        const routeSegments = p.split('/');
        if (routeSegments.length !== path.length) return false;
        const params: Record<string, string> = {};

        for (let i = 0; i < routeSegments.length; i++) {
          const routeSegment = routeSegments[i];
          const pathSegment = path[i];

          if (routeSegment.includes('{')) {
            const regexPattern = routeSegment
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
              .replace(/\\{(\w+)\\}/g, '(?<$1>[^/]+)'); // Replace {var} with named groups

            const values = pathSegment.match(new RegExp(`^${regexPattern}$`))?.groups ?? {};

            for (const parameter in values) {
              if (!Object.prototype.hasOwnProperty.call(values, parameter)) continue;
              if (parameter in params) {
                throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Duplicate parameter "${parameter}" at ${p}`);
              }

              // If it's a parameterized segment, capture the parameter value.
              params[parameter] = values[parameter];
            }
          } else if (routeSegment !== pathSegment) {
            // If it's a literal segment and it does not match the corresponding path segment, return false.
            return false;
          }
        }

        methodParams = params;

        return true;
      });

      if (methodKeys.length > 1) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Conflicting routes found: ${methodKeys.join(', ')}`);
      }

      [methodKey] = methodKeys;
    }

    if (methodKey) {
      return { handler: handlers[methodKey], methodParams };
    }

    return { handler: null, methodParams };
  };

  #allHandlers: Partial<
    Record<HttpMethod, Record<string, { staticMethod: RouteHandler; controller: VovkController }>>
  > = {};

  #collectHandlers = (httpMethod: HttpMethod) => {
    const controllers = this.routes[httpMethod];

    const handlers: Record<string, { staticMethod: RouteHandler; controller: VovkController }> = {};
    controllers.forEach((staticMethods, controller) => {
      const prefix = controller._prefix ?? '';

      Object.entries(staticMethods ?? {}).forEach(([path, staticMethod]) => {
        const fullPath = [prefix, path].filter(Boolean).join('/');
        handlers[fullPath] = { staticMethod, controller };
      });
    });

    return handlers;
  };

  #callMethod = async (httpMethod: HttpMethod, nextReq: NextRequest, params: Record<string, string[]>) => {
    const req = nextReq as unknown as VovkRequest<KnownAny, KnownAny, KnownAny>;
    const path = params[Object.keys(params)[0]];
    const handlers = this.#allHandlers[httpMethod] ?? this.#collectHandlers(httpMethod);
    this.#allHandlers[httpMethod] = handlers;
    let headerList: typeof nextReq.headers | null;
    try {
      headerList = nextReq.headers;
    } catch {
      // this is static rendering environment, headers are not available
      headerList = null;
    }
    const xMeta = headerList?.get('x-meta');
    const xMetaHeader: Record<string, unknown> = xMeta && JSON.parse(xMeta);

    if (xMetaHeader) reqMeta(req, { xMetaHeader });

    const { handler, methodParams } = this.#getHandler({ handlers, path, params });

    if (!handler) {
      return this.#respondWithError(
        HttpStatus.NOT_FOUND,
        `${Object.keys(handlers)} - Route ${path.join('/')} is not found`
      );
    }

    const { staticMethod, controller } = handler;

    req.vovk = {
      body: () => req.json(),
      query: () => reqQuery(req as VovkRequest<unknown, KnownAny>),
      meta: <T = KnownAny>(meta?: T | null) => reqMeta<T>(req, meta),
      form: () => reqForm(req),
      params: () => methodParams,
    };

    try {
      await staticMethod._options?.before?.call(controller, req);
      const result = await staticMethod.call(controller, req, methodParams);

      if (result instanceof Response) {
        return result;
      }

      const isIterator =
        typeof result === 'object' &&
        !!result &&
        !(result instanceof Array) &&
        ((Reflect.has(result, Symbol.iterator) &&
          typeof (result as Iterable<unknown>)[Symbol.iterator] === 'function') ||
          (Reflect.has(result, Symbol.asyncIterator) &&
            typeof (result as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function'));

      if (isIterator) {
        const streamResponse = new JSONLinesResponse(req, {
          headers: {
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
