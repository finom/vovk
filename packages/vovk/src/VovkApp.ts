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

  #routeRegexCache = new Map<string, RegExp>();
  #routeSegmentsCache = new Map<string, string[]>();
  #routeParamPositionsCache = new Map<string, { index: number; paramName: string }[]>();
  #routeMatchCache = new Map<string, { route: string; params: Record<string, string> }>();

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

    // Fast path: Check if this exact path has been matched before
    const cachedMatch = this.#routeMatchCache.get(pathStr);
    if (cachedMatch) {
      return {
        handler: handlers[cachedMatch.route],
        methodParams: cachedMatch.params,
      };
    }

    // Check for direct static route match
    let methodKey = handlers[pathStr] ? pathStr : null;

    if (!methodKey) {
      const methodKeys: string[] = [];
      const pathLength = path.length;

      // First pass: group routes by length for quick filtering
      const routesByLength = new Map<number, string[]>();

      for (const p of Object.keys(handlers)) {
        let routeSegments = this.#routeSegmentsCache.get(p);
        if (!routeSegments) {
          routeSegments = p.split('/');
          this.#routeSegmentsCache.set(p, routeSegments);

          // Pre-compute parameter positions for routes with parameters
          if (p.includes('{')) {
            const paramPositions: { index: number; paramName: string }[] = [];
            for (let i = 0; i < routeSegments.length; i++) {
              const segment = routeSegments[i];
              if (segment.includes('{')) {
                const paramMatch = segment.match(/\{(\w+)\}/);
                if (paramMatch) {
                  paramPositions.push({ index: i, paramName: paramMatch[1] });
                }
              }
            }
            this.#routeParamPositionsCache.set(p, paramPositions);
          }
        }

        const segmentLength = routeSegments.length;
        if (segmentLength !== pathLength) continue;

        const lengthRoutes = routesByLength.get(segmentLength) || [];
        lengthRoutes.push(p);
        routesByLength.set(segmentLength, lengthRoutes);
      }

      // Only process routes with matching segment count
      const candidateRoutes = routesByLength.get(pathLength) || [];

      for (const p of candidateRoutes) {
        const routeSegments = this.#routeSegmentsCache.get(p)!;
        const params: Record<string, string> = {};

        // Fast path for routes with parameters
        const paramPositions = this.#routeParamPositionsCache.get(p);
        if (paramPositions) {
          let isMatch = true;

          // First check all non-parameter segments for a quick fail
          for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i];
            if (!routeSegment.includes('{') && routeSegment !== path[i]) {
              isMatch = false;
              break;
            }
          }

          if (!isMatch) continue;

          // Now process parameter segments
          for (const { index, paramName } of paramPositions) {
            const routeSegment = routeSegments[index];
            const pathSegment = path[index];

            let regex = this.#routeRegexCache.get(routeSegment);
            if (!regex) {
              const regexPattern = routeSegment
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .replace(/\\{(\w+)\\}/g, '(?<$1>[^/]+)');
              regex = new RegExp(`^${regexPattern}$`);
              this.#routeRegexCache.set(routeSegment, regex);
            }

            const values = pathSegment.match(regex)?.groups;
            if (!values) {
              isMatch = false;
              break;
            }

            if (paramName in params) {
              throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Duplicate parameter "${paramName}" at ${p}`);
            }

            params[paramName] = values[paramName];
          }

          if (isMatch) {
            methodParams = params;
            methodKeys.push(p);
          }
        } else {
          // Static route - simple equality comparison for all segments
          let isMatch = true;
          for (let i = 0; i < routeSegments.length; i++) {
            if (routeSegments[i] !== path[i]) {
              isMatch = false;
              break;
            }
          }

          if (isMatch) {
            methodKeys.push(p);
          }
        }
      }

      if (methodKeys.length > 1) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Conflicting routes found: ${methodKeys.join(', ')}`);
      }

      [methodKey] = methodKeys;

      // Cache successful matches
      if (methodKey) {
        this.#routeMatchCache.set(pathStr, { route: methodKey, params: methodParams });
      }
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
