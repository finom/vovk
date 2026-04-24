---
name: procedure
description: Vovk.ts procedures — the atomic unit of server-side logic in a Vovk project. Use whenever the user asks to build ANYTHING that produces or consumes data on the server — a page that loads data ("users page", "dashboard", "product list"), an endpoint, an API handler, a server action, a form submission, a controller, validation with Zod / Valibot / ArkType, request/response shape, file upload, file download, error handling (`HttpException`, status codes), content types (JSON, multipart, text, binary), or calling server code from a React Server Component / SSR / SSG / PPR / server action. Triggers on phrasings like "build a users page", "add an endpoint", "create a form handler", "fetch X from the server", "handle file upload", "validate input", "throw a 404", "server action for Y", "controller for Z", "add `req.body` parsing", ".fn()", "CORS". Does NOT cover segments / `route.ts` / `initSegment` → hand off to `segment` skill. Does NOT cover RPC client generation, fetcher, `vovk-client` imports → hand off to `rpc` skill. Does NOT cover custom decorators, `createDecorator`, authorization / auth guards → hand off to `decorators` skill. Does NOT cover `deriveTools` / `createTools` / MCP / AI tool wiring → hand off to `tools` skill. Does NOT cover JSON Lines streaming / generators / `JSONLinesResponder` → hand off to `jsonlines` skill. Does NOT cover `@operation` metadata / Scalar docs → hand off to `openapi` skill.
---

# Vovk.ts procedures

A **procedure** is a typed, validated unit of server-side logic. It's built with `procedure({ ... }).handle(...)` and is the atom of every Vovk app.

**Key mental model:**

- **A procedure is valuable on its own.** It's a typed server function you call via `.fn()` from React Server Components, server actions, SSR/SSG/PPR, or any other server code. No HTTP involved.
- **An HTTP decorator (`@get`, `@post`, `@put`, `@patch`, `@del`) is OPTIONAL.** Add one only when the user wants the procedure exposed as an HTTP endpoint (which also makes it callable via the generated RPC client from the browser).

This is the opposite of most frameworks: procedures come first, HTTP is opt-in.

## Scope

Covers procedure authoring end-to-end: `procedure({...}).handle(...)` options, validation with Zod/Valibot/ArkType (+ `vovk-ajv` client-side), controller classes and HTTP decorators (`@prefix`, `@get/@post/@put/@patch/@del`, `.auto()`), `req.vovk` + `VovkRequest`, error handling (`HttpException` / `HttpStatus`), content types (JSON, multipart, URL-encoded, text, binary, downloads), response headers + CORS, `.fn()` for server components / SSR / server actions, `decorate()`, and the `vovk new controller service` CLI.

Out of scope (→ skill): segment setup / `initSegment` / `route.ts` → `segment`. RPC client generation / `vovk-client` → `rpc`. Custom decorators / `createDecorator` / auth guards → `decorators`. AI tools (`deriveTools`, `createTools`) → `tools`. Generator handlers / streaming → `jsonlines`. `@operation` / Scalar docs → `openapi`. Inference helpers against RPC modules → `rpc`.

## The procedure, minimally

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

**What you have so far:**

- A typed, validated procedure.
- Callable from ANY server code via `UserController.getUser.fn({ params: { id: '…' } })`.
- **Not** an HTTP endpoint. Not in the generated RPC client.

To expose it over HTTP, add an HTTP decorator:

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

Now it's **also** `GET /api/users/{id}` and available as `UserRPC.getUser(...)` on the client.

## Deciding: decorator or no decorator?

**When the user says...**

| User intent | What to build |
|---|---|
| "Build a users page" / "load X on the server" / "dashboard showing Y" | Procedure, no decorator. Call via `.fn()` from the server component. |
| "Server action for form submit" | Procedure, no decorator. Call via `.fn()` inside a `'use server'` function. |
| "Add a `/api/users` endpoint" / "expose X as an API" / "browser needs to call it" | Procedure + HTTP decorator. |
| "Users page AND also an API" | Procedure + HTTP decorator. Call `.fn()` from the server component; the RPC client covers the browser path. |
| "Internal helper used only from other procedures" | Plain service function, not a procedure. Use `procedure` only when you want validation/types as a contract. |

**Default behavior:** when in doubt, start without an HTTP decorator. Adding one later is a one-line change. Exposing too eagerly and needing to retract it is harder.

## Controller / procedure / service — split of responsibilities

- **Services** are **always** the business-logic module — data access, domain rules, calls to other services. Not optional "once logic gets big enough"; domain logic lives there from line one.
- **Procedures** do only *thin pre-calculation*: pull validated body/query/params from `req.vovk`, read actor info from `req.vovk.meta()` / `next/headers`, then delegate to a service and return its result.
- **Services must never touch `req` / `VovkRequest`.** They take plain typed arguments — ideally via `VovkBody` / `VovkParams` / `VovkOutput` (see "Type inference").

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

A service that takes `VovkRequest` — or branches on request shape — is a layering leak. Services must be callable from cron jobs, CLI scripts, migrations, and sibling procedures; if any of those paths would need a fake request, the logic is in the wrong file.

## Scaffolding via CLI

```bash
npx vovk new controller service <name>   # shortcut: npx vovk n c s <name>
```

`<name>` is `[segmentPath/]moduleName`, combining two conventions:

- **`moduleName`** (after the last `/`) **must be camelCase**. Normalize user input: `USER` → `user`, `user-profile` → `userProfile`, `MyUser` → `myUser`. Combined example: "User-Profile in the Admin segment" → `admin/userProfile`.
- **`segmentPath`** (before the last `/`) is an **existing** segment path — URL slug, kebab-case, slash-separated for nested (`admin`, `foo/bar`). Not camelCase. See `segment` skill.

Flags: `--empty` (no CRUD boilerplate), `--overwrite`, `--no-segment-update` (skip `route.ts` edit, rare), `--dry-run`.

Creates `src/modules/<name>/<Name>Controller.ts` + `<Name>Service.ts` and registers the controller in the segment's `controllers` map. The scaffold ships with CRUD placeholders — **overwrite them in place** when writing real logic; don't leave dummies next to real code. Fails if no segment exists — create one first (`segment` skill).

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

Works with any library that emits **Standard JSON Schema** — Zod v4+ and ArkType pass through directly; Valibot needs `toStandardJsonSchema()` from `@valibot/to-json-schema`. See the "Validation — Standard Schema" section below for the exact patterns.

## The `req` argument & `req.vovk`

The first argument to `.handle((req, params) => …)` is a **`VovkRequest`** — `NextRequest` patched with a typed `vovk` property. All usual Next.js request APIs work (`req.json()`, `req.formData()`, `req.headers`, `req.nextUrl`, …), but two conventions matter:

**Prefer `next/headers` over `req.headers` / `req.cookies`.** Works identically in procedures, server components, server actions, and middleware; `req.headers` only works in the HTTP path.

**Prefer `req.vovk` over `req.json()` / `req.nextUrl.searchParams`** for reading body/query/params. `req.json()` and `req.nextUrl.searchParams` are typed (`VovkRequest` infers them from schemas), but they're `undefined` under `.fn()` — so any handler using them can't be called locally. `req.vovk` works in both contexts.

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

Destructuring `{ vovk }` is a stylistic signal that the handler is LPC-safe; `async (req) => req.vovk.body()` is equivalent. Reach for raw `req.*` only when `vovk` doesn't expose what you need — and guard those handlers from `.fn()` (check `typeof req.url === 'undefined'`).

**Meta** — per-request key-value storage shared between decorators and handlers. Pass the generic on both set and read; share one type alias so TypeScript stays honest:

```ts
type SessionMeta = { userId: string };
req.vovk.meta<SessionMeta>({ userId: '123' });       // set
const { userId } = req.vovk.meta<SessionMeta>();     // read
req.vovk.meta(null);                                 // clear
```

Multiple `meta()` calls merge. Clients can send meta via an `x-meta` header, which lands under `xMetaHeader` so it can't overwrite server-set keys — full auth pattern in the `decorators` skill.

**`VovkRequest` without `procedure()`** (rare): `req: VovkRequest<TBody, TQuery, TParams>` types `req.json()` / `searchParams` manually, but you lose validation and `.fn()`. Almost always reach for `procedure()` instead.

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
| `staticParams` | For static segments — enumerate URL params. See `segment` skill. |

Path template uses `{name}` for segments: `'{id}'`, `'{org}/members/{userId}'`.

## `.fn()` — local procedure calls (SSR / server components / server actions)

Every procedure exposes `.fn()`, which invokes the handler without going over HTTP.

```tsx
// Server component — no 'use client'
import UserController from '@/modules/user/UserController';

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

Wrap `.fn()` in try/catch and return a discriminated union so the client can `'data' in result` / `'error' in result`:

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

- **`contentType: 'multipart/form-data'` (or `'application/x-www-form-urlencoded'`) → `.fn()` auto-parses `FormData`.** Pass it straight through as `body`, no `Object.fromEntries`.
- **`useActionState`'s signature is `(prevState, formData) => nextState`** — the action takes `_prev` as first arg, usually ignored.
- **Validation still runs** — a bad field throws, `catch (e)` surfaces it as `{ error }`. `isPending` handles loading UI for free.

### `.fn()` rules

1. **No full `Request` object under `.fn()`.** `req.url`, `req.headers`, `req.json()`, `req.nextUrl`, `req.cookies`, etc. are all `undefined` — `.fn()` synthesizes only the `vovk` facet. This is why the rule in "The `req` argument" above matters: handlers that destructure `{ vovk }` and read data through `req.vovk` (plus `next/headers` for headers/cookies) are portable between HTTP and `.fn()`; handlers that call `req.json()` or touch `req.nextUrl` are not.

2. **Validation runs by default** (same schemas as the HTTP path). Pass `disableClientValidation: true` to skip it — use sparingly; trusted server input is still input.

3. **Detect local context** in custom decorators by checking `typeof req.url === 'undefined'`.

4. **`meta` works** — pass `meta: { ... }` to `.fn()` to populate `req.vovk.meta()` inside the handler:

   ```ts
   await UserController.getUser.fn({ params: { id: '…' }, meta: { userId: 'abc' } });
   ```

5. **`.fn()` returns the handler's return value directly** — no JSON serialization, no network hop.

## Validation — Standard Schema

Works with any lib that emits **Standard JSON Schema** (Vovk needs JSON Schema — not just Standard Schema — for OpenAPI, codegen, and client-side validation). Zod (v4+) and ArkType produce it natively. Valibot needs one conversion step. Zod is the default after `vovk init` with default flags.

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

**Valibot gotcha**: every Valibot schema handed to `procedure({...})` must be wrapped with `toStandardJsonSchema(...)`. Unwrapped Valibot passes Standard Schema runtime checks but fails codegen / OpenAPI because it doesn't expose JSON Schema. If you picked Valibot via `vovk init`, the generated templates already wrap — follow that pattern.

**Client-side validation** — install `vovk-ajv` (or roll your own via `createValidateOnClient`; see the `rpc` skill) and set `outputConfig.imports.validateOnClient: 'vovk-ajv'` in `vovk.config.mjs`. The RPC client then validates before sending; opt out per call with `disableClientValidation: true`.

**Per-procedure disables** — `disableServerSideValidation: true | ['body'|'query'|...]` skips server validation; `skipSchemaEmission` keeps a field out of the generated schema. Use sparingly — validation disappearing silently is a nasty source of bugs.

## Content types

Default is `application/json`. Override via `contentType`:

| `contentType` | `req.vovk.body()` returns | Client may send |
|---|---|---|
| `application/json` | Parsed object typed to schema. | Schema-typed value or `Blob`. |
| `multipart/form-data` | Parsed object with `File` fields for file inputs. | Schema-typed value, `FormData`, or `Blob`. |
| `application/x-www-form-urlencoded` | Parsed object. | Schema-typed value, `URLSearchParams`, `FormData`, or `Blob`. |
| `text/*` | `string`. | `string` or `Blob`. |
| `image/*`, `video/*`, binary | `File`. | `File`, `ArrayBuffer`, `Uint8Array`, `Blob`. |
| `*/*` | Same as binary. | Any of the above. |

Wildcards allowed. Requests without a matching `Content-Type` header get **415 Unsupported Media Type**.

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

- Bare `Error` instances become HTTP 500 with the message stripped in production.
- On the RPC client, `HttpException` is re-thrown with the same status/message/cause — `try/catch` works identically on both sides.

Common statuses from `HttpStatus`: `OK` (200), `CREATED` (201), `NO_CONTENT` (204), `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `UNPROCESSABLE_ENTITY` (422), `INTERNAL_SERVER_ERROR` (500).

## Response headers (dynamic)

Static headers go on the decorator (`@get('x', { headers: {...} })`). For dynamic ones:

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

For authorization, logging, rate-limits, and other cross-cutting concerns, see the **`decorators` skill** (`createDecorator`, stacking, `.fn()` detection, auth patterns).

## `decorate()` — non-decorator syntax

For projects that don't enable `experimentalDecorators`:

```ts
import { decorate, get, prefix, procedure, operation } from 'vovk';

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

Decorators apply in order — **last listed is applied first**. `procedure()` typically goes last (applied first, closest to the handler).

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
import UserController from './UserController';

type Body   = VovkBody<typeof UserController.updateUser>;
type Query  = VovkQuery<typeof UserController.updateUser>;
type Params = VovkParams<typeof UserController.updateUser>;
type In     = VovkInput<typeof UserController.updateUser>;
type Out    = VovkOutput<typeof UserController.updateUser>;
```

All of these work identically against controller methods, RPC modules, and imported mixin modules. `VovkYieldType` / `VovkReturnType` exist for cases where validation hasn't been declared on a method (they can't be used for self-references in services without triggering "implicit any" TypeScript errors).

The most common use: type a service's inputs against the controller's procedure, so the schema stays the single source of truth — controller declares, service consumes, client infers via the RPC module.

```ts
export default class UserService {
  static async updateUser(
    body: VovkBody<typeof UserController.updateUser>,
    params: VovkParams<typeof UserController.updateUser>,
  ): Promise<VovkOutput<typeof UserController.updateUser>> { … }
}
```

For client-side usage (against `UserRPC.updateUser`) the helpers behave the same — see the **`rpc` skill**.

## Flows

**"Build a users page that shows the user list on the server"** — procedure **without** an HTTP decorator, called via `.fn()` from a server component:

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
The HTML ships with data inline; the browser never talks to the server.

**"Now also expose `/api/users` for the mobile app"** — add `@get()` to the same procedure. `UserRPC.list()` appears on the client; the server component is unchanged.

**"Add a form on the page to create a user"** — add a second procedure (no decorator needed), wire a server action calling `.fn({ body })`. For loading/error UX, use the `useActionState` pattern above.

**"Protect `/api/admin/users` with auth"** → **`decorators` skill** (auth guards are custom decorators).
**"Upload a profile picture"** → "File upload" section (`multipart/form-data` + `z.instanceof(File)`).
**"Return a CSV download"** → "File download" section (`toDownloadResponse(...)`).

## Gotchas

- **HTTP decorator ≠ procedure validity.** A procedure without a decorator is still a valid, typed, callable unit — just not exposed via HTTP/RPC.
- **`.fn()` validates by default** — same schemas as HTTP. `disableClientValidation: true` opts out, but only do that for trusted internal calls where the input was already checked.
- **`req.vovk.body()` is async; `.query()` and `.params()` are sync.** Easy to mix up.
- **`req.url` is `undefined` in `.fn()` context.** Any decorator checking the URL must guard.
- **Zod default is `vovk init`'s choice** — if the user chose Valibot/ArkType, match their choice when adding schemas.
- **CORS on a decorator is preflight handling only.** It doesn't whitelist origins — configure that at the Next.js / platform layer.
- **`decorate()` order**: last listed applies first. Flipping the order changes behavior.
- **`procedure().handle()` is the shape.** Don't confuse with `procedure(...).handle(...)` mid-chain — the options go in `procedure(...)`, the handler goes in `.handle(...)`.
- **Never pass `req` to a service.** Procedures pre-calculate (`vovk.body()`, `vovk.meta()`, `next/headers`) and hand the service plain typed values — see "Controller / procedure / service — split of responsibilities" above.
