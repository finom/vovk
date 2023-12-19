import { headers } from 'next/headers';
import { VovkRequest, get, post, prefix } from '../../../src';
import validateEquality from './validateEquality';
import vovkZod from 'vovk-zod';
import * as z from 'zod';

@prefix('client')
export default class ClientController {
  static controllerName = 'ClientController';

  @get.auto()
  static getHelloWorld() {
    const world = headers().get('x-test');
    return { hello: world };
  }

  @get.auto()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getHelloWorldAndEmptyGeneric(_req: VovkRequest) {
    return { hello: 'world' };
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
  @vovkZod(null, z.object({ hello: z.string() })) // eslint-disable-line @typescript-eslint/no-unsafe-call
  static async postFormData(req: VovkRequest<FormData, { hello: string }>) {
    const hello = req.nextUrl.searchParams.get('hello');
    const data = await req.formData();
    const formData = Object.fromEntries(data.entries());

    return { query: { hello }, formData };
  }

  @post.auto()
  @vovkZod(z.object({ hello: z.literal('body') }), z.object({ hey: z.literal('query') })) // eslint-disable-line @typescript-eslint/no-unsafe-call
  static async postWithZodValidationAndEqualityValidation(req: VovkRequest<{ hello: string }, { hey: string }>) {
    const body = await req.json();
    const hey = req.nextUrl.searchParams.get('hey');
    return { body, query: { hey } };
  }
}
