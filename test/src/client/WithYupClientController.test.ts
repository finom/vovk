import { it, describe } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { WithYupClientControllerRPC } from 'vovk-client';
import {
  HttpException,
  type VovkReturnType,
  type VovkHandlerSchema,
  type VovkControllerYieldType,
  type VovkYieldType,
  type VovkControllerOutput,
} from 'vovk';
import type WithDtoClientController from './WithDtoClientController';
import { expectPromise, NESTED_QUERY_EXAMPLE } from '../lib.ts';
import type WithYupClientController from './WithYupClientController.ts';

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
    null as unknown as VovkControllerOutput<typeof WithYupClientController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithYupClientController.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkControllerOutput<typeof WithYupClientController.handleAll> satisfies null;

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

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });

    let { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleBody({
        body: {
          hello: 'wrong' as 'world',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(
      /Yup validation failed. Invalid body on server for http:.*. hello must be one of the following values: world/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleBody({
        body: {
          hello: 'wrong' as 'world',
        },
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid body on client for http:.*\. data\/hello must be equal to one of the allowed value/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should handle params validation on server and client', async () => {
    const result = await WithYupClientControllerRPC.handleParams({
      params: { foo: 'foo', bar: 'bar' },
    });

    deepStrictEqual(result satisfies { foo: 'foo'; bar: 'bar' }, { foo: 'foo', bar: 'bar' });

    let { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleParams({
        params: {
          foo: 'wrong' as 'foo',
          bar: 'bar',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(
      /Yup validation failed. Invalid params on server for http:.*\. foo must be one of the following values: foo/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleParams({
        params: {
          foo: 'wrong' as 'foo',
          bar: 'bar',
        },
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid params on client for http:.*\. data\/foo must be equal to one of the allowed values/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should handle query validation on server and client', async () => {
    const result = await WithYupClientControllerRPC.handleQuery({
      query: { search: 'value' },
    });

    deepStrictEqual(result satisfies { search: 'value' }, { search: 'value' });

    let { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleQuery({
        query: {
          search: 'wrong' as 'value',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(
      /Yup validation failed. Invalid query on server for http:.*\. search must be one of the following values: value/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleQuery({
        query: {
          search: 'wrong' as 'value',
        },
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid query on client for http:.*\. data\/search must be equal to one of the allowed values/
    );
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
          // @ts-expect-error Expect error
          x: null,
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Yup validation failed. Invalid query on server for http:.*. x is a required field/);

    ({ rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleNestedQuery({
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
    const result = await WithYupClientControllerRPC.handleOutput({
      query: { helloOutput: 'world' },
    });

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.handleOutput({
        query: { helloOutput: 'wrong' },
      });
    });

    await rejects.toThrow(
      /Yup validation failed. Invalid output on server for http:.*\. hello must be one of the following values: world/
    );
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

    null as unknown as VovkControllerYieldType<typeof WithDtoClientController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithDtoClientController.handleStream> satisfies { value: string };

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle stream first iteration validation', async () => {
    const tokens = ['e', 'b', 'c', 'd'];
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
    await rejects.toThrow(
      /Yup validation failed. Invalid iteration #0 on server for http:.*\. value must be one of the following values: a, b, c, d/
    );

    null as unknown as VovkControllerYieldType<typeof WithYupClientController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithYupClientControllerRPC.handleStream> satisfies { value: string };

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should ignore non-first iteration validation', async () => {
    const tokens = ['a', 'b', 'e', 'd'];
    const expected: { value: string }[] = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];
    const resp = await WithYupClientControllerRPC.handleStream({
      query: { values: tokens },
    });
    for await (const message of resp) {
      expectedCollected.push(message);
    }
    null as unknown as VovkControllerYieldType<typeof WithYupClientController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithYupClientControllerRPC.handleStream> satisfies { value: string };
    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle every iteration validation', async () => {
    const tokens = ['a', 'b', 'e', 'd'];
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
    await rejects.toThrow(
      /Yup validation failed. Invalid iteration #2 on server for http:.*\. value must be one of the following values: a, b, c, d/
    );
    null as unknown as VovkControllerYieldType<typeof WithYupClientController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithYupClientControllerRPC.handleStream> satisfies { value: string };
    deepStrictEqual(expected, expectedCollected);
  });

  it('Should skip server-side validation with boolean value', async () => {
    const result = await WithYupClientControllerRPC.disableServerSideValidationBool({
      body: { hello: 'wrong' as 'world' },
      query: { search: 'value' },
      disableClientValidation: true,
    });
    deepStrictEqual(result satisfies { search: 'value'; body: { hello: 'world' } }, {
      search: 'value',
      body: { hello: 'wrong' },
    });
  });

  it('Should skip server-side validation with string[] value', async () => {
    const result = await WithYupClientControllerRPC.disableServerSideValidationStrings({
      body: { hello: 'wrong' as 'world' },
      query: { search: 'value' },
      disableClientValidation: true,
    });
    deepStrictEqual(result satisfies { search: 'value'; body: { hello: 'world' } }, {
      search: 'value',
      body: { hello: 'wrong' },
    });
    const { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.disableServerSideValidationStrings({
        body: { hello: 'world' },
        query: { search: 'wrong' as 'value' },
        disableClientValidation: true,
      });
    });
    await rejects.toThrow(
      /Yup validation failed. Invalid query on server for http:.*\. search must be one of the following values: value/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should skip schema emission with boolean value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.skipSchemaEmissionBool({
        body: { hello: 'wrong' as 'world' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(
      /Yup validation failed. Invalid body on server for http:.*\. hello must be one of the following values: world/
    );
    strictEqual(WithYupClientControllerRPC.skipSchemaEmissionBool.schema.validation?.body, undefined);
    strictEqual(WithYupClientControllerRPC.skipSchemaEmissionBool.schema.validation?.query, undefined);
  });

  it('Should skip schema emission with string[] value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithYupClientControllerRPC.skipSchemaEmissionStrings({
        body: { hello: 'wrong' as 'world' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(
      /Yup validation failed. Invalid body on server for http:.*\. hello must be one of the following values: world/
    );
    strictEqual(WithYupClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.body, undefined);
    ok(WithYupClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.query);
  });

  it('Should handle form data', async () => {
    const formData = new FormData();
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
    } as const;
    null as unknown as VovkReturnType<typeof WithYupClientControllerRPC.handleFormData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithYupClientControllerRPC.handleFormData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);
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
