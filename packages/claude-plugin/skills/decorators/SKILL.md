---
name: decorators
description: Knowledge base for Vovk.ts decorators — built-in (`@prefix`, `@operation`, `@get/@post/@put/@patch/@del`, `.auto()`) and custom via `createDecorator`. Covers authorization / auth decorators, middleware-style wrapping (pre-handler + post-handler logic), `req.vovk.meta()` for cross-decorator state, stacking order, the `decorate()` alternative for projects without `experimentalDecorators`, and the local (`.fn()`) vs HTTP context distinction. Use whenever the user asks to "write a custom decorator", "add auth middleware", "protect an endpoint", "build an authorization decorator", "createDecorator", "use decorate without experimentalDecorators", "stack decorators", "share data between decorator and handler", "prefix all routes", "@auto", "decorator execution order". Does NOT cover procedure authoring → hand off to `procedure` skill. Does NOT cover `@operation` for OpenAPI beyond auth-related fields → hand off to `openapi` skill. Does NOT cover `@operation.x-tool` for tool derivation → hand off to `tools` skill.
---

# Vovk.ts decorators

Decorators wrap static methods on controllers. Three kinds:

- **HTTP decorators** (`@get`, `@post`, `@put`, `@patch`, `@del`) — mark a procedure as an HTTP route. See `procedure` skill.
- **Metadata decorators** (`@prefix`, `@operation`) — attach info without changing behavior.
- **Custom decorators** (`createDecorator`) — middleware-style logic wrapping the handler. This is how auth, logging, feature flags, and similar cross-cutting concerns attach to procedures.

Two syntaxes: standard `@decorator` form (requires `experimentalDecorators`) or `decorate(...)` function form (works without it).

## Scope

Covers:

- `@prefix` for route prefixes.
- `.auto()` for name-derived routes.
- HTTP decorator options (`headers`, `cors`).
- `createDecorator` — writing a decorator that runs before/after the handler.
- Auth decorator pattern with `req.vovk.meta()` state passing.
- Stacking order (bottom-up execution).
- `decorate()` alternative syntax.
- Local (`.fn()`) context detection inside a decorator.

Out of scope:

- Writing procedures + validation → **`procedure` skill**.
- `@operation` for OpenAPI docs → **`openapi` skill**.
- `@operation.x-tool` for AI tool derivation → **`tools` skill**.
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

Empty prefix for root-level routes:

```ts
@prefix('')
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
static async doSomething = procedure().handle(/* ... */);
```

- `headers` — merged into the response.
- `cors: true` — auto-generate permissive CORS (respond to `OPTIONS`, set `Access-Control-*`). For finer control, use a custom decorator or Next.js middleware.

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

Gate access and pass user state down to the handler via `req.vovk.meta()`:

```ts
import { createDecorator, HttpException, HttpStatus } from 'vovk';

const authDecorator = createDecorator(async (req, next) => {
  const token = req.headers.get('authorization');
  if (!token) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Missing token');
  }
  const user = await parseToken(token); // your auth logic
  req.vovk.meta({ user });
  return next();
});
```

Consume in the handler:

```ts
@get('{id}')
@authDecorator()
static getUser = procedure({ /* ... */ }).handle((req) => {
  const { user } = req.vovk.meta<{ user: User }>();
  // ... user is typed + present
});
```

**Throw, don't return**: throwing `HttpException` short-circuits the chain. If you `return` a response object, you bypass the handler silently — possible, but usually a bug magnet.

### Role / scope check

Factory-style decorator accepting args:

```ts
const requireRole = (role: 'admin' | 'user') =>
  createDecorator(async (req, next) => {
    const { user } = req.vovk.meta<{ user?: User }>();
    if (!user) throw new HttpException(HttpStatus.UNAUTHORIZED, 'No user');
    if (user.role !== role) {
      throw new HttpException(HttpStatus.FORBIDDEN, 'Insufficient role');
    }
    return next();
  });

@get('admin-only')
@authDecorator()
@requireRole('admin')
static adminOnly = procedure().handle(/* ... */);
```

Stacking below: `authDecorator` fires first (closest to handler is actually *last* applied and *first* to run — see ordering).

## `req.vovk.meta()` — cross-decorator state

Key/value store on the request, typed by caller:

```ts
req.vovk.meta({ user });                        // set
const { user } = req.vovk.meta<{ user: User }>(); // read (typed)
req.vovk.meta({ traceId: 'abc' });              // merge (keeps existing `user`)
req.vovk.meta(null);                            // clear all
```

Calls **merge** — consecutive `meta()` calls accumulate. This is how decorators pass state to each other and to the handler.

### Client-supplied metadata (`x-meta`)

Clients can ship metadata via the `x-meta` header. That data lives under a separate key (`xMetaHeader`) in `meta()` — it does **not** overwrite server-set keys. Server-trusted state (e.g., the authenticated user) stays safe from client spoofing.

## Stacking order

Decorators execute bottom-to-top (closest to the handler runs first):

```ts
@get('/x')
@decoratorA()   // runs LAST (outermost wrapper)
@decoratorB()   // runs second
@decoratorC()   // runs FIRST (closest to handler)
static handler = procedure().handle(/* ... */);
```

Pre-handler phase: C → B → A → handler. Post-handler phase (after `next()` resolves): handler → C → B → A.

This matters for auth: put the authentication decorator **closest to the handler** so its `meta()` changes are visible to outer decorators (logging, tracing), and stack authorization checks outside it.

## `decorate()` — no `experimentalDecorators`

Pure-function alternative. Same effect, no TS config flag:

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

Order: last arg to `decorate()` is applied first (i.e., closest to the handler) — mirrors the `@` stacking rules.

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

For auth decorators: reading `req.headers.get('authorization')` works locally only if the caller synthesizes headers. Prefer reading Next.js `headers()` / `cookies()` from `next/headers` in local mode:

```ts
import { headers, cookies } from 'next/headers';

const authDecorator = createDecorator(async (req, next) => {
  const token = typeof req.url === 'undefined'
    ? (await headers()).get('authorization')
    : req.headers.get('authorization');
  // ...
  return next();
});
```

## Flows

### "Protect an endpoint with bearer auth"

1. Write `authDecorator` that reads `authorization`, validates, sets `req.vovk.meta({ user })`.
2. Stack it on the route: `@get('x') @authDecorator() static ...`.
3. Read `req.vovk.meta<{ user: User }>()` inside the handler.

### "Only admins can hit this route"

Stack `@authDecorator() @requireRole('admin')` — auth first (closest to handler), role check outside.

### "Log every request with timing"

Timing decorator wrapping `next()` — record start, await, record end. Apply to the class via a shared constant and `@` on every method, or lift to a Next.js middleware if every route in the app needs it.

### "Use Vovk without `experimentalDecorators`"

Use `decorate(put('x'), procedure({ ... }))` for every route. Use `static prefix = '...'` instead of `@prefix`.

### "Share state between two decorators"

Decorator 1: `req.vovk.meta({ user })`. Decorator 2: `const { user } = req.vovk.meta<{ user: User }>()`. Works because `meta()` merges.

### "Skip a decorator when called locally"

Branch on `typeof req.url === 'undefined'` inside the decorator body, or simply don't stack the decorator on procedures you intend to call via `.fn()` — keep HTTP-only concerns (auth, rate limiting) out of the procedure itself and enforce them at the route layer.

## Gotchas

- **Stacking order is bottom-up.** Decorators nearest the handler run first. Put auth *close* to the handler; wrap logging/tracing *outside*.
- **`meta()` merges, doesn't replace.** Pass `null` to clear. Multiple decorators setting different keys all land in the final object.
- **Client `x-meta` is sandboxed.** It's under `xMetaHeader` in `meta()` — server-trusted state stays safe. Don't collapse them together.
- **Throw to short-circuit.** `throw new HttpException(...)` is the standard control-flow for auth failures. Returning a response works but is unusual and easy to misread.
- **`experimentalDecorators` vs `decorate()`**: pick one per project. Mixing is legal but confusing. New Next.js projects often want `decorate()` (no TS config tweak needed).
- **Local context has no `req.url`.** If your decorator dereferences HTTP-specific fields, guard it. `next/headers` works in both contexts for header/cookie access.
- **Decorators on `.fn()` still run.** If you don't want auth applied in SSR, either don't stack the decorator on that procedure or branch inside the decorator body. Controller-only procedures (no HTTP decorator) can still have custom decorators — they'll run on every `.fn()` call.
- **CORS via `cors: true`** is coarse. For per-origin allowlists, skip the option and use a custom decorator or Next.js middleware.
- **`.auto()` names flow from method names.** Renaming a method renames the route — breaking change for consumers. Prefer explicit paths on public APIs.
