# Changelog

All notable changes to `vovk-cli` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.3.0-beta.0 - unreleased

A cleanup release. `vovk-cli` is pre-1.0, so this minor carries breaking changes: `^0.2.0` does not match `0.3.0`.

### Removed

- The `vovk-client` package: the composed client generates into your source tree (`src/client`, or `client/` without a `src` folder) and is imported as `@/client`, so it survives `npm ci` and works under pnpm and Yarn PnP ([#29](https://github.com/finom/vovk/pull/29))
- The `js` template family (`js`, `jsBase`, `schemaJs`, `openapiJs`): use `ts` ([#29](https://github.com/finom/vovk/pull/29))
- The `prettier` dependency: prettifying resolves prettier from your project and warns once when it is missing ([#29](https://github.com/finom/vovk/pull/29))
- Unused runtime deps `clone-deep`, `inflection` and `tar-stream` ([25a2f20](https://github.com/finom/vovk/commit/25a2f203)), the pinned linux rolldown binding ([d0cae19](https://github.com/finom/vovk/commit/d0cae19c)), and the pre-kebab collision guard in `vovk new` ([b7dc4b2](https://github.com/finom/vovk/commit/b7dc4b2a))

### Changed

- Composed client defaults: `fromTemplates: ['ts']`, `outDir: src/client`, `prettifyClient: true`; `vovk init` gitignores the client dir and no longer installs `vovk-client` ([#29](https://github.com/finom/vovk/pull/29))
- Broken input fails fast, and the CLI reports what it actually did ([0ad9872](https://github.com/finom/vovk/commit/0ad9872e))

### Fixed

- The pruner only deletes files carrying the generated banner, so user files named like generated ones survive ([e9f269c](https://github.com/finom/vovk/commit/e9f269ce), [88065d0](https://github.com/finom/vovk/commit/88065d0c))
- Schema output cleanup only deletes JSON carrying vovk's own `$schema` id ([9816dda](https://github.com/finom/vovk/commit/9816dda4))
- A fetched schema's `segmentName` is no longer trusted as a write path ([d93a240](https://github.com/finom/vovk/commit/d93a240c))
- `vovk init` only spawns a known package manager, never a path from `packageManager` ([053cb1a](https://github.com/finom/vovk/commit/053cb1a8))
- `--prebundle-out-dir` takes effect and stays inside the project ([22f505c](https://github.com/finom/vovk/commit/22f505c6))
- `vovk new segment` scaffolds `force-static` for static segments ([#25](https://github.com/finom/vovk/pull/25))

### Upgrading from 0.2.x

1. Remove `vovk-client` from your dependencies and import from `@/client` (or a relative path to the configured `outDir`).
2. Replace `fromTemplates: ['js']` and friends with `['ts']`.
3. Install `prettier` yourself if you want the client formatted, or set `prettifyClient: false`.
4. Add the composed client output directory to `.gitignore`; `vovk init` does this for new projects.
5. A stale `node_modules/.vovk-client` is inert and can be deleted.
