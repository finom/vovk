import type { VovkHandlerSchema, KnownAny, VovkController, VovkRequest } from './types';

type Next = () => Promise<unknown>;

export function createDecorator<ARGS extends unknown[], REQUEST = VovkRequest>(
  handler: null | ((this: VovkController, req: REQUEST, next: Next, ...args: ARGS) => unknown),
  initHandler?: (
    this: VovkController,
    ...args: ARGS
  ) =>
    | Omit<VovkHandlerSchema, 'path' | 'httpMethod'>
    | ((handlerSchema: VovkHandlerSchema | null) => Omit<Partial<VovkHandlerSchema>, 'path' | 'httpMethod'>)
    | null
    | undefined
) {
  return function decoratorCreator(...args: ARGS) {
    return function decorator(target: KnownAny, propertyKey: string) {
      const controller = target as VovkController;

      const originalMethod = controller[propertyKey] as ((...args: KnownAny) => KnownAny) & {
        _sourceMethod?: (...args: KnownAny) => KnownAny;
      };
      if (typeof originalMethod !== 'function') {
        throw new Error(`Unable to decorate: ${propertyKey} is not a function`);
      }
      const sourceMethod = originalMethod._sourceMethod ?? originalMethod;

      const handlerSchema: VovkHandlerSchema | null = controller._handlers?.[propertyKey] ?? null;
      const initResultReturn = initHandler?.call(controller, ...args);
      const initResult = typeof initResultReturn === 'function' ? initResultReturn(handlerSchema) : initResultReturn;

      controller._handlers = {
        ...controller._handlers,
        [propertyKey]: {
          ...handlerSchema,
          // avoid override of path and httpMethod
          ...(initResult?.validation ? { validation: initResult.validation } : {}),
          ...(initResult?.openapi ? { openapi: initResult.openapi } : {}),
          ...(initResult?.custom ? { custom: initResult.custom } : {}),
        },
      };

      const method = function method(req: REQUEST, params?: unknown) {
        const next: Next = async () => {
          return (await originalMethod.call(controller, req, params)) as unknown;
        };

        return handler ? handler.call(controller, req, next, ...args) : next();
      };

      method._controller = controller;

      // TODO define internal method type
      (originalMethod as unknown as { _controller: VovkController })._controller = controller;

      controller[propertyKey] = method;

      method._sourceMethod = sourceMethod;
    };
  };
}
