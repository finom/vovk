import type { NextRequest } from 'next/server.js';
import { createDecorator, del, get, head, options, patch, post, prefix, put, type VovkRequest } from 'vovk';

const customDecorator = createDecorator((req: NextRequest & { hello: string }, next, hello: string) => {
  req.hello = hello;
  return next();
});

@prefix('decorate')
class DecorateController {
  @get()
  static async getMethod() {
    return { method: 'get' };
  }

  @post()
  static async postMethod() {
    return { method: 'post' };
  }

  @put()
  static async putMethod() {
    return { method: 'put' };
  }

  @del()
  static async delMethod() {
    return { method: 'del' };
  }

  @patch()
  static async patchMethod() {
    return { method: 'patch' };
  }

  @head('', { headers: { 'x-head-header': 'head' } })
  static async headMethod() {
    return {};
  }

  @options('', { headers: { 'x-options-header': 'options' } })
  static async optionsMethod() {
    return {};
  }

  @get('custom-path')
  static async getWithPath() {
    return { path: 'custom-path' };
  }

  @get('get-with-header', { headers: { 'x-decorator-header': 'hello' } })
  static async getWithHeader() {
    return {};
  }

  @get('get-with-cors', { cors: true })
  static async getWithCors() {
    return {};
  }

  @get('get-with-before', { before: (req) => req.vovk.meta({ before: true }) })
  static async getWithBefore(req: VovkRequest) {
    return { before: req.vovk.meta<{ before: boolean }>().before };
  }

  @get('get-with-custom-decorator')
  @customDecorator('world')
  static async getWithCustomDecorator(req: NextRequest & { hello: string }) {
    return { hello: req.hello };
  }
}

export default DecorateController;
