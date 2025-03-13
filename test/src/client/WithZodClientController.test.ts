import { it, describe } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { WithZodClientControllerRPC } from 'vovk-client';
import { validateOnClient as validateOnClientAjv } from 'vovk-ajv';
import {
  HttpException,
  type VovkReturnType,
  type VovkHandlerSchema,
  type VovkControllerYieldType,
  type VovkYieldType,
  type VovkControllerOutput,
} from 'vovk';
import type WithZodClientController from './WithZodClientController';
import { expectPromise, NESTED_QUERY_EXAMPLE } from '../lib.ts';

/*
Only body,
  - Server
  - Client
    - For DTO: JSON Schema
Only query,
  - Server
  - Client
    - For DTO: JSON Schema
Nested Query
  - Server
  - Client
    - For DTO: JSON Schema
Only params,
  - Server
  - Client
    - For DTO: JSON Schema
Only output,
  - Server
Streaming
All (just OK) DONE
handler.schema for All, use @openapi and @openapi.error
*/

describe('Client validation with custon AJV options', () => {
  it('Should handle body validation on client with localize and options', async () => {
    const result = await WithZodClientControllerRPC.handleBody({
      body: { hello: 'world' },
    });

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleBody({
        body: {
          hello: 'wrong' as 'world',
        },
        validateOnClient: validateOnClientAjv.configure({
          localize: 'de',
          options: {
            verbose: true,
          },
        }),
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid body on client for http:.*\. data\/hello muss gleich der Konstanten sein/
    );
    await rejects.toThrowError(HttpException);
  });
});

describe('Validation with with vovk-zod and validateOnClient defined at settings', () => {
  it('Should be OK', async () => {
    const result = await WithZodClientControllerRPC.handleAll({
      body: { hello: 'world' },
      query: { search: 'value' },
      params: { foo: 'foo', bar: 'bar' },
    });

    const expected = {
      body: { hello: 'world' },
      query: { search: 'value' },
      params: { foo: 'foo', bar: 'bar' },
      vovkParams: { foo: 'foo', bar: 'bar' },
    } as const;

    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkControllerOutput<typeof WithZodClientController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkControllerOutput<typeof WithZodClientController.handleAll> satisfies null;

    deepStrictEqual(result satisfies typeof expected, expected);
  });

  it('Should handle nothitng', async () => {
    let result = await WithZodClientControllerRPC.handleNothitng();
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });
    result = await WithZodClientControllerRPC.handleNothitng({
      // @ts-expect-error Expect error
      body: { no: 'body' },
    });
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });
  });

  it('Should handle body validation on server and client', async () => {
    const result = await WithZodClientControllerRPC.handleBody({
      body: { hello: 'world' },
    });

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });

    let { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleBody({
        body: {
          hello: 'wrong' as 'world',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(
      /Zod validation failed. Invalid body on server for http:.*. Invalid literal value, expected "world" \(hello\)/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleBody({
        body: {
          hello: 'wrong' as 'world',
        },
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid body on client for http:.*\. data\/hello must be equal to constant/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should handle params validation on server and client', async () => {
    const result = await WithZodClientControllerRPC.handleParams({
      params: { foo: 'foo', bar: 'bar' },
    });

    deepStrictEqual(result satisfies { foo: 'foo'; bar: 'bar' }, { foo: 'foo', bar: 'bar' });

    let { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleParams({
        params: {
          foo: 'wrong' as 'foo',
          bar: 'bar',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(
      /Zod validation failed. Invalid params on server for http:.*\. Invalid literal value, expected "foo" \(foo\)/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleParams({
        params: {
          foo: 'wrong' as 'foo',
          bar: 'bar',
        },
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid params on client for http:.*\. data\/foo must be equal to constant/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should handle query validation on server and client', async () => {
    const result = await WithZodClientControllerRPC.handleQuery({
      query: { search: 'value' },
    });

    deepStrictEqual(result satisfies { search: 'value' }, { search: 'value' });

    let { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleQuery({
        query: {
          search: 'wrong' as 'value',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(
      /Zod validation failed. Invalid query on server for http:.*\. Invalid literal value, expected "value" \(search\)/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleQuery({
        query: {
          search: 'wrong' as 'value',
        },
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid query on client for http:.*\. data\/search must be equal to constant/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should handle nested queries on server and client', async () => {
    const result = await WithZodClientControllerRPC.handleNestedQuery({
      query: NESTED_QUERY_EXAMPLE,
    });

    deepStrictEqual(
      result satisfies VovkReturnType<typeof WithZodClientControllerRPC.handleNestedQuery>,
      NESTED_QUERY_EXAMPLE
    );

    let { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Zod validation failed. Invalid query on server for http:.*. Required \(x\)/);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid query on client for http:.*\. data\/x must be string/);
  });

  it('Should handle output validation on server', async () => {
    const result = await WithZodClientControllerRPC.handleOutput({
      query: { helloOutput: 'world' },
    });

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleOutput({
        query: { helloOutput: 'wrong' },
      });
    });

    await rejects.toThrow(
      /Zod validation failed. Invalid output on server for http:.*\. Invalid literal value, expected "world" \(hello\)/
    );
  });

  it('Should handle stream', async () => {
    const tokens = ['a', 'b', 'c', 'd'];
    const expected = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const resp = await WithZodClientControllerRPC.handleStream({
      query: { values: tokens },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkControllerYieldType<typeof WithZodClientController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithZodClientControllerRPC.handleStream> satisfies { value: string };

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle form data', async () => {
    const formData = new FormData();
    formData.append('hello', 'world');

    const result = await WithZodClientControllerRPC.handleFormData({
      body: formData,
      query: { search: 'foo' },
    });
    const expected = {
      formData: {
        hello: 'world',
      },
      search: 'foo',
    } as const;
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleFormData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleFormData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);
  });

  it.skip('Should store schema at handler.schema', async () => {
    deepStrictEqual(WithZodClientControllerRPC.handleAll.schema satisfies VovkHandlerSchema, {
      httpMethod: 'POST',
      path: ':foo',
      validation: {
        body: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          additionalProperties: false,
          properties: {
            hello: {
              const: 'body',
              type: 'string',
            },
          },
          required: ['hello'],
          type: 'object',
        },
        query: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          additionalProperties: false,
          properties: {
            hey: {
              const: 'query',
              type: 'string',
            },
          },
          required: ['hey'],
          type: 'object',
        },
      },
    });
  });
});
