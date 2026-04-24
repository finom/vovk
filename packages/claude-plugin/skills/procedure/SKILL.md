---
name: procedure
description: Knowledge base for Vovk.ts procedures — the atomic unit of server-side logic in a Vovk project. Use whenever the user asks to build ANYTHING that produces or consumes data on the server — a page that loads data ("users page", "dashboard", "product list"), an endpoint, an API handler, a server action, a form submission, a controller, validation with Zod / Valibot / ArkType, request/response shape, file upload, file download, error handling (`HttpException`, status codes), content types (JSON, multipart, text, binary), or calling server code from a React Server Component / SSR / SSG / PPR / server action. Triggers on phrasings like "build a users page", "add an endpoint", "create a form handler", "fetch X from the server", "handle file upload", "validate input", "throw a 404", "server action for Y", "controller for Z", "add `req.body` parsing", ".fn()", "CORS". Does NOT cover segments / `route.ts` / `initSegment` → hand off to `segment` skill. Does NOT cover RPC client generation, fetcher, `vovk-client` imports → hand off to `rpc` skill. Does NOT cover custom decorators, `createDecorator`, authorization / auth guards → hand off to `decorators` skill. Does NOT cover `deriveTools` / `createTools` / MCP / AI tool wiring → hand off to `tools` skill. Does NOT cover JSON Lines streaming / generators / `JSONLinesResponder` → hand off to `jsonlines` skill. Does NOT cover `@operation` metadata / Scalar docs → hand off to `openapi` skill.
---

# Vovk.ts procedures

A **procedure** is a typed, validated unit of server-side logic. It's built with `procedure({ ... }).handle(...)` and is the atom of every Vovk app.

**Key mental model:**

- **A procedure is valuable on its own.** It's a typed server function you call via `.fn()` from React Server Components, server actions, SSR/SSG/PPR, or any other server code. No HTTP involved.
- **An HTTP decorator (`@get`, `@post`, `@put`, `@patch`, `@del`) is OPTIONAL.** Add one only when the user wants the procedure exposed as an HTTP endpoint (which also makes it callable via the generated RPC client from the browser).

This is the opposite of most frameworks: procedures come first, HTTP is opt-in.

## Scope of this skill

Covers:

- `procedure({ ... }).handle(...)` — options, validation, output/iteration, content types.
- Standard Schema + Standard JSON Schema libs: **Zod**, **Valibot**, **ArkType**.
- Client-side validation via `vovk-ajv`.
- Controller classes — `@prefix`, HTTP decorators (`@get`, `@post`, `@put`, `@patch`, `@del`, `.auto()`).
- `VovkRequest<TBody, TQuery, TParams>` and `req.vovk` (body, query, params, meta).
- Error handling: `HttpException`, `HttpStatus`.
- Content types: JSON, `multipart/form-data`, URL-encoded, text, binary (image/video), downloads via `toDownloadResponse()`.
- Response headers, CORS.
- `.fn()` — local procedure calls from server components, SSR/SSG/PPR, server actions.
- `decorate()` non-decorator syntax.
- `vovk new controller service <name>` CLI for scaffolding.

Out of scope:

- Segment setup, `initSegment`, `route.ts` → **`segment` skill**.
- RPC client generation, `vovk generate`, how controllers surface as `FooRPC` on the client → **`rpc` skill**.
- Custom decorators, `createDecorator`, authorization / auth guards / role checks → **`decorators` skill**.
- `deriveTools()` / `createTools()` / MCP exposure → **`tools` skill**.
- `function*` / `async function*` generators, `JSONLinesResponder`, streaming → **`jsonlines` skill**.
- `@operation` decorator, Scalar docs, OpenAPI metadata → **`openapi` skill**.
- Type inference helpers (`VovkBody`, `VovkOutput`, etc.) — reference them in examples, but details live in **`common` skill**.

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

## Scaffolding via CLI

The fastest way to start is the CLI, which scaffolds a controller + service pair and registers the controller in the target segment's `route.ts`:

```bash
npx vovk new controller service <name>
# shortcut:
npx vovk n c s <name>
```

The `<name>` argument is `[segmentPath/]moduleName` — two naming conventions collide in one argument:

- **`moduleName`** (after the last `/`, or the entire string if no slash) **must be camelCase**. Normalize whatever the user types — lowercase the first token, TitleCase subsequent tokens, strip non-alphanumeric separators. Examples: `USER` → `user`, `User` → `user`, `user-profile` → `userProfile`, `my_cool_product` → `myCoolProduct`, `MyUser` → `myUser`, `myUser` → `myUser` (unchanged).
- **`segmentPath`** (anything before the last `/`) is the path of an **existing** segment — URL-safe slug, slash-separated for nested segments (`admin`, `user-portal`, `foo/bar`). Follow the segment naming rules (see `segment` skill), **not** camelCase. Leave it as-is if the user typed a valid path; otherwise convert to lowercase/kebab-case.

Example: user says "create a User-Profile module in the Admin segment" → call `npx vovk new controller service admin/userProfile`. `admin` stays as-is (segment slug), `User-Profile` → `userProfile` (module camelCase).

Useful flags:

- `--empty` — skip the CRUD boilerplate, generate empty stubs.
- `--overwrite` — replace existing module files if present.
- `--no-segment-update` — don't touch `route.ts` (register the controller manually; rare).
- `--dry-run` — preview what the CLI would create without writing.

This creates:

```
src/modules/<name>/<Name>Controller.ts
src/modules/<name>/<Name>Service.ts
```

and adds the controller to the segment's `controllers` map. The scaffolded controller comes pre-filled with a CRUD example (list/get/create/update/delete with placeholders) — **overwrite it in place** when writing real logic. Don't append beside the dummies and leave them.

If no segment exists yet, the CLI will fail — create one first via the `segment` skill.

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

Any Standard Schema library works: Zod (`z.object(...)`), Valibot (`v.object(...)`), ArkType (`type({...})`). Mix freely.

## `req.vovk` — the typed request interface

Inside a handler, `req.vovk` gives typed access to the validated request:

```ts
static createUser = procedure({
  body: z.object({ email: z.email(), name: z.string() }),
  query: z.object({ notify: z.enum(['email', 'push', 'none']) }),
}).handle(async (req) => {
  const { email, name } = await req.vovk.body();   // typed body
  const { notify } = req.vovk.query();             // typed query
  const params = req.vovk.params();                // typed params (also available as 2nd arg)

  // ...
});
```

**Meta** — per-request key-value storage, used by decorators and handlers:

```ts
req.vovk.meta({ userId: '123' });                  // set
const meta = req.vovk.meta<{ userId: string }>();  // get (typed)
req.vovk.meta(null);                               // clear
```

Clients can send meta via the `x-meta` header.

## `VovkRequest` — explicit request typing

If you're not using `procedure()` (rare), type the request manually:

```ts
import type { VovkRequest } from 'vovk';

static updateUser(
  req: VovkRequest<{ email: string }, { notify: 'email' | 'push' }, { id: string }>,
  { id }: { id: string },
) {
  // ...
}
```

Almost always use `procedure()` instead — it gives you the same types plus validation.

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

### `.fn()` rules

1. **No full `Request` object.** Destructure to use `vovk` only:

   ```ts
   .handle(async ({ vovk }) => {
     const body = await vovk.body();
     const query = vovk.query();
     const params = vovk.params();
     const meta = vovk.meta<{ /* ... */ }>();
   });
   ```

   Accessing `req.url`, `req.headers`, etc. from within a handler called via `.fn()` gives `undefined`.

2. **Validation runs by default** (same schemas as the HTTP path). Pass `disableClientValidation: true` to skip it — use sparingly; trusted server input is still input.

3. **Detect local context** in custom decorators by checking `typeof req.url === 'undefined'`.

4. **`meta` works** — pass `meta: { ... }` to `.fn()` to populate `req.vovk.meta()` inside the handler:

   ```ts
   await UserController.getUser.fn({ params: { id: '…' }, meta: { userId: 'abc' } });
   ```

5. **`.fn()` returns the handler's return value directly** — no JSON serialization, no network hop.

## Validation — Standard Schema

Works with any Standard-Schema-compliant lib. Zod is the default after `vovk init` with default flags.

```ts
// Zod
body: z.object({ email: z.email(), age: z.number().int().min(0) })

// Valibot
import * as v from 'valibot';
body: v.object({ email: v.pipe(v.string(), v.email()), age: v.pipe(v.number(), v.integer()) })

// ArkType
import { type } from 'arktype';
body: type({ email: 'string.email', age: 'number.integer>=0' })
```

**Client-side validation** — install `vovk-ajv` (or `vovk-zod`, etc.) and wire it up via `vovk.config.mjs`:

```ts
// vovk.config.mjs
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
  },
};
```

Now the generated RPC client validates before sending. Disable per call:

```ts
await UserRPC.update({ params, body, disableClientValidation: true });
```

**Per-procedure disables:**

```ts
procedure({
  body: z.object({...}),
  disableServerSideValidation: true,            // all
  disableServerSideValidation: ['body'],        // specific fields
  skipSchemaEmission: ['output'],               // don't include in generated schema
});
```

Use sparingly. Validation disappearing silently is a nasty source of bugs.

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
  body: z.object({
    userId: z.string(),
    file: z.instanceof(File),
  }),
}).handle(async (req) => {
  const { userId, file } = await req.vovk.body();
  // save file...
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

## Type inference (brief)

For typing services and clients against procedures:

```ts
import type { VovkBody, VovkOutput, VovkInput } from 'vovk';

type Body = VovkBody<typeof UserController.updateUser>;
type Out  = VovkOutput<typeof UserController.updateUser>;
type In   = VovkInput<typeof UserController.updateUser>; // { params, query, body }
```

Full list (`VovkQuery`, `VovkParams`, `VovkIteration`, `VovkReturnType`, `VovkYieldType`) lives in the `common` skill.

## Flows

### "Build a users page that shows the user list on the server"

1. Create a procedure (CLI or by hand). **No HTTP decorator.**
   ```ts
   class UserController {
     static list = procedure({
       output: z.array(z.object({ id: z.string(), email: z.email() })),
     }).handle(async () => UserService.listAll());
   }
   ```
2. Call from the server component via `.fn()`:
   ```tsx
   export default async function UsersPage() {
     const users = await UserController.list.fn({});
     return <ul>{users.map(u => <li key={u.id}>{u.email}</li>)}</ul>;
   }
   ```

The browser never talks to the server directly — the HTML is rendered with data inline.

### "Now also expose `/api/users` for the mobile app"

Add `@get()` to the same procedure. The RPC client now has `UserRPC.list()`. The server component code is unchanged.

### "Add a form on the page to create a user"

1. Add a new procedure, same controller, no HTTP decorator needed:
   ```ts
   static create = procedure({
     body: z.object({ email: z.email() }),
     output: z.object({ id: z.string() }),
   }).handle(async (req) => {
     const { email } = await req.vovk.body();
     return UserService.create(email);
   });
   ```
2. Wire the form to a server action calling `.fn()`:
   ```tsx
   async function submit(body: FormData) {
     'use server';
     await UserController.create.fn({ body });
   }
   ```

### "Protect `/api/admin/users` with auth"

Hand off to the **`decorators` skill** — auth guards are custom decorators.

### "Upload a profile picture"

See "File upload" — `contentType: 'multipart/form-data'` + `z.instanceof(File)`.

### "Return a CSV download"

See "File download" — `toDownloadResponse(...)`.

## Gotchas

- **HTTP decorator ≠ procedure validity.** A procedure without a decorator is still a valid, typed, callable unit — just not exposed via HTTP/RPC.
- **`.fn()` validates by default** — same schemas as HTTP. `disableClientValidation: true` opts out, but only do that for trusted internal calls where the input was already checked.
- **`req.vovk.body()` is async; `.query()` and `.params()` are sync.** Easy to mix up.
- **`req.url` is `undefined` in `.fn()` context.** Any decorator checking the URL must guard.
- **Zod default is `vovk init`'s choice** — if the user chose Valibot/ArkType, match their choice when adding schemas.
- **CORS on a decorator is preflight handling only.** It doesn't whitelist origins — configure that at the Next.js / platform layer.
- **`decorate()` order**: last listed applies first. Flipping the order changes behavior.
- **`procedure().handle()` is the shape.** Don't confuse with `procedure(...).handle(...)` mid-chain — the options go in `procedure(...)`, the handler goes in `.handle(...)`.
- **Services hold business logic, controllers hold HTTP concerns.** If you find branching on request shape inside a service, it's in the wrong file.
