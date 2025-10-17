import { it, describe } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { WithDtoClientControllerRPC } from 'vovk-client';
import { HttpException, type VovkReturnType, type VovkYieldType, type VovkOutput, type VovkIteration } from 'vovk';
import type WithDtoClientController from './WithDtoClientController.ts';
import { expectPromise, getConstrainingObject, NESTED_QUERY_EXAMPLE } from '../lib.ts';
import type {
  HandleAllBodyDto,
  HandleAllParamsDto,
  HandleAllQueryDto,
  HandleBodyBodyDto,
  HandleParamsDto,
  HandleQueryQueryDto,
} from './WithDtoClientController.dto.ts';
import omit from 'lodash/omit.js';

describe('DTO-to-JSONchema constraints', async () => {
  const noConstraints = getConstrainingObject(null);

  await it('Should handle valid object', async () => {
    // first check if the object is valid
    await WithDtoClientControllerRPC.handleSchemaConstraints({
      body: noConstraints,
    });
  });
  const notSupported = [
    'logical_anyOf',
    'logical_allOf',
    'obj_strict',
    'obj_required',
    'num_multipleOf',
    'num_exclusiveMinimum',
    'num_exclusiveMaximum',
  ];
  for (const key of Object.keys(noConstraints)) {
    if (notSupported.includes(key)) {
      continue;
    }
    await it(`Should handle ${key} constraint`, async () => {
      const constrainingObject = getConstrainingObject(key);
      let { rejects } = expectPromise(async () => {
        await WithDtoClientControllerRPC.handleSchemaConstraints({
          body: constrainingObject,
          disableClientValidation: true,
        });
      });
      await rejects.toThrow(new RegExp(`DTO validation failed. Invalid body on server: ${key}.*`));
      await rejects.toThrowError(HttpException);
      ({ rejects } = expectPromise(async () => {
        await WithDtoClientControllerRPC.handleSchemaConstraints({
          body: constrainingObject,
        });
      }));
      await rejects.toThrow(new RegExp(`Ajv validation failed. Invalid body on client: data\\/${key}.*`));
    });
  }
});

describe('Validation with with vovk-dto', () => {
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
    };

    type ExpectedType = {
      body: HandleAllBodyDto;
      query: HandleAllQueryDto;
      params: HandleAllParamsDto;
      vovkParams: HandleAllParamsDto;
    };

    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithDtoClientControllerRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithDtoClientController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithDtoClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithDtoClientController.handleAll> satisfies null;

    deepStrictEqual(result satisfies ExpectedType, expected);
  });

  it.only('Should be OK with preferTransformed: false', async () => {
    const result = await WithDtoClientControllerRPC.handleAllpreferTransformedFalse({
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

    type ExpectedType = {
      body: { hello: string };
      query: { search: string };
      params: { foo: string; bar: string };
      vovkParams: { foo: string; bar: string };
    };

    null as unknown as VovkReturnType<
      typeof WithDtoClientControllerRPC.handleAllpreferTransformedFalse
    > satisfies typeof expected;
    null as unknown as VovkOutput<
      typeof WithDtoClientControllerRPC.handleAllpreferTransformedFalse
    > satisfies typeof expected;
    null as unknown as VovkOutput<
      typeof WithDtoClientController.handleAllpreferTransformedFalse
    > satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleAllpreferTransformedFalse> satisfies null;

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
    };

    type ExpectedType = {
      body: HandleAllBodyDto;
      query: HandleAllQueryDto;
      params: HandleAllParamsDto;
      vovkParams: HandleAllParamsDto;
    };

    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleAll> satisfies ExpectedType;
    null as unknown as VovkOutput<typeof WithDtoClientController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithDtoClientController.handleAll> satisfies null;

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
          hello: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/DTO validation failed. Invalid body on server: hello.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleBody({
        query: { search: 'value' },
        params: { foo: 'foo', bar: 'bar' },
        body: {
          hello: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid body on client: data\/hello.*/);
    await rejects.toThrowError(HttpException);

    await ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleBodyClient({
        body: {
          hello: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/DTO validation failed. Invalid body on client: hello.*/);
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
          foo: 'wrong_length',
          bar: 'bar',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/DTO validation failed. Invalid params on server: foo.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleParams({
        params: {
          foo: 'wrong_length',
          bar: 'bar',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid params on client: data\/foo.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleParamsClient({
        params: {
          foo: 'wrong_length',
          bar: 'bar',
        },
      });
    }));

    await rejects.toThrow(/DTO validation failed. Invalid params on client: foo.*/);
  });

  it('Should handle query validation on server and client', async () => {
    const result = await WithDtoClientControllerRPC.handleQuery({
      query: { search: 'value' },
    });

    deepStrictEqual(result satisfies HandleQueryQueryDto, { search: 'value' });

    let { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleQuery({
        query: {
          search: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/DTO validation failed. Invalid query on server: search.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleQuery({
        query: {
          search: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid query on client: data\/search.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleQueryClient({
        query: {
          search: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/DTO validation failed. Invalid query on client: search must be shorter.*/);
  });

  it('Should handle nested queries on server and client', async () => {
    const DTO_QUERY_EXAMPLE = {
      ...NESTED_QUERY_EXAMPLE,
      z: {
        ...NESTED_QUERY_EXAMPLE.z,
        d: {
          // TODO: WARNING: I was unable to find a way to achieve 3 levels of nesting, skipping o.z.d.arrOfObjects for DTO tests
          // See https://github.com/typestack/class-validator/issues/306
          ...omit(NESTED_QUERY_EXAMPLE.z.d, 'arrOfObjects'),
        },
      },
    };
    const result = await WithDtoClientControllerRPC.handleNestedQuery({
      query: DTO_QUERY_EXAMPLE,
    });

    deepStrictEqual(
      result satisfies VovkReturnType<typeof WithDtoClientControllerRPC.handleNestedQuery>,
      DTO_QUERY_EXAMPLE
    );

    let { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleNestedQuery({
        query: {
          ...DTO_QUERY_EXAMPLE,
          x: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/DTO validation failed. Invalid query on server: x.*/);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleNestedQuery({
        query: {
          ...DTO_QUERY_EXAMPLE,
          x: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Ajv validation failed. Invalid query on client: data\/x.*/);

    ({ rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleNestedQueryClient({
        query: {
          ...DTO_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
      });
    }));

    await rejects.toThrow(/DTO validation failed. Invalid query on client: x.*/);
  });

  it('Should handle output validation on server', async () => {
    const result = await WithDtoClientControllerRPC.handleOutput({
      query: { helloOutput: 'world' },
    });

    deepStrictEqual(result satisfies { hello: 'world' }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.handleOutput({
        query: { helloOutput: 'wrong_length' },
      });
    });

    await rejects.toThrow(/DTO validation failed. Invalid output on server: hello.*/);
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

    null as unknown as VovkYieldType<typeof WithDtoClientController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithDtoClientControllerRPC.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithDtoClientController.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithDtoClientControllerRPC.handleStream> satisfies { value: string };
    deepStrictEqual(expectedCollected, expected);
  });

  it('Should handle stream first iteration validation', async () => {
    const tokens = ['wrong_length', 'b', 'c', 'd'];
    const expected: { value: string }[] = [];
    const expectedCollected: typeof expected = [];

    const { rejects } = expectPromise(async () => {
      const resp = await WithDtoClientControllerRPC.handleStream({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/DTO validation failed. Invalid iteration #0 on server: value.*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should ignore non-first iteration validation', async () => {
    const tokens = ['a', 'b', 'wrong_length', 'd'];
    const expected: { value: string }[] = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];
    const resp = await WithDtoClientControllerRPC.handleStream({
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
      const resp = await WithDtoClientControllerRPC.validateEachIteration({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/DTO validation failed. Invalid iteration #2 on server: value.*/);
    deepStrictEqual(expected, expectedCollected);
  });

  it('Should skip server-side validation with boolean value', async () => {
    const result = await WithDtoClientControllerRPC.disableServerSideValidationBool({
      body: { hello: 'wrong_length' },
      query: { search: 'value' },
      disableClientValidation: true,
    });
    deepStrictEqual(result satisfies { search: string; body: HandleBodyBodyDto }, {
      search: 'value',
      body: { hello: 'wrong_length' },
    });
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.disableServerSideValidationBool> satisfies null;
  });
  it('Should skip server-side validation with string[] value', async () => {
    const result = await WithDtoClientControllerRPC.disableServerSideValidationStrings({
      body: { hello: 'wrong_length' },
      query: { search: 'value' },
      disableClientValidation: true,
    });
    deepStrictEqual(result satisfies { search: string; body: HandleBodyBodyDto }, {
      search: 'value',
      body: { hello: 'wrong_length' },
    });
    const { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.disableServerSideValidationStrings({
        body: { hello: 'world' },
        query: { search: 'wrong_length' },
        disableClientValidation: true,
      });
    });
    await rejects.toThrow(/DTO validation failed. Invalid query on server: search.*/);
    await rejects.toThrowError(HttpException);

    null as unknown as VovkReturnType<
      typeof WithDtoClientControllerRPC.disableServerSideValidationStrings
      // @ts-expect-error Expect error
    > satisfies null;
  });

  it('Should skip schema emission with boolean value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.skipSchemaEmissionBool({
        body: { hello: 'wrong_length' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(/DTO validation failed. Invalid body on server: hello.*/);
    strictEqual(WithDtoClientControllerRPC.skipSchemaEmissionBool.schema.validation?.body, undefined);
    strictEqual(WithDtoClientControllerRPC.skipSchemaEmissionBool.schema.validation?.query, undefined);
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.skipSchemaEmissionBool> satisfies null;
  });
  it('Should skip schema emission with string[] value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithDtoClientControllerRPC.skipSchemaEmissionStrings({
        body: { hello: 'wrong_length' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(/DTO validation failed. Invalid body on server: hello.*/);
    strictEqual(WithDtoClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.body, undefined);
    ok(WithDtoClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.query);
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.skipSchemaEmissionStrings> satisfies null;
  });

  it('Should handle form data', async () => {
    let formData = new FormData();
    formData.append('hello', 'world');

    const result = await WithDtoClientControllerRPC.handleFormData({
      body: formData,
      query: { search: 'value' },
    });
    const expected = {
      formData: {
        hello: 'world',
      },
      search: 'value',
    };
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleFormData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithDtoClientControllerRPC.handleFormData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      await WithDtoClientControllerRPC.handleFormData({
        body: formData,
        query: { search: 'value' },
      });
    });

    await rejects.toThrow(/Ajv validation failed. Invalid form on client: .*hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should store schema at handler.schema, handler.controllerSchema, handler.segmentSchema and handler.fullSchema', async () => {
    strictEqual(WithDtoClientControllerRPC.handleAll.schema.httpMethod, 'POST');
    strictEqual(WithDtoClientControllerRPC.handleAll.schema.path, 'all/{foo}/{bar}');
    strictEqual(WithDtoClientControllerRPC.handleAll.controllerSchema.prefix, 'with-dto');
    strictEqual(WithDtoClientControllerRPC.handleAll.controllerSchema.rpcModuleName, 'WithDtoClientControllerRPC');
    strictEqual(WithDtoClientControllerRPC.handleAll.segmentSchema.segmentName, 'foo/client');
    ok(WithDtoClientControllerRPC.handleAll.fullSchema.segments);
  });
});
