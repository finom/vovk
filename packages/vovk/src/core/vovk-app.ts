import { parseBody } from '../req/parse-body.js';
import { reqMeta } from '../req/req-meta.js';
import { reqQuery } from '../req/req-query.js';
import type {
  DecoratorOptions,
  RouteHandler,
  VovkController,
  VovkControllerInternal,
  VovkErrorResponse,
} from '../types/core.js';
import { HttpMethod, HttpStatus } from '../types/enums.js';
import type { VovkRequest } from '../types/request.js';
import { HttpException, isHttpException } from './http-exception.js';
import { JSONLinesResponder, Responder } from './json-lines-responder.js';

type Route = { staticMethod: RouteHandler; controller: VovkController };

// a route segment as the literals around its params: "{from}-{to}.json" is ['', '-', '.json'] around ['from', 'to']
type ParamSegment = { literals: string[]; paramNames: string[] };

// the param values of a path segment in paramNames order, each as long as possible from the left, as a greedy
// regex would take it; the literals are found from the right with lastIndexOf, so a long segment costs linear time
// where a regex could backtrack for seconds
function matchParamSegment(pathSegment: string, { literals }: ParamSegment) {
  const prefix = literals[0];
  const suffix = literals[literals.length - 1];
  if (!pathSegment.startsWith(prefix) || !pathSegment.endsWith(suffix)) return null;

  const values: string[] = [];
  let end = pathSegment.length - suffix.length;
  for (let i = literals.length - 2; i > 0; i--) {
    const literal = literals[i];
    const at = pathSegment.lastIndexOf(literal, end - literal.length - 1);
    if (at === -1 || at + literal.length >= end) return null;
    values[i] = pathSegment.slice(at + literal.length, end);
    end = at;
  }
  if (end <= prefix.length) return null;
  values[0] = pathSegment.slice(prefix.length, end);

  return values;
}

type SegmentHooks = {
  onError?: VovkControllerInternal['_onError'];
  onSuccess?: VovkControllerInternal['_onSuccess'];
  onBefore?: VovkControllerInternal['_onBefore'];
};

// the catch-all is the one array param, a dynamic parent folder such as [lang] adds string params
export const getCatchAllPath = (params: Record<string, string[] | string | undefined>) =>
  Object.values(params).find((value): value is string[] => Array.isArray(value)) ?? [];

// redirect(), notFound(), forbidden() and unauthorized() from next/navigation throw these for Next.js to answer
const isNextNavigationError = (error: unknown) => {
  const { digest, message } = (error ?? {}) as { digest?: unknown; message?: unknown };
  return (
    (typeof digest === 'string' &&
      (digest.startsWith('NEXT_REDIRECT') || digest.startsWith('NEXT_HTTP_ERROR_FALLBACK'))) ||
    message === 'NEXT_REDIRECT' ||
    message === 'NEXT_NOT_FOUND'
  );
};

class VovkApp {
  private static getHeadersFromDecoratorOptions(options?: DecoratorOptions) {
    if (!options) return {};

    // a preflight adds access-control-allow-methods, see #respondToPreflight
    const corsHeaders = {
      'access-control-allow-origin': '*',
      // x-meta is ours, the client sends it whenever meta is set
      'access-control-allow-headers': 'content-type, authorization, x-meta',
    };

    const headers = {
      ...(options.cors ? corsHeaders : {}),
      ...(options.headers ?? {}),
    };

    return headers;
  }

  // fetch() and Response.redirect() responses have immutable headers, a copy takes the extra headers then
  private static withHeaders(response: Response, headers: Record<string, string>) {
    const missing = Object.entries(headers).filter(([key]) => !response.headers.has(key));
    if (!missing.length) return response;
    try {
      for (const [key, value] of missing) response.headers.set(key, value);
      return response;
    } catch {
      const copy = new Response(response.body, response);
      for (const [key, value] of missing) copy.headers.set(key, value);
      return copy;
    }
  }

  // an error onError throws is logged, it doesn't replace the response
  private static async callOnError(onError: SegmentHooks['onError'], error: unknown, req: VovkRequest) {
    try {
      await onError?.(error as Error, req);
    } catch (onErrorError) {
      console.error('An error caught in onError handler:', onErrorError);
    }
  }

  // HEAD answers with the status and headers only, a stream behind the dropped body is cancelled
  private static withoutBody(response: Response) {
    if (!response.body) return response;
    response.body.cancel().catch(() => {});
    return new Response(null, { status: response.status, statusText: response.statusText, headers: response.headers });
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

  GET = async (req: Request, data: { params: Promise<Record<string, string[]>> }, segmentName: string) =>
    this.#callMethod({ httpMethod: HttpMethod.GET, req, params: await data.params, segmentName });

  POST = async (req: Request, data: { params: Promise<Record<string, string[]>> }, segmentName: string) =>
    this.#callMethod({ httpMethod: HttpMethod.POST, req, params: await data.params, segmentName });
  PUT = async (req: Request, data: { params: Promise<Record<string, string[]>> }, segmentName: string) =>
    this.#callMethod({ httpMethod: HttpMethod.PUT, req, params: await data.params, segmentName });

  PATCH = async (req: Request, data: { params: Promise<Record<string, string[]>> }, segmentName: string) =>
    this.#callMethod({ httpMethod: HttpMethod.PATCH, req, params: await data.params, segmentName });

  DELETE = async (req: Request, data: { params: Promise<Record<string, string[]>> }, segmentName: string) =>
    this.#callMethod({ httpMethod: HttpMethod.DELETE, req, params: await data.params, segmentName });

  HEAD = async (req: Request, data: { params: Promise<Record<string, string[]>> }, segmentName: string) =>
    VovkApp.withoutBody(
      await this.#callMethod({ httpMethod: HttpMethod.HEAD, req, params: await data.params, segmentName })
    );

  OPTIONS = async (req: Request, data: { params: Promise<Record<string, string[]>> }, segmentName: string) =>
    this.#callMethod({ httpMethod: HttpMethod.OPTIONS, req, params: await data.params, segmentName });

  // synchronous, so a body JSON can't serialize throws where the handler's errors are caught
  respond = ({
    statusCode,
    responseBody,
    options,
    headers,
  }: {
    req: Request;
    statusCode: HttpStatus;
    responseBody: unknown;
    options?: DecoratorOptions;
    headers?: Record<string, string>;
  }) => {
    // Response refuses a body with these statuses
    const isNullBodyStatus = statusCode === 204 || statusCode === 205 || statusCode === 304;
    const response = new Response(isNullBodyStatus ? null : JSON.stringify(responseBody), {
      status: statusCode,
      headers: {
        'content-type': 'application/json',
        ...VovkApp.getHeadersFromDecoratorOptions(options),
        ...headers,
      },
    });

    return response;
  };

  // the status, message and cause a caught error answers with
  private static toErrorResponse(e: unknown) {
    if (isHttpException(e)) {
      // Response takes a status from 200 to 599 only
      const isValidStatus = e.statusCode >= 200 && e.statusCode <= 599;
      return {
        statusCode: isValidStatus ? e.statusCode : HttpStatus.INTERNAL_SERVER_ERROR,
        message: e.message,
        cause: e.cause,
      };
    }

    // anything but an HttpException is internal, in production its message and cause stay on the server
    if (process.env.NODE_ENV === 'production') {
      console.error('🐺 Unhandled error in a Vovk handler:', e);
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
    }
    const { message, cause } = (e ?? {}) as { message?: unknown; cause?: unknown };
    // a thrown value that is no Error, as a string, is the message itself
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: typeof message === 'string' ? message : String(e),
      cause,
    };
  }

  #respondWithError = ({
    req,
    statusCode,
    message,
    options,
    cause,
    headers,
  }: {
    req: Request;
    statusCode: HttpStatus;
    message: string;
    options?: DecoratorOptions;
    cause?: unknown;
    headers?: Record<string, string>;
  }) => {
    return this.respond({
      req,
      statusCode,
      responseBody: {
        cause,
        statusCode,
        message,
        isError: true,
      } satisfies VovkErrorResponse,
      options,
      headers,
    });
  };

  // set by initSegment: one controller may serve several segments, each with its own hooks
  #segments = new Map<string, SegmentHooks & { controllers: Set<VovkController> }>();

  setSegment = (segmentName: string, segment: SegmentHooks & { controllers: Set<VovkController> }) => {
    this.#segments.set(segmentName, segment);
    // a segment initialized again, as on a dev reload, collects its handlers again
    delete this.#allHandlers[segmentName];
  };

  // a segment set up without initSegment keeps its hooks on the controller
  #getHooks = (segmentName: string, controller?: VovkController): SegmentHooks =>
    this.#segments.get(segmentName) ?? {
      onError: controller?._onError,
      onSuccess: controller?._onSuccess,
      onBefore: controller?._onBefore,
    };

  // per route: its path segments, the ones holding params by index, and a param named twice
  #routeShapeCache = new Map<
    string,
    { segments: string[]; paramSegments: Map<number, ParamSegment>; duplicateParam: string | undefined }
  >();
  // matches are only valid for the handlers map they were resolved against, so scope by its identity
  #routeMatchCache = new WeakMap<object, Map<string, { route: string; params: Record<string, string> }>>();
  // concrete paths come from the URL, cap the per handlers map cache so it can't grow forever
  static #ROUTE_MATCH_CACHE_LIMIT = 1000;

  #getRouteShape = (route: string) => {
    let shape = this.#routeShapeCache.get(route);
    if (!shape) {
      const segments = route.split('/');
      const paramSegments = new Map<number, ParamSegment>();
      segments.forEach((segment, index) => {
        // split keeps the captured names at the odd indexes, the literals around them at the even ones; a name is
        // anything but braces, as the clients and OpenAPI substitute any {name}
        const parts = segment.split(/\{([^{}]+)\}/);
        if (parts.length === 1) return;
        paramSegments.set(index, {
          literals: parts.filter((_, i) => i % 2 === 0),
          paramNames: parts.filter((_, i) => i % 2 === 1),
        });
      });
      const paramNames = [...paramSegments.values()].flatMap((paramSegment) => paramSegment.paramNames);
      const duplicateParam = paramNames.find((paramName, i) => paramNames.indexOf(paramName) !== i);
      shape = { segments, paramSegments, duplicateParam };
      this.#routeShapeCache.set(route, shape);
    }
    return shape;
  };

  // the params of a route for a path, or null when the path doesn't match the route
  #matchRoute = (route: string, path: string[]) => {
    const { segments, paramSegments, duplicateParam } = this.#getRouteShape(route);
    if (segments.length !== path.length) return null;
    if (segments.some((segment, i) => !paramSegments.has(i) && segment !== path[i])) return null;
    if (duplicateParam) {
      throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Duplicate parameter "${duplicateParam}" at ${route}`);
    }

    const params: Record<string, string> = {};
    for (const [index, paramSegment] of paramSegments) {
      // matched per segment, so a decoded "/" from %2F belongs to the value
      const values = matchParamSegment(path[index], paramSegment);
      if (!values) return null;
      paramSegment.paramNames.forEach((paramName, i) => {
        params[paramName] = values[i];
      });
    }

    return params;
  };

  #getHandler = ({ handlers, path }: { handlers: Record<string, Route>; path: string[] }) => {
    if (path.length === 0) {
      return { handler: Object.hasOwn(handlers, '') ? handlers[''] : null, methodParams: {} };
    }

    // a decoded "/" inside one segment makes the joined path ambiguous, /files/a%2Fb vs /files/a/b
    const hasEncodedSlash = path.some((segment) => segment.includes('/'));
    const pathStr = path.join('/');

    // Fast path: Check if this exact path has been matched before
    let matchCache = hasEncodedSlash ? undefined : this.#routeMatchCache.get(handlers);
    const cachedMatch = matchCache?.get(pathStr);
    if (cachedMatch) {
      // a copy per request, a handler may change its params
      return { handler: handlers[cachedMatch.route], methodParams: { ...cachedMatch.params } };
    }

    // a static route by its literal path, hasOwn so /toString doesn't resolve a prototype member;
    // a template is matched below, so /users/%7Bid%7D gets users/{id} with id "{id}"
    let methodKey =
      !hasEncodedSlash && Object.hasOwn(handlers, pathStr) && !this.#getRouteShape(pathStr).paramSegments.size
        ? pathStr
        : null;
    let methodParams: Record<string, string> = {};

    if (!methodKey) {
      const methodKeys: string[] = [];

      for (const route of Object.keys(handlers)) {
        const params = this.#matchRoute(route, path);
        if (params) {
          methodParams = params;
          methodKeys.push(route);
        }
      }

      if (methodKeys.length > 1) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Conflicting routes found: ${methodKeys.join(', ')}`);
      }

      [methodKey] = methodKeys;

      // Cache successful matches, an ambiguous joined path must not become a cache key
      if (methodKey && !hasEncodedSlash) {
        if (!matchCache) {
          matchCache = new Map();
          this.#routeMatchCache.set(handlers, matchCache);
        }
        if (matchCache.size >= VovkApp.#ROUTE_MATCH_CACHE_LIMIT) {
          matchCache.delete(matchCache.keys().next().value as string);
        }
        matchCache.set(pathStr, { route: methodKey, params: methodParams });
      }
    }

    if (methodKey) {
      return { handler: handlers[methodKey], methodParams: { ...methodParams } };
    }

    return { handler: null, methodParams };
  };

  #allHandlers: Record<string, Partial<Record<HttpMethod, Record<string, Route>>>> = {};

  #collectHandlers = (httpMethod: HttpMethod, segmentName: string) => {
    const controllers = this.routes[httpMethod];
    const segment = this.#segments.get(segmentName);

    const handlers: Record<string, Route> = {};

    controllers.forEach((staticMethods, controller) => {
      // a segment set up without initSegment names its controllers by _segmentName
      const isInSegment = segment ? segment.controllers.has(controller) : controller._segmentName === segmentName;
      if (!isInSegment) return;
      const prefix = controller.prefix ?? '';

      Object.entries(staticMethods ?? {}).forEach(([path, staticMethod]) => {
        const fullPath = [prefix, path].filter(Boolean).join('/');
        handlers[fullPath] = { staticMethod, controller };
      });
    });

    return handlers;
  };

  #getHandlers = (httpMethod: HttpMethod, segmentName: string) => {
    const handlers = this.#allHandlers[segmentName]?.[httpMethod] ?? this.#collectHandlers(httpMethod, segmentName);
    this.#allHandlers[segmentName] ??= {};
    this.#allHandlers[segmentName][httpMethod] = handlers;
    return handlers;
  };

  #findRoute = (httpMethod: HttpMethod, segmentName: string, path: string[]) => {
    const found = this.#getHandler({ handlers: this.#getHandlers(httpMethod, segmentName), path });
    if (found.handler || httpMethod !== HttpMethod.HEAD) return found;
    // route.ts exports HEAD, so Next.js doesn't derive it from GET: a GET route answers it, HEAD drops the body
    return this.#getHandler({ handlers: this.#getHandlers(HttpMethod.GET, segmentName), path });
  };

  // the route of each method on a path, in the order the Allow header lists them
  #getRoutesByMethod = (segmentName: string, path: string[]) => {
    const routes = new Map<string, Route>();
    for (const httpMethod of [
      HttpMethod.GET,
      HttpMethod.HEAD,
      HttpMethod.POST,
      HttpMethod.PUT,
      HttpMethod.PATCH,
      HttpMethod.DELETE,
      HttpMethod.OPTIONS,
    ]) {
      const { handler } = this.#findRoute(httpMethod, segmentName, path);
      if (handler) routes.set(httpMethod, handler);
    }
    return routes;
  };

  // the automatic preflight of the cors option: it approves and lists only the methods whose route on the path has
  // cors, and it runs no hooks, since a preflight carries no credentials and an auth hook would reject it
  #respondToPreflight = ({
    req,
    requestedMethod,
    routes,
  }: {
    req: VovkRequest;
    requestedMethod: string | null | undefined;
    routes: Map<string, Route>;
  }) => {
    const corsRoutes = new Map([...routes].filter(([, { staticMethod }]) => staticMethod._options?.cors));

    // a request without access-control-request-method is no preflight, it gets the headers of any cors route
    const corsRoute = requestedMethod ? corsRoutes.get(requestedMethod) : corsRoutes.values().next().value;
    if (!corsRoute) return null;

    return this.respond({
      req,
      statusCode: HttpStatus.OK,
      responseBody: null,
      options: corsRoute.staticMethod._options,
      headers: { 'access-control-allow-methods': [...corsRoutes.keys()].join(', ') },
    });
  };

  #callMethod = async ({
    httpMethod,
    req: request,
    params,
    segmentName,
  }: {
    httpMethod: HttpMethod;
    req: Request;
    params: Record<string, string[]>;
    segmentName: string;
  }) => {
    const req = request as VovkRequest;
    const path = getCatchAllPath(params);
    let headerList: typeof request.headers | null;
    try {
      headerList = request.headers;
    } catch {
      // this is static rendering environment, headers are not available
      headerList = null;
    }
    const xMeta = headerList?.get('x-meta');
    let xMetaHeader: Record<string, unknown> | null = null;
    if (xMeta) {
      try {
        xMetaHeader = JSON.parse(xMeta);
      } catch {
        // malformed client input is a 400, not an uncaught SyntaxError
        return this.#respondWithError({
          req,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid x-meta request header',
        });
      }
    }

    if (xMetaHeader) reqMeta(req, { xMetaHeader });

    let route: Route | null = null;
    // the body of a result the catch answers instead, cancelled so what produces it stops
    let unsentBody: ReadableStream | null = null;

    try {
      const { handler, methodParams } = this.#findRoute(httpMethod, segmentName, path);

      if (!handler) {
        const routes = this.#getRoutesByMethod(segmentName, path);
        if (httpMethod === HttpMethod.OPTIONS) {
          const requestedMethod = headerList?.get('access-control-request-method');
          const preflight = this.#respondToPreflight({ req, requestedMethod, routes });
          if (preflight) return preflight;
        }

        const at = segmentName === '' ? 'the root segment' : `segment '${segmentName}'`;
        if (!routes.size) {
          return this.#respondWithError({
            req,
            statusCode: HttpStatus.NOT_FOUND,
            message: `Route '${path.join('/')}' is not found for ${httpMethod} method at ${at}`,
          });
        }

        const allowedMethods = [...routes.keys()];
        // a cors route answers the preflight
        const hasCors = [...routes.values()].some(({ staticMethod }) => staticMethod._options?.cors);
        if (hasCors && !routes.has(HttpMethod.OPTIONS)) allowedMethods.push(HttpMethod.OPTIONS);
        return this.#respondWithError({
          req,
          statusCode: HttpStatus.METHOD_NOT_ALLOWED,
          message: `Method ${httpMethod} is not allowed for route '${path.join('/')}' at ${at}`,
          headers: { allow: allowedMethods.join(', ') },
        });
      }

      route = handler;
      const { staticMethod, controller } = handler;
      const headersFromDecoratorOptions = VovkApp.getHeadersFromDecoratorOptions(staticMethod._options);
      const { onSuccess, onBefore, onError } = this.#getHooks(segmentName, controller);

      req.vovk = {
        body: () => parseBody(req),
        query: () => reqQuery(req as VovkRequest<unknown, object>),
        meta: <T = unknown>(meta?: T | null) => reqMeta<T>(req, meta),
        params: () => methodParams,
      };

      await staticMethod._options?.before?.call(controller, req);
      await onBefore?.(req);
      // dispatch via the latest wrapper so decorators applied above the HTTP decorator still run
      const result = await (staticMethod._sourceMethod?.wrapper ?? staticMethod).call(controller, req, methodParams);

      if (result instanceof Response) {
        unsentBody = result.body;
        await onSuccess?.(result, req);
        return VovkApp.withHeaders(result, headersFromDecoratorOptions);
      }

      if (result instanceof Responder) {
        if (result instanceof JSONLinesResponder) {
          result._onError = (error) => void VovkApp.callOnError(onError, error, req);
        }
        unsentBody = result.response.body;
        await onSuccess?.(result, req);
        return VovkApp.withHeaders(result.response, headersFromDecoratorOptions);
      }

      const isIterator =
        typeof result === 'object' &&
        !!result &&
        !Array.isArray(result) &&
        ((Reflect.has(result, Symbol.iterator) &&
          typeof (result as Iterable<unknown>)[Symbol.iterator] === 'function') ||
          (Reflect.has(result, Symbol.asyncIterator) &&
            typeof (result as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function'));

      if (isIterator) {
        const responder = new JSONLinesResponder(
          req,
          ({ headers, readableStream }) =>
            new Response(readableStream, {
              headers: { ...headersFromDecoratorOptions, ...headers },
            })
        );
        responder._onError = (error) => void VovkApp.callOnError(onError, error, req);

        void (async () => {
          try {
            // send() waits while the client reads slower than the generator yields
            for await (const chunk of result as AsyncGenerator<unknown>) {
              await responder.send(chunk);
              // the client went away or a line failed: leaving the loop returns the iterator, so a generator's
              // finally runs
              if (responder.isClosed) break;
            }
          } catch (e) {
            // the outer catch already returned the response, so onError has to run here
            await VovkApp.callOnError(onError, e, req);
            return responder.throw(e);
          }

          return responder.close();
        })();
        unsentBody = responder.response.body;
        await onSuccess?.(responder, req);
        return responder.response;
      }

      const responseBody = result ?? null;
      await onSuccess?.(responseBody, req);
      return this.respond({ req, statusCode: 200, responseBody, options: staticMethod._options });
    } catch (e) {
      unsentBody?.cancel().catch(() => {});
      const { onError } = this.#getHooks(segmentName, route?.controller);
      await VovkApp.callOnError(onError, e, req);

      if (isNextNavigationError(e)) throw e;

      const options = route?.staticMethod._options;

      try {
        return this.#respondWithError({ req, options, ...VovkApp.toErrorResponse(e) });
      } catch (serializationError) {
        // a cause JSON can't serialize, as a cycle or a BigInt, gives a plain 500
        await VovkApp.callOnError(onError, serializationError, req);
        return this.#respondWithError({ req, options, ...VovkApp.toErrorResponse(serializationError) });
      }
    }
  };
}

const vovkApp = new VovkApp();

export { vovkApp };
