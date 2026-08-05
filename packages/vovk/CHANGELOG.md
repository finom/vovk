# Changelog

All notable changes to `vovk` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 4.0.0-beta.0 - unreleased

A cleanup major: removals and renames, no new APIs.

### Removed

- `toolsByName`: `deriveTools` returns the tools array only ([#28](https://github.com/finom/vovk/pull/28))
- `VovkTool`, `createTool`, `parameters`, `type` and `inputSchemas`: replaced by the `StandardToolV0` convention ([#27](https://github.com/finom/vovk/pull/27))
- `vovk/createRPC` and `vovk/createValidateOnClient` subpath aliases: use `vovk/create-rpc` and `vovk/create-validate-on-client` ([b7dc4b2](https://github.com/finom/vovk/commit/b7dc4b2a))
- Dead `nestjs-operation-id` name-strategy literals ([3f84c25](https://github.com/finom/vovk/commit/3f84c253))

### Changed

- `HttpStatus.TOO_MANY_TRequestS` renamed to `TOO_MANY_REQUESTS` ([c739e4b](https://github.com/finom/vovk/commit/c739e4bc))
- Production error responses carry no internal detail; `onError` still receives the full error ([d0be248](https://github.com/finom/vovk/commit/d0be2482), [419cf7f](https://github.com/finom/vovk/commit/419cf7f6))
- A declared `contentType` is enforced even without a body schema; disabling body validation opts out ([444644b](https://github.com/finom/vovk/commit/444644b8), [27edb95](https://github.com/finom/vovk/commit/27edb95e))

### Fixed

- Stacked decorators all run: HTTP routes dispatch through the outermost wrapper ([18ce506](https://github.com/finom/vovk/commit/18ce5063))
- Prototype members such as `constructor` no longer resolve as route handlers ([8fa67bb](https://github.com/finom/vovk/commit/8fa67bb0))
- The route match cache is scoped to its handlers map, fixing cross-method poisoning ([6db95ff](https://github.com/finom/vovk/commit/6db95ff5))
- Path params are percent-encoded, and an encoded slash stays inside its param ([d2d9046](https://github.com/finom/vovk/commit/d2d90464), [0cb5aa4](https://github.com/finom/vovk/commit/0cb5aa40))
- Chained `withDefaults` deep-merges instead of replacing nested options ([4f53fc7](https://github.com/finom/vovk/commit/4f53fc78))
- `Headers` instances and `init.signal` survive RPC options ([fc61920](https://github.com/finom/vovk/commit/fc619204))
- Streaming: mid-stream errors reach `onError`, the error envelope stays out of `onIterate`, an abandoned iterator releases the stream ([b440310](https://github.com/finom/vovk/commit/b4403106), [06e99fa](https://github.com/finom/vovk/commit/06e99faa), [06b9c00](https://github.com/finom/vovk/commit/06b9c007))
- Falsy handler output (`false`, `0`, `''`, `null`) is accepted when an output schema is set ([dc8c6a3](https://github.com/finom/vovk/commit/dc8c6a38))
- Derived tools materialize `Response` and generator results, and failures reach `onError` ([7b7f1b8](https://github.com/finom/vovk/commit/7b7f1b87), [ff18ee5](https://github.com/finom/vovk/commit/ff18ee5d))
- Derived path/query parameters and `components.schemas` merge with user-declared ones ([d86bae0](https://github.com/finom/vovk/commit/d86bae0b), [6a174ac](https://github.com/finom/vovk/commit/6a174ac1))
- Malformed `x-meta` responds 400, `x-meta` is allowed in default CORS headers, non-ASCII meta is escaped ([5327a32](https://github.com/finom/vovk/commit/5327a327), [e34acae](https://github.com/finom/vovk/commit/e34acaea), [be58398](https://github.com/finom/vovk/commit/be583983))

### Security

- `x-tsType` is stripped from third-party OpenAPI specs on ingestion; a crafted value could inject executable code into the generated client ([c5e63cd](https://github.com/finom/vovk/commit/c5e63cd7))
- Query parsing hardened: prototype-polluting keys dropped, pairs split at the first `=`, a large index cannot size a huge array ([46aaadf](https://github.com/finom/vovk/commit/46aaadf7), [03522f3](https://github.com/finom/vovk/commit/03522f3f), [14bbc17](https://github.com/finom/vovk/commit/14bbc179))

### Upgrading from 3.x

1. Replace `HttpStatus.TOO_MANY_TRequestS` with `HttpStatus.TOO_MANY_REQUESTS`.
2. Replace imports from `vovk/createRPC` and `vovk/createValidateOnClient` with `vovk/create-rpc` and `vovk/create-validate-on-client`.
3. If you destructured `toolsByName` from `deriveTools`, build the map yourself from the returned array.
4. If you used `createTool` / `VovkTool` / `inputSchemas`, move to the `StandardToolV0` shape.
5. If you relied on error responses carrying internal messages in production, read them from `onError` instead.
6. The composed client no longer comes from the `vovk-client` package; see the `vovk-cli` changelog.

## 3.7.0 - 2026-06-11

- Kebab-case file naming and subpath exports across packages; camelCase aliases such as `vovk/createRPC` kept for compatibility ([#23](https://github.com/finom/vovk/pull/23))

## 3.5.0 - 2026-06-10

- `openAPIMixin.filterOperations` and `pruneComponents`: generate only the operations you call and drop components nothing references ([#22](https://github.com/finom/vovk/pull/22))

## 3.4.0 - 2026-05-30

- Merged `inputSchema`, one Standard Schema for body, query and params; per-slot `inputSchemas` deprecated ([#16](https://github.com/finom/vovk/pull/16))
- `VovkTool` follows the `standard-tool` convention, and `execute` takes per-call `meta` ([#18](https://github.com/finom/vovk/pull/18), [#19](https://github.com/finom/vovk/pull/19), [#20](https://github.com/finom/vovk/pull/20))

## 3.2.2 - 2026-04-03

- Fetcher `onSuccess`/`onError` assignable after initialization ([#3](https://github.com/finom/vovk/pull/3)), the `VovkInput` type ([#1](https://github.com/finom/vovk/pull/1)), and `.fn` LPC calls inside Next.js server actions ([#2](https://github.com/finom/vovk/pull/2))

## 3.1.3 - 2026-03-21

- `decorate()` and `static prefix`: controllers and procedures without decorator syntax ([docs](https://vovk.dev/decorator-overview))

Earlier history predates this changelog; see the git tags.
