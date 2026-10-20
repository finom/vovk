---
name: base
description: Vovk.ts essentials — ALWAYS load first for any Vovk.ts task, including building a back end or API in a project that has vovk.config.* or .vovk-schema/. Holds what a typical build needs, checked against vovk 4's code - project layout, a complete endpoint, how requests, validation and errors behave, status codes, a custom error format, CORS, and how to get the schema, the typed client and the OpenAPI document. The other vovk:* skills go deeper on one topic each; load them only for that topic.
---

# Vovk.ts essentials

What a typical API build needs. Every fact here matches vovk 4.1's code: don't read `node_modules/vovk*` to check it (version, exports, CLI), and don't `WebFetch` vovk.dev. If something is missing, say so. The installed version is the `vovk` entry in `package.json` (`require('vovk/package.json')` throws: the file isn't exported); the `vovk` bin is in `node_modules/.bin`.

Deeper topics, one skill each: `procedure` (`.fn()`, content types, uploads, downloads, server actions), `decorators` (auth, `meta`, stacking), `segment` (several or static segments), `rpc` (client options, fetcher), `openapi` (`@operation`, Scalar), `jsonlines` (streaming), `tools` (AI tools, MCP), `config`, `init`, `bundle`, `mixins`, `multitenant`, `python`, `rust`.

## What `vovk` exports

- Values: `procedure`, `initSegment`, `get`, `post`, `put`, `patch`, `del`, `head`, `options`, `prefix`, `operation`, `createDecorator`, `HttpException`, `HttpStatus`, `HttpMethod`, `JSONLinesResponder`, `progressive`, `toDownloadResponse`, `controllersToStaticParams`, `multitenant`, `deriveTools`, `ToModelOutput`, `cloneControllerMetadata`.
- Types: `VovkRequest`, `VovkBody`, `VovkQuery`, `VovkParams`, `VovkInput`, `VovkOutput`, `VovkIteration`, `VovkReturnType`, `VovkYieldType`, `VovkConfig`, `VovkSchema`, and a few more for tools and streams.
- Other entry points: `vovk/fetcher` (`fetcher`, `createFetcher`), `vovk/create-rpc`, `vovk/create-validate-on-client`.

## Rules

- Node.js 24.15+ (or Bun 1.4+, Deno 2.9+), Next.js 15+ App Router, TypeScript 5.5+.
- Commit `.vovk-schema/`; the generated client dir (`src/client`) is gitignored and rebuilt by `prebuild`.

## Layout

- **Segment**: `src/app/api/[[...vovk]]/route.ts` serves `/api/*`. Create it once with `npx vovk new segment`.
- **Module**: `src/modules/<name>/<name>-controller.ts` and `<name>-service.ts`. `npx vovk new controller service <name> --empty` writes both and adds the controller to `route.ts`; writing them yourself and adding the controller to `controllers` works the same. `<name>` is camelCase (`userProfile`).
- **Controller**: static procedures with HTTP decorators. A procedure reads the validated input and calls the service.
- **Service**: business logic and data, plain typed arguments, never `req`.

```ts
// src/app/api/[[...vovk]]/route.ts
import { initSegment } from 'vovk';
import ArticleController from '../../../modules/article/article-controller';

const controllers = { ArticleRPC: ArticleController }; // the key is the client module name
export type Controllers = typeof controllers;

export const { GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS } = initSegment({ controllers });
```

## An endpoint

```ts
// src/modules/article/article-controller.ts
import { get, post, prefix, procedure, operation, HttpException, HttpStatus } from 'vovk';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import ArticleService from './article-service';

const Article = z.object({ slug: z.string(), title: z.string() });

@prefix('articles')
export default class ArticleController {
  @operation({ summary: 'List articles' })
  @get()                                    // GET /api/articles?limit=20
  static list = procedure({
    query: z.object({ limit: z.coerce.number().int().max(100).default(20) }),
    output: z.object({ articles: z.array(Article) }),
  }).handle(async ({ vovk }) => ArticleService.list(vovk.query()));

  @operation({ summary: 'Get an article' })
  @get('{slug}')                            // GET /api/articles/{slug}
  static get = procedure({
    params: z.object({ slug: z.string() }),
    output: Article,
  }).handle(async (_req, { slug }) => {
    const article = ArticleService.find(slug);
    if (!article) throw new HttpException(HttpStatus.NOT_FOUND, 'Article not found');
    return article;
  });

  @operation({ summary: 'Create an article' })
  @post()                                   // POST /api/articles, 201
  static create = procedure({
    body: z.object({ title: z.string().min(1) }),
  }).handle(async ({ vovk }) => NextResponse.json(ArticleService.create(await vovk.body()), { status: 201 }));
}
```

URL = `/api/<segment>/<@prefix>/<path>`, empty parts dropped. `{name}` in a path is a param. `@put`, `@patch`, `@del`, `@head`, `@options` work the same.

A path equal to a route with no params gets that route, whatever the order (`users/me` over `users/{id}`). If two routes with params match the same path, the request answers 500 `Conflicting routes found: …`.

`output` is optional. It checks the returned value and becomes the response schema in the OpenAPI document. Without it the client takes the handler's return type, including the body type of `NextResponse.json(…)`.

## Requests

- `await req.vovk.body()`, `req.vovk.query()`, `req.vovk.params()` return the validated input; the handler's second argument is the params. These also work under `.fn()`, where `req.json()` and `req.nextUrl` don't.
- Query values arrive as strings: use `z.coerce.number()`, `z.stringbool()` (not `z.coerce.boolean()`, which makes `"false"` true) or `z.enum`. Repeated keys (`tag=a&tag=b`) and `tag[]=a` give arrays, `filter[status]=open` gives objects, and a lone value for an array field becomes a one-item array.
- Headers and cookies: `headers()` / `cookies()` from `next/headers`, or `req.headers` over HTTP only.
- Validation takes any Standard Schema library that also gives JSON Schema: Zod 4 and ArkType as they are, Valibot wrapped in `toStandardJsonSchema()`.

## Responses

- A returned value is sent as JSON with status 200. `undefined` and `null` send `null`.
- A returned `Response` is sent as it is: `NextResponse.json(data, { status: 201 })` (from `next/server`, so the client keeps the body type), `new Response(null, { status: 204 })`, or with headers.
- With an `output` schema, return the data instead: the output check runs on the returned value, so a `Response` fails it with a 500. Set the status in a decorator, which gets the data after the check:

```ts
import { createDecorator } from 'vovk';

export const status = createDecorator(async (_req, next, code: number) => {
  const data = await next();
  return code === 204 ? new Response(null, { status: 204 }) : Response.json(data, { status: code });
});

// @post() @status(201) static create = procedure({ body, output }).handle(...)
```

- HEAD gets the GET route's status and headers, without a body.

## Errors

`throw new HttpException(HttpStatus.NOT_FOUND, 'Article not found', cause?)` answers with that status and this body (`cause` only when set):

```json
{ "statusCode": 404, "message": "Article not found", "isError": true, "cause": {} }
```

The generated client throws it again as `HttpException` with the same `statusCode`, `message` and `cause`.

`HttpStatus` names: `OK`, `CREATED`, `ACCEPTED`, `NO_CONTENT`, `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`, `CONFLICT`, `GONE`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `UNPROCESSABLE_ENTITY`, `TOO_MANY_REQUESTS`, `INTERNAL_SERVER_ERROR`, `NOT_IMPLEMENTED`, `SERVICE_UNAVAILABLE`, and the other standard codes.

What vovk answers by itself, in the same body:

| Case | Status | `message` |
|---|---|---|
| body, query or params fail their schema | 400 | `Validation failed. Invalid body: <issue> at <path>, …`; `cause.issues` holds up to 20 `{ message, path, code, … }` |
| a required body is missing | 400 | the same, validated as `undefined` |
| invalid JSON | 400 | `Invalid JSON body: …` |
| a body whose `Content-Type` isn't the procedure's (JSON by default), or none | 415 | `Unsupported media type: …` / `Missing Content-Type header` |
| no route for the path in the segment | 404 | `Route '<path>' is not found for <METHOD> method at the root segment` |
| the path has routes, not for this method | 405 | `Method <METHOD> is not allowed …`, with an `Allow` header |
| the returned value fails `output` | 500 | `Validation failed. Invalid output: …`; in production `Internal server error` |
| any other thrown error | 500 | its message; in production `Internal server error`, no `cause` |

Order: `onBefore`, the decorators, then the procedure's checks (content type, body, query, params), the handler, the `output` check, and back out through the decorators. `onError` in `initSegment({ onError })` sees every error for logging; it can't change the response.

### A different error format

The body above is vovk's format, and the client relies on it. When a spec requires another error body, map it in `route.ts`. Every error, including 404 and 405, passes through there:

```ts
// src/app/api/[[...vovk]]/route.ts
const handlers = initSegment({ controllers });

type VovkError = { statusCode: number; message: string; cause?: { issues?: { message: string; path?: (string | number)[] }[] } };

// your format: status and body from vovk's error
function toApiError(err: VovkError) {
  return { status: err.statusCode, body: { error: { message: err.message } } };
}

const withApiErrors =
  <T extends (...args: never[]) => Promise<Response>>(handler: T) =>
  (async (...args: Parameters<T>) => {
    const res = await handler(...args);
    if (res.ok || !res.headers.get('content-type')?.includes('application/json')) return res;
    const err = await res.clone().json().catch(() => null);
    if (!err?.isError) return res; // a Response a handler built itself
    const { status, body } = toApiError(err);
    const headers = new Headers(res.headers);
    headers.delete('content-length');
    return Response.json(body, { status, headers });
  }) as T;

export const GET = withApiErrors(handlers.GET);
export const POST = withApiErrors(handlers.POST);
// PUT, PATCH, DELETE, HEAD, OPTIONS the same way
```

A decorator can also catch errors for its own procedures: `next()` throws the `HttpException` (a validation error's `cause.issues` holds the library's own issues), and the decorator returns any `Response`. It doesn't see 404, 405 or errors from other decorators above it.

With another error body, the client still throws `HttpException` with the HTTP status. It takes the message from the body's `message`, or from the dot path in `@operation({ 'x-errorMessageKey': 'error.message' })`.

## CORS

`@get('x', { cors: true })` adds `access-control-allow-origin: *` and `access-control-allow-headers: content-type, authorization, x-meta` to that route's responses, errors included, and answers its preflight (200, with `access-control-allow-methods`). `route.ts` must export `OPTIONS`. A 404 for an unknown path gets no CORS headers. For every route at once, export your own `OPTIONS` and add the headers in the `route.ts` wrapper above, or in Next.js middleware.

## Decorators

`createDecorator(handler)` returns a decorator factory: `const auth = createDecorator(async (req, next, role?: string) => …)`, applied as `@auth()` or `@auth('admin')` (always called). `req` is a `VovkRequest`, `next: () => Promise<unknown>`, and the extra parameters are what the factory takes, type-checked at the call site. An optional second argument, `initHandler`, adds to the procedure's schema (as `@operation` does) and runs no code per request. `next()` returns the handler's value, after the `output` check, or throws. What the decorator returns is the response: a value is sent as JSON with 200, a `Response` as it is. Decorators written higher run first; the HTTP decorator's position among them doesn't matter. Request state: `req.vovk.meta<T>(value?: T | null): T` merges `value` into the request's meta and returns it; `req.vovk.meta<T>()` reads it, `null` clears it. A helper that takes the request types it `VovkRequest` (from `vovk`). Auth patterns: `decorators` skill.

## Schema, client and OpenAPI

- `.vovk-schema/` comes from the running dev server. After changing controllers, run `PORT=<port> npx vovk dev --next-dev --exit`: it starts Next.js, writes `.vovk-schema/` and the client, stops, and exits with 1 on failure. `npx vovk generate` only rebuilds the client from the existing `.vovk-schema/`; `npm run build` runs it first (`prebuild`).
- The client is in `src/client`, imported as `@/client`: `await ArticleRPC.get({ params: { slug } })`, with `body` and `query` the same way. Its `apiRoot` is `/api`; outside a browser pass a full URL: `ArticleRPC.get({ params, apiRoot: 'http://localhost:3000/api' })`, or `ArticleRPC.withDefaults({ apiRoot })`.
- A plain Node script can't load the client (TypeScript with extensionless imports); run it with `tsx`: `npx tsx scripts/smoke.ts`. Use `.ts` with an `async function main()`, not `.mts`: the project isn't `"type": "module"`, so in an `.mts` file a default import of a project file (a controller) arrives as `{ default }`. A script can call a procedure without a server: `await UserController.getUser.fn({ params })`. tsx loads no `.env` file: `npx tsx --env-file=.env.local scripts/smoke.ts`. Next.js never overrides a variable already set in the shell, so a shell `DATABASE_URL` wins over `.env.local`. In such a script, check an error's `statusCode`: `instanceof HttpException` can fail there, since tsx may load vovk twice.
- The OpenAPI document: `import { openapi } from '@/client/openapi'` (also `src/client/openapi.json`). It lists only procedures with an `@operation` decorator. The `output` schema becomes `responses.200`; add other responses with `@operation({ responses: { 201: { description: 'Created' } } })`, merged over it. Serve it from a procedure that returns `openapi`.
