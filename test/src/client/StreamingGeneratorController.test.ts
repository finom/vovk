import type { Token, default as StreamingGeneratorController } from './StreamingGeneratorController';
import { expect, describe, xit, it } from '@jest/globals';
import { VovkYieldType } from 'vovk';
import { StreamingGeneratorControllerRPC } from 'vovk-client';
import { VovkControllerYieldType } from 'vovk';

const apiRoot = 'http://localhost:' + process.env.PORT + '/api';

describe('Streaming generator', () => {
  it('Should work with generator', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];

    using resp = await StreamingGeneratorControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkControllerYieldType<typeof StreamingGeneratorController.postWithStreaming> satisfies Token;
    null as unknown as VovkYieldType<typeof StreamingGeneratorControllerRPC.postWithStreaming> satisfies Token;

    expect(expected).toEqual(expectedCollected);
  });

  it('Should be able to cancel', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await StreamingGeneratorControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    let count = 0;

    for await (const message of resp) {
      if (++count === 2) await resp.cancel();
      expectedCollected.push(message);
    }

    expect(expected).toEqual(expectedCollected);
  });

  it('Should handle immediate errors', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));

    using resp = await StreamingGeneratorControllerRPC.postWithStreamingAndImmediateError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    await expect(async () => {
      for await (const message of resp) {
        throw new Error('This should not be called ' + String(message));
      }
    }).rejects.toThrowError(/Immediate error/);
  });

  it('Should handle errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    await expect(async () => {
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    }).rejects.toThrowError(/velyka dupa/);

    expect(expected).toEqual(expectedCollected);
  });

  it('Should handle custom errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedCustomError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    // TODO I don't know why rejects.toThrowError doesn't work here
    const call = async () => {
      try {
        for await (const message of resp) {
          expectedCollected.push(message);
        }
      } catch (e) {
        return e;
      }
    };

    expect(await call()).toEqual({ customError: 'custom error' });

    expect(expected).toEqual(expectedCollected);
  });

  // TODO: Stream never ends if not using dispose. No error when using dispose. Need help here.
  xit('Should handle unhandled errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await StreamingGeneratorControllerRPC.postWithStreamingAndDelayedUnhandledError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    await expect(async () => {
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    }).rejects.toThrow();

    expect(expected).toEqual(expectedCollected);
  });
});
