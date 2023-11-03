import { NextRequest } from 'next/server';
import { prefix, get, createDecorator } from '../../../src';

type EnhancedNextRequest = NextRequest & {
  simpleDecorator: string;
  niceDecorator: string;
};

function customDecorator<T>() {
  return function decorator(target: T, propertyKey: keyof T) {
    const originalMethod = target[propertyKey];

    if (typeof originalMethod === 'function') {
      target[propertyKey] = function (req: EnhancedNextRequest, context?: unknown) {
        req.simpleDecorator = 'hello';

        return originalMethod.call(target, req, context) as unknown;
      } as T[keyof T];
    }
  };
}

const niceCustomDecorator = createDecorator((req: EnhancedNextRequest, next, hello: string) => {
  req.niceDecorator = hello;
  return next();
});

@prefix('custom-decorator')
export default class CustomDecoratorController {
  @get()
  @customDecorator()
  static get(req: EnhancedNextRequest) {
    return { simpleDecorator: req.simpleDecorator };
  }

  @get('nice')
  @niceCustomDecorator('hello')
  static nice(req: EnhancedNextRequest) {
    return { niceDecorator: req.niceDecorator };
  }
}
