import { vovkApp } from './VovkApp';
import {
  HttpMethod,
  type RouteHandler,
  type VovkController,
  type DecoratorOptions,
  type VovkHandlerSchema,
} from '../types';
import { trimPath } from '../utils/trimPath';

type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

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
}: {
  controller: VovkController;
  propertyKey: string;
  path: string;
  options?: DecoratorOptions;
  httpMethod: HttpMethod;
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

  const originalMethod = controller[propertyKey] as ((...args: unknown[]) => unknown) & {
    _controller: VovkController;
    fn?: (req: unknown, params: unknown) => unknown;
    models?: Record<string, unknown>;
    schema?: VovkHandlerSchema;
    _sourceMethod?: ((...args: unknown[]) => unknown) & {
      _getSchema?: (controller: VovkController) => VovkHandlerSchema;
      wrapper?: (...args: unknown[]) => unknown;
      fn?: (req: unknown, params: unknown) => unknown;
      models?: Record<string, unknown>;
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

function createHTTPDecorator<T extends HttpMethod>(httpMethod: T) {
  function decoratorFactory(
    givenPath = '',
    options?: T extends HttpMethod.GET ? DecoratorOptions : Omit<DecoratorOptions, 'staticParams'>
  ) {
    const path = trimPath(givenPath);

    function decorator(givenTarget: unknown, propertyKey: string) {
      const controller = givenTarget as VovkController;
      assignSchema({ controller, propertyKey, path, options, httpMethod });
    }

    return decorator;
  }

  const auto = (options?: DecoratorOptions) => {
    function decorator(givenTarget: unknown, propertyKey: string) {
      const controller = givenTarget as VovkController;
      // validation is already assigned at procedure function
      const properties = Object.keys((controller._handlers ?? {})[propertyKey]?.validation?.params?.properties ?? {});
      const kebabCasePath = toKebabCase(propertyKey);
      const path = properties.length
        ? `${kebabCasePath}/${properties.map((prop) => `{${prop}}`).join('/')}`
        : kebabCasePath;

      assignSchema({ controller, propertyKey, path, options, httpMethod });
    }

    return decorator;
  };

  const decoratorFactoryWithAuto = decoratorFactory as {
    (...args: Parameters<typeof decoratorFactory>): ReturnType<typeof decoratorFactory>;
    auto: typeof auto;
  };

  decoratorFactoryWithAuto.auto = auto;

  return decoratorFactoryWithAuto;
}

const prefix = (givenPath = '') => {
  const path = trimPath(givenPath);

  return (givenTarget: KnownAny) => {
    const controller = givenTarget as unknown as VovkController;
    controller._prefix = path;

    return givenTarget;
  };
};

function cloneControllerMetadata() {
  return function inherit<T extends new (...args: KnownAny[]) => KnownAny>(c: T) {
    const parent = Object.getPrototypeOf(c) as VovkController;
    const constructor = c as unknown as VovkController;
    constructor._handlers = { ...parent._handlers, ...constructor._handlers };
    constructor._handlersMetadata = { ...parent._handlersMetadata, ...constructor._handlersMetadata };

    Object.values(vovkApp.routes).forEach((methods) => {
      const parentMethods = methods.get(parent) ?? {};
      methods.set(constructor, { ...parentMethods, ...methods.get(constructor) });
    });

    return constructor as unknown as T;
  };
}

export const get = createHTTPDecorator(HttpMethod.GET);
export const post = createHTTPDecorator(HttpMethod.POST);
export const put = createHTTPDecorator(HttpMethod.PUT);
export const patch = createHTTPDecorator(HttpMethod.PATCH);
export const del = createHTTPDecorator(HttpMethod.DELETE);
export const head = createHTTPDecorator(HttpMethod.HEAD);
export const options = createHTTPDecorator(HttpMethod.OPTIONS);
export { prefix, cloneControllerMetadata };
