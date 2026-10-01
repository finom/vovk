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

### Upgrading from 0.2.x

1. Remove `vovk-client` from your dependencies and import from `@/client` (or a relative path to the configured `outDir`).
2. Replace `fromTemplates: ['js']` and friends with `['ts']`.
3. Install `prettier` yourself if you want the client formatted, or set `prettifyClient: false`.
4. Add the composed client output directory to `.gitignore`; `vovk init` does this for new projects.
5. A stale `node_modules/.vovk-client` is inert and can be deleted.
