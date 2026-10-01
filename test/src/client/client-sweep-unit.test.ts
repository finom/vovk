import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import vm from 'node:vm';
import { createFetcher, HttpException, progressive } from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import { deepExtend, readableStreamToAsyncIterable, type VovkStreamAsyncIterable } from 'vovk/internal';
import { validateOnClient } from '../../../packages/vovk-ajv/index.js';

const streamOf = (chunks: Uint8Array[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });

// cuts the bytes inside the 4-byte emoji, so neither chunk holds the whole character
const splitInsideEmoji = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  const cut = bytes.indexOf(0xf0) + 2;
  return [bytes.slice(0, cut), bytes.slice(cut)];
};

type TestHandlers = Record<string, { path: string; httpMethod: string; validation?: object }>;

type TestCall = ((input?: object) => Promise<unknown>) & { getURL: (input?: object) => string };

// an RPC module over a hand-written schema, the requests go to whatever fetch is stubbed in
const rpcOf = (handlers: TestHandlers, ...rest: unknown[]) => {
  const schema = {
    segments: {
      '': {
        segmentName: '',
        emitSchema: true,
        controllers: { TestRPC: { rpcModuleName: 'TestRPC', prefix: 'test', handlers } },
      },
    },
  };
  return (createRPC as (...args: unknown[]) => unknown)(schema, '', 'TestRPC', ...rest) as Record<string, TestCall>;
};

const withFetch = async <T>(
  stub: (url: string, init: RequestInit) => Response | Promise<Response>,
  run: () => Promise<T>
): Promise<T> => {
  const original = globalThis.fetch;
  globalThis.fetch = stub as unknown as typeof fetch;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
};

describe('Client sweep, pure functions', () => {
  describe('deepExtend', () => {
    it('Merges an object made in another realm instead of replacing it', () => {
      const fromVm = vm.runInNewContext('({ info: { title: "Custom" } })');

      deepStrictEqual(deepExtend({ info: { title: 'pkg', version: '1.2.3' } }, fromVm), {
        info: { title: 'Custom', version: '1.2.3' },
      });
    });

    it('Works where Buffer is not defined', async () => {
      const schema = {
        segments: {
          '': {
            segmentName: '',
            emitSchema: true,
            controllers: {
              UserRPC: {
                rpcModuleName: 'UserRPC',
                prefix: 'users',
                handlers: { update: { path: '{id}', httpMethod: 'POST' } },
              },
            },
          },
        },
      };
      // Node's own fetch, Response and FormData load code that needs Buffer, so they are stubbed or loaded up front
      const response = { ok: true, status: 200, headers: new Headers({ 'content-type': 'application/json' }) };
      const requests: string[] = [];
      const stubFetch = async (url: string, init: RequestInit) => {
        requests.push(`${url} ${init.body}`);
        return { ...response, json: async () => ({ ok: true }) };
      };
      void [FormData, File, URLSearchParams];
      const { Buffer, fetch: originalFetch } = globalThis;
      const rpc = createRPC(schema, '', 'UserRPC') as unknown as Record<string, (input: object) => Promise<unknown>>;

      try {
        // a browser or React Native bundle has no Buffer global
        Reflect.deleteProperty(globalThis, 'Buffer');
        globalThis.fetch = stubFetch as unknown as typeof fetch;
        deepStrictEqual(deepExtend({}, { body: { a: { b: 1 } } }), { body: { a: { b: 1 } } });
        deepStrictEqual(await rpc.update({ params: { id: '1' }, body: { name: 'x' } }), { ok: true });
      } finally {
        globalThis.Buffer = Buffer;
        globalThis.fetch = originalFetch;
      }

      deepStrictEqual(requests, ['/api/users/1 {"name":"x"}']);
    });
  });

  describe('readableStreamToAsyncIterable', () => {
    it('Decodes a multi-byte character split across chunks', async () => {
      const iterable = readableStreamToAsyncIterable({
        readableStream: streamOf(splitInsideEmoji(`${JSON.stringify({ token: 'Привет 👋' })}\n`)),
        abortController: new AbortController(),
      });

      deepStrictEqual(await iterable.asPromise(), [{ token: 'Привет 👋' }]);
    });

    it('Decodes a last line without a trailing newline split across chunks', async () => {
      const iterable = readableStreamToAsyncIterable({
        readableStream: streamOf(splitInsideEmoji(JSON.stringify({ token: '👋' }))),
        abortController: new AbortController(),
      });

      deepStrictEqual(await iterable.asPromise(), [{ token: '👋' }]);
    });

    it('Lets progressive skip a null line', async () => {
      const getStream = async () =>
        readableStreamToAsyncIterable({
          readableStream: streamOf([new TextEncoder().encode('null\n{"users":[1]}\n')]),
          abortController: new AbortController(),
        }) as VovkStreamAsyncIterable<{ users: number[] }>;

      const { users } = progressive(getStream) as unknown as { users: Promise<number[]> };

      deepStrictEqual(await users, [1]);
    });

    it('Throws a plain Error for an error line without a status', async () => {
      const iterable = readableStreamToAsyncIterable({
        readableStream: streamOf([new TextEncoder().encode('{"n":1}\n{"isError":true,"reason":"oh no"}\n')]),
        abortController: new AbortController(),
      });

      await rejects(iterable.asPromise(), (error: unknown) => {
        ok(error instanceof Error && !(error instanceof HttpException));
        strictEqual(error.message, 'oh no');
        return true;
      });
    });
  });

  describe('vovk-ajv', () => {
    const fullSchema = { $schema: '', segments: {} };
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema' as const,
      type: 'object' as const,
      properties: { name: { type: 'string' as const, maxLength: 5 } },
      required: ['name'],
    };

    it('Compiles a schema once', async () => {
      // the copy of Ajv that vovk-ajv itself loads
      const requireFromAjvPackage = createRequire(new URL('../../../packages/vovk-ajv/index.js', import.meta.url));
      const AjvCore = requireFromAjvPackage('ajv/dist/core.js').default;
      const compile = AjvCore.prototype.compile;
      let compiles = 0;

      await validateOnClient({ body: { name: 'a' } }, { body: schema }, { fullSchema, endpoint: '/x' });
      AjvCore.prototype.compile = function (this: unknown, ...args: unknown[]) {
        compiles++;
        return compile.apply(this, args);
      };
      try {
        await validateOnClient({ body: { name: 'b' } }, { body: schema }, { fullSchema, endpoint: '/x' });
        await validateOnClient({ body: { name: 'c' } }, { body: schema }, { fullSchema, endpoint: '/x' });
        await rejects(
          validateOnClient({ body: { name: 'too long' } }, { body: schema }, { fullSchema, endpoint: '/x' }),
          /must NOT have more than 5 characters/
        );
      } finally {
        AjvCore.prototype.compile = compile;
      }

      strictEqual(compiles, 0);
    });

    it('Validates files in an object body as binary strings', async () => {
      const fileSchema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema' as const,
        type: 'object' as const,
        properties: {
          file: { type: 'string' as const, format: 'binary' },
          files: { type: 'array' as const, items: { type: 'string' as const, format: 'binary' } },
        },
        required: ['file', 'files'],
      };
      const file = new File(['x'], 'a.txt');

      await validateOnClient(
        { body: { file, files: [file, file] } },
        { body: fileSchema },
        { fullSchema, endpoint: '/x' }
      );
    });
  });

  describe('fetcher', () => {
    const handlers = { get: { path: '', httpMethod: 'GET' } };

    it('Runs every callback when one unsubscribes itself', async () => {
      const fetcher = createFetcher();
      const calls: string[] = [];
      const offError = fetcher.onError(() => {
        calls.push('error 1');
        offError();
      });
      fetcher.onError(() => {
        calls.push('error 2');
      });
      const offSuccess = fetcher.onSuccess(() => {
        calls.push('success 1');
        offSuccess();
      });
      fetcher.onSuccess(() => {
        calls.push('success 2');
      });
      const rpc = rpcOf(handlers, fetcher);

      await withFetch(
        () => Response.json({ message: 'teapot' }, { status: 418 }),
        () => rejects(rpc.get(), HttpException)
      );
      await withFetch(
        () => Response.json({ ok: true }),
        () => rpc.get()
      );

      deepStrictEqual(calls, ['error 1', 'error 2', 'success 1', 'success 2']);
    });

    it('Keeps a network error as the cause', async () => {
      const failure = new TypeError('fetch failed');

      await withFetch(
        () => Promise.reject(failure),
        () =>
          rejects(rpcOf(handlers).get(), (error: unknown) => {
            ok(error instanceof HttpException);
            strictEqual(error.statusCode, 0);
            strictEqual(error.message, 'fetch failed /api/test');
            strictEqual(error.cause, failure);
            return true;
          })
      );
    });

    it('Rethrows an abort as is', async () => {
      const controller = new AbortController();
      const reason = new Error('Stopped by the user');
      controller.abort(reason);

      await withFetch(
        (_url, init) => Promise.reject(init.signal?.reason),
        () => rejects(rpcOf(handlers).get({ init: { signal: controller.signal } }), (error) => error === reason)
      );
    });

    it('Forwards init.signal where AbortSignal.any is missing', async () => {
      // React Native and Safari before 17.4 have no AbortSignal.any
      const { any } = AbortSignal;
      const controller = new AbortController();
      let requestSignal: AbortSignal | null | undefined;

      try {
        Reflect.deleteProperty(AbortSignal, 'any');
        const result = await withFetch(
          (_url, init) => {
            requestSignal = init.signal;
            return Response.json({ ok: true });
          },
          () => rpcOf(handlers).get({ init: { signal: controller.signal } })
        );

        deepStrictEqual(result, { ok: true });
      } finally {
        AbortSignal.any = any;
      }

      strictEqual(requestSignal?.aborted, false);
      controller.abort('stop');
      strictEqual(requestSignal?.aborted, true);
      strictEqual(requestSignal?.reason, 'stop');
    });

    it('Gives null for a JSON response without a body', async () => {
      const rpc = rpcOf({
        exists: { path: '', httpMethod: 'HEAD' },
        star: { path: 'star', httpMethod: 'PUT' },
        empty: { path: 'empty', httpMethod: 'GET' },
        stream: { path: 'stream', httpMethod: 'HEAD' },
        missing: { path: 'missing', httpMethod: 'GET' },
      });
      const respond = (url: string): Response => {
        const path = url.split('/').pop();
        const contentType = path === 'stream' ? 'application/jsonl' : 'application/json; charset=utf-8';
        const status = path === 'star' ? 204 : path === 'missing' ? 404 : 200;
        const headers = { 'content-type': contentType, ...(path === 'empty' ? { 'content-length': '0' } : {}) };
        // HEAD answers and 204 carry the content type but no body
        return new Response(path === 'empty' ? '' : null, { status, headers });
      };

      await withFetch(respond, async () => {
        strictEqual(await rpc.exists(), null);
        strictEqual(await rpc.star(), null);
        strictEqual(await rpc.empty(), null);
        strictEqual(await rpc.stream(), null);
        await rejects(rpc.missing(), (error) => error instanceof HttpException && error.statusCode === 404);
      });
    });
  });
});
