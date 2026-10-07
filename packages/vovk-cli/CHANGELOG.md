# Changelog

All notable changes to `vovk-cli` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.3.0-beta.0 - unreleased

A cleanup release. `vovk-cli` is pre-1.0, so this minor carries breaking changes: `^0.2.0` does not match `0.3.0`.

### Removed

- The library entry: `main`, `types` and the `VovkEnv` type export. Importing `vovk-cli` ran the CLI; the `vovk` bin is unchanged ([#44](https://github.com/finom/vovk/pull/44))
- The `vovk-client` package: the composed client generates into your source tree (`src/client`, or `client/` without a `src` folder) and is imported as `@/client`, so it survives `npm ci` and works under pnpm and Yarn PnP ([#29](https://github.com/finom/vovk/pull/29))
- The `js` template family (`js`, `jsBase`, `schemaJs`, `openapiJs`): use `ts` ([#29](https://github.com/finom/vovk/pull/29))
- The `prettier` dependency: prettifying resolves prettier from your project and warns once when it is missing ([#29](https://github.com/finom/vovk/pull/29))
- The `gray-matter` dependency: template front matter is read with `yaml`. gray-matter pulled in js-yaml 3, argparse 1 and sprintf-js, which has an advisory with no fix ([#PR](https://github.com/finom/vovk/pull/PR))
- Unused runtime deps `clone-deep`, `inflection` and `tar-stream` ([7fd1e49](https://github.com/finom/vovk/commit/7fd1e49e)), the pinned linux rolldown binding ([8086a13](https://github.com/finom/vovk/commit/8086a130)), and the pre-kebab collision guard in `vovk new` ([fd71067](https://github.com/finom/vovk/commit/fd710677))

### Changed

- The default TypeScript client needs TypeScript 5.3+ for its JSON imports, and the controller and service pair `vovk new` writes needs 5.5+ ([#44](https://github.com/finom/vovk/pull/44))
- `vovk init` keeps a dependency range the project has when vovk works with it (zod 4.2+, valibot 1.2+, `@valibot/to-json-schema` 1.5+, arktype 2.1.28+), and names each range it replaces; it replaced zod 3 with zod 4 and logged it as added ([#44](https://github.com/finom/vovk/pull/44))
- `vovk init` reads versions from the registry npm uses, and when a lookup fails it prints the install command and exits 1; it used registry.npmjs.org and reported success with nothing added ([#44](https://github.com/finom/vovk/pull/44))
- `vovk init` writes `vovk generate` into the `build` script under Yarn 2+, which runs no `pre` scripts, and keeps a `dev` script that runs more than `next dev`, running it next to `vovk dev` with `concurrently` ([#44](https://github.com/finom/vovk/pull/44))
- `vovk generate` writes nothing and names both templates when two of them write the same file, as the Python and Rust READMEs of a segmented client did; give them separate output folders ([#44](https://github.com/finom/vovk/pull/44))
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
- The bin runs with plain `node`, so it works on Alpine; `engines.node` is `^22.22.2 || ^24.15.0 || >=26.0.0`, and before Node.js 22 every command names the version it needs instead of crashing ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- The `vovk` peer range is `>=3.7.0 || ^4.0.0-0`: 3.0-3.6 lack `vovk/create-rpc` ([#40](https://github.com/finom/vovk/pull/40))
- A Python or Rust client generated without `outputConfig.origin` warns that its calls can't be sent; set it, or pass `api_root` to every call ([#44](https://github.com/finom/vovk/pull/44))

### Added

- `vovk init --no-update-ts-config` leaves `tsconfig.json` without `experimentalDecorators`, which only webpack builds need ([#44](https://github.com/finom/vovk/pull/44))

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
- `vovk dev`: `--exit` and `--next-dev` exit 1 on failure, also when next dev stops first or a schema can't be used, `-p`/`--port` is read, `--schema-out` reaches the client, a removed segment leaves the client, rapid saves no longer leave schema requests pending, a corrupt schema file is replaced ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- The root segment name check ignores case, `--no-segment-update` works, `--watch` generates on start and reads a changed file once it is written in full, an invalid schema JSON fails ([#40](https://github.com/finom/vovk/pull/40))
- Pruning runs once after all writes and keeps other output folders and case-only renames ([#40](https://github.com/finom/vovk/pull/40))
- The bundle README follows the include/exclude and mixin flags; Python and Rust package names stay valid for a leading digit or a keyword ([#40](https://github.com/finom/vovk/pull/40))
- `vovk init --channel` falls back to `latest` for packages without that channel; the `.gitignore` entry and scripts work on Windows ([#40](https://github.com/finom/vovk/pull/40))
- Mixin types import what `vovk` exports, and non-ASCII or digit-led names give valid TypeScript ([#40](https://github.com/finom/vovk/pull/40))
- `origin: null` resets an inherited origin; a project without tsconfig imports `./schema` without `.ts` ([#40](https://github.com/finom/vovk/pull/40))
- A template definition's `composedClient` and `segmentedClient` options apply: `includeSegments`, `excludeSegments`, `outputConfig` and `prettifyClient` were ignored, so a client meant to leave segments out had them ([#44](https://github.com/finom/vovk/pull/44))
- `vovk dev`: the schema follows a renamed controller class, an edited service or validation module, and a fix after a failed schema request; a segment without a schema no longer holds back the client of the others ([#44](https://github.com/finom/vovk/pull/44))
- `vovk dev`: a segment that turns `emitSchema` off leaves the client `vovk generate` builds, and a deleted schema folder, a changed `schemaOutDir` or a checkout that swaps segments leaves no schema file missing or stale ([#44](https://github.com/finom/vovk/pull/44))
- `vovk dev` and `vovk generate --watch`: a watched folder removed and created again stays watched, a local OpenAPI mixin file is read again for each generation, and generations run one at a time, so the newest client is written last ([#44](https://github.com/finom/vovk/pull/44))
- `vovk dev` with OpenAPI mixins in the config: a filter that names a mixin no longer fails the start, a segmented mixin folder is kept, and an app with only mixins gets its client ([#44](https://github.com/finom/vovk/pull/44))
- `vovk dev` reports a 404 schema response once, naming the URL and a Next.js `basePath` as the likely cause ([#44](https://github.com/finom/vovk/pull/44))
- `vovk generate`: a global or `npx` vovk-cli loads the modules a template imports from the project, so `--from py` and `--from rs` work; `--schema-path` to another project's schema folder keeps its segments; a removed segment that holds another one loses its client files; build output in a segment folder brings no warning; a template folder copies its dotfiles and files without an extension ([#44](https://github.com/finom/vovk/pull/44))
- `py_name` and `rs_name` name the Python and Rust packages, not only the imports in the README samples, and a segmented client adds the segment to them ([#44](https://github.com/finom/vovk/pull/44))
- Under `node16` or `nodenext`, the client and `vovk new` import a `.ts` file by its `.js` name unless `allowImportingTsExtensions` or `rewriteRelativeImportExtensions` is set, and the client's JSON imports carry `with { type: "json" }` only where TypeScript takes it ([#44](https://github.com/finom/vovk/pull/44))
- Mixin types: an array of `allOf` items is `(A & B)[]`, a binary string is a `Blob`, a request type leaves out read-only properties and a response type write-only ones, `VovkOutput` and `VovkIteration` work on mixin methods, properties next to `additionalProperties` compile, a `true` schema is `unknown`, not `any`, and a `true` or `false` schema or a description that isn't a string no longer stops generation ([#44](https://github.com/finom/vovk/pull/44))

### Security

- A plain `tsType` key in an OpenAPI mixin spec is ignored; the type generator wrote it into `mixins.d.ts` as is, so a spec could add any TypeScript declaration ([#44](https://github.com/finom/vovk/pull/44))

### Upgrading from 0.2.x

1. Remove `vovk-client` from your dependencies and import from `@/client` (or a relative path to the configured `outDir`).
2. Replace `fromTemplates: ['js']` and friends with `['ts']`.
3. Install `prettier` yourself if you want the client formatted, or set `prettifyClient: false`.
4. Add the composed client output directory to `.gitignore`; `vovk init` does this for new projects.
5. A stale `node_modules/.vovk-client` is inert and can be deleted.
6. Use Node 22.22.2+, 24.15+ or 26+.
7. Use TypeScript 5.3+ for the generated client, 5.5+ for the controller and service pair `vovk new` writes.
8. Under Yarn 2+, move `vovk generate` from `prebuild` into the `build` script: Yarn 2+ runs no `pre` scripts.
