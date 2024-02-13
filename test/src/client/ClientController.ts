import { headers } from 'next/headers';
import { VovkRequest, generateStaticAPI, get, post, prefix } from '../../../src';
import validateEquality from './validateEquality';
import vovkZod from 'vovk-zod';
import * as z from 'zod';

class Service {
  static getHello(hello: string) {
    return { hello };
  }
}

@prefix('client')
export default class ClientController {
  static controllerName = 'ClientController';

  static service = Service;

  @get.auto()
  static getHelloWorld() {
    const hello = headers().get('x-test');
    // additional check for the context
    if (this.service !== Service) throw new Error('Service is not the same');
    return this.service.getHello(hello!);
  }

  @get.auto()
  static getHelloWorldArray() {
    return [this.service.getHello('world')];
  }

  @get.auto()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getHelloWorldAndEmptyGeneric(_req: VovkRequest) {
    return this.service.getHello('world');
  }

  @get('with-params/:hello')
  static getWithParams(_req: VovkRequest<undefined>, { hello }: { hello: 'world' }) {
    return { hello };
  }

  @post('with-params/:hello')
  static async postWithParams(req: VovkRequest<{ isBody: true }, { query: 'queryValue' }>, params: { hello: 'world' }) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');
    return { params, body, query: { query } };
  }

  @post.auto()
  @validateEquality({ hello: 'body' }, { hey: 'query' })
  static async postWithEqualityValidation(req: VovkRequest<{ hello: string }, { hey: string }>) {
    const body = await req.json();
    const hey = req.nextUrl.searchParams.get('hey');
    return { body, query: { hey } };
  }

  @post.auto()
  @vovkZod(null, z.object({ hello: z.string() }))
  static async postFormData(req: VovkRequest<FormData, { hello: string }>) {
    const hello = req.nextUrl.searchParams.get('hello');
    const data = await req.formData();
    const formData = Object.fromEntries(data.entries());

    return { query: { hello }, formData };
  }

  @post.auto()
  @vovkZod(z.object({ hello: z.literal('body') }), z.object({ hey: z.literal('query') }))
  static async postWithZodValidation(req: VovkRequest<{ hello: string }, { hey: string }>) {
    const body = await req.json();
    const hey = req.nextUrl.searchParams.get('hey');
    return { body, query: { hey } };
  }

  @post('generate-static-api')
  static generateStaticAPI() {
    return generateStaticAPI({ ClientController });
  }

  @post('generate-static-api-custom-slug')
  static generateStaticAPIWithCustomSlug() {
    return generateStaticAPI({ ClientController }, 'custom');
  }
}
