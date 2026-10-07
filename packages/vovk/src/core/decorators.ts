import type { DecoratorOptions, RouteHandler, VovkController, VovkHandlerSchema } from '../types/core.js';
import { HttpMethod } from '../types/enums.js';
import type { VovkRequest } from '../types/request.js';
import type { KnownAny } from '../types/utils.js';
import { toKebabCase } from '../utils/to-kebab-case.js';
import { trimPath } from '../utils/trim-path.js';
import { applyDecoratorAdapter } from './apply-decorator-adapter.js';
import { getDecoratedMember } from './create-decorator.js';
import { getOwn } from './get-served-handlers.js';
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

  // the same handler declaring the route again is no conflict
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
    _controller?: VovkController;
    schema?: VovkHandlerSchema;
    _sourceMethod?: ((...args: unknown[]) => unknown) & {
      _getSchema?: (controller: VovkController) => VovkHandlerSchema;
    };
  };

  // a decorated member another controller reuses keeps the schema of the controller that decorated it; this one's
  // is in its own _handlers
  const isOwnMember = !originalMethod._controller || originalMethod._controller === controller;
  originalMethod._sourceMethod = originalMethod._sourceMethod ?? originalMethod;
  const schema = originalMethod._sourceMethod._getSchema?.(controller);
  const handlers = getOwn(controller, '_handlers');
  controller._handlers = {
    ...handlers,
    [propertyKey]: {
      ...schema,
      ...(handlers?.[propertyKey] as Partial<VovkHandlerSchema>),
      path,
      httpMethod,
    },
  };
  // the schema of the RPC method, with what the decorators applied before this one added
  if (isOwnMember) originalMethod.schema = controller._handlers[propertyKey];

  // the route calls the outermost decorator of the member, also one placed above the HTTP decorator; the options stay
  // on the route, as one procedure can serve several members, each with its own decorators and routes
  const route = function (this: VovkController, req: VovkRequest, params: Record<string, string>) {
    const member = getDecoratedMember(controller, propertyKey) ?? originalMethod;
    return (member as RouteHandler).call(this, req, params);
  } as RouteHandler;
  route._options = options;
  methods[path] = route;

  const handlersMetadata = getOwn(controller, '_handlersMetadata');
  controller._handlersMetadata = {
    ...handlersMetadata,
    [propertyKey]: {
      ...(handlersMetadata?.[propertyKey] as Partial<VovkHandlerSchema>),
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
        // a procedure's schema reaches _handlers only with the HTTP decorator, so it's read from the source method
        const method = controller[propertyKey] as (Source & { _sourceMethod?: Source }) | undefined;
        const source = method?._sourceMethod ?? method;
        const validation = getOwn(controller, '_handlers')?.[propertyKey]?.validation ?? source?.schema?.validation;
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

  return decoratorFactoryWithAuto;
}

// 2018-09 decorators (SWC without experimentalDecorators) get a class descriptor and reach the class in a finisher
const isClassDescriptor = (target: unknown) =>
  typeof target === 'object' && target !== null && (target as { kind?: unknown }).kind === 'class';

/**
 * Prefix for all routes in the controller.
 */
export const prefix = (givenPath = '') => {
  const path = trimPath(givenPath);

  const decorator = (givenTarget: KnownAny, _context?: KnownAny): KnownAny => {
    if (isClassDescriptor(givenTarget)) {
      return {
        ...givenTarget,
        finisher(klass: KnownAny) {
          decorator(klass);
        },
      };
    }
    const controller = givenTarget as VovkController;
    controller._prefix = path;

    return givenTarget;
  };
  return decorator;
};

/**
 * Clones metadata from parent controller to child controller.
 */
export function cloneControllerMetadata() {
  return function inherit<T extends new (...args: KnownAny[]) => KnownAny>(c: T, _context?: KnownAny): T {
    if (isClassDescriptor(c)) {
      return {
        ...(c as object),
        finisher(klass: T) {
          inherit(klass);
        },
      } as unknown as T;
    }
    const parent = Object.getPrototypeOf(c) as VovkController;
    const controller = c as unknown as VovkController;
    controller._handlers = { ...getOwn(parent, '_handlers'), ...getOwn(controller, '_handlers') };
    controller._handlersMetadata = {
      ...getOwn(parent, '_handlersMetadata'),
      ...getOwn(controller, '_handlersMetadata'),
    };

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
