---
name: segment
description: Knowledge base for Vovk.ts segments — the unit of backend slicing in a Vovk project. Use whenever the user talks about splitting a backend into parts, API paths, catch-all routes, `route.ts`, `initSegment`, per-segment runtime/maxDuration, static APIs (OpenAPI specs, historical datasets), static export (`output: 'export'`), `generateStaticParams`, or the `vovk new segment` CLI. Triggers on phrasings like "split my backend", "add an API slice", "make a static OpenAPI endpoint", "separate admin API", "pre-render API at build time", "I need a `/api/foo` namespace", "add a root/named/static segment". Does NOT cover procedures/handlers themselves — hand off to the `procedure` skill for anything inside a controller. Does NOT cover OpenAPI authoring beyond wiring per-segment `openAPIObject` — hand off to the `openapi` skill. Does NOT cover multi-tenant routing mechanics (subdomains, `multitenant()` proxy, per-tenant frontend pages) — hand off to the `multitenant` skill.
---

# Vovk.ts segments

A segment is a **backend slice**. It owns an API path prefix (`/api`, `/api/admin`, `/api/openapi`, etc.), a set of controllers, and its own Next.js route-handler file. Each segment compiles to an independent serverless function, so runtime settings (`runtime`, `maxDuration`, etc.) can differ per segment.

Think: "one segment = one mini-backend."

## Scope of this skill

Covers:

- What a segment is, when to create one, and how to pick between root / named / static.
- The `vovk new segment` CLI.
- `initSegment()` call shape and parameters.
- Segment priority (deepest path wins).
- Static segments: `generateStaticParams`, `controllersToStaticParams`, `staticParams` option on decorators, `output: 'export'`, `.json` endpoints.
- Per-segment config in `vovk.config.mjs` (`outputConfig.segments.<name>`).
- The `_schema_` dev endpoint (mention only — see `common` skill for details).

Out of scope (do not duplicate):

- Writing handlers / `procedure()` / validation / `.fn()` / `req.vovk` / decorators → **`procedure` skill**.
- RPC client generation, composed vs. segmented clients → **`rpc` skill**.
- OpenAPI metadata (`@operation`, Scalar) beyond segment-level `openAPIObject` → **`openapi` skill**.
- Type inference helpers and `vovk.config.mjs` global options → **`common` skill**.
- Multi-tenant routing (subdomains, `multitenant()` proxy, per-tenant frontend pages, `segmentNameOverride`) → **`multitenant` skill**. This skill only mentions the segment side in passing.

## Core concepts

### The catch-all file

Every segment is a Next.js App Router **optional catch-all** route handler:

```
src/app/api/[[...vovk]]/route.ts              ← root segment (path: /api/*)
src/app/api/foo/[[...vovk]]/route.ts          ← "foo" segment (path: /api/foo/*)
src/app/api/foo/bar/[[...vovk]]/route.ts      ← "foo/bar" segment (path: /api/foo/bar/*)
```

The slug name (`vovk`) is configurable via the `rootEntry` config option but stick with `vovk` unless the user has a reason to change it.

### `initSegment()`

Every segment's `route.ts` exports HTTP handlers produced by `initSegment()`:

```ts
// src/app/api/[[...vovk]]/route.ts
import { initSegment } from 'vovk';
import UserController from '../../../modules/user/UserController';
import PostController from '../../../modules/post/PostController';

export const maxDuration = 300; // Next.js route-handler option

const controllers = {
  UserRPC: UserController,
  PostRPC: PostController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PUT, DELETE, PATCH } = initSegment({
  controllers,
});
```

The **keys** of `controllers` (`UserRPC`, `PostRPC`) are the client-side module names — the generated client will expose `UserRPC.getUser(...)`, etc.

`initSegment` parameters:

| Param | Required | Default | Purpose |
|---|---|---|---|
| `controllers` | yes | — | Map of `RPCModuleName → ControllerClass`. |
| `segmentName` | no | `""` (root) | Identifier; must mirror the folder path for named segments (e.g., `"foo/bar"`). |
| `emitSchema` | no | `true` | Emit schema for codegen. Leave on unless you know why. |
| `exposeValidation` | no | `true` | Expose validation data to the client. Leave on for client-side validation. |
| `onError` | no | — | `(error: HttpError, request: NextRequest) => void` for logging/metrics. |

### Segment priority

The deepest matching path wins. Given `/`, `/foo`, `/foo/bar`:

- `GET /api/foo/bar/baz` → handled by `foo/bar` segment.
- `GET /api/foo/qux` → `foo` segment.
- `GET /api/something` → root segment.

When adding a new named segment, any existing root-handled paths under that prefix will stop reaching the root. Flag this to the user.

## Picking a segment shape

| Shape | When | Path |
|---|---|---|
| **Root** | The default. Most projects have exactly one. | `src/app/api/[[...vovk]]/route.ts` |
| **Named** | Isolate a slice with different runtime settings (`maxDuration`, `runtime: 'edge'`), or for multi-tenancy. | `src/app/api/<name>/[[...vovk]]/route.ts` |
| **Static** | API that can be pre-rendered at build time — OpenAPI specs, enumerated datasets, infrequently changing reference data. Works with Next `output: 'export'`. | `src/app/api/<name>/[[...vovk]]/route.ts` + `generateStaticParams` |

**When user says...**

- "split my backend", "add an admin API", "separate `/api/admin`" → **named segment**.
- "pre-render OpenAPI", "static API docs", "build-time JSON endpoint" → **static segment**.
- "new Vovk project, first route" → **root segment**.
- "different Node runtime for X" or "longer timeout for X" → **named segment** + `export const maxDuration` / `export const runtime` in its `route.ts`.
- "multi-tenant", "multitenancy", "per-tenant API", "host per subdomain", "`admin.example.com` and `customer.example.com`" → **hand off to the `multitenant` skill**. (Segments are one part of that setup; this skill only covers creating them.)

## Creating a segment (CLI)

Always use the CLI — it writes `route.ts` with the right `initSegment()` wiring, which is easy to miscopy by hand.

```bash
# Root
npx vovk new segment

# Named
npx vovk new segment <name>

# Static named
npx vovk new segment <name> --static
```

**`<name>` is a URL path segment**, not a JS identifier — lowercase or kebab-case for multi-word (`admin`, `user-portal`), slash-separated for nested paths (`foo/bar`, `admin/settings`). **Not camelCase.** If the user asks for a segment like `MyAdmin` or `user_portal`, convert to URL-safe form (`my-admin`, `user-portal`) before calling the CLI — the name becomes part of the URL (`/api/my-admin/...`) and the `segmentName` inside `initSegment({ segmentName: '...' })`. This is the opposite rule from `vovk new controller service` (module names there are camelCase — see `procedure` skill).

After the CLI runs, verify the expected `route.ts` landed at the expected path. If it didn't, surface the CLI output — don't hand-write it.

## Named segment example

```ts
// src/app/api/admin/[[...vovk]]/route.ts
import { initSegment } from 'vovk';
import AdminController from '../../../../modules/admin/AdminController';

export const runtime = 'nodejs';
export const maxDuration = 60;

const controllers = { AdminRPC: AdminController };
export type Controllers = typeof controllers;

export const { GET, POST, PUT, DELETE, PATCH } = initSegment({
  segmentName: 'admin',
  controllers,
});
```

`segmentName` MUST match the folder path. For `src/app/api/foo/bar/[[...vovk]]/route.ts`, `segmentName: 'foo/bar'`.

## Static segments

Pre-renders endpoints to JSON files at build time. Useful for APIs that don't need per-request dynamism.

### 1. `route.ts` with `generateStaticParams`

```ts
// src/app/api/openapi/[[...vovk]]/route.ts
import { initSegment, controllersToStaticParams } from 'vovk';
import HelloController from '../../../../modules/hello/HelloController';

const controllers = { HelloRPC: HelloController };
export type Controllers = typeof controllers;

export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}

export const { GET } = initSegment({
  segmentName: 'openapi',
  controllers,
});
```

If you've customized the slug (not `vovk`), pass it: `controllersToStaticParams(controllers, 'custom')`.

### 2. Endpoints must be enumerable

Every endpoint in a static segment must resolve to a finite set of URLs at build time.

**Zero-param endpoint** — just give it a `.json` suffix so static hosting serves it with the right content type:

```ts
@prefix('hello')
export default class HelloController {
  @get('greeting.json')
  static async getHello() {
    return { greeting: 'Hello world!' };
  }
}
```

**Parameterized endpoint** — enumerate via `staticParams` on the decorator:

```ts
import { z } from 'zod';
import { procedure, get, prefix, operation } from 'vovk';

@prefix('static-params')
export default class StaticParamsController {
  @operation({ summary: 'Static params' })
  @get('{section}/page{page}.json', {
    staticParams: [
      { section: 'a', page: '1' },
      { section: 'a', page: '2' },
      { section: 'b', page: '1' },
      { section: 'b', page: '2' },
    ],
  })
  static getStaticParams = procedure({
    params: z.object({
      section: z.enum(['a', 'b']),
      page: z.enum(['1', '2']),
    }),
  }).handle(async (_req, { section, page }) => {
    return { section, page };
  });
}
```

This pre-renders four JSON files at build time.

### 3. Static export (optional)

If the whole Next.js app is exported statically (`next.config.js` → `output: 'export'`), static segments work as-is. The generated RPC client still calls them the normal way:

```ts
const resp = await StaticParamsRPC.getStaticParams({
  params: { section: 'a', page: '1' },
});
```

### Rules for static segments

- No per-request state. Every response is baked at build time.
- Use `.json` suffixes on endpoint paths for correct `Content-Type` when hosted statically.
- Keep static segments dedicated to static endpoints. Mixing dynamic handlers in a static segment defeats the pre-render.

## Multi-tenant routing

One named segment per tenant, plus a Next.js proxy (`proxy.ts`) that maps subdomains to tenant segments via the `multitenant()` helper from `vovk`, lets one app serve `admin.example.com`, `customer.example.com`, `*.customer.example.com`, etc.

This skill covers only the **segment side** (use `vovk new segment <tenant>` as usual). For the proxy wiring, `overrides` shape, `segmentNameOverride` in `vovk.config.mjs`, per-tenant frontend pages, and DNS, **hand off to the `multitenant` skill**.

## Per-segment configuration

Configure individual segments in `vovk.config.mjs`:

```ts
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    segments: {
      admin: {
        openAPIObject: {
          info: {
            title: 'Admin API',
            description: 'Internal admin endpoints.',
            version: '1.0.0',
          },
        },
      },
    },
  },
};

export default config;
```

Segment-specific overrides supported: `openAPIObject`, `imports`, and other output settings. The segment name key (`admin`) matches the `segmentName` in `initSegment()`. Root segment uses key `""`.

## Schema output

Each segment emits one schema file:

```
.vovk-schema/
  root.json           ← root segment (segmentName: "")
  admin.json          ← "admin" segment
  foo/bar.json        ← "foo/bar" segment
  _meta.json
```

Commit `.vovk-schema/` to version control — it's the source of truth for codegen. Details on schema consumption belong to the `common` and `rpc` skills.

## Common flows

### "Add an admin API with a longer timeout"

1. `npx vovk new segment admin`.
2. In the generated `src/app/api/admin/[[...vovk]]/route.ts`, add `export const maxDuration = 300;` (or whatever).
3. Controllers go into `src/modules/admin/*` — creating them is the `procedure` skill's job. Hand off.

### "Pre-render my OpenAPI spec at build time"

1. `npx vovk new segment openapi --static`.
2. Create a controller in `src/modules/openapi/` with a `.json`-suffixed endpoint (see static example above). Hand off to `procedure` for the controller body.
3. The OpenAPI payload itself comes from the `openapi` skill.

### "Split `/api/public` and `/api/internal`"

Two named segments (`public`, `internal`). Flag segment priority: any pre-existing root-handled paths under those prefixes will shift.

### "Host `admin.example.com` and `customer.example.com` from one app"

Multi-tenant flow. Hand off to the **`multitenant` skill**. The segment side is `npx vovk new segment admin` + `npx vovk new segment customer`; everything else (proxy, `vovk.config.mjs` changes, frontend pages, DNS) belongs to that skill.

### "Change the API root from `/api` to `/rpc`"

That's a Next.js App Router path rename — move `src/app/api/` to `src/app/rpc/`. Vovk doesn't care which folder name you use; the `[[...vovk]]` catch-all is what matters.

## Gotchas

- **`segmentName` mismatch**: must mirror the folder path. `src/app/api/foo/bar/[[...vovk]]/route.ts` → `segmentName: 'foo/bar'`. Mismatch breaks codegen silently.
- **Don't hand-write `route.ts`**: use the CLI. The `initSegment` shape and `controllers` object wiring are easy to miscopy.
- **Static segment + dynamic handler**: the handler runs at build, not request time. If you need per-request logic, use a regular named segment.
- **`controllers` keys vs. controller names**: the key (`UserRPC`) is the client-side module name, not the controller class name. Mismatches here are the most common "why doesn't my RPC call work" bug.
- **Removing a segment**: deleting `route.ts` is not enough — also remove the folder and any `.vovk-schema/<name>.json` file, then run `vovk generate` to refresh the client.
