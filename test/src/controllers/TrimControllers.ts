import { NextRequest } from 'next/server';
import { prefix, get } from '../../../src';

export const prefixes = ['trim-prefix-1', '/trim-prefix-2', 'trim-prefix-3/', '/trim-prefix-4/'];
export const endpoints = ['trim-endpoint-1', '/trim-endpoint-2', 'trim-endpoint-3/', '/trim-endpoint-4/'];

// eslint-disable-next-line @typescript-eslint/ban-types
const controllers: Function[] = [];

for (const p of prefixes) {
  @prefix(p)
  class TrimController {
    @get()
    static noPath(req: NextRequest) {
      return { reqUrl: req.url };
    }

    @get(endpoints[0])
    static trimPath1(req: NextRequest) {
      return { reqUrl: req.url };
    }

    @get(endpoints[1])
    static trimPath2(req: NextRequest) {
      return { reqUrl: req.url };
    }

    @get(endpoints[2])
    static trimPath3(req: NextRequest) {
      return { reqUrl: req.url };
    }

    @get(endpoints[3])
    static trimPath4(req: NextRequest) {
      return { reqUrl: req.url };
    }
  }

  controllers.push(TrimController);
}

export default controllers;
