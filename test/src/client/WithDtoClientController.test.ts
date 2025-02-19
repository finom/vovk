import { it, describe } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { WithDtoClientControllerRPC } from 'vovk-client';
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
import type {
  HandleAllBodyDto,
  HandleAllParamsDto,
  HandleAllQueryDto,
  HandleBodyBodyDto,
  HandleParamsDto,
  HandleQueryQueryDto,
} from './WithDtoClientController.dto.ts';

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

describe.only('Validation with with vovk-dto and validateOnClient defined at settings', () => {
  it('Should be OK', async () => {
    const result = await WithDtoClientControllerRPC.handleAll({
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

    type ExpectedType = {
      body: HandleAllBodyDto;
      query: HandleAllQueryDto;
      params: HandleAllParamsDto;
      vovkParams: HandleAllParamsDto;
    };

    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleAll> satisfies ExpectedType;
    null as unknown as VovkControllerOutput<typeof WithZodClientController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkControllerOutput<typeof WithZodClientController.handleAll> satisfies null;

    deepStrictEqual(result satisfies ExpectedType, expected);
  });

  it('Should transform response', async () => {
    const result = await WithDtoClientControllerRPC.handleAllClient({
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

    type ExpectedType = {
      body: HandleAllBodyDto;
      query: HandleAllQueryDto;
      params: HandleAllParamsDto;
      vovkParams: HandleAllParamsDto;
    };

    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleAll> satisfies ExpectedType;
    null as unknown as VovkControllerOutput<typeof WithZodClientController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkControllerOutput<typeof WithZodClientController.handleAll> satisfies null;

    deepStrictEqual(result satisfies ExpectedType, expected);
  });

  it('Should handle nothitng', async () => {
    let result = await WithDtoClientControllerRPC.handleNothitng();
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });
    result = await WithDtoClientControllerRPC.handleNothitng({
      // @ts-expect-error Expect error
      body: { no: 'body' },
    });
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });
  });

  it('Should handle body validation on server and client', async () => {
    const result = await WithDtoClientControllerRPC.handleBody({
      body: { hello: 'world' },
    });

    deepStrictEqual(result satisfies HandleBodyBodyDto, { hello: 'world' });

    let { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleBody({
        body: {
          hello: 'wrong',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body on server for http:.*. hello must be equal to world/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleBody({
        body: {
          hello: 'wrong',
        },
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid body on client for http:.*\. data\/hello must be equal to one of the allowed values/
    );
    await rejects.toThrowError(HttpException);

    await ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleBodyClient({
        body: {
          hello: 'wrong',
        },
      });
    }));

    await rejects.toThrow(/Validation failed. Invalid body on client for http:.*\. hello must be equal to world/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle params validation on server and client', async () => {
    const result = await WithDtoClientControllerRPC.handleParams({
      params: { foo: 'foo', bar: 'bar' },
    });

    deepStrictEqual(result satisfies HandleParamsDto, { foo: 'foo', bar: 'bar' });

    let { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleParams({
        params: {
          foo: 'wrong' as 'foo',
          bar: 'bar',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid params on server for http:.*\. foo must be equal to foo/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleParams({
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

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleParamsClient({
        params: {
          foo: 'wrong' as 'foo',
          bar: 'bar',
        },
      });
    }));

    await rejects.toThrow(/Validation failed. Invalid params on client for http:.*\. foo must be equal to foo/);
  });

  it('Should handle query validation on server and client', async () => {
    const result = await WithDtoClientControllerRPC.handleQuery({
      query: { search: 'value' },
    });

    deepStrictEqual(result satisfies HandleQueryQueryDto, { search: 'value' });

    let { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleQuery({
        query: {
          search: 'wrong' as 'value',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid query on server for http:.*\. search must be equal to value/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleQuery({
        query: {
          search: 'wrong' as 'value',
        },
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid query on client for http:.*\. data\/search must be equal to one of the allowed values/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleQueryClient({
        query: {
          search: 'wrong' as 'value',
        },
      });
    }));

    await rejects.toThrow(/Validation failed. Invalid query on client for http:.*\. search must be equal to value/);
  });

  it('Should handle nested queries on server and client', async () => {
    const result = await WithDtoClientControllerRPC.handleNestedQuery({
      query: NESTED_QUERY_EXAMPLE,
    });

    deepStrictEqual(
      result satisfies VovkReturnType<typeof WithDtoClientControllerRPC.handleNestedQuery>,
      NESTED_QUERY_EXAMPLE
    );

    let { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid query on server for http:.*. x must be a string/);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid query on client for http:.*\. data\/x must be string/);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleNestedQueryClient({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
      });
    }));

    await rejects.toThrow(/Validation failed. Invalid query on client for http:.*\. x must be a string/);
  });

  it('Should handle output validation on server', async () => {
    const result = await WithDtoClientControllerRPC.handleOutput({
      query: { helloOutput: 'world' },
    });

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleOutput({
        query: { helloOutput: 'wrong' },
      });
    });

    await rejects.toThrow(/Validation failed. Invalid output on server for http:.*\. hello must be equal to world/);
  });

  it('Should handle stream', async () => {
    const tokens = ['a', 'b', 'c', 'd'];
    const expected = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const resp = await WithDtoClientControllerRPC.handleStream({
      query: { values: tokens },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkControllerYieldType<typeof WithZodClientController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithDtoClientControllerRPC.handleStream> satisfies { value: string };

    deepStrictEqual(expected, expectedCollected);
  });

  it.skip('Should store schema at handler.schema', async () => {
    deepStrictEqual(WithDtoClientControllerRPC.handleAll.schema satisfies VovkHandlerSchema, {
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
