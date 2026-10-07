---
name: config
description: Vovk.ts configuration — vovk.config.{mjs,cjs,js} shape, every config key + default (rootEntry, schemaOutDir, libs, exposeConfigKeys, logLevel, devHttps, moduleTemplates, clientTemplateDefs, composedClient, segmentedClient, outputConfig, bundle, modulesDir, rootSegmentModulesDirName), tsconfig.json setup (experimentalDecorators). Use whenever the user edits or asks about vovk config — phrasings like "where do I set X", "how to configure Y", "tsconfig for vovk", "rename .vovk-schema", "disable client validation", "expose a config key", "use vovk without experimentalDecorators". Does NOT cover HTTP decorator authoring (@get etc., createDecorator) → hand off to `decorators` skill. Does NOT cover bundle CLI flow → `bundle` skill. Does NOT cover composed vs segmented client output internals → `rpc` skill.
---

# Vovk.ts configuration

Single config file at project root or in `.config/`. Picked up by `vovk-cli` (dev / generate / bundle).

## Source of truth

Don't `WebFetch` vovk.dev mid-task. This skill + sibling vovk:* skills = canonical. If a config key isn't documented here, name the gap.

## File

Vovk-cli uses the first that exists, in order: `.config/vovk.config.cjs` → `vovk.config.cjs` → `.config/vovk.config.mjs` → `vovk.config.mjs` (recommended, what `vovk init` writes) → `.config/vovk.config.js` → `vovk.config.js`. No TypeScript config: `vovk.config.ts` is never read.

```ts
// vovk.config.mjs
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  // ...
};
export default config;
```

## Top-level keys

| Key | Default | Meaning |
|-----|---------|---------|
| `rootEntry` | `'api'` | URL prefix for root segment — `/api/...`. Bake into `apiRoot` (see `rpc`). |
| `rootSegmentModulesDirName` | `''` | Folder name for root-segment modules (rare override). |
| `schemaOutDir` | `'.vovk-schema'` | Where dev watcher writes per-segment JSON artifacts. **Commit this dir.** |
| `logLevel` | `'info'` | CLI verbosity: `'error' \| 'trace' \| 'debug' \| 'info' \| 'warn'`. |
| `devHttps` | `false` | Enable HTTPS in `vovk dev`. |
| `exposeConfigKeys` | `['libs', 'rootEntry']` | Whitelist of config keys exposed in `.vovk-schema/_meta.json`. `true` = all, `false` = none, or custom array. |
| `libs` | `{}` | Validation library config (used by `vovk-cli` codegen). |
| `modulesDir` | `'src/modules'` (`'modules'` when the app isn't in `src/app`) | Folder `vovk new` creates modules in; `vovk dev` watches it. |
| `moduleTemplates` | set by `vovk init` | Templates `vovk new controller service` uses. |
| `clientTemplateDefs` | template defaults | Override / extend built-in templates (`ts`, `py`, `rs`, ...). |
| `composedClient` | see below | Composed client output config. |
| `segmentedClient` | see below | Segmented client output config. |
| `bundle` | `{}` | `vovk bundle` config (CLI flow → `bundle` skill). |
| `outputConfig` | inherited | Default output config (origin, package, imports) propagated to clients. |

## Composed vs segmented client

```ts
composedClient: {
  enabled: true,
  outDir: 'src/client', // 'client' when the app isn't in src/app
  fromTemplates: ['ts'],
  prettifyClient: true, // project prettier; warns and skips if not installed
}

segmentedClient: {
  enabled: false,
  outDir: 'src/client',
  fromTemplates: ['ts'],
  prettifyClient: true,
}
```

Import composed from `@/client`, segmented from `@/client/<segment>`. Both enabled share `outDir`: composed files at the root, per-segment subdirs. `prettifyClient` uses the project-installed prettier; if missing, CLI warns once per run and writes unformatted. `segmentNameOverride` is per segment, not a client key: `outputConfig.segments.<name>.segmentNameOverride` (→ `multitenant` skill).

Multitenant projects flip these — `composedClient.enabled: false`, `segmentedClient.enabled: true`. Detail → `multitenant` skill.

## `clientTemplateDefs` — override / extend templates

Per-template overrides for paths and `outputConfig`:

```ts
clientTemplateDefs: {
  ts: {
    extends: 'ts',
    outputConfig: { origin: 'https://api.example.com' },
  },
  rs: {
    extends: 'rs',
    outputConfig: { origin: 'https://api.example.com' },
    // composedClient: { outDir: './my_other_dir' }, // optional
  },
}
```

Built-in templates: `ts`, `py` / `pySrc`, `rs` / `rsSrc`, plus internal building blocks (`tsBase`, `schemaTs`, `openapiTs`, `openapiJson`, ...). Per-language flow → `python` / `rust` skills.

## `moduleTemplates` — `vovk new` scaffolding

Controller / Service templates `vovk new controller service <name>` uses. Written by `vovk init` based on the validation library + decorator preferences picked at init time. Usually don't touch.

```ts
moduleTemplates: {
  controller: 'vovk-cli/module-templates/zod/controller.ts.ejs', // a template path, as vovk init writes
  service: 'vovk-cli/module-templates/type/service.ts.ejs',
}
```

## `outputConfig` — propagated defaults

Top-level `outputConfig` is the default for every generated client (`composedClient`, `segmentedClient`, `bundle`). Overridden per-target via `clientTemplateDefs.<name>.outputConfig`.

Keys: `origin` (baked-in API URL), `package` (npm/PyPI/crates.io metadata), `readme.{banner,installCommand,description}`, `samples.{apiRoot,headers}`, `openAPIObject` (merged into the generated OpenAPI document: `info`, `servers`, …), `reExports`, `imports.{fetcher,validateOnClient,createRPC}` (e.g. `validateOnClient: 'vovk-ajv'`). Top-level `outputConfig` also takes `segments.<name>`: the same keys (without `imports.createRPC`) plus `rootEntry`, `segmentNameOverride`, `openAPIMixin`.

(Note: `requires` is a key of `bundle` and of `clientTemplateDefs.<name>`; `includeSegments` / `excludeSegments` are keys of `composedClient`, `segmentedClient` and `bundle`. None of them goes under an `outputConfig`. Detail → `bundle` skill.)

## TypeScript setup

Vovk's decorators (`@get`, `@post`, `@prefix`, `@operation`, ...) are the only way to declare routes. `vovk init` enables `experimentalDecorators` in `tsconfig.json`; keep it:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

A webpack build needs it: without it `next build --webpack` fails, and webpack is Next.js 15's default build. Turbopack (Next.js 16's default) compiles vovk's decorators with or without it; TypeScript 5.0+ type-checks them either way.

## Out of scope

- Authoring HTTP decorators (`@get` etc.), custom decorators, auth patterns → **`decorators`** skill.
- `vovk bundle` CLI flow, tsdown recipe, publishing → **`bundle`** skill.
- Composed vs segmented client *consumption* (call shape, types, fetcher) → **`rpc`** skill.
- Procedure authoring, validation, `.fn()` → **`procedure`** skill.
- Multitenant routing config → **`multitenant`** skill.
- OpenAPI generation → **`openapi`** skill.
