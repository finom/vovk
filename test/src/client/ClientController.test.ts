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
    const result = await ClientController.postWithAll({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
    });

    type Body = VovkBody<ClientizedType['postWithAll']>;

    type Query = VovkQuery<ClientizedType['postWithAll']>;

    null as unknown as VovkBody<ClientizedType['postWithAll']> satisfies Body;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientizedType['postWithAll']> satisfies { hello: 'foo' };

    null as unknown as VovkQuery<ClientizedType['postWithAll']> satisfies Query;
    // @ts-expect-error Expect error
    null as unknown as VovkQuery<ClientizedType['postWithAll']> satisfies { query: 'bar' };

    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientizedType['postWithAll']> satisfies { hello: 'baz' };

    expect(result satisfies VovkReturnType<ClientizedType['postWithAll']>).toEqual({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
    });
  });

  it('Should handle requests body and query with using of req.vovk object', async () => {
    const result = await ClientController.postWithBodyAndQueryUsingReqVovk({
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
    });

    type Body = VovkBody<ClientizedType['postWithBodyAndQueryUsingReqVovk']>;

    type Query = VovkQuery<ClientizedType['postWithBodyAndQueryUsingReqVovk']>;

    null as unknown as VovkBody<ClientizedType['postWithBodyAndQueryUsingReqVovk']> satisfies Body;

    null as unknown as VovkQuery<ClientizedType['postWithBodyAndQueryUsingReqVovk']> satisfies Query;

    expect(result satisfies VovkReturnType<ClientizedType['postWithBodyAndQueryUsingReqVovk']>).toEqual({
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
      meta: { isMeta1: true, isMeta2: true },
      metaNulled: {},
    });
  });

  it('Should accept custom fetcher as an option', async () => {
    const result = await ClientController.postWithBodyAndQueryUsingReqVovk({
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
      fetcher: ({ name }, { query, body }) => ({ customFetcher: true, name, query, body }),
    });

    expect(result).toEqual({
      customFetcher: true,
      name: 'postWithBodyAndQueryUsingReqVovk',
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
      body: { isBody: true },
    });
  });
});
