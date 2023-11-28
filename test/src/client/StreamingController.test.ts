import metadata from '../controllers-metadata.json';
import type StreamingController from './StreamingController';
import { clientizeController, defaultFetcher, type DefaultFetcherOptions } from '../../../src/client';
import { it, expect, describe, xit } from '@jest/globals';

type StreamingControllerType = typeof StreamingController;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = clientizeController<StreamingControllerType, DefaultFetcherOptions>(
  metadata.StreamingController,
  defaultFetcher,
  {
    defaultOptions: { prefix },
  }
);

describe.only('Streaming', () => {
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

  xit('Should be able to cancel', () => {});

  xit('Should handle errors', () => {});
});
