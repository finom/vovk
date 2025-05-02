import { ClientControllerRPC } from '../generated-segment-client/foo/client/index.ts';
import {
  HttpStatus,
  type VovkBody,
  type VovkErrorResponse,
  type VovkParams,
  type VovkQuery,
  type VovkReturnType,
  type VovkControllerBody,
  type VovkControllerParams,
  type VovkControllerQuery,
  type VovkHandlerSchema,
} from 'vovk';
import { it, describe } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import type ClientController from './ClientController';
import { NESTED_QUERY_EXAMPLE } from '../lib.ts';

const apiRoot = 'http://localhost:' + process.env.PORT + '/api';

describe.only('Client with vovk-client', () => {
  it(`Should handle requests that return NextResponse.json`, async () => {
    const result = await ClientControllerRPC.getHelloWorldResponseObject();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it(`Should handle object literals`, async () => {
    const result = await ClientControllerRPC.getHelloWorldObjectLiteral({
      apiRoot,
    });
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it(`Should handle requests that return NextResponse.json and are async`, async () => {
    const result = await ClientControllerRPC.getHelloWorldNextResponseObjectPromise();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it(`Should handle requests that return raw Response.json and response is recognised as unknown`, async () => {
    const result = await ClientControllerRPC.getHelloWorldRawResponseObjectPromise();
    deepStrictEqual(result satisfies unknown, { hello: 'world' });
  });

  it(`Should handle object literals and are async`, async () => {
    const result = await ClientControllerRPC.getHelloWorldObjectLiteralPromise();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it('Should transform response using "transform" option with requests that return NextResponse.json', async () => {
    const result = await ClientControllerRPC.getHelloWorldResponseObject({
      transform: (response) => ({ ...response, transform: true }),
    });
    deepStrictEqual(result satisfies { hello: string; transform: boolean }, { hello: 'world', transform: true });
  });

  it('Should transform response using "transform" option with requests that return object literals', async () => {
    const result = await ClientControllerRPC.getHelloWorldObjectLiteral({
      transform: (response) => ({ ...response, transform: true }),
    });
    deepStrictEqual(result satisfies { hello: string; transform: boolean }, { hello: 'world', transform: true });
  });

  it('Should override type with client method generic', async () => {
    const result = await ClientControllerRPC.getHelloWorldResponseObject<{ override: true }>();
    deepStrictEqual(result satisfies { override: true }, { hello: 'world' });
  });

  it('Should rethrow exceptions', async () => {
    try {
      await ClientControllerRPC.getErrorResponse();
    } catch (e) {
      const err = e as VovkErrorResponse;

      deepStrictEqual(err.statusCode, HttpStatus.BAD_REQUEST);
      deepStrictEqual(err.message, 'This is an error');
      deepStrictEqual(err.cause, { theCause: 'This is the cause' });
    }
  });

  it('Should transform response using "transform" option and override type with client method generic', async () => {
    const result = await ClientControllerRPC.getHelloWorldResponseObject<{ hello: string; transform: boolean }>({
      transform: (response) => ({ ...response, transform: true }),
    });
    deepStrictEqual(result satisfies { hello: string; transform: boolean }, { hello: 'world', transform: true });
  });

  it(`Should handle headers`, async () => {
    const result = await ClientControllerRPC.getHelloWorldHeaders({
      apiRoot,
      init: { headers: { 'x-test': 'world' } },
    });
    deepStrictEqual(result satisfies { hello: string | null }, { hello: 'world' });
  });

  it(`Should handle simple requests and return a normal array`, async () => {
    const result = await ClientControllerRPC.getHelloWorldArray({
      apiRoot,
      init: { headers: { 'x-test': 'world' } },
    });
    deepStrictEqual(result satisfies { hello: string }[], [{ hello: 'world' }]);
  });

  it(`Should handle simple requests and use empty generic`, async () => {
    const result = await ClientControllerRPC.getHelloWorldAndEmptyGeneric();
    deepStrictEqual(result satisfies { hello: string | null }, { hello: 'world' });
  });

  it(`Should handle simple requests with default options`, async () => {
    const result = await ClientControllerRPC.getHelloWorldObjectLiteralPromise();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
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

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });
  });

  it('Should handle requests with params, body and query', async () => {
    const result = await ClientControllerRPC.postWithAll({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue' },
    });

    // @ts-expect-error Expect error
    null as unknown as VovkBody<typeof ClientControllerRPC.postWithAll> satisfies { hello: 'foo' };

    // @ts-expect-error Expect error
    null as unknown as VovkQuery<typeof ClientControllerRPC.postWithAll> satisfies { query: 'bar' };

    // @ts-expect-error Expect error
    null as unknown as VovkBody<typeof ClientControllerRPC.postWithAll> satisfies { hello: 'baz' };

    deepStrictEqual(result satisfies VovkReturnType<typeof ClientControllerRPC.postWithAll>, {
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue' },
    });
  });

  it('Should store schema at handler.schema', async () => {
    deepStrictEqual(ClientControllerRPC.postWithAll.schema satisfies VovkHandlerSchema, {
      httpMethod: 'POST',
      path: 'with-all/:hello',
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

    deepStrictEqual(result satisfies VovkReturnType<typeof ClientControllerRPC.postWithBodyAndQueryUsingReqVovk>, {
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

    deepStrictEqual(result satisfies VovkReturnType<typeof ClientControllerRPC.postWithFormDataUsingReqVovk>, {
      field: 'value',
    });
  });

  it('Should handle nested queries', async () => {
    const { query, search } = await ClientControllerRPC.getNestedQuery({ query: NESTED_QUERY_EXAMPLE });

    deepStrictEqual(
      query satisfies VovkReturnType<typeof ClientControllerRPC.getNestedQuery>['query'],
      NESTED_QUERY_EXAMPLE
    );

    deepStrictEqual(
      search,
      '?x=xx&y[0]=yy&y[1]=uu&z[f]=x&z[u][0]=uu&z[u][1]=xx&z[d][x]=ee&z[d][arrOfObjects][0][foo]=bar&z[d][arrOfObjects][0][nestedArr][0]=one&z[d][arrOfObjects][0][nestedArr][1]=two&z[d][arrOfObjects][0][nestedArr][2]=three&z[d][arrOfObjects][1][foo]=baz&z[d][arrOfObjects][1][nestedObj][deepKey]=deepValue'
    );
  });

  it('Should accept custom fetcher as an option', async () => {
    const result = await ClientControllerRPC.postWithBodyAndQueryUsingReqVovk({
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] },
      fetcher: ({ name }, { query, body }) => ({ customFetcher: true, name, query, body }),
    });

    deepStrictEqual(result, {
      customFetcher: true,
      name: 'postWithBodyAndQueryUsingReqVovk',
      query: { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] },
      body: { isBody: true },
    });
  });

  it('Handles JSONL response', async () => {
    const result = await ClientControllerRPC.getJsonlResponse({
      apiRoot,
    });
    const expected = [{ hello: 'world1' }, { hello: 'world2' }];
    const received: { hello: string }[] = [];
    for await (const item of result) {
      received.push(item);
    }
    deepStrictEqual(received, expected);
  });

  it('Uses interpretAs=application/jsonl', async () => {
    const result = await ClientControllerRPC.getJsonlTextResponse({
      apiRoot,
      interpretAs: 'application/jsonl',
    });
    const expected = [{ hello: 'world1' }, { hello: 'world2' }];
    const received: { hello: string }[] = [];
    for await (const item of result) {
      received.push(item);
    }
    deepStrictEqual(received, expected);
  });

  it('Uses interpretAs=application/json', async () => {
    const result = await ClientControllerRPC.getJsonTextResponse({
      apiRoot,
      interpretAs: 'application/json',
    });
    const expected = { hello: 'world' };
    deepStrictEqual(result, expected);
  });
});
