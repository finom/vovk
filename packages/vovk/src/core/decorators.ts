import type { DecoratorOptions, RouteHandler, VovkController, VovkHandlerSchema } from '../types/core.js';
import { HttpMethod } from '../types/enums.js';
import type { KnownAny } from '../types/utils.js';
import { toKebabCase } from '../utils/to-kebab-case.js';
import { trimPath } from '../utils/trim-path.js';
import { applyDecoratorAdapter } from './apply-decorator-adapter.js';
import { decoratorFactories } from './create-decorator.js';
import { vovkApp } from './vovk-app.js';

const isClass = (func: unknown) => typeof func === 'function' && /class/.test(func.toString());

// the handler name by method and path of each route a controller declares itself, not the ones it inherits
const declaredRoutes = new WeakMap<VovkController, Map<string, string>>();

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

  // the same handler again is fine: initSegment applies the decorate() decorators of a controller in every segment
  const routes = declaredRoutes.get(controller) ?? new Map<string, string>();
  declaredRoutes.set(controller, routes);
  const declaredBy = routes.get(`${httpMethod} ${path}`);
  if (declaredBy !== undefined && declaredBy !== propertyKey) {
    throw new Error(`Duplicate route ${httpMethod} '${path}' in ${controller.name}: ${declaredBy} and ${propertyKey}`);
  }
  routes.set(`${httpMethod} ${path}`, propertyKey);

  const methods: Record<string, RouteHandler> = vovkApp.routes[httpMethod].get(controller) ?? {};
  vovkApp.routes[httpMethod].set(controller, methods);

  const originalMethod = controller[propertyKey] as ((...args: unknown[]) => unknown) & {
    _controller: VovkController;
    fn?: (req: unknown, params: unknown) => unknown;
    definition?: Record<string, unknown>;
    schema?: VovkHandlerSchema;
    _sourceMethod?: ((...args: unknown[]) => unknown) & {
      _getSchema?: (controller: VovkController) => VovkHandlerSchema;
      wrapper?: (...args: unknown[]) => unknown;
      fn?: (req: unknown, params: unknown) => unknown;
      definition?: Record<string, unknown>;
      schema?: VovkHandlerSchema;
    };
  };

  originalMethod._controller = controller;
  originalMethod._sourceMethod = originalMethod._sourceMethod ?? originalMethod;
  const schema = originalMethod._sourceMethod._getSchema?.(controller);
  // TODO: Some of these assignments probably not needed anymore
  originalMethod.fn = originalMethod._sourceMethod?.fn;
  originalMethod.definition = originalMethod._sourceMethod?.definition;
  originalMethod._sourceMethod.wrapper = originalMethod;
  controller._handlers = {
    ...controller._handlers,
    [propertyKey]: {
      ...schema,
      ...(controller._handlers?.[propertyKey] as Partial<VovkHandlerSchema>),
      path,
      httpMethod,
    },
  };
  // the schema of the RPC method, with what the decorators applied before this one added
  originalMethod.schema = controller._handlers[propertyKey];

  methods[path] = originalMethod as RouteHandler;
  methods[path]._options = options;

  controller._handlersMetadata = {
    ...controller._handlersMetadata,
    [propertyKey]: {
      ...(controller._handlersMetadata?.[propertyKey] as Partial<VovkHandlerSchema>),
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

    function decorator(givenTarget: unknown, propertyKeyOrContext?: unknown): KnownAny {
      return applyDecoratorAdapter(givenTarget, propertyKeyOrContext, (controller, propertyKey) => {
        assignSchema({ controller, propertyKey, path, options, httpMethod });
      });
    }

    return decorator;
  }

  const auto = (options?: DecoratorOptions) => {
    function decorator(givenTarget: unknown, propertyKeyOrContext?: unknown): KnownAny {
      return applyDecoratorAdapter(givenTarget, propertyKeyOrContext, (controller, propertyKey) => {
        type Source = { schema?: VovkHandlerSchema; definition?: Record<string, KnownAny> };
        // a procedure's schema reaches _handlers only once the HTTP decorator is applied, read it from the source method
        const method = controller[propertyKey] as (Source & { _sourceMethod?: Source }) | undefined;
        const source = method?._sourceMethod ?? method;
        const validation = controller._handlers?.[propertyKey]?.validation ?? source?.schema?.validation;
        const definition = source?.definition;
        // skipSchemaEmission leaves the params out of the schema, the path still needs them
        const paramsSchema =
          validation?.params ??
          (definition?.params && definition.toJSONSchema?.(definition.params, { validationType: 'params' }));
        const properties = Object.keys(paramsSchema?.properties ?? {});
        const kebabCasePath = toKebabCase(propertyKey);
        const path = properties.length
          ? `${kebabCasePath}/${properties.map((prop) => `{${prop}}`).join('/')}`
          : kebabCasePath;
        assignSchema({ controller, propertyKey, path, options, httpMethod });
      });
    }

    return decorator;
  };

  const decoratorFactoryWithAuto = decoratorFactory as {
    (...args: Parameters<typeof decoratorFactory>): ReturnType<typeof decoratorFactory>;
    auto: typeof auto;
  };

  decoratorFactoryWithAuto.auto = auto;

  // the names they are exported by
  const name = httpMethod === HttpMethod.DELETE ? 'del' : httpMethod.toLowerCase();
  decoratorFactories.set(decoratorFactory, name);
  decoratorFactories.set(auto, `${name}.auto`);

  return decoratorFactoryWithAuto;
}

/**
 * Prefix for all routes in the controller.
 */
export const prefix = (givenPath = '') => {
  const path = trimPath(givenPath);

  return (givenTarget: KnownAny, _context?: KnownAny) => {
    const controller = givenTarget as VovkController;
    controller.prefix = path;

    return givenTarget;
  };
};

// initSegment copies a clone's parent's routes again, when the parent's decorate() decorators are applied
export const clonedControllers = new WeakSet<object>();

/**
 * Clones metadata from parent controller to child controller.
 */
export function cloneControllerMetadata() {
  return function inherit<T extends new (...args: KnownAny[]) => KnownAny>(c: T, _context?: KnownAny) {
    const parent = Object.getPrototypeOf(c) as VovkController;
    const controller = c as unknown as VovkController;
    clonedControllers.add(controller);
    controller._handlers = { ...parent._handlers, ...controller._handlers };
    controller._handlersMetadata = { ...parent._handlersMetadata, ...controller._handlersMetadata };

    Object.values(vovkApp.routes).forEach((methods) => {
      const parentMethods = methods.get(parent) ?? {};
      methods.set(controller, { ...parentMethods, ...methods.get(controller) });
    });

    return controller as unknown as T;
  };
}

/**
 * GET HTTP method decorator.
 */
export const get = createHTTPDecorator(HttpMethod.GET);
/**
 *  POST HTTP method decorator.
 */
export const post = createHTTPDecorator(HttpMethod.POST);
/**
 *  PUT HTTP method decorator.
 */
export const put = createHTTPDecorator(HttpMethod.PUT);
/**
 *  PATCH HTTP method decorator.
 */
export const patch = createHTTPDecorator(HttpMethod.PATCH);
/**
 *  DELETE HTTP method decorator.
 */
export const del = createHTTPDecorator(HttpMethod.DELETE);
/**
 * HEAD HTTP method decorator.
 */
export const head = createHTTPDecorator(HttpMethod.HEAD);
/**
 * OPTIONS HTTP method decorator.
 */
export const options = createHTTPDecorator(HttpMethod.OPTIONS);
