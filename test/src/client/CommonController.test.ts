import { CommonControllerRPC, CommonControllerDifferentFetcherRPC } from 'vovk-client';
import { CommonControllerRPC as SegmentClientCommonControllerRPC } from '../../other-compiled-test-sources/segmented-client/foo/client/index.ts';
import { CommonControllerRPC as BundleClientCommonControllerRPC } from '../../other-compiled-test-sources/bundle/index.mjs';
import {
  HttpStatus,
  type VovkBody,
  type VovkErrorResponse,
  type VovkQuery,
  type VovkReturnType,
  type VovkParams,
  type VovkHandlerSchema,
} from 'vovk';
import { it, describe } from 'node:test';
import { deepStrictEqual, ok } from 'node:assert';
import type CommonController from './CommonController.ts';
import { NESTED_QUERY_EXAMPLE } from '../lib.ts';

const apiRoot = 'http://localhost:' + process.env.PORT + '/api';

describe('Client with vovk-client', () => {
  it(`Should handle object literals`, async () => {
    const result = await CommonControllerRPC.getHelloWorldObjectLiteral({
      apiRoot,
    });
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it(`Should use segment client RPC`, async () => {
    const result = await SegmentClientCommonControllerRPC.getHelloWorldObjectLiteral({
      apiRoot,
    });
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it(`Should use bundle RPC`, async () => {
    const result = await BundleClientCommonControllerRPC.getHelloWorldObjectLiteral({
      apiRoot,
    });
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it(`Should handle requests that return NextResponse.json`, async () => {
    const result = await CommonControllerRPC.getHelloWorldResponseObject();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it(`Should handle requests that return NextResponse.json and are async`, async () => {
    const result = await CommonControllerRPC.getHelloWorldNextResponseObjectPromise();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it(`Should handle requests that return raw Response.json and response is recognised as unknown`, async () => {
    const result = await CommonControllerRPC.getHelloWorldRawResponseObjectPromise();
    deepStrictEqual(result satisfies unknown, { hello: 'world' });
  });

  it(`Should handle object literals and are async`, async () => {
    const result = await CommonControllerRPC.getHelloWorldObjectLiteralPromise();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it('Should transform response using "transform" option with requests that return NextResponse.json', async () => {
    const result = await CommonControllerRPC.getHelloWorldResponseObject({
      transform: (response) => ({ ...response, transform: true }),
    });
    deepStrictEqual(result satisfies { hello: string; transform: boolean }, { hello: 'world', transform: true });
  });

  it('Should transform response using "transform" option with requests that return object literals', async () => {
    const result = await CommonControllerRPC.getHelloWorldObjectLiteral({
      transform: (response) => ({ ...response, transform: true }),
    });
    deepStrictEqual(result satisfies { hello: string; transform: boolean }, { hello: 'world', transform: true });
  });

  it('Should override type with client method generic', async () => {
    const result = await CommonControllerRPC.getHelloWorldResponseObject<{ override: true }>();
    deepStrictEqual(result satisfies { override: true }, { hello: 'world' });
  });

  it('Should rethrow exceptions', async () => {
    try {
      await CommonControllerRPC.getErrorResponse();
    } catch (e) {
      const err = e as VovkErrorResponse;

      deepStrictEqual(err.statusCode, HttpStatus.BAD_REQUEST);
      deepStrictEqual(err.message, 'This is an error');
      deepStrictEqual(err.cause, { theCause: 'This is the cause' });
    }
  });

  it('Should transform response using "transform" option and override type with client method generic', async () => {
    const result = await CommonControllerRPC.getHelloWorldResponseObject<{ hello: string; transform: boolean }>({
      transform: (response) => ({ ...response, transform: true }),
    });
    deepStrictEqual(result satisfies { hello: string; transform: boolean }, { hello: 'world', transform: true });
  });

  it(`Should handle headers`, async () => {
    const result = await CommonControllerRPC.getHelloWorldHeaders({
      apiRoot,
      init: { headers: { 'x-vovk-test': 'world' } },
    });
    deepStrictEqual(result, { 'x-vovk-test': 'world' });
  });

  it.only(`Should handle headers and response transform and different fetcher`, async () => {
    const result = await CommonControllerDifferentFetcherRPC.getHelloWorldHeaders<
      VovkBody<typeof CommonController.getHelloWorldHeaders> & { fetcherExtraProperty: 'my-extra-value' }
    >({
      apiRoot,
      init: { headers: { 'x-vovk-test': 'world' } },
    });
    deepStrictEqual(result, {
      'x-vovk-test': 'world',
      'x-vovk-fetcher-header': 'my-header-value',
      fetcherExtraProperty: 'my-extra-value',
    });
  });

  it(`Should handle simple requests and return a normal array`, async () => {
    const result = await CommonControllerRPC.getHelloWorldArray({
      apiRoot,
      init: { headers: { 'x-vovk-test': 'world' } },
    });
    deepStrictEqual(result satisfies { hello: string }[], [{ hello: 'world' }]);
  });

  it(`Should handle simple requests and use empty generic`, async () => {
    const result = await CommonControllerRPC.getHelloWorldAndEmptyGeneric();
    deepStrictEqual(result satisfies { hello: string | null }, { hello: 'world' });
  });

  it(`Should handle simple requests with default options`, async () => {
    const result = await CommonControllerRPC.getHelloWorldObjectLiteralPromise();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it('Should handle requests with params', async () => {
    const result = await CommonControllerRPC.getWithParams({
      params: { hello: 'world' },
    });

    // @ts-expect-error Expect error
    null as unknown as VovkBody<typeof CommonControllerRPC.getWithParams> satisfies { hello: 'world' };
    null as unknown as VovkBody<typeof CommonControllerRPC.getWithParams> satisfies undefined;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<typeof CommonController.getWithParams> satisfies { hello: 'world' };
    null as unknown as VovkBody<typeof CommonController.getWithParams> satisfies unknown;

    // @ts-expect-error Expect error
    null as unknown as VovkQuery<typeof CommonControllerRPC.getWithParams> satisfies { hello: 'world' };
    null as unknown as VovkQuery<typeof CommonControllerRPC.getWithParams> satisfies undefined;

    // @ts-expect-error Expect error
    null as unknown as VovkQuery<typeof CommonController.getWithParams> satisfies { hello: 'world' };
    null as unknown as VovkQuery<typeof CommonController.getWithParams> satisfies unknown;

    null as unknown as VovkParams<typeof CommonControllerRPC.getWithParams> satisfies { hello: 'world' };
    // @ts-expect-error Expect error
    null as unknown as VovkParams<typeof CommonControllerRPC.getWithParams> satisfies { hello: 'foo' };
    null as unknown as VovkParams<typeof CommonControllerRPC.getWithParams> satisfies { hello: 'world' };

    null as unknown as VovkParams<typeof CommonController.getWithParams> satisfies { hello: 'world' };
    // @ts-expect-error Expect error
    null as unknown as VovkParams<typeof CommonController.getWithParams> satisfies { hello: 'foo' };

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });
  });

  it('Should handle requests with params, body and query', async () => {
    const result = await CommonControllerRPC.postWithAll({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue' },
    });

    // @ts-expect-error Expect error
    null as unknown as VovkBody<typeof CommonControllerRPC.postWithAll> satisfies { hello: 'foo' };

    // @ts-expect-error Expect error
    null as unknown as VovkQuery<typeof CommonControllerRPC.postWithAll> satisfies { query: 'bar' };

    // @ts-expect-error Expect error
    null as unknown as VovkBody<typeof CommonControllerRPC.postWithAll> satisfies { hello: 'baz' };

    deepStrictEqual(result satisfies VovkReturnType<typeof CommonControllerRPC.postWithAll>, {
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue' },
    });
  });

  it('Should store handler schema at handler.schema', async () => {
    deepStrictEqual(CommonControllerRPC.postWithAll.schema satisfies VovkHandlerSchema, {
      httpMethod: 'POST',
      path: 'with-all/{hello}',
    });
  });

  it('Should store controller schema at handler.controllerSchema', async () => {
    ok(CommonControllerRPC.postWithAll.controllerSchema.handlers);
  });

  it('Should store segment schema at handler.segmentSchema', async () => {
    ok(CommonControllerRPC.postWithAll.segmentSchema.segmentName);
  });

  it('Should store full schema at handler.fullSchema', async () => {
    ok(CommonControllerRPC.postWithAll.fullSchema.segments);
  });

  it('Should handle requests body, query and meta using of req.vovk object', async () => {
    const body = { isBody: true } as const;
    const query = { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] } as const;
    const result = await CommonControllerRPC.postWithBodyAndQueryUsingReqVovk({
      body,
      query,
      meta: { clientMeta: true },
    });

    null as unknown as VovkBody<typeof CommonControllerRPC.postWithBodyAndQueryUsingReqVovk> satisfies typeof body;

    null as unknown as VovkQuery<typeof CommonControllerRPC.postWithBodyAndQueryUsingReqVovk> satisfies typeof query;

    deepStrictEqual(result satisfies VovkReturnType<typeof CommonControllerRPC.postWithBodyAndQueryUsingReqVovk>, {
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', array1: ['foo'], array2: ['bar', 'baz'] },
      meta: { isMeta1: true, isMeta2: true, xMetaHeader: { clientMeta: true } },
      metaNulled: {},
    });
  });

  it('Should handle requests form data with using of req.vovk object', async () => {
    const body = new FormData();
    body.append('field', 'value');
    const result = await CommonControllerRPC.postWithFormDataUsingReqVovk({
      body,
    });

    deepStrictEqual(result satisfies VovkReturnType<typeof CommonControllerRPC.postWithFormDataUsingReqVovk>, {
      field: 'value',
    });
  });

  it('Should handle nested queries', async () => {
    const { query, search } = await CommonControllerRPC.getNestedQuery({ query: NESTED_QUERY_EXAMPLE });

    deepStrictEqual(
      query satisfies VovkReturnType<typeof CommonControllerRPC.getNestedQuery>['query'],
      NESTED_QUERY_EXAMPLE
    );

    deepStrictEqual(
      search,
      '?x=xx&y[0]=yy&y[1]=uu&z[f]=x&z[u][0]=uu&z[u][1]=xx&z[d][x]=ee&z[d][arrOfObjects][0][foo]=bar&z[d][arrOfObjects][0][nestedArr][0]=one&z[d][arrOfObjects][0][nestedArr][1]=two&z[d][arrOfObjects][0][nestedArr][2]=three&z[d][arrOfObjects][1][foo]=baz&z[d][arrOfObjects][1][nestedObj][deepKey]=deepValue'
    );
  });

  it('Handles JSONL response', async () => {
    const result = await CommonControllerRPC.getJsonlResponse({
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
    const result = await CommonControllerRPC.getJsonlTextResponse({
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
    const result = await CommonControllerRPC.getJsonTextResponse({
      apiRoot,
      interpretAs: 'application/json',
    });
    const expected = { hello: 'world' };
    deepStrictEqual(result, expected);
  });
});
