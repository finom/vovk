---
name: rpc
description: Knowledge base for the Vovk.ts RPC client — how `vovk generate` turns controllers into type-safe client modules, the composed `vovk-client` vs segmented clients, the call shape (`apiRoot`, `params`, `body`, `query`, `meta`, `disableClientValidation`), customizing `fetch` via `customFetcher`, configuring generation in `vovk.config.mjs`, error rethrow (`HttpException`), and `VovkInput`/`VovkOutput` against RPC modules. Use whenever the user asks to call the API from a browser / mobile / other server ("fetch users from the client", "call the API from Next.js client component", "typed API client", "why is my RPC call failing", "add auth token to every request", "custom headers on RPC calls", "retry on 401", "why is the client stale"), regenerate the client (`vovk generate`), choose between composed vs segmented clients, or wire up `vovk-client` imports. Does NOT cover writing procedures / handlers → hand off to `procedure` skill. Does NOT cover segment registration / `initSegment` → hand off to `segment` skill. Does NOT cover JSON Lines streaming clients → hand off to `jsonlines` skill.
---

# Vovk.ts RPC client

Every controller procedure with an HTTP decorator automatically gets a typed client counterpart. `vovk generate` produces these client modules from the segment schemas; the `vovk-client` package re-exports them for consumption from application code.

**Key identity**: the client module name = the **key** used in `initSegment`'s `controllers` map.

```ts
// server
initSegment({ controllers: { UserRPC: UserController } });

// client
import { UserRPC } from 'vovk-client';
await UserRPC.getUser({ params: { id: '42' } });
```

Not `UserControllerRPC`. Not `UserController`. Whatever the key is.

## Scope

Covers:

- `vovk generate` — when to run it, what it produces.
- Composed client (`vovk-client`) vs segmented clients.
- RPC method call shape.
- Custom fetcher via `vovk.config.mjs`.
- Client-side validation (`vovk-ajv` integration with the client).
- Error rethrow (`HttpException`, status/message/cause).
- `clientOutDir`, `imports`, and other relevant `outputConfig` keys.

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

- Reads `.vovk-schema/*.json` for every segment.
- Emits generated code into `node_modules/.vovk-client/` (default).
- The `vovk-client` package re-exports from there.

When to run:

- **Automatic**: the `prebuild` script installed by `vovk init` runs `vovk generate` before `next build`. If the user runs `vovk dev`, the dev watcher regenerates on schema changes too.
- **Explicit**: before integration tests, after checking out a branch, if a client method appears missing ("it compiled fine, why is `UserRPC.createUser` undefined?" — regenerate).

## Call shape

Same signature across every RPC method:

```ts
await ModuleRPC.methodName({
  apiRoot?: string,                 // e.g. 'http://localhost:3000/api' (server-side)
  params?: { ... },                 // path params — typed to procedure schema
  query?: { ... },                  // query string — typed
  body?: { ... } | FormData | ...,  // body shape depends on contentType
  meta?: { ... },                   // sent via x-meta header
  disableClientValidation?: boolean,
});
```

`apiRoot` is optional in the browser (the client infers from `window.location`). On the server (Node, edge, tests), pass it explicitly.

## Composed vs segmented client

### Composed (default)

One package — `vovk-client` — exports every RPC module across every segment:

```ts
import { UserRPC, PostRPC, AdminRPC } from 'vovk-client';
```

Use when: most projects.

### Segmented

Per-segment client generation for modular architectures (independent deploys, per-segment versioning). Enable via `vovk.config.mjs` segment config. Each segment gets its own client module; import paths reflect the segment.

Use when: the user has clear segment boundaries and wants to ship each client independently (e.g., a public SDK for the `public` segment, an internal SDK for `admin`).

## Custom fetcher

Inject a wrapper around `fetch` — auth tokens, logging, retries, tracing.

```ts
// vovk.config.mjs
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      customFetcher: './src/lib/customFetcher.ts',
    },
  },
};
export default config;
```

```ts
// src/lib/customFetcher.ts
export async function customFetcher(
  url: string,
  options: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${getToken()}`,
    },
  });
}
```

The generated client imports `customFetcher` automatically. Regenerate (`vovk generate`) after adding or changing the config path.

**Common patterns:**

- **Auth token**: inject `Authorization` header.
- **Retry on 401**: catch, refresh, retry once.
- **Telemetry**: wrap with timing / logging.
- **Base URL override**: compute `url` prefix.

Keep the fetcher small — anything fancy (request dedup, mutation queueing) probably belongs in a separate layer above the RPC client.

## Configuration (`vovk.config.mjs`)

Client-generation-relevant keys:

```ts
const config = {
  outputConfig: {
    clientOutDir: 'node_modules/.vovk-client',  // default; change if vendoring

    imports: {
      validateOnClient: 'vovk-ajv',             // enables client-side validation
      customFetcher: './src/lib/fetch.ts',      // optional
    },

    segments: {                                 // per-segment overrides
      admin: {
        // segment-specific output settings
      },
    },
  },
};
```

See `common` skill for the full config overview; `openapi` skill for `openAPIObject`.

## Client-side validation

Install `vovk-ajv` (or `vovk-zod` for pure Zod projects) and set `imports.validateOnClient`. The generated client validates `params` / `body` / `query` against the procedure's schema **before** the HTTP call — so invalid inputs fail locally instead of round-tripping.

Skip per call:

```ts
await UserRPC.updateUser({
  params: { id: 'malformed' },
  disableClientValidation: true,
});
```

Use sparingly — bypassing client validation is fine when you know the shape is valid (e.g., forwarding pre-validated data) but don't make it a habit.

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

Bare `Error` on the server → `HttpException` with status 500 on the client. Network failures (no server) throw a fetch error, not an `HttpException` — guard accordingly if you care.

## Types against RPC modules

Same inference helpers as controller-side (from `vovk`):

```ts
import type { VovkInput, VovkOutput } from 'vovk';
import { UserRPC } from 'vovk-client';

type In  = VovkInput<typeof UserRPC.updateUser>;   // { params, query, body }
type Out = VovkOutput<typeof UserRPC.updateUser>;
```

Use these when shaping client-side form state, query hooks, or wrapper utilities around RPC calls.

## OpenAPI payload from the client

```ts
import { openapi } from 'vovk-client/openapi';
// Full OpenAPI 3.x object, derived from procedures + @operation metadata
```

See `openapi` skill for how the spec is built.

## Flows

### "Fetch users on page load (client component)"

1. Ensure `UserController.list` has an HTTP decorator. If not → `procedure` skill.
2. Import from `vovk-client`:
   ```ts
   'use client';
   import { UserRPC } from 'vovk-client';
   import { useEffect, useState } from 'react';

   export function UserList() {
     const [users, setUsers] = useState([]);
     useEffect(() => {
       UserRPC.list({}).then(setUsers);
     }, []);
     return <ul>{users.map(u => <li key={u.id}>{u.email}</li>)}</ul>;
   }
   ```

### "Add auth header to every RPC call"

Wire a `customFetcher` (see above). Don't hand-roll it in every call site.

### "My new procedure isn't on the client"

Run `npx vovk generate`. If it still isn't there: check the controller is registered in the segment's `initSegment({ controllers: { ... } })` map, and the method has an HTTP decorator.

### "Call the API from another Node process"

Same import, explicit `apiRoot`:

```ts
import { UserRPC } from 'vovk-client';
await UserRPC.list({ apiRoot: 'https://api.example.com/api' });
```

### "Retry on 401"

Catch and re-invoke in `customFetcher`:

```ts
export async function customFetcher(url, options) {
  let res = await fetch(url, attach(options));
  if (res.status === 401) {
    await refreshToken();
    res = await fetch(url, attach(options));
  }
  return res;
}
```

## Gotchas

- **Import name mismatch**: `UserRPC` (the `controllers` key), not `UserControllerRPC`. Most common "I can't import my RPC module" cause.
- **Stale client**: `vovk generate` regenerates from `.vovk-schema/`. If `.vovk-schema/` is stale, so is the client. Run the dev watcher or regenerate explicitly.
- **No HTTP decorator = no RPC**. A procedure without `@get`/`@post`/etc. is call-via-`.fn()` only; it won't appear on the client.
- **`apiRoot` required on the server** — the client can't infer it outside a browser.
- **`customFetcher` path changes need regeneration**. Editing the fetcher file is fine; changing its path in config requires `vovk generate`.
- **`disableClientValidation` only skips the *client* validation pass**. Server-side validation still runs (unless the procedure disables it, which should be rare).
