# Changelog

All notable changes to `vovk-cli` are documented here. This file is the canonical record; GitHub Releases are occasional announcements for headline versions and are generated from these entries.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.3.0-beta.0 — unreleased

A cleanup release. `vovk-cli` is pre-1.0, so this minor carries breaking changes: `^0.2.0` does not match `0.3.0`.

### Removed

- **The `vovk-client` package is retired.** The composed TypeScript client is generated into your source tree instead of `node_modules/.vovk-client`, so it survives `npm ci` and works under pnpm and Yarn PnP ([#29](https://github.com/finom/vovk/pull/29)).
- **The `js` template family** — `js`, `jsBase`, `schemaJs` and `openapiJs`. Use `ts`.
- **`prettier` is no longer a dependency.** Prettifying resolves prettier from your project; if `prettifyClient` is on and prettier is missing, the CLI warns once and writes unformatted output.
- Three unused runtime dependencies: `clone-deep`, `inflection` and `tar-stream`.
- The pinned `@rolldown/binding-linux-x64-gnu`. It was the only published `optionalDependency`, so every macOS and Windows user carried a linux binary for a bundler that is only a devDependency.
- The pre-kebab-case collision guard in `vovk new`, which existed only for the naming convention retired in vovk 4.

### Changed

- **Composed client defaults**: `fromTemplates` is `['ts']` and `outDir` is `src/client` when a `src` directory exists, otherwise `client/`.
- **`prettifyClient` defaults to `true`.**
- `vovk init` appends the composed client output directory to the project `.gitignore`, and no longer installs `vovk-client`.
- Broken input fails fast, and the CLI reports what it actually did rather than overstating success.

### Fixed

- **`vovk generate` no longer deletes directories holding files it did not write.** A directory is only removed when every file in it carries the generated banner, so hand-written files whose names collide with generated ones survive.
- **Schema output cleanup only deletes JSON files carrying vovk's own `$schema` id**, so a `schemaOutDir` pointing at a directory with your own JSON cannot wipe it.
- **A fetched schema's `segmentName` is no longer trusted as a write path.** A response naming `../package` is rejected, with a containment check in the writer as a second layer.
- **`vovk init` only spawns a known package manager** (`npm`, `yarn`, `pnpm`, `bun`). A cloned repository declaring `"packageManager": "./evil@1.0.0"` can no longer execute its own binary.
- `--prebundle-out-dir` takes effect and is kept inside the project.

### Upgrading from 0.2.x

1. Remove `vovk-client` from your dependencies and change imports from `vovk-client` to `@/client` (or a relative path to the configured `outDir`).
2. Replace `fromTemplates: ['js']` and friends with `['ts']`.
3. Install `prettier` yourself if you want the client formatted, or set `prettifyClient: false`.
4. Add the composed client output directory to `.gitignore`; `vovk init` does this for new projects.
5. A stale `node_modules/.vovk-client` is inert and can be deleted.
