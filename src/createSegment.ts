import Segment from './Segment';
import { HttpMethod, AnyDude, RouteHandler, TargetController } from './types';

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

  const getDecorator =
    (httpMethod: HttpMethod) =>
    (givenPath = '') => {
      const path = trimPath(givenPath);
      return (givenTarget: AnyDude, propertyKey: string) => {
        const target = givenTarget as TargetController;
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
    };

  const prefix = (givenPath = '') => {
    const path = trimPath(givenPath);

    return (givenTarget: AnyDude) => {
      const target = givenTarget as TargetController;
      target._prefix = path;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return givenTarget;
    };
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  const activateControllers = (...controllers: Function[]) => {
    for (const controller of controllers as TargetController[]) {
      controller._activated = true;
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
    get: getDecorator(HttpMethod.GET),
    post: getDecorator(HttpMethod.POST),
    put: getDecorator(HttpMethod.PUT),
    patch: getDecorator(HttpMethod.PATCH),
    del: getDecorator(HttpMethod.DELETE),
    head: getDecorator(HttpMethod.HEAD),
    options: getDecorator(HttpMethod.OPTIONS),
    prefix,
    activateControllers,
  };
}
