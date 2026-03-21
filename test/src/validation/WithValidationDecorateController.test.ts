import { it, describe } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { WithValidationDecorateRPC } from 'vovk-client';
import { HttpException, type VovkReturnType, type VovkYieldType, type VovkOutput, type VovkIteration } from 'vovk';
import type WithValidationDecorateController from './WithValidationDecorateController.ts';
import { expectPromise } from '../lib.ts';

describe('decorate+procedure syntax', () => {
  it('Should handle all with decorate', async () => {
    const result = await WithValidationDecorateRPC.handleAll({
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

    null as unknown as VovkReturnType<typeof WithValidationDecorateRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithValidationDecorateRPC.handleAll> satisfies typeof expected;
    null as unknown as VovkOutput<typeof WithValidationDecorateController.handleAll> satisfies typeof expected;

    // @ts-expect-error Expect error
    null as unknown as VovkReturnType<typeof WithValidationDecorateRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithValidationDecorateRPC.handleAll> satisfies null;
    // @ts-expect-error Expect error
    null as unknown as VovkOutput<typeof WithValidationDecorateController.handleAll> satisfies null;

    deepStrictEqual(result satisfies typeof expected, expected);
  });

  it('Should handle body validation with decorate', async () => {
    const result = await WithValidationDecorateRPC.handleBody({
      body: { hello: 'world' },
    });

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    let { rejects } = expectPromise(async () => {
      await WithValidationDecorateRPC.handleBody({
        body: { hello: 'wrong_length' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid body: .*hello.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithValidationDecorateRPC.handleBody({
        body: { hello: 'wrong_length' },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid body: data\/hello.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle query validation with decorate', async () => {
    const result = await WithValidationDecorateRPC.handleQuery({
      query: { search: 'value' },
    });

    deepStrictEqual(result satisfies { search: string }, { search: 'value' });

    let { rejects } = expectPromise(async () => {
      await WithValidationDecorateRPC.handleQuery({
        query: { search: 'wrong_length' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid query: .*search.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithValidationDecorateRPC.handleQuery({
        query: { search: 'wrong_length' },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid query: data\/search.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle params validation with decorate', async () => {
    const result = await WithValidationDecorateRPC.handleParams({
      params: { foo: 'foo', bar: 'bar' },
    });

    deepStrictEqual(result satisfies { foo: string; bar: string }, { foo: 'foo', bar: 'bar' });

    let { rejects } = expectPromise(async () => {
      await WithValidationDecorateRPC.handleParams({
        params: { foo: 'wrong_length', bar: 'bar' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid params: .*foo.*/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expectPromise(async () => {
      await WithValidationDecorateRPC.handleParams({
        params: { foo: 'wrong_length', bar: 'bar' },
      });
    }));

    await rejects.toThrow(/Client-side validation failed. Invalid params: data\/foo.*/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle output validation with decorate', async () => {
    const result = await WithValidationDecorateRPC.handleOutput({
      query: { helloOutput: 'world' },
    });

    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });

    const { rejects } = expectPromise(async () => {
      await WithValidationDecorateRPC.handleOutput({
        query: { helloOutput: 'wrong_length' },
      });
    });

    await rejects.toThrow(/Validation failed. Invalid output: .*hello.*/);
  });

  it('Should handle stream with decorate', async () => {
    const tokens = ['a', 'b', 'c', 'd'];
    const expected = tokens.map((value) => ({ value }));
    const expectedCollected: typeof expected = [];

    const resp = await WithValidationDecorateRPC.handleStream({
      query: { values: tokens },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkYieldType<typeof WithValidationDecorateController.handleStream> satisfies { value: string };
    null as unknown as VovkYieldType<typeof WithValidationDecorateRPC.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithValidationDecorateController.handleStream> satisfies { value: string };
    null as unknown as VovkIteration<typeof WithValidationDecorateRPC.handleStream> satisfies { value: string };

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle stream first iteration validation with decorate', async () => {
    const tokens = ['wrong_length', 'b', 'c', 'd'];
    const expected: { value: string }[] = [];
    const expectedCollected: typeof expected = [];

    const { rejects } = expectPromise(async () => {
      const resp = await WithValidationDecorateRPC.handleStream({
        query: { values: tokens },
      });
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    });
    await rejects.toThrow(/Validation failed. Invalid iteration #0: .*value.*/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should store schema at handler.schema for decorate handlers', async () => {
    strictEqual(WithValidationDecorateRPC.handleAll.schema.httpMethod, 'POST');
    strictEqual(WithValidationDecorateRPC.handleAll.schema.path, 'all/{foo}/{bar}');
  });
});
