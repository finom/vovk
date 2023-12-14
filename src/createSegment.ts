import { _Segment as Segment } from './Segment';
import {
  _HttpMethod as HttpMethod,
  type _KnownAny as KnownAny,
  type _SmoothieWorkerMetadata as SmoothieWorkerMetadata,
  type _RouteHandler as RouteHandler,
  type _SmoothieController as SmoothieController,
  type _SmoothieControllerMetadata as SmoothieControllerMetadata,
  type _SmoothieWorker as SmoothieWorker,
} from './types';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');
const isClass = (func: unknown) => typeof func === 'function' && /class/.test(func.toString());

const isEqual = (o1: KnownAny, o2: KnownAny): boolean => {
  const obj1 = o1 as Record<string, KnownAny>;
  const obj2 = o2 as Record<string, KnownAny>;
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

const writeMetadataInDevelopment = async (
  metadataPath: string,
  metadata: Record<string, SmoothieControllerMetadata>,
  lib: {
    fs: typeof import('fs/promises');
    path: typeof import('path');
  }
) => {
  const { fs, path } = lib;
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  const existingMetadata = await fs.readFile(metadataPath, 'utf-8').catch(() => '{}');
  if (isEqual(JSON.parse(existingMetadata), metadata)) return;
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
};

export function _createSegment() {
  const r = new Segment();

  const getDecoratorCreator = (httpMethod: HttpMethod) => {
    const assignMetadata = (controller: SmoothieController, propertyKey: string, path: string) => {
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
      const handlers = controller._handlers ?? {};

      controller._handlers = handlers;

      handlers[propertyKey] = { ...handlers[propertyKey], path, httpMethod };

      (controller[propertyKey] as { _controller: SmoothieController })._controller = controller;

      methods[path] = controller[propertyKey] as RouteHandler;
    };

    function decoratorCreator(givenPath = '') {
      const path = trimPath(givenPath);

      function decorator(givenTarget: KnownAny, propertyKey: string) {
        const target = givenTarget as SmoothieController;
        assignMetadata(target, propertyKey, path);
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

    const auto = () => {
      function decorator(givenTarget: KnownAny, propertyKey: string) {
        const target = givenTarget as SmoothieController;
        const controllerName = target.controllerName;

        if (!controllerName) {
          throw new Error(
            `Controller must have a static property "controllerName" when auto() decorators are used. Check the controller named "${
              target.name ?? 'unknown'
            }".`
          );
        }

        assignMetadata(target, propertyKey, `${toKebabCase(controllerName)}/${toKebabCase(propertyKey)}`);
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
      const target = givenTarget as SmoothieController;
      target._prefix = path;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return givenTarget;
    };
  };

  const activateControllers = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    controllers: Function[],
    options?: {
      // eslint-disable-next-line @typescript-eslint/ban-types
      workers?: Function[];
      exposeValidation?: boolean;
      onError?: (err: Error) => void | Promise<void>;
      onMetadata?: (
        metadata: Record<string, SmoothieControllerMetadata> & { workers?: Record<string, SmoothieWorkerMetadata> },
        writeInDevelopment: typeof writeMetadataInDevelopment
      ) => void | Promise<void>;
    }
  ) => {
    for (const controller of controllers as SmoothieController[]) {
      controller._activated = true;
      controller._onError = options?.onError;

      if (process.env.NODE_ENV === 'development') {
        if (controller.controllerName && controller.controllerName !== controller.name) {
          throw new Error(
            `Controller "${controller.name}" has a static property "controllerName" that does not match the controller name.`
          );
        }
      }
    }

    for (const worker of (options?.workers ?? []) as SmoothieWorker[]) {
      if (process.env.NODE_ENV === 'development') {
        if (worker.workerName && worker.workerName !== worker.name) {
          throw new Error(
            `Worker "${worker.name}" has a static property "workerName" that does not match the worker class name.`
          );
        }
      }
    }

    if (options?.onMetadata) {
      const exposeValidation = options?.exposeValidation ?? true;
      const metadata: Record<string, SmoothieControllerMetadata> & {
        workers?: Record<string, SmoothieWorkerMetadata>;
      } = {};

      for (const controller of controllers as unknown as SmoothieController[]) {
        if (!controller.controllerName) {
          throw new Error(`Client metadata error: controller ${controller.name} does not have a controllerName`);
        }

        metadata[controller.controllerName] = {
          controllerName: controller.controllerName,
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

      for (const worker of (options?.workers ?? []) as SmoothieWorker[]) {
        if (!worker.workerName) {
          throw new Error(`Client metadata error: worker ${worker.name} does not have a workerName`);
        }

        metadata.workers = metadata.workers ?? {};
        metadata.workers[worker.workerName] = {
          workerName: worker.workerName,
          _handlers: { ...worker._handlers },
        };
      }

      void options.onMetadata(metadata, writeMetadataInDevelopment);
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
    activateControllers,
  };
}
