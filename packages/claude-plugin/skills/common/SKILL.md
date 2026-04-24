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
| `vovk-cli` | CLI — `init`, `new`, `dev`, `generate`, `bundle`. Code generation + project tooling. | `devDependencies` |
| `vovk-client` | Barrel package for the default composed + JS-template client — re-exports `.vovk-client/index.js`. Only used in that specific combo; TS template / segmented client / source-tree `outDir` bypass it and import via a local alias (see `rpc` skill). | `dependencies` (default setup only) |
| `vovk-ajv` | AJV-based client-side validator plug-in (the only shipped option since v1; for other validators use `createValidateOnClient` — see `rpc` skill). | `dependencies` (optional) |
| `vovk-python` | Python client generator target (experimental). | used via `vovk bundle` |
| `vovk-rust` | Rust client generator target (experimental). | used via `vovk bundle` |

A minimum-viable install is `vovk` + `vovk-cli` + `vovk-client` + one validator. `vovk init` picks these for you.

## `vovk.config.mjs`

Central configuration, lives at the project root. Minimum:

```ts
// vovk.config.mjs
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {};

export default config;
```

Realistic shape:

```ts
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    // Client-side validator
    imports: {
      validateOnClient: 'vovk-ajv',
    },

    // Default OpenAPI object (see openapi skill)
    openAPIObject: {
      info: { title: 'My API', version: '1.0.0' },
      servers: [{ url: 'https://example.com' }],
    },

    // Per-segment overrides (see segment skill)
    segments: {
      admin: {
        openAPIObject: {
          info: { title: 'Admin API', version: '1.0.0' },
        },
      },
    },
  },

  // Templates used by `vovk new controller service` (set by `vovk init`)
  moduleTemplates: {
    controller: 'default',
    service: 'default',
  },
};

export default config;
```

Full option surface is covered by the specialized skills that touch each area (`rpc`, `openapi`, `bundle`). Keep this skill's coverage shallow — just the shape.

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
     │  business logic │                    │  (vovk-client) — client  │
     └─────────────────┘                    │  mirror of controller    │
                                            └─────────────────────────┘
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

When Next runs in dev (`NODE_ENV=development`), each segment exposes a `/_schema_` endpoint returning the segment's schema JSON. The Vovk dev CLI (`vovk dev`) polls these endpoints to rebuild the `.vovk-schema/` artifacts and regenerate the client.

Implications:

- **Don't expose `_schema_` in production.** It's dev-only by the `NODE_ENV` check.
- **Schema endpoints live inside each segment**, not as a separate route. They're part of the `initSegment` output.
- **Committing `.vovk-schema/`** to git gives reproducible codegen without running `vovk dev` first.

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

### Module: `vovk-client`

- Re-exports generated RPC modules (one per `controllers` key in every `initSegment`). **rpc skill.**

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
