---
name: rpc
description: The Vovk.ts RPC client — how `vovk generate` turns controllers into type-safe client modules, the composed `vovk-client` vs segmented clients, the call shape (`apiRoot`, `params`, `body`, `query`, `meta`, `init`, `disableClientValidation`, `validateOnClient`, `interpretAs`, `transform`, `fetcher`), customizing generation via `outputConfig.imports.fetcher` and `createFetcher` (auth headers, retries, tracing, dynamic `onSuccess` / `onError` subscribers), configuring clients in `vovk.config.mjs` (`composedClient` / `segmentedClient`), error rethrow (`HttpException`, `HttpStatus.NULL`), `VovkInput`/`VovkOutput` against RPC modules, React Query integration (`queryKey`, `streamedQuery`), and the RPC method surface (`.withDefaults`, `.getURL`, `.queryKey`, `.schema`, `.isRPC`). Use whenever the user asks to call the API from a browser / mobile / other server ("fetch users from the client", "call the API from Next.js client component", "typed API client", "why is my RPC call failing", "add auth token to every request", "custom headers on RPC calls", "retry on 401", "why is the client stale"), regenerate the client (`vovk generate`), choose between composed vs segmented clients, or wire up `vovk-client` imports. Does NOT cover writing procedures / handlers → hand off to `procedure` skill. Does NOT cover segment registration / `initSegment` → hand off to `segment` skill. Does NOT cover JSON Lines streaming clients → hand off to `jsonlines` skill.
---

# Vovk.ts RPC client

Every controller procedure with an HTTP decorator automatically gets a typed client counterpart. `vovk generate` produces these client modules from the segment schemas. Where they're imported from depends on your config:

- **Default setup only** (composed client + JS template + default `outDir: './node_modules/.vovk-client'`) → the `vovk-client` npm package barrel re-exports the emitted `.js` / `.d.ts`. You import from `'vovk-client'`.
- **Any other configuration** — TS template, segmented client, or a custom source-tree `outDir` — the `vovk-client` package is *not* used at all. The generated files live in your source tree and you import them through a local path alias (e.g. `'@/client'`, `'@/client/<segment>'`).

**Key identity**: the client module name = the **key** used in `initSegment`'s `controllers` map, regardless of import path.

```ts
// server
initSegment({ controllers: { UserRPC: UserController } });

// client (default setup shown — composed + JS template)
import { UserRPC } from 'vovk-client';
await UserRPC.getUser({ params: { id: '42' } });
```

Not `UserControllerRPC`. Not `UserController`. Whatever the key is.

## Scope

Covers:

- `vovk generate` — when to run it, what it produces.
- Composed vs segmented clients (`composedClient` / `segmentedClient` config).
- RPC method call shape.
- Fetcher customization via `createFetcher` + `outputConfig.imports.fetcher`, plus dynamically registered `onSuccess` / `onError` subscribers.
- Client-side validation (`vovk-ajv` integration, custom via `createValidateOnClient`).
- Error rethrow (`HttpException`, status/message/cause, `HttpStatus.NULL`).
- RPC method surface (`.withDefaults`, `.getURL`, `.queryKey`, `.schema`, `.controllerSchema`, `.segmentSchema`, `.fullSchema`, `.isRPC`).
- React Query / TanStack Query integration.
- `openapi` and `schema` payload imports.
- Cancellation — what's supported, what isn't.

Out of scope:

- Segment registration → **`segment` skill**.
- Procedure / handler / validation authoring → **`procedure` skill**.
- Streaming clients (async iteration, `progressive()`) → **`jsonlines` skill**.
- Python / Rust clients → **`python` / `rust` skills**.
- `@operation` metadata for OpenAPI → **`openapi` skill**.

## Generating the client

```bash
npx vovk generate
```

What it does:

- Reads `.vovk-schema/**/*.json` for every segment (nested segments live in subdirectories, e.g. `.vovk-schema/customer/static.json`).
- Emits generated code into the configured `outDir` using the selected `fromTemplates` preset.
- Default composed setup — `fromTemplates: ['js']` + `outDir: './node_modules/.vovk-client'` — emits `.js` / `.d.ts` files that the `vovk-client` npm package re-exports via `export * from '../.vovk-client/index.js'`. This is the **only** configuration where you import from `'vovk-client'`.
- Alternate (recommended for pnpm) — `fromTemplates: ['ts']` + `outDir: './src/client'` — emits `.ts` files directly into the source tree. The `vovk-client` package isn't used at all; users import from a local alias like `'@/client'` and their own tsc handles the files.
- Segmented client (any template) — always vendors per-segment modules into the source tree (default `./src/client/<segment>`). `vovk-client` is not used regardless of template.

See "Import path depends on template + outDir" below for why these pair up.

**`vovk generate` does NOT rebuild schemas from controller source.** Schema emission is a separate step: `vovk dev` runs alongside the Next.js dev server, hits each segment's `_schema_` endpoint (only available when `NODE_ENV === 'development'`), and writes JSON into `.vovk-schema/`. `vovk generate` then reads whatever's there.

Consequence: if the backend changed and the client looks stale, running `vovk generate` alone isn't enough — `.vovk-schema/` hasn't been refreshed. Run `npm run dev` (which starts `vovk dev` alongside `next dev` via `concurrently`) to re-emit schemas, then the client regenerates from them.

When to run:

- **Automatic**: the `prebuild` script installed by `vovk init` runs `vovk generate` before `next build`. During `npm run dev`, the dev watcher refreshes `.vovk-schema/` on backend changes and the client regenerates from it.
- **Explicit**: before integration tests, after checking out a branch, if a client method appears missing ("it compiled fine, why is `UserRPC.createUser` undefined?"). If a method you just wrote is missing, the schema is probably stale — restart `npm run dev` rather than just re-running `vovk generate`.

## Call shape

Same signature across every RPC method. Core options first, advanced below:

```ts
await ModuleRPC.methodName({
  // data
  params?: { ... },                 // path params — typed
  query?: { ... },                  // query string — typed
  body?: { ... } | FormData | ...,  // narrows by contentType — see "Body by content type"
  meta?: { [key: string]: any },    // serialized as x-meta header — see meta-isolation gotcha

  // transport
  apiRoot?: string,                 // override the generation-time default
  init?: RequestInit,               // headers, credentials, next.revalidate, etc. — see note on signal

  // validation
  disableClientValidation?: boolean,
  validateOnClient?: ...,           // per-call validator override

  // advanced
  interpretAs?: string,             // force response interpretation, e.g. 'application/jsonl' when server didn't set it
  transform?: (data, response) => any, // post-process the parsed response

  // plus any custom options declared via createFetcher<TOptions>({...}) — see Fetcher section
});
```

The return type is a `Promise` of whatever the procedure's `output` schema resolves to, or whatever `transform` returns if present. Override the inferred return type per call:

```ts
const user = await UserRPC.updateUser<SomeType>({ /* ... */ });
```

### Body by content type

`body`'s accepted type narrows to the procedure's `contentType`: `FormData` for `multipart/form-data`, `URLSearchParams` or `FormData` for `application/x-www-form-urlencoded`, `File` / `Blob` / `ArrayBuffer` / `Uint8Array` for binary (`image/*`, `video/*`, `*/*`). Schema-typed objects are always accepted. Full matrix in the **`procedure`** skill.

```ts
const form = new FormData();
form.append('file', file);
await UserRPC.uploadAvatar({ body: form }); // multipart/form-data procedure
```

Never hand-set `Content-Type` — the fetcher derives it (multipart boundary included). Manual headers are the usual HTTP 415 trigger.

### `apiRoot`

`apiRoot` is **baked in at generation time**: defaults to `/${rootEntry}` (`rootEntry` defaults to `'api'`, so the default baked-in value is `/api`). When `outputConfig.origin` is set, the bake produces a full URL like `http://localhost:3000/api`. The per-call `apiRoot` option fully replaces the baked-in value for that one call — config-level changes still require `vovk generate`.

In the browser, a relative `/api` resolves against the page origin, so the same call works both from `/dashboard` and `/settings`. On the server (Node, edge, integration tests) relative URLs don't resolve — pass a full URL per call, bake one in via `outputConfig.origin`, or use `withDefaults({ apiRoot })`.

### `init`

`RequestInit` forwarded to `fetch` — `headers`, `credentials`, `mode`, `cache`, and Next.js-specific `next: { revalidate: number }` all pass through.

### `transform`

Receives the parsed response data and the original `Response`. Return anything — including a tuple if you want the `Response` exposed to the caller:

```ts
const [user, response] = await UserRPC.updateUser({
  /* ... */
  transform: (data, response) => [data, response] as const,
});
response satisfies Response;
```

### `interpretAs`

Forces the fetcher's content-type dispatch. Useful when a server returns JSON Lines but omits `content-type: application/jsonl` (common behind some proxies or when streaming through Next.js): `interpretAs: 'application/jsonl'` makes the client treat the response as an async iterable anyway.

## Composed vs segmented client

Two top-level config keys — `composedClient` and `segmentedClient` — are **independent toggles**; enable one, the other, or both. Defaults differ because they target different workflows:

| Key               | Default `enabled` | Default `fromTemplates` | Default `outDir`                         | Default import            |
|-------------------|-------------------|--------------------------|-------------------------------------------|---------------------------|
| `composedClient`  | `true`            | `['js']`                 | `./node_modules/.vovk-client`             | `'vovk-client'`           |
| `segmentedClient` | `false`           | `['ts']`                 | `./src/client` (or `./client` if no `src`) | `'@/client/<segment>'`    |

Only the composed client's *default* wires up the `vovk-client` npm barrel (it re-exports `.js`/`.d.ts` from `node_modules/.vovk-client`). Deviating from that exact combo — switching composed to the TS template, a source-tree `outDir`, or enabling segmented — bypasses `vovk-client` entirely and you import from a local alias.

```ts
// vovk.config.mjs
const config = {
  composedClient: {
    enabled: true, outDir: './node_modules/.vovk-client', fromTemplates: ['js'],  // all defaults
    prettifyClient: false,                    // true → run Prettier on emitted files
    includeSegments: ['public'],              // mutually exclusive with excludeSegments
  },
  segmentedClient: { enabled: true, outDir: './src/client', fromTemplates: ['ts'] },
};
```

Both keys can carry a nested `outputConfig` that overrides the top-level one for that specific output (e.g. segmented SDKs with a different OpenAPI block).

**Composed** — one client module re-exports every RPC across every segment. Default case for most projects: `import { UserRPC, PostRPC } from 'vovk-client'`. With a source-tree `outDir` (TS template), import from `'@/client'` instead.

**Segmented** — per-segment entries; importing `@/client/admin` keeps other segments out of the bundle. Useful when segment boundaries map to independent deploys, versioning, or SDK consumers.

```
src/client/
├── root/     (index.ts, schema.ts, openapi.json, openapi.ts)
├── admin/    ...
└── customer/
    └── static/    (nested sub-segment)
```

```ts
import { UserRPC } from '@/client/customer';
import { AdminRPC } from '@/client/admin';
```

### Import path depends on template + outDir (composed client)

Composed's import path follows from `fromTemplates` × `outDir`, because `vovk-client`'s barrel is just `export * from '../.vovk-client/index.js'` — it only resolves `.js`/`.d.ts` at the default location.

| `fromTemplates` | `outDir`                                  | Import from               | Notes |
|-----------------|-------------------------------------------|---------------------------|-------|
| `['js']`        | `./node_modules/.vovk-client` (default)   | `'vovk-client'`           | Default — only combo that actually uses `vovk-client`. |
| `['ts']`        | source tree (e.g. `./src/client`)          | `'@/client'`              | Recommended for pnpm; your tsc handles `.ts` directly. |
| `['js']`        | custom source-tree path                    | local path                | Valid but unusual. |
| `['ts']`        | default `node_modules/.vovk-client`        | broken                    | Barrel can't find `.js` to re-export. |

Segmented has no equivalent table — it always vendors per-segment modules into the configured `outDir` and you always import from a local alias.

**Why switch to TS template / source-tree `outDir`?**
- **pnpm** — strict non-hoisted `node_modules` breaks the `vovk-client` → `.vovk-client` sibling hop.
- **Commit the client** — review, CI reproducibility, offline builds.
- **TS integration** — source maps, go-to-definition, and type narrowing align with your project's `tsconfig`.

Step-by-step setup → **`init` skill**.

## Fetcher

The fetcher is the client's core primitive — a function (`VovkFetcher<TFetcherOptions>`) that takes request metadata (endpoint, method, schema, validator) and dispatches the actual `fetch`. The default (`import { fetcher } from 'vovk/fetcher'`) already handles JSON and JSON Lines, runs client-side validation, injects the `x-meta` header, and rethrows `HttpException` on errors.

Response-shape dispatch by content type:

- `application/json` → parsed JSON (typed as the procedure's output schema).
- `application/jsonl` / `application/jsonlines` → disposable async iterable (see `jsonlines` skill).
- Other content types → the raw `Response` object, so the caller can read text, binary, or stream it themselves.

You **extend** the default rather than rewriting it, via `createFetcher`:

```ts
// src/lib/fetcher.ts
import { createFetcher } from 'vovk';

export const fetcher = createFetcher<{
  // Custom per-call options — become typed fields on every RPC method call site.
  useAuth?: boolean;
  successMessage?: string;
}>({
  prepareRequestInit: async (init, { useAuth }) => ({
    ...init,
    headers: {
      ...init.headers,
      ...(useAuth ? { Authorization: `Bearer ${await getToken()}` } : {}),
    },
  }),
  transformResponse: (data, options, info) => data,     // optional
  onSuccess: (data, { successMessage }) => {
    if (successMessage) console.log(successMessage);
  },
  onError: (error, options) => { /* Sentry, retry hooks */ },
});
```

With that fetcher installed, callers get the custom options inline:

```ts
await UserRPC.updateUser({
  params: { id: '42' },
  body: { /* ... */ },
  useAuth: true,
  successMessage: 'Updated!',
});
```

### Hooks

All optional; `options` is the typed `TOptions` you declared.

- `prepareRequestInit(init, options) => RequestInit` — mutate `RequestInit` before `fetch` (headers, credentials, mode, cache, `next.revalidate`).
- `transformResponse(data, options, info)` — transform the parsed response; `info = { response, init, schema }` gives access to the raw `Response`, the final `RequestInit`, and the procedure's `VovkHandlerSchema` (useful for reading `operationObject`).
- `onSuccess(data, options)` — observe successful responses (toasts, analytics).
- `onError(error: HttpException, options)` — observe failures. Both network errors and HTTP-status errors land here; `error.statusCode === 0` (`HttpStatus.NULL`) means either a transport failure or a client-side validation rejection.

### Event-style subscribers (dynamic)

`onSuccess` and `onError` can also be attached **after** the fetcher is created. Useful when the callback depends on state that isn't available at creation time (a React context value, a Zustand store reference, a lazily loaded logger). Each registration returns an unsubscribe function, and multiple subscribers run in order on every call:

```ts
// Somewhere in an app entry point (or a React effect, etc.)
import { fetcher } from '@/lib/fetcher';

const unsubSuccess = fetcher.onSuccess((data, { successMessage }) => {
  if (successMessage) toast.success(successMessage);
});

const unsubError = fetcher.onError((error) => {
  sentryReport(error);
});

// Later
unsubSuccess();
unsubError();
```

Prefer this pattern over baking toasts / store writes into `createFetcher` when the dependency graph would otherwise force you to import UI-layer modules from your transport layer.

### Point the config at the fetcher

```ts
// vovk.config.mjs
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      fetcher: './src/lib/fetcher',  // must export `fetcher` (named export)
    },
  },
};
export default config;
```

The generated client imports `fetcher` from that path automatically. After editing config manually, `vovk generate`.

**Per-segment fetcher**: different segments can use different fetchers (e.g., admin segment needs different auth than the public one):

```ts
outputConfig: {
  imports: { fetcher: './src/lib/fetcher' },    // applied to all segments by default
  segments: {
    admin: {
      imports: { fetcher: './src/lib/adminFetcher' },  // overrides for admin
    },
  },
}
```

**Common patterns:**

- **Auth token**: inject `Authorization` header in `prepareRequestInit`, gated on a `useAuth` custom option.
- **Retry on 401**: in `onError`, trigger a token refresh; wrap call sites in a retry helper.
- **Telemetry**: start a timer in `prepareRequestInit`, report in `onSuccess` / `onError`.
- **Success toasts**: `successMessage` custom option + dynamic `fetcher.onSuccess(...)` subscriber that reads your toast library.

Keep the fetcher focused on transport-layer concerns. Stateful things (request dedup, mutation queuing) belong in a layer above.

## Client-side validation

Install `vovk-ajv` and set `outputConfig.imports.validateOnClient: 'vovk-ajv'`. The generated client validates `params` / `body` / `query` against the procedure's schema **before** the HTTP call — invalid inputs throw `HttpException(HttpStatus.NULL, ...)` locally (i.e. `statusCode === 0`, same as transport failures) instead of round-tripping.

Roll your own validator via `createValidateOnClient` from `vovk` if Ajv isn't a fit; point `imports.validateOnClient` at its module path:

```ts
// src/lib/validateOnClient.ts
import { createValidateOnClient, HttpException, HttpStatus } from 'vovk';

export const validateOnClient = createValidateOnClient({
  validate: async (input, schema, meta) => {
    // run your validator; on failure:
    // throw new HttpException(HttpStatus.NULL, 'Validation failed', { /* optional cause */ });
    return input;
  },
});
```

Skip per call:

```ts
await UserRPC.updateUser({
  params: { id: 'malformed' },
  disableClientValidation: true,
});
```

`disableClientValidation` is also useful when debugging — bypass the local pass to surface the server-side validation error verbatim. Override with a different validator per call via `validateOnClient`. Don't make either a habit in production code paths.

## Error handling

`HttpException` thrown on the server is rethrown on the client with the same `statusCode`, `message`, and `cause`:

```ts
import { HttpException } from 'vovk';

try {
  await UserRPC.getUser({ params: { id: '42' } });
} catch (e) {
  if (e instanceof HttpException) {
    console.log(e.statusCode); // 404
    console.log(e.message);    // 'User not found'
    console.log(e.cause);      // any extra context passed server-side
  }
}
```

Bare `Error` on the server → `HttpException` with status 500 on the client. Network failures (no server, DNS error) and client-side validation failures both throw `HttpException` with status 0 (`HttpStatus.NULL`) — so the same `instanceof HttpException` check covers transport, validation, and HTTP-status failures uniformly. Disambiguate by `e.statusCode`.

## Types against RPC modules

Same inference helpers as controller-side (from `vovk`):

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
import { UserRPC } from 'vovk-client';

type Body   = VovkBody<typeof UserRPC.updateUser>;
type Query  = VovkQuery<typeof UserRPC.updateUser>;
type Params = VovkParams<typeof UserRPC.updateUser>;
type In     = VovkInput<typeof UserRPC.updateUser>;
type Out    = VovkOutput<typeof UserRPC.updateUser>;
```

All of these work identically against controller methods, RPC modules, and imported mixin modules. `VovkYieldType` / `VovkReturnType` exist for cases where validation hasn't been declared on a method (they can't be used for self-references in services without triggering "implicit any" TypeScript errors).

## RPC method surface

Every generated RPC method is more than just a callable. Useful properties:

- `.withDefaults(options)` — returns a new RPC module with the given options **deeply merged** into every call. Handy for per-environment `apiRoot`, persistent `init.headers`, or a scoped fetcher.
- `.getURL({ params, query, apiRoot })` — compute the URL the call would hit, without making the request. Useful for `<a href>`, `<form action>`, or calling `fetch` directly.
- `.queryKey(key?)` — returns a globally unique React Query / TanStack Query cache key. Shape: `[segmentName, controllerPrefix, rpcModuleName, decoratorPath, httpMethod, ...key]`. The optional `key` is an array of **extra scalars** to disambiguate similar queries (typically the same values passed in `params` / `query`).
- `.apiRoot` — the baked-in `apiRoot` string.
- `.schema` (`VovkHandlerSchema`), `.controllerSchema` (`VovkControllerSchema`), `.segmentSchema` (`VovkSegmentSchema`), `.fullSchema` (`VovkSchema`) — raw schema objects. `schema.validation.body` etc. give the per-input JSON Schema; `schema.operationObject` gives the OpenAPI operation fragment; `fullSchema.meta.config` exposes the config subset emitted into the client (by default only `libs` and `rootEntry`, e.g. `fullSchema.meta.config.libs.ajv`).
- `.isRPC: true` — type guard (distinguishes RPC modules from raw controllers in tools like `deriveTools`).

```ts
const API = UserRPC.withDefaults({
  apiRoot: 'https://api.example.com/v1',
  init: { headers: { 'x-hello': 'world' } },
});
await API.getUser({ params: { id: '42' } });

const url = UserRPC.getUser.getURL({ params: { id: '42' } });
// => computed URL with params/query baked in
```

### React Query / TanStack Query

```ts
import { useQuery } from '@tanstack/react-query';

// Extra key values disambiguate per-id queries:
useQuery({
  queryKey: UserRPC.getUser.queryKey(['42']),
  queryFn: () => UserRPC.getUser({ params: { id: '42' } }),
});

// Invalidate every query for this RPC module:
queryClient.invalidateQueries({
  queryKey: UserRPC.getUser.queryKey().slice(0, 3),
});
```

JSON Lines streams pair with TanStack's `experimental_streamedQuery` — see the `jsonlines` skill.

Mutations just reference the method directly:

```ts
import { useMutation } from '@tanstack/react-query';

useMutation({ mutationFn: UserRPC.updateUser });
```

## `openapi` and `schema` payloads from the client

Composed (default JS setup — via `vovk-client` barrel):

```ts
import { openapi } from 'vovk-client/openapi';   // OpenAPI 3.x, derived from procedures + @operation metadata
import { schema }  from 'vovk-client/schema';    // Raw VovkSchema — all segments
import { schema }  from 'vovk-client';           // Same thing, re-exported from the root
```

Composed with TS template + source-tree `outDir` bypasses `vovk-client` entirely — import from the local alias instead (`'@/client/openapi'`, `'@/client/schema'`).

Segmented (one OpenAPI + schema per segment — always via local alias, `vovk-client` not involved):

```ts
import { openapi } from '@/client/admin/openapi';
import { schema }  from '@/client/admin/schema';
import { schema }  from '@/client/admin';          // Same thing, re-exported from the segment root
```

Import path follows the segmented client's `outDir` — if you changed `segmentedClient.outDir` to something else (e.g. `./sdk`), the path is `@/sdk/admin/openapi` etc.

See `openapi` skill for how the spec is built.

## Flows

**"Fetch users on page load (client component)"** — ensure the procedure has an HTTP decorator, then:
```tsx
'use client';
import { UserRPC } from 'vovk-client';
useEffect(() => { UserRPC.list().then(setUsers); }, []);
```

**"Add auth header to every RPC call"** — `createFetcher({ prepareRequestInit })`, point `outputConfig.imports.fetcher` at it. Don't hand-roll per-call.

**"My new procedure isn't on the client"** — restart `npm run dev` to re-emit `.vovk-schema/`. Still missing → check the controller is registered in `initSegment({ controllers })` and the method has an HTTP decorator.

**"Call the API from another Node process"** — pass a full URL: `UserRPC.list({ apiRoot: 'https://api.example.com/api' })`, or bake it via `UserRPC.withDefaults({ apiRoot })`.

**"Consume a JSON Lines stream"** — `using stream = await StreamRPC.xxx(...); for await (const chunk of stream) { /* ... */ }`. Full coverage in **`jsonlines` skill**.

## Gotchas

- **Import name mismatch**: `UserRPC` (the `controllers` key), not `UserControllerRPC`. Most common "I can't import my RPC module" cause.
- **Stale client**: `vovk generate` regenerates from `.vovk-schema/`, which is only refreshed by the running dev server. If the user edited a controller and then ran `vovk generate` directly, the output is stale. Fix: `npm run dev` to re-emit schemas, then regenerate.
- **No HTTP decorator = no RPC**. A procedure without `@get`/`@post`/etc. is call-via-`.fn()` only; it won't appear on the client.
- **Baked-in `apiRoot` defaults to `/api`** (`rootEntry: 'api'` with no `origin`). Works in the browser (resolves against page origin), fails outside one (Node, edge, integration tests). Pass a full URL per call, bake one in via `outputConfig.origin`, or use `withDefaults({ apiRoot })`.
- **Fetcher path changes need regeneration**. Editing the fetcher file is fine; changing its path in `outputConfig.imports.fetcher` requires `vovk generate` (or a dev-watcher restart).
- **`disableClientValidation` only skips the *client* validation pass**. Server-side validation still runs (unless the procedure disables it, which should be rare).
- **Client `meta` ≠ server `req.vovk.meta()`**. The `meta` option is serialized as an `x-meta` header and lands on the server under the `xMetaHeader` key — isolated from server-set trusted state (what `authGuard` writes via `req.vovk.meta<AuthMeta>({ user })` is untouched by the client). Treat client `meta` as advisory only; never use it for auth or authorization decisions.
