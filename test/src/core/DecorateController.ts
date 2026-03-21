import type { NextRequest } from 'next/server.js';
import {
  get,
  post,
  put,
  del,
  patch,
  head,
  options,
  decorate,
  createDecorator,
  type VovkRequest,
} from 'vovk';

const customDecorator = createDecorator((req: NextRequest & { hello: string }, next, hello: string) => {
  req.hello = hello;
  return next();
});

class DecorateController {
  static prefix = 'decorate';

  static getMethod = decorate(get()).handle(async () => {
    return { method: 'get' };
  });

  static postMethod = decorate(post()).handle(async () => {
    return { method: 'post' };
  });

  static putMethod = decorate(put()).handle(async () => {
    return { method: 'put' };
  });

  static delMethod = decorate(del()).handle(async () => {
    return { method: 'del' };
  });

  static patchMethod = decorate(patch()).handle(async () => {
    return { method: 'patch' };
  });

  static headMethod = decorate(head('', { headers: { 'x-head-header': 'head' } })).handle(async () => {
    return {};
  });

  static optionsMethod = decorate(options('', { headers: { 'x-options-header': 'options' } })).handle(async () => {
    return {};
  });

  static getWithPath = decorate(get('custom-path')).handle(async () => {
    return { path: 'custom-path' };
  });

  static getWithHeader = decorate(get('get-with-header', { headers: { 'x-decorator-header': 'hello' } })).handle(
    async () => {
      return {};
    }
  );

  static getWithCors = decorate(get('get-with-cors', { cors: true })).handle(async () => {
    return {};
  });

  static getWithBefore = decorate(get('get-with-before', { before: (req) => req.vovk.meta({ before: true }) })).handle(
    async (req: VovkRequest) => {
      return { before: req.vovk.meta<{ before: boolean }>().before };
    }
  );

  static getWithCustomDecorator = decorate(get('get-with-custom-decorator'), customDecorator('world')).handle(
    async (req: NextRequest & { hello: string }) => {
      return { hello: req.hello };
    }
  );
}

export default DecorateController;
