import metadata from '../vovk-metadata.json';
import type StreamingGeneratorController from './StreamingGeneratorController';
import { clientizeController } from '../../../src/client';
import { it, expect, describe, xit } from '@jest/globals';

type StreamingGeneratorControllerType = typeof StreamingGeneratorController;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = clientizeController<StreamingGeneratorControllerType>(metadata.StreamingGeneratorController, {
  defaultOptions: { prefix },
});

describe('Streaming generator', () => {
  xit('Should work with generator', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    expect(expected).toEqual(expectedCollected);
  });

  xit('Should work with generator', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithAsyncStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    expect(expected).toEqual(expectedCollected);
  });

  xit('Should be able to cancel', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    let count = 0;

    for await (const message of resp) {
      if (++count === 2) await resp.cancel();
      expectedCollected.push(message);
    }

    expect(expected).toEqual(expectedCollected);
  });

  it.only('Should handle immediate errors', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));

    const resp = await defaultController.postWithStreamingAndImmediateError({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    await expect(async () => {
      for await (const message of resp) {
        throw new Error('This should not be called ' + String(message));
      }
    }).rejects.toThrowError(/Immediate error/);
  });

  xit('Should handle errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithStreamingAndDelayedError({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    await expect(async () => {
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    }).rejects.toThrowError(/velyka dupa/);

    expect(expected).toEqual(expectedCollected);
  });

  xit('Should handle custom errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithStreamingAndDelayedCustomError({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
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
  xit('Should handle unhandled errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithStreamingAndDelayedUnhandledError({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    await expect(async () => {
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    }).rejects.toThrow();

    expect(expected).toEqual(expectedCollected);
  });
});
