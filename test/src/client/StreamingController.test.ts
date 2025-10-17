import { it, describe } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import type { Token, default as StreamingController } from './StreamingController.ts';
import { expectPromise } from '../lib.ts';
import { HttpException, progressive, type VovkYieldType } from 'vovk';
import { StreamingControllerRPC } from 'vovk-client';

const apiRoot = 'http://localhost:' + process.env.PORT + '/api';

describe('Streaming', () => {
  it('Should work', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const expectedCollected: typeof expected = [];

    const resp = await StreamingControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkYieldType<typeof StreamingController.postWithStreaming> satisfies Token;
    null as unknown as VovkYieldType<typeof StreamingControllerRPC.postWithStreaming> satisfies Token;

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should be able to abort', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await StreamingControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    let count = 0;

    for await (const message of resp) {
      expectedCollected.push(message);
      if (++count === 2) await resp.abortController.abort();
    }

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    deepStrictEqual(expected, expectedCollected);
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
        apiRoot,
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

    await resp.abortController.abort();

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should be able to dispose', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await StreamingControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    let count = 0;

    for await (const message of resp) {
      expectedCollected.push(message);
      if (++count === 2) {
        await resp[Symbol.dispose]();
        break;
      }
    }

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    deepStrictEqual(expected, expectedCollected);
  });

  it('Should handle immediate errors', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));

    const respPromise = StreamingControllerRPC.postWithStreamingAndImmediateError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    await expectPromise(() => respPromise).rejects.toThrowError(HttpException);
  });

  it('Should handle errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await StreamingControllerRPC.postWithStreamingAndDelayedError({
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

    const resp = await StreamingControllerRPC.postWithStreamingAndDelayedCustomError({
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

  // TODO: Stream never ends if not using dispose. No error when using dispose.
  it.skip('Should handle unhandled errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' })).slice(0, 2);
    const expectedCollected: typeof expected = [];

    const resp = await StreamingControllerRPC.postWithStreamingAndDelayedUnhandledError({
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

  it('Should work with "progressive" utility', async () => {
    const { foo, bar, hello } = progressive(StreamingControllerRPC.progressiveResponse, { body: { hello: 'world' } });
    deepStrictEqual(await hello, 'world');
    deepStrictEqual(await foo, 'foo1');
    deepStrictEqual(await bar, 'bar2');
  });

  it('onIterate and asPromise should work', async () => {
    const resp = await StreamingControllerRPC.progressiveResponse({ body: { hello: 'world' } });
    const data: Partial<VovkYieldType<typeof StreamingControllerRPC.progressiveResponse>> = {};

    resp.onIterate((message) => {
      Object.assign(data, message);
    });
    deepStrictEqual(await resp.asPromise(), [{ hello: 'world' }, { foo: 'foo1' }, { bar: 'bar2' }]);
    deepStrictEqual(data, {
      hello: 'world',
      foo: 'foo1',
      bar: 'bar2',
    });
  });
});
