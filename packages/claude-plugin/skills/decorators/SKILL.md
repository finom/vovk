---
name: decorators
description: Vovk.ts decorators — built-in (`@prefix`, `@operation`, `@get/@post/@put/@patch/@del`, `.auto()`) and custom via `createDecorator`. Covers authorization / auth decorators, middleware-style wrapping (pre-handler + post-handler logic), `req.vovk.meta()` for cross-decorator state, stacking order, the `decorate()` alternative for projects without `experimentalDecorators`, and the local (`.fn()`) vs HTTP context distinction. Use whenever the user asks to "write a custom decorator", "add auth middleware", "protect an endpoint", "build an authorization decorator", "createDecorator", "use decorate without experimentalDecorators", "stack decorators", "share data between decorator and handler", "prefix all routes", "@auto", "decorator execution order". Does NOT cover procedure authoring → hand off to `procedure` skill. Does NOT cover `@operation` for OpenAPI beyond auth-related fields → hand off to `openapi` skill. Does NOT cover `@operation.x-tool` for tool derivation → hand off to `tools` skill.
---

# Vovk.ts decorators

Decorators wrap static methods on controllers. Three kinds:

- **HTTP decorators** (`@get`, `@post`, `@put`, `@patch`, `@del`) — mark a procedure as an HTTP route. See `procedure` skill.
- **Metadata decorators** (`@prefix`, `@operation`) — attach info without changing behavior.
- **Custom decorators** (`createDecorator`) — middleware-style logic wrapping the handler. This is how auth, logging, feature flags, and similar cross-cutting concerns attach to procedures.

Two syntaxes: standard `@decorator` form (requires `experimentalDecorators`) is the default — use it unless the user explicitly asks otherwise. `decorate(...)` is a function-form fallback that works without the TS flag; reach for it only on request.

## Scope

Covers:

- `@prefix` for route prefixes.
- `.auto()` for name-derived routes.
- HTTP decorator options (`headers`, `cors`).
- `createDecorator` — writing a decorator that runs before/after the handler.
- Auth decorator pattern with `req.vovk.meta()` state passing.
- Stacking order (top-down execution — outermost decorator runs first).
- `decorate()` alternative syntax.
- Local (`.fn()`) context detection inside a decorator.

Out of scope:

- Writing procedures + validation → **`procedure` skill**.
- `@operation` for OpenAPI docs → **`openapi` skill**.
- `@operation.tool` for AI tool derivation → **`tools` skill**.
- Next.js middleware (`middleware.ts`) — that's separate from Vovk decorators and runs earlier in the request lifecycle.

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

Root-level routes — either `@prefix('')` or omit `@prefix` entirely (same effect):

```ts
export default class RootController {
  @get()
  static ping = procedure().handle(() => ({ ok: true }));
}
// → GET /api
```

## `.auto()` — name-derived routes

Instead of spelling out the path, use the method name:

```ts
@put.auto()
static doSomething = procedure().handle(/* ... */);
// → PUT /api/<prefix>/do-something
```

Method names become kebab-case. Works with every HTTP decorator (`@get.auto()`, `@post.auto()`, etc.) and takes the same options.

## HTTP decorator options

Second arg takes response-header and CORS config:

```ts
@put('do-something', {
  headers: { 'x-hello': 'world' },
  cors: true,
})
static doSomething = procedure().handle(/* ... */);
```

- `headers` — merged into the response.
- `cors: true` — auto-generate permissive CORS (responds to `OPTIONS`, sets `Access-Control-*`). Requires `OPTIONS` in the segment's `initSegment()` destructured exports (`export const { GET, POST, ..., OPTIONS } = initSegment();`) — otherwise the preflight 405s. For finer control, use a custom decorator or Next.js middleware.

## Custom decorators — `createDecorator`

Middleware-shaped: receive the request + `next`, do work before and/or after, return the response.

```ts
import { createDecorator } from 'vovk';

const timingDecorator = createDecorator(async (req, next) => {
  const start = Date.now();
  const response = await next();
  console.log(`[${req.method}] ${req.url} — ${Date.now() - start}ms`);
  return response;
});
```

Apply above the HTTP decorator (stacking order below):

```ts
@get('{id}')
@timingDecorator()
static getUser = procedure({ /* ... */ }).handle(/* ... */);
```

### Auth decorator pattern

Gate access and pass user state down to the handler via `req.vovk.meta()`. **Always pass an explicit generic to every `meta()` call** — both set and read — and share a single type alias across every site that touches the auth metadata (decorator, handler, downstream decorators). `meta()`'s generic defaults to `Record<string, any>`, so an untyped call silently loses inference and lets the two sides drift apart.

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

Reading the token via `next/headers` — not `req.headers` — means this guard works identically whether the procedure is called over HTTP or through `.fn()` (SSR, server actions, tests). See the **Local vs HTTP context** section below for why.

Consume in the handler — same `AuthMeta`:

```ts
import { authGuard, type AuthMeta } from './auth';

@get('{id}')
@authGuard()
static getUser = procedure({ /* ... */ }).handle((req) => {
  const { user } = req.vovk.meta<AuthMeta>();
  // user is `User`, present and typed
});
```

**Throw, don't return**: throwing `HttpException` short-circuits the chain. If you `return` a response object, you bypass the handler silently — possible, but usually a bug magnet.

### Role / scope check

Decorators with arguments don't wrap `createDecorator` in an outer factory — `createDecorator`'s handler signature is `(req, next, ...args)`, so the arguments you pass at the call site (`@roleGuard('admin')`) flow straight through to the handler's trailing params. Declare the decorator once and reuse the same `AuthMeta`:

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

`TArgs` is inferred from the handler signature, so `@roleGuard('admin')` is type-checked against `'admin' | 'user'` at the call site.

`@authGuard()` is the **outermost** wrapping decorator (topmost in the source, after `@get`), so it runs first and populates `meta<AuthMeta>({ user })`. `@roleGuard('admin')` runs next, reads that same alias, and decides whether to throw. No need to guard `if (!user)` — auth threw `UNAUTHORIZED` otherwise. See the stacking-order section below for the rule.

## `req.vovk.meta()` — cross-decorator state

Key/value store on the request. The signature is `meta<T>(value?: T | null): T` with `T` defaulting to `Record<string, any>` — **always pass the generic** on both set and read so TypeScript checks the shape instead of silently falling through to `any`. For a concern used by more than one decorator (auth, tracing, feature flags), hoist the type to a shared module and import it everywhere:

```ts
type TraceMeta = { traceId: string };

req.vovk.meta<AuthMeta>({ user });                   // set, typed against shared alias
const { user } = req.vovk.meta<AuthMeta>();          // read, same alias
req.vovk.meta<TraceMeta>({ traceId: 'abc' });        // merge (keeps existing `user`)
req.vovk.meta(null);                                 // clear all (no generic needed)
```

Calls **merge** — consecutive `meta()` calls accumulate. This is how decorators pass state to each other and to the handler. Each `meta()` call only types the slice it touches; the merged object ends up carrying keys from every contributor.

### Client-supplied metadata (`x-meta`)

Clients can ship metadata via the `x-meta` header. That data lives under a separate key (`xMetaHeader`) in `meta()` — it does **not** overwrite server-set keys. Server-trusted state (e.g., the authenticated user) stays safe from client spoofing.

## Stacking order

Decorators execute **top-to-bottom** — the topmost wrapping decorator (furthest from the handler) runs first pre-handler. This is the opposite of TS's bottom-up *application* order: `@C` is applied first and ends up as the innermost wrapper, so at runtime it runs *last* pre-handler.

```ts
@get('/x')
@decoratorA()   // runs FIRST (outermost wrapper)
@decoratorB()   // runs second
@decoratorC()   // runs LAST pre-handler (innermost, closest to handler)
static handler = procedure().handle(/* ... */);
```

Pre-handler phase: A → B → C → handler. Post-handler phase (after `next()` resolves): handler → C → B → A.

This matters for auth: put the authentication decorator **at the top** (outermost) so it populates `meta()` before anything downstream reads it. Authorization / role checks stack just below — they see the user auth wrote.

### Wrapping decorators vs. schema-only decorators

Not every decorator uses `req`. The placement rule depends on what the decorator does:

- **Wrapping decorators** — anything that reads `req` / calls `next()` (auth, logging, timing, any `createDecorator(handler, …)` with a non-null handler). These need to be stacked **below `@get`/`@post`/etc.** in source order. The HTTP decorator registers the handler by capturing `controller[propertyKey]` at application time (TS bottom-up), so decorators below it are already baked into what gets registered. Decorators placed **above** `@get` are applied after the route is registered — their wrapping becomes dead code for HTTP calls, and they never see `req`.
- **Schema-only decorators** — `@operation`, anything written as `createDecorator(null, initHandler)`. These only mutate the handler schema (for OpenAPI, tool derivation, etc.) and pass through at runtime. Placement doesn't change behavior, but by convention put them **on top** (above `@get`) for readability — metadata about the route reads naturally before the HTTP verb line.

```ts
@operation({ summary: 'List users' })  // schema-only — on top, reads like a doc comment
@get('/users')                          // HTTP decorator
@authGuard()                            // wrapping — must be below @get
static listUsers = procedure().handle(/* ... */);
```

## `decorate()` — no `experimentalDecorators`

**Use only when the user explicitly asks** (or when something outside your control forbids the TS flag). The `@decorator` syntax is the default and what all other examples in this skill use. `decorate()` is a pure-function alternative with the same effect but no `experimentalDecorators`:

```ts
import { decorate, put, operation, procedure } from 'vovk';
import { z } from 'zod';

class UserController {
  static prefix = 'users';

  static updateUser = decorate(
    put('{id}'),
    operation({ summary: 'Update user' }),
    procedure({
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ email: z.string().email() }),
    }),
  ).handle(async (req, { id }) => {
    const { email } = await req.vovk.body();
    return UserService.update(id, { email });
  });
}
```

Order: arguments to `decorate()` execute top-to-bottom at runtime — first arg (`put('{id}')` here) is the outermost and runs first pre-handler; last arg is the innermost and runs last. Same rule as the `@` syntax, just written as a list.

`@prefix` has a `prefix` static property equivalent: `static prefix = 'users';`.

## Local vs HTTP context

When the procedure is called via `.fn()` (SSR, server components, tests), `req.url` is `undefined`. Decorators run in both modes — detect and branch when the logic depends on real HTTP:

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

For anything that reads headers or cookies, always prefer the imported `headers()` / `cookies()` from `next/headers` over `req.headers` / `req.cookies`. The `next/headers` functions work in both HTTP and `.fn()` contexts — no branch needed, no reliance on the caller synthesizing `req`:

```ts
import { headers } from 'next/headers';

const authGuard = createDecorator(async (req, next) => {
  const token = (await headers()).get('authorization');
  // ...
  return next();
});
```

`req.headers` / `req.cookies` still work in HTTP mode, but they're populated only from the real request — under `.fn()`, the caller has to supply them. Going through `next/headers` sidesteps that entirely.

## Flows

### "Protect an endpoint with bearer auth"

1. Define `type AuthMeta = { user: User }` in a shared module.
2. Write `authGuard` that reads `authorization`, validates, and calls `req.vovk.meta<AuthMeta>({ user })`.
3. Stack it at the top (outermost): `@get('x') @authGuard() static ...`.
4. Read `req.vovk.meta<AuthMeta>()` inside the handler — same alias.

### "Only admins can hit this route"

Stack `@authGuard() @roleGuard('admin')` — auth at the top (runs first, sets `user`), role check below it (runs second, reads `user`).

### "Log every request with timing"

Timing decorator wrapping `next()` — record start, await, record end. Apply to the class via a shared constant and `@` on every method, or lift to a Next.js middleware if every route in the app needs it.

### "Use Vovk without `experimentalDecorators`"

Use `decorate(put('x'), procedure({ ... }))` for every route. Use `static prefix = '...'` instead of `@prefix`.

### "Share state between two decorators"

Define a shared type (`type SharedMeta = { user: User }`). Decorator 1: `req.vovk.meta<SharedMeta>({ user })`. Decorator 2: `const { user } = req.vovk.meta<SharedMeta>()`. Same alias on both sides — `meta()` merges, TypeScript keeps them in sync.

### "Skip a decorator when called locally"

Branch on `typeof req.url === 'undefined'` inside the decorator body, or simply don't stack the decorator on procedures you intend to call via `.fn()`.

**Safety caveat — only skip auth/authorization when the caller has already performed an equivalent check.** A Server Component that has authenticated the session and is calling `.fn()` purely to fetch already-authorized data is a legitimate skip. A `.fn()` invocation that runs against an unauthenticated context (cron jobs, background work, untrusted callers) still needs to authenticate — either keep the guard in place and ensure it can read headers (via `next/headers`, which works locally on the server), or perform an equivalent explicit check before calling `.fn()`.

If you skip the guard for one callsite, audit every other `.fn()` callsite for the same procedure. It's easy to add a second call later that assumes "this procedure is protected" and quietly isn't. When in doubt, keep the guard and let it run in both contexts — `next/headers` makes this a no-op for a well-written guard.

## Gotchas

- **Stacking order is top-down.** Topmost wrapping decorator runs first pre-handler; innermost (closest to the handler) runs last. Put auth at the top; stack authorization / role checks below it; wrap logging/tracing above everything if you want them to see the whole timing.
- **`meta()` merges, doesn't replace.** Pass `null` to clear. Multiple decorators setting different keys all land in the final object.
- **Client `x-meta` is sandboxed.** It's under `xMetaHeader` in `meta()` — server-trusted state stays safe. Don't collapse them together.
- **Throw to short-circuit.** `throw new HttpException(...)` is the standard control-flow for auth failures. Returning a response works but is unusual and easy to misread.
- **`experimentalDecorators` vs `decorate()`**: default to the `@decorator` syntax with `experimentalDecorators` enabled — every example in this skill (and in Vovk's own docs) uses it. Only reach for `decorate()` when the user explicitly asks, or when something outside your control forbids the TS flag. Mixing both in one project is legal but confusing; pick one.
- **Local context has no `req.url`.** If your decorator dereferences HTTP-specific fields, guard it. `next/headers` works in both contexts for header/cookie access.
- **Decorators on `.fn()` still run.** If you don't want auth applied in SSR, either don't stack the decorator on that procedure or branch inside the decorator body. Controller-only procedures (no HTTP decorator) can still have custom decorators — they'll run on every `.fn()` call.
- **CORS via `cors: true`** is coarse and requires the segment's `route.ts` to export `OPTIONS` from `initSegment()` (`export const { GET, POST, ..., OPTIONS } = initSegment();`) — otherwise the preflight 405s. For per-origin allowlists, skip the option and use a custom decorator or Next.js middleware.
- **`.auto()` names flow from method names.** Renaming a method renames the route — breaking change for consumers. Prefer explicit paths on public APIs.
