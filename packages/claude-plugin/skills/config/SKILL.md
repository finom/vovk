---
name: config
description: Vovk.ts configuration — vovk.config.{mjs,js,ts,cjs} shape, every config key + default (rootEntry, schemaOutDir, libs, exposeConfigKeys, logLevel, devHttps, moduleTemplates, clientTemplateDefs, composedClient, segmentedClient, outputConfig, bundle, info), tsconfig.json setup (experimentalDecorators), and the decorate() alternative for projects without TS decorators. Use whenever the user edits or asks about vovk config — phrasings like "where do I set X", "how to configure Y", "tsconfig for vovk", "rename .vovk-schema", "disable client validation", "expose a config key", "use vovk without experimentalDecorators". Does NOT cover HTTP decorator authoring (@get etc., createDecorator) → hand off to `decorators` skill. Does NOT cover bundle CLI flow → `bundle` skill. Does NOT cover composed vs segmented client output internals → `rpc` skill.
---

# Vovk.ts configuration

Single config file at project root. Picked up by `vovk-cli` (dev / generate / bundle).

## Source of truth

Don't `WebFetch` vovk.dev mid-task. This skill + sibling vovk:* skills = canonical. If a config key isn't documented here, name the gap.

## File

Vovk-cli looks for the first that exists, in order: `vovk.config.mjs` (recommended) → `vovk.config.js` → `vovk.config.ts` → `vovk.config.cjs`.

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
| `info` | `undefined` | OpenAPI `info` block (title, version, description, contact, license). |
| `moduleTemplates` | set by `vovk init` | Templates `vovk new controller service` uses. |
| `clientTemplateDefs` | template defaults | Override / extend built-in templates (`js`, `ts`, `py`, `rs`, ...). |
| `composedClient` | see below | Composed client output config. |
| `segmentedClient` | see below | Segmented client output config. |
| `bundle` | `{}` | `vovk bundle` config (CLI flow → `bundle` skill). |
| `outputConfig` | inherited | Default output config (origin, package, imports) propagated to clients. |

## Composed vs segmented client

```ts
composedClient: {
  enabled: true,
  outDir: 'node_modules/.vovk-client',
  fromTemplates: ['ts'],
}

segmentedClient: {
  enabled: false,
  outDir: 'src/client',
  fromTemplates: ['ts'],
  segmentNameOverride: undefined,
}
```

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

Built-in templates: `js`, `jsSrc`, `ts`, `tsSrc`, `py`, `pySrc`, `rs`, `rsSrc`. Per-language flow → `python` / `rust` skills.

## `moduleTemplates` — `vovk new` scaffolding

Controller / Service templates `vovk new controller service <name>` uses. Written by `vovk init` based on the validation library + decorator preferences picked at init time. Usually don't touch.

```ts
moduleTemplates: {
  controller: { source: '...' /* template path */ },
  service: { source: '...' },
}
```

## `outputConfig` — propagated defaults

Top-level `outputConfig` is the default for every generated client (`composedClient`, `segmentedClient`, `bundle`). Overridden per-target via `clientTemplateDefs.<name>.outputConfig`.

Common keys: `origin` (baked-in API URL), `package` (npm/PyPI/crates.io metadata), `imports.validateOnClient` (e.g. `'vovk-ajv'`), `imports.fetcher`, `reExports`, `requires`, `readme.{banner,installCommand,description}`, `samples.{apiRoot,headers}`, `includeSegments`, `excludeSegments`.

(Note: `requires`, `includeSegments`, `excludeSegments` for **`bundle`** live at the root of `bundle`, NOT under `bundle.outputConfig`. Detail → `bundle` skill.)

## TypeScript setup

Vovk's HTTP decorators (`@get`, `@post`, `@prefix`, `@operation`, ...) are TypeScript decorators. Enable in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

Without `experimentalDecorators`, decorator stacking won't compile — use `decorate()` instead (next section).

## Without `experimentalDecorators` — `decorate()`

Some toolchains can't or won't enable `experimentalDecorators` (Bun + certain transformers, Vite SSR variants, mixed-stack monorepos). Use `decorate()` as the method initializer — variadic decorators, chained `.handle()`:

```ts
import { get, put, decorate, procedure, operation } from 'vovk';
import { z } from 'zod';

class UserController {
  static prefix = 'users';

  static updateUser = decorate(
    put('{id}'),
    operation({ summary: 'Update user' }),
    procedure({
      params: z.object({ id: z.uuid() }),
      body: z.object({ email: z.email() }),
    }),
  ).handle(async (req, { id }) => {
    const { email } = await req.vovk.body();
    // ...
  });

  // No-validation form:
  static listUsers = decorate(get()).handle(async (req) => {
    // ...
  });
}

export default UserController;
```

Same wire output as the `@put('{id}') @operation(...)` stacking. Decorator order: **last argument = innermost = applied first** (matches `@`-stacking semantics). Pass a plain async function to `.handle()` if there's no validation procedure.

## Out of scope

- Authoring HTTP decorators (`@get` etc.), custom decorators, auth patterns → **`decorators`** skill.
- `vovk bundle` CLI flow, tsdown recipe, publishing → **`bundle`** skill.
- Composed vs segmented client *consumption* (call shape, types, fetcher) → **`rpc`** skill.
- Procedure authoring, validation, `.fn()` → **`procedure`** skill.
- Multitenant routing config → **`multitenant`** skill.
- OpenAPI generation → **`openapi`** skill.
