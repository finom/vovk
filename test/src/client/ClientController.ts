import { headers } from 'next/headers';
import { VovkRequest, get, post, prefix } from 'vovk';
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

  @post('with-all/:hello')
  static async postWithAll(
    req: VovkRequest<{ isBody: true }, { simpleQueryParam: 'queryValue'; arrayQueryParam: ('foo' | 'bar')[] }>,
    params: { hello: 'world' }
  ) {
    const body = await req.json();
    const simpleQueryParam = req.nextUrl.searchParams.get('simpleQueryParam');
    // check if get always inferred as a single item
    req.nextUrl.searchParams.get('arrayQueryParam') satisfies 'foo' | 'bar';
    // check if getAll always inferred as an array
    req.nextUrl.searchParams.getAll('simpleQueryParam') satisfies 'queryValue'[];
    // check if entries inferred properly
    req.nextUrl.searchParams.entries() satisfies IterableIterator<
      ['simpleQueryParam' | 'arrayQueryParam', 'queryValue' | ('foo' | 'bar')[]]
    >;
    // check if forEach inferred properly
    req.nextUrl.searchParams.forEach((value, key) => {
      key satisfies 'simpleQueryParam' | 'arrayQueryParam';
      value satisfies 'queryValue' | ('foo' | 'bar')[];
    });

    // check if keys inferred properly
    req.nextUrl.searchParams.keys() satisfies IterableIterator<'simpleQueryParam' | 'arrayQueryParam'>;
    // check if values inferred properly
    req.nextUrl.searchParams.values() satisfies IterableIterator<'queryValue' | ('foo' | 'bar')[]>;

    const arrayQueryParam = req.nextUrl.searchParams.getAll('arrayQueryParam');
    return { params, body, query: { simpleQueryParam, arrayQueryParam } };
  }

  @post('with-all-using-req-vovk')
  static async postWithBodyAndQueryUsingReqVovk(
    req: VovkRequest<{ isBody: true }, { simpleQueryParam: 'queryValue'; arrayQueryParam: ('foo' | 'bar')[] }>
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
}
