import type { VovkController, VovkHandlerSchema } from '../types/core.js';
import type { VovkRequest } from '../types/request.js';
import type { KnownAny } from '../types/utils.js';
import { applyDecoratorAdapter } from './apply-decorator-adapter.js';
import { getOwn } from './get-served-handlers.js';

type Next = () => Promise<unknown>;

// the outermost wrapper of each decorated member: legacy decorators put the own descriptor of a static method back on
// the class once they all ran, so the class itself may hold the method without its decorators
const decoratedMembers = new WeakMap<VovkController, Map<string, (...args: KnownAny[]) => unknown>>();

export const getDecoratedMember = (controller: VovkController, propertyKey: string) =>
  decoratedMembers.get(controller)?.get(propertyKey);

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
  return function decoratorCreator(...args: TArgs) {
    return function decorator(target: KnownAny, propertyKeyOrContext?: unknown): KnownAny {
      return applyDecoratorAdapter(target, propertyKeyOrContext, applyDecorator);

      function applyDecorator(controller: VovkController, propertyKey: string) {
        // a procedure makes the fn() of each member that holds it
        type CreateFn = (run: (req: TRequest, params?: unknown) => unknown) => unknown;
        const originalMethod = controller[propertyKey] as ((...args: unknown[]) => unknown) & {
          _sourceMethod?: ((...args: unknown[]) => unknown) & { _createFn?: CreateFn };
          _createFn?: CreateFn;
          schema?: VovkHandlerSchema;
          definition?: Record<string, unknown>;
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
        decoratedMembers.set(controller, (decoratedMembers.get(controller) ?? new Map()).set(propertyKey, method));

        method._controller = controller;
        method._sourceMethod = sourceMethod;
        // fn() of a decorated member runs its decorators, the procedure's own fn() runs none
        method.fn = sourceMethod._createFn?.(method);
        method.definition = originalMethod.definition;
        // TODO define internal method type
        (originalMethod as unknown as { _controller: VovkController })._controller = controller;

        // before the HTTP decorator, the procedure's own schema is the one to add to
        const handlerSchema: VovkHandlerSchema | null =
          getOwn(controller, '_handlers')?.[propertyKey] ?? originalMethod.schema ?? null;
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
          ...getOwn(controller, '_handlers'),
          // path and httpMethod come with the HTTP decorator
          [propertyKey]: methodSchema as VovkHandlerSchema,
        };
      }
    };
  };
}
