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
  });
});
