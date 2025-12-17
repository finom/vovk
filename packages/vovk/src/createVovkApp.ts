import type { NextRequest } from 'next/server';
import { VovkApp } from './VovkApp';
import {
  HttpMethod,
  type KnownAny,
  type RouteHandler,
  type VovkController,
  type DecoratorOptions,
  type VovkRequest,
  type StaticClass,
  type VovkHandlerSchema,
} from './types';
import { getSchema } from './utils/getSchema';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');
const isClass = (func: unknown) => typeof func === 'function' && /class/.test(func.toString());
const toKebabCase = (str: string) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Add hyphen between lowercase/digit and uppercase
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2') // Add hyphen between uppercase letters if the second one is followed by a lowercase
    .toLowerCase()
    .replace(/^-/, ''); // Remove leading hyphen

const assignSchema = ({
  controller,
  propertyKey,
  path,
  options,
  httpMethod,
  vovkApp,
}: {
  controller: VovkController;
  propertyKey: string;
  path: string;
  options?: DecoratorOptions;
  httpMethod: HttpMethod;
  vovkApp: VovkApp;
}) => {
  if (typeof window !== 'undefined') {
    throw new Error(
      'HTTP decorators can be used on server-side only. You have probably imported a controller on the client-side.'
    );
  }

  if (!isClass(controller)) {
    let decoratorName = httpMethod.toLowerCase();
    if (decoratorName === 'delete') decoratorName = 'del';

    throw new Error(
      `Decorator must be used on a static class method. Check the controller method named "${propertyKey}" used with @${decoratorName}().`
    );
  }

  const methods: Record<string, RouteHandler> = vovkApp.routes[httpMethod].get(controller) ?? {};
  vovkApp.routes[httpMethod].set(controller, methods);

  if (options?.cors) {
    const optionsMethods = vovkApp.routes.OPTIONS.get(controller) ?? {};
    optionsMethods[path] = (() => {}) as unknown as RouteHandler;
    optionsMethods[path]._options = options;
    vovkApp.routes.OPTIONS.set(controller, optionsMethods);
  }

  const originalMethod = controller[propertyKey] as ((...args: KnownAny) => KnownAny) & {
    _controller: VovkController;
    fn?: (req: KnownAny, params: KnownAny) => KnownAny;
    models?: Record<string, KnownAny>;
    schema?: VovkHandlerSchema;
    _sourceMethod?: ((...args: KnownAny) => KnownAny) & {
      _getSchema?: (controller: VovkController) => VovkHandlerSchema;
      wrapper?: (...args: KnownAny) => KnownAny;
      fn?: (req: KnownAny, params: KnownAny) => KnownAny;
      models?: Record<string, KnownAny>;
      schema?: VovkHandlerSchema;
    };
  };

  originalMethod._controller = controller;
  originalMethod._sourceMethod = originalMethod._sourceMethod ?? originalMethod;
  const schema = originalMethod._sourceMethod._getSchema?.(controller);
  // TODO: Some of these assignments probably not needed anymore
  originalMethod.schema = schema;
  originalMethod.fn = originalMethod._sourceMethod?.fn;
  originalMethod.models = originalMethod._sourceMethod?.models;
  originalMethod._sourceMethod.wrapper = originalMethod;
  controller._handlers = {
    ...controller._handlers,
    [propertyKey]: {
      ...schema,
      ...((controller._handlers ?? {})[propertyKey] as Partial<VovkHandlerSchema>),
      path,
      httpMethod,
    },
  };

  methods[path] = originalMethod as RouteHandler;
  methods[path]._options = options;

  controller._handlersMetadata = {
    ...controller._handlersMetadata,
    [propertyKey]: {
      ...((controller._handlersMetadata ?? {})[propertyKey] as Partial<VovkHandlerSchema>),
      staticParams: options?.staticParams,
    },
  };
};

export function createVovkApp() {
  const vovkApp = new VovkApp();

  function createHTTPDecorator<T extends HttpMethod>(httpMethod: T) {
    function decoratorCreator(
      givenPath = '',
      options?: T extends HttpMethod.GET ? DecoratorOptions : Omit<DecoratorOptions, 'staticParams'>
    ) {
      const path = trimPath(givenPath);

      function decorator(givenTarget: KnownAny, propertyKey: string) {
        const controller = givenTarget as VovkController;
        assignSchema({ controller, propertyKey, path, options, httpMethod, vovkApp });
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

        const properties = Object.keys(controller._handlers[propertyKey]?.validation?.params?.properties ?? {});
        const kebab = toKebabCase(propertyKey); // 🥙
        const path = properties.length ? `${kebab}/${properties.map((prop) => `{${prop}}`).join('/')}` : kebab;

        assignSchema({ controller, propertyKey, path, options, httpMethod, vovkApp });
      }

      return decorator;
    };

    const enhancedDecoratorCreator = decoratorCreator as {
      (...args: Parameters<typeof decoratorCreator>): ReturnType<typeof decoratorCreator>;
      auto: typeof auto;
    };

    enhancedDecoratorCreator.auto = auto;

    return enhancedDecoratorCreator;
  }

  const prefix = (givenPath = '') => {
    const path = trimPath(givenPath);

    return (givenTarget: KnownAny) => {
      const controller = givenTarget as VovkController;
      controller._prefix = path;

      return givenTarget;
    };
  };

  const initSegment = (options: {
    segmentName?: string;
    controllers: Record<string, StaticClass>;
    exposeValidation?: boolean;
    emitSchema?: boolean;
    forceApiRoot?: string;
    onError?: (err: Error, req: VovkRequest) => void | Promise<void>;
    onSuccess?: (resp: unknown, req: VovkRequest) => void | Promise<void>;
    onBefore?: (req: VovkRequest) => void | Promise<void>;
  }) => {
    options.segmentName = trimPath(options.segmentName ?? '');
    for (const [rpcModuleName, controller] of Object.entries(options.controllers ?? {}) as [string, VovkController][]) {
      controller._rpcModuleName = rpcModuleName;
      controller._onError = options?.onError;
      controller._onSuccess = options?.onSuccess;
      controller._onBefore = options?.onBefore;
    }

    async function GET_DEV(req: NextRequest, data: { params: Promise<Record<string, string[]>> }) {
      const params = await data.params;
      if (params[Object.keys(params)[0]]?.[0] === '_schema_') {
        const schema = await getSchema(options);
        return vovkApp.respond({
          req: req as unknown as VovkRequest,
          statusCode: 200,
          responseBody: { schema },
        });
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
    } satisfies Record<
      HttpMethod,
      (req: NextRequest, data: { params: Promise<Record<string, string[]>> }) => Promise<unknown>
    >;
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
    initSegment,
  };
}
