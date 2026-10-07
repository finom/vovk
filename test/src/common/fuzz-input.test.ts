import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import fc from 'fast-check';
import { del, get, initSegment, post, prefix, procedure } from 'vovk';

type Handlers = ReturnType<typeof initSegment>;
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// dispatches as Next.js does for app/api/[[...vovk]]/route.ts
const call = (handlers: Handlers, method: Method, url: string, init: RequestInit = {}) => {
  const req = new Request(`http://localhost/api/${url}`, { method, ...init });
  Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) });
  const path = new URL(req.url).pathname.split('/').slice(2).filter(Boolean).map(decodeURIComponent);
  return handlers[method](req, { params: Promise.resolve({ vovk: path }) });
};

const prototypeNames = () => Object.getOwnPropertyNames(Object.prototype).sort();

const createHandlers = (segmentName: string) => {
  class FuzzController {
    static query = procedure().handle(async (req) => req.vovk.query());

    static form = procedure({ contentType: ['multipart/form-data', 'application/x-www-form-urlencoded'] }).handle(
      async (req) => {
        const body = (await req.vovk.body()) as Record<string, unknown>;
        return Object.fromEntries(Object.entries(body).map(([k, v]) => [k, Array.isArray(v) ? v.length : 1]));
      }
    );

    static readThing = procedure().handle(async (_req, params) => ({ route: 'read', params }));

    static importThings = procedure().handle(async () => ({ route: 'import' }));

    static deleteFile = procedure().handle(async (_req, params) => ({ route: 'delete', params }));

    static uploadFile = procedure().handle(async (_req, params) => ({ route: 'upload', params }));
  }
  prefix('fuzz')(FuzzController);
  get('query')(FuzzController, 'query');
  post('form')(FuzzController, 'form');
  get('things/{id}')(FuzzController, 'readThing');
  post('things/import')(FuzzController, 'importThings');
  del('things/{id}/files/{fileId}')(FuzzController, 'deleteFile');
  post('things/{id}/files/upload')(FuzzController, 'uploadFile');
  return initSegment({ segmentName, controllers: { FuzzRPC: FuzzController } });
};

// keys and values that reach the parsers' edge cases: brackets, indexes, inherited names, encodings
const keyArb = fc.oneof(
  fc.constantFrom('a', 'b', 'x[]', 'x[0]', 'x[1]', 'x[2]', 'y[z]', 'y[z][0]', 'a[b][c]', 'a[-1]', 'a[999999999]'),
  fc.constantFrom('__proto__', 'constructor', 'prototype', 'toString', 'hasOwnProperty[call]', '__proto__[x]'),
  fc.string({ maxLength: 8 })
);
const valueArb = fc.oneof(fc.string({ maxLength: 8 }), fc.constantFrom('', '%', '%2F', '%E0%A4%A', '1', 'true'));

await describe('Fuzzing the input boundary', async () => {
  await it('Answers any query string without a 500 or a change to Object.prototype', async () => {
    const handlers = createHandlers('fuzz-query');
    const before = prototypeNames();
    await fc.assert(
      fc.asyncProperty(fc.array(fc.tuple(keyArb, valueArb, fc.boolean()), { maxLength: 12 }), async (pairs) => {
        const query = pairs
          .map(([k, v, encode]) => (encode ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}` : `${k}=${v}`))
          .join('&');
        const response = await call(handlers, 'GET', `fuzz/query?${query}`);
        ok(response.status < 500, `${response.status} for ?${query}`);
        if (response.status === 200) {
          const body = await response.json();
          strictEqual(typeof body, 'object');
        }
      }),
      { numRuns: 300 }
    );
    deepStrictEqual(prototypeNames(), before);
    strictEqual(({} as Record<string, unknown>).x, undefined);
  });

  await it('Counts every repeated form field and skips __proto__', async () => {
    const handlers = createHandlers('fuzz-form');
    const nameArb = fc.oneof(fc.constantFrom('a', 'b', 'c', '__proto__', 'constructor', 'toString'), fc.string());
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.tuple(nameArb, valueArb), { maxLength: 20 }),
        fc.boolean(),
        async (fields, multipart) => {
          const expected: Record<string, number> = {};
          for (const [name] of fields) {
            if (name === '__proto__') continue;
            expected[name] = Object.hasOwn(expected, name) ? expected[name] + 1 : 1;
          }
          let body: FormData | URLSearchParams;
          if (multipart) {
            body = new FormData();
            for (const [name, value] of fields) body.append(name, value);
          } else {
            body = new URLSearchParams(fields);
          }
          const response = await call(handlers, 'POST', 'fuzz/form', { body });
          strictEqual(response.status, 200);
          deepStrictEqual(await response.json(), JSON.parse(JSON.stringify(expected)));
        }
      ),
      { numRuns: 300 }
    );
  });

  await it('Routes each request as a fresh segment would, whatever came before it', async () => {
    const segmentArb = fc.constantFrom(
      'things',
      'import',
      'files',
      'upload',
      '1',
      'constructor',
      '__proto__',
      'toString',
      '%2F',
      '..',
      'fuzz'
    );
    const requestArb = fc.record({
      method: fc.constantFrom<Method>('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'),
      path: fc.array(segmentArb, { minLength: 1, maxLength: 5 }).map((segments) => `fuzz/${segments.join('/')}`),
    });
    let n = 0;
    // a 404 names its segment, and every segment here has its own name
    const text = async (response: Response) => (await response.text()).replace(/fuzz-route-\d+/g, 'fuzz-route');
    await fc.assert(
      fc.asyncProperty(fc.array(requestArb, { minLength: 1, maxLength: 12 }), async (requests) => {
        const shared = createHandlers(`fuzz-route-${n++}`);
        for (const { method, path } of requests) {
          const fresh = createHandlers(`fuzz-route-${n++}`);
          const got = await call(shared, method, path);
          const want = await call(fresh, method, path);
          ok(got.status < 500, `${got.status} for ${method} ${path}`);
          strictEqual(got.status, want.status, `${method} ${path}`);
          strictEqual(await text(got), await text(want), `${method} ${path}`);
        }
      }),
      { numRuns: 200 }
    );
  });
});
