import { it, describe } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { WithYupClientControllerRPC } from 'vovk-client';
import {
  HttpException,
  type VovkReturnType,
  type VovkHandlerSchema,
  type VovkYieldType,
  type VovkOutput,
  type VovkIteration,
} from 'vovk';
import { expectPromise, getConstrainingObject, NESTED_QUERY_EXAMPLE } from '../lib.ts';
import type WithYupClientController from './WithYupClientController.ts';

describe('Yup-to-JSONchema constraints', async () => {
  const noConstraints = getConstrainingObject(null);
  const notSupported = ['num_multipleOf', 'logical_anyOf', 'obj_strict', 'str_datetime'];

  await it('Should handle valid object', async () => {
    // first check if the object is valid
    await WithYupClientControllerRPC.handleSchemaConstraints({
      body: noConstraints,
    });
  });
  for (const key of Object.keys(noConstraints)) {
    if (notSupported.includes(key)) {
      continue;
    }
    await it(`Should handle ${key} constraint`, async () => {
      const constrainingObject = getConstrainingObject(key);
      let { rejects } = expectPromise(async () => {
        await WithYupClientControllerRPC.handleSchemaConstraints({
          body: constrainingObject,
          disableClientValidation: true,
        });
      });
      await rejects.toThrow(new RegExp(`Yup validation failed. Invalid body on server: ${key}.*`));
      await rejects.toThrowError(HttpException);
      ({ rejects } = expectPromise(async () => {
        await WithYupClientControllerRPC.handleSchemaConstraints({
          body: constrainingObject,
        });
      }));
      await rejects.toThrow(new RegExp(`Ajv validation failed. Invalid body on client. data\\/${key}.*`));
    });
  }
});

describe('Validation with with vovk-yup and validateOnClient defined at settings', () => {
  it('Should be OK', async () => {
    const result = await WithYupClientControllerRPC.handleAll({
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

    null as unknown as VovkReturnType<typeof WithYupClientControllerRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithYupClientControllerRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithYupClientController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithYupClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithYupClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithYupClientController.handleAll> satisfies null;

    deepStrictEqual(result satisfies typeof expected, expected);
  });

  it('Should handle nothitng', async () => {
    let result = await WithYupClientControllerRPC.handleNothitng();
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });
    result = await WithYupClientControllerRPC.handleNothitng({
      // @ts-expect-error Expect error
      body: { no: 'body' },
    });
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });
  });

  it('Should handle body validation on server and client', async () => {
    const result = await WithYupClientControllerRPC.handleBody({
      body: { hello: 'world' },
    });

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    let { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleBody({
        body: {
          hello: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Yup validation failed. Invalid body on server: hello.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleBody({
        body: {
          hello: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid body on client: data\/hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle params validation on server and client', async () => {
    const result = await WithYupClientControllerRPC.handleParams({
      params: { foo: 'foo', bar: 'bar' },
    });

    deepStrictEqual(result satisfies { foo: string; bar: string }, { foo: 'foo', bar: 'bar' });

    let { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleParams({
        params: {
          foo: 'wrong_length',
          bar: 'bar',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Yup validation failed. Invalid params on server: foo.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleParams({
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
    const result = await WithYupClientControllerRPC.handleQuery({
      query: { search: 'value' },
    });

    deepStrictEqual(result satisfies { search: string }, { search: 'value' });

    let { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleQuery({
        query: {
          search: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Yup validation failed. Invalid query on server: search.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleQuery({
        query: {
          search: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid query on client: data\/search.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle nested queries on server and client', async () => {
    const result = await WithYupClientControllerRPC.handleNestedQuery({
      query: NESTED_QUERY_EXAMPLE,
    });

    deepStrictEqual(
      result satisfies VovkReturnType<typeof WithYupClientControllerRPC.handleNestedQuery>,
      NESTED_QUERY_EXAMPLE
    );

    let { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          x: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Yup validation failed. Invalid query on server: x.*/);

    ({ rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          x: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid query on client: data\/x.*/);
  });

  it('Should handle output validation on server', async () => {
    const result = await WithYupClientControllerRPC.handleOutput({
      query: { helloOutput: 'world' },
    });

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleOutput({
        query: { helloOutput: 'wrong_length' },
      });
    });

    await rejects.toThrow(/Yup validation failed. Invalid output on server: hello.*/);
  });

  it('Should handle stream', async () => {
    const tokens = ['a', 'b', 'c', 'd'];
    const expected = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const resp = await WithYupClientControllerRPC.handleStream({
      query: { values: tokens },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkYieldType<typeof WithYupClientController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithYupClientControllerRPC.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithYupClientController.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithYupClientControllerRPC.handleStream> satisfies { value: string };

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle stream first iteration validation', async () => {
    const tokens = ['wrong_length', 'b', 'c', 'd'];
    const expected: { value: string }[] = [];
    const expectedCollected: typeof expected = [];

    const { rejects } = expectPromise(async () => {
      const resp = await WithYupClientControllerRPC.handleStream({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/Yup validation failed. Invalid iteration #0 on server: value.*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should ignore non-first iteration validation', async () => {
    const tokens = ['a', 'b', 'wrong_length', 'd'];
    const expected: { value: string }[] = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];
    const resp = await WithYupClientControllerRPC.handleStream({
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
      const resp = await WithYupClientControllerRPC.validateEachIteration({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/Yup validation failed. Invalid iteration #2 on server: value.*/);
    deepStrictEqual(expected, expectedCollected);
  });

  it('Should skip server-side validation with boolean value', async () => {
    const result = await WithYupClientControllerRPC.disableServerSideValidationBool({
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
    const result = await WithYupClientControllerRPC.disableServerSideValidationStrings({
      body: { hello: 'wrong_length' },
      query: { search: 'value' },
      disableClientValidation: true,
    });
    deepStrictEqual(result satisfies { search: string; body: { hello: string } }, {
      search: 'value',
      body: { hello: 'wrong_length' },
    });
    const { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.disableServerSideValidationStrings({
        body: { hello: 'world' },
        query: { search: 'wrong_length' },
        disableClientValidation: true,
      });
    });
    await rejects.toThrow(/Yup validation failed. Invalid query on server: search.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should skip schema emission with boolean value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.skipSchemaEmissionBool({
        body: { hello: 'wrong_length' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(/Yup validation failed. Invalid body on server: hello.*/);
    strictEqual(WithYupClientControllerRPC.skipSchemaEmissionBool.schema.validation?.body, undefined);
    strictEqual(WithYupClientControllerRPC.skipSchemaEmissionBool.schema.validation?.query, undefined);
  });

  it('Should skip schema emission with string[] value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.skipSchemaEmissionStrings({
        body: { hello: 'wrong_length' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(/Yup validation failed. Invalid body on server: hello.*/);
    strictEqual(WithYupClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.body, undefined);
    ok(WithYupClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.query);
  });

  it('Should handle form data', async () => {
    let formData = new FormData();
    formData.append('hello', 'world');

    const result = await WithYupClientControllerRPC.handleFormData({
      body: formData,
      query: { search: 'foo' },
    });
    const expected = {
      formData: {
        hello: 'world',
      },
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithYupClientControllerRPC.handleFormData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithYupClientControllerRPC.handleFormData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      await WithYupClientControllerRPC.handleFormData({
        body: formData,
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });
    await rejects.toThrow(/Yup validation failed. Invalid form on server: hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it.skip('Should store schema at handler.schema', async () => {
    deepStrictEqual(WithYupClientControllerRPC.handleAll.schema satisfies VovkHandlerSchema, {
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
