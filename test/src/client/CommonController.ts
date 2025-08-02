import { headers } from 'next/headers.js';
import { HttpException, HttpStatus, JSONLinesResponse, type VovkRequest, get, post, prefix } from 'vovk';
import { NextResponse } from 'next/server.js';
import { NESTED_QUERY_EXAMPLE } from '../lib.ts';

@prefix('common')
export default class CommonController {
  @get.auto()
  static getHelloWorldResponseObject() {
    return NextResponse.json({ hello: 'world' });
  }

  @get.auto()
  static getHelloWorldObjectLiteral() {
    return { hello: 'world' };
  }

  @get.auto()
  static async getHelloWorldNextResponseObjectPromise() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return NextResponse.json({ hello: 'world' });
  }

  @get.auto()
  static async getHelloWorldRawResponseObjectPromise() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return Response.json({ hello: 'world' });
  }

  @get.auto()
  static async getHelloWorldObjectLiteralPromise() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { hello: 'world' };
  }

  @get.auto()
  static async getHelloWorldHeaders() {
    const headerList = await headers();
    const hello = headerList.get('x-test');
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

  @get('with-params/{hello}')
  static getWithParams(_req: VovkRequest, { hello }: { hello: 'world' }) {
    return { hello };
  }

  @post('with-all/{hello}')
  static async postWithAll(
    req: VovkRequest<{ isBody: true }, { simpleQueryParam: 'queryValue' }, { hello: 'world' }>,
    params: { hello: 'world' }
  ) {
    const body = await req.json();
    const simpleQueryParam = req.nextUrl.searchParams.get('simpleQueryParam');

    // check if forEach inferred properly
    req.nextUrl.searchParams.forEach((value, key) => {
      key satisfies 'simpleQueryParam';
      value satisfies 'queryValue';
    });

    // check if keys inferred properly
    req.nextUrl.searchParams.keys() satisfies IterableIterator<'simpleQueryParam'>;
    // check if values inferred properly
    req.nextUrl.searchParams.values() satisfies IterableIterator<'queryValue'>;

    return { params, body, query: { simpleQueryParam } };
  }

  @post('with-all-using-req-vovk')
  static async postWithBodyAndQueryUsingReqVovk(
    req: VovkRequest<
      { isBody: true },
      { simpleQueryParam: 'queryValue'; array1: readonly ['foo']; array2: readonly ['bar', 'baz'] }
    >
  ) {
    req.vovk.meta({ isMeta1: true });
    req.vovk.meta({ isMeta2: true });

    const body = await req.vovk.body();
    const query = req.vovk.query();
    const meta = req.vovk.meta<{ isMeta1: true; isMeta2: true }>();

    req.vovk.meta(null);

    const metaNulled = req.vovk.meta();

    return { body, query, meta, metaNulled };
  }

  @get('nested-query')
  static getNestedQuery(req: VovkRequest<undefined, typeof NESTED_QUERY_EXAMPLE>) {
    return { query: req.vovk.query(), search: decodeURIComponent(req.nextUrl.search) };
  }

  @post('form-data')
  static async postWithFormDataUsingReqVovk(req: VovkRequest<FormData>) {
    const formData = await req.vovk.form<{ field: 'value' }>();
    return formData;
  }

  @get('error')
  static getErrorResponse() {
    throw new HttpException(HttpStatus.BAD_REQUEST, 'This is an error', { theCause: 'This is the cause' });
  }

  @get('json-text')
  static getJsonTextResponse() {
    return new Response('{"hello": "world"}', {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  @get('jsonl')
  static getJsonlResponse() {
    return new Response('{"hello": "world1"}\n{"hello": "world2"}', {
      headers: {
        'Content-Type': 'application/jsonl',
      },
    }) as JSONLinesResponse<{
      hello: string;
    }>;
  }

  @get('jsonl-text')
  static getJsonlTextResponse() {
    return new Response('{"hello": "world1"}\n{"hello": "world2"}', {
      headers: {
        'Content-Type': 'text/plain',
      },
    }) as JSONLinesResponse<{
      hello: string;
    }>;
  }
}
