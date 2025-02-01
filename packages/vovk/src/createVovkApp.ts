import { VovkApp as VovkApp } from './VovkApp';
import {
  HttpMethod,
  type KnownAny,
  type RouteHandler,
  type VovkController,
  type DecoratorOptions,
  type VovkRequest,
  type StaticClass,
  VovkHandlerSchema,
} from './types';
import getSchema from './utils/getSchema';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');
const isClass = (func: unknown) => typeof func === 'function' && /class/.test(func.toString());
const toKebabCase = (str: string) =>
  str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

export function createVovkApp() {
  const vovkApp = new VovkApp();

  const createHTTPDecorator = (httpMethod: HttpMethod) => {
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

      const methods: Record<string, RouteHandler> = vovkApp.routes[httpMethod].get(controller) ?? {};
      vovkApp.routes[httpMethod].set(controller, methods);

      controller._handlers = {
        ...controller._handlers,
        [propertyKey]: {
          ...((controller._handlers ?? {})[propertyKey] as Partial<VovkHandlerSchema>),
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
        const methods: Record<string, RouteHandler> = vovkApp.routes[httpMethod].get(controller) ?? {};
        vovkApp.routes[httpMethod].set(controller, methods);

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

      return givenTarget;
    };
  };

  const initVovk = (options: {
    segmentName?: string;
    controllers: Record<string, StaticClass>;
    workers?: Record<string, StaticClass>;
    exposeValidation?: boolean;
    emitSchema?: boolean;
    onError?: (err: Error, req: VovkRequest) => void | Promise<void>;
  }) => {
    for (const [controllerName, controller] of Object.entries(options.controllers) as [string, VovkController][]) {
      controller._controllerName = controllerName;
      controller._activated = true;
      controller._onError = options?.onError;
    }

    async function GET_DEV(req: VovkRequest, data: { params: Promise<Record<string, string[]>> }) {
      const params = await data.params;
      if (params[Object.keys(params)[0]]?.[0] === '_schema_') {
        // Wait for schema to be set (it can be set after decorators are called with another setTimeout)
        await new Promise((resolve) => setTimeout(resolve, 10));
        const schema = getSchema(options);
        return vovkApp.respond(200, { schema });
      }
      return vovkApp.GET(req, data);
    }

    return {
      GET: process.env.NODE_ENV === 'development' ? GET_DEV : vovkApp.GET,
      POST: vovkApp.POST,
      PUT: vovkApp.PUT,
      PATCH: vovkApp.PATCH,
      DELETE: vovkApp.DELETE,
      HEAD: vovkApp.HEAD,
      OPTIONS: vovkApp.OPTIONS,
    };
  };

  return {
    get: createHTTPDecorator(HttpMethod.GET),
    post: createHTTPDecorator(HttpMethod.POST),
    put: createHTTPDecorator(HttpMethod.PUT),
    patch: createHTTPDecorator(HttpMethod.PATCH),
    del: createHTTPDecorator(HttpMethod.DELETE),
    head: createHTTPDecorator(HttpMethod.HEAD),
    options: createHTTPDecorator(HttpMethod.OPTIONS),
    prefix,
    initVovk,
  };
}
