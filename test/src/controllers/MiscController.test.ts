import { it, expect, describe } from '@jest/globals';
import MiscController from './MiscController';
import { SmoothieController } from '../../../src/types';
import { NextRequest } from 'next/server';
import { createDecorator, get } from '../../../src';

describe('Hidden features', () => {
  it(`Metadata`, () => {
    expect((MiscController as unknown as SmoothieController)._metadata).toHaveProperty(`getMethod`);
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
  });
});
