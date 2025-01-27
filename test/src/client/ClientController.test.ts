import { ClientControllerRPC } from 'vovk-client';
import type ClientController from './ClientController';
import {
  HttpStatus,
  type VovkBody,
  type VovkErrorResponse,
  type VovkParams,
  type VovkQuery,
  type VovkReturnType,
} from '../../../packages/vovk';
import { it, expect, describe } from '@jest/globals';
import { VovkControllerBody, VovkControllerParams, VovkControllerQuery } from '../../../packages/vovk';

const apiRoot = 'http://localhost:' + process.env.PORT + '/api';

describe('Client with vovk-client', () => {
  it(`Should handle requests that return NextResponse.json`, async () => {
    const result = await ClientControllerRPC.getHelloWorldResponseObject();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle object literals`, async () => {
    const result = await ClientControllerRPC.getHelloWorldObjectLiteral({
      apiRoot,
    });
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle requests that return NextResponse.json and are async`, async () => {
    const result = await ClientControllerRPC.getHelloWorldNextResponseObjectPromise();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle requests that return raw Response.json and response is recognised as unknown`, async () => {
    const result = await ClientControllerRPC.getHelloWorldRawResponseObjectPromise();
    expect(result satisfies unknown).toEqual({ hello: 'world' });
  });

  it(`Should handle object literals and are async`, async () => {
    const result = await ClientControllerRPC.getHelloWorldObjectLiteralPromise();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it('Should transform response using "transform" option with requests that return NextResponse.json', async () => {
    const result = await ClientControllerRPC.getHelloWorldResponseObject({
      transform: (response) => ({ ...response, transform: true }),
    });
    expect(result satisfies { hello: string; transform: boolean }).toEqual({ hello: 'world', transform: true });
  });

  it('Should transform response using "transform" option with requests that return object literals', async () => {
    const result = await ClientControllerRPC.getHelloWorldObjectLiteral({
      transform: (response) => ({ ...response, transform: true }),
    });
    expect(result satisfies { hello: string; transform: boolean }).toEqual({ hello: 'world', transform: true });
  });

  it('Should override type with client method generic', async () => {
    const result = await ClientControllerRPC.getHelloWorldResponseObject<{ override: true }>();
    expect(result satisfies { override: true }).toEqual({ hello: 'world' });
  });

  it('Should rethrow exceptions', async () => {
    try {
      await ClientControllerRPC.getErrorResponse();
    } catch (e) {
      const err = e as VovkErrorResponse;

      expect(err.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(err.message).toEqual('This is an error');
      expect(err.cause).toEqual({ theCause: 'This is the cause' });
    }
  });

  it('Should transform response using "transform" option and override type with client method generic', async () => {
    const result = await ClientControllerRPC.getHelloWorldResponseObject<{ hello: string; transform: boolean }>({
      transform: (response) => ({ ...response, transform: true }),
    });
    expect(result satisfies { hello: string; transform: boolean }).toEqual({ hello: 'world', transform: true });
  });

  it(`Should handle headers`, async () => {
    const result = await ClientControllerRPC.getHelloWorldHeaders({
      apiRoot,
      headers: { 'x-test': 'world' },
    });
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it(`Should handle simple requests and return a normal array`, async () => {
    const result = await ClientControllerRPC.getHelloWorldArray({
      apiRoot,
      headers: { 'x-test': 'world' },
    });
    expect(result satisfies { hello: string }[]).toEqual([{ hello: 'world' }]);
  });

  it(`Should handle simple requests and use empty generic`, async () => {
    const result = await ClientControllerRPC.getHelloWorldAndEmptyGeneric();
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it(`Should handle simple requests with default options`, async () => {
    const result = await ClientControllerRPC.getHelloWorldObjectLiteralPromise();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params', async () => {
    const result = await ClientControllerRPC.getWithParams({
      params: { hello: 'world' },
    });
    // @ts-expect-error Expect error
    null as unknown as VovkBody<typeof ClientControllerRPC.getWithParams> satisfies { hello: 'world' };
    null as unknown as VovkBody<typeof ClientControllerRPC.getWithParams> satisfies undefined;

    // @ts-expect-error Expect error
    null as unknown as VovkControllerBody<typeof ClientController.getWithParams> satisfies { hello: 'world' };
    null as unknown as VovkControllerBody<typeof ClientController.getWithParams> satisfies undefined;

    // @ts-expect-error Expect error
    null as unknown as VovkQuery<typeof ClientControllerRPC.getWithParams> satisfies { hello: 'world' };
    null as unknown as VovkQuery<typeof ClientControllerRPC.getWithParams> satisfies undefined;

    // @ts-expect-error Expect error
    null as unknown as VovkControllerQuery<typeof ClientController.getWithParams> satisfies { hello: 'world' };
    null as unknown as VovkControllerQuery<typeof ClientController.getWithParams> satisfies undefined;

    null as unknown as VovkParams<typeof ClientControllerRPC.getWithParams> satisfies { hello: 'world' };
    // @ts-expect-error Expect error
    null as unknown as VovkParams<typeof ClientControllerRPC.getWithParams> satisfies { hello: 'foo' };
    null as unknown as VovkParams<typeof ClientControllerRPC.getWithParams> satisfies { hello: 'world' };

    null as unknown as VovkControllerParams<typeof ClientController.getWithParams> satisfies { hello: 'world' };
    // @ts-expect-error Expect error
    null as unknown as VovkControllerParams<typeof ClientController.getWithParams> satisfies { hello: 'foo' };

    expect(result satisfies { hello: 'world' }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params, body and query', async () => {
    const result = await ClientControllerRPC.postWithAll({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] },
    });

    // @ts-expect-error Expect error
    null as unknown as VovkBody<typeof ClientControllerRPC.postWithAll> satisfies { hello: 'foo' };

    // @ts-expect-error Expect error
    null as unknown as VovkQuery<typeof ClientControllerRPC.postWithAll> satisfies { query: 'bar' };

    // @ts-expect-error Expect error
    null as unknown as VovkBody<typeof ClientControllerRPC.postWithAll> satisfies { hello: 'baz' };

    expect(result satisfies VovkReturnType<typeof ClientControllerRPC.postWithAll>).toEqual({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] },
    });
  });

  it('Should handle requests body and query with using of req.vovk object', async () => {
    const body = { isBody: true } as const;
    const query = { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] } as const;
    const result = await ClientControllerRPC.postWithBodyAndQueryUsingReqVovk({
      body,
      query,
    });

    null as unknown as VovkBody<typeof ClientControllerRPC.postWithBodyAndQueryUsingReqVovk> satisfies typeof body;

    null as unknown as VovkQuery<typeof ClientControllerRPC.postWithBodyAndQueryUsingReqVovk> satisfies typeof query;

    expect(result satisfies VovkReturnType<typeof ClientControllerRPC.postWithBodyAndQueryUsingReqVovk>).toEqual({
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] },
      meta: { isMeta1: true, isMeta2: true },
      metaNulled: {},
    });
  });

  it('Should handle requests form data with using of req.vovk object', async () => {
    const body = new FormData();
    body.append('field', 'value');
    const result = await ClientControllerRPC.postWithFormDataUsingReqVovk({
      body,
    });

    expect(result satisfies VovkReturnType<typeof ClientControllerRPC.postWithFormDataUsingReqVovk>).toEqual({
      field: 'value',
    });
  });

  it('Should accept custom fetcher as an option', async () => {
    const result = await ClientControllerRPC.postWithBodyAndQueryUsingReqVovk({
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] },
      fetcher: ({ name }, { query, body }) => ({ customFetcher: true, name, query, body }),
    });

    expect(result).toEqual({
      customFetcher: true,
      name: 'postWithBodyAndQueryUsingReqVovk',
      query: { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] },
      body: { isBody: true },
    });
  });
});
