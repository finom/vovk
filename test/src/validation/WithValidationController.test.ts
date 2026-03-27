import test, { it, describe } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { WithValidationRPC } from 'vovk-client';
import { validateOnClient as validateOnClientAjv } from '../../../packages/vovk-ajv/index.ts';
import {
  HttpException,
  type VovkReturnType,
  type VovkYieldType,
  type VovkOutput,
  type VovkIteration,
  type VovkBody,
  type VovkInput,
} from 'vovk';
import type WithValidationController from './WithValidationController.ts';
import { expectPromise, getConstrainingObject, NESTED_QUERY_EXAMPLE } from '../lib.ts';

describe('Client validation with custom AJV options', () => {
  it('Should handle body validation: with options', async () => {
    const result = await WithValidationRPC.handleBody({
      body: { hello: 'world' },
    });

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleBody({
        body: {
          hello: 'wrong_length',
        },
        validateOnClient: validateOnClientAjv.configure({
          options: {
            verbose: true,
          },
        }),
      });
    });

    await rejects.toThrow(
      /Client-side validation failed. Invalid body: data\/hello must NOT have more than 5 characters/
    );
    await rejects.toThrowError(HttpException);
  });
});

describe('Zod-to-JSONchema constraints', async () => {
  const noConstraints = getConstrainingObject(null);

  await test('Should handle valid object', async () => {
    // first check if the object is valid
    await WithValidationRPC.handleSchemaConstraints({
      body: noConstraints,
    });
  });

  for (const key of Object.keys(noConstraints)) {
    await test(`Should handle ${key} constraint`, async () => {
      const constrainingObject = getConstrainingObject(key);
      let { rejects } = expectPromise(async () => {
        await WithValidationRPC.handleSchemaConstraints({
          body: constrainingObject,
          disableClientValidation: true,
        });
      });

      await rejects.toThrow(new RegExp(`Validation failed. Invalid body: .*${key}.*`));
      await rejects.toThrowError(HttpException);

      ({ rejects } = expectPromise(async () => {
        await WithValidationRPC.handleSchemaConstraints({
          body: constrainingObject,
        });
      }));
      await rejects.toThrow(new RegExp(`Client-side validation failed. Invalid body. data\\/${key}.*`));
    });
  }
});

describe('Validation with with zod and validateOnClient defined at settings', () => {
  it('Should be OK', async () => {
    const result = await WithValidationRPC.handleAll({
      body: { hello: 'world' },
      query: { search: 'value' },
      params: { foo: 'foo-val', bar: 'bar-val' },
    });

    const expected = {
      body: { hello: 'world' },
      query: { search: 'value' },
      params: { foo: 'foo-val', bar: 'bar-val' },
      vovkParams: { foo: 'foo-val', bar: 'bar-val' },
    };

    null as unknown as VovkReturnType<typeof WithValidationRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithValidationRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithValidationController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithValidationRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithValidationController.handleAll> satisfies null;

    // VovkInput should contain all three when all are defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleAll> satisfies {
      body: { hello: string };
      query: { search: string };
      params: { foo: string; bar: string };
    };
    null as unknown as VovkInput<typeof WithValidationController.handleAll> satisfies {
      body: { hello: string };
      query: { search: string };
      params: { foo: string; bar: string };
    };

    deepStrictEqual(result satisfies typeof expected, expected);
  });

  it('Should handle nothitng', async () => {
    let result = await WithValidationRPC.handleNothitng({});
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });
    result = await WithValidationRPC.handleNothitng({
      // @ts-expect-error Expect error
      body: { no: 'body' },
    });
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });

    // VovkInput should be empty when no inputs are defined
    // @ts-expect-error body should not exist on VovkInput when not defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleNothitng> satisfies { body: unknown };
    // @ts-expect-error query should not exist on VovkInput when not defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleNothitng> satisfies { query: unknown };
    // @ts-expect-error params should not exist on VovkInput when not defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleNothitng> satisfies { params: unknown };
  });

  it('Should handle body validation and client', async () => {
    const result = await WithValidationRPC.handleBody({
      body: { hello: 'world' },
    });

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    let { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleBody({
        body: {
          hello: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithValidationRPC.handleBody({
        body: {
          hello: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid body: data\/hello.*/);
    await rejects.toThrowError(HttpException);

    // VovkInput should only contain body (no query or params)
    null as unknown as VovkInput<typeof WithValidationRPC.handleBody> satisfies { body: { hello: string } };
    // @ts-expect-error query should not exist on VovkInput when not defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleBody> satisfies { query: unknown };
    // @ts-expect-error params should not exist on VovkInput when not defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleBody> satisfies { params: unknown };
  });

  it('Should handle params validation and client', async () => {
    const result = await WithValidationRPC.handleParams({
      params: { foo: 'foo', bar: 'bar' },
    });

    deepStrictEqual(result satisfies { foo: string; bar: string }, { foo: 'foo', bar: 'bar' });

    let { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleParams({
        params: {
          foo: 'wrong_length',
          bar: 'bar',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid params: .*foo.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithValidationRPC.handleParams({
        params: {
          foo: 'wrong_length',
          bar: 'bar',
        },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid params: data\/foo.*/);
    await rejects.toThrowError(HttpException);

    // VovkInput should only contain params (no body or query)
    null as unknown as VovkInput<typeof WithValidationRPC.handleParams> satisfies {
      params: { foo: string; bar: string };
    };
    // @ts-expect-error body should not exist on VovkInput when not defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleParams> satisfies { body: unknown };
    // @ts-expect-error query should not exist on VovkInput when not defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleParams> satisfies { query: unknown };
  });

  it('Should handle query validation and client', async () => {
    const result = await WithValidationRPC.handleQuery({
      query: { search: 'value' },
    });

    deepStrictEqual(result satisfies { search: string }, { search: 'value' });

    let { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleQuery({
        query: {
          search: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid query: .*search.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithValidationRPC.handleQuery({
        query: {
          search: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid query: data\/search.*/);
    await rejects.toThrowError(HttpException);

    // VovkInput should only contain query (no body or params)
    null as unknown as VovkInput<typeof WithValidationRPC.handleQuery> satisfies { query: { search: string } };
    // @ts-expect-error body should not exist on VovkInput when not defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleQuery> satisfies { body: unknown };
    // @ts-expect-error params should not exist on VovkInput when not defined
    null as unknown as VovkInput<typeof WithValidationRPC.handleQuery> satisfies { params: unknown };
  });

  it('Should handle nested queries and client', async () => {
    const result = await WithValidationRPC.handleNestedQuery({
      query: NESTED_QUERY_EXAMPLE,
    });

    deepStrictEqual(result satisfies VovkReturnType<typeof WithValidationRPC.handleNestedQuery>, NESTED_QUERY_EXAMPLE);

    let { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          x: 'wrong_length',
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid query: .*x.*/);

    ({ rejects } = expectPromise(async () => {
      await WithValidationRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          x: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid query: data\/x.*/);
  });

  it('Should handle output validation', async () => {
    const result = await WithValidationRPC.handleOutput({
      query: { helloOutput: 'world' },
    });

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleOutput({
        query: { helloOutput: 'wrong_length' },
      });
    });

    await rejects.toThrow(/Validation failed. Invalid output: .*hello.*/);
  });

  it('Should handle stream', async () => {
    const tokens = ['a', 'b', 'c', 'd'];
    const expected = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const resp = await WithValidationRPC.handleStream({
      query: { values: tokens },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkYieldType<typeof WithValidationController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithValidationRPC.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithValidationController.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithValidationRPC.handleStream> satisfies { value: string };

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle stream without iteration validation and infer yield type', async () => {
    const tokens = ['a', 'b', 'c', 'd'];
    const expected = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const resp = await WithValidationRPC.handleStreamNoIterationValidation({
      query: { values: tokens },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
      message satisfies { value: string };
      // @ts-expect-error Should not be any
      message satisfies null;
    }

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle stream first iteration validation', async () => {
    const tokens = ['wrong_length', 'b', 'c', 'd'];
    const expected: { value: string }[] = [];
    const expectedCollected: typeof expected = [];

    const { rejects } = expectPromise(async () => {
      const resp = await WithValidationRPC.handleStream({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/Validation failed. Invalid iteration #0: .*value.*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should ignore non-first iteration validation', async () => {
    const tokens = ['a', 'b', 'wrong_length', 'd'];
    const expected: { value: string }[] = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const resp = await WithValidationRPC.handleStream({
      query: { values: tokens },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle each iteration validation', async () => {
    const tokens = ['a', 'b', 'wrong_length', 'd'];

    const expected: { value: string }[] = tokens.slice(0, 2).map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const { rejects } = expectPromise(async () => {
      const resp = await WithValidationRPC.validateEachIteration({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/Validation failed. Invalid iteration #2: .*value.*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle stream first iteration validation on a responder', async () => {
    const tokens = ['wrong_length', 'b', 'c', 'd'];
    const expected: { value: string }[] = [];
    const expectedCollected: typeof expected = [];

    const { rejects } = expectPromise(async () => {
      const resp = await WithValidationRPC.handleResponderStream({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/Validation failed. Invalid iteration #0: .*value.*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should ignore non-first iteration validation on a responder', async () => {
    const tokens = ['a', 'b', 'wrong_length', 'd'];
    const expected: { value: string }[] = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const resp = await WithValidationRPC.handleResponderStream({
      query: { values: tokens },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle each iteration validation on a responder', async () => {
    const tokens = ['a', 'b', 'wrong_length', 'd'];

    const expected: { value: string }[] = tokens.slice(0, 2).map((value) => ({ value }));
    const expectedCollected: typeof expected = [];
    const { rejects } = expectPromise(async () => {
      const resp = await WithValidationRPC.validateEachResponderIteration({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/Validation failed. Invalid iteration #2: .*value.*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should skip server-side validation with boolean value', async () => {
    const result = await WithValidationRPC.disableServerSideValidationBool({
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
    const result = await WithValidationRPC.disableServerSideValidationStrings({
      body: { hello: 'wrong_length' },
      query: { search: 'value' },
      disableClientValidation: true,
    });

    deepStrictEqual(result satisfies { search: string; body: { hello: string } }, {
      search: 'value',
      body: { hello: 'wrong_length' },
    });

    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.disableServerSideValidationStrings({
        body: { hello: 'world' },
        query: { search: 'wrong_length' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid query: .*search.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should skip schema emission with boolean value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.skipSchemaEmissionBool({
        body: { hello: 'wrong_length' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    strictEqual(WithValidationRPC.skipSchemaEmissionBool.schema.validation?.body, undefined);
    strictEqual(WithValidationRPC.skipSchemaEmissionBool.schema.validation?.query, undefined);
  });

  it('Should skip schema emission with string[] value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.skipSchemaEmissionStrings({
        body: { hello: 'wrong_length' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    strictEqual(WithValidationRPC.skipSchemaEmissionStrings.schema.validation?.body, undefined);
    ok(WithValidationRPC.skipSchemaEmissionStrings.schema.validation?.query);
  });

  it('Should handle multipart data only', async () => {
    let formData = new FormData();
    formData.append('hello', 'world');

    type BodyType = VovkBody<typeof WithValidationRPC.handleMultipartDataOnly>;
    null as unknown as BodyType satisfies FormData | Blob | { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies URLSearchParams;

    const result = await WithValidationRPC.handleMultipartDataOnly({
      body: formData,
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleMultipartDataOnly> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleMultipartDataOnly> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      await WithValidationRPC.handleMultipartDataOnly({
        body: formData,
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle multipart data onl but use object as input', async () => {
    let formData = { hello: 'world' };

    type BodyType = VovkBody<typeof WithValidationRPC.handleMultipartDataOnly>;
    null as unknown as BodyType satisfies FormData | Blob | { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies URLSearchParams;

    const result = await WithValidationRPC.handleMultipartDataOnly({
      body: formData,
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleMultipartDataOnly> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleMultipartDataOnly> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      formData = { hello: 'wrong_length' };
      await WithValidationRPC.handleMultipartDataOnly({
        body: formData,
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle multipart and json data', async () => {
    let formData = new FormData();
    formData.append('hello', 'world');

    type BodyType = VovkBody<typeof WithValidationRPC.handleMultipartAndJsonData>;
    null as unknown as BodyType satisfies FormData | { hello: string } | Blob;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies URLSearchParams;

    const result = await WithValidationRPC.handleMultipartAndJsonData({
      body: formData,
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleMultipartAndJsonData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleMultipartAndJsonData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      await WithValidationRPC.handleMultipartAndJsonData({
        body: formData,
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle urlencoded data', async () => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('hello', 'world');

    type BodyType = VovkBody<typeof WithValidationRPC.handleUrlEncodedData>;
    null as unknown as BodyType satisfies URLSearchParams | FormData | Blob | { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies FormData;

    const result = await WithValidationRPC.handleUrlEncodedData({
      body: urlSearchParams,
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleUrlEncodedData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleUrlEncodedData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      const wrongUrlSearchParams = new URLSearchParams();
      wrongUrlSearchParams.append('hello', 'wrong_length');
      await WithValidationRPC.handleUrlEncodedData({
        body: wrongUrlSearchParams,
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle text/plain data', async () => {
    type BodyType = VovkBody<typeof WithValidationRPC.handleTextPlainData>;
    null as unknown as BodyType satisfies string | Blob;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies FormData;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies URLSearchParams;

    const result = await WithValidationRPC.handleTextPlainData({
      body: 'world',
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleTextPlainData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleTextPlainData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleTextPlainData({
        body: 'world wrong_length',
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Too big: expected string to have <=5 characters/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle binary data', async () => {
    type BodyType = VovkBody<typeof WithValidationRPC.handleOctetStreamData>;
    null as unknown as BodyType satisfies ArrayBuffer | Uint8Array | Blob;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies string;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies FormData;

    const result = await WithValidationRPC.handleOctetStreamData({
      body: new File([new Uint8Array([137, 80, 78, 71])], 'myfile.png', { type: 'image/png' }),
    });
    const expected = {
      fileName: 'myfile.png',
    };
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleOctetStreamData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleOctetStreamData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);
  });

  it('Should handle binary or JSON data', async () => {
    let result = await WithValidationRPC.handleOctetStreamOrJsonData({
      body: new File([new Uint8Array([137, 80, 78, 71])], 'myfile.png', { type: 'image/png' }),
    });
    const expected = {
      type: 'image/png',
      hello: 'none',
    };
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleOctetStreamOrJsonData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleOctetStreamOrJsonData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    result = await WithValidationRPC.handleOctetStreamOrJsonData({
      body: { hello: 'world' },
    });
    const expectedJson = {
      type: 'none',
      hello: 'world',
    };
    null as unknown as VovkReturnType<
      typeof WithValidationRPC.handleOctetStreamOrJsonData
    > satisfies typeof expectedJson;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleOctetStreamOrJsonData> satisfies null;
    deepStrictEqual(result satisfies typeof expectedJson, expectedJson);
  });

  it('Should handle multipart data with file', async () => {
    let formData = new FormData();
    formData.append('hello', 'world');
    formData.append('file', new Blob(['file_text_content'], { type: 'text/plain' }), 'file.txt');

    const result = await WithValidationRPC.handleMultipartDataWithFile({
      body: formData,
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      file: 'file_text_content',
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleMultipartDataWithFile> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleFormDataWithFile> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    let { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      formData.append('file', new Blob(['file content'], { type: 'text/plain' }), 'file.txt');
      await WithValidationRPC.handleMultipartDataWithFile({
        body: formData,
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);

    // No file
    ({ rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'world');
      await WithValidationRPC.handleMultipartDataWithFile({
        body: formData,
        query: { search: 'foo' },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid body: .*file.*/);
    await rejects.toThrowError(HttpException);

    // No file
    ({ rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'world');
      await WithValidationRPC.handleMultipartDataWithFile({
        body: formData,
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    }));

    await rejects.toThrow(/Validation failed. Invalid body: .*file.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle multipart data with multiple files', async () => {
    let formData = new FormData();
    formData.append('hello', 'world');
    formData.append('files', new Blob(['file_text_content1'], { type: 'text/plain' }), 'file1.txt');
    formData.append('files', new Blob(['file_text_content2'], { type: 'text/plain' }), 'file2.txt');

    const result = await WithValidationRPC.handleMultipartDataWithMultipleFiles({
      body: formData,
      query: { search: 'foo' },
      disableClientValidation: true,
    });
    const expected = {
      files: ['file_text_content1', 'file_text_content2'],
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<
      typeof WithValidationRPC.handleMultipartDataWithMultipleFiles
    > satisfies typeof expected;

    null as unknown as VovkReturnType<
      typeof WithValidationRPC.handleMultipartDataWithMultipleFiles
      // @ts-expect-error Expect error
    > satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    let { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      formData.append('files', new Blob(['file content'], { type: 'text/plain' }), 'file1.txt');
      formData.append('files', new Blob(['file content'], { type: 'text/plain' }), 'file2.txt');
      await WithValidationRPC.handleMultipartDataWithMultipleFiles({
        body: formData,
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);

    // No files
    ({ rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'world');
      await WithValidationRPC.handleMultipartDataWithMultipleFiles({
        body: formData,
        query: { search: 'foo' },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid body: .*files.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should store schema at handler.schema, handler.controllerSchema, handler.segmentSchema and handler.fullSchema', async () => {
    strictEqual(WithValidationRPC.handleAll.schema.httpMethod, 'POST');
    strictEqual(WithValidationRPC.handleAll.schema.path, 'all/{foo}/{bar}');
    strictEqual(WithValidationRPC.handleAll.controllerSchema.prefix, 'with-zod');
    strictEqual(WithValidationRPC.handleAll.controllerSchema.rpcModuleName, 'WithValidationRPC');
    strictEqual(WithValidationRPC.handleAll.segmentSchema.segmentName, 'foo/client');
    ok(WithValidationRPC.handleAll.fullSchema.segments);
  });
});

// NOTE: Not implemented for Yup and Dto
describe('Controller method as function with func', () => {
  it('Should be able to use controller method as function with HTTP decorator', async () => {
    const result = await WithValidationRPC.handleAllAsFunction({
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

    null as unknown as VovkReturnType<typeof WithValidationRPC.handleAllAsFunction> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithValidationRPC.handleAllAsFunction> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithValidationController.handleAllAsFunction> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleAllAsFunction> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithValidationRPC.handleAllAsFunction> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithValidationController.handleAllAsFunction> satisfies null;

    deepStrictEqual(result satisfies typeof expected, expected);
  });

  it('Should be able to use controller method as function without HTTP decorator', async () => {
    const result = await WithValidationRPC.handleAllNoHttpAsFunction({
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

    null as unknown as VovkReturnType<typeof WithValidationRPC.handleAllNoHttpAsFunction> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithValidationRPC.handleAllNoHttpAsFunction> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithValidationController.handleAllNoHttpAsFunction> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleAllNoHttpAsFunction> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithValidationRPC.handleAllNoHttpAsFunction> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithValidationController.handleAllNoHttpAsFunction> satisfies null;

    deepStrictEqual(result satisfies typeof expected, expected);
  });
});

describe('Content-type validation: wildcard and partial wildcard', () => {
  it('Should handle wildcard */* content type with a custom MIME type', async () => {
    const result = await WithValidationRPC.handleWildcardContentType({
      body: new File(['custom data'], 'test.bin', { type: 'application/custom-type' }),
    });
    deepStrictEqual(result, { size: 11, type: 'application/custom-type' });
  });

  it('Should handle wildcard */* content type with an image MIME type', async () => {
    const result = await WithValidationRPC.handleWildcardContentType({
      body: new File(['binary'], 'test.png', { type: 'image/png' }),
    });
    deepStrictEqual(result, { size: 6, type: 'image/png' });
  });

  it('Should handle wildcard */* content type with JSON body', async () => {
    const result = await WithValidationRPC.handleWildcardContentTypeWithJsonBody({
      body: { hello: 'world' },
    });
    deepStrictEqual(result, { hello: 'world' });
  });

  it('Should handle wildcard */* content type with FormData body', async () => {
    const formData = new FormData();
    formData.append('hello', 'world');
    const result = await WithValidationRPC.handleWildcardContentTypeWithJsonBody({
      body: formData,
    });
    deepStrictEqual(result, { hello: 'world' });
  });

  it('Should handle wildcard */* content type with Blob body', async () => {
    const result = await WithValidationRPC.handleWildcardContentType({
      body: new Blob(['blob data'], { type: 'application/octet-stream' }),
    });
    deepStrictEqual(result, { size: 9, type: 'application/octet-stream' });
  });

  it('Should handle image/* partial wildcard content type', async () => {
    const result = await WithValidationRPC.handleImageWildcard({
      body: new File(['png binary data'], 'photo.png', { type: 'image/png' }),
    });
    deepStrictEqual(result, { size: 15, type: 'image/png' });
  });

  it('Should handle image/* partial wildcard with different image subtypes', async () => {
    const result = await WithValidationRPC.handleImageWildcard({
      body: new File(['png content'], 'icon.png', { type: 'image/png' }),
    });
    deepStrictEqual(result, { size: 11, type: 'image/png' });
  });

  it('Should reject wrong content type for image/* endpoint', async () => {
    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleImageWildcard({
        body: new File(['not an image'], 'data.txt', { type: 'text/plain' }),
        disableClientValidation: true,
      });
    });
    await rejects.toThrow(/Unsupported media type: text\/plain/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle application/octet-stream binary content type', async () => {
    const content = 'binary content here';
    const result = await WithValidationRPC.handleBinaryOctetStream({
      body: new File([content], 'data.bin', { type: 'application/octet-stream' }),
    });
    deepStrictEqual(result, { size: content.length, content });
  });
});

describe('String contentType (not array)', () => {
  it('Should handle application/json as a string contentType', async () => {
    const result = await WithValidationRPC.handleStringContentTypeJson({
      body: { hello: 'world' },
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleStringContentTypeJson> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationRPC.handleStringContentTypeJson> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleStringContentTypeJson({
        body: { hello: 'wrong_length' },
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle text/plain as a string contentType', async () => {
    type BodyType = VovkBody<typeof WithValidationRPC.handleStringContentTypeTextPlain>;
    null as unknown as BodyType satisfies string | Blob;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies FormData;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies URLSearchParams;

    const result = await WithValidationRPC.handleStringContentTypeTextPlain({
      body: 'world',
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<
      typeof WithValidationRPC.handleStringContentTypeTextPlain
    > satisfies typeof expected;
    null as unknown as VovkReturnType<
      typeof WithValidationRPC.handleStringContentTypeTextPlain
      // @ts-expect-error Expect error
    > satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleStringContentTypeTextPlain({
        body: 'world wrong_length',
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Too big: expected string to have <=5 characters/);
    await rejects.toThrowError(HttpException);
  });
});

describe('Body re-readability after validation (bufferBody workaround)', () => {
  it('Should allow reading JSON body via req.json(), req.text(), req.arrayBuffer(), req.blob() after validation', async () => {
    const body = { hello: 'world' };
    const result = await WithValidationRPC.handleJsonRereadAfterValidation({ body });
    const jsonStr = JSON.stringify(body);
    const expectedByteLength = new TextEncoder().encode(jsonStr).byteLength;

    deepStrictEqual(result.vovkBody, body);
    deepStrictEqual(result.fromJson, body);
    strictEqual(result.fromText, jsonStr);
    strictEqual(result.arrayBufferByteLength, expectedByteLength);
    strictEqual(result.blobSize, expectedByteLength);
  });

  it('Should still validate body and reject invalid JSON before re-read', async () => {
    const { rejects } = expectPromise(async () => {
      await WithValidationRPC.handleJsonRereadAfterValidation({
        body: { hello: 'wrong_length' },
        disableClientValidation: true,
      });
    });
    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should allow reading text body via req.text() and req.arrayBuffer() after validation', async () => {
    const text = 'hello';
    const result = await WithValidationRPC.handleTextRereadAfterValidation({ body: text });
    const expectedByteLength = new TextEncoder().encode(text).byteLength;

    strictEqual(result.vovkBody, text);
    strictEqual(result.fromText, text);
    strictEqual(result.arrayBufferByteLength, expectedByteLength);
  });

  it('Should allow reading form data via req.formData() after validation', async () => {
    const formData = new FormData();
    formData.append('name', 'John');

    const result = await WithValidationRPC.handleFormDataRereadAfterValidation({
      body: formData,
    });

    deepStrictEqual(result.vovkBody, { name: 'John' });
    deepStrictEqual(result.formDataKeys, ['name']);
  });

  it('Should allow reading binary body via req.blob(), req.arrayBuffer(), and req.bytes() after validation', async () => {
    const content = 'binary content here';
    const file = new File([content], 'data.bin', { type: 'application/octet-stream' });

    const result = await WithValidationRPC.handleBinaryRereadAfterValidation({
      body: file,
    });

    result satisfies {
      vovkBodyContent: string;
      blobSize: number;
      arrayBufferByteLength: number;
      bytesLength: number;
    };

    // @ts-expect-error Should not be any
    result satisfies null;

    strictEqual(result.vovkBodyContent, content);
    strictEqual(result.blobSize, file.size);
    strictEqual(result.arrayBufferByteLength, file.size);
    strictEqual(result.bytesLength, file.size);
  });
});
