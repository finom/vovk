import Segment from './Segment';
import { HttpMethod, KnownAny, RouteHandler, TargetController } from './types';

const trimPath = (path: string) => {
  let clean = path.startsWith('/') ? path.slice(1) : path;
  clean = clean.endsWith('/') ? clean.slice(0, -1) : clean;
  return clean;
};

const isClass = (func: unknown) => {
  return typeof func === 'function' && /class/.test(func.toString());
};

export default function createSegment() {
  const r = new Segment();

  const getDecoratorCreator = (httpMethod: HttpMethod) => {
    const assignMetadata = (target: TargetController, propertyKey: string, path: string) => {
      if (!isClass(target)) {
        let decoratorName = httpMethod.toLowerCase();
        if (decoratorName === 'delete') decoratorName = 'del';
        throw new Error(
          `Decorator must be used on a static class method. Check the controller method named "${propertyKey}" used with @${decoratorName}.`
        );
      }
      const methods: Record<string, RouteHandler> = r._routes[httpMethod].get(target) ?? {};
      r._routes[httpMethod].set(target, methods);
      const metadata = target._metadata ?? {};

      target._metadata = metadata;

      metadata[propertyKey] = { path, httpMethod };

      methods[path] = target[propertyKey] as RouteHandler;
    };

    function decoratorCreator(givenPath = '') {
      const path = trimPath(givenPath);

      function decorator(givenTarget: KnownAny, propertyKey: string) {
        const target = givenTarget as TargetController;
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
        const target = givenTarget as TargetController;
        const controllerName = target.name;

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
      const target = givenTarget as TargetController;
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
    for (const controller of controllers as TargetController[]) {
      controller._activated = true;
      controller._onError = options?.onError;
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
