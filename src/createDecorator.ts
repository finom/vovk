import { NextRequest } from 'next/server';
import { KnownDude } from './types';

export default function createDecorator<ARGS extends unknown[], REQUEST = NextRequest>(
  handler: (req: REQUEST, next: () => void, ...args: ARGS) => void
) {
  return function decoratorCreator(...args: ARGS) {
    return function decorator(target: KnownDude, propertyKey: string) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const originalMethod: unknown = target[propertyKey];
      if (typeof originalMethod === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        target[propertyKey] = function method(req: REQUEST, context?: unknown) {
          return handler(req, () => originalMethod.call(target, req, context) as unknown, ...args);
        };
      } else {
        throw new Error(`Unable to decorate: ${propertyKey} is not a function`);
      }
    };
  };
}

/* 
const xx = createDecorator((req, next, x: string, y: number) => next());

class S {
    @xx('xxx', 'xxx')
    static s = () => {
        console.log('s');
    }
}
*/
