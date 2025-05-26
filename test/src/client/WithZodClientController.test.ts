import test, { it, describe } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { WithZodClientControllerRPC } from 'vovk-client';
import { validateOnClient as validateOnClientAjv } from 'vovk-ajv';
import {
  HttpException,
  type VovkReturnType,
  type VovkHandlerSchema,
  type VovkYieldType,
  type VovkOutput,
  type VovkIteration,
} from 'vovk';
import type WithZodClientController from './WithZodClientController.ts';
import { expectPromise, getConstrainingObject, NESTED_QUERY_EXAMPLE } from '../lib.ts';

describe('Client validation with custom AJV options', () => {
  it('Should handle body validation on client: with localize and options', async () => {
    const result = await WithZodClientControllerRPC.handleBody({
      body: { hello: 'world' },
    });

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleBody({
        body: {
          hello: 'wrong_length',
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
      /Ajv validation failed. Invalid body on client: data\/hello darf nicht länger als 5 Zeichen sein/
    );
    await rejects.toThrowError(HttpException);
  });
});

describe('Zod-to-JSONchema constraints', async () => {
  const noConstraints = getConstrainingObject(null);

  await test('Should handle valid object', async () => {
    // first check if the object is valid
    await WithZodClientControllerRPC.handleSchemaConstraints({
      body: noConstraints,
    });
  });

  for (const key of Object.keys(noConstraints)) {
    await test(`Should handle ${key} constraint`, async () => {
      const constrainingObject = getConstrainingObject(key);
      let { rejects } = expectPromise(async () => {
        await WithZodClientControllerRPC.handleSchemaConstraints({
          body: constrainingObject,
          disableClientValidation: true,
        });
      });

      await rejects.toThrow(new RegExp(`Zod validation failed. Invalid body on server: "${key}.*`));
      await rejects.toThrowError(HttpException);

      ({ rejects } = expectPromise(async () => {
        await WithZodClientControllerRPC.handleSchemaConstraints({
          body: constrainingObject,
        });
      }));
      await rejects.toThrow(new RegExp(`Ajv validation failed. Invalid body on client. data\\/${key}.*`));
    });
  }
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
    };

    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithZodClientControllerRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithZodClientController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithZodClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithZodClientController.handleAll> satisfies null;

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

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    let { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleBody({
        body: {
          hello: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Zod validation failed. Invalid body on server: "hello".*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleBody({
        body: {
          hello: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid body on client: data\/hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle params validation on server and client', async () => {
    const result = await WithZodClientControllerRPC.handleParams({
      params: { foo: 'foo', bar: 'bar' },
    });

    deepStrictEqual(result satisfies { foo: string; bar: string }, { foo: 'foo', bar: 'bar' });

    let { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleParams({
        params: {
          foo: 'wrong_length',
          bar: 'bar',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Zod validation failed. Invalid params on server: "foo".*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleParams({
        params: {
          foo: 'wrong_length',
          bar: 'bar',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid params on client: data\/foo.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle query validation on server and client', async () => {
    const result = await WithZodClientControllerRPC.handleQuery({
      query: { search: 'value' },
    });

    deepStrictEqual(result satisfies { search: string }, { search: 'value' });

    let { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleQuery({
        query: {
          search: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Zod validation failed. Invalid query on server: "search".*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleQuery({
        query: {
          search: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid query on client: data\/search.*/);
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
          x: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Zod validation failed. Invalid query on server: "x".*/);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          x: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid query on client: data\/x.*/);
  });

  it('Should handle output validation on server', async () => {
    const result = await WithZodClientControllerRPC.handleOutput({
      query: { helloOutput: 'world' },
    });

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleOutput({
        query: { helloOutput: 'wrong_length' },
      });
    });

    await rejects.toThrow(/Zod validation failed. Invalid output on server: "hello".*/);
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

    null as unknown as VovkYieldType<typeof WithZodClientController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithZodClientControllerRPC.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithZodClientController.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithZodClientControllerRPC.handleStream> satisfies { value: string };

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle stream first iteration validation', async () => {
    const tokens = ['wrong_length', 'b', 'c', 'd'];
    const expected: { value: string }[] = [];
    const expectedCollected: typeof expected = [];

    const { rejects } = expectPromise(async () => {
      const resp = await WithZodClientControllerRPC.handleStream({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/Zod validation failed. Invalid iteration #0 on server: "value".*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should ignore non-first iteration validation', async () => {
    const tokens = ['a', 'b', 'wrong_length', 'd'];
    const expected: { value: string }[] = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const resp = await WithZodClientControllerRPC.handleStream({
      query: { values: tokens },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle every iteration validation', async () => {
    const tokens = ['a', 'b', 'wrong_length', 'd'];

    const expected: { value: string }[] = tokens.slice(0, 2).map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const { rejects } = expectPromise(async () => {
      const resp = await WithZodClientControllerRPC.validateEachIteration({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/Zod validation failed. Invalid iteration #2 on server: "value".*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should skip server-side validation with boolean value', async () => {
    const result = await WithZodClientControllerRPC.disableServerSideValidationBool({
      body: { hello: 'wrong_length' },
      query: { search: 'value' },
      disableClientValidation: true,
    });

    deepStrictEqual(result satisfies { search: string; body: { hello: string } }, {
      search: 'value',
      body: { hello: 'wrong_length' },
    });
  });

  it('Should skip server-side validation with string[] value', async () => {
    const result = await WithZodClientControllerRPC.disableServerSideValidationStrings({
      body: { hello: 'wrong_length' },
      query: { search: 'value' },
      disableClientValidation: true,
    });

    deepStrictEqual(result satisfies { search: string; body: { hello: string } }, {
      search: 'value',
      body: { hello: 'wrong_length' },
    });

    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.disableServerSideValidationStrings({
        body: { hello: 'world' },
        query: { search: 'wrong_length' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Zod validation failed. Invalid query on server: "search".*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should skip schema emission with boolean value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.skipSchemaEmissionBool({
        body: { hello: 'wrong_length' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(/Zod validation failed. Invalid body on server: "hello".*/);
    strictEqual(WithZodClientControllerRPC.skipSchemaEmissionBool.schema.validation?.body, undefined);
    strictEqual(WithZodClientControllerRPC.skipSchemaEmissionBool.schema.validation?.query, undefined);
  });

  it('Should skip schema emission with string[] value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.skipSchemaEmissionStrings({
        body: { hello: 'wrong_length' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(/Zod validation failed. Invalid body on server: "hello".*/);
    strictEqual(WithZodClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.body, undefined);
    ok(WithZodClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.query);
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
    };
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
