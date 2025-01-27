import { it, expect, describe } from '@jest/globals';
import MiscController from './MiscController';
import { type VovkControllerSchema } from '../../../packages/vovk';
import { NextRequest } from 'next/server';
import { createDecorator, get } from '../../../packages/vovk';

describe('Hidden features', () => {
  it(`Schema`, () => {
    expect((MiscController as unknown as { _handlers: VovkControllerSchema['handlers'] })._handlers).toHaveProperty(
      `getMethod`
    );
  });

  it('Method preserves name and controller properties', () => {
    type EnhancedNextRequest = NextRequest & {
      foo?: string;
      bar?: string;
    };

    const customDecorator1 = createDecorator((req: EnhancedNextRequest, next, hello: string) => {
      req.foo = hello;
      return next();
    });

    const customDecorator2 = createDecorator((req: EnhancedNextRequest, next, hello: string) => {
      req.bar = hello;
      return next();
    });

    class MyController {
      @get()
      @customDecorator1('foo')
      @customDecorator2('bar')
      static myMethod() {
        return {};
      }
    }

    expect(MyController.myMethod.name).toBe('myMethod');
    expect((MyController.myMethod as unknown as { _controller: MyController })._controller).toBe(MyController);
    // expect((MyController.myMethod as unknown as { _name: string })._name).toBe('myMethod');
  });

  it('Controller has all the hidden properties', () => {
    const validationDecorator = createDecorator(
      (_req: NextRequest, next) => next(),
      (helloBody: 'helloBody', helloQuery: 'helloQuery') => {
        return {
          validation: {
            body: { iAmABodyValidator: helloBody },
            query: { iAmAQueryValidator: helloQuery },
          },
        };
      }
    );

    class MyController {
      @get()
      @validationDecorator('helloBody', 'helloQuery')
      static myMethod() {
        return {};
      }
    }

    expect((MyController as unknown as { _handlers: VovkControllerSchema['handlers'] })._handlers).toHaveProperty(
      'myMethod'
    );

    expect(
      (MyController as unknown as { _handlers: VovkControllerSchema['handlers'] })._handlers?.myMethod.validation?.body
    ).toEqual({
      iAmABodyValidator: 'helloBody',
    });

    expect(
      (MyController as unknown as { _handlers: VovkControllerSchema['handlers'] })._handlers?.myMethod.validation?.query
    ).toEqual({
      iAmAQueryValidator: 'helloQuery',
    });
  });
});
