# Changelog

All notable changes to `vovk-cli` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.3.0-beta.0 - unreleased

A cleanup release. `vovk-cli` is pre-1.0, so this minor carries breaking changes: `^0.2.0` does not match `0.3.0`.

### Removed

- The `vovk-client` package: the composed client generates into your source tree (`src/client`, or `client/` without a `src` folder) and is imported as `@/client`, so it survives `npm ci` and works under pnpm and Yarn PnP ([#29](https://github.com/finom/vovk/pull/29))
- The `js` template family (`js`, `jsBase`, `schemaJs`, `openapiJs`): use `ts` ([#29](https://github.com/finom/vovk/pull/29))
- The `prettier` dependency: prettifying resolves prettier from your project and warns once when it is missing ([#29](https://github.com/finom/vovk/pull/29))
- Unused runtime deps `clone-deep`, `inflection` and `tar-stream` ([7fd1e49](https://github.com/finom/vovk/commit/7fd1e49e)), the pinned linux rolldown binding ([8086a13](https://github.com/finom/vovk/commit/8086a130)), and the pre-kebab collision guard in `vovk new` ([fd71067](https://github.com/finom/vovk/commit/fd710677))

### Changed

- Composed client defaults: `fromTemplates: ['ts']`, `outDir: src/client`, `prettifyClient: true`; `vovk init` gitignores the client dir and no longer installs `vovk-client` ([#29](https://github.com/finom/vovk/pull/29))
- Broken input fails fast, and the CLI reports what it actually did ([93ae307](https://github.com/finom/vovk/commit/93ae3073))
- `getMethodName: 'auto'` treats only `{param}` segments as params: `GET /users` is `listUsers` (was `getByUsers`), `GET /users/{id}` is `getUsersById`; a name taken twice gets `_2` instead of overwriting ([#35](https://github.com/finom/vovk/pull/35))
- The generated-file banner has no timestamp, and files are compared whole: unchanged sources leave committed files alone, and a CLI upgrade rewrites them once ([3001c89](https://github.com/finom/vovk/commit/3001c89b), [#35](https://github.com/finom/vovk/pull/35))
- A segment named `root` is refused: it would share the root segment's files ([#35](https://github.com/finom/vovk/pull/35))
- `vovk generate` refuses to overwrite files it didn't generate; `--force` overrides ([#40](https://github.com/finom/vovk/pull/40))
- Segmented Python and Rust clients put a whole package in each segment folder, named after the project and the segment ([#40](https://github.com/finom/vovk/pull/40))
- `vovk init` chains existing `prebuild` and `bundle` scripts, moves a customized config to `.bak`, and detects the package manager from the lockfile ([#40](https://github.com/finom/vovk/pull/40))
- `vovk new` writes all files of a module or none, unless `--overwrite` is given ([#40](https://github.com/finom/vovk/pull/40))
- A config that is ESM or contains `import(` loads through Node, so its imports resolve from the config file; remote OpenAPI mixins are fetched only to generate a client ([#40](https://github.com/finom/vovk/pull/40))
- Generation fails for a mixin named `root` or like a segment, and for one module name in two segments of the composed client; unnamed CLI mixins get `api`, `api2` and so on ([#40](https://github.com/finom/vovk/pull/40))
- The bin runs with plain `node`, so it works on Alpine; `engines.node` is `^22.22.2 || ^24.15.0 || >=26.0.0` ([#40](https://github.com/finom/vovk/pull/40))
- The `vovk` peer range is `>=3.7.0 || ^4.0.0-0`: 3.0-3.6 lack `vovk/create-rpc` ([#40](https://github.com/finom/vovk/pull/40))

### Fixed

- The pruner only deletes files carrying the generated banner, so user files named like generated ones survive ([73113d0](https://github.com/finom/vovk/commit/73113d0b), [a90fd66](https://github.com/finom/vovk/commit/a90fd669))
- Schema output cleanup only deletes JSON carrying vovk's own `$schema` id ([36265f2](https://github.com/finom/vovk/commit/36265f2b))
- A fetched schema's `segmentName` is no longer trusted as a write path ([5a2e564](https://github.com/finom/vovk/commit/5a2e564f))
- `vovk init` only spawns a known package manager, never a path from `packageManager` ([9d99797](https://github.com/finom/vovk/commit/9d99797b))
- `--prebundle-out-dir` takes effect and stays inside the project ([23c58dc](https://github.com/finom/vovk/commit/23c58dc2))
- `vovk new segment` scaffolds `force-static` for static segments ([#25](https://github.com/finom/vovk/pull/25))
- Windows: template and schema lookups find their files, and import paths in generated code use `/` ([#35](https://github.com/finom/vovk/pull/35))
- `vovk dev --next-dev` runs from a path with spaces, and asks only the local dev server for schemas ([#35](https://github.com/finom/vovk/pull/35))
- The pruner removes only folders whose every file the generator wrote ([#35](https://github.com/finom/vovk/pull/35))
- Python and Rust package names from a scoped or missing `name` are valid ([#35](https://github.com/finom/vovk/pull/35))
- One-line template output updates, every front matter import is kept, `.cjs` configs are watched ([#35](https://github.com/finom/vovk/pull/35))
- `vovk new` pluralizes whole words: `inbox` gives `inboxes`, not `inboxen` ([#35](https://github.com/finom/vovk/pull/35))
- Absolute `modulesDir`, `--schema-out` and `--out` paths work, circular template `requires` throw, `vovk init` installs on Windows ([#35](https://github.com/finom/vovk/pull/35))
- Mixin types: quoted property names, `allOf` with sibling properties, `nullable`, names starting with a digit ([#35](https://github.com/finom/vovk/pull/35))
- A segmented client resolves relative `imports` from its own folder ([#35](https://github.com/finom/vovk/pull/35))
- `vovk bundle` refuses a prebundle folder that overlaps its output, or that holds other files and is not kept: `--prebundle-out src` deleted `src/` ([#40](https://github.com/finom/vovk/pull/40))
- `devHttps` turns TLS checks off for the local schema request only, not for every fetch in the process ([#40](https://github.com/finom/vovk/pull/40))
- `vovk dev`: `--exit` and `--next-dev` exit 1 on failure, `-p`/`--port` is read, `--schema-out` reaches the client, a removed segment leaves the client, rapid saves no longer leave schema requests pending, a corrupt schema file is replaced ([#40](https://github.com/finom/vovk/pull/40))
- The root segment name check ignores case, `--no-segment-update` works, `--watch` generates on start and reads a changed file once it is written in full, an invalid schema JSON fails ([#40](https://github.com/finom/vovk/pull/40))
- Pruning runs once after all writes and keeps other output folders and case-only renames ([#40](https://github.com/finom/vovk/pull/40))
- The bundle README follows the include/exclude and mixin flags; Python and Rust package names stay valid for a leading digit or a keyword ([#40](https://github.com/finom/vovk/pull/40))
- `vovk init --channel` falls back to `latest` for packages without that channel; the `.gitignore` entry and scripts work on Windows ([#40](https://github.com/finom/vovk/pull/40))
- Mixin types import what `vovk` exports, and non-ASCII or digit-led names give valid TypeScript ([#40](https://github.com/finom/vovk/pull/40))
- `origin: null` resets an inherited origin; a project without tsconfig imports `./schema` without `.ts` ([#40](https://github.com/finom/vovk/pull/40))

### Upgrading from 0.2.x

1. Remove `vovk-client` from your dependencies and import from `@/client` (or a relative path to the configured `outDir`).
2. Replace `fromTemplates: ['js']` and friends with `['ts']`.
3. Install `prettier` yourself if you want the client formatted, or set `prettifyClient: false`.
4. Add the composed client output directory to `.gitignore`; `vovk init` does this for new projects.
5. A stale `node_modules/.vovk-client` is inert and can be deleted.
6. Use Node 22.22.2+, 24.15+ or 26+.
