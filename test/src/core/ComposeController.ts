import type { NextRequest } from 'next/server.js';
import { prefix, get, post, put, del, patch, head, options, compose, createDecorator, type VovkRequest } from 'vovk';

const customDecorator = createDecorator((req: NextRequest & { hello: string }, next, hello: string) => {
  req.hello = hello;
  return next();
});

@prefix('compose')
export default class ComposeController {
  static getMethod = compose(get(), async () => {
    return { method: 'get' };
  });

  static postMethod = compose(post(), async () => {
    return { method: 'post' };
  });

  static putMethod = compose(put(), async () => {
    return { method: 'put' };
  });

  static delMethod = compose(del(), async () => {
    return { method: 'del' };
  });

  static patchMethod = compose(patch(), async () => {
    return { method: 'patch' };
  });

  static headMethod = compose(head('', { headers: { 'x-head-header': 'head' } }), async () => {
    return {};
  });

  static optionsMethod = compose(options('', { headers: { 'x-options-header': 'options' } }), async () => {
    return {};
  });

  static getWithPath = compose(get('custom-path'), async () => {
    return { path: 'custom-path' };
  });

  static getWithHeader = compose(get('get-with-header', { headers: { 'x-decorator-header': 'hello' } }), async () => {
    return {};
  });

  static getWithCors = compose(get('get-with-cors', { cors: true }), async () => {
    return {};
  });

  static getWithBefore = compose(
    get('get-with-before', { before: (req) => req.vovk.meta({ before: true }) }),
    async (req: VovkRequest) => {
      return { before: req.vovk.meta<{ before: boolean }>().before };
    }
  );

  static getWithCustomDecorator = compose(
    get('get-with-custom-decorator'),
    customDecorator('world'),
    async (req: NextRequest & { hello: string }) => {
      return { hello: req.hello };
    }
  );
}
