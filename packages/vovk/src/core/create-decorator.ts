import type { VovkController, VovkHandlerSchema } from '../types/core.js';
import type { VovkRequest } from '../types/request.js';
import type { KnownAny } from '../types/utils.js';
import { applyDecoratorAdapter } from './apply-decorator-adapter.js';

type Next = () => Promise<unknown>;

type Middleware = {
  handler: (this: VovkController | undefined, req: unknown, next: Next, ...args: unknown[]) => unknown;
  args: unknown[];
};

// the middleware of each decorator a createDecorator() factory makes, which decorate() runs before the class is known
export const decoratorMiddlewares = new WeakMap<object, Middleware>();

// the functions that make decorators, by the name to call them with ('' when it isn't known): decorate() refuses one
// passed uncalled, which would make a decorator that nothing applies
export const decoratorFactories = new WeakMap<object, string>();

// the class decorators and the factories that make them, by name: decorate() refuses them, as on a member they would
// act on the whole class
export const classDecorators = new WeakMap<object, string>();

/**
 * Creates a custom decorator for Vovk controllers.
 * @see https://vovk.dev/decorator
 */
export function createDecorator<TArgs extends unknown[], TRequest = VovkRequest>(
  handler: null | ((this: VovkController, req: TRequest, next: Next, ...args: TArgs) => unknown),
  initHandler?: (
    this: VovkController,
    ...args: TArgs
  ) =>
    | Omit<VovkHandlerSchema, 'path' | 'httpMethod'>
    | ((
        handlerSchema: VovkHandlerSchema | null,
        options: { handlerName: string }
      ) => Omit<Partial<VovkHandlerSchema>, 'path' | 'httpMethod'>)
    | null
    | undefined
) {
  const decoratorCreator = function decoratorCreator(...args: TArgs) {
    const decorator = function decorator(target: KnownAny, propertyKeyOrContext?: unknown): KnownAny {
      return applyDecoratorAdapter(target, propertyKeyOrContext, applyDecorator);

      function applyDecorator(controller: VovkController, propertyKey: string) {
        const originalMethod = controller[propertyKey] as ((...args: unknown[]) => unknown) & {
          _sourceMethod?: ((...args: unknown[]) => unknown) & { wrapper?: (...args: unknown[]) => unknown };
          fn?: (req: unknown, params: unknown) => unknown;
          schema?: VovkHandlerSchema;
          definition?: Record<string, unknown>;
          wrapper?: (...args: KnownAny) => unknown;
        };
        if (typeof originalMethod !== 'function') {
          throw new Error(`Unable to decorate: ${propertyKey} is not a function`);
        }
        const sourceMethod = originalMethod._sourceMethod ?? originalMethod;

        const method = function method(req: TRequest, params?: unknown) {
          const next: Next = async () => {
            return await originalMethod.call(controller, req, params);
          };

          return handler ? handler.call(controller, req, next, ...args) : next();
        };

        controller[propertyKey] = method;

        method._controller = controller;
        method._sourceMethod = sourceMethod;
        method.fn = originalMethod.fn;
        method.definition = originalMethod.definition;
        sourceMethod.wrapper = method;
        // TODO define internal method type
        (originalMethod as unknown as { _controller: VovkController })._controller = controller;

        // before the HTTP decorator, the procedure's own schema is the one to add to
        const handlerSchema: VovkHandlerSchema | null =
          controller._handlers?.[propertyKey] ?? originalMethod.schema ?? null;
        const initResultReturn = initHandler?.call(controller, ...args);
        const initResult =
          typeof initResultReturn === 'function'
            ? initResultReturn(handlerSchema, {
                handlerName: propertyKey,
              })
            : initResultReturn;

        const methodSchema = {
          ...handlerSchema,
          // avoid override of path and httpMethod
          ...(initResult?.validation ? { validation: initResult.validation } : {}),
          ...(initResult?.operationObject ? { operationObject: initResult.operationObject } : {}),
          ...(initResult?.misc ? { misc: initResult.misc } : {}),
        };
        method.schema = methodSchema;

        controller._handlers = {
          ...controller._handlers,
          [propertyKey]: methodSchema,
        };
      }
    };
    if (handler) decoratorMiddlewares.set(decorator, { handler: handler as Middleware['handler'], args });
    return decorator;
  };
  decoratorFactories.set(decoratorCreator, '');
  return decoratorCreator;
}
