import type { NextRequest } from 'next/server.js';
import { createDecorator, get, prefix } from 'vovk';

type EnhancedNextRequest = NextRequest & {
  hello: string;
};

export const customDecorator = createDecorator((req: EnhancedNextRequest, next, hello: string) => {
  req.hello = hello;
  return next();
});

@prefix('custom-decorator')
export default class CustomDecoratorController {
  @get()
  @customDecorator('world')
  static get(req: EnhancedNextRequest) {
    return { hello: req.hello };
  }

  // reversed order: custom decorator above the HTTP decorator
  @customDecorator('above')
  @get('above-http')
  static getWithDecoratorAbove(req: EnhancedNextRequest) {
    return { hello: req.hello };
  }
}
