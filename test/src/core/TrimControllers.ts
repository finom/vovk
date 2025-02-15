import { NextRequest } from 'next/server';
import { prefix, get } from 'vovk';
import { StaticClass } from 'vovk/dist/types';

const prefixes = ['trim-prefix-1', '/trim-prefix-2', 'trim-prefix-3/', '/trim-prefix-4/'];
const endpoints = ['trim-endpoint-1', '/trim-endpoint-2', 'trim-endpoint-3/', '/trim-endpoint-4/'];

const controllers: Record<string, StaticClass> = {};

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

  controllers['TrimController' + p] = TrimController;
}

export default controllers;
