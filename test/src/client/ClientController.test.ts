// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { ClientController } from '../../.vovk/client';
import { VovkBody, VovkParams, VovkQuery, VovkReturnType } from 'vovk';
import { it, expect, describe } from '@jest/globals';

type ClientizedType = typeof ClientController;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

describe('Client with vovk-client', () => {
  it(`Should handle requests that return NextResponse.json`, async () => {
    const result = await ClientController.getHelloWorldResponseObject();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle object literals`, async () => {
    const result = await ClientController.getHelloWorldObjectLiteral({
      prefix,
    });
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle requests that return NextResponse.json and are async`, async () => {
    const result = await ClientController.getHelloWorldResponseObjectPromise();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle object literals and are async`, async () => {
    const result = await ClientController.getHelloWorldObjectLiteralPromise();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle headers`, async () => {
    const result = await ClientController.getHelloWorldHeaders({
      prefix,
      headers: { 'x-test': 'world' },
    });
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it(`Should handle simple requests and return a normal array`, async () => {
    const result = await ClientController.getHelloWorldArray({
      prefix,
      headers: { 'x-test': 'world' },
    });
    expect(result satisfies { hello: string }[]).toEqual([{ hello: 'world' }]);
  });

  it(`Should handle simple requests and use empty generic`, async () => {
    const result = await ClientController.getHelloWorldAndEmptyGeneric();
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it(`Should handle simple requests with default options`, async () => {
    const result = await ClientController.getHelloWorldObjectLiteralPromise();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params', async () => {
    const result = await ClientController.getWithParams({
      params: { hello: 'world' },
    });

    type Params = VovkParams<ClientizedType['getWithParams']>;

    null as unknown as VovkParams<ClientizedType['getWithParams']> satisfies Params;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientizedType['getWithParams']> satisfies { hello: 'world' };
    null as unknown as VovkBody<ClientizedType['getWithParams']> satisfies undefined;

    // @ts-expect-error Expect error
    null as unknown as VovkQuery<ClientizedType['getWithParams']> satisfies { hello: 'world' };
    null as unknown as VovkQuery<ClientizedType['getWithParams']> satisfies undefined;

    expect(result satisfies { hello: 'world' }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params, body and query', async () => {
    const result = await ClientController.postWithParams({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
    });

    type Body = VovkBody<ClientizedType['postWithParams']>;

    type Query = VovkQuery<ClientizedType['postWithParams']>;

    type Params = VovkParams<ClientizedType['postWithParams']>;

    null as unknown as VovkBody<ClientizedType['postWithParams']> satisfies Body;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientizedType['postWithParams']> satisfies { hello: 'foo' };

    null as unknown as VovkQuery<ClientizedType['postWithParams']> satisfies Query;
    // @ts-expect-error Expect error
    null as unknown as VovkQuery<ClientizedType['postWithParams']> satisfies { query: 'bar' };

    null as unknown as VovkParams<ClientizedType['postWithParams']> satisfies Params;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientizedType['postWithParams']> satisfies { hello: 'baz' };

    expect(result satisfies VovkReturnType<ClientizedType['postWithParams']>).toEqual({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
    });
  });
});
