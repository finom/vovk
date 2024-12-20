import { headers } from 'next/headers';
import { HttpException, HttpStatus, VovkRequest, get, post, prefix } from 'vovk';
import { NextResponse } from 'next/server';

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

  @get('with-params/:hello')
  static getWithParams(_req: VovkRequest<undefined>, { hello }: { hello: 'world' }) {
    return { hello };
  }

  @post('with-all/:hello')
  static async postWithAll(
    req: VovkRequest<{ isBody: true }, { simpleQueryParam: 'queryValue'; array1: 'foo'[]; array2: ('bar' | 'baz')[] }>,
    params: { hello: 'world' }
  ) {
    const body = await req.json();
    const simpleQueryParam = req.nextUrl.searchParams.get('simpleQueryParam');
    // check if get always inferred as a single item
    req.nextUrl.searchParams.get('array1') satisfies 'foo';
    // check if getAll always inferred as an array
    req.nextUrl.searchParams.getAll('simpleQueryParam') satisfies 'queryValue'[];
    // check if entries inferred properly
    req.nextUrl.searchParams.entries() satisfies IterableIterator<
      ['simpleQueryParam' | 'array1' | 'array2', 'queryValue' | 'foo'[] | ('bar' | 'baz')[]]
    >;
    // check if forEach inferred properly
    req.nextUrl.searchParams.forEach((value, key) => {
      key satisfies 'simpleQueryParam' | 'array1' | 'array2';
      value satisfies 'queryValue' | 'foo'[] | ('bar' | 'baz')[];
    });

    // check if keys inferred properly
    req.nextUrl.searchParams.keys() satisfies IterableIterator<'simpleQueryParam' | 'array1' | 'array2'>;
    // check if values inferred properly
    req.nextUrl.searchParams.values() satisfies IterableIterator<'queryValue' | 'foo'[] | ('bar' | 'baz')[]>;

    const array1 = req.nextUrl.searchParams.getAll('array1');
    const array2 = req.nextUrl.searchParams.getAll('array2');
    return { params, body, query: { simpleQueryParam, array1, array2 } };
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

  @post('form-data')
  static async postWithFormDataUsingReqVovk(req: VovkRequest<FormData>) {
    const formData = await req.vovk.form<{ field: 'value' }>();
    return formData;
  }

  @get('error')
  static getErrorResponse() {
    throw new HttpException(HttpStatus.BAD_REQUEST, 'This is an error', { theCause: 'This is the cause' });
  }
}
