import metadata from '../controllers-metadata.json';
import type StreamingController from './StreamingController';
import { clientizeController, defaultFetcher, type DefaultFetcherOptions } from '../../../src/client';
import { it, expect, describe } from '@jest/globals';
import { HttpException } from '../../../src';

type StreamingControllerType = typeof StreamingController;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = clientizeController<StreamingControllerType, DefaultFetcherOptions>(
  metadata.StreamingController,
  defaultFetcher,
  {
    defaultOptions: { prefix },
  }
);

describe('Streaming', () => {
  it('Should work', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];
    const expectedCollected2: typeof expected = [];

    const promise = defaultController.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    const messagePromise = promise.onMessage((message) => {
      expectedCollected.push(message);
    });

    const messagePromise2 = promise.onMessage((message) => {
      expectedCollected2.push(message);
    });

    expect(await promise).toEqual(expectedCollected);
    expect(await messagePromise).toEqual(expectedCollected2);
    expect(await promise).toEqual(expected);
    expect(await messagePromise).toEqual(expected);
    expect(await messagePromise2).toEqual(expected);
  });

  it('Should be able to cancel', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const promise = defaultController.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    let count = 0;

    const messagePromise = promise.onMessage(async (message) => {
      if (++count === 2) await promise.cancel();
      expectedCollected.push(message);
    });

    expect(await promise).toEqual(expectedCollected);
    expect(await messagePromise).toEqual(expectedCollected);
    expect(await promise).toEqual(expected);
    expect(await messagePromise).toEqual(expected);
  });

  it('Should handle immediate errors', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));

    const promise = defaultController.postWithStreamingAndImmediateError({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    await expect(promise).rejects.toThrowError(HttpException);
  });

  it('Should handle errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const promise = defaultController.postWithStreamingAndDelayedError({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    void promise.onMessage((message) => {
      expectedCollected.push(message);
    });

    await expect(promise).rejects.toThrowError(/velyka dupa/);

    expect(expected).toEqual(expectedCollected);
  });

  it('Should handle custom errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const promise = defaultController.postWithStreamingAndDelayedCustomError({
      body: tokens,
      query: { query: 'queryValue' },
      isStream: true,
    });

    void promise.onMessage((message) => {
      expectedCollected.push(message);
    });

    await expect(promise).rejects.toEqual({ customError: 'custom error' });

    expect(expected).toEqual(expectedCollected);
  });
});
