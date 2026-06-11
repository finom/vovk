---
name: procedure
description: Vovk.ts procedures — atomic unit of server-side logic in Vovk project. Use whenever user asks to build ANYTHING producing or consuming data on server — page loading data ("users page", "dashboard", "product list"), endpoint, API handler, server action, form submission, controller, validation with Zod / Valibot / ArkType, request/response shape, file upload, file download, error handling (`HttpException`, status codes), content types (JSON, multipart, text, binary), or calling server code from React Server Component / SSR / SSG / PPR / server action. Triggers on phrasings like "build a users page", "add an endpoint", "create a form handler", "fetch X from the server", "handle file upload", "validate input", "throw a 404", "server action for Y", "controller for Z", "add `req.body` parsing", ".fn()", "CORS". Does NOT cover segments / `route.ts` / `initSegment` → hand off to `segment` skill. Does NOT cover RPC client generation, fetcher, `vovk-client` imports → hand off to `rpc` skill. Does NOT cover custom decorators, `createDecorator`, authorization / auth guards → hand off to `decorators` skill. Does NOT cover `deriveTools` / `createTool` / MCP / AI tool wiring → hand off to `tools` skill. Does NOT cover JSON Lines streaming / generators / `JSONLinesResponder` → hand off to `jsonlines` skill. Does NOT cover `@operation` metadata / Scalar docs → hand off to `openapi` skill.
---

# Vovk.ts procedures

**Procedure** = typed, validated server-logic unit. Built with `procedure({ ... }).handle(...)`. Atom of every Vovk app.

**Mental model:**

- **Procedure valuable alone.** Typed server function — call via `.fn()` from RSC, server actions, SSR/SSG/PPR, any server code. No HTTP.
- **HTTP decorator (`@get`, `@post`, `@put`, `@patch`, `@del`) OPTIONAL.** Add only when exposing procedure as HTTP endpoint (also makes callable via generated RPC client from browser).

Opposite of most frameworks: procedures first, HTTP opt-in.

## Scope

Covers procedure authoring end-to-end: `procedure({...}).handle(...)` options, validation with Zod/Valibot/ArkType (+ `vovk-ajv` client-side), controller classes and HTTP decorators (`@prefix`, `@get/@post/@put/@patch/@del`, `.auto()`), `req.vovk` + `VovkRequest`, error handling (`HttpException` / `HttpStatus`), content types (JSON, multipart, URL-encoded, text, binary, downloads), response headers + CORS, `.fn()` for server components / SSR / server actions, `decorate()`, `vovk new controller service` CLI.

Out of scope (→ skill): segment setup / `initSegment` / `route.ts` → `segment`. RPC client generation / `vovk-client` → `rpc`. Custom decorators / `createDecorator` / auth guards → `decorators`. AI tools (`deriveTools`, `createTool`) → `tools`. Generator handlers / streaming → `jsonlines`. `@operation` / Scalar docs → `openapi`. Inference helpers against RPC modules → `rpc`.

## Procedure, minimally

```ts
import { procedure } from 'vovk';
import { z } from 'zod';

class UserController {
  static getUser = procedure({
    params: z.object({ id: z.string().uuid() }),
    output: z.object({ id: z.string(), email: z.email() }),
  }).handle(async (_req, { id }) => {
    return UserService.byId(id); // plain call
  });
}
```

**What you have:**

- Typed, validated procedure.
- Callable from ANY server code via `UserController.getUser.fn({ params: { id: '…' } })`.
- **Not** HTTP endpoint. Not in generated RPC client.

Expose over HTTP — add HTTP decorator:

```ts
import { get, prefix, procedure } from 'vovk';

@prefix('users')
export default class UserController {
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.string().uuid() }),
    output: z.object({ id: z.string(), email: z.email() }),
  }).handle(async (_req, { id }) => {
    return UserService.byId(id);
  });
}
```

Now also `GET /api/users/{id}` and available as `UserRPC.getUser(...)` on client.

## Deciding: decorator or no?

**When user says...**

| User intent | What to build |
|---|---|
| "Build users page" / "load X on server" / "dashboard showing Y" | Procedure, no decorator. Call via `.fn()` from server component. |
| "Server action for form submit" | Procedure, no decorator. Call via `.fn()` inside `'use server'` function. |
| "Add `/api/users` endpoint" / "expose X as API" / "browser needs to call it" | Procedure + HTTP decorator. |
| "Users page AND also API" | Procedure + HTTP decorator. Call `.fn()` from server component; RPC client covers browser path. |
| "Internal helper used only from other procedures" | Plain service function, not procedure. Use `procedure` only when you want validation/types as contract. |

**Default:** when in doubt, start without HTTP decorator. Adding later = one-line change. Exposing too eagerly and retracting is harder.

## Controller / procedure / service — split of responsibilities

- **Services** = **always** business-logic module — data access, domain rules, calls to other services. Not optional "once logic gets big enough"; domain logic lives there from line one.
- **Procedures** do only *thin pre-calculation*: pull validated body/query/params from `req.vovk`, read actor info from `req.vovk.meta()` / `next/headers`, delegate to service, return its result.
- **Services must never touch `req` / `VovkRequest`.** Take plain typed args — ideally via `VovkBody` / `VovkParams` / `VovkOutput` (see "Type inference").

```ts
static updateUser = procedure({
  body: z.object({ email: z.email() }),
  params: z.object({ id: z.uuid() }),
}).handle(async ({ vovk }, params) => {
  const body = await vovk.body();
  const { userId } = vovk.meta<SessionMeta>();      // e.g. from an auth decorator
  return UserService.updateUser({ body, params, actorId: userId });
});
```

Service taking `VovkRequest` — or branching on request shape — = layering leak. Services must be callable from cron jobs, CLI scripts, migrations, sibling procedures; if any path needs fake request, logic in wrong file.

## Scaffolding via CLI

```bash
npx vovk new controller service <name>   # shortcut: npx vovk n c s <name>
```

`<name>` = `[segmentPath/]moduleName`, combines two conventions:

- **`moduleName`** (after last `/`) **must be camelCase**. Normalize user input: `USER` → `user`, `user-profile` → `userProfile`, `MyUser` → `myUser`. Example: "User-Profile in Admin segment" → `admin/userProfile`.
- **`segmentPath`** (before last `/`) = **existing** segment path — URL slug, kebab-case, slash-separated for nested (`admin`, `foo/bar`). Not camelCase. See `segment` skill.

Flags: `--empty` (no CRUD boilerplate), `--overwrite`, `--no-segment-update` (skip `route.ts` edit, rare), `--dry-run`.

Creates `src/modules/<name>/<name>-controller.ts` + `<name>-service.ts`, registers controller in segment's `controllers` map. Scaffold ships with CRUD placeholders — **overwrite in place** when writing real logic; don't leave dummies next to real code. Fails if no segment exists — create one first (`segment` skill).

## `procedure()` options — full reference

```ts
procedure({
  // Input validation (all optional):
  params: ZodSchema,    // Route parameters
  body:   ZodSchema,    // Request body (shape depends on contentType)
  query:  ZodSchema,    // Query string

  // Output validation (optional):
  output:    ZodSchema, // Single JSON response
  iteration: ZodSchema, // Per-item schema for JSON Lines streams (see jsonlines skill)

  // Content-type control:
  contentType: 'application/json' | 'multipart/form-data' |
               'application/x-www-form-urlencoded' | 'text/*' |
               'image/*' | 'video/*' | '*/*' | string | string[],

  // Per-field toggles:
  disableServerSideValidation: true | ['body', 'query', 'params', 'output', 'iteration'],
  skipSchemaEmission:          true | ['body', 'query', 'params', 'output', 'iteration'],
  validateEachIteration:       true, // validate every yielded item, not just the first

  // Metadata (also settable via @operation — see openapi skill):
  operation: { summary: string, description?: string, tags?: string[], ... },

  // Return the parsed/transformed result (default: true):
  preferTransformed: true,
}).handle(async (req, params) => { ... });
```

Works with any library emitting **Standard JSON Schema** — Zod v4+ and ArkType pass through directly; Valibot needs `toStandardJsonSchema()` from `@valibot/to-json-schema`. See "Validation — Standard Schema" below for exact patterns.

## `req` argument & `req.vovk`

First arg to `.handle((req, params) => …)` = **`VovkRequest`** — `NextRequest` patched with typed `vovk` property. All usual Next.js request APIs work (`req.json()`, `req.formData()`, `req.headers`, `req.nextUrl`, …). Two conventions matter:

**Prefer `next/headers` over `req.headers` / `req.cookies`.** Works identically in procedures, server components, server actions, middleware; `req.headers` only works in HTTP path.

**Prefer `req.vovk` over `req.json()` / `req.nextUrl.searchParams`** for body/query/params. `req.json()` and `req.nextUrl.searchParams` typed (`VovkRequest` infers from schemas), but `undefined` under `.fn()` — handlers using them can't be called locally. `req.vovk` works both contexts.

```ts
static createUser = procedure({
  body: z.object({ email: z.email() }),
  query: z.object({ notify: z.enum(['email', 'push', 'none']) }),
}).handle(async ({ vovk }, params) => {
  const { email } = await vovk.body();   // typed body (async)
  const { notify } = vovk.query();       // typed query (sync)
  const p = vovk.params();               // typed params (sync) — also the 2nd arg
});
```

Destructuring `{ vovk }` = stylistic signal handler is LPC-safe; `async (req) => req.vovk.body()` equivalent. Reach for raw `req.*` only when `vovk` doesn't expose what you need — guard those handlers from `.fn()` (check `typeof req.url === 'undefined'`).

**Meta** — per-request key-value storage shared between decorators and handlers. Pass generic on both set and read; share one type alias so TypeScript stays honest:

```ts
type SessionMeta = { userId: string };
req.vovk.meta<SessionMeta>({ userId: '123' });       // set
const { userId } = req.vovk.meta<SessionMeta>();     // read
req.vovk.meta(null);                                 // clear
```

Multiple `meta()` calls merge. Clients can send meta via `x-meta` header → lands under `xMetaHeader` so can't overwrite server-set keys — full auth pattern in `decorators` skill.

**`VovkRequest` without `procedure()`** (rare): `req: VovkRequest<TBody, TQuery, TParams>` types `req.json()` / `searchParams` manually, but loses validation and `.fn()`. Almost always reach for `procedure()`.

## HTTP decorators

```ts
import { get, post, put, patch, del, prefix } from 'vovk';

@prefix('users')
export default class UserController {
  @get()                          // GET  /api/users
  static list = procedure(...).handle(...);

  @get('{id}')                    // GET  /api/users/{id}
  static getOne = procedure(...).handle(...);

  @post()                         // POST /api/users
  static create = procedure(...).handle(...);

  @put('{id}', {                  // PUT  /api/users/{id} with headers/CORS
    headers: { 'x-custom': 'yes' },
    cors: true,
  })
  static update = procedure(...).handle(...);

  @del('{id}')                    // DELETE /api/users/{id}
  static remove = procedure(...).handle(...);

  @put.auto()                     // PUT /api/users/do-thing (from method name)
  static doThing = procedure(...).handle(...);
}
```

**Decorator options:**

| Option | Purpose |
|---|---|
| `headers` | Static response headers. |
| `cors: true` | Enable CORS preflight. |
| `staticParams` | For static segments — enumerate URL params (`@get` only). See `segment` skill. |

Path template uses `{name}` for segments: `'{id}'`, `'{org}/members/{userId}'`.

### URL shape — composition rule

Route string framework builds:

```
/{rootEntry}/{segmentName}/{controllerPrefix}/{methodPath}
```

Empty parts dropped, joined with `/` (verified in `packages/vovk/src/openapi/vovk-schema-to-openapi.ts:162`). So:

| `rootEntry` | segment | `@prefix` | method | URL |
|---|---|---|---|---|
| `'api'` *(default)* | `''` (root) | `'users'` | `@get('{id}')` | `GET /api/users/{id}` |
| `'api'` | `'admin'` | `'users'` | `@get('{id}')` | `GET /api/admin/users/{id}` |
| `'api'` | `'foo/bar'` | — | `@get('ping')` | `GET /api/foo/bar/ping` |
| `'api'` | `'admin'` | — | `@put.auto()` (method `archive`) | `PUT /api/admin/archive` |
| `''` (root-mounted API) | `'admin'` | `'users'` | `@get()` | `GET /admin/users` |

`@prefix` per-controller, `methodPath` per-handler, both optional. `.auto()` derives method-name segment kebab-cased. Nested segment names (`foo/bar`) collapse straight into URL.

These URLs = plain HTTP — `curl`, `httpx`, `fetch`, any client works. Typed RPC clients (`vovk-client`, `vovk-python`, `vovk-rust`) wrap same endpoints with validation + inferred types; conveniences, not only access path. If user wants to hit `/api/users/123` from CLI, `curl` is right answer.

## `.fn()` — local procedure calls (SSR / server components / server actions)

Every procedure exposes `.fn()` → invokes handler without HTTP.

```tsx
// Server component — no 'use client'
import UserController from '@/modules/user/user-controller';

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await UserController.getUser.fn({ params });
  return <p>{user.email}</p>;
}
```

```tsx
// Server action with a FormData body
async function createUser(body: FormData) {
  'use server';
  await UserController.createUser.fn({ body });
}
```

### Server actions with `useActionState`

Wrap `.fn()` in try/catch, return discriminated union so client can `'data' in result` / `'error' in result`:

```ts
// actions.ts
'use server';
export async function submitUserAction(_prev: unknown, formData: FormData) {
  try {
    return { data: await UserController.createUser.fn({ body: formData, params: { id: '…' } }) };
  } catch (e) {
    return { error: String(e) };
  }
}
```

```tsx
// UserForm.tsx — 'use client'
const [result, formAction, isPending] = useActionState(submitUserAction, null);
// <form action={formAction}>…</form>  — result narrows via 'data' / 'error' in result
```

Things to know:

- **`contentType: 'multipart/form-data'` (or `'application/x-www-form-urlencoded'`) → `.fn()` auto-parses `FormData`.** Pass straight through as `body`, no `Object.fromEntries`.
- **`useActionState` signature = `(prevState, formData) => nextState`** — action takes `_prev` first arg, usually ignored.
- **Validation still runs** — bad field throws, `catch (e)` surfaces as `{ error }`. `isPending` handles loading UI free.

### `.fn()` rules

1. **No full `Request` object under `.fn()`.** `req.url`, `req.headers`, `req.json()`, `req.nextUrl`, `req.cookies`, etc. all `undefined` — `.fn()` synthesizes only `vovk` facet. Why rule in "The `req` argument" above matters: handlers destructuring `{ vovk }` and reading data through `req.vovk` (plus `next/headers` for headers/cookies) are portable between HTTP and `.fn()`; handlers calling `req.json()` or touching `req.nextUrl` not.

2. **Validation runs by default** (same schemas as HTTP path). Pass `disableClientValidation: true` to skip — use sparingly; trusted server input still input.

3. **Detect local context** in custom decorators via `typeof req.url === 'undefined'`.

4. **`meta` works** — pass `meta: { ... }` to `.fn()` → populates `req.vovk.meta()` inside handler:

   ```ts
   await UserController.getUser.fn({ params: { id: '…' }, meta: { userId: 'abc' } });
   ```

5. **`.fn()` returns handler's return value directly** — no JSON serialization, no network hop.

## Testing

Unit-test procedures with `.fn()` — same call shape as SSR/server-action examples above (`UserController.getUser.fn({ params, body, query, meta })`), no HTTP server needed. Validation runs by default; pass `disableClientValidation: true` to bypass when isolating handler logic. For HTTP-level coverage (routing, decorators, status codes, content negotiation, generated client itself), call procedures through `vovk-client` against running dev server with `apiRoot: 'http://localhost:<port>/api'` → **`rpc`** skill for call shape. Mocking I/O / databases = project-specific — match repo conventions.

## Validation — Standard Schema

Works with any lib emitting **Standard JSON Schema** (Vovk needs JSON Schema — not just Standard Schema — for OpenAPI, codegen, client-side validation). Zod (v4+) + ArkType produce natively. Valibot needs one conversion step. Zod = default after `vovk init` with default flags.

```ts
// Zod — passes through directly
body: z.object({ email: z.email(), age: z.number().int().min(0) })

// Valibot — wrap with toStandardJsonSchema() from @valibot/to-json-schema
import * as v from 'valibot';
import { toStandardJsonSchema } from '@valibot/to-json-schema';

body: toStandardJsonSchema(
  v.object({
    email: v.pipe(v.string(), v.email()),
    age: v.pipe(v.number(), v.integer()),
  }),
)

// ArkType — passes through directly
import { type } from 'arktype';
body: type({ email: 'string.email', age: 'number.integer>=0' })
```

**Valibot gotcha**: every Valibot schema handed to `procedure({...})` must be wrapped with `toStandardJsonSchema(...)`. Unwrapped Valibot passes Standard Schema runtime checks but fails codegen / OpenAPI — doesn't expose JSON Schema. If picked Valibot via `vovk init`, generated templates already wrap — follow that pattern.

**Client-side validation** — install `vovk-ajv` (or roll your own via `createValidateOnClient`; see `rpc` skill), set `outputConfig.imports.validateOnClient: 'vovk-ajv'` in `vovk.config.mjs`. RPC client validates before sending; opt out per call with `disableClientValidation: true`.

**Per-procedure disables** — `disableServerSideValidation: true | ['body'|'query'|...]` skips server validation; `skipSchemaEmission` keeps field out of generated schema. Use sparingly — silent validation disappearance = nasty bug source.

## Content types

Default = `application/json`. Override via `contentType`:

| `contentType` | `req.vovk.body()` returns | Client may send |
|---|---|---|
| `application/json` | Parsed object typed to schema. | Schema-typed value or `Blob`. |
| `multipart/form-data` | Parsed object with `File` fields for file inputs. | Schema-typed value, `FormData`, or `Blob`. |
| `application/x-www-form-urlencoded` | Parsed object. | Schema-typed value, `URLSearchParams`, `FormData`, or `Blob`. |
| `text/*` | `string`. | `string` or `Blob`. |
| `image/*`, `video/*`, binary | `File`. | `File`, `ArrayBuffer`, `Uint8Array`, `Blob`. |
| `*/*` | Same as binary. | Any of above. |

Wildcards allowed. Requests without matching `Content-Type` header → **415 Unsupported Media Type**.

### File upload (multipart)

```ts
@post('avatar')
static uploadAvatar = procedure({
  contentType: 'multipart/form-data',
  body: z.object({ file: z.instanceof(File) }),
}).handle(async ({ vovk }) => {
  const { file } = await vovk.body();
  const { userId } = vovk.meta<SessionMeta>();   // actor from auth decorator, not the body
  return FileService.uploadAvatar({ userId, file });
});
```

### File download

```ts
import { toDownloadResponse } from 'vovk';

@get('export.csv')
static exportCsv = procedure().handle(async () => {
  const csv = await generateCsv();
  return toDownloadResponse(csv, {
    filename: 'report.csv',
    type: 'text/csv',
    headers: { 'x-custom': 'yes' },
  });
});
```

Accepts `Blob | File | ArrayBuffer | Uint8Array | ReadableStream<Uint8Array> | string`.

## Error handling

Throw `HttpException` for controlled failures:

```ts
import { HttpException, HttpStatus } from 'vovk';

static getUser = procedure({ /* ... */ }).handle(async (_req, { id }) => {
  const user = await UserService.byId(id);
  if (!user) {
    throw new HttpException(HttpStatus.NOT_FOUND, 'User not found', { id });
  }
  return user;
});
```

- Bare `Error` instances → HTTP 500, message stripped in production.
- On RPC client, `HttpException` re-thrown with same status/message/cause — `try/catch` works identically both sides.

Common statuses from `HttpStatus`: `OK` (200), `CREATED` (201), `NO_CONTENT` (204), `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `UNPROCESSABLE_ENTITY` (422), `INTERNAL_SERVER_ERROR` (500).

## Response headers (dynamic)

Static headers go on decorator (`@get('x', { headers: {...} })`). For dynamic:

```ts
import { NextResponse } from 'next/server';

@get('hello')
static hello = procedure().handle(async () => {
  return NextResponse.json({ hello: 'world' }, {
    headers: { 'x-request-id': crypto.randomUUID() },
  });
});
```

## Custom decorators

For auth, logging, rate-limits, other cross-cutting concerns → **`decorators` skill** (`createDecorator`, stacking, `.fn()` detection, auth patterns).

## `decorate()` — non-decorator syntax

For projects without `experimentalDecorators`:

```ts
import { decorate, get, procedure, operation } from 'vovk';

class UserController {
  static prefix = 'users';

  static getUser = decorate(
    get('{id}'),
    operation({ summary: 'Get a user' }),
    procedure({
      params: z.object({ id: z.string().uuid() }),
    }),
  ).handle(async (_req, { id }) => {
    return UserService.byId(id);
  });
}
```

Decorators apply in order — **last listed applied first**. `procedure()` typically goes last (applied first, closest to handler).

## Type inference

Helpers exported from `vovk`:

```ts
import type {
  VovkBody,
  VovkQuery,
  VovkParams,
  VovkInput,        // { params, query, body }
  VovkOutput,
  VovkIteration,    // per-chunk type for JSON Lines streams (see `jsonlines` skill)
  VovkYieldType,    // actual yielded type even when input isn't validated
  VovkReturnType,   // actual return type even when input isn't validated
} from 'vovk';
import UserController from './user-controller';

type Body   = VovkBody<typeof UserController.updateUser>;
type Query  = VovkQuery<typeof UserController.updateUser>;
type Params = VovkParams<typeof UserController.updateUser>;
type In     = VovkInput<typeof UserController.updateUser>;
type Out    = VovkOutput<typeof UserController.updateUser>;
```

All work identically against controller methods, RPC modules, imported mixin modules. `VovkYieldType` / `VovkReturnType` exist for cases where validation hasn't been declared on method (can't be used for self-references in services without triggering "implicit any" TypeScript errors).

Most common use: type service's inputs against controller's procedure → schema = single source of truth: controller declares, service consumes, client infers via RPC module.

```ts
export default class UserService {
  static async updateUser(
    body: VovkBody<typeof UserController.updateUser>,
    params: VovkParams<typeof UserController.updateUser>,
  ): Promise<VovkOutput<typeof UserController.updateUser>> { … }
}
```

For client-side usage (against `UserRPC.updateUser`) helpers behave same → **`rpc` skill**.

## Flows

**"Build users page showing user list on server"** — procedure **without** HTTP decorator, called via `.fn()` from server component:

```ts
class UserController {
  static list = procedure({ output: z.array(UserSchema) }).handle(() => UserService.listAll());
}
```
```tsx
export default async function UsersPage() {
  const users = await UserController.list.fn({});
  return <ul>{users.map(u => <li key={u.id}>{u.email}</li>)}</ul>;
}
```
HTML ships with data inline; browser never talks to server.

**"Now also expose `/api/users` for mobile app"** — add `@get()` to same procedure. `UserRPC.list()` appears on client; server component unchanged.

**"Add form on page to create user"** — add second procedure (no decorator needed), wire server action calling `.fn({ body })`. For loading/error UX, use `useActionState` pattern above.

**"Protect `/api/admin/users` with auth"** → **`decorators` skill** (auth guards = custom decorators).
**"Upload profile picture"** → "File upload" section (`multipart/form-data` + `z.instanceof(File)`).
**"Return CSV download"** → "File download" section (`toDownloadResponse(...)`).

## Gotchas

- **HTTP decorator ≠ procedure validity.** Procedure without decorator still valid, typed, callable — just not exposed via HTTP/RPC.
- **`.fn()` validates by default** — same schemas as HTTP. `disableClientValidation: true` opts out, but only for trusted internal calls where input already checked.
- **`req.vovk.body()` async; `.query()` and `.params()` sync.** Easy to mix up.
- **`req.url` is `undefined` in `.fn()` context.** Any decorator checking URL must guard.
- **Zod default = `vovk init`'s choice** — if user chose Valibot/ArkType, match their choice when adding schemas.
- **CORS on decorator = preflight handling only.** Doesn't whitelist origins — configure at Next.js / platform layer.
- **`decorate()` order**: last listed applies first. Flipping order changes behavior.
- **`procedure().handle()` = the shape.** Don't confuse with `procedure(...).handle(...)` mid-chain — options go in `procedure(...)`, handler in `.handle(...)`.
- **Never pass `req` to service.** Procedures pre-calculate (`vovk.body()`, `vovk.meta()`, `next/headers`) and hand service plain typed values — see "Controller / procedure / service — split of responsibilities" above.
