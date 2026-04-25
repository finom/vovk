---
name: common
description: Vovk.ts fundamentals that don't fit other skills — package ecosystem, `vovk.config.mjs`, `experimentalDecorators` setup, the `/_schema_` dev endpoint, how controllers/services/RPC modules relate, and a short API reference. Use whenever the user asks "how does Vovk work", "what packages do I need", "what's in vovk.config.mjs", "what Node / Next version", "where are types exported from", "what's `_schema_`", "decorate without decorators", "tsconfig settings for Vovk", or anything that doesn't clearly belong to segment / procedure / rpc / tools / jsonlines / openapi / bundle / decorators / mixins / python / rust. Fallback skill for framework-wide context. Type inference helpers (`VovkBody`, `VovkOutput`, `VovkInput`, `VovkParams`, `VovkQuery`, `VovkIteration`, `VovkYieldType`, `VovkReturnType`) are covered in the **`procedure`** skill (controller-side) and **`rpc`** skill (RPC-module / client-side).
---

# Vovk.ts — fundamentals

This is the catch-all skill for things that cross skill boundaries or don't fit elsewhere: the package lineup, configuration, architectural vocabulary, and a brief API reference. Type-inference helpers (`VovkBody` / `VovkOutput` / etc.) live in the **`procedure`** skill (controller-side usage) and the **`rpc`** skill (client/RPC-module usage).

If the user's question clearly belongs to a specialized skill (segment / procedure / rpc / tools / jsonlines / openapi / bundle / decorators / mixins / python / rust), go there first. Come here for cross-cutting fundamentals or when unsure.

## Environment requirements

- **Node.js ≥ 22**
- **Next.js ≥ 15** with **App Router**
- TypeScript — required. Vovk's type inference is the core value prop.

If the user's project doesn't meet these, stop and route them to the `init` skill.

## Packages

| Package | Role | Install as |
|---|---|---|
| `vovk` | Runtime — decorators (`@get`, `@post`, …), `procedure()`, `initSegment()`, `createDecorator()`, `HttpException`, types, tool derivation. | `dependencies` |
| `vovk-cli` | CLI — `init`, `new`, `dev`, `generate`, `bundle`. Code generation + project tooling. Provides the `vovk` binary via `npx vovk`. | `devDependencies` |
| `vovk-client` | Barrel package for the default composed + JS-template client — re-exports `.vovk-client/index.js`. Only used in that specific combo; TS template / segmented client / source-tree `outDir` bypass it and import via a local alias (see `rpc` skill). | `dependencies` (default setup only) |
| `vovk-ajv` | AJV-based client-side validator plug-in. Currently the only shipped option; for custom validators use `createValidateOnClient` (see `rpc` skill). Wire via `outputConfig.imports.validateOnClient: 'vovk-ajv'`. | `dependencies` |
| `vovk-python` | Python client templates + utilities consumed by `vovk generate --from py` (and `vovk bundle` if you go that route). Experimental. | `devDependencies` |
| `vovk-rust` | Rust client templates + utilities consumed by `vovk generate --from rs`. Experimental. | `devDependencies` |

A minimum-viable install is `vovk` + `vovk-cli` + `vovk-ajv`, plus `vovk-client` **only** when the project uses the default composed + `js`-template client. The `ts`-template (source-tree `outDir`) and segmented client emit code straight into the project — no `vovk-client` runtime dep needed in those layouts. `vovk init` picks the right set for you.

## `vovk.config`

Central configuration, lives at the project root. Accepted file extensions: **`.js`** (used by hello-world), **`.cjs`**, **`.mjs`**. There's no `.ts` form — JSDoc `@ts-check` plus `@type {import('vovk').VovkConfig}` is the canonical way to get type-checking. Default lookup also considers `.config/vovk.config.{js,cjs,mjs}`.

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
| `rootEntry` | `'api'` | URL prefix for the root segment — `/api/...`. Bake it into `apiRoot` (see `rpc` skill). |
| `rootSegmentModulesDirName` | `''` | Folder name for root-segment modules (rare override). |
| `schemaOutDir` | `'.vovk-schema'` | Where the dev watcher writes per-segment JSON artifacts. **Commit this directory.** |
| `logLevel` | `'info'` | CLI verbosity: `'debug' \| 'info' \| 'warn' \| 'error'`. |
| `devHttps` | `false` | Enable HTTPS in `vovk dev`. |
| `exposeConfigKeys` | `['libs', 'rootEntry']` | Whitelist of config keys exposed in `.vovk-schema/_meta.json`. Pass `true` to expose everything, `false` for nothing, or a custom array. |
| `moduleTemplates` | set by `vovk init` | Templates `vovk new controller service` uses. |
| `clientTemplateDefs` | – | Custom client templates / per-template overrides (see `python` / `rust` skills for examples). |
| `composedClient` | – | Composed-client config: `fromTemplates`, `outDir`, `prettifyClient`, `outputConfig`. (See `rpc` skill.) |
| `segmentedClient` | – | Segmented-client config: `enabled`, `outDir`, `prettifyClient`, etc. (See `rpc` skill.) |
| `bundle` | – | npm bundle config: `build`, `prebundleOutDir`, `outDir`, `keepPrebundleDir`, `outputConfig`. (See `bundle` skill.) |
| `libs` | – | Library-specific config — e.g. `libs.ajv.options.strict: false` to loosen AJV for messy mixin specs. |
| `outputConfig` | – | Defaults applied to every emitted client (see below). |

### `outputConfig` keys

Applied at the project level; each generated client (composed, segmented, bundle, mixin) can override under its own `outputConfig`.

| Key | Purpose |
|---|---|
| `origin` | Base URL baked into the generated client. Empty `''` produces relative URLs. |
| `imports.fetcher` | Custom fetcher path (see `rpc` skill). |
| `imports.validateOnClient` | Client-side validator — `'vovk-ajv'`, `null` to disable, or a custom path. |
| `openAPIObject` | Static OpenAPI metadata merged into the generated spec (see `openapi` skill). |
| `package` | `package.json` overrides for bundled clients (see `bundle` skill). |
| `readme.{banner,installCommand,description}` | README customizations for bundled clients (see `bundle` skill). |
| `samples.{apiRoot,headers}` | Code-sample customizations in the generated README (see `bundle` skill). |
| `reExports` | Extra named exports added to the generated `index.ts` (see `bundle` skill). |
| `segments` | Per-segment overrides for any of the above plus segment-specific keys like `openAPIMixin` (see `mixins` skill). |

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

Field-level depth lives in the specialized skills (`rpc`, `openapi`, `bundle`, `mixins`, `python`, `rust`). This skill stays at shape + cross-references.

## `tsconfig.json`

`vovk init` sets:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

This enables `@get`, `@post`, `@prefix`, etc. on static class methods.

**Alternative** — skip the flag and use `decorate()` instead (see `procedure` skill). Works identically, less magic, more verbose. Projects that prefer explicit syntax or can't enable the flag use this.

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

- **Controller** — class with `procedure(...).handle(...)` methods. Handles HTTP framing, validation, error translation.
- **Service** — plain class/functions. Business logic, data access. No decorators, no framework tie-in beyond optionally using `VovkBody`/`VovkOutput` for types.
- **RPC module** — generated code mirroring a controller. The `controllers` key in `initSegment` (e.g., `UserRPC: UserController`) becomes the client-side import name. See `rpc` skill for details.

**Convention**: one folder per module.

```
src/modules/user/
  UserController.ts
  UserService.ts
```

`vovk new controller service user` scaffolds this layout.

## The `/_schema_` dev endpoint

When Next runs in dev (`NODE_ENV=development`), each segment exposes a `/_schema_` endpoint returning the segment's schema JSON. The Vovk dev CLI (`vovk dev`) polls these endpoints to build the per-segment JSON artifacts under `.vovk-schema/` — code generation (`vovk generate` / the `prebuild` hook) then reads those artifacts to produce the RPC client.

Layout:

```
.vovk-schema/
  root.json              ← root segment
  customer.json          ← named segment
  nested-segment/foo.json
  _meta.json             ← config snapshot (controlled by exposeConfigKeys)
```

Implications:

- **Schema endpoints are dev-only.** Production builds don't expose `_schema_` (the `NODE_ENV` check skips it). No security surface in deployed apps.
- **Schema endpoints live inside each segment**, not as a separate route — they're part of the `initSegment` output. Disable with `initSegment({ emitSchema: false })` if you really need to (rare).
- **Commit `.vovk-schema/`.** Reproducible codegen on a fresh clone without running `vovk dev` first.

## Short API reference

Minimal reference for cross-skill vocabulary. Details live in the owning skill.

### Module: `vovk`

- `initSegment({ controllers, segmentName?, emitSchema?, exposeValidation?, onError? })` → `{ GET, POST, PUT, PATCH, DELETE }`. **segment skill.**
- `procedure({ params?, body?, query?, output?, iteration?, contentType?, ... })` → `{ handle(fn) }`. **procedure skill.**
- HTTP decorators: `@get`, `@post`, `@put`, `@patch`, `@del`, each with optional path + options. **procedure skill.**
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

The composed default emits to `node_modules/.vovk-client/` and is re-exported by the `vovk-client` npm package — that's the import in default-setup code samples. With the `ts` template + source-tree `outDir`, code lives at `@/client` and the `vovk-client` package is unused. With the segmented client, each segment lives at `@/client/<segmentName>`. Call shape and types are identical across all three layouts. **rpc skill** has the full matrix and import-path rules.

### Module: `vovk-cli` (CLI only)

- `vovk init` — project setup. **init skill.**
- `vovk new segment [name] [--static]` — scaffold a segment. `[name]` is a URL path segment (lowercase or kebab-case, slashes for nesting like `foo/bar`), **not** camelCase. **segment skill.**
- `vovk new controller service <name>` — scaffold a module. `<name>` is `[segmentPath/]moduleName`: the `moduleName` part **must be camelCase** (`user`, `userProfile`), the optional `segmentPath` prefix uses URL-slug rules (`admin/userProfile`, `foo/bar/user`). Shortcut: `vovk n c s <name>`. **procedure skill.**
- `vovk dev` — run Next + Vovk watcher in parallel.
- `vovk generate` — emit schema, regenerate client. **rpc skill.**
- `vovk bundle` — package client for TS/Python/Rust publishing. **bundle / python / rust skills.**

## Common questions

### "What's the difference between a controller and a service?"

Controller: HTTP framing + validation + response shape. Has decorators, uses `procedure()`.
Service: business logic + data access. Plain class or functions, no decorators. Imports types from the controller via `VovkBody` / `VovkOutput` to stay in sync.

### "Can I use Vovk without decorators?"

Yes — use `decorate()` (see `procedure` skill). Don't enable `experimentalDecorators`, no change in runtime behavior.

### "How do I keep types in sync between server and client?"

Procedures declare the schema. Services type their params with inference helpers (`VovkBody<typeof Controller.method>` etc. — **`procedure` skill**). The generated RPC modules re-use the same helpers on the client side (**`rpc` skill**). The schema is the single source of truth.

### "Where does my controller need to be registered?"

In the segment's `route.ts`, in the `controllers` object passed to `initSegment`. `vovk new` does this for you. See `segment` skill.

### "How do I call a procedure from a server component?"

`Controller.methodName.fn({ params, body, query })`. No HTTP. See `.fn()` in the `procedure` skill.

### "What's in `.vovk-schema/`?"

Per-segment JSON schema artifacts. Regenerated by `vovk dev` or `vovk generate`. Commit them to version control.

### "Do I need `vovk-client` as a dependency?"

Only for the default composed + JS-template setup, where it's the barrel you import from. If you switch to the TS template with a source-tree `outDir`, or enable the segmented client, you import from a local path alias and `vovk-client` isn't used — drop it. See `rpc` skill for the full import-path matrix.

## Gotchas

- **Node version**: `vovk init` fails on Node < 22. Users often ignore the error and retry — route them to upgrade Node first.
- **`next dev` vs `vovk dev`**: after `vovk init`, the `dev` npm script is replaced with `vovk dev --next-dev`. Running bare `next dev` skips the Vovk watcher and schemas don't regenerate.
- **`prebuild` hook**: `vovk init` adds `"prebuild": "vovk generate"`. Don't remove it — production builds without it ship stale RPC modules.
- **`.vovk-schema/` in `.gitignore`**: don't. Commit it.
- **`experimentalDecorators: false` with decorator syntax**: silent failure at runtime. Either enable the flag or switch the whole file to `decorate()`.
- **Mixing validator libraries per procedure is fine** — Zod on one, Valibot on another. `vovk-ajv` on the client side handles any Standard JSON Schema.
