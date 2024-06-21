/* eslint-disable no-console */
import { _Segment as Segment } from './Segment';
import {
  _HttpMethod as HttpMethod,
  type _KnownAny as KnownAny,
  type _VovkWorkerMetadata as VovkWorkerMetadata,
  type _RouteHandler as RouteHandler,
  type _VovkController as VovkController,
  type _VovkControllerMetadata as VovkControllerMetadata,
  type _VovkWorker as VovkWorker,
  type _VovkMetadata as VovkMetadata,
  type _DecoratorOptions as DecoratorOptions,
  type _VovkRequest as VovkRequest,
} from './types';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');
const isClass = (func: unknown) => typeof func === 'function' && /class/.test(func.toString());

export function _createSegment() {
  const r = new Segment();

  const getDecoratorCreator = (httpMethod: HttpMethod) => {
    const assignMetadata = (
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

      const methods: Record<string, RouteHandler> = r._routes[httpMethod].get(controller) ?? {};
      r._routes[httpMethod].set(controller, methods);

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
        assignMetadata(target, propertyKey, path, options);
      }

      return decorator;
    }

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

    const auto = (options?: DecoratorOptions) => {
      function decorator(givenTarget: KnownAny, propertyKey: string) {
        const controller = givenTarget as VovkController;
        const methods: Record<string, RouteHandler> = r._routes[httpMethod].get(controller) ?? {};
        r._routes[httpMethod].set(controller, methods);

        controller._handlers = {
          ...controller._handlers,
          [propertyKey]: {
            ...(controller._handlers ?? {})[propertyKey],
            httpMethod,
          },
        };

        assignMetadata(controller, propertyKey, toKebabCase(propertyKey), options);
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

  const getMetadata = (options: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    controllers: Record<string, Function>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    workers?: Record<string, Function>;
    exposeValidation?: boolean;
  }) => {
    const exposeValidation = options?.exposeValidation ?? true;
    const metadata: Record<string, VovkControllerMetadata> & {
      workers?: Record<string, VovkWorkerMetadata>;
    } = {};

    for (const [controllerName, controller] of Object.entries(options.controllers) as [string, VovkController][]) {
      metadata[controllerName] = {
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
      metadata.workers = metadata.workers ?? {};
      metadata.workers[workerName] = {
        _workerName: workerName,
        _handlers: { ...worker._handlers },
      };
    }

    return metadata;
  };

  const initVovk = (options: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    controllers: Record<string, Function>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    workers?: Record<string, Function>;
    exposeValidation?: boolean;
    emitMetadata?: boolean;
    onError?: (err: Error, req: VovkRequest) => void | Promise<void>;
    onMetadata?: (metadata: VovkMetadata) => void | Promise<void>;
  }) => {
    for (const [controllerName, controller] of Object.entries(options.controllers) as [string, VovkController][]) {
      controller._controllerName = controllerName;
      controller._activated = true;
      controller._onError = options?.onError;
    }

    const metadata = getMetadata(options);

    if (options.emitMetadata !== false) {
      if (process.env.NODE_ENV === 'development') {
        const VOVK_PORT = process.env.VOVK_PORT || (parseInt(process.env.PORT || '3000') + 6969).toString();

        void fetch(`http://localhost:${VOVK_PORT}/__metadata`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metadata }),
        })
          .then((resp) => {
            if (!resp.ok) {
              // eslint-disable-next-line no-console
              console.error(` 🐺 Failed to send metadata to Vovk Server: ${resp.statusText}`);
            }
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error(` 🐺 Failed to send metadata to Vovk Server: ${err}`);
          });
      }

      if (options?.onMetadata) {
        void options.onMetadata(metadata);
      }
    }

    return {
      GET: r.GET,
      POST: r.POST,
      PUT: r.PUT,
      PATCH: r.PATCH,
      DELETE: r.DELETE,
      HEAD: r.HEAD,
      OPTIONS: r.OPTIONS,
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
