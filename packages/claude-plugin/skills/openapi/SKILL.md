---
name: openapi
description: Knowledge base for Vovk.ts OpenAPI generation — how the OpenAPI 3.x spec is derived from procedures + validation schemas, the `@operation` decorator's metadata fields (`summary`, `description`, `tags`, `x-tool`, other `OperationObject` fields), top-level `outputConfig.openAPIObject` configuration (info, servers, license, tags, security), per-segment overrides, accessing the spec from code (`vovk-client/openapi`), hosting Scalar documentation UI, and the dev-mode `_schema_` endpoint. Use whenever the user asks for "API docs", "Swagger", "OpenAPI spec", "Scalar docs", "document my API", "generate OpenAPI from my controllers", "add an info/title/servers block", "segment-specific docs", "expose OpenAPI at /api/docs", "bearer auth in the spec". Does NOT cover procedure authoring → hand off to `procedure` skill. Does NOT cover AI tool derivation via `@operation` → hand off to `tools` skill. Does NOT cover third-party OpenAPI imports → hand off to `mixins` skill.
---

# Vovk.ts OpenAPI

The OpenAPI 3.x spec is a byproduct of the code you already write. Procedures + validation schemas + `@operation` metadata → spec. No separate doc authoring.

## Scope

Covers:

- What gets mapped to what (schemas → OpenAPI fields).
- `@operation` decorator's metadata fields.
- Global OpenAPI object (`outputConfig.openAPIObject`).
- Per-segment overrides (`outputConfig.segments.<name>.openAPIObject`).
- Accessing the spec: `import { openapi } from 'vovk-client/openapi'`.
- Hosting Scalar docs.
- Dev-mode `_schema_` endpoint.

Out of scope:

- Writing procedures / schemas → **`procedure` skill**.
- `@operation.x-tool` for AI tool derivation beyond the basics → **`tools` skill**.
- Third-party OpenAPI imports → **`mixins` skill**.

## How procedures map to OpenAPI

| Procedure field | OpenAPI output |
|---|---|
| `params` schema | `parameters` with `in: 'path'` |
| `query` schema | `parameters` with `in: 'query'` |
| `body` schema | `requestBody` (content type from `contentType`, default `application/json`) |
| `output` schema | `responses.200` with `application/json` |
| `iteration` schema | `responses.200` with `application/jsonl` |
| `@operation` fields | operation-level metadata (`summary`, `description`, `tags`, etc.) |

Anything you can express in a `procedure()` call — request shape, response shape, content type — lands in the spec automatically.

## `@operation` decorator

Enriches each operation with OpenAPI metadata. Accepts any `OperationObject` field from the OpenAPI 3.1 spec.

```ts
import { operation, put, procedure } from 'vovk';
import { z } from 'zod';

@operation({
  summary: 'Update user',
  description: 'Update user profile by ID.',
  tags: ['users'],
  // plus any other OpenAPI OperationObject field:
  // deprecated, externalDocs, security, ...
})
@put('{id}')
static updateUser = procedure({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ email: z.string().email() }),
  output: z.object({ success: z.boolean() }),
}).handle(async (req) => { /* ... */ });
```

**`x-tool`** — Vovk-specific extension read by `deriveTools` (see `tools` skill). Safe to ignore here; it's tool-derivation metadata, not OpenAPI doc content.

Without `@operation`, the procedure still appears in the spec — minus summary/description. LLM tool callers and doc readers both benefit from `@operation`. Add it on any procedure that's user-facing.

## Global OpenAPI object

Top-level fields (`info`, `servers`, `license`, `tags`, `security`) configured in `vovk.config.mjs`:

```ts
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    openAPIObject: {
      info: {
        title: 'My App API',
        description: 'API for my app.',
        license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
        version: '1.0.0',
      },
      servers: [
        { url: 'https://myapp.example.com', description: 'Production' },
        { url: 'http://localhost:3000', description: 'Local' },
      ],
      tags: [
        { name: 'users', description: 'User management' },
      ],
      security: [{ bearerAuth: [] }],
    },
  },
};
export default config;
```

Put shared metadata here. Per-operation details stay on `@operation`.

## Per-segment overrides

Separate spec per segment with its own `info` / `servers`:

```ts
const config = {
  outputConfig: {
    segments: {
      admin: {
        openAPIObject: {
          info: { title: 'Admin API', version: '1.0.0' },
          servers: [{ url: 'https://admin.example.com' }],
        },
      },
    },
  },
};
```

The key (`admin`) is the `segmentName` from `initSegment` (root segment uses `""`). Each segment's spec is served and exported independently — useful when segments have different audiences (public SDK vs internal admin).

## Accessing the spec from code

### Composed client

```ts
import { openapi } from 'vovk-client/openapi';
// Full OpenAPI 3.x object merged from all segments
```

### Per-segment

```ts
import { openapi as adminOpenAPI } from 'vovk-client/admin/openapi';
import { openapi as rootOpenAPI } from 'vovk-client/root/openapi';
```

Use these exports directly — no fetch required at runtime.

## Dev-mode schema endpoint

When `NODE_ENV === 'development'` (via `next dev`), each segment exposes `_schema_`:

```
GET http://localhost:3000/api/_schema_        → root segment
GET http://localhost:3000/api/admin/_schema_  → admin segment
```

`vovk dev` polls these to rebuild `.vovk-schema/` files. Don't rely on it in production — it's dev-only by design.

## Hosting Scalar docs

Scalar renders the OpenAPI spec as interactive docs. Mount a route:

```ts
// src/app/api/docs/[[...slug]]/route.ts
import { openapi } from 'vovk-client/openapi';
import html from '@scalar/nextjs/dist/index.html?raw';

export const GET = () => {
  return new Response(
    html.replace('__SPEC_URL__', JSON.stringify({ url: '/api/_schema_' })),
    { headers: { 'Content-Type': 'text/html' } },
  );
};
```

Or: serve the `openapi` object at a stable path and point a separately hosted Scalar / Swagger UI / Redoc at it. The spec is just JSON — any OpenAPI viewer works.

## Schema artifacts

Each segment emits one JSON file to `.vovk-schema/`:

```
.vovk-schema/
  root.json
  admin.json
  foo/bar.json
  _meta.json
```

`npx vovk generate` produces these; the client, OpenAPI, and AI tool pipelines all read from them. **Commit `.vovk-schema/`** so builds are reproducible.

## Flows

### "Add title and version to my API docs"

```ts
// vovk.config.mjs
outputConfig: {
  openAPIObject: {
    info: { title: 'My API', version: '1.0.0' },
  },
}
```

Run `npx vovk generate`. Done.

### "Describe every endpoint for Scalar"

Add `@operation({ summary, description, tags })` on every procedure. Regenerate. Scalar picks it up.

### "Expose Swagger UI at /api/docs"

Mount a route that serves the HTML pointing at `/api/_schema_` (dev) or at a committed `openapi.json` (prod). Scalar snippet above.

### "Bearer auth in the spec"

```ts
openAPIObject: {
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer' },
    },
  },
  security: [{ bearerAuth: [] }],
}
```

Per-operation `security` lives on `@operation` if you want to override.

### "Admin API should have its own docs and server URL"

Per-segment override under `outputConfig.segments.admin.openAPIObject`. Import `from 'vovk-client/admin/openapi'` separately.

### "Deprecate an endpoint"

```ts
@operation({ deprecated: true })
@get('old-endpoint')
static oldThing = procedure().handle(/* ... */);
```

## Gotchas

- **`@operation` is advisory**: omitting it doesn't break the spec, but descriptions/tags go missing. LLM tool callers and doc readers both suffer.
- **`_schema_` is dev-only**. Production builds read `.vovk-schema/` artifacts — commit them.
- **Regeneration required**: after adding `@operation` or changing `vovk.config.mjs`, run `vovk generate` (or `vovk dev`).
- **`x-tool` doesn't affect OpenAPI semantics** — it's consumed only by `deriveTools`. Safe to include; OpenAPI-strict tooling may warn about unknown `x-` fields (which is the intended extension mechanism).
- **Segment key vs. path**: `outputConfig.segments.admin` matches `segmentName: 'admin'` — not the folder path and not the class name.
- **Content type is respected**: procedures with `contentType: 'multipart/form-data'` appear in the spec with the correct request-body encoding. Don't hand-patch the generated spec.
