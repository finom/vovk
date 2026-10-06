import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import {
  HttpException,
  initSegment,
  post,
  prefix,
  procedure,
  progressive,
  type VovkRequest,
  type VovkStreamAsyncIterable,
} from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import { createFetcher } from 'vovk/fetcher';
import { deepExtend } from 'vovk/internal';
import { z } from 'zod';
import { readableStreamToAsyncIterable } from '../../../packages/vovk/dist/client/default-stream-handler.js';
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

// a segment that answers the requests of rpcOf() in this process, routed as Next.js routes /api/[[...vovk]]
const serve = (segmentName: string, controllers: Parameters<typeof initSegment>[0]['controllers']) => {
  const handlers = initSegment({ segmentName, controllers });
  return (url: string, init: RequestInit) => {
    const req = new Request(new URL(url, 'http://localhost'), init);
    // NextRequest's nextUrl, req.vovk.query() reads it
    Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) });
    const vovk = new URL(req.url).pathname.split('/').slice(2).filter(Boolean).map(decodeURIComponent);
    const method = (init.method ?? 'GET') as keyof typeof handlers;
    return handlers[method](req, { params: Promise.resolve({ vovk }) }) as Promise<Response>;
  };
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
        return { ...response, text: async () => '{"ok":true}' };
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

    it('Lets progressive work where Promise.withResolvers is missing', async () => {
      // Safari before 17.4, Chrome before 119 and Firefox before 121, which Next.js supports with no polyfill for it
      const { withResolvers } = Promise;
      const getStream = async () =>
        readableStreamToAsyncIterable({
          readableStream: streamOf([new TextEncoder().encode('{"users":[1]}\n{"tasks":[2]}\n')]),
          abortController: new AbortController(),
        }) as VovkStreamAsyncIterable<{ users: number[] } | { tasks: number[] }>;

      try {
        Reflect.deleteProperty(Promise, 'withResolvers');
        const { users, tasks } = progressive(getStream) as unknown as Record<string, Promise<number[]>>;

        deepStrictEqual(await users, [1]);
        deepStrictEqual(await tasks, [2]);
      } finally {
        Promise.withResolvers = withResolvers;
      }
    });

    it('Lets progressive take a key named after an Object.prototype member as any other key', async () => {
      const progressiveOf = (text: string) =>
        progressive(
          async () =>
            readableStreamToAsyncIterable({
              readableStream: streamOf([new TextEncoder().encode(text)]),
              abortController: new AbortController(),
            }) as VovkStreamAsyncIterable<Record<string, unknown>>
        ) as unknown as Record<string, Promise<unknown>>;
      const read = (promise: unknown) =>
        Promise.resolve(promise).then(
          (value) => value,
          (error: Error) => `rejected: ${error.message}`
        );
      // constructor, __proto__, toString, valueOf, hasOwnProperty…
      const names = Object.getOwnPropertyNames(Object.prototype);
      // what those keys reach through the prototype chain of a plain object
      const targets = [
        Object.prototype,
        ...new Set(names.map((name) => Object.getOwnPropertyDescriptor(Object.prototype, name)?.value)),
      ].filter((target) => typeof target === 'object' || typeof target === 'function');
      const ownKeys = () => targets.map((target) => Object.getOwnPropertyNames(target).sort());
      const keysBefore = ownKeys();

      try {
        const results: unknown[] = [];
        for (const [i, name] of names.entries()) {
          const result = progressiveOf(`{"${name}":${i}}\n{"users":[${i}]}\n`);
          // the keys are taken right away, as a destructuring does
          const [users, value] = [result.users, result[name]];
          results.push([name, await read(users), await read(value)]);
        }

        deepStrictEqual(
          { results, keys: ownKeys() },
          { results: names.map((name, i) => [name, [i], i]), keys: keysBefore }
        );
      } finally {
        // a key written to a shared object would leak into the other tests
        targets.forEach((target, i) => {
          for (const key of Object.getOwnPropertyNames(target)) {
            if (!keysBefore[i].includes(key)) Reflect.deleteProperty(target, key);
          }
        });
      }
    });

    it('Reads the stream only as fast as the iteration takes items', async () => {
      let pulls = 0;
      const readableStream = new ReadableStream<Uint8Array>({
        async pull(controller) {
          await new Promise((resolve) => setTimeout(resolve, 1));
          pulls++;
          controller.enqueue(new TextEncoder().encode(`${JSON.stringify({ n: pulls })}\n`));
        },
      });
      const iterable = readableStreamToAsyncIterable({ readableStream, abortController: new AbortController() });
      let taken = 0;

      for await (const _item of iterable) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        if (++taken === 3) break;
      }

      ok(pulls <= taken + 2, `${pulls} lines read for ${taken} items`);
    });

    it('Keeps only the items a running iteration has not passed', async () => {
      const iterable = readableStreamToAsyncIterable<{ n: number }>({
        readableStream: streamOf([new TextEncoder().encode('{"n":1}\n{"n":2}\n{"n":3}\n')]),
        abortController: new AbortController(),
      });
      const first = iterable[Symbol.asyncIterator]();

      deepStrictEqual(await first.next(), { value: { n: 1 }, done: false });
      // a later consumer starts at the oldest kept item
      deepStrictEqual(await iterable.asPromise(), [{ n: 2 }, { n: 3 }]);
      deepStrictEqual(await first.next(), { value: { n: 2 }, done: false });
      deepStrictEqual(await first.next(), { value: { n: 3 }, done: false });
      deepStrictEqual(await first.next(), { value: undefined, done: true });
    });

    it('Ends the stream with the error an onIterate callback throws', async () => {
      const iterable = readableStreamToAsyncIterable({
        readableStream: streamOf([new TextEncoder().encode('{"n":1}\n{"n":2}\n')]),
        abortController: new AbortController(),
      });
      iterable.onIterate((_item, i) => {
        if (i === 1) throw new Error('callback failed');
      });

      await rejects(iterable.asPromise(), /callback failed/);
    });

    it('Gives every asPromise() call the same items', async () => {
      const iterable = readableStreamToAsyncIterable({
        readableStream: streamOf([new TextEncoder().encode('{"n":1}\n{"n":2}\n')]),
        abortController: new AbortController(),
      });

      deepStrictEqual(await iterable.asPromise(), [{ n: 1 }, { n: 2 }]);
      deepStrictEqual(await iterable.asPromise(), [{ n: 1 }, { n: 2 }]);
    });

    it('Ends the stream with an error at a line that is not JSON', async () => {
      const iterable = readableStreamToAsyncIterable({
        readableStream: streamOf([new TextEncoder().encode('{"a":1}\nnot json\n{"a":2}\n')]),
        abortController: new AbortController(),
      });
      const items: unknown[] = [];

      await rejects(
        async () => {
          for await (const item of iterable) items.push(item);
        },
        (error: unknown) => {
          ok(error instanceof Error && error.cause instanceof SyntaxError);
          ok(error.message.startsWith('JSONLines stream error.'));
          return true;
        }
      );
      deepStrictEqual(items, [{ a: 1 }]);
    });

    it('Ends the stream with an error at a truncated last line', async () => {
      const iterable = readableStreamToAsyncIterable({
        readableStream: streamOf([new TextEncoder().encode('{"a":1}\n{"a":2')]),
        abortController: new AbortController(),
      });

      await rejects(iterable.asPromise(), /JSONLines stream error/);
    });

    it('Skips blank lines', async () => {
      const iterable = readableStreamToAsyncIterable({
        readableStream: streamOf([new TextEncoder().encode('\n\n{"a":1}\r\n   \n\n{"a":2}\n')]),
        abortController: new AbortController(),
      });

      deepStrictEqual(await iterable.asPromise(), [{ a: 1 }, { a: 2 }]);
    });

    it('Throws for an error line whose reason is null or 0', async () => {
      const iterableOf = (line: string) =>
        readableStreamToAsyncIterable({
          readableStream: streamOf([new TextEncoder().encode(`{"n":1}\n${line}\n`)]),
          abortController: new AbortController(),
        });

      await rejects(iterableOf('{"isError":true,"reason":null}').asPromise(), Error);
      await rejects(iterableOf('{"isError":true,"reason":0}').asPromise(), (error: unknown) => error === 0);
    });

    it('Gives the items read before an early break to a later consumer', async () => {
      const abortController = new AbortController();
      const readableStream = new ReadableStream<Uint8Array>({
        start(controller) {
          // stays open, so only the iteration ends it
          controller.enqueue(new TextEncoder().encode('{"n":1}\n{"n":2}\n{"n":3}\n'));
        },
      });
      const iterable = readableStreamToAsyncIterable<{ n: number }>({ readableStream, abortController });

      for await (const item of iterable) {
        if (item.n === 1) break;
      }

      ok(abortController.signal.aborted);
      deepStrictEqual(await iterable.asPromise(), [{ n: 2 }, { n: 3 }]);
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

    it('Merges default and per-call headers by name, whatever their shape', async () => {
      type WithDefaults = { withDefaults: (options: object) => WithDefaults } & Record<string, TestCall>;
      const rpc = rpcOf(handlers) as unknown as WithDefaults;
      const plainDefaults = rpc.withDefaults({ init: { headers: { Authorization: 'Bearer A' } } });
      const headersDefaults = rpc.withDefaults({ init: { headers: new Headers({ authorization: 'Bearer A' }) } });
      const chained = plainDefaults.withDefaults({ init: { headers: [['x-tenant', 't']] } });
      const seen: { authorization?: string; requestId?: string; tenant?: string }[] = [];

      await withFetch(
        (_url, init) => {
          const headers = new Headers(init.headers);
          seen.push({
            authorization: headers.get('authorization') ?? undefined,
            requestId: headers.get('x-request-id') ?? undefined,
            tenant: headers.get('x-tenant') ?? undefined,
          });
          return Response.json({});
        },
        async () => {
          await plainDefaults.get({ init: { headers: { authorization: 'Bearer B' } } });
          await plainDefaults.get({ init: { headers: new Headers({ 'x-request-id': '1' }) } });
          await plainDefaults.get({ init: { headers: [['x-request-id', '1']] } });
          await headersDefaults.get({ init: { headers: { 'x-request-id': '1' } } });
          await chained.get({ init: { headers: { 'X-Tenant': 'u' } } });
        }
      );

      deepStrictEqual(seen, [
        { authorization: 'Bearer B', requestId: undefined, tenant: undefined },
        { authorization: 'Bearer A', requestId: '1', tenant: undefined },
        { authorization: 'Bearer A', requestId: '1', tenant: undefined },
        { authorization: 'Bearer A', requestId: '1', tenant: undefined },
        { authorization: 'Bearer A', requestId: undefined, tenant: 'u' },
      ]);
    });

    it('Uses a fetcher given per call', async () => {
      let isUsed = false;
      const fetcher = createFetcher({
        prepareRequestInit: (init) => {
          isUsed = true;
          return init;
        },
      });

      await withFetch(
        () => Response.json({}),
        () => rpcOf(handlers).get({ fetcher })
      );

      strictEqual(isUsed, true);
    });

    it('Takes validateOnClient per call as a module promise', async () => {
      const bodySchema = { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] };
      const rpc = rpcOf({ create: { path: '', httpMethod: 'POST', validation: { body: bodySchema } } });
      const validateOnClientModule = import('../../../packages/vovk-ajv/index.js');

      await withFetch(
        () => Response.json({ ok: true }),
        async () => {
          deepStrictEqual(await rpc.create({ body: { name: 'a' }, validateOnClient: validateOnClientModule }), {
            ok: true,
          });
          await rejects(
            rpc.create({ body: {}, validateOnClient: validateOnClientModule }),
            /Client-side validation failed\. Invalid body: data must have required property 'name'/
          );
        }
      );
    });

    it('Adds the query to a handler at the segment root without a trailing slash', async () => {
      const controllers = {
        RootRPC: { rpcModuleName: 'RootRPC', prefix: '', handlers: { root: { path: '', httpMethod: 'GET' } } },
      };
      const schema = { segments: { bodies: { segmentName: 'bodies', emitSchema: true, controllers } } };
      const { root } = (createRPC as (...args: unknown[]) => unknown)(schema, 'bodies', 'RootRPC') as Record<
        string,
        TestCall
      >;
      const urls: string[] = [];

      await withFetch(
        (url) => {
          urls.push(url);
          return Response.json({});
        },
        () => root({ query: { q: '1' } })
      );

      strictEqual(root.getURL({ query: { q: '1' } }), '/api/bodies?q=1');
      strictEqual(
        root.getURL({ apiRoot: 'https://example.com/api', query: { q: '1' } }),
        'https://example.com/api/bodies?q=1'
      );
      strictEqual(root.getURL(), '/api/bodies');
      deepStrictEqual(urls, ['/api/bodies?q=1']);
    });

    it('Calls the root of the origin when rootEntry is an empty string', async () => {
      // rootEntry: '' serves the API from the domain root (/config#rootentry); the generated client passes no
      // apiRoot without an origin, so the schema's rootEntry decides
      const controllers = {
        UserRPC: { rpcModuleName: 'UserRPC', prefix: 'users', handlers: { get: { path: '{id}', httpMethod: 'GET' } } },
      };
      const schema = {
        segments: { '': { segmentName: '', emitSchema: true, controllers } },
        meta: { config: { rootEntry: '' } },
      };
      const { get } = (createRPC as (...args: unknown[]) => unknown)(schema, '', 'UserRPC') as Record<string, TestCall>;
      const urls: string[] = [];

      await withFetch(
        (url) => {
          urls.push(url);
          return Response.json({});
        },
        () => get({ params: { id: '1' } })
      );

      deepStrictEqual(
        { getURL: get.getURL({ params: { id: '1' } }), urls },
        { getURL: '/users/1', urls: ['/users/1'] }
      );
    });

    it('Writes a Date param as its ISO string, as the query does', () => {
      const { getDay } = rpcOf({ getDay: { path: 'days/{day}', httpMethod: 'GET' } });
      const day = new Date('2026-10-02T10:20:30.456Z');

      strictEqual(getDay.getURL({ params: { day } }), getDay.getURL({ params: { day: day.toISOString() } }));
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

    it('Gives null for an empty JSON response sent without Content-Length', async () => {
      // Next.js sends new Response(null) with a JSON content type chunked: a body with no bytes and no length
      const chunked = () =>
        new Response(new ReadableStream({ start: (controller) => controller.close() }), {
          headers: { 'content-type': 'application/json' },
        });

      strictEqual(await withFetch(chunked, () => rpcOf(handlers).get()), null);
    });

    it('Parses any JSON media type in any case', async () => {
      const contentTypes = [
        'application/vnd.api+json',
        'Application/JSON',
        'APPLICATION/JSON; charset=UTF-8',
        'application/problem+json',
      ];

      for (const contentType of contentTypes) {
        const result = await withFetch(
          () => new Response('{"a":1}', { headers: { 'content-type': contentType } }),
          () => rpcOf(handlers).get()
        );

        deepStrictEqual(result, { a: 1 }, contentType);
      }
    });

    it('Reads the message of a problem+json error', async () => {
      const problem = { type: 'about:blank', title: 'Bad thing', detail: 'The thing is bad', status: 400 };

      await withFetch(
        () =>
          new Response(JSON.stringify(problem), {
            status: 400,
            headers: { 'content-type': 'application/problem+json' },
          }),
        () =>
          rejects(rpcOf(handlers).get(), (error: unknown) => {
            ok(error instanceof HttpException);
            strictEqual(error.statusCode, 400);
            strictEqual(error.message, 'The thing is bad');
            return true;
          })
      );
    });

    it('Streams JSON Lines whatever the case of the media type', async () => {
      const stream = (await withFetch(
        () => new Response('{"n":1}\n{"n":2}\n', { headers: { 'content-type': 'Application/JSONL; charset=utf-8' } }),
        () => rpcOf(handlers).get()
      )) as VovkStreamAsyncIterable<unknown>;

      deepStrictEqual(await stream.asPromise(), [{ n: 1 }, { n: 2 }]);
    });

    it('Streams an application/x-ndjson response as JSON Lines, as the Rust client does', async () => {
      const result = await withFetch(
        () => new Response('{"n":1}\n{"n":2}\n', { headers: { 'content-type': 'application/x-ndjson' } }),
        () => rpcOf(handlers).get()
      );

      ok(!(result instanceof Response), 'The response is returned as is, not read as JSON Lines');
      deepStrictEqual(await (result as VovkStreamAsyncIterable<unknown>).asPromise(), [{ n: 1 }, { n: 2 }]);
    });

    it('Sends null as a JSON body only to a body schema that accepts null', async () => {
      const withBody = (body: object) => ({ path: '', httpMethod: 'POST', validation: { body } });
      const object = { type: 'object', properties: { a: { type: 'string' } } };
      const nullable = { anyOf: [object, { type: 'null' }] };
      const rpc = rpcOf({
        typeNull: withBody({ type: 'null' }),
        typeList: withBody({ type: ['object', 'null'] }),
        // OpenAPI 3.0, as a mixin carries it
        nullableKeyword: withBody({ ...object, nullable: true }),
        anyOf: withBody(nullable),
        oneOf: withBody({ oneOf: nullable.anyOf }),
        object: withBody(object),
        contentTypeOnly: withBody({ 'x-contentType': ['application/json'] }),
        multipart: withBody({ ...nullable, 'x-contentType': ['multipart/form-data'] }),
      });
      const sent: [string, unknown][] = [];

      for (const name of Object.keys(rpc)) {
        await withFetch(
          (_url, init) => {
            sent.push([name, init.body]);
            return Response.json({});
          },
          () => rpc[name]({ body: null })
        );
      }

      deepStrictEqual(sent, [
        ['typeNull', 'null'],
        ['typeList', 'null'],
        ['nullableKeyword', 'null'],
        ['anyOf', 'null'],
        ['oneOf', 'null'],
        ['object', undefined],
        ['contentTypeOnly', undefined],
        ['multipart', undefined],
      ]);
    });
  });

  describe('request bodies, sent to a segment in this process', () => {
    it('Sends a null body to a procedure whose body is nullable', async () => {
      class AssignController {
        static assign = procedure({ body: z.object({ userId: z.string() }).nullable() }).handle(async (req) => ({
          body: await req.vovk.body(),
        }));
      }
      prefix('test')(AssignController);
      post('assign')(AssignController, 'assign');
      const segment = serve('nullable-body', { AssignController });
      const rpc = rpcOf({
        assign: { path: 'assign', httpMethod: 'POST', validation: AssignController.assign.schema.validation },
      });

      deepStrictEqual(await withFetch(segment, () => rpc.assign({ body: null })), { body: null });
      deepStrictEqual(await withFetch(segment, () => rpc.assign({ body: { userId: 'u1' } })), {
        body: { userId: 'u1' },
      });
    });

    it('Sends no body for null to a procedure whose body is optional but not nullable', async () => {
      // a model calling a derived tool sends null for a field it leaves out, and OpenAI's strict mode always does
      class DraftController {
        static save = procedure({ body: z.object({ title: z.string() }).optional() }).handle(async (req) => ({
          body: (await req.vovk.body()) ?? 'none',
          contentType: req.headers.get('content-type'),
        }));
      }
      prefix('test')(DraftController);
      post('drafts')(DraftController, 'save');
      const segment = serve('optional-body', { DraftController });
      const rpc = rpcOf({
        save: { path: 'drafts', httpMethod: 'POST', validation: DraftController.save.schema.validation },
      });
      const validated: unknown[] = [];
      const validateOnClient = (input: { body?: unknown }) => {
        validated.push(input.body);
        return input;
      };

      deepStrictEqual(await withFetch(segment, () => rpc.save({ body: null, validateOnClient })), {
        body: 'none',
        contentType: null,
      });
      // a custom validator sees no body either
      deepStrictEqual(validated, [undefined]);
    });

    it('Sends a FormData body urlencoded when the procedure takes only urlencoded', async () => {
      class LoginController {
        static login = procedure({
          contentType: 'application/x-www-form-urlencoded',
          body: z.object({ username: z.string() }),
        }).handle(async (req) => ({
          body: await req.vovk.body(),
          contentType: req.headers.get('content-type')?.split(';')[0],
        }));
      }
      prefix('test')(LoginController);
      post('login')(LoginController, 'login');
      const segment = serve('urlencoded-form-data', { LoginController });
      const rpc = rpcOf({
        login: { path: 'login', httpMethod: 'POST', validation: LoginController.login.schema.validation },
      });
      // the client body types and the /content-type table allow FormData here
      const form = new FormData();
      form.append('username', 'ann');

      deepStrictEqual(await withFetch(segment, () => rpc.login({ body: form })), {
        body: { username: 'ann' },
        contentType: 'application/x-www-form-urlencoded',
      });
    });

    it('Sends an untyped Blob as JSON to a procedure that takes JSON by default', async () => {
      const body = z.object({ title: z.string() });
      const echo = async (req: VovkRequest) => ({
        body: await req.vovk.body(),
        contentType: req.headers.get('content-type')?.split(';')[0],
      });
      class NoteController {
        static createJSON = procedure({ contentType: 'application/json', body }).handle(echo);
        static create = procedure({ body }).handle(echo);
      }
      prefix('test')(NoteController);
      post('notes-json')(NoteController, 'createJSON');
      post('notes')(NoteController, 'create');
      const segment = serve('default-json-blob', { NoteController });
      const { createJSON, create } = NoteController;
      const rpc = rpcOf({
        createJSON: { path: 'notes-json', httpMethod: 'POST', validation: createJSON.schema.validation },
        create: { path: 'notes', httpMethod: 'POST', validation: create.schema.validation },
      });
      const blob = new Blob([JSON.stringify({ title: 'hi' })]);
      const sent = { body: { title: 'hi' }, contentType: 'application/json' };

      // the /content-type table types a JSON body as TBody | Blob, and JSON is the default
      deepStrictEqual(await withFetch(segment, () => rpc.createJSON({ body: blob })), sent);
      deepStrictEqual(await withFetch(segment, () => rpc.create({ body: blob })), sent);
    });

    it('Sends bytes to a procedure that takes JSON or a file as the file type, as the Python and Rust clients do', async () => {
      class AvatarController {
        static upload = procedure({
          contentType: ['application/json', 'image/png'],
          body: z.union([z.object({ url: z.string() }), z.file()]),
        }).handle(async (req) => ({
          isFile: (await req.vovk.body()) instanceof File,
          contentType: req.headers.get('content-type')?.split(';')[0],
        }));
      }
      prefix('test')(AvatarController);
      post('avatar')(AvatarController, 'upload');
      const segment = serve('json-or-file', { AvatarController });
      const rpc = rpcOf({
        upload: { path: 'avatar', httpMethod: 'POST', validation: AvatarController.upload.schema.validation },
      });
      const png = new Uint8Array([137, 80, 78, 71]);

      deepStrictEqual(await withFetch(segment, () => rpc.upload({ body: png })), {
        isFile: true,
        contentType: 'image/png',
      });
      deepStrictEqual(await withFetch(segment, () => rpc.upload({ body: new Blob([png]) })), {
        isFile: true,
        contentType: 'image/png',
      });
      // an object still goes as JSON
      deepStrictEqual(await withFetch(segment, () => rpc.upload({ body: { url: 'a.png' } })), {
        isFile: false,
        contentType: 'application/json',
      });
    });

    describe('the content type of bytes', () => {
      const contentTypeOf = async (req: VovkRequest) => req.headers.get('content-type');
      class BytesController {
        static pngOrOctet = procedure({ contentType: ['image/png', 'application/octet-stream'] }).handle(contentTypeOf);
        static anyApplication = procedure({ contentType: ['application/*'] }).handle(contentTypeOf);
        static anyType = procedure({ contentType: ['*/*'] }).handle(contentTypeOf);
      }
      prefix('test')(BytesController);
      post('png-or-octet')(BytesController, 'pngOrOctet');
      post('any-application')(BytesController, 'anyApplication');
      post('any-type')(BytesController, 'anyType');
      const segment = serve('bytes-content-type', { BytesController });
      const { pngOrOctet, anyApplication, anyType } = BytesController;
      const rpc = rpcOf({
        pngOrOctet: { path: 'png-or-octet', httpMethod: 'POST', validation: pngOrOctet.schema.validation },
        anyApplication: { path: 'any-application', httpMethod: 'POST', validation: anyApplication.schema.validation },
        anyType: { path: 'any-type', httpMethod: 'POST', validation: anyType.schema.validation },
      });
      const send = (name: string, body: unknown) => withFetch(segment, () => rpc[name]({ body }));
      const png = new Uint8Array([137, 80, 78, 71]);

      it('Sends untyped bytes as the first declared type, even when application/octet-stream is declared too', async () => {
        strictEqual(await send('pngOrOctet', png), 'image/png');
      });

      it('Sends untyped bytes as the wildcard a procedure declares, application/* included', async () => {
        strictEqual(await send('anyApplication', png.buffer), 'application/*');
      });

      it('Sends untyped bytes as application/octet-stream to a procedure that takes any type', async () => {
        strictEqual(await send('anyType', new Blob([png])), 'application/octet-stream');
      });

      it('Sends a typed Blob as its own type when the procedure takes it', async () => {
        strictEqual(
          await send('pngOrOctet', new Blob([png], { type: 'application/octet-stream' })),
          'application/octet-stream'
        );
        strictEqual(await send('anyApplication', new Blob(['%PDF'], { type: 'application/pdf' })), 'application/pdf');
        strictEqual(await send('anyType', new Blob(['a,b'], { type: 'text/csv' })), 'text/csv');
      });
    });
  });

  describe('shipped types', () => {
    it('Type-check the client entry points in a project without Node types or lib esnext', () => {
      // a front-end project: no @types/node, ES2022 and DOM libs, library declarations checked
      const fileName = fileURLToPath(new URL('./front-end-consumer.mts', import.meta.url));
      const source = [
        "import { createRPC } from 'vovk/create-rpc';",
        "import { createFetcher, fetcher } from 'vovk/fetcher';",
        "export const rpc = createRPC({}, '', 'UserRPC', fetcher);",
        'export const custom = createFetcher<{ token?: string }>();',
      ].join('\n');
      const options: ts.CompilerOptions = {
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        target: ts.ScriptTarget.ES2022,
        lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
        types: [],
        module: ts.ModuleKind.Node16,
        moduleResolution: ts.ModuleResolutionKind.Node16,
      };
      const host = ts.createCompilerHost(options);
      const { fileExists, readFile, getSourceFile } = host;
      host.fileExists = (name) => name === fileName || fileExists(name);
      host.readFile = (name) => (name === fileName ? source : readFile(name));
      host.getSourceFile = (name, ...rest) =>
        name === fileName ? ts.createSourceFile(name, source, ts.ScriptTarget.ES2022) : getSourceFile(name, ...rest);
      const program = ts.createProgram([fileName], options, host);
      const diagnostics = ts.getPreEmitDiagnostics(program).map((diagnostic) => {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
        return `${diagnostic.file?.fileName.split('/dist/').pop() ?? ''}: ${message}`;
      });

      deepStrictEqual(diagnostics, []);
    });

    // a bundled client or a library ships declarations, which can name only what the package's entry points export
    const getDeclarationDiagnostics = (source: string) => {
      const fileName = fileURLToPath(new URL('./declaration-consumer.mts', import.meta.url));
      const options: ts.CompilerOptions = {
        strict: true,
        noEmit: true,
        declaration: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ES2022,
        lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
        // as a bundler resolves it, so a type is named by an entry point or not at all
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
      };
      const host = ts.createCompilerHost(options);
      const { fileExists, readFile, getSourceFile } = host;
      host.fileExists = (name) => name === fileName || fileExists(name);
      host.readFile = (name) => (name === fileName ? source : readFile(name));
      host.getSourceFile = (name, ...rest) =>
        name === fileName ? ts.createSourceFile(name, source, ts.ScriptTarget.ES2022) : getSourceFile(name, ...rest);
      const program = ts.createProgram([fileName], options, host);
      return ts
        .getPreEmitDiagnostics(program)
        .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '));
    };

    it('Name the types of a controller and its RPC module in declarations', () => {
      const source = [
        "import { procedure } from 'vovk';",
        "import { createRPC } from 'vovk/create-rpc';",
        "import type { VovkFetcher } from 'vovk/fetcher';",
        "import { z } from 'zod';",
        'export class UserController {',
        '  static updateUser = procedure({',
        '    body: z.object({ name: z.string() }),',
        '    query: z.object({ notify: z.string() }),',
        '    params: z.object({ id: z.string() }),',
        '  }).handle(async () => ({ ok: true }));',
        '  static streamTokens = procedure({',
        '    query: z.object({ from: z.string() }),',
        '    iteration: z.object({ token: z.string() }),',
        '  }).handle(async function* () {',
        "    yield { token: 'a' };",
        '  });',
        '}',
        'export const UserRPC = createRPC<',
        '  typeof UserController,',
        "  typeof import('vovk/fetcher').fetcher extends VovkFetcher<infer U> ? U : never",
        ">({}, '', 'UserRPC', import('vovk/fetcher'), { validateOnClient: undefined });",
      ].join('\n');

      deepStrictEqual(getDeclarationDiagnostics(source), []);
    });

    it('Name the type of a custom fetcher in declarations', () => {
      // a library that exports its fetcher imports nothing else from vovk
      const source = [
        "import { createFetcher } from 'vovk/fetcher';",
        'export const fetcher = createFetcher<{ token?: string }>();',
        'export const plainFetcher = createFetcher();',
      ].join('\n');

      deepStrictEqual(getDeclarationDiagnostics(source), []);
    });
  });
});
