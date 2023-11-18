import type { NextRequest } from 'next/server';
import type { _KnownAny as KnownAny, _SmoothieController as SmoothieController } from './types';

export function _createDecorator<ARGS extends unknown[], REQUEST = NextRequest>(
  handler: (req: REQUEST, next: () => Promise<unknown>, ...args: ARGS) => unknown
) {
  return function decoratorCreator(...args: ARGS) {
    return function decorator(target: KnownAny, propertyKey: string) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const originalMethod: unknown = target[propertyKey];
      if (typeof originalMethod === 'function') {
        const method = function method(req: REQUEST, params?: unknown) {
          return handler(req, async () => (await originalMethod.call(target, req, params)) as unknown, ...args);
        };

        method._name = (originalMethod as { _name?: string })._name ?? originalMethod.name;
        method._controller = target as SmoothieController;

        // TODO define internal method type
        (originalMethod as unknown as { _controller: SmoothieController })._controller = target as SmoothieController;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        target[propertyKey] = method;
      } else {
        throw new Error(`Unable to decorate: ${propertyKey} is not a function`);
      }
    };
  };
}
