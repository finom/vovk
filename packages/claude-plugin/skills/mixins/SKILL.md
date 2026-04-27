---
name: mixins
description: Vovk.ts OpenAPI mixins — importing third-party OpenAPI 3.x schemas as typed client modules that share the same call signature as native Vovk RPC modules. Use whenever the user asks to "call a third-party API from my Vovk app", "mixin an OpenAPI schema", "import an OpenAPI spec as a client", "wrap an external service that only ships an OpenAPI doc", or mentions `openAPIMixin`, `getModuleName`, `getMethodName`, `withDefaults` on a generated API module, or the `Mixins` namespace. Also use to push back when the user reaches for mixins for a vendor with a great official SDK (Stripe, AWS, GitHub via Octokit) — the skill explains when the official client is the better choice. Covers remote/local/inline specs, module + method naming strategies, `apiRoot`, per-mixin fetcher, AJV client validation knobs, and composed/segmented clients. **`deriveTools` does NOT work with mixins** — the mixin runtime module lacks the per-handler metadata `deriveTools` reads, so for "expose this third-party API as an LLM tool" wrap the mixin call in `createTool({...})` instead (see `tools` skill).
---

# Vovk.ts OpenAPI mixins

Mixins turn any OpenAPI 3.x spec into typed client module behaving exactly like native Vovk RPC module — same `{ params, query, body }` call shape, same client surface, same type-inference helpers (`VovkBody`, `VovkOutput`, …). Can run mixins standalone (no Next.js) as pure codegen tool.

**One caveat not obvious from call shape:** mixin modules produced by `createRPC` carry only client-side metadata (`schema`, `getURL`, `queryKey`, etc.). They do **not** carry per-handler `definition` field that `deriveTools` reads to build `inputSchemas` (verified in `packages/vovk/src/client/createRPC.ts:178-193` vs `packages/vovk/src/tools/deriveTools.ts:113-115` — `definition` set only by `procedure({...}).handle(...)` in `packages/vovk/src/validation/withValidationLibrary.ts:281`). So mixins **cannot be passed directly to `deriveTools`**. For LLM tool exposure, hand-write `createTool({...})` wrapper around mixin call — see `tools` skill.

## Prefer the official SDK when one exists

**Recommend official client library first.** Hand-maintained SDKs like `stripe`, `@octokit/rest`, `@aws-sdk/*`, `@google-cloud/*` ship with auth flows, retries, pagination helpers, webhook signature verification, edge-case handling that generated client can't match — and track upstream API changes faster than any spec snapshot. If vendor publishes official SDK, use it.

Mixins right tool when:

- **No official SDK exists** — internal services, niche vendors, legacy APIs that only publish OpenAPI document.
- **LLM tool exposure** — mixins give typed call surface to wrap inside `createTool({...})` for MCP / OpenAI / Anthropic tool exposure. (Direct `deriveTools` doesn't work for mixins — see caveat at top.) For GitHub-style APIs `@octokit/rest` still better tool body, but mixin remains useful when third-party API has no official SDK.
- **Spec-as-source-of-truth** — internal microservices where OpenAPI doc is generated and you want client drift to surface as TypeScript error at build time.

For everything else (Stripe charges, S3 uploads, Octokit pagination), reach for official package.

## Scope

Covers:

- Declaring mixins under `outputConfig.segments.<name>.openAPIMixin`.
- `source` variants: remote URL (with fallback), local file, inline object.
- `getModuleName` / `getMethodName` — preset strategies + function form.
- `apiRoot` + authorization via `withDefaults`.
- Per-mixin fetcher + AJV strict-mode loosening for messy specs.
- `Mixins` namespace for `components/schemas` types.
- Composed vs segmented output (pointer to **`rpc`** skill).
- Wrapping mixin calls in `createTool({...})` for LLM tool exposure (pointer to **`tools`** skill — mixins NOT directly compatible with `deriveTools`).

Out of scope:

- Authoring own procedures → **`procedure`** skill.
- RPC client call shape, `customFetcher`, per-call `init` → **`rpc`** skill.
- AI tool derivation details → **`tools`** skill.
- Writing OpenAPI specs by hand — this skill consumes them.

## Declaring a mixin

Mixin declared as **pseudo-segment** under `outputConfig.segments.<name>.openAPIMixin`. Key (`petstore` below) becomes segment folder name in segmented-client mode. Generated module name comes from `getModuleName` (default `'api'`), not from segment key.

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

Run `npx vovk generate` (or keep `vovk dev` running) → mixin emitted alongside native RPC modules.

```ts
import { PetstoreAPI } from 'vovk-client';

const pets = await PetstoreAPI.getPets({ query: { limit: 10 } });
```

> **Import path depends on client layout.** Code samples here import from `'vovk-client'` — default for **composed client + `js` template**, re-exported from `node_modules/.vovk-client`. If project emits composed client into source tree via `ts` template (`composedClient.outDir`), import from that path — e.g. `@/client`. If project uses **segmented client**, each mixin lives in own folder named after pseudo-segment key — e.g. `@/client/petstore`. Call shape + types identical across all three. See **`rpc`** skill for full comparison.

## Source variants

`source` is object — pick exactly one shape.

**`{ url, fallback? }`** — fetched at generate time. Optional `fallback` path caches last-seen spec locally; if remote URL unreachable on next generate, Vovk reads fallback. Commit fallback to keep CI green when upstream spec host is down.

```ts
source: {
  url: 'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json',
  fallback: './.openapi-cache/github.json',
}
```

**`{ file }`** — local spec checked into repo. Both JSON + YAML accepted (Vovk sniffs by leading char: `{` / `[` → JSON, else YAML).

```ts
source: { file: './openapi/internal.yaml' }
```

**`{ object }`** — inline JS value. Useful when spec built or transformed by another tool in same project.

```ts
import spec from './openapi/internal.json' with { type: 'json' };
// ...
openAPIMixin: { source: { object: spec }, ... }
```

## Module and method naming

`getModuleName` controls JS name of generated module; `getMethodName` controls each method. Both accept preset string or function.

**Preset strings — `getModuleName`:**

| Value | Effect |
|---|---|
| `'api'` *(default)* | Every operation goes into single `api` module. |
| any other literal (e.g. `'PetstoreAPI'`) | Hard-coded single module name — useful for small third-party APIs. |

**Preset strings — `getMethodName`:**

| Value | Effect |
|---|---|
| `'camel-case-operation-id'` | Always camelCase the `operationId`. Throws if `operationId` missing. Use only when every operation has one. |
| `'auto'` *(default)* | One mode handles all cases: pass `operationId` through if already camelCase, camelCase it if snake_case, otherwise synthesize from `METHOD + path`. Safe for messy specs. |

`'auto'` is itself the auto-detecting mode — no separate layer picks between two presets. Reach for `'camel-case-operation-id'` only when you want throw-on-missing behavior; otherwise leave default. For more structured needs (splitting operations across multiple modules, custom prefixes), use function — see below.

**Function form** — receives `{ operationObject, method, path, openAPIObject }`, returns string. Use when operation IDs are structured + you want to split into multiple modules. GitHub REST API is canonical example for the technique (`issues/list-for-org` → `GithubIssuesAPI.listForOrg`) — though for actual GitHub work, prefer `@octokit/rest` over a mixin:

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

Result: `GithubIssuesAPI.listForOrg`, `GithubReposAPI.removeStatusCheckContexts`, etc. — imported from generated client like any native module.

## `apiRoot` and authorization

**`apiRoot`** sets default base URL for mixin. **Required** if OAS document has no `servers` property; if document has `servers`, Vovk picks first entry unless overridden.

For auth, prefer **`withDefaults`** over per-call plumbing. Every generated API module exposes `withDefaults({ init?, apiRoot? })`, returns new module with options deeply merged into every call:

```ts
import { PetstoreAPI } from 'vovk-client';

const PetstoreAPIWithAuth = PetstoreAPI.withDefaults({
  init: { headers: { Authorization: `Bearer ${process.env.PETSTORE_TOKEN}` } },
  apiRoot: 'https://api.example.com', // optional override
});

await PetstoreAPIWithAuth.updatePet({ body: { name: 'Doggo' } });
```

Also preferred pattern when wrapping mixin in `createTool` for LLM exposure — wrap module with `withDefaults` first so LLM-triggered calls go out authenticated, then call from inside tool's `execute`.

Per-call override fine for one-off cases:

```ts
await PetstoreAPI.getPetById({
  params: { petId: 1 },
  apiRoot: 'https://staging.example.com',
  init: { headers: { Authorization: `Bearer ${token}` } },
});
```

**Never embed API secrets in browser bundle.** Keep authorized calls server-side (server components, route handlers, server actions, controllers, services), or proxy through your own Vovk segment + add auth header there.

## Per-mixin fetcher and AJV tuning

For auth needing dynamic logic (token refresh, signing), use custom fetcher scoped to mixin's segment. Fetcher runs request, performs client-side validation, prepares headers — see **`rpc`** skill for full contract.

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

Client-side validation opt-out per call:

```ts
await PetstoreAPI.getPetById({
  params: { petId: 1 },
  disableClientValidation: true,
});
```

## Type inference and the `Mixins` namespace

Mixin modules support same inference helpers as native RPC:

```ts
import type { VovkBody, VovkQuery, VovkParams, VovkOutput } from 'vovk';
import { PetstoreAPI } from 'vovk-client';

type Body = VovkBody<typeof PetstoreAPI.updatePet>;
type Output = VovkOutput<typeof PetstoreAPI.getPetById>;
```

Named types from `components/schemas` across **all** mixins exposed under `Mixins` namespace export. Prefer this when third-party spec properly names its components:

```ts
import { PetstoreAPI, type Mixins } from 'vovk-client';

const pet: Mixins.Pet = { id: 1, name: 'Doggo' };
```

For specs that don't populate `components/schemas`, fall back to `VovkOutput<typeof Module.method>` — Vovk infers shape from inline response schema instead of synthesized names like `ApiUsersIdPost200Response`.

## With `deriveTools`

Mixin modules feed `deriveTools` identically to native RPC modules. Operation `summary`, `description`, `operationId` populate derived tool's metadata → LLM gets usable description straight from third-party spec.

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

See **`tools`** skill for full provider-wiring pipeline (OpenAI / Anthropic / MCP).

## Composed vs segmented output

Mixins emit into same client layouts as native RPC. Three TypeScript import paths:

| Layout | Import path | Notes |
|---|---|---|
| Composed + `js` template *(default)* | `import { PetstoreAPI } from 'vovk-client'` | Emitted to `node_modules/.vovk-client`, re-exported by `vovk-client` package. Best for most apps. |
| Composed + `ts` template | `import { PetstoreAPI } from '@/client'` | Uncompiled TypeScript emitted to `composedClient.outDir` (e.g. `./src/client` or `./src/lib/client`). Import from that path. |
| Segmented | `import { PetstoreAPI } from '@/client/petstore'` | Folder-per-segment under `segmentedClient.outDir` (default `./src/client`). Pseudo-segment key from `outputConfig.segments.<name>` becomes folder name — `petstore`, `github`, etc. |

All three share identical call shape + identical types — pick by emission preference. Full comparison in **`rpc`** skill.

Python and Rust templates (see **`python`** / **`rust`** skills) also support mixins.

## Flows

### "Let the LLM call the Petstore API"

1. Add Petstore OpenAPI as pseudo-segment mixin in `vovk.config.mjs`.
2. `npx vovk generate` (or keep `vovk dev` running).
3. `deriveTools({ modules: { PetstoreAPI } })` — wrap with `withDefaults` if you need auth.
4. Feed to chat loop. See **`tools`** skill.

### "Wrap an internal REST service we don't own"

1. Export service's OpenAPI spec, host it, or pin snapshot to `./openapi/`.
2. Declare mixin with `source: { url, fallback }` (or `{ file }` for snapshot).
3. Set `apiRoot` — required unless spec has `servers`.
4. Add `imports.fetcher` on segment if auth needs dynamic logic; otherwise wrap with `withDefaults` at call site.

### "My mixin spec has non-standard keywords that break AJV"

Set `libs.ajv.options.strict = false`. If specific operations still misbehave, pass `disableClientValidation: true` at call site.

### "Module names look awful from auto-generated operation IDs"

Switch to function `getModuleName` / `getMethodName` parsing operation ID the way spec structures it. See GitHub example above — split on delimiter, camelCase each part.

### "Bundle the mixin as a publishable SDK"

After configuring mixins, `vovk bundle` treats them like any other generated module. See **`bundle`** skill.

## Gotchas

- **`apiRoot` required when spec has no `servers`.** Vovk errors at generate time if neither present. Adding `apiRoot` at call site works, but bake into config for single source of truth.
- **`fallback` is write-through cache.** Every successful remote fetch overwrites fallback file — commit it so CI has working snapshot when upstream host flaky.
- **Module name is `getModuleName`, not segment key.** Segment key determines segmented-client folder only. `outputConfig.segments.petstore.openAPIMixin.getModuleName = 'PetstoreAPI'` → import `PetstoreAPI`, not `petstore`.
- **CORS from browser.** Third-party APIs rarely allow direct calls from browser origin. Route through server component, route handler, server action — or add proxy segment + point mixin at it.
- **Auth secrets stay server-side.** Use `withDefaults` in server file (Route Handler, Server Action, server component), not in client code shipping to browsers.
- **AJV strict mode trips on real-world specs.** If generation errors with `strict mode:` messages, loosen via `libs.ajv.options.strict = false`.
- **Operation IDs drive everything.** Spec with missing or duplicate `operationId`s produces synthesized method names. Complain to upstream owner, or write function `getMethodName` falling back to `METHOD + path`.
- **Standalone codegen works without Next.js.** Install `vovk-cli` globally (`npm i -g vovk-cli`) plus `vovk` + `vovk-ajv` as deps, run `npx vovk generate`. No Next.js, no segments directory required — just config file with mixins.
