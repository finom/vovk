---
name: openapi
description: Vovk.ts OpenAPI generation — how the OpenAPI 3.x spec is derived from procedures + validation schemas, the `@operation` decorator family (`@operation({...})` for summary/description/tags/security/deprecated, `@operation.error(status, message)` for error responses, `@operation.tool({...})` for AI tool metadata), top-level `outputConfig.openAPIObject` configuration (info, servers, license, tags, security, components), per-segment overrides, accessing the spec from code (`vovk-client/openapi`), serving the spec JSON from a controller, and rendering it with **Scalar** (the primary / recommended docs UI — picks up the TypeScript / Python / Rust code samples that Vovk generates via `x-codeSamples`) or alternatives like Redoc / Swagger UI. Use whenever the user asks for "API docs", "Scalar docs", "Swagger", "OpenAPI spec", "document my API", "generate OpenAPI from my controllers", "add an info/title/servers block", "segment-specific docs", "expose OpenAPI at /api/docs", "bearer auth in the spec", "document possible errors", "deprecate an endpoint". Does NOT cover procedure authoring → hand off to `procedure` skill. Does NOT cover AI tool derivation via `deriveTools` → hand off to `tools` skill (though `@operation.tool` is mentioned here since it's part of the decorator family). Does NOT cover third-party OpenAPI imports → hand off to `mixins` skill.
---

# Vovk.ts OpenAPI

The OpenAPI 3.x spec is a byproduct of the code you already write. Procedures + validation schemas + `@operation` metadata → spec. No separate doc authoring.

## Scope

Covers:

- What gets mapped to what (schemas → OpenAPI fields).
- `@operation({...})` — summary, description, tags, security, deprecated, any OpenAPI 3.1 `OperationObject` field.
- `@operation.error(status, message)` — document known error responses.
- `@operation.tool({...})` — AI-tool metadata (`x-tool`). Read by `deriveTools`; full usage in the **`tools` skill**.
- Global OpenAPI object (`outputConfig.openAPIObject`).
- Per-segment overrides (`outputConfig.segments.<name>.openAPIObject`).
- Accessing the spec: `import { openapi } from 'vovk-client/openapi'`.
- Serving the spec JSON from a controller so any OpenAPI viewer (Scalar, Redoc, Swagger UI) can point at it.

Out of scope:

- Writing procedures / schemas → **`procedure` skill**.
- `deriveTools()` / `createTool()` / MCP wiring → **`tools` skill**.
- Third-party OpenAPI codegen → **`mixins` skill**.

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

## `@operation` decorator family

Three decorators, same namespace, all attached to `operation`:

| Decorator | Writes to | Purpose |
|---|---|---|
| `@operation({...})` | `operationObject` | Standard OpenAPI metadata (`summary`, `description`, `tags`, `deprecated`, `security`, …). Accepts any field from OpenAPI 3.1's `OperationObject`. |
| `@operation.error(status, message)` | `operationObject.responses[status]` | Document a known error shape. Generates a response referencing `#/components/schemas/VovkErrorResponse` with `message` pinned to a literal. |
| `@operation.tool({...})` | `operationObject['x-tool']` | AI-tool metadata read by `deriveTools` — `name`, `description`, `title`, `hidden`. See **`tools` skill** for full usage. |

### `@operation({...})`

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

Without `@operation`, the procedure still appears in the spec — minus summary/description. LLM tool callers and doc readers both benefit, so add it on every user-facing procedure.

### `@operation.error(status, message)`

Document the errors your endpoint can throw so they show up in generated docs and client type narrowing:

```ts
import { operation, post, procedure, HttpStatus, HttpException } from 'vovk';

@operation({ summary: 'Create user' })
@operation.error(HttpStatus.BAD_REQUEST, 'Email is already taken')
@operation.error(HttpStatus.BAD_REQUEST, 'Invalid email format')
@operation.error(HttpStatus.NOT_FOUND, 'Organization not found')
@post()
static createUser = procedure({
  body: z.object({ email: z.string(), orgId: z.string() }),
}).handle(async (req) => {
  const { email, orgId } = await req.json();
  if (!await orgExists(orgId)) throw new HttpException(HttpStatus.NOT_FOUND, 'Organization not found');
  if (await emailTaken(email)) throw new HttpException(HttpStatus.BAD_REQUEST, 'Email is already taken');
  // ...
});
```

Same status can be declared multiple times with different messages — they merge into an `enum` of allowed messages under that status code. Throw `HttpException(status, message)` with a message from the declared set.

### `@operation.tool({...})`

Brief shape; the **`tools` skill** covers derivation. Sets `x-tool` on the operation:

```ts
@operation.tool({
  name: 'get_user_by_id',
  title: 'Get user by ID',
  description: 'Retrieves a user by their unique ID.',
  // hidden: true to exclude from derived tools
})
@operation({ summary: 'Get user by ID' })
@get('{id}')
static getUser = /* ... */;
```

Mentioned here only because it's part of the `operation.*` namespace. Procedures without `summary` or `description` (from `@operation`) are excluded from derived tools by default — the `@operation.tool` block overrides that.

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

Import path depends on which client layout the project uses — same matrix as the generated RPC modules (see **`rpc` skill** for the full picture).

### Composed, default JS template — via the `vovk-client` barrel

```ts
import { openapi } from 'vovk-client/openapi';
// Full OpenAPI 3.x object merged from all segments
```

This is what `vovk init` scaffolds. The `vovk-client` npm package re-exports the generated `.vovk-client/openapi.js` file; nothing lands inside your source tree.

### Composed, TS template — via the source-tree `outDir` alias

If the project uses the TypeScript client template and emits into the repo (e.g. `composedClient.outDir: './src/client'`), the `vovk-client` barrel isn't involved at all. Import from whatever alias your `tsconfig` `paths` resolves that directory to:

```ts
import { openapi } from '@/client/openapi';
```

### Segmented — one spec per segment, always via local alias

When `segmentedClient.enabled: true`, each segment writes its own `openapi.(ts|js|json)` under `<segmentedClient.outDir>/<segmentName>/`. Import from the alias — the `vovk-client` barrel is never the entry point here:

```ts
import { openapi as adminOpenAPI } from '@/client/admin/openapi';
import { openapi as rootOpenAPI }  from '@/client/openapi'; // root segment lives at the outDir root
```

If `segmentedClient.outDir` is `./sdk` the path becomes `@/sdk/admin/openapi`, etc. There is **no** `vovk-client/admin/openapi` or `vovk-client/<segmentName>/openapi` — that path does not exist.

Use these exports directly — no fetch required at runtime.

## Serving the spec at runtime

The cleanest Vovk-idiomatic way is a plain controller method that returns the imported `openapi` object:

```ts
// src/modules/openapi/OpenApiController.ts
import { get, prefix, operation } from 'vovk';
import { openapi } from 'vovk-client/openapi';

@prefix('openapi')
export default class OpenApiController {
  @get()
  @operation({ summary: 'OpenAPI spec', tags: ['meta'] })
  static getOpenAPI() {
    return openapi; // return the spec as-is, not { openapi }
  }
}
```

Register it in the segment's `route.ts` like any other controller. The JSON is now reachable at `GET /api/openapi` — any docs viewer (Scalar, Redoc, Swagger UI) can point at it.

For just the raw JSON without going through a controller, a Next.js route handler works too:

```ts
// src/app/api/openapi/route.ts
import { openapi } from 'vovk-client/openapi';

export const GET = () => Response.json(openapi);
```

### Rendering it with a UI

**Scalar is the recommended renderer.** Vovk emits per-operation `x-codeSamples` (TypeScript via `vovk-client`, Python via `vovk-python`, Rust via `vovk-rust`), and Scalar renders them inline next to each endpoint — the resulting docs look like a real SDK reference, not a stripped-down Swagger page.

Install `@scalar/api-reference-react` and point it at the URL you exposed above:

```tsx
// src/app/api-docs/page.tsx
'use client';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';

export default function ApiDocs() {
  return (
    <ApiReferenceReact
      configuration={{
        url: '/api/openapi', // or '/api/openapi.json'
      }}
    />
  );
}
```

For a non-React page just drop in the `@scalar/api-reference` CDN bundle and pass the same URL — same story, different transport.

Alternatives exist but don't surface `x-codeSamples` as prominently:

- **Redoc** (`redoc-cli` or the `<RedocStandalone>` component) — does read `x-codeSamples` (it's the Redocly convention Vovk emits). Works fine.
- **Swagger UI** (`swagger-ui-react`, `spec={openapi}`) — works, but no multi-language request examples.

All three need just the spec JSON — the endpoint above is the integration point. Check the renderer's current docs for the exact prop name; those APIs change faster than Vovk does.

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

### "Expose API docs at /api/openapi"

Mount an `OpenApiController` that returns `openapi` (snippet above), then point **Scalar** at that URL — it's the recommended renderer because it surfaces Vovk's per-language code samples (TS / Python / Rust) inline. Redoc works too; Swagger UI works but skips the code-sample block.

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

### "Document the errors my endpoint throws"

Stack `@operation.error(status, message)` per error case. Keep the message string identical between the decorator and the `HttpException` you throw — the spec pins each status's `message` field to an enum of the declared values.

```ts
@operation.error(HttpStatus.NOT_FOUND, 'User not found')
@operation.error(HttpStatus.CONFLICT, 'Email already exists')
@post()
static createUser = procedure({ body: /* ... */ }).handle(async (req) => {
  // throw new HttpException(HttpStatus.NOT_FOUND, 'User not found');
});
```

### "I can't use `experimentalDecorators` — how do I set operation metadata?"

Use `decorate()` (see `procedure` skill for the full pattern):

```ts
import { decorate, post, operation, procedure, HttpStatus } from 'vovk';

static createUser = decorate(
  post(),
  operation({ summary: 'Create user', tags: ['users'] }),
  operation.error(HttpStatus.CONFLICT, 'Email already exists'),
  procedure({ body: /* ... */ })
).handle(async (req) => { /* ... */ });
```

## Gotchas

- **`@operation` is advisory**: omitting it doesn't break the spec, but descriptions/tags go missing. LLM tool callers and doc readers both suffer.
- **`@operation.error` message strings are identity-linked to `HttpException`**: the decorator pins the response's `message` to an `enum` of declared values. If your runtime throws a different message string, the docs will be accurate about the status code but wrong about the message. Keep them in sync, or parameterize via a shared constant.
- **Regeneration required**: after adding `@operation*` or changing `vovk.config.mjs`, run `vovk generate` (or `vovk dev`).
- **`x-tool` doesn't affect OpenAPI semantics** — it's consumed only by `deriveTools`. Safe to include; `x-` fields are the standard OpenAPI extension mechanism, though some strict linters still warn.
- **Segment key vs. path**: `outputConfig.segments.admin` matches `segmentName: 'admin'` — not the folder path and not the class name.
- **Content type is respected**: procedures with `contentType: 'multipart/form-data'` appear in the spec with the correct request-body encoding. Don't hand-patch the generated spec.
- **No bundled docs UI**: Vovk exports the JSON; wiring the renderer is on you. **Scalar is the recommended pick** — it renders the per-language code samples Vovk emits, so endpoints show up with ready-to-copy TS / Python / Rust calls. Swagger UI / Redoc work fine but drop that part. That separation is deliberate; docs UIs evolve on their own release cadence.
