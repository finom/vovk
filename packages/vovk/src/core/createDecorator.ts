import type { VovkHandlerSchema, VovkController } from '../types/core.js';
import type { VovkRequest } from '../types/request.js';
import type { KnownAny } from '../types/utils.js';

type Next = () => Promise<unknown>;

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
    return function decorator(target: KnownAny, propertyKey: string) {
      const controller = target as VovkController;

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
          return (await originalMethod.call(controller, req, params)) as unknown;
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

      const handlerSchema: VovkHandlerSchema | null = controller._handlers?.[propertyKey] ?? null;
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
    };
  };
}
