import type { Token, default as StreamingController } from './StreamingController';
import { expect, describe, it, xit } from '@jest/globals';
import { HttpException, VovkYieldType } from 'vovk';
import { StreamingControllerRPC } from '../../.vovk-client/client';
import { _VovkControllerYieldType, _VovkClientYieldType } from 'vovk/types';

const prefix = 'http://localhost:' + process.env.PORT + '/api';

describe('Streaming', () => {
  it('Should work', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];

    using resp = await StreamingControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      prefix,
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as _VovkControllerYieldType<typeof StreamingController.postWithStreaming> satisfies Token;
    null as unknown as _VovkClientYieldType<typeof StreamingControllerRPC.postWithStreaming> satisfies Token;
    null as unknown as VovkYieldType<typeof StreamingControllerRPC.postWithStreaming> satisfies Token;

    expect(expected).toEqual(expectedCollected);
  });

  it('Should be able to cancel', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await StreamingControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      prefix,
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
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];
    let r;
    let resp;

    {
      resp = await StreamingControllerRPC.postWithStreaming({
        body: tokens,
        query: { query: 'queryValue' },
        prefix,
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

    await resp.cancel();

    expect(expected).toEqual(expectedCollected);
  });

  it('Should be able to dispose', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];
    let r;

    {
      using resp = await StreamingControllerRPC.postWithStreaming({
        body: tokens,
        query: { query: 'queryValue' },
        prefix,
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
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));

    const respPromise = StreamingControllerRPC.postWithStreamingAndImmediateError({
      body: tokens,
      query: { query: 'queryValue' },
      prefix,
    });

    await expect(() => respPromise).rejects.toThrowError(HttpException);
  });

  it('Should handle errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    using resp = await StreamingControllerRPC.postWithStreamingAndDelayedError({
      body: tokens,
      query: { query: 'queryValue' },
      prefix,
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

    using resp = await StreamingControllerRPC.postWithStreamingAndDelayedCustomError({
      body: tokens,
      query: { query: 'queryValue' },
      prefix,
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

    const resp = await StreamingControllerRPC.postWithStreamingAndDelayedUnhandledError({
      body: tokens,
      query: { query: 'queryValue' },
      prefix,
    });

    await expect(async () => {
      for await (const message of resp) {
        expectedCollected.push(message);
      }
    }).rejects.toThrow();

    expect(expected).toEqual(expectedCollected);
  });
});
