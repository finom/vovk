---
name: bundle
description: Vovk.ts `vovk bundle` CLI — packages composed TypeScript client as zero-dep publishable npm package. Covers `bundle.build` async fn, `tsdown@0.19.0` recipe, `outputConfig.origin` / `package` / `reExports` / `imports.validateOnClient: null`, `prebundleOutDir` / `outDir` / `keepPrebundleDir`, `--include`/`--exclude` segments, `--openapi-*` mixin flags. Use when user asks to "publish my API client", "ship an SDK to npm", "build a publishable client package", "bundle the Vovk client", "generate a distributable npm SDK", "use tsdown with vovk", or variations including why bundled package omits `openapi`/`schema` entry points. Note: `vovk bundle` is **TypeScript-only**. For Python/PyPI publishing, hand off to **`python`** skill. For Rust/crates.io publishing, hand off to **`rust`** skill. Does NOT cover in-project `vovk-client` codegen → **`rpc`** skill.
---

# Vovk.ts `vovk bundle`

`vovk bundle` packages composed TypeScript client as zero-dep npm package — pre-built JS + `.d.ts`, auto-gen `package.json`, auto-gen `README.md` w/ samples, ready for `npm publish`. Release step: `vovk generate` → in-project client for dev; `vovk bundle` → distributable SDK installed from registry.

**TypeScript-only.** Despite name, ships no Python/Rust clients. Those have own templates (`py` / `pySrc` / `rs` / `rsSrc`) and own publish flows — see **`python`** and **`rust`** skills.

## Scope

Covers:

- 4-step bundle workflow.
- `bundle.build` async function (required) + canonical `tsdown@0.19.0` recipe.
- `bundle.outputConfig` fields (`origin`, `package`, `reExports`, `imports`, `requires`, `readme`, `samples`, `includeSegments`/`excludeSegments`).
- Default directory layout (`tmp_prebundle` → `dist`).
- Full CLI flag list including `--openapi-*` mixin family.
- What's bundled / omitted (no `openapi`, no `schema` entry point — but `schema` still importable as named export).
- `npm publish dist` flow + consumer-side usage.
- `deriveTools` integration (bundled modules feed it identically).

Out of scope:

- In-project `vovk-client` generation → **`rpc`** skill.
- Python client publishing (PyPI) → **`python`** skill.
- Rust client publishing (crates.io) → **`rust`** skill.
- Mixin authoring (consumed here as bundle inputs) → **`mixins`** skill.

## `bundle` vs `generate`

| Command | Purpose | Output | When |
|---|---|---|---|
| `vovk generate` | In-project TypeScript client + OpenAPI spec | `node_modules/.vovk-client/`, `.vovk-schema/` | Every build (`prebuild` hook), on schema changes during `vovk dev`. |
| `vovk bundle` | Publishable npm package — pre-built JS + `.d.ts` + `package.json` + `README.md` | `dist/` ready for `npm publish` | Ship SDK outside Next.js app. |

Don't run `vovk bundle` in normal dev; in-project client faster. Bundle when you need registry artifact.

## How bundling works

1. Vovk gens TypeScript client into `prebundleOutDir` (default `tmp_prebundle`) via `tsBase` template — uncompiled `.ts` source.
2. Vovk calls your `bundle.build({ entry, outDir, prebundleDir })` async fn. Plugs in any bundler (tsdown only tested one) to compile `entry` (the `tmp_prebundle/index.ts`) → JS + `.d.ts` under `outDir` (default `dist`).
3. Vovk emits `package.json` and `README.md` from `packageJson` and `readme` templates into `outDir`.
4. Vovk deletes `prebundleOutDir` unless `keepPrebundleDir: true` (handy for debugging prebundled source).

```sh
npx vovk bundle
npm publish dist
```

Published package consumed exactly like `vovk-client`:

```ts
import { UserRPC } from 'my-api-bundle';

await UserRPC.getUser({ params: { id: '123' } });
```

All TS-client features (call shape, `withDefaults`, type inference, `schema` access) survive bundle.

## `bundle.build` — required entry point

`bundle.build` is async fn. Vovk calls w/ absolute paths:

```ts
build: async ({ entry, outDir, prebundleDir }) => {
  // entry        — absolute path to the prebundled tmp_prebundle/index.ts
  // outDir       — absolute path where the bundler should emit JS + .d.ts
  // prebundleDir — absolute path of the prebundle dir (rarely needed)
}
```

Vovk is bundler-agnostic — `esbuild`, `tsup`, `tsdown`, even `child_process` shell-out work. Only **tsdown** tested by Vovk's authors; docs warn: **pin `tsdown@0.19.0`** until newer versions confirmed compatible.

### Canonical `tsdown` recipe (pin 0.19.0)

```sh
npm install --save-dev tsdown@0.19.0
```

```ts filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  bundle: {
    build: async ({ entry, outDir }) => {
      const { build } = await import('tsdown');
      await build({
        entry,
        dts: true,
        format: 'esm',
        hash: false,
        fixedExtension: true,
        clean: true,
        outDir,
        platform: 'neutral',
        outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
        outputOptions: { inlineDynamicImports: true },
        inputOptions: { resolve: { mainFields: ['module', 'main'] } },
        noExternal: ['!next/**'],
      });
    },
    outputConfig: {
      origin: 'https://example.com',
      package: {
        main: './index.js',
        types: './index.d.ts',
        exports: { '.': { default: './index.js', types: './index.d.ts' } },
      },
      imports: { validateOnClient: null }, // shrinks the bundle considerably
    },
  },
};
export default config;
```

Resulting `dist/` layout:

```
dist/
├── package.json
├── README.md
├── index.js
└── index.d.ts
```

## `bundle.outputConfig` — what goes in package

`bundle.outputConfig` accepts same options as root-level `outputConfig` (bundle-specific overrides win). Key fields:

| Field | Purpose |
|---|---|
| `origin` *(required)* | Default API base URL baked into bundled client. Override at call time via `apiRoot`. |
| `package` | Overrides for generated `package.json`. Set `name`, `version`, `type`, `main`, `types`, `exports` here. Defaults pull from project root `package.json` where present. |
| `imports.validateOnClient: null` | Disables client-side AJV validation in bundle — usually big size win. |
| `imports.fetcher` | Custom fetcher path baked into bundle. |
| `reExports` | Extra named exports in generated `index.ts`. E.g. `{ doSomething: './src/utils' }` exposes helper alongside RPC modules. |
| `requires` | Template dir overrides — `readme`, `packageJson`, or any custom template. Defaults to project root for both. |
| `readme.banner` | String prepended to generated `README.md` (badges, logo HTML, status callouts). |
| `readme.installCommand` | Override install command in README (default: `npm install <package-name>`). For monorepo / private-registry / `pnpm` / `yarn`-first audiences. |
| `readme.description` | Replaces description block in README. Defaults to bundled `package.json` description. |
| `samples.apiRoot` | Base URL in generated README samples. Defaults to `outputConfig.origin`. Set to public-facing URL when `origin` points to staging/internal hostname. |
| `samples.headers` | Header map (e.g. `{ Authorization: 'Bearer YOUR_TOKEN' }`) in generated samples — shows consumers how to auth. |
| `includeSegments` / `excludeSegments` | Filter which Vovk segments contribute to bundle. |

Min viable `outputConfig` is `origin` + `package` block with `main`/`types`/`exports` matching bundler's output filenames.

## CLI flags

```
$ npx vovk bundle --help
Usage: vovk bundle|b [options]

  --out, --out-dir <path>                          path to output directory for bundle
  --prebundle-out-dir, --prebundle-out <path>      path to output directory for prebundle
  --keep-prebundle-dir                             do not delete prebundle directory after bundling
  --include, --include-segments <segments...>      include segments
  --exclude, --exclude-segments <segments...>      exclude segments
  --schema, --schema-path <path>                   path to schema folder (default: .vovk-schema)
  --config, --config-path <config>                 path to config file
  --origin <url>                                   set the origin URL for the generated client
  --openapi, --openapi-spec <paths_or_urls...>     use OpenAPI mixins for client generation
  --openapi-module-name <names...>                 module name strategies, indexed against --openapi
  --openapi-method-name <names...>                 method name strategies, indexed against --openapi
  --openapi-root-url <urls...>                     root URLs, indexed against --openapi
  --openapi-mixin-name <names...>                  mixin names, indexed against --openapi
  --openapi-fallback <paths...>                    fallback files for --openapi URLs
  --log-level <level>                              set the log level
```

`--openapi-*` family is positional — one entry per spec to `--openapi`, matching entry at same index to each subsidiary flag. Lets you bundle client combining your own segments with OpenAPI mixins w/o touching config file (handy for one-off CI bundles).

## What's bundled, what's omitted

**Included:** all RPC modules (with `@operation`-driven types), `schema` named export, type inference helpers, `withDefaults` method on each module.

**Omitted:**

- **`openapi` object** (would inflate bundle size). Consumers needing OpenAPI spec should hit runtime endpoint serving it (see **`openapi`** skill).
- Separate **`schema` module entry point** — bundle is single-entry by design. `schema` named export still importable from package root, `<RpcModule>.<method>.schema` still on every method:

```ts
import { schema, UserRPC } from 'my-api-bundle';

console.log(schema.segments[''].controllers.UserRPC.handlers.getUser.validation.params);
console.log(UserRPC.getUser.schema.validation.params);
```

## Bundled SDK + `deriveTools`

Bundled modules feed `deriveTools` identically to native ones — same call sig, same `@operation` metadata, same tool surface:

```ts
import { UserRPC } from 'my-api-bundle';
import { deriveTools } from 'vovk';

const { tools } = deriveTools({ modules: { UserRPC } });
```

See **`tools`** skill for full pipeline.

## Flows

### "Publish a TypeScript SDK for my Vovk API"

1. Add `bundle` to `vovk.config.mjs` w/ `build` fn (use tsdown recipe above) and `outputConfig` containing `origin` + `package` block.
2. `npx vovk bundle`.
3. `npm publish dist`.

### "Bundle a subset of segments as a public SDK"

Set `bundle.outputConfig.includeSegments` (or pass `--include` on CLI) to ship only public-facing segments. Useful when `admin`/`internal` segments live in same Vovk app but only `public` ships to consumers.

### "Bundle our API combined with a third-party OpenAPI spec"

Either configure mixins in `vovk.config.mjs` (see **`mixins`** skill) and run `npx vovk bundle`, or use CLI's `--openapi*` flags for one-off:

```sh
npx vovk bundle \
  --openapi https://petstore3.swagger.io/api/v3/openapi.json \
  --openapi-module-name PetstoreAPI \
  --openapi-method-name auto \
  --openapi-root-url https://petstore3.swagger.io/api/v3
```

### "My bundle is too large"

Disable client-side validation: `bundle.outputConfig.imports.validateOnClient: null`. Most apps consuming typed SDK trust their own input; AJV adds runtime weight often unneeded post-publish.

### "Debug the prebundled TypeScript before bundling"

Set `bundle.keepPrebundleDir: true` (or pass `--keep-prebundle-dir`). `tmp_prebundle` survives bundle run so you can inspect generated `index.ts` and module sources.

## Gotchas

- **`bundle` is TypeScript-only.** Don't reach for Python/Rust SDKs — those use `vovk generate` with `py`/`pySrc`/`rs`/`rsSrc` templates + language-native publish commands. See **`python`** / **`rust`** skills.
- **Pin `tsdown@0.19.0`.** Docs warn tsdown's API may break between minor versions; recipe above validated against 0.19.0. No floating range until upstream stability confirmed.
- **`origin` required.** Without it, bundled client has no default API base URL and consumers must pass `apiRoot` on every call. Bake it in — or use `withDefaults` post-import as one-off.
- **`NextResponse` type inference needs `next` package** at consumer install time (Next.js limitation, not Vovk's). For dynamic response headers in bundled controller, return plain `Response` w/ manual type casting.
- **`openapi` module isn't bundled** — consumers needing spec should fetch from runtime endpoint (see **`openapi`** skill's `OpenApiController` pattern). Deliberate size choice.
- **No segmented bundle yet** — bundled package is single-entry. Segmented bundling (one package per segment) is roadmap item; for now, run `vovk bundle` once per segment-subset via `includeSegments` if you need separate packages.
- **Don't bake secrets.** API tokens and signing keys must not ship in published package. Document consumers configure auth themselves (via `withDefaults` or custom fetcher).
- **CI placement.** Bundle in release workflow triggered by tag or manual dispatch, not every PR. Build step heavier than `vovk generate` and produces artifact you don't want piling up in main-branch CI.
- **`package.json` defaults inherit from project root.** Set `bundle.outputConfig.package.name` (and `version`) explicitly when project root's name isn't a good public package name — almost always the case for Next.js apps named after product, not SDK.
