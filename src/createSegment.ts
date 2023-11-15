import Segment from './Segment';
import { HttpMethod, KnownAny, RouteHandler, SmoothieController } from './types';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');
const isClass = (func: unknown) => typeof func === 'function' && /class/.test(func.toString());

export default function createSegment() {
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
      const metadata = controller._metadata ?? {};

      controller._metadata = metadata;

      metadata[propertyKey] = { path, httpMethod };

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
      onError?: (err: Error) => void;
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
