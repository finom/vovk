import metadata from '../vovk-metadata.json';
import type StreamingController from './StreamingController';
import { clientizeController } from '../../../src/client';
import { it, expect, describe, xit } from '@jest/globals';
import { HttpException } from '../../../src';

type StreamingControllerType = typeof StreamingController;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = clientizeController<StreamingControllerType>(metadata.StreamingController, {
  defaultOptions: { prefix },
});

describe('Streaming', () => {
  it('Should work', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    expect(expected).toEqual(expectedCollected);
  });

  it('Should be able to cancel', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
    });

    let count = 0;

    for await (const message of resp) {
      expectedCollected.push(message);
      if (++count === 2) await resp.cancel();
    }

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    expect(expected).toEqual(expectedCollected);
  });

  it('Should be able to continue if disposable is not used', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];
    let r;

    {
      const resp = await defaultController.postWithStreaming({
        body: tokens,
        query: { query: 'queryValue' },
      });

      r = resp;

      let count = 0;

      for await (const message of resp) {
        expectedCollected.push(message);
        if (++count === 2) break;
      }
    }

    for await (const message of r) {
      expectedCollected.push(message);
    }

    expect(expected).toEqual(expectedCollected);
  });

  it('Should be able to dispose', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];
    let r;

    {
      using resp = await defaultController.postWithStreaming({
        body: tokens,
        query: { query: 'queryValue' },
      });

      r = resp;

      let count = 0;

      for await (const message of resp) {
        expectedCollected.push(message);
        if (++count === 2) break;
      }
    }

    for await (const message of r) {
      expectedCollected.push(message);
    }

    expect(expected).toEqual(expectedCollected);
  });

  it('Should handle immediate errors', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));

    const respPromise = defaultController.postWithStreamingAndImmediateError({
      body: tokens,
      query: { query: 'queryValue' },
    });

    await expect(() => respPromise).rejects.toThrowError(HttpException);
  });

  it('Should handle errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithStreamingAndDelayedError({
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

    const resp = await defaultController.postWithStreamingAndDelayedCustomError({
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
  xit('Should handle unhandled errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await defaultController.postWithStreamingAndDelayedUnhandledError({
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
