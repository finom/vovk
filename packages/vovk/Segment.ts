import {
  _HttpMethod as HttpMethod,
  _HttpStatus as HttpStatus,
  type _RouteHandler as RouteHandler,
  type _VovkErrorResponse as VovkErrorResponse,
  type _VovkController as VovkController,
  type _DecoratorOptions as DecoratorOptions,
  type _VovkRequest as VovkRequest,
  type _KnownAny as _KnownAny,
} from './types';
import { _HttpException as HttpException } from './HttpException';
import { _StreamResponse as StreamResponse } from './StreamResponse';
import reqQuery from './utils/reqQuery';
import reqMeta from './utils/reqMeta';

export class _Segment {
  private static getHeadersFromOptions(options?: DecoratorOptions) {
    if (!options) return {};

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const headers = {
      ...(options.cors ? corsHeaders : {}),
      ...(options.headers ?? {}),
    };

    return headers;
  }
  _routes: Record<HttpMethod, Map<VovkController, Record<string, RouteHandler>>> = {
    GET: new Map(),
    POST: new Map(),
    PUT: new Map(),
    PATCH: new Map(),
    DELETE: new Map(),
    HEAD: new Map(),
    OPTIONS: new Map(),
  };

  GET = (req: VovkRequest, data: { params: Record<string, string[]> }) => {
    return this.#callMethod(HttpMethod.GET, req, data.params);
  };
  POST = (req: VovkRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.POST, req, data.params);

  PUT = (req: VovkRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.PUT, req, data.params);

  PATCH = (req: VovkRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.PATCH, req, data.params);

  DELETE = (req: VovkRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.DELETE, req, data.params);

  HEAD = (req: VovkRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.HEAD, req, data.params);

  OPTIONS = (req: VovkRequest, data: { params: Record<string, string[]> }) =>
    this.#callMethod(HttpMethod.OPTIONS, req, data.params);

  #respond = (status: HttpStatus, body: unknown, options?: DecoratorOptions) => {
    return new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ..._Segment.getHeadersFromOptions(options),
      },
    });
  };

  #respondWithError = (statusCode: HttpStatus, message: string, options?: DecoratorOptions) => {
    return this.#respond(
      statusCode,
      {
        statusCode,
        message,
        isError: true,
      } satisfies VovkErrorResponse,
      options
    );
  };

  #callMethod = async (httpMethod: HttpMethod, req: VovkRequest, params: Record<string, string[]>) => {
    const controllers = this._routes[httpMethod];
    const methodParams: Record<string, string> = {};

    if (params[Object.keys(params)[0]]?.[0] === '_vovk-ping_') {
      return this.#respond(200, { message: 'pong' });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    const getHandler = () => {
      if (Object.keys(params).length === 0) {
        return handlers[''];
      }

      const path = params[Object.keys(params)[0]];
      const allMethodKeys = Object.keys(handlers);

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

              if (parameter in methodParams) {
                throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Duplicate parameter "${parameter}"`);
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
        return handlers[methodKey];
      }

      return null;
    };

    const handler = getHandler();

    if (!handler) {
      return this.#respondWithError(HttpStatus.NOT_FOUND, 'Route is not found');
    }

    const { staticMethod, controller } = handler;

    req.vovk = {
      body: async () => await req.json(),
      query: () => reqQuery(req),
      params: <T = Record<string, string>>() => methodParams as T,
      meta: <T = _KnownAny>(metadata?: T | null) => reqMeta<T>(req, metadata),
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
        const streamResponse = new StreamResponse({
          headers: {
            ...StreamResponse.defaultHeaders,
            ..._Segment.getHeadersFromOptions(staticMethod._options),
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

      return this.#respond(200, result ?? null, staticMethod._options);
    } catch (e) {
      const err = e as HttpException;
      try {
        await controller._onError?.(err, req);
      } catch (onErrorError) {
        // eslint-disable-next-line no-console
        console.error(onErrorError);
      }

      if (err.message !== 'NEXT_REDIRECT' && err.message !== 'NEXT_NOT_FOUND') {
        const statusCode = err.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
        return this.#respondWithError(statusCode, err.message, staticMethod._options);
      }

      throw e; // if NEXT_REDIRECT or NEXT_NOT_FOUND, rethrow it
    }
  };
}
