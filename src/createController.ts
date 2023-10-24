import CombinedRoute from './CombinedRoute';
import { HttpMethod, KnownDude, RouteHandler } from './types';

function trimPath(path: string) {
  let clean = path.startsWith('/') ? path.slice(1) : path;
  clean = clean.endsWith('/') ? clean.slice(0, -1) : clean;
  return clean;
}

export default function createController() {
  const r = new CombinedRoute();

  const getDecorator =
    (httpMethod: HttpMethod) =>
    (givenPath = '') => {
      const path = trimPath(givenPath);
      return (target: KnownDude, _propertyKey: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const methods: Record<string, RouteHandler> = r._routes[httpMethod].get(target) ?? {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        r._routes[httpMethod].set(target, methods);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        methods[path] = target[_propertyKey] as RouteHandler;
      };
    };

  const prefix = (givenPath = '') => {
    const path = trimPath(givenPath);

    return (target: KnownDude) => {
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

  return {
    get: getDecorator(HttpMethod.GET),
    post: getDecorator(HttpMethod.POST),
    put: getDecorator(HttpMethod.PUT),
    patch: getDecorator(HttpMethod.PATCH),
    del: getDecorator(HttpMethod.DELETE),
    head: getDecorator(HttpMethod.HEAD),
    options: getDecorator(HttpMethod.OPTIONS),
    prefix,
    RouteHandlers,
  };
}
