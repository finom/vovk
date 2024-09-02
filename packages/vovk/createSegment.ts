/* eslint-disable no-console */
import { _Segment as Segment } from './Segment';
import {
  _HttpMethod as HttpMethod,
  type _KnownAny as KnownAny,
  type _RouteHandler as RouteHandler,
  type _VovkController as VovkController,
  type _VovkWorker as VovkWorker,
  type _DecoratorOptions as DecoratorOptions,
  type _VovkRequest as VovkRequest,
  type _VovkSchema as VovkSchema,
} from './types';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');
const isClass = (func: unknown) => typeof func === 'function' && /class/.test(func.toString());
const toKebabCase = (str: string) => {
  return (
    str
      // Insert a hyphen before each uppercase letter, then convert to lowercase
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      // Remove any leading hyphen if the original string started with an uppercase letter
      .replace(/^-/, '')
  );
};

export function _createSegment() {
  const segment = new Segment();

  const getDecoratorCreator = (httpMethod: HttpMethod) => {
    const assignSchema = (
      controller: VovkController,
      propertyKey: string,
      path: string,
      options?: DecoratorOptions
    ) => {
      if (typeof window !== 'undefined') {
        throw new Error(
          'Decorators are intended for server-side use only. You have probably imported a controller on the client-side.'
        );
      }
      if (!isClass(controller)) {
        let decoratorName = httpMethod.toLowerCase();
        if (decoratorName === 'delete') decoratorName = 'del';
        throw new Error(
          `Decorator must be used on a static class method. Check the controller method named "${propertyKey}" used with @${decoratorName}.`
        );
      }

      const methods: Record<string, RouteHandler> = segment._routes[httpMethod].get(controller) ?? {};
      segment._routes[httpMethod].set(controller, methods);

      controller._handlers = {
        ...controller._handlers,
        [propertyKey]: {
          ...(controller._handlers ?? {})[propertyKey],
          path,
          httpMethod,
        },
      };

      const originalMethod = controller[propertyKey] as ((...args: KnownAny) => KnownAny) & {
        _controller: VovkController;
        _sourceMethod?: (...args: KnownAny) => KnownAny;
      };

      originalMethod._controller = controller;
      originalMethod._sourceMethod = originalMethod._sourceMethod ?? originalMethod;

      methods[path] = controller[propertyKey] as RouteHandler;
      methods[path]._options = options;
    };

    function decoratorCreator(givenPath = '', options?: DecoratorOptions) {
      const path = trimPath(givenPath);

      function decorator(givenTarget: KnownAny, propertyKey: string) {
        const target = givenTarget as VovkController;
        assignSchema(target, propertyKey, path, options);
      }

      return decorator;
    }

    const auto = (options?: DecoratorOptions) => {
      function decorator(givenTarget: KnownAny, propertyKey: string) {
        const controller = givenTarget as VovkController;
        const methods: Record<string, RouteHandler> = segment._routes[httpMethod].get(controller) ?? {};
        segment._routes[httpMethod].set(controller, methods);

        controller._handlers = {
          ...controller._handlers,
          [propertyKey]: {
            ...(controller._handlers ?? {})[propertyKey],
            httpMethod,
          },
        };

        assignSchema(controller, propertyKey, toKebabCase(propertyKey), options);
      }

      return decorator;
    };

    const enhancedDecoratorCreator = decoratorCreator as {
      (...args: Parameters<typeof decoratorCreator>): ReturnType<typeof decoratorCreator>;
      auto: typeof auto;
    };

    enhancedDecoratorCreator.auto = auto;

    return enhancedDecoratorCreator;
  };

  const prefix = (givenPath = '') => {
    const path = trimPath(givenPath);

    return (givenTarget: KnownAny) => {
      const controller = givenTarget as VovkController;
      controller._prefix = path;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return givenTarget;
    };
  };

  const getSchema = (options: {
    emitSchema?: boolean;
    segmentName?: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    controllers: Record<string, Function>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    workers?: Record<string, Function>;
    exposeValidation?: boolean;
  }) => {
    const exposeValidation = options?.exposeValidation ?? true;
    const emitSchema = options.emitSchema ?? true;
    const schema: VovkSchema = {
      emitSchema,
      segmentName: options.segmentName ?? '',
      controllers: {},
      workers: {},
    };

    if (!emitSchema) return schema;

    for (const [controllerName, controller] of Object.entries(options.controllers) as [string, VovkController][]) {
      schema.controllers[controllerName] = {
        _controllerName: controllerName,
        _prefix: controller._prefix ?? '',
        _handlers: {
          ...(exposeValidation
            ? controller._handlers
            : Object.fromEntries(
                Object.entries(controller._handlers).map(([key, value]) => [
                  key,
                  { ...value, clientValidators: undefined },
                ])
              )),
        },
      };
    }

    for (const [workerName, worker] of Object.entries(options.workers ?? {}) as [string, VovkWorker][]) {
      schema.workers[workerName] = {
        _workerName: workerName,
        _handlers: { ...worker._handlers },
      };
    }

    return schema;
  };

  const initVovk = (options: {
    segmentName?: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    controllers: Record<string, Function>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    workers?: Record<string, Function>;
    exposeValidation?: boolean;
    emitSchema?: boolean;
    onError?: (err: Error, req: VovkRequest) => void | Promise<void>;
  }) => {
    for (const [controllerName, controller] of Object.entries(options.controllers) as [string, VovkController][]) {
      controller._controllerName = controllerName;
      controller._activated = true;
      controller._onError = options?.onError;
    }

    async function GET_DEV(req: VovkRequest, data: { params: Record<string, string[]> }) {
      const { params } = data;
      if (params[Object.keys(params)[0]]?.[0] === '_schema_') {
        // Wait for schema to be set (it can be set after decorators are called with another setTimeout)
        await new Promise((resolve) => setTimeout(resolve, 10));
        const schema = getSchema(options);
        return segment.respond(200, { schema });
      }
      return segment.GET(req, data);
    }

    return {
      GET: process.env.NODE_ENV === 'development' ? GET_DEV : segment.GET,
      POST: segment.POST,
      PUT: segment.PUT,
      PATCH: segment.PATCH,
      DELETE: segment.DELETE,
      HEAD: segment.HEAD,
      OPTIONS: segment.OPTIONS,
    };
  };

  return {
    get: getDecoratorCreator(HttpMethod.GET),
    post: getDecoratorCreator(HttpMethod.POST),
    put: getDecoratorCreator(HttpMethod.PUT),
    patch: getDecoratorCreator(HttpMethod.PATCH),
    del: getDecoratorCreator(HttpMethod.DELETE),
    head: getDecoratorCreator(HttpMethod.HEAD),
    options: getDecoratorCreator(HttpMethod.OPTIONS),
    prefix,
    initVovk,
  };
}
