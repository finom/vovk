import { NextRequest } from 'next/server';
import { prefix, get } from '../../../../src';

type EnhancedNextRequest = NextRequest & { helloCustomProperty: string };

function customDecorator<T>() {
  return function decorator(target: T, propertyKey: keyof T) {
    const originalMethod = target[propertyKey];

    if (typeof originalMethod === 'function') {
      target[propertyKey] = function (req: EnhancedNextRequest, context?: unknown) {
        req.helloCustomProperty = 'world';

        return originalMethod.call(target, req, context) as unknown;
      } as T[keyof T];
    }
  };
}

@prefix('custom-decorator')
export default class CustomDecoratorController {
  @get()
  @customDecorator()
  static get(req: EnhancedNextRequest) {
    return { helloCustomProperty: req.helloCustomProperty };
  }
}
