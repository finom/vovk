import { headers } from 'next/headers';
import { VovkRequest, generateStaticAPI, get, post, prefix } from '../../../src';
import validateEquality from './validateEquality';
import vovkZod from 'vovk-zod';
import * as z from 'zod';
import { NextResponse } from 'next/server';
import customMetadata from './customMetadata';

@prefix('client')
export default class ClientController {
  @get.auto()
  static getHelloWorldResponseObject() {
    return NextResponse.json({ hello: 'world' });
  }

  @get.auto()
  static getHelloWorldObjectLiteral() {
    return { hello: 'world' };
  }

  @get.auto()
  static async getHelloWorldResponseObjectPromise() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return NextResponse.json({ hello: 'world' });
  }

  @get.auto()
  static async getHelloWorldObjectLiteralPromise() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { hello: 'world' };
  }

  @get.auto()
  static getHelloWorldHeaders() {
    const hello = headers().get('x-test');
    return { hello };
  }

  @get.auto()
  static getHelloWorldArray() {
    return [{ hello: 'world' }];
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

  // The endpoint itself is not tested, but modifies .vovk.json that in its turn is tested
  @get.auto()
  @customMetadata('world')
  static getWithCustomMetadata() {
    return null;
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
