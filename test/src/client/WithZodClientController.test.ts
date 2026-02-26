import test, { it, describe } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { WithZodClientControllerRPC } from 'vovk-client';
import { validateOnClient as validateOnClientAjv } from '../../../packages/vovk-ajv/index.ts';
import {
  HttpException,
  type VovkReturnType,
  type VovkYieldType,
  type VovkOutput,
  type VovkIteration,
  type VovkBody,
} from 'vovk';
import type WithZodClientController from './WithZodClientController.ts';
import { expectPromise, getConstrainingObject, NESTED_QUERY_EXAMPLE } from '../lib.ts';

describe('Client validation with custom AJV options', () => {
  it('Should handle body validation: with options', async () => {
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

      await rejects.toThrow(new RegExp(`Validation failed. Invalid body: .*${key}.*`));
      await rejects.toThrowError(HttpException);

      ({ rejects } = expectPromise(async () => {
        await WithZodClientControllerRPC.handleSchemaConstraints({
          body: constrainingObject,
        });
      }));
      await rejects.toThrow(new RegExp(`Client-side validation failed. Invalid body. data\\/${key}.*`));
    });
  }
});

describe('Validation with with zod and validateOnClient defined at settings', () => {
  it('Should be OK', async () => {
    const result = await WithZodClientControllerRPC.handleAll({
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
    let result = await WithZodClientControllerRPC.handleNothitng({});
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });
    result = await WithZodClientControllerRPC.handleNothitng({
      // @ts-expect-error Expect error
      body: { no: 'body' },
    });
    deepStrictEqual(result satisfies { nothing: 'here' }, { nothing: 'here' });
  });

  it('Should handle body validation and client', async () => {
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

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleBody({
        body: {
          hello: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid body: data\/hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle params validation and client', async () => {
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

    await rejects.toThrow(/Validation failed. Invalid params: .*foo.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleParams({
        params: {
          foo: 'wrong_length',
          bar: 'bar',
        },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid params: data\/foo.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle query validation and client', async () => {
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

    await rejects.toThrow(/Validation failed. Invalid query: .*search.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleQuery({
        query: {
          search: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid query: data\/search.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle nested queries and client', async () => {
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

    await rejects.toThrow(/Validation failed. Invalid query: .*x.*/);

    ({ rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          x: 'wrong_length',
        },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid query: data\/x.*/);
  });

  it('Should handle output validation', async () => {
    const result = await WithZodClientControllerRPC.handleOutput({
      query: { helloOutput: 'world' },
    });

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleOutput({
        query: { helloOutput: 'wrong_length' },
      });
    });

    await rejects.toThrow(/Validation failed. Invalid output: .*hello.*/);
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
    await rejects.toThrow(/Validation failed. Invalid iteration #0: .*value.*/);

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

  it('Should handle each iteration validation', async () => {
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
    await rejects.toThrow(/Validation failed. Invalid iteration #2: .*value.*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle stream first iteration validation on a responder', async () => {
    const tokens = ['wrong_length', 'b', 'c', 'd'];
    const expected: { value: string }[] = [];
    const expectedCollected: typeof expected = [];

    const { rejects } = expectPromise(async () => {
      const resp = await WithZodClientControllerRPC.handleResponderStream({
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

    const resp = await WithZodClientControllerRPC.handleResponderStream({
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
      const resp = await WithZodClientControllerRPC.validateEachResponderIteration({
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

    await rejects.toThrow(/Validation failed. Invalid query: .*search.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should skip schema emission with boolean value', async () => {
    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.skipSchemaEmissionBool({
        body: { hello: 'wrong_length' },
        query: { search: 'value' },
      });
    });
    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
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
    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    strictEqual(WithZodClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.body, undefined);
    ok(WithZodClientControllerRPC.skipSchemaEmissionStrings.schema.validation?.query);
  });

  it('Should handle multipart data only', async () => {
    let formData = new FormData();
    formData.append('hello', 'world');

    type BodyType = VovkBody<typeof WithZodClientControllerRPC.handleMultipartDataOnly>;
    null as unknown as BodyType satisfies FormData | Blob;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies URLSearchParams;

    const result = await WithZodClientControllerRPC.handleMultipartDataOnly({
      body: formData,
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<
      typeof WithZodClientControllerRPC.handleMultipartDataOnly
    > satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleMultipartDataOnly> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      await WithZodClientControllerRPC.handleMultipartDataOnly({
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

    type BodyType = VovkBody<typeof WithZodClientControllerRPC.handleMultipartAndJsonData>;
    null as unknown as BodyType satisfies FormData | { hello: string } | Blob;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies URLSearchParams;

    const result = await WithZodClientControllerRPC.handleMultipartAndJsonData({
      body: formData,
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<
      typeof WithZodClientControllerRPC.handleMultipartAndJsonData
    > satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleMultipartAndJsonData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      await WithZodClientControllerRPC.handleMultipartAndJsonData({
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

    type BodyType = VovkBody<typeof WithZodClientControllerRPC.handleUrlEncodedData>;
    null as unknown as BodyType satisfies URLSearchParams | FormData | Blob;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies { hello: string };
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies FormData;

    const result = await WithZodClientControllerRPC.handleUrlEncodedData({
      body: urlSearchParams,
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleUrlEncodedData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleUrlEncodedData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      const wrongUrlSearchParams = new URLSearchParams();
      wrongUrlSearchParams.append('hello', 'wrong_length');
      await WithZodClientControllerRPC.handleUrlEncodedData({
        body: wrongUrlSearchParams,
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle text/plain data', async () => {
    type BodyType = VovkBody<typeof WithZodClientControllerRPC.handleTextPlainData>;
    null as unknown as BodyType satisfies string | Blob;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies FormData;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies URLSearchParams;

    const result = await WithZodClientControllerRPC.handleTextPlainData({
      body: 'world',
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      search: 'foo',
    };
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleTextPlainData> satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleTextPlainData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleTextPlainData({
        body: 'world wrong_length',
        query: { search: 'foo' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Too big: expected string to have <=5 characters/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle binary data', async () => {
    type BodyType = VovkBody<typeof WithZodClientControllerRPC.handleOctetStreamData>;
    null as unknown as BodyType satisfies ArrayBuffer | Uint8Array | Blob;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies string;
    // @ts-expect-error Expect error
    null as unknown as BodyType satisfies FormData;

    const result = await WithZodClientControllerRPC.handleOctetStreamData({
      body: new File([new Uint8Array([137, 80, 78, 71])], 'myfile.png', { type: 'image/png' }),
    });
    const expected = {
      fileName: 'myfile.png',
    };
    null as unknown as VovkReturnType<
      typeof WithZodClientControllerRPC.handleOctetStreamData
    > satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleOctetStreamData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);
  });

  it('Should handle binary or JSON data', async () => {
    let result = await WithZodClientControllerRPC.handleOctetStreamOrJsonData({
      body: new File([new Uint8Array([137, 80, 78, 71])], 'myfile.png', { type: 'image/png' }),
    });
    const expected = {
      type: 'image/png',
      hello: 'none',
    };
    null as unknown as VovkReturnType<
      typeof WithZodClientControllerRPC.handleOctetStreamOrJsonData
    > satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleOctetStreamOrJsonData> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    result = await WithZodClientControllerRPC.handleOctetStreamOrJsonData({
      body: { hello: 'world' },
    });
    const expectedJson = {
      type: 'none',
      hello: 'world',
    };
    null as unknown as VovkReturnType<
      typeof WithZodClientControllerRPC.handleOctetStreamOrJsonData
    > satisfies typeof expectedJson;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleOctetStreamOrJsonData> satisfies null;
    deepStrictEqual(result satisfies typeof expectedJson, expectedJson);
  });

  it('Should handle multipart data with file', async () => {
    let formData = new FormData();
    formData.append('hello', 'world');
    formData.append('file', new Blob(['file_text_content'], { type: 'text/plain' }), 'file.txt');

    const result = await WithZodClientControllerRPC.handleMultipartDataWithFile({
      body: formData,
      query: { search: 'foo' },
    });
    const expected = {
      hello: 'world',
      file: 'file_text_content',
      search: 'foo',
    };
    null as unknown as VovkReturnType<
      typeof WithZodClientControllerRPC.handleMultipartDataWithFile
    > satisfies typeof expected;
    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleFormDataWithFile> satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    let { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      formData.append('file', new Blob(['file content'], { type: 'text/plain' }), 'file.txt');
      await WithZodClientControllerRPC.handleMultipartDataWithFile({
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
      await WithZodClientControllerRPC.handleMultipartDataWithFile({
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
      await WithZodClientControllerRPC.handleMultipartDataWithFile({
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

    const result = await WithZodClientControllerRPC.handleMultipartDataWithMultipleFiles({
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
      typeof WithZodClientControllerRPC.handleMultipartDataWithMultipleFiles
    > satisfies typeof expected;

    null as unknown as VovkReturnType<
      typeof WithZodClientControllerRPC.handleMultipartDataWithMultipleFiles
      // @ts-expect-error Expect error
    > satisfies null;
    deepStrictEqual(result satisfies typeof expected, expected);

    let { rejects } = expectPromise(async () => {
      formData = new FormData();
      formData.append('hello', 'wrong_length');
      formData.append('files', new Blob(['file content'], { type: 'text/plain' }), 'file1.txt');
      formData.append('files', new Blob(['file content'], { type: 'text/plain' }), 'file2.txt');
      await WithZodClientControllerRPC.handleMultipartDataWithMultipleFiles({
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
      await WithZodClientControllerRPC.handleMultipartDataWithMultipleFiles({
        body: formData,
        query: { search: 'foo' },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid body: .*files.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should store schema at handler.schema, handler.controllerSchema, handler.segmentSchema and handler.fullSchema', async () => {
    strictEqual(WithZodClientControllerRPC.handleAll.schema.httpMethod, 'POST');
    strictEqual(WithZodClientControllerRPC.handleAll.schema.path, 'all/{foo}/{bar}');
    strictEqual(WithZodClientControllerRPC.handleAll.controllerSchema.prefix, 'with-zod');
    strictEqual(WithZodClientControllerRPC.handleAll.controllerSchema.rpcModuleName, 'WithZodClientControllerRPC');
    strictEqual(WithZodClientControllerRPC.handleAll.segmentSchema.segmentName, 'foo/client');
    ok(WithZodClientControllerRPC.handleAll.fullSchema.segments);
  });
});

// NOTE: Not implemented for Yup and Dto
describe('Controller method as function with func', () => {
  it('Should be able to use controller method as function with HTTP decorator', async () => {
    const result = await WithZodClientControllerRPC.handleAllAsFunction({
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

    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleAllAsFunction> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithZodClientControllerRPC.handleAllAsFunction> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithZodClientController.handleAllAsFunction> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleAllAsFunction> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithZodClientControllerRPC.handleAllAsFunction> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithZodClientController.handleAllAsFunction> satisfies null;

    deepStrictEqual(result satisfies typeof expected, expected);
  });

  it('Should be able to use controller method as function without HTTP decorator', async () => {
    const result = await WithZodClientControllerRPC.handleAllNoHttpAsFunction({
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

    null as unknown as VovkReturnType<
      typeof WithZodClientControllerRPC.handleAllNoHttpAsFunction
    > satisfies typeof expected;
    null as unknown as VovkOutput<
      typeof WithZodClientControllerRPC.handleAllNoHttpAsFunction
    > satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithZodClientController.handleAllNoHttpAsFunction> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithZodClientControllerRPC.handleAllNoHttpAsFunction> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithZodClientControllerRPC.handleAllNoHttpAsFunction> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithZodClientController.handleAllNoHttpAsFunction> satisfies null;

    deepStrictEqual(result satisfies typeof expected, expected);
  });
});

describe('Content-type validation: wildcard and partial wildcard', () => {
  it('Should handle wildcard */* content type with a custom MIME type', async () => {
    const result = await WithZodClientControllerRPC.handleWildcardContentType({
      body: new File(['custom data'], 'test.bin', { type: 'application/custom-type' }),
    });
    deepStrictEqual(result, { size: 11, type: 'application/custom-type' });
  });

  it('Should handle wildcard */* content type with an image MIME type', async () => {
    const result = await WithZodClientControllerRPC.handleWildcardContentType({
      body: new File(['binary'], 'test.png', { type: 'image/png' }),
    });
    deepStrictEqual(result, { size: 6, type: 'image/png' });
  });

  it('Should handle image/* partial wildcard content type', async () => {
    const result = await WithZodClientControllerRPC.handleImageWildcard({
      body: new File(['png binary data'], 'photo.png', { type: 'image/png' }),
    });
    deepStrictEqual(result, { size: 15, type: 'image/png' });
  });

  it('Should handle image/* partial wildcard with different image subtypes', async () => {
    const result = await WithZodClientControllerRPC.handleImageWildcard({
      body: new File(['png content'], 'icon.png', { type: 'image/png' }),
    });
    deepStrictEqual(result, { size: 11, type: 'image/png' });
  });

  it('Should reject wrong content type for image/* endpoint', async () => {
    const { rejects } = expectPromise(async () => {
      await WithZodClientControllerRPC.handleImageWildcard({
        body: new File(['not an image'], 'data.txt', { type: 'text/plain' }),
        disableClientValidation: true,
      });
    });
    await rejects.toThrow(/Unsupported media type: text\/plain/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle application/octet-stream binary content type', async () => {
    const content = 'binary content here';
    const result = await WithZodClientControllerRPC.handleBinaryOctetStream({
      body: new File([content], 'data.bin', { type: 'application/octet-stream' }),
    });
    deepStrictEqual(result, { size: content.length, content });
  });
});

describe('Body re-readability after validation (bufferBody workaround)', () => {
  it('Should allow reading JSON body via req.json(), req.text(), req.arrayBuffer(), req.blob() after validation', async () => {
    const body = { hello: 'world' };
    const result = await WithZodClientControllerRPC.handleJsonRereadAfterValidation({ body });
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
      await WithZodClientControllerRPC.handleJsonRereadAfterValidation({
        body: { hello: 'wrong_length' },
        disableClientValidation: true,
      });
    });
    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should allow reading text body via req.text() and req.arrayBuffer() after validation', async () => {
    const text = 'hello';
    const result = await WithZodClientControllerRPC.handleTextRereadAfterValidation({ body: text });
    const expectedByteLength = new TextEncoder().encode(text).byteLength;

    strictEqual(result.vovkBody, text);
    strictEqual(result.fromText, text);
    strictEqual(result.arrayBufferByteLength, expectedByteLength);
  });

  it('Should allow reading form data via req.formData() after validation', async () => {
    const formData = new FormData();
    formData.append('name', 'John');

    const result = await WithZodClientControllerRPC.handleFormDataRereadAfterValidation({
      body: formData,
    });

    deepStrictEqual(result.vovkBody, { name: 'John' });
    deepStrictEqual(result.formDataKeys, ['name']);
  });

  it('Should allow reading binary body via req.blob(), req.arrayBuffer(), and req.bytes() after validation', async () => {
    const content = 'binary content here';
    const file = new File([content], 'data.bin', { type: 'application/octet-stream' });

    const result = await WithZodClientControllerRPC.handleBinaryRereadAfterValidation({
      body: file,
    });

    strictEqual(result.vovkBodyContent, content);
    strictEqual(result.blobSize, file.size);
    strictEqual(result.arrayBufferByteLength, file.size);
    strictEqual(result.bytesLength, file.size);
  });
});
