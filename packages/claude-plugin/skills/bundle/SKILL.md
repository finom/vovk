---
name: bundle
description: The Vovk.ts `vovk bundle` CLI for packaging the composed TypeScript client as a zero-dependency, publishable npm package — `bundle.build` async function, `tsdown@0.19.0` recipe, `outputConfig.origin` / `package` / `reExports` / `imports.validateOnClient: null`, `prebundleOutDir` / `outDir` / `keepPrebundleDir`, `--include`/`--exclude` segments, `--openapi-*` mixin flags. Use whenever the user asks to "publish my API client", "ship an SDK to npm", "build a publishable client package", "bundle the Vovk client", "generate a distributable npm SDK", "use tsdown with vovk", or any variation, including questions about why the bundled package omits `openapi`/`schema` entry points. Note: `vovk bundle` is **TypeScript-only**. For Python/PyPI publishing, hand off to **`python`** skill. For Rust/crates.io publishing, hand off to **`rust`** skill. Does NOT cover in-project `vovk-client` codegen → **`rpc`** skill.
---

# Vovk.ts `vovk bundle`

`vovk bundle` packages the **composed TypeScript client** as a zero-dependency npm package — pre-built JS + `.d.ts`, auto-generated `package.json`, auto-generated `README.md` with code samples, ready for `npm publish`. Think of it as the "release" step: `vovk generate` produces an in-project client during development; `vovk bundle` produces a distributable SDK other teams / services can install from the registry.

**TypeScript-only.** Despite the name, `vovk bundle` does not ship Python or Rust clients. Those have their own templates (`py` / `pySrc` / `rs` / `rsSrc`) and their own publishing flows — see **`python`** and **`rust`** skills.

## Scope

Covers:

- The 4-step bundle workflow.
- `bundle.build` async function (required) and the canonical `tsdown@0.19.0` recipe.
- `bundle.outputConfig` fields (`origin`, `package`, `reExports`, `imports`, `requires`, `readme`, `samples`, `includeSegments`/`excludeSegments`).
- Default directory layout (`tmp_prebundle` → `dist`).
- Full CLI flag list including the `--openapi-*` mixin family.
- What's bundled / what's omitted (no `openapi`, no `schema` entry point — but `schema` still importable as a named export).
- `npm publish dist` flow and consumer-side usage.
- Integration with `deriveTools` (bundled modules feed it identically).

Out of scope:

- In-project `vovk-client` generation → **`rpc`** skill.
- Python client publishing (PyPI) → **`python`** skill.
- Rust client publishing (crates.io) → **`rust`** skill.
- Mixin authoring (consumed here as bundle inputs) → **`mixins`** skill.

## `bundle` vs `generate`

| Command | Purpose | Output | When |
|---|---|---|---|
| `vovk generate` | In-project TypeScript client + OpenAPI spec | `node_modules/.vovk-client/`, `.vovk-schema/` | Every build (`prebuild` hook), on schema changes during `vovk dev`. |
| `vovk bundle` | Publishable npm package — pre-built JS + `.d.ts` + `package.json` + `README.md` | A `dist/` directory ready for `npm publish` | When you want to ship an SDK to consumers outside the Next.js app. |

Don't run `vovk bundle` in normal dev; the in-project client is faster. Bundle when you need a registry artifact.

## How bundling works

1. Vovk generates a TypeScript client into `prebundleOutDir` (default `tmp_prebundle`) using the `tsBase` template — uncompiled `.ts` source.
2. Vovk calls your `bundle.build({ entry, outDir, prebundleDir })` async function. Your function plugs in any bundler (tsdown is the only tested one) to compile `entry` (the `tmp_prebundle/index.ts` file) into JS + `.d.ts` under `outDir` (default `dist`).
3. Vovk emits `package.json` and `README.md` from the `packageJson` and `readme` templates into `outDir`.
4. Vovk deletes `prebundleOutDir` unless `keepPrebundleDir: true` (handy for debugging the prebundled source).

```sh
npx vovk bundle
npm publish dist
```

The published package is consumed exactly like `vovk-client`:

```ts
import { UserRPC } from 'my-api-bundle';

await UserRPC.getUser({ params: { id: '123' } });
```

All TypeScript-client features (call shape, `withDefaults`, type inference, `schema` access) survive the bundle.

## `bundle.build` — the required entry point

`bundle.build` is an async function. Vovk calls it with absolute paths:

```ts
build: async ({ entry, outDir, prebundleDir }) => {
  // entry        — absolute path to the prebundled tmp_prebundle/index.ts
  // outDir       — absolute path where the bundler should emit JS + .d.ts
  // prebundleDir — absolute path of the prebundle dir (rarely needed)
}
```

Vovk is bundler-agnostic — `esbuild`, `tsup`, `tsdown`, even a `child_process` shell-out work. Only **tsdown** is currently tested by Vovk's authors; the docs explicitly warn to **pin `tsdown@0.19.0`** until newer versions are confirmed compatible.

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

## `bundle.outputConfig` — what goes in the package

`bundle.outputConfig` accepts the same options as the root-level `outputConfig` (with bundle-specific overrides taking precedence). The fields that matter most:

| Field | Purpose |
|---|---|
| `origin` *(required)* | Default API base URL baked into the bundled client. Override at call time via `apiRoot` if needed. |
| `package` | Overrides for the generated `package.json`. Set `name`, `version`, `type`, `main`, `types`, `exports` here. Defaults pull from the project root `package.json` where present. |
| `imports.validateOnClient: null` | Disables client-side AJV validation in the bundled package — usually a big size win. |
| `imports.fetcher` | Custom fetcher path baked into the bundle. |
| `reExports` | Additional named exports in the generated `index.ts`. E.g. `{ doSomething: './src/utils' }` exposes a helper alongside the RPC modules. |
| `requires` | Template directory overrides — `readme`, `packageJson`, or any custom template. Defaults to the project root for both. |
| `readme.banner` | String prepended to the generated `README.md` (e.g. badges, logo HTML, status callouts). |
| `readme.installCommand` | Override the install command shown in the README (default: `npm install <package-name>`). Useful for monorepo / private-registry / `pnpm` / `yarn`-first audiences. |
| `readme.description` | Replaces the description block in the README. Defaults to the bundled `package.json` description. |
| `samples.apiRoot` | Base URL used in generated code samples in the README. Defaults to `outputConfig.origin`. Set this to a public-facing URL when `origin` points to staging or an internal hostname. |
| `samples.headers` | Header map (e.g. `{ Authorization: 'Bearer YOUR_TOKEN' }`) shown in the generated code samples — illustrates how consumers should authenticate. |
| `includeSegments` / `excludeSegments` | Filter which Vovk segments contribute to the bundle. |

The minimum viable `outputConfig` is `origin` + a `package` block with `main`/`types`/`exports` matching the bundler's output filenames.

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

The `--openapi-*` family is positional — pass one entry per spec to `--openapi` and the corresponding entry at the same index to each subsidiary flag. This lets you bundle a client that combines your own segments with one or more OpenAPI mixins without touching the config file (handy for one-off bundles in CI).

## What's bundled, what's omitted

**Included:** all RPC modules (with `@operation`-driven types), the `schema` named export, type inference helpers, the `withDefaults` method on each module.

**Omitted:**

- The **`openapi` object** (would significantly inflate bundle size). Consumers needing the OpenAPI spec should hit a runtime endpoint that serves it (see **`openapi`** skill).
- A separate **`schema` module entry point** — the bundle is single-entry by design. The `schema` named export is still importable from the package root, and `<RpcModule>.<method>.schema` is still on every method:

```ts
import { schema, UserRPC } from 'my-api-bundle';

console.log(schema.segments[''].controllers.UserRPC.handlers.getUser.validation.params);
console.log(UserRPC.getUser.schema.validation.params);
```

## Bundled SDK + `deriveTools`

Bundled modules feed `deriveTools` identically to native ones — same call signature, same `@operation` metadata, same tool surface:

```ts
import { UserRPC } from 'my-api-bundle';
import { deriveTools } from 'vovk';

const { tools } = deriveTools({ modules: { UserRPC } });
```

See **`tools`** skill for the full pipeline.

## Flows

### "Publish a TypeScript SDK for my Vovk API"

1. Add `bundle` to `vovk.config.mjs` with a `build` function (use the tsdown recipe above) and an `outputConfig` containing `origin` + a `package` block.
2. `npx vovk bundle`.
3. `npm publish dist`.

### "Bundle a subset of segments as a public SDK"

Set `bundle.outputConfig.includeSegments` (or pass `--include` on the CLI) to ship only the public-facing segments. Useful when `admin` and `internal` segments live in the same Vovk app but only `public` should ship to consumers.

### "Bundle our API combined with a third-party OpenAPI spec"

Either configure mixins in `vovk.config.mjs` (see **`mixins`** skill) and run `npx vovk bundle`, or use the CLI's `--openapi*` flags for a one-off:

```sh
npx vovk bundle \
  --openapi https://petstore3.swagger.io/api/v3/openapi.json \
  --openapi-module-name PetstoreAPI \
  --openapi-method-name auto \
  --openapi-root-url https://petstore3.swagger.io/api/v3
```

### "My bundle is too large"

Disable client-side validation in the bundled package: `bundle.outputConfig.imports.validateOnClient: null`. Most apps that consume a typed SDK trust their own input; AJV adds runtime weight that's often unnecessary post-publish.

### "Debug the prebundled TypeScript before bundling"

Set `bundle.keepPrebundleDir: true` (or pass `--keep-prebundle-dir`). The `tmp_prebundle` directory survives the bundle run so you can inspect the generated `index.ts` and module sources.

## Gotchas

- **`bundle` is TypeScript-only.** Don't reach for it for Python or Rust SDKs — those use `vovk generate` with the `py`/`pySrc`/`rs`/`rsSrc` templates plus their language-native publish commands. See **`python`** / **`rust`** skills.
- **Pin `tsdown@0.19.0`.** The Vovk docs explicitly warn that tsdown's API may break between minor versions; the recipe above is validated against 0.19.0. Don't take a floating range until upstream stability is confirmed.
- **`origin` is required.** Without it, the bundled client has no default API base URL and consumers must pass `apiRoot` on every call. Bake it in — or use `withDefaults` post-import as a one-off.
- **`NextResponse` type inference needs the `next` package** present at consumer install time (Next.js limitation, not Vovk's). For dynamic response headers in a controller you bundle, return a plain `Response` with manual type casting.
- **The `openapi` module isn't bundled** — consumers needing the spec should fetch it from a runtime endpoint (see **`openapi`** skill's `OpenApiController` pattern). This is a deliberate size choice.
- **No segmented bundle yet** — the bundled package is single-entry. Segmented bundling (one package per segment) is a roadmap item; for now, run `vovk bundle` once per segment-subset using `includeSegments` if you genuinely need separate packages.
- **Don't bake secrets.** API tokens and signing keys must not be committed to a published package. Document that consumers configure auth themselves (via `withDefaults` or a custom fetcher).
- **CI placement.** Bundle in a release workflow triggered by tag or manual dispatch, not on every PR. The build step is heavier than `vovk generate` and produces an artifact you don't want piling up in main-branch CI runs.
- **`package.json` defaults inherit from the project root.** Set `bundle.outputConfig.package.name` (and `version`) explicitly when the project root's name isn't a good public package name — that's almost always the case for Next.js apps named after the product, not the SDK.
