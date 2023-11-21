import type { NextRequest } from 'next/server';
import type {
  _KnownAny as KnownAny,
  _SmoothieController as SmoothieController,
  _HandlerMetadata as HandlerMetadata,
} from './types';

type Next = () => Promise<unknown>;

export function _createDecorator<ARGS extends unknown[], REQUEST = NextRequest>(
  handler: (this: SmoothieController, req: REQUEST, next: Next, ...args: ARGS) => unknown,
  initHandler?: (
    this: SmoothieController,
    ...args: ARGS
  ) =>
    | {
        clientValidators?: {
          body?: KnownAny;
          query?: KnownAny;
        };
      }
    | null
    | undefined
) {
  return function decoratorCreator(...args: ARGS) {
    return function decorator(target: KnownAny, propertyKey: string) {
      const controller = target as SmoothieController;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const originalMethod: unknown = controller[propertyKey];
      if (typeof originalMethod === 'function') {
        const initResult = initHandler?.call(controller, ...args);

        if (initResult?.clientValidators) {
          controller._handlers = {
            ...controller._handlers,
            [propertyKey]: {
              ...(controller._handlers?.[propertyKey] as HandlerMetadata),
              clientValidators: initResult.clientValidators,
            },
          };
          initResult.clientValidators;
        }

        const method = function method(req: REQUEST, params?: unknown) {
          const next: Next = async () => {
            return (await originalMethod.call(controller, req, params)) as unknown;
          };

          return handler.call(controller, req, next, ...args);
        };

        // method._name = (originalMethod as { _name?: string })._name ?? originalMethod.name;
        method._controller = controller;

        // TODO define internal method type
        (originalMethod as unknown as { _controller: SmoothieController })._controller = controller;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        controller[propertyKey] = method;
      } else {
        throw new Error(`Unable to decorate: ${propertyKey} is not a function`);
      }
    };
  };
}
