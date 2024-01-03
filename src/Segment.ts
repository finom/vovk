import type { NextRequest } from 'next/server';
import {
  _HttpMethod as HttpMethod,
  _HttpStatus as HttpStatus,
  type _RouteHandler as RouteHandler,
  type _VovkErrorResponse as VovkErrorResponse,
  type _VovkController as VovkController,
} from './types';
import { _HttpException as HttpException } from './HttpException';
import { _StreamResponse as StreamResponse } from './StreamResponse';

export class _Segment {
  _routes: Record<
    HttpMethod,
    Map<{ name?: string; _prefix?: string; _activated?: true }, Record<string, RouteHandler>>
  > = {
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

  #respond = (status: HttpStatus, body: unknown) => {
    return new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  #respondWithError = (statusCode: HttpStatus, message: string) => {
    return this.#respond(statusCode, {
      statusCode,
      message,
      isError: true,
    } satisfies VovkErrorResponse);
  };

  #callMethod = async (httpMethod: HttpMethod, req: NextRequest, params: Record<string, string[]>) => {
    const controllers = this._routes[httpMethod];
    const methodParams: Record<string, string> = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const handlers: Record<string, { staticMethod: RouteHandler; controller: VovkController }> = Object.fromEntries(
      [...controllers.entries()]
        .map(([controller, staticMethods]) => {
          const prefix = controller._prefix ?? '';

          if (!controller._activated) {
            throw new HttpException(
              HttpStatus.INTERNAL_SERVER_ERROR,
              `Controller "${controller.name}" found but not activated`
            );
          }

          return Object.entries(staticMethods).map(([path, staticMethod]) => {
            const fullPath = [prefix, path].filter(Boolean).join('/');

            return [fullPath, { staticMethod, controller }];
          });
        })
        .flat()
    );

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

    try {
      const promiseOrGenerator = await staticMethod.call(controller, req, methodParams);

      const isIterator =
        (Reflect.has(promiseOrGenerator, Symbol.iterator) &&
          typeof (promiseOrGenerator as Iterable<unknown>)[Symbol.iterator] === 'function') ||
        (Reflect.has(promiseOrGenerator, Symbol.asyncIterator) &&
          typeof (promiseOrGenerator as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function');

      if (isIterator && !(promiseOrGenerator instanceof Array)) {
        const streamResponse = new StreamResponse();

        void (async () => {
          try {
            for await (const chunk of promiseOrGenerator as AsyncGenerator<unknown>) {
              await streamResponse.send(chunk);
            }
          } catch (e) {
            return streamResponse.throw(e);
          }

          return streamResponse.close();
        })();

        return streamResponse;
      }

      const result = promiseOrGenerator;

      if (result instanceof Response) {
        return result;
      }

      if (typeof result !== 'undefined') {
        return this.#respond(200, result);
      }
    } catch (e) {
      const err = e as HttpException;
      try {
        controller._onError?.(err);
      } catch (onErrorError) {
        // eslint-disable-next-line no-console
        console.error(onErrorError);
      }

      if (err.message !== 'NEXT_REDIRECT') {
        const statusCode = err.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
        return this.#respondWithError(statusCode, err.message);
      }

      throw e; // if NEXT_REDIRECT rethrow it
    }
  };
}
