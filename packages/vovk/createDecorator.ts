import type {
  _HandlerMetadata as HandlerMetadata,
  _KnownAny as KnownAny,
  _VovkController as VovkController,
  _VovkRequest as VovkRequest,
} from './types';

type Next = () => Promise<unknown>;

export function _createDecorator<ARGS extends unknown[], REQUEST = VovkRequest>(
  handler: null | ((this: VovkController, req: REQUEST, next: Next, ...args: ARGS) => unknown),
  initHandler?: (
    this: VovkController,
    ...args: ARGS
  ) =>
    | Omit<HandlerMetadata, 'path' | 'httpMethod'>
    | ((handlerMetadata: HandlerMetadata | null) => Omit<HandlerMetadata, 'path' | 'httpMethod'>)
    | null
    | undefined
) {
  return function decoratorCreator(...args: ARGS) {
    return function decorator(target: KnownAny, propertyKey: string) {
      const controller = target as VovkController;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const originalMethod = controller[propertyKey] as ((...args: KnownAny) => KnownAny) & {
        _sourceMethod?: (...args: KnownAny) => KnownAny;
      };
      if (typeof originalMethod !== 'function') {
        throw new Error(`Unable to decorate: ${propertyKey} is not a function`);
      }
      const sourceMethod = originalMethod._sourceMethod ?? originalMethod;

      const handlerMetadata: HandlerMetadata | null = controller._handlers?.[propertyKey] ?? null;
      const initResultReturn = initHandler?.call(controller, ...args);
      const initResult = typeof initResultReturn === 'function' ? initResultReturn(handlerMetadata) : initResultReturn;

      controller._handlers = {
        ...controller._handlers,
        [propertyKey]: {
          ...handlerMetadata,
          // avoid override of path and httpMethod
          ...(initResult?.clientValidators ? { clientValidators: initResult.clientValidators } : {}),
          ...(initResult?.customMetadata ? { customMetadata: initResult.customMetadata } : {}),
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      controller[propertyKey] = method;

      method._sourceMethod = sourceMethod;
    };
  };
}
