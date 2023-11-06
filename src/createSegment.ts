import Segment from './Segment';
import { HttpMethod, AnyDude, RouteHandler } from './types';

const trimPath = (path: string) => {
  let clean = path.startsWith('/') ? path.slice(1) : path;
  clean = clean.endsWith('/') ? clean.slice(0, -1) : clean;
  return clean;
};

const isClass = (func: unknown) => {
  return typeof func === 'function' && /^class\s/.test(func.toString());
};

export default function createSegment() {
  const r = new Segment();

  const getDecorator =
    (httpMethod: HttpMethod) =>
    (givenPath = '') => {
      const path = trimPath(givenPath);
      return (target: AnyDude, propertyKey: string) => {
        if (!isClass(target)) {
          throw new Error(
            `Decorator must be used on a static class method. Check the controller method called "${propertyKey}".`
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const methods: Record<string, RouteHandler> = r._routes[httpMethod].get(target) ?? {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        r._routes[httpMethod].set(target, methods);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        methods[path] = target[propertyKey] as RouteHandler;
      };
    };

  const prefix = (givenPath = '') => {
    const path = trimPath(givenPath);

    return (target: AnyDude) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      target._prefix = path;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return target;
    };
  };

  class RouteHandlers {
    static GET = r.GET;

    static POST = r.POST;

    static PUT = r.PUT;

    static PATCH = r.PATCH;

    static DELETE = r.DELETE;

    static HEAD = r.HEAD;

    static OPTIONS = r.OPTIONS;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  const activateControllers = (...controllers: Function[]) => {
    for (const controller of controllers) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (controller as unknown as { _activated: true })._activated = true;
    }

    return RouteHandlers;
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
