import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { get, initSegment, post, type VovkRequest } from 'vovk';

type Handlers = ReturnType<typeof initSegment>;

// dispatches as Next.js does for app/api/[[...vovk]]/route.ts: each segment of the catch-all decoded
const call = (handlers: Handlers, method: keyof Handlers, url: string) => {
  const req = new Request(`http://localhost/api/${url}`, { method });
  Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) });
  const vovk = new URL(req.url).pathname.split('/').slice(2).filter(Boolean).map(decodeURIComponent);
  return handlers[method](req, { params: Promise.resolve({ vovk }) });
};

const echo = (name: string) => (_req: VovkRequest, params: Record<string, string>) => ({ name, params });

let segmentCount = 0;
// a segment with a controller per route, each answering its route and params
function segmentWith(routes: string[], method = get) {
  const controllers: Record<string, Function> = {};
  routes.forEach((route, i) => {
    class RouteController {
      static handle = echo(route);
    }
    method(route)(RouteController, 'handle');
    controllers[`Route${i}RPC`] = RouteController;
  });
  return initSegment({ segmentName: `routes-${segmentCount++}`, controllers });
}

const json = async (handlers: Handlers, url: string, method: keyof Handlers = 'GET') => {
  const response = await call(handlers, method, url);
  return { status: response.status, body: await response.json() };
};

await describe('Route matching', async () => {
  await it('Prefers a literal route to a route with a param', async () => {
    const handlers = segmentWith(['users/{id}', 'users/me']);
    deepStrictEqual((await json(handlers, 'users/me')).body, { name: 'users/me', params: {} });
    deepStrictEqual((await json(handlers, 'users/42')).body, { name: 'users/{id}', params: { id: '42' } });
  });

  await it('Gives each new path its own params', async () => {
    const handlers = segmentWith(['users/{userId}/posts/{postId}']);
    for (const [userId, postId] of [
      ['1', 'a'],
      ['2', 'b'],
      ['1', 'c'],
    ]) {
      deepStrictEqual((await json(handlers, `users/${userId}/posts/${postId}`)).body, {
        name: 'users/{userId}/posts/{postId}',
        params: { userId, postId },
      });
    }
  });

  await it('Follows literals after a param and params after a literal', async () => {
    const handlers = segmentWith(['users/{id}/posts', 'users/{id}/comments', 'users/latest/{kind}']);
    deepStrictEqual((await json(handlers, 'users/7/comments')).body, {
      name: 'users/{id}/comments',
      params: { id: '7' },
    });
    deepStrictEqual((await json(handlers, 'users/latest/posts')).status, 500);
    deepStrictEqual((await json(handlers, 'users/latest/likes')).body, {
      name: 'users/latest/{kind}',
      params: { kind: 'likes' },
    });
    strictEqual((await call(handlers, 'GET', 'users/7/likes')).status, 404);
    strictEqual((await call(handlers, 'GET', 'users/7')).status, 404);
    strictEqual((await call(handlers, 'GET', 'users/7/posts/1')).status, 404);
  });

  await it('Answers 500 with every route in declaration order when two routes with params match', async () => {
    const handlers = segmentWith(['a/{x}', 'b/{y}', '{z}/b']);
    const { status, body } = await json(handlers, 'a/b');
    strictEqual(status, 500);
    strictEqual(body.message, 'Conflicting routes found: a/{x}, {z}/b');
  });

  await it('Answers 500 for a route that repeats a param name, as soon as its shape matches', async () => {
    const handlers = segmentWith(['items/{id}/{id}', 'items/{id}/view']);
    const { status, body } = await json(handlers, 'items/1/view');
    strictEqual(status, 500);
    strictEqual(body.message, 'Duplicate parameter "id" at items/{id}/{id}');
  });

  await it('Matches a segment with literals around its params', async () => {
    const handlers = segmentWith(['range/{from}-{to}.json', 'range/{id}']);
    deepStrictEqual((await json(handlers, 'range/1-5.json')).status, 500);
    const only = segmentWith(['range/{from}-{to}.json', 'files/{name}.txt']);
    deepStrictEqual((await json(only, 'range/1-5.json')).body, {
      name: 'range/{from}-{to}.json',
      params: { from: '1', to: '5' },
    });
    deepStrictEqual((await json(only, 'files/notes.txt')).body, {
      name: 'files/{name}.txt',
      params: { name: 'notes' },
    });
    strictEqual((await call(only, 'GET', 'files/notes.md')).status, 404);
    strictEqual((await call(only, 'GET', 'range/1.json')).status, 404);
  });

  await it('Keeps a decoded "/" inside its segment', async () => {
    const handlers = segmentWith(['files/{name}', 'files/a/b']);
    deepStrictEqual((await json(handlers, 'files/a%2Fb')).body, { name: 'files/{name}', params: { name: 'a/b' } });
    deepStrictEqual((await json(handlers, 'files/a/b')).body, { name: 'files/a/b', params: {} });
  });

  await it('Matches a path that spells a template to the route with the param', async () => {
    const handlers = segmentWith(['users/{id}']);
    deepStrictEqual((await json(handlers, 'users/%7Bid%7D')).body, { name: 'users/{id}', params: { id: '{id}' } });
  });

  await it('Treats prototype names as plain segments', async () => {
    const handlers = segmentWith(['{id}/toString', 'constructor']);
    deepStrictEqual((await json(handlers, '__proto__/toString')).body, {
      name: '{id}/toString',
      params: { id: '__proto__' },
    });
    strictEqual((await call(handlers, 'GET', 'toString')).status, 404);
    strictEqual((await call(handlers, 'GET', '__proto__')).status, 404);
    strictEqual((await call(handlers, 'GET', 'hasOwnProperty/toString')).status, 200);
  });

  await it('Answers 405 with the methods of a path with a param', async () => {
    const handlers = segmentWith(['users/{id}'], post);
    const response = await call(handlers, 'GET', 'users/1');
    strictEqual(response.status, 405);
    strictEqual(response.headers.get('allow'), 'POST');
  });

  await it('Answers HEAD from a GET route with a param', async () => {
    const handlers = segmentWith(['users/{id}']);
    const response = await call(handlers, 'HEAD', 'users/1');
    strictEqual(response.status, 200);
    strictEqual(await response.text(), '');
  });

  await it('Finds a new path with a param, or none, in about the same time with 10 routes or 10,000', async () => {
    const time = async (routeCount: number) => {
      const handlers = segmentWith(Array.from({ length: routeCount }, (_, i) => `r${i}/{id}`));
      const last = routeCount - 1;
      for (let i = 0; i < 200; i++) await call(handlers, 'GET', `r${last}/warm${i}`);
      const start = performance.now();
      for (let i = 0; i < 2000; i++) {
        await call(handlers, 'GET', `r${last}/${i}`);
        await call(handlers, 'GET', `missing/${i}`);
      }
      return performance.now() - start;
    };
    const small = await time(10);
    const large = await time(10_000);
    // checking each route in turn made the large one about 100 times slower
    ok(large < small * 4, `10 routes: ${small.toFixed(1)} ms, 10,000 routes: ${large.toFixed(1)} ms`);
  });
});
