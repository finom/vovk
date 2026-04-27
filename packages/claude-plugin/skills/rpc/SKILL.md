---
name: rpc
description: Vovk.ts RPC client — how `vovk generate` turns controllers into type-safe client modules, composed `vovk-client` vs segmented clients, call shape (`apiRoot`, `params`, `body`, `query`, `meta`, `init`, `disableClientValidation`, `validateOnClient`, `interpretAs`, `transform`, `fetcher`), customizing generation via `outputConfig.imports.fetcher` + `createFetcher` (auth headers, retries, tracing, dynamic `onSuccess` / `onError` subscribers), configuring clients in `vovk.config.mjs` (`composedClient` / `segmentedClient`), error rethrow (`HttpException`, `HttpStatus.NULL`), `VovkInput`/`VovkOutput` against RPC modules, React Query integration (`queryKey`, `streamedQuery`), RPC method surface (`.withDefaults`, `.getURL`, `.queryKey`, `.schema`, `.isRPC`). Use whenever user asks to call API from browser / mobile / other server ("fetch users from the client", "call the API from Next.js client component", "typed API client", "why is my RPC call failing", "add auth token to every request", "custom headers on RPC calls", "retry on 401", "why is the client stale"), regenerate client (`vovk generate`), choose between composed vs segmented clients, or wire up `vovk-client` imports. Does NOT cover writing procedures / handlers → hand off to `procedure` skill. Does NOT cover segment registration / `initSegment` → hand off to `segment` skill. Does NOT cover JSON Lines streaming clients → hand off to `jsonlines` skill.
---

# Vovk.ts RPC client

Every controller procedure with HTTP decorator automatically gets typed client counterpart. `vovk generate` produces these client modules from segment schemas. Import path depends on config:

- **Default setup only** (composed client + JS template + default `outDir: './node_modules/.vovk-client'`) → `vovk-client` npm package barrel re-exports emitted `.js` / `.d.ts`. Import from `'vovk-client'`.
- **Any other config** — TS template, segmented client, custom source-tree `outDir` — `vovk-client` package *not* used. Generated files live in source tree, import through local path alias (e.g. `'@/client'`, `'@/client/<segment>'`).

**Key identity**: client module name = **key** used in `initSegment`'s `controllers` map, regardless of import path.

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

- `vovk generate` — when to run, what it produces.
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

## Generating client

```bash
npx vovk generate
```

What it does:

- Reads `.vovk-schema/**/*.json` for every segment (nested segments live in subdirectories, e.g. `.vovk-schema/customer/static.json`).
- Emits generated code into configured `outDir` using selected `fromTemplates` preset.
- Default composed setup — `fromTemplates: ['js']` + `outDir: './node_modules/.vovk-client'` — emits `.js` / `.d.ts` files; `vovk-client` npm package re-exports via `export * from '../.vovk-client/index.js'`. **Only** config where you import from `'vovk-client'`.
- Alternate (recommended for pnpm) — `fromTemplates: ['ts']` + `outDir: './src/client'` — emits `.ts` files directly into source tree. `vovk-client` package not used; users import from local alias like `'@/client'`, own tsc handles files.
- Segmented client (any template) — always vendors per-segment modules into source tree (default `./src/client/<segment>`). `vovk-client` not used regardless of template.

See "Import path depends on template + outDir" below for why these pair up.

**`vovk generate` does NOT rebuild schemas from controller source.** Schema emission = separate step: `vovk dev` runs alongside Next.js dev server, hits each segment's `_schema_` endpoint (only available when `NODE_ENV === 'development'`), writes JSON into `.vovk-schema/`. `vovk generate` reads whatever's there.

Consequence: if backend changed and client looks stale, running `vovk generate` alone isn't enough — `.vovk-schema/` hasn't been refreshed. Run `npm run dev` (starts `vovk dev` alongside `next dev` via `concurrently`) to re-emit schemas, then client regenerates from them.

When to run:

- **Automatic**: `prebuild` script installed by `vovk init` runs `vovk generate` before `next build`. During `npm run dev`, dev watcher refreshes `.vovk-schema/` on backend changes, client regenerates.
- **Explicit**: before integration tests, after checking out branch, if client method appears missing ("compiled fine, why is `UserRPC.createUser` undefined?"). If method just written is missing, schema probably stale — restart `npm run dev` rather than re-running `vovk generate`.

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

Return type = `Promise` of whatever procedure's `output` schema resolves to, or whatever `transform` returns if present. Override per call:

```ts
const user = await UserRPC.updateUser<SomeType>({ /* ... */ });
```

### Body by content type

`body`'s accepted type narrows to procedure's `contentType`: `FormData` for `multipart/form-data`, `URLSearchParams` or `FormData` for `application/x-www-form-urlencoded`, `File` / `Blob` / `ArrayBuffer` / `Uint8Array` for binary (`image/*`, `video/*`, `*/*`). Schema-typed objects always accepted. Full matrix → **`procedure`** skill.

```ts
const form = new FormData();
form.append('file', file);
await UserRPC.uploadAvatar({ body: form }); // multipart/form-data procedure
```

Never hand-set `Content-Type` — fetcher derives it (multipart boundary included). Manual headers = usual HTTP 415 trigger.

### `apiRoot`

`apiRoot` **baked in at generation time**: defaults to `/${rootEntry}` (`rootEntry` defaults to `'api'`, so default baked-in value = `/api`). When `outputConfig.origin` is set, bake produces full URL like `http://localhost:3000/api`. Per-call `apiRoot` fully replaces baked-in value for that call — config-level changes still require `vovk generate`.

In browser, relative `/api` resolves against page origin, so same call works from `/dashboard` and `/settings`. On server (Node, edge, integration tests) relative URLs don't resolve — pass full URL per call, bake one in via `outputConfig.origin`, or use `withDefaults({ apiRoot })`.

### `init`

`RequestInit` forwarded to `fetch` — `headers`, `credentials`, `mode`, `cache`, Next.js-specific `next: { revalidate: number }` all pass through.

### `transform`

Receives parsed response data and original `Response`. Return anything — including tuple if you want `Response` exposed to caller:

```ts
const [user, response] = await UserRPC.updateUser({
  /* ... */
  transform: (data, response) => [data, response] as const,
});
response satisfies Response;
```

### `interpretAs`

Forces fetcher's content-type dispatch. Useful when server returns JSON Lines but omits `content-type: application/jsonl` (common behind some proxies or when streaming through Next.js): `interpretAs: 'application/jsonl'` makes client treat response as async iterable anyway.

## Composed vs segmented client

Two top-level config keys — `composedClient` and `segmentedClient` — = **independent toggles**; enable one, the other, or both. Defaults differ because they target different workflows:

| Key               | Default `enabled` | Default `fromTemplates` | Default `outDir`                         | Default import            |
|-------------------|-------------------|--------------------------|-------------------------------------------|---------------------------|
| `composedClient`  | `true`            | `['js']`                 | `./node_modules/.vovk-client`             | `'vovk-client'`           |
| `segmentedClient` | `false`           | `['ts']`                 | `./src/client` (or `./client` if no `src`) | `'@/client/<segment>'`    |

Only composed client's *default* wires up `vovk-client` npm barrel (re-exports `.js`/`.d.ts` from `node_modules/.vovk-client`). Deviating from that exact combo — switching composed to TS template, source-tree `outDir`, or enabling segmented — bypasses `vovk-client` entirely; import from local alias.

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

Both keys can carry nested `outputConfig` overriding top-level for that specific output (e.g. segmented SDKs with different OpenAPI block).

**Composed** — one client module re-exports every RPC across every segment. Default case for most projects: `import { UserRPC, PostRPC } from 'vovk-client'`. With source-tree `outDir` (TS template), import from `'@/client'`.

**Segmented** — per-segment entries; importing `@/client/admin` keeps other segments out of bundle. Useful when segment boundaries map to independent deploys, versioning, or SDK consumers.

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

Composed's import path follows from `fromTemplates` × `outDir`. `vovk-client`'s barrel = `export * from '../.vovk-client/index.js'` — only resolves `.js`/`.d.ts` at default location.

| `fromTemplates` | `outDir`                                  | Import from               | Notes |
|-----------------|-------------------------------------------|---------------------------|-------|
| `['js']`        | `./node_modules/.vovk-client` (default)   | `'vovk-client'`           | Default — only combo that actually uses `vovk-client`. |
| `['ts']`        | source tree (e.g. `./src/client`)          | `'@/client'`              | Recommended for pnpm; your tsc handles `.ts` directly. |
| `['js']`        | custom source-tree path                    | local path                | Valid but unusual. |
| `['ts']`        | default `node_modules/.vovk-client`        | broken                    | Barrel can't find `.js` to re-export. |

Segmented has no equivalent table — always vendors per-segment modules into configured `outDir`; always import from local alias.

**Why switch to TS template / source-tree `outDir`?**
- **pnpm** — strict non-hoisted `node_modules` breaks `vovk-client` → `.vovk-client` sibling hop.
- **Commit client** — review, CI reproducibility, offline builds.
- **TS integration** — source maps, go-to-definition, type narrowing align with project's `tsconfig`.

Step-by-step setup → **`init` skill**.

## Fetcher

Fetcher = client's core primitive — function (`VovkFetcher<TFetcherOptions>`) that takes request metadata (endpoint, method, schema, validator) and dispatches actual `fetch`. Default (`import { fetcher } from 'vovk/fetcher'`) already handles JSON and JSON Lines, runs client-side validation, injects `x-meta` header, rethrows `HttpException` on errors.

Response-shape dispatch by content type:

- `application/json` → parsed JSON (typed as procedure's output schema).
- `application/jsonl` / `application/jsonlines` → disposable async iterable (see `jsonlines` skill).
- Other content types → raw `Response` object — caller reads text, binary, or streams it.

You **extend** default rather than rewriting via `createFetcher`:

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

With that fetcher installed, callers get custom options inline:

```ts
await UserRPC.updateUser({
  params: { id: '42' },
  body: { /* ... */ },
  useAuth: true,
  successMessage: 'Updated!',
});
```

### Hooks

All optional; `options` = typed `TOptions` you declared.

- `prepareRequestInit(init, options) => RequestInit` — mutate `RequestInit` before `fetch` (headers, credentials, mode, cache, `next.revalidate`).
- `transformResponse(data, options, info)` — transform parsed response; `info = { response, init, schema }` gives access to raw `Response`, final `RequestInit`, procedure's `VovkHandlerSchema` (useful for reading `operationObject`).
- `onSuccess(data, options)` — observe successful responses (toasts, analytics).
- `onError(error: HttpException, options)` — observe failures. Both network errors and HTTP-status errors land here; `error.statusCode === 0` (`HttpStatus.NULL`) = either transport failure or client-side validation rejection.

### Event-style subscribers (dynamic)

`onSuccess` and `onError` can also be attached **after** fetcher is created. Useful when callback depends on state not available at creation time (React context value, Zustand store reference, lazily loaded logger). Each registration returns unsubscribe function; multiple subscribers run in order on every call:

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

Prefer this pattern over baking toasts / store writes into `createFetcher` when dependency graph would otherwise force you to import UI-layer modules from transport layer.

### Point config at fetcher

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

Generated client imports `fetcher` from that path. After editing config manually, run `vovk generate`.

**Per-segment fetcher**: different segments can use different fetchers (e.g., admin segment needs different auth than public one):

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

- **Auth token**: inject `Authorization` header in `prepareRequestInit`, gated on `useAuth` custom option.
- **Retry on 401**: in `onError`, trigger token refresh; wrap call sites in retry helper.
- **Telemetry**: start timer in `prepareRequestInit`, report in `onSuccess` / `onError`.
- **Success toasts**: `successMessage` custom option + dynamic `fetcher.onSuccess(...)` subscriber that reads your toast library.

Keep fetcher focused on transport-layer concerns. Stateful things (request dedup, mutation queuing) belong in layer above.

## Client-side validation

Install `vovk-ajv`, set `outputConfig.imports.validateOnClient: 'vovk-ajv'`. Generated client validates `params` / `body` / `query` against procedure's schema **before** HTTP call — invalid inputs throw `HttpException(HttpStatus.NULL, ...)` locally (i.e. `statusCode === 0`, same as transport failures) instead of round-tripping.

Roll your own validator via `createValidateOnClient` from `vovk` if Ajv isn't fit; point `imports.validateOnClient` at its module path:

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

`disableClientValidation` also useful when debugging — bypass local pass to surface server-side validation error verbatim. Override with different validator per call via `validateOnClient`. Neither should be habit in production code paths.

## Error handling

`HttpException` thrown on server rethrown on client with same `statusCode`, `message`, `cause`:

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

Bare `Error` on server → `HttpException` with status 500 on client. Network failures (no server, DNS error) and client-side validation failures both throw `HttpException` with status 0 (`HttpStatus.NULL`) — same `instanceof HttpException` check covers transport, validation, HTTP-status failures uniformly. Disambiguate by `e.statusCode`.

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

All work identically against controller methods, RPC modules, imported mixin modules. `VovkYieldType` / `VovkReturnType` exist for cases where validation hasn't been declared on method (can't be used for self-references in services without triggering "implicit any" TypeScript errors).

## RPC method surface

Every generated RPC method = more than just callable. Useful properties:

- `.withDefaults(options)` — returns new RPC module with given options **deeply merged** into every call. Handy for per-environment `apiRoot`, persistent `init.headers`, scoped fetcher.
- `.getURL({ params, query, apiRoot })` — compute URL call would hit, without making request. Useful for `<a href>`, `<form action>`, or calling `fetch` directly.
- `.queryKey(key?)` — returns globally unique React Query / TanStack Query cache key. Shape: `[segmentName, controllerPrefix, rpcModuleName, decoratorPath, httpMethod, ...key]`. Optional `key` = array of **extra scalars** to disambiguate similar queries (typically same values passed in `params` / `query`).
- `.apiRoot` — baked-in `apiRoot` string.
- `.schema` (`VovkHandlerSchema`), `.controllerSchema` (`VovkControllerSchema`), `.segmentSchema` (`VovkSegmentSchema`), `.fullSchema` (`VovkSchema`) — raw schema objects. `schema.validation.body` etc. give per-input JSON Schema; `schema.operationObject` gives OpenAPI operation fragment; `fullSchema.meta.config` exposes config subset emitted into client (by default only `libs` and `rootEntry`, e.g. `fullSchema.meta.config.libs.ajv`).
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

JSON Lines streams pair with TanStack's `experimental_streamedQuery` → see `jsonlines` skill.

Mutations reference method directly:

```ts
import { useMutation } from '@tanstack/react-query';

useMutation({ mutationFn: UserRPC.updateUser });
```

## `openapi` and `schema` payloads from client

Composed (default JS setup — via `vovk-client` barrel):

```ts
import { openapi } from 'vovk-client/openapi';   // OpenAPI 3.x, derived from procedures + @operation metadata
import { schema }  from 'vovk-client/schema';    // Raw VovkSchema — all segments
import { schema }  from 'vovk-client';           // Same thing, re-exported from the root
```

Composed with TS template + source-tree `outDir` bypasses `vovk-client` entirely — import from local alias (`'@/client/openapi'`, `'@/client/schema'`).

Segmented (one OpenAPI + schema per segment — always via local alias, `vovk-client` not involved):

```ts
import { openapi } from '@/client/admin/openapi';
import { schema }  from '@/client/admin/schema';
import { schema }  from '@/client/admin';          // Same thing, re-exported from the segment root
```

Import path follows segmented client's `outDir` — if you changed `segmentedClient.outDir` to something else (e.g. `./sdk`), path = `@/sdk/admin/openapi` etc.

See `openapi` skill for how spec is built.

## Flows

**"Fetch users on page load (client component)"** — ensure procedure has HTTP decorator, then:
```tsx
'use client';
import { UserRPC } from 'vovk-client';
useEffect(() => { UserRPC.list().then(setUsers); }, []);
```

**"Add auth header to every RPC call"** — `createFetcher({ prepareRequestInit })`, point `outputConfig.imports.fetcher` at it. Don't hand-roll per-call.

**"My new procedure isn't on client"** — restart `npm run dev` to re-emit `.vovk-schema/`. Still missing → check controller is registered in `initSegment({ controllers })` and method has HTTP decorator.

**"Call API from another Node process"** — pass full URL: `UserRPC.list({ apiRoot: 'https://api.example.com/api' })`, or bake via `UserRPC.withDefaults({ apiRoot })`.

**"Consume JSON Lines stream"** — `using stream = await StreamRPC.xxx(...); for await (const chunk of stream) { /* ... */ }`. Full coverage → **`jsonlines` skill**.

## Gotchas

- **Import name mismatch**: `UserRPC` (the `controllers` key), not `UserControllerRPC`. Most common "I can't import my RPC module" cause.
- **Stale client**: `vovk generate` regenerates from `.vovk-schema/`, only refreshed by running dev server. If user edited controller and ran `vovk generate` directly, output stale. Fix: `npm run dev` to re-emit schemas, then regenerate.
- **No HTTP decorator = no RPC**. Procedure without `@get`/`@post`/etc. is call-via-`.fn()` only; won't appear on client.
- **Baked-in `apiRoot` defaults to `/api`** (`rootEntry: 'api'` with no `origin`). Works in browser (resolves against page origin), fails outside (Node, edge, integration tests). Pass full URL per call, bake one in via `outputConfig.origin`, or use `withDefaults({ apiRoot })`.
- **Fetcher path changes need regeneration**. Editing fetcher file fine; changing its path in `outputConfig.imports.fetcher` requires `vovk generate` (or dev-watcher restart).
- **`disableClientValidation` only skips *client* validation pass**. Server-side validation still runs (unless procedure disables it, which should be rare).
- **Client `meta` ≠ server `req.vovk.meta()`**. `meta` option serialized as `x-meta` header and lands on server under `xMetaHeader` key — isolated from server-set trusted state (what `authGuard` writes via `req.vovk.meta<AuthMeta>({ user })` is untouched by client). Treat client `meta` as advisory only; never use for auth or authorization decisions.
