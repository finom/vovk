import metadata from '../../.vovk.json';
import type { default as StreamingGeneratorController, Token } from './StreamingGeneratorController';
import { clientizeController } from '../../../packages/vovk/client';
import { it, expect, describe } from '@jest/globals';
import { VovkYieldType, VovkControlerYieldType } from '../../../packages/vovk';
import { _VovkControllerMetadata } from 'vovk/types';

type StreamingGeneratorControllerType = typeof StreamingGeneratorController;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = clientizeController<StreamingGeneratorControllerType>(
  metadata.StreamingGeneratorController as _VovkControllerMetadata,
  {
    defaultOptions: { prefix },
  }
);

describe('Streaming generator', () => {
  it('Should work with generator', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];

    using resp = await defaultController.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkControlerYieldType<StreamingGeneratorControllerType['postWithStreaming']> satisfies Token;
    null as unknown as VovkYieldType<typeof defaultController.postWithStreaming> satisfies Token;

    expect(expected).toEqual(expectedCollected);
  });

  it('Should be able to cancel', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await defaultController.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
    });

    let count = 0;

    for await (const message of resp) {
      if (++count === 2) await resp.cancel();
      expectedCollected.push(message);
    }

    expect(expected).toEqual(expectedCollected);
  });

  it('Should handle immediate errors', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));

    using resp = await defaultController.postWithStreamingAndImmediateError({
      body: tokens,
      query: { query: 'queryValue' },
    });

    await expect(async () => {
      for await (const message of resp) {
        throw new Error('This should not be called ' + String(message));
      }
    }).rejects.toThrowError(/Immediate error/);
  });

  it('Should handle errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await defaultController.postWithStreamingAndDelayedError({
      body: tokens,
      query: { query: 'queryValue' },
    });

    await expect(async () => {
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    }).rejects.toThrowError(/velyka dupa/);

    expect(expected).toEqual(expectedCollected);
  });

  it('Should handle custom errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await defaultController.postWithStreamingAndDelayedCustomError({
      body: tokens,
      query: { query: 'queryValue' },
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

  // TODO thrown: "Exceeded timeout of 5000 ms for a test". How to end the stream properly?
  it('Should handle unhandled errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await defaultController.postWithStreamingAndDelayedUnhandledError({
      body: tokens,
      query: { query: 'queryValue' },
    });

    await expect(async () => {
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    }).rejects.toThrow();

    expect(expected).toEqual(expectedCollected);
  });
});
