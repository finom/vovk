---
name: common
description: Vovk.ts fundamentals not fitting other skills — package ecosystem, `vovk.config.mjs`, `experimentalDecorators` setup, `/_schema_` dev endpoint, how controllers/services/RPC modules relate, short API reference. Use when user asks "how does Vovk work", "what packages do I need", "what's in vovk.config.mjs", "what Node / Next version", "where are types exported from", "what's `_schema_`", "decorate without decorators", "tsconfig settings for Vovk", or anything not clearly belonging to segment / procedure / rpc / tools / jsonlines / openapi / bundle / decorators / mixins / python / rust. Fallback skill for framework-wide context. Type inference helpers (`VovkBody`, `VovkOutput`, `VovkInput`, `VovkParams`, `VovkQuery`, `VovkIteration`, `VovkYieldType`, `VovkReturnType`) covered in **`procedure`** skill (controller-side) and **`rpc`** skill (RPC-module / client-side).
---

# Vovk.ts — fundamentals

Catch-all skill for things crossing skill boundaries: package lineup, config, architectural vocab, brief API reference. Type-inference helpers (`VovkBody` / `VovkOutput` / etc.) live in **`procedure`** skill (controller-side) and **`rpc`** skill (client/RPC-module).

If user's question clearly belongs to specialized skill (segment / procedure / rpc / tools / jsonlines / openapi / bundle / decorators / mixins / python / rust), go there first. Come here for cross-cutting fundamentals or when unsure.

## Source of truth

Plugin ships every API surface, config key, runtime shape framework exposes. **Don't `WebFetch` vovk.dev or grep external docs** — if skill missing or wrong, that's plugin bug, surface it instead of compensating w/ network fetch. Skills cite source paths (`packages/vovk/src/...`, `packages/vovk-cli/src/...`) when docs and source disagree; trust source.

## Environment requirements

- **Node.js ≥ 22**
- **Next.js ≥ 15** with **App Router**
- TypeScript — required. Vovk's type inference is core value prop.

If user's project doesn't meet these, stop and route to `init` skill.

## Vovk endpoints are plain REST

Every procedure mounts as regular HTTP endpoint at deterministic URL. **Any HTTP client works** — `curl`, `httpx`, Python `requests`, Go's `net/http`, browser `fetch`, Postman, whatever. Typed RPC clients (`vovk-client` for JS/TS, `vovk-python`, `vovk-rust`) wrap endpoints w/ inferred types, client-side validation, helpers — conveniences, not only access path.

Practical implication: if user says *"call my API from a CLI / from Go / from a shell script / one-off curl test"*, right answer is plain HTTP request, not "generate typed client." Reach for **`python`** / **`rust`** skills only when user wants typed client codegen, ongoing integration, or PyPI / crates.io publishing. URL formula in **`procedure`** skill ("URL shape — composition rule"). For wire-level contract, generated OpenAPI 3.x spec lives in `vovk-client/openapi` (or under segmented client's `outDir`) and can mount as HTTP endpoint via small controller — see **`openapi`** skill.

## Packages

| Package | Role | Install as |
|---|---|---|
| `vovk` | Runtime — decorators (`@get`, `@post`, …), `procedure()`, `initSegment()`, `createDecorator()`, `HttpException`, types, tool derivation. | `dependencies` |
| `vovk-cli` | CLI — `init`, `new`, `dev`, `generate`, `bundle`. Codegen + project tooling. Provides `vovk` binary via `npx vovk`. | `devDependencies` |
| `vovk-client` | Barrel for default composed + JS-template client — re-exports `.vovk-client/index.js`. Only used in that combo; TS template / segmented client / source-tree `outDir` bypass it, import via local alias (see `rpc` skill). | `dependencies` (default setup only) |
| `vovk-ajv` | AJV-based client-side validator plug-in. Only shipped option; for custom validators use `createValidateOnClient` (see `rpc` skill). Wire via `outputConfig.imports.validateOnClient: 'vovk-ajv'`. | `dependencies` |
| `vovk-python` | Python client templates + utilities consumed by `vovk generate --from py` (and `vovk bundle` if you go that route). Experimental. | `devDependencies` |
| `vovk-rust` | Rust client templates + utilities consumed by `vovk generate --from rs`. Experimental. | `devDependencies` |

Min-viable: `vovk` + `vovk-cli` + `vovk-ajv`, plus `vovk-client` **only** when project uses default composed + `js`-template client. `ts`-template (source-tree `outDir`) and segmented client emit code straight into project — no `vovk-client` runtime dep needed. `vovk init` picks right set.

## `vovk.config`

Central config, project root. Accepted extensions: **`.js`** (used by hello-world), **`.cjs`**, **`.mjs`**. No `.ts` form — JSDoc `@ts-check` plus `@type {import('vovk').VovkConfig}` is canonical type-check path. Default lookup also considers `.config/vovk.config.{js,cjs,mjs}`.

Minimum:

```ts
// vovk.config.mjs
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {};
export default config;
```

### Top-level keys

| Key | Default | Purpose |
|---|---|---|
| `modulesDir` | `'src/modules'` | Where `vovk new controller service` writes module folders. |
| `rootEntry` | `'api'` | URL prefix for root segment — `/api/...`. Bake into `apiRoot` (see `rpc` skill). |
| `rootSegmentModulesDirName` | `''` | Folder name for root-segment modules (rare override). |
| `schemaOutDir` | `'.vovk-schema'` | Where dev watcher writes per-segment JSON artifacts. **Commit this dir.** |
| `logLevel` | `'info'` | CLI verbosity: `'debug' \| 'info' \| 'warn' \| 'error'`. |
| `devHttps` | `false` | Enable HTTPS in `vovk dev`. |
| `exposeConfigKeys` | `['libs', 'rootEntry']` | Whitelist of config keys exposed in `.vovk-schema/_meta.json`. `true` exposes all, `false` none, or custom array. |
| `moduleTemplates` | set by `vovk init` | Templates `vovk new controller service` uses. |
| `clientTemplateDefs` | – | Custom client templates / per-template overrides (see `python` / `rust` skills). |
| `composedClient` | – | Composed-client config: `fromTemplates`, `outDir`, `prettifyClient`, `outputConfig`. (See `rpc` skill.) |
| `segmentedClient` | – | Segmented-client config: `enabled`, `outDir`, `prettifyClient`, etc. (See `rpc` skill.) |
| `bundle` | – | npm bundle config: `build`, `prebundleOutDir`, `outDir`, `keepPrebundleDir`, `outputConfig`. (See `bundle` skill.) |
| `libs` | – | Library-specific config — e.g. `libs.ajv.options.strict: false` to loosen AJV for messy mixin specs. |
| `outputConfig` | – | Defaults applied to every emitted client (see below). |

### `outputConfig` keys

Applied at project level; each generated client (composed, segmented, bundle, mixin) can override via own `outputConfig`.

| Key | Purpose |
|---|---|
| `origin` | Base URL baked into generated client. Empty `''` → relative URLs. |
| `imports.fetcher` | Custom fetcher path (see `rpc` skill). |
| `imports.validateOnClient` | Client-side validator — `'vovk-ajv'`, `null` to disable, or custom path. |
| `openAPIObject` | Static OpenAPI metadata merged into generated spec (see `openapi` skill). |
| `package` | `package.json` overrides for bundled clients (see `bundle` skill). |
| `readme.{banner,installCommand,description}` | README customizations for bundled clients (see `bundle` skill). |
| `samples.{apiRoot,headers}` | Code-sample customizations in generated README (see `bundle` skill). |
| `reExports` | Extra named exports added to generated `index.ts` (see `bundle` skill). |
| `segments` | Per-segment overrides for any of above plus segment-specific keys like `openAPIMixin` (see `mixins` skill). |

### Realistic shape

```ts
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  logLevel: 'debug',
  outputConfig: {
    imports: { validateOnClient: 'vovk-ajv' },
    openAPIObject: {
      info: { title: 'My API', version: '1.0.0' },
      servers: [{ url: 'https://example.com' }],
    },
    segments: {
      admin: { openAPIObject: { info: { title: 'Admin API', version: '1.0.0' } } },
    },
  },
  composedClient: {
    fromTemplates: ['js'],
  },
  moduleTemplates: { controller: 'default', service: 'default' },
};
export default config;
```

Field-level depth lives in specialized skills (`rpc`, `openapi`, `bundle`, `mixins`, `python`, `rust`). This skill stays at shape + cross-refs.

## `tsconfig.json`

`vovk init` sets:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

Enables `@get`, `@post`, `@prefix`, etc. on static class methods.

**Alternative** — skip flag, use `decorate()` (see `procedure` skill). Works identically, less magic, more verbose. Projects preferring explicit syntax or that can't enable flag use this.

## Controllers, services, RPC modules — how they relate

```
┌───────────────────────────┐   procedure()   ┌──────────────────────────┐
│ Controller (static class) │────────────────▶│ HTTP handler + validator │
│  decorated w/ @get/@post  │                 │  + local `.fn()` call    │
└─────────────┬─────────────┘                 └──────────────────────────┘
              │ uses
              ▼
     ┌─────────────────┐                    ┌─────────────────────────┐
     │ Service (plain) │                    │ Generated RPC module     │
     │  business logic │                    │  client-side mirror of   │
     └─────────────────┘                    │  the controller          │
                                            └─────────────────────────┘
                                            imported from one of:
                                              • 'vovk-client'        (composed + js, default)
                                              • '@/client'           (composed + ts template)
                                              • '@/client/<segment>' (segmented client)
```

- **Controller** — class w/ `procedure(...).handle(...)` methods. Handles HTTP framing, validation, error translation.
- **Service** — plain class/functions. Business logic, data access. No decorators, no framework tie-in beyond optionally using `VovkBody`/`VovkOutput` for types.
- **RPC module** — generated code mirroring controller. `controllers` key in `initSegment` (e.g., `UserRPC: UserController`) → client-side import name. See `rpc` skill.

**Convention**: one folder per module.

```
src/modules/user/
  UserController.ts
  UserService.ts
```

`vovk new controller service user` scaffolds this layout.

## The `/_schema_` dev endpoint

When Next runs in dev (`NODE_ENV=development`), each segment exposes `/_schema_` endpoint returning segment's schema JSON. Vovk dev CLI (`vovk dev`) polls these to build per-segment JSON artifacts under `.vovk-schema/` — codegen (`vovk generate` / `prebuild` hook) then reads those artifacts to produce RPC client.

Layout:

```
.vovk-schema/
  root.json              ← root segment
  customer.json          ← named segment
  nested-segment/foo.json
  _meta.json             ← config snapshot (controlled by exposeConfigKeys)
```

Implications:

- **Schema endpoints are dev-only.** Prod builds don't expose `_schema_` (`NODE_ENV` check skips it). No security surface in deployed apps.
- **Schema endpoints live inside each segment**, not as separate route — part of `initSegment` output. Disable via `initSegment({ emitSchema: false })` if you really need (rare).
- **Commit `.vovk-schema/`.** Reproducible codegen on fresh clone w/o running `vovk dev` first.

## Short API reference

Minimal reference for cross-skill vocab. Details live in owning skill.

### Module: `vovk`

- `initSegment({ controllers, segmentName?, emitSchema?, exposeValidation?, onError? })` → `{ GET, POST, PUT, PATCH, DELETE }`. **segment skill.**
- `procedure({ params?, body?, query?, output?, iteration?, contentType?, ... })` → `{ handle(fn) }`. **procedure skill.**
- HTTP decorators: `@get`, `@post`, `@put`, `@patch`, `@del`, each w/ optional path + options. **procedure skill.**
- `@prefix(path)` — controller-level route prefix. **procedure skill.**
- `@operation({ summary, description?, tags?, ... })` — OpenAPI metadata. **openapi skill.**
- `createDecorator((req, next) => ...)` — custom decorators. **decorators skill.**
- `decorate(...decorators)` → `{ handle(fn) }` — non-decorator syntax. **procedure skill.**
- `HttpException(status, message, cause?)`, `HttpStatus` enum. **procedure skill.**
- `toDownloadResponse(payload, { filename, type, headers? })`. **procedure skill.**
- `controllersToStaticParams(controllers, slug?)` — for static segments. **segment skill.**
- `deriveTools(...)`, `createTools(...)` — AI tool derivation. **tools skill.**
- `JSONLinesResponder` — streaming responses. **jsonlines skill.**
- Types: `VovkRequest`, `VovkConfig`. Inference helpers — `VovkBody`, `VovkQuery`, `VovkParams`, `VovkInput`, `VovkOutput`, `VovkIteration`, `VovkReturnType`, `VovkYieldType` — covered in **`procedure`** (controller-side) and **`rpc`** (client-side) skills.

### Generated client surface

Composed default emits to `node_modules/.vovk-client/` and is re-exported by `vovk-client` npm package — that's import in default-setup samples. With `ts` template + source-tree `outDir`, code lives at `@/client` and `vovk-client` package unused. With segmented client, each segment lives at `@/client/<segmentName>`. Call shape and types identical across all three layouts. **rpc skill** has full matrix and import-path rules.

### Module: `vovk-cli` (CLI only)

- `vovk init` — project setup. **init skill.**
- `vovk new segment [name] [--static]` — scaffold segment. `[name]` is URL path segment (lowercase or kebab-case, slashes for nesting like `foo/bar`), **not** camelCase. **segment skill.**
- `vovk new controller service <name>` — scaffold module. `<name>` is `[segmentPath/]moduleName`: `moduleName` part **must be camelCase** (`user`, `userProfile`), optional `segmentPath` prefix uses URL-slug rules (`admin/userProfile`, `foo/bar/user`). Shortcut: `vovk n c s <name>`. **procedure skill.**
- `vovk dev` — run Next + Vovk watcher in parallel.
- `vovk generate` — emit schema, regenerate client. **rpc skill.**
- `vovk bundle` — package client for TS/Python/Rust publishing. **bundle / python / rust skills.**

## Common questions

### "What's the difference between a controller and a service?"

Controller: HTTP framing + validation + response shape. Has decorators, uses `procedure()`.
Service: business logic + data access. Plain class or functions, no decorators. Imports types from controller via `VovkBody` / `VovkOutput` to stay in sync.

### "Can I use Vovk without decorators?"

Yes — use `decorate()` (see `procedure` skill). Skip `experimentalDecorators`, runtime behavior unchanged.

### "How do I keep types in sync between server and client?"

Procedures declare schema. Services type params w/ inference helpers (`VovkBody<typeof Controller.method>` etc. — **`procedure` skill**). Generated RPC modules re-use same helpers on client side (**`rpc` skill**). Schema is single source of truth.

### "Where does my controller need to be registered?"

In segment's `route.ts`, in `controllers` object passed to `initSegment`. `vovk new` does this for you. See `segment` skill.

### "How do I call a procedure from a server component?"

`Controller.methodName.fn({ params, body, query })`. No HTTP. See `.fn()` in `procedure` skill.

### "What's in `.vovk-schema/`?"

Per-segment JSON schema artifacts. Regenerated by `vovk dev` or `vovk generate`. Commit to version control.

### "Do I need `vovk-client` as a dependency?"

Only for default composed + JS-template setup, where it's barrel you import from. If you switch to TS template w/ source-tree `outDir`, or enable segmented client, you import from local path alias and `vovk-client` isn't used — drop it. See `rpc` skill for full import-path matrix.

## Gotchas

- **Node version**: `vovk init` fails on Node < 22. Users often ignore error and retry — route them to upgrade Node first.
- **`next dev` vs `vovk dev`**: after `vovk init`, `dev` npm script replaced w/ `vovk dev --next-dev`. Bare `next dev` skips Vovk watcher; schemas don't regenerate.
- **`prebuild` hook**: `vovk init` adds `"prebuild": "vovk generate"`. Don't remove — prod builds w/o it ship stale RPC modules.
- **`.vovk-schema/` in `.gitignore`**: don't. Commit it.
- **`experimentalDecorators: false` with decorator syntax**: silent runtime failure. Enable flag or switch file to `decorate()`.
- **Mixing validator libraries per procedure is fine** — Zod on one, Valibot on another. `vovk-ajv` on client side handles any Standard JSON Schema.
