import { it, describe } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import type { Token, default as StreamingGeneratorController } from './StreamingGeneratorController';
import { StreamingGeneratorControllerRPC } from 'vovk-client';
import type { VovkControllerYieldType, VovkYieldType } from 'vovk';
import { expectPromise } from '../lib.ts';

const apiRoot = 'http://localhost:' + process.env.PORT + '/api';

describe('Streaming generator', () => {
  it('Should work with generator', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];

    const resp = await StreamingGeneratorControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkControllerYieldType<typeof StreamingGeneratorController.postWithStreaming> satisfies Token;
    null as unknown as VovkYieldType<typeof StreamingGeneratorControllerRPC.postWithStreaming> satisfies Token;

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should be able to cancel', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await StreamingGeneratorControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    let count = 0;

    for await (const message of resp) {
      if (++count === 2) await resp.cancel();
      expectedCollected.push(message);
    }

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle immediate errors', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));

    const resp = await StreamingGeneratorControllerRPC.postWithStreamingAndImmediateError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    await expectPromise(async () => {
      for await (const message of resp) {
        throw new Error('This should not be called ' + String(message));
      }
    }).rejects.toThrow(/Immediate error/);
  });

  it('Should handle errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    await expectPromise(async () => {
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    }).rejects.toThrow(/oh no/);

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle custom errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedCustomError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    const call = async () => {
      try {
        for await (const message of resp) {
          expectedCollected.push(message);
        }
      } catch (e) {
        return e;
      }
    };

    deepStrictEqual(await call(), { customError: 'custom error' });

    deepStrictEqual(expected, expectedCollected);
  });

  // TODO: Stream never ends if not using dispose. No error when using dispose. Need help here.
  it.skip('Should handle unhandled errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedUnhandledError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    await expectPromise(async () => {
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    }).rejects.toThrow();

    deepStrictEqual(expected, expectedCollected);
  });
});
