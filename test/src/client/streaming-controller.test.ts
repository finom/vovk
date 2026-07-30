import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { fetcher, HttpException, progressive, type VovkYieldType } from 'vovk';
import { StreamingControllerRPC } from '../generated-client/index.ts';
import { expectPromise } from '../lib.ts';
import type { default as StreamingController, Token } from './streaming-controller.ts';

const apiRoot = `http://localhost:${process.env.PORT}/api`;

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

    deepStrictEqual(expectedCollected, expected);
  });

  it('Delivers all lines when send and close are not awaited', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));
    const collected: typeof expected = [];

    const resp = await StreamingControllerRPC.postWithUnawaitedSends({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    for await (const message of resp) {
      collected.push(message);
    }

    deepStrictEqual(collected, expected);
  });

  it('Should consume streaming multiple times', async () => {
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

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    null as unknown as VovkYieldType<typeof StreamingController.postWithStreaming> satisfies Token;
    null as unknown as VovkYieldType<typeof StreamingControllerRPC.postWithStreaming> satisfies Token;

    deepStrictEqual(expectedCollected, [...expected, ...expected]);
  });

  it('Should consume streaming multiple times at the same time', async () => {
    const tokens = ['token1', 'token2\n', 'token3'].map((token) => ({ token }));
    const expected = tokens.map((token) => ({ ...token, query: 'queryValue' }));

    const resp = await StreamingControllerRPC.postWithStreaming({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    const p1 = (async () => {
      const collected: typeof expected = [];
      for await (const message of resp) {
        collected.push(message);
      }
      return collected;
    })();

    const p2 = (async () => {
      const collected: typeof expected = [];
      for await (const message of resp) {
        collected.push(message);
      }
      return collected;
    })();

    const expectedCollected = (await Promise.all([p1, p2])).flat();

    null as unknown as VovkYieldType<typeof StreamingController.postWithStreaming> satisfies Token;
    null as unknown as VovkYieldType<typeof StreamingControllerRPC.postWithStreaming> satisfies Token;

    deepStrictEqual(expectedCollected, [...expected, ...expected]);
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
      if (++count === 2) await resp.abortSilently();
    }

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    deepStrictEqual(expectedCollected, expected);
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

    deepStrictEqual(expectedCollected, expected);
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

    deepStrictEqual(expectedCollected, expected);
  });

  it('Should invoke fetcher onError for errors in the middle of stream', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const collected: unknown[] = [];
    let onErrorArg: unknown = null;
    const unsubscribe = fetcher.onError((error) => {
      onErrorArg = error;
    });

    try {
      const resp = await StreamingControllerRPC.postWithStreamingAndDelayedError({
        body: tokens,
        query: { query: 'queryValue' },
        apiRoot,
      });

      await expectPromise(async () => {
        for await (const message of resp) {
          collected.push(message);
        }
      }).rejects.toThrow(/oh no/);
    } finally {
      unsubscribe();
    }

    ok(onErrorArg instanceof Error, 'onError callback received the mid-stream error');
    ok((onErrorArg as Error).message.includes('oh no'));
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

    deepStrictEqual(expectedCollected, expected);
  });

  it('Should work with a custom response', async () => {
    const [resp, response] = await StreamingControllerRPC.postWithStreamingAndCustomResponse({
      body: [{ token: 'Hello,' }, { token: ' World' }, { token: '!' }],
      apiRoot,
      transform: (data, response) => [data, response] as const,
    });

    const expected = [{ token: 'Hello,' }, { token: ' World' }, { token: '!' }];
    const expectedCollected: typeof expected = [];

    for await (const message of resp) {
      expectedCollected.push(message);
    }

    deepStrictEqual(expectedCollected, expected);

    strictEqual(response.status, 201);
    strictEqual(response.headers.get('x-custom-header'), 'customValue');
  });

  it('Should work with "progressive" utility', async () => {
    const { foo, bar, hello } = progressive(StreamingControllerRPC.progressiveResponse, { body: { hello: 'world' } });
    deepStrictEqual(await hello, 'world');
    deepStrictEqual(await foo, 'foo1');
    deepStrictEqual(await bar, 'bar2');
  });

  it('onIterate should not receive the error control line', async () => {
    const tokens = ['token1', 'token2', 'token3'].map((token) => ({ token }));
    const collected: unknown[] = [];

    const resp = await StreamingControllerRPC.postWithStreamingAndDelayedError({
      body: tokens,
      query: { query: 'queryValue' },
      apiRoot,
    });

    resp.onIterate((message) => {
      collected.push(message);
    });

    await expectPromise(async () => {
      await resp.asPromise();
    }).rejects.toThrow(/oh no/);

    deepStrictEqual(
      collected,
      tokens.slice(0, 2).map((token) => ({ ...token, query: 'queryValue' }))
    );
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
