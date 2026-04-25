---
name: mixins
description: Vovk.ts OpenAPI mixins — importing third-party OpenAPI 3.x schemas as typed client modules that share the same call signature as native Vovk RPC modules. Use whenever the user asks to "call a third-party API from my Vovk app", "mixin an OpenAPI schema", "import an OpenAPI spec as a client", "wrap an external service that only ships an OpenAPI doc", or mentions `openAPIMixin`, `getModuleName`, `getMethodName`, `withDefaults` on a generated API module, or the `Mixins` namespace. Also use to push back when the user reaches for mixins for a vendor with a great official SDK (Stripe, AWS, GitHub via Octokit) — the skill explains when the official client is the better choice. Covers remote/local/inline specs, module + method naming strategies, `apiRoot`, per-mixin fetcher, AJV client validation knobs, and composed/segmented clients. **`deriveTools` does NOT work with mixins** — the mixin runtime module lacks the per-handler metadata `deriveTools` reads, so for "expose this third-party API as an LLM tool" wrap the mixin call in `createTool({...})` instead (see `tools` skill).
---

# Vovk.ts OpenAPI mixins

Mixins turn any OpenAPI 3.x spec into a typed client module that behaves exactly like a native Vovk RPC module — same `{ params, query, body }` call shape, same client surface, same type-inference helpers (`VovkBody`, `VovkOutput`, …). You can even run mixins standalone (no Next.js) as a pure codegen tool.

**One caveat that's not obvious from the call shape:** mixin modules are produced by `createRPC` and only carry client-side metadata (`schema`, `getURL`, `queryKey`, etc.). They do **not** carry the per-handler `definition` field that `deriveTools` reads to build `inputSchemas` (verified in `packages/vovk/src/client/createRPC.ts:178-193` vs `packages/vovk/src/tools/deriveTools.ts:113-115` — `definition` is set only by `procedure({...}).handle(...)` in `packages/vovk/src/validation/withValidationLibrary.ts:281`). So mixins **cannot be passed directly to `deriveTools`**. For LLM tool exposure, hand-write a `createTool({...})` wrapper around the mixin call — see the `tools` skill.

## Prefer the official SDK when one exists

**Recommend the official client library first.** Hand-maintained SDKs like `stripe`, `@octokit/rest`, `@aws-sdk/*`, `@google-cloud/*` ship with auth flows, retries, pagination helpers, webhook signature verification, and edge-case handling that a generated client can't match — and they track upstream API changes faster than any spec snapshot. If the vendor publishes an official SDK, use it.

Mixins are the right tool when:

- **No official SDK exists** — internal services, niche vendors, legacy APIs that only publish an OpenAPI document.
- **LLM tool exposure** — mixins give you a typed call surface to wrap inside `createTool({...})` for MCP / OpenAI / Anthropic tool exposure. (Direct `deriveTools` doesn't work for mixins — see the caveat at the top.) For GitHub-style APIs `@octokit/rest` is still the better tool body, but a mixin remains useful when the third-party API has no official SDK.
- **Spec-as-source-of-truth** — internal microservices where the OpenAPI doc is generated and you want client drift to surface as a TypeScript error at build time.

For everything else (Stripe charges, S3 uploads, Octokit pagination), reach for the official package.

## Scope

Covers:

- Declaring mixins under `outputConfig.segments.<name>.openAPIMixin`.
- `source` variants: remote URL (with fallback), local file, inline object.
- `getModuleName` / `getMethodName` — preset strategies and function form.
- `apiRoot` and authorization via `withDefaults`.
- Per-mixin fetcher + AJV strict-mode loosening for messy specs.
- The `Mixins` namespace for `components/schemas` types.
- Composed vs segmented output (pointer to **`rpc`** skill).
- Wrapping mixin calls in `createTool({...})` for LLM tool exposure (pointer to **`tools`** skill — mixins are NOT directly compatible with `deriveTools`).

Out of scope:

- Authoring your own procedures → **`procedure`** skill.
- RPC client call shape, `customFetcher`, per-call `init` → **`rpc`** skill.
- AI tool derivation details → **`tools`** skill.
- Writing OpenAPI specs by hand — this skill consumes them.

## Declaring a mixin

A mixin is declared as a **pseudo-segment** under `outputConfig.segments.<name>.openAPIMixin`. The key (`petstore` below) becomes the segment folder name in segmented-client mode. The generated module name comes from `getModuleName` (default `'api'`), not from the segment key.

```ts filename="vovk.config.js"
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv', // optional client-side validation
    },
    segments: {
      petstore: {
        openAPIMixin: {
          source: {
            url: 'https://petstore3.swagger.io/api/v3/openapi.json',
            fallback: './.openapi-cache/petstore.json',
          },
          getModuleName: 'PetstoreAPI',
          getMethodName: 'auto',
          apiRoot: 'https://petstore3.swagger.io/api/v3',
        },
      },
    },
  },
};
export default config;
```

Run `npx vovk generate` (or keep `vovk dev` running) and the mixin is emitted alongside native RPC modules.

```ts
import { PetstoreAPI } from 'vovk-client';

const pets = await PetstoreAPI.getPets({ query: { limit: 10 } });
```

> **Import path depends on client layout.** Code samples throughout this skill import from `'vovk-client'` — the default for the **composed client + `js` template**, re-exported from `node_modules/.vovk-client`. If the project emits the composed client into the source tree via the `ts` template (`composedClient.outDir`), import from that path instead — e.g. `@/client`. If the project uses the **segmented client**, each mixin lives in its own folder named after the pseudo-segment key — e.g. `@/client/petstore`. The call shape and types are identical across all three. See the **`rpc`** skill for the full comparison.

## Source variants

`source` is an object — pick exactly one shape.

**`{ url, fallback? }`** — fetched at generate time. The optional `fallback` path caches the last-seen spec locally; if the remote URL is unreachable on the next generate, Vovk reads the fallback. Commit the fallback to keep CI green when the upstream spec host is down.

```ts
source: {
  url: 'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json',
  fallback: './.openapi-cache/github.json',
}
```

**`{ file }`** — local spec checked into the repo. Both JSON and YAML are accepted (Vovk sniffs by the leading character: `{` / `[` → JSON, else YAML).

```ts
source: { file: './openapi/internal.yaml' }
```

**`{ object }`** — inline JS value. Useful when the spec is built or transformed by another tool in the same project.

```ts
import spec from './openapi/internal.json' with { type: 'json' };
// ...
openAPIMixin: { source: { object: spec }, ... }
```

## Module and method naming

`getModuleName` controls the JS name of the generated module; `getMethodName` controls each method. Both accept a preset string or a function.

**Preset strings — `getModuleName`:**

| Value | Effect |
|---|---|
| `'api'` *(default)* | Every operation goes into a single `api` module. |
| any other literal (e.g. `'PetstoreAPI'`) | Hard-coded single module name — useful for small third-party APIs. |

**Preset strings — `getMethodName`:**

| Value | Effect |
|---|---|
| `'camel-case-operation-id'` | Always camelCase the `operationId`. Throws if `operationId` is missing. Use only when every operation has one. |
| `'auto'` *(default)* | One mode that handles all cases: pass `operationId` through if it's already camelCase, camelCase it if it's snake_case, otherwise synthesize from `METHOD + path`. Safe for messy specs. |

`'auto'` is itself the auto-detecting mode — there's no separate layer that picks between the two presets. Reach for `'camel-case-operation-id'` only when you want the throw-on-missing behavior; otherwise leave the default. For anything more structured (splitting operations across multiple modules, custom prefixes), use a function — see below.

**Function form** — receives `{ operationObject, method, path, openAPIObject }` and returns the string. Use this when operation IDs are structured and you want to split them into multiple modules. The GitHub REST API is the canonical example for illustrating the technique (`issues/list-for-org` → `GithubIssuesAPI.listForOrg`) — though for actual GitHub work, prefer `@octokit/rest` over a mixin:

```ts filename="vovk.config.js"
import camelCase from 'lodash/camelCase.js';
import startCase from 'lodash/startCase.js';

openAPIMixin: {
  source: { url: '...', fallback: '...' },
  getModuleName: ({ operationObject }) => {
    const [ns] = operationObject.operationId?.split('/') ?? ['unknown'];
    return `Github${startCase(camelCase(ns)).replace(/ /g, '')}API`;
  },
  getMethodName: ({ operationObject }) => {
    const [, name] = operationObject.operationId?.split('/') ?? ['', 'ERROR'];
    return camelCase(name);
  },
},
```

Result: `GithubIssuesAPI.listForOrg`, `GithubReposAPI.removeStatusCheckContexts`, etc. — imported from the generated client like any native module.

## `apiRoot` and authorization

**`apiRoot`** sets the default base URL for the mixin. It is **required** if the OAS document has no `servers` property; if the document has `servers`, Vovk picks the first entry unless you override.

For auth, prefer **`withDefaults`** over per-call plumbing. Every generated API module exposes `withDefaults({ init?, apiRoot? })`, which returns a new module with those options deeply merged into every call:

```ts
import { PetstoreAPI } from 'vovk-client';

const PetstoreAPIWithAuth = PetstoreAPI.withDefaults({
  init: { headers: { Authorization: `Bearer ${process.env.PETSTORE_TOKEN}` } },
  apiRoot: 'https://api.example.com', // optional override
});

await PetstoreAPIWithAuth.updatePet({ body: { name: 'Doggo' } });
```

This is also the preferred pattern when wrapping a mixin in a `createTool` for LLM exposure — wrap the module with `withDefaults` first so the LLM-triggered calls go out authenticated, then call it from inside the tool's `execute`.

Per-call override is also fine for one-off cases:

```ts
await PetstoreAPI.getPetById({
  params: { petId: 1 },
  apiRoot: 'https://staging.example.com',
  init: { headers: { Authorization: `Bearer ${token}` } },
});
```

**Never embed API secrets in a browser bundle.** Keep authorized calls server-side (server components, route handlers, server actions, controllers, services), or proxy through your own Vovk segment and add the auth header there.

## Per-mixin fetcher and AJV tuning

For auth that needs dynamic logic (token refresh, signing), use a custom fetcher scoped to the mixin's segment. The fetcher runs the request, performs client-side validation, and prepares headers — see the **`rpc`** skill for its full contract.

```ts filename="vovk.config.mjs"
outputConfig: {
  segments: {
    petstore: {
      openAPIMixin: { /* ... */ },
      imports: { fetcher: './src/lib/petstoreFetcher' },
    },
  },
},
```

Third-party specs often include non-standard keywords that trip AJV's strict mode. Loosen globally:

```ts filename="vovk.config.mjs"
libs: {
  /** @type {import('vovk-ajv').VovkAjvConfig} */
  ajv: { options: { strict: false } },
},
```

Client-side validation is opt-out per call:

```ts
await PetstoreAPI.getPetById({
  params: { petId: 1 },
  disableClientValidation: true,
});
```

## Type inference and the `Mixins` namespace

Mixin modules support the same inference helpers as native RPC:

```ts
import type { VovkBody, VovkQuery, VovkParams, VovkOutput } from 'vovk';
import { PetstoreAPI } from 'vovk-client';

type Body = VovkBody<typeof PetstoreAPI.updatePet>;
type Output = VovkOutput<typeof PetstoreAPI.getPetById>;
```

Named types from `components/schemas` across **all** mixins are exposed under the `Mixins` namespace export. Prefer this when the third-party spec properly names its components:

```ts
import { PetstoreAPI, type Mixins } from 'vovk-client';

const pet: Mixins.Pet = { id: 1, name: 'Doggo' };
```

For specs that don't populate `components/schemas`, fall back to `VovkOutput<typeof Module.method>` — Vovk infers the shape from the inline response schema instead of producing awkward synthesized names like `ApiUsersIdPost200Response`.

## With `deriveTools`

Mixin modules feed `deriveTools` identically to native RPC modules. Operation `summary`, `description`, and `operationId` populate the derived tool's metadata — so the LLM gets a usable description straight from the third-party spec.

```ts
import { deriveTools } from 'vovk';
import { GithubIssuesAPI, PetstoreAPI } from 'vovk-client';

const { tools } = deriveTools({
  modules: {
    // Wrap with withDefaults to bake in the auth header
    AuthorizedGithubIssuesAPI: GithubIssuesAPI.withDefaults({
      init: {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    }),
    PetstoreAPI,
  },
});
```

See the **`tools`** skill for the full provider-wiring pipeline (OpenAI / Anthropic / MCP).

## Composed vs segmented output

Mixins emit into the same client layouts as native RPC. The three TypeScript import paths:

| Layout | Import path | Notes |
|---|---|---|
| Composed + `js` template *(default)* | `import { PetstoreAPI } from 'vovk-client'` | Emitted to `node_modules/.vovk-client` and re-exported by the `vovk-client` package. Best for most apps. |
| Composed + `ts` template | `import { PetstoreAPI } from '@/client'` | Uncompiled TypeScript emitted to `composedClient.outDir` (e.g. `./src/client` or `./src/lib/client`). Import from that path. |
| Segmented | `import { PetstoreAPI } from '@/client/petstore'` | Folder-per-segment under `segmentedClient.outDir` (default `./src/client`). The pseudo-segment key from `outputConfig.segments.<name>` becomes the folder name — `petstore`, `github`, etc. |

All three share an identical call shape and identical types — pick by emission preference. Full comparison in the **`rpc`** skill.

Python and Rust templates (see **`python`** / **`rust`** skills) also support mixins.

## Flows

### "Let the LLM call the Petstore API"

1. Add Petstore OpenAPI as a pseudo-segment mixin in `vovk.config.mjs`.
2. `npx vovk generate` (or keep `vovk dev` running).
3. `deriveTools({ modules: { PetstoreAPI } })` — wrap with `withDefaults` if you need auth.
4. Feed to the chat loop. See **`tools`** skill.

### "Wrap an internal REST service we don't own"

1. Export the service's OpenAPI spec, host it, or pin a snapshot to `./openapi/`.
2. Declare a mixin with `source: { url, fallback }` (or `{ file }` for the snapshot).
3. Set `apiRoot` — required unless the spec has `servers`.
4. Add `imports.fetcher` on the segment if auth needs dynamic logic; otherwise wrap with `withDefaults` at the call site.

### "My mixin spec has non-standard keywords that break AJV"

Set `libs.ajv.options.strict = false`. If specific operations still misbehave, pass `disableClientValidation: true` at the call site.

### "Module names look awful from auto-generated operation IDs"

Switch to a function `getModuleName` / `getMethodName` that parses the operation ID the way the spec structures it. See the GitHub example above — split on the delimiter, camelCase each part.

### "Bundle the mixin as a publishable SDK"

After configuring mixins, `vovk bundle` treats them like any other generated module. See **`bundle`** skill.

## Gotchas

- **`apiRoot` is required when the spec has no `servers`.** Vovk errors at generate time if neither is present. Adding `apiRoot` at the call site works too, but bake it into config for a single source of truth.
- **`fallback` is a write-through cache.** Every successful remote fetch overwrites the fallback file — commit it so CI has a working snapshot even when the upstream host is flaky.
- **Module name is `getModuleName`, not the segment key.** The segment key determines the segmented-client folder only. `outputConfig.segments.petstore.openAPIMixin.getModuleName = 'PetstoreAPI'` → you import `PetstoreAPI`, not `petstore`.
- **CORS from the browser.** Third-party APIs rarely allow direct calls from a browser origin. Route through a server component, route handler, or server action — or add a proxy segment and point the mixin at it.
- **Auth secrets stay server-side.** Use `withDefaults` in a server file (Route Handler, Server Action, server component), not in client code that ships to browsers.
- **AJV strict mode trips on real-world specs.** If generation errors with `strict mode:` messages, loosen via `libs.ajv.options.strict = false`.
- **Operation IDs drive everything.** A spec with missing or duplicate `operationId`s produces synthesized method names. Complain to the upstream owner, or write a function `getMethodName` that falls back to `METHOD + path`.
- **Standalone codegen works without Next.js.** Install `vovk-cli` globally (`npm i -g vovk-cli`) plus `vovk` + `vovk-ajv` as deps, and run `npx vovk generate`. No Next.js, no segments directory required — just a config file with mixins.
