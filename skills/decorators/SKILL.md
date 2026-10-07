---
name: decorators
description: Vovk.ts decorators — built-in (`@prefix`, `@operation`, `@get/@post/@put/@patch/@del`, `.auto()`) and custom via `createDecorator`. Covers authorization / auth decorators, middleware-style wrapping (pre-handler + post-handler logic), `req.vovk.meta()` for cross-decorator state, stacking order, and the local (`.fn()`) vs HTTP context distinction. Use whenever the user asks to "write a custom decorator", "add auth middleware", "protect an endpoint", "build an authorization decorator", "createDecorator", "stack decorators", "share data between decorator and handler", "prefix all routes", "@auto", "decorator execution order". Does NOT cover procedure authoring → hand off to `procedure` skill. Does NOT cover `@operation` for OpenAPI beyond auth-related fields → hand off to `openapi` skill. Does NOT cover `@operation.x-tool` for tool derivation → hand off to `tools` skill.
---

# Vovk.ts decorators

Decorators wrap static methods on controllers. Three kinds:

- **HTTP decorators** (`@get`, `@post`, `@put`, `@patch`, `@del`) — mark procedure as HTTP route. See `procedure` skill.
- **Metadata decorators** (`@prefix`, `@operation`) — attach info, no behavior change.
- **Custom decorators** (`createDecorator`) — middleware wrapping handler. How auth, logging, feature flags attach.

One syntax: `@decorator`. `vovk init` enables `experimentalDecorators` in `tsconfig.json`; a webpack build (`next build --webpack`, Next.js 15's default) needs it, Turbopack (Next.js 16's default) compiles vovk's decorators either way.

## Scope

Covers:

- `@prefix` for route prefixes.
- `.auto()` for name-derived routes.
- HTTP decorator options (`headers`, `cors`).
- `createDecorator` — runs before/after handler.
- Auth pattern with `req.vovk.meta()` state passing.
- Stacking order (top-down — outermost runs first).
- Local (`.fn()`) context detection.

Out of scope:

- Writing procedures + validation → **`procedure` skill**.
- `@operation` for OpenAPI docs → **`openapi` skill**.
- `@operation.tool` for AI tool derivation → **`tools` skill**.
- Next.js middleware (`middleware.ts`) — separate, runs earlier in request lifecycle.

## `@prefix`

Class-level route prefix:

```ts
import { prefix, get, procedure } from 'vovk';

@prefix('users')
export default class UserController {
  @get('{id}')
  static getUser = procedure({ /* ... */ }).handle(/* ... */);
}
// → GET /api/users/{id}
```

Root-level — `@prefix('')` or omit (same effect):

```ts
export default class RootController {
  @get()
  static ping = procedure().handle(() => ({ ok: true }));
}
// → GET /api
```

## `.auto()` — name-derived routes

Use method name instead of path:

```ts
@put.auto()
static doSomething = procedure().handle(/* ... */);
// → PUT /api/<prefix>/do-something
```

Method names → kebab-case. Works with every HTTP decorator (`@get.auto()`, `@post.auto()`, etc.), same options.

## HTTP decorator options

Second arg: response-header + CORS config.

```ts
@put('do-something', {
  headers: { 'x-hello': 'world' },
  cors: true,
})
static doSomething = procedure().handle(/* ... */);
```

- `headers` — merged into response.
- `cors: true` — auto permissive CORS (responds to `OPTIONS`, sets `Access-Control-*`). Needs `OPTIONS` in segment's `initSegment()` exports (`export const { GET, POST, ..., OPTIONS } = initSegment();`) — else Next.js answers the preflight itself (204 with `Allow`, no `Access-Control-*` headers), and the browser blocks the cross-origin call. For finer control, custom decorator or Next.js middleware.

## Custom decorators — `createDecorator`

Middleware-shaped: receive request + `next`, work before/after, return response.

```ts
import { createDecorator } from 'vovk';

const timingDecorator = createDecorator(async (req, next) => {
  const start = Date.now();
  const response = await next();
  console.log(`[${req.method}] ${req.url} — ${Date.now() - start}ms`);
  return response;
});
```

Apply above HTTP decorator (stacking order below):

```ts
@get('{id}')
@timingDecorator()
static getUser = procedure({ /* ... */ }).handle(/* ... */);
```

### Auth decorator pattern

Gate access, pass user state to handler via `req.vovk.meta()`. **Always pass explicit generic to every `meta()` call** — both set + read — and share single type alias across every site touching auth metadata. `meta()`'s generic defaults to `Record<string, any>` → untyped call silently loses inference, sides drift apart.

```ts
// auth.ts — define once, import everywhere the auth decorator is used
import { createDecorator, HttpException, HttpStatus } from 'vovk';
import { headers } from 'next/headers';

export type AuthMeta = { user: User };

export const authGuard = createDecorator(async (req, next) => {
  const token = (await headers()).get('authorization');
  if (!token) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Missing token');
  }
  const user = await parseToken(token); // your auth logic — returns `User | null`
  if (!user) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }
  req.vovk.meta<AuthMeta>({ user });
  return next();
});
```

Reading token via `next/headers` (not `req.headers`) → guard works identically over HTTP and under `.fn()` called inside a Next.js request (server components, server actions, route handlers). Outside one — a unit test, a script — `headers()` throws "`headers` was called outside a request scope": mock it in tests, e.g. `vi.mock('next/headers', () => ({ headers: async () => new Headers({ authorization: 'Bearer test' }) }))`. See **Local vs HTTP context** below.

Consume in handler — same `AuthMeta`:

```ts
import { authGuard, type AuthMeta } from './auth';

@get('{id}')
@authGuard()
static getUser = procedure({ /* ... */ }).handle((req) => {
  const { user } = req.vovk.meta<AuthMeta>();
  // user is `User`, present and typed
});
```

**Throw, don't return**: `HttpException` short-circuits chain. Returning response object bypasses handler silently — possible, bug magnet.

### Role / scope check

Decorators with arguments don't wrap `createDecorator` in outer factory — handler signature is `(req, next, ...args)`, so call-site args (`@roleGuard('admin')`) flow through to handler's trailing params. Declare once, reuse same `AuthMeta`:

```ts
import { authGuard, type AuthMeta } from './auth';

const roleGuard = createDecorator(async (req, next, role: 'admin' | 'user') => {
  const { user } = req.vovk.meta<AuthMeta>();
  if (user.role !== role) {
    throw new HttpException(HttpStatus.FORBIDDEN, 'Insufficient role');
  }
  return next();
});

@get('admin-only')
@authGuard()
@roleGuard('admin')
static adminOnly = procedure().handle(/* ... */);
```

`TArgs` inferred from handler signature → `@roleGuard('admin')` type-checked against `'admin' | 'user'` at call site.

`@authGuard()` is **outermost** wrapping decorator (topmost, after `@get`) → runs first, populates `meta<AuthMeta>({ user })`. `@roleGuard('admin')` runs next, reads same alias, decides whether to throw. No need to guard `if (!user)` — auth threw `UNAUTHORIZED` otherwise. See stacking-order section below.

## `req.vovk.meta()` — cross-decorator state

Key/value store on request. Signature: `meta<T>(value?: T | null): T`, `T` defaults to `Record<string, any>` — **always pass generic** on set + read so TypeScript checks shape, doesn't fall through to `any`. For concern used by more than one decorator (auth, tracing, feature flags), hoist type to shared module + import everywhere:

```ts
type TraceMeta = { traceId: string };

req.vovk.meta<AuthMeta>({ user });                   // set, typed against shared alias
const { user } = req.vovk.meta<AuthMeta>();          // read, same alias
req.vovk.meta<TraceMeta>({ traceId: 'abc' });        // merge (keeps existing `user`)
req.vovk.meta(null);                                 // clear all (no generic needed)
```

Calls **merge** — consecutive `meta()` accumulate. How decorators pass state to each other + handler. Each `meta()` types only its slice; merged object carries keys from every contributor.

### Client-supplied metadata (`x-meta`)

Clients ship metadata via `x-meta` header. Lives under separate key (`xMetaHeader`) in `meta()` — does **not** overwrite server-set keys. Server-trusted state safe from client spoofing.

## Stacking order

Decorators execute **top-to-bottom** — topmost wrapping decorator (furthest from handler) runs first pre-handler. Opposite of TS's bottom-up *application* order: `@C` applied first → ends up innermost wrapper, runtime runs *last* pre-handler.

```ts
@get('/x')
@decoratorA()   // runs FIRST (outermost wrapper)
@decoratorB()   // runs second
@decoratorC()   // runs LAST pre-handler (innermost, closest to handler)
static handler = procedure().handle(/* ... */);
```

Pre-handler: A → B → C → handler. Post-handler (after `next()` resolves): handler → C → B → A.

Auth: put authentication **at top** (outermost) → populates `meta()` before downstream reads. Authorization / role checks stack just below — see what auth wrote.

### Wrapping decorators vs. schema-only decorators

Not every decorator uses `req`. Placement rule depends on what decorator does:

- **Wrapping decorators** — read `req` / call `next()` (auth, logging, timing, any `createDecorator(handler, …)` with non-null handler). Run on HTTP and `.fn()` calls on either side of `@get`/`@post`/etc.: dispatcher calls latest wrapper, so one applied after HTTP decorator (written above it) still sees `req`. Order stays top-to-bottom. Convention: stack them **below** HTTP decorator.
- **Schema-only decorators** — `@operation`, anything written as `createDecorator(null, initHandler)`. Only mutate handler schema (OpenAPI, tool derivation, etc.), pass through at runtime. Placement doesn't change behavior; convention puts them **on top** (above `@get`) for readability — metadata reads naturally before HTTP verb line.

```ts
@operation({ summary: 'List users' })  // schema-only — on top, reads like a doc comment
@get('/users')                          // HTTP decorator
@authGuard()                            // wrapping — below @get by convention
static listUsers = procedure().handle(/* ... */);
```

## Local vs HTTP context

When procedure called via `.fn()` (SSR, server components, tests), `req.url` is `undefined`. Decorators run in both modes — detect + branch when logic depends on real HTTP:

```ts
const myDecorator = createDecorator((req, next) => {
  if (typeof req.url === 'undefined') {
    // Local context — no network, no real headers
  } else {
    // HTTP request
  }
  return next();
});
```

For headers/cookies, prefer imported `headers()` / `cookies()` from `next/headers` over `req.headers` / `req.cookies`. `next/headers` works over HTTP and under `.fn()` inside a Next.js request — no branch, no reliance on caller synthesizing `req`. Outside a request (unit test, script) it throws; mock it there:

```ts
import { createDecorator } from 'vovk';
import { headers } from 'next/headers';

const authGuard = createDecorator(async (req, next) => {
  const token = (await headers()).get('authorization');
  // ...
  return next();
});
```

A `req.headers` / `req.cookies` read works in HTTP mode only — under `.fn()` both are `undefined` (`.fn()` builds only `req.vovk`, and its options take no headers). `next/headers` sidesteps that.

## Flows

### "Protect an endpoint with bearer auth"

1. Define `type AuthMeta = { user: User }` in shared module.
2. Write `authGuard` reading `authorization`, validating, calling `req.vovk.meta<AuthMeta>({ user })`.
3. Stack at top (outermost): `@get('x') @authGuard() static ...`.
4. Read `req.vovk.meta<AuthMeta>()` inside handler — same alias.

### "Only admins can hit this route"

Stack `@authGuard() @roleGuard('admin')` — auth at top (runs first, sets `user`), role check below (runs second, reads `user`).

### "Log every request with timing"

Timing decorator wrapping `next()` — record start, await, record end. Apply to class via shared constant + `@` on every method, or lift to Next.js middleware if every route needs it.

### "Share state between two decorators"

Define shared type (`type SharedMeta = { user: User }`). Decorator 1: `req.vovk.meta<SharedMeta>({ user })`. Decorator 2: `const { user } = req.vovk.meta<SharedMeta>()`. Same alias both sides — `meta()` merges, TypeScript stays in sync.

### "Skip a decorator when called locally"

Branch on `typeof req.url === 'undefined'` inside decorator body, or don't stack the decorator on procedures called via `.fn()`.

**Safety caveat — only skip auth/authorization when caller already did equivalent check.** Server Component with authenticated session calling `.fn()` purely to fetch already-authorized data is legitimate skip. `.fn()` against unauthenticated context (cron jobs, background work, untrusted callers) still needs to authenticate — keep guard + ensure it can read headers (via `next/headers`, which needs a Next.js request: a cron route handler has one, a standalone script doesn't), or do equivalent explicit check before calling `.fn()`.

If you skip guard for one callsite, audit every other `.fn()` callsite for same procedure. Easy to add second call later that assumes "this procedure is protected" + quietly isn't. When in doubt, keep the guard: inside a Next.js request it reads the same headers over HTTP and under `.fn()`.

## Gotchas

- **Stacking order top-down.** Topmost wrapping decorator runs first pre-handler; innermost (closest to handler) runs last. Auth at top; authorization / role checks below; logging/tracing above everything to see whole timing.
- **`meta()` merges, doesn't replace.** Pass `null` to clear. Multiple decorators setting different keys all land in final object.
- **Client `x-meta` sandboxed.** Under `xMetaHeader` in `meta()` — server-trusted state stays safe. Don't collapse together.
- **Throw to short-circuit.** `throw new HttpException(...)` is standard control-flow for auth failures. Returning response works but unusual + easy to misread.
- **Local context has no `req.url`.** If decorator dereferences HTTP-specific fields, guard. `next/headers` works in both, inside a Next.js request; in a unit test, mock it.
- **Decorators on `.fn()` still run.** If you don't want auth in SSR, either don't stack decorator on that procedure or branch inside body. Controller-only procedures (no HTTP decorator) can still have custom decorators — run on every `.fn()` call.
- **Vitest on Vite 8 drops decorators on static fields** when `useDefineForClassFields` is off — the default for `target` below ES2022, e.g. create-next-app's ES2017. `.fn()` then runs without guards, and a test expecting success passes silently. Set `"useDefineForClassFields": true` (or `"target": "ES2022"`) in tsconfig.json.
- **CORS via `cors: true`** is coarse + needs segment's `route.ts` to export `OPTIONS` from `initSegment()` (`export const { GET, POST, ..., OPTIONS } = initSegment();`) — else Next.js answers the preflight itself (204 with `Allow`, no `Access-Control-*` headers), and the browser blocks the cross-origin call. For per-origin allowlists, skip option + use custom decorator or Next.js middleware.
- **`.auto()` names flow from method names.** Renaming method renames route — breaking change for consumers. Prefer explicit paths on public APIs.
