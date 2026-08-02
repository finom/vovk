# Changelog

All notable changes to `vovk` are documented here. This file is the canonical record; GitHub Releases are occasional announcements for headline versions and are generated from these entries.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 4.0.0-beta.0 — unreleased

A cleanup major. Everything below that is marked breaking is a removal or a rename; no new APIs were added.

### Removed

- **`toolsByName`** is gone from the `deriveTools` return value. It now returns the tools array only ([#28](https://github.com/finom/vovk/pull/28)).
- **`VovkTool`, `createTool`, `parameters`, `type` and `inputSchemas`** are retired in favour of the `StandardToolV0` convention. The vendored type is exported from `vovk/internal` only ([#27](https://github.com/finom/vovk/pull/27)).
- **`vovk/createRPC` and `vovk/createValidateOnClient`** subpath exports. They were aliases kept to make the June 2026 kebab-case rename non-breaking inside 3.x. Use `vovk/create-rpc` and `vovk/create-validate-on-client`.
- Dead `nestjs-operation-id` name-strategy literals from the config types.

### Changed

- **`HttpStatus.TOO_MANY_TRequestS` is renamed to `HttpStatus.TOO_MANY_REQUESTS`.** The old spelling is gone.
- **`deriveTools` returns `StandardToolV0` tools**, and `toModelOutputDefault` is now async.
- **Error responses in production no longer carry internal detail.** Messages and causes for unexpected errors are withheld when `NODE_ENV` is production; `onError` still receives the full error.
- A declared `contentType` is enforced even when the procedure has no body schema. Turning off body validation opts out of that check too.

### Fixed

Client:

- `withDefaults` deep-merges when chained instead of replacing nested options.
- Path params are percent-encoded when the request URL is built, and an encoded slash stays inside its param.
- Non-ASCII `meta` is escaped so the `x-meta` header remains a valid ByteString.
- `Headers` instances survive RPC options, and `init.signal` is honoured rather than discarded.
- The stream error envelope no longer reaches `onIterate` subscribers.
- The progressive proxy is inspectable, and property access after the stream ends settles instead of hanging.
- The underlying stream is released when a consumer stops iterating early.
- Mid-stream errors reach fetcher `onError` callbacks.

Core:

- HTTP routes dispatch through the outermost decorator wrapper, so stacked decorators all run.
- Prototype members such as `constructor` and `toString` no longer resolve as route handlers.
- The route match cache is scoped to its handlers map, fixing cross-method cache poisoning.
- `JSONLinesResponder.close()` awaits pending sends.
- A malformed `x-meta` header responds 400 instead of throwing.
- `x-meta` is allowed in the default CORS `access-control-allow-headers`.
- Stream failures run `onError` and hide internal reasons.

Request parsing:

- Query keys that would reach `Object.prototype` are dropped.
- Query pairs split at the first `=` only, so values keep any later `=`.
- A large query index can no longer size a huge array.

OpenAPI:

- Derived path and query parameters merge with user-declared ones instead of replacing them.
- User `components.schemas` merge with derived component schemas.
- Circular `$ref`s terminate when code samples are built.

Validation and tools:

- A falsy handler output (`false`, `0`, `''`, `null`) is accepted when an output schema is set; only `undefined` is treated as a missing return.
- `Response` and generator results are materialized for the model.
- Derived tool failures are reported to `onError`.

### Security

- **`x-tsType` from a third-party OpenAPI spec is stripped on ingestion.** `compileTs` emits `x-tsType` verbatim as a TypeScript type, so a crafted value in a fetched spec could close the type literal and append statements, meaning importing the generated client executed code chosen by whoever hosted the spec. vovk sets its own `x-tsType` after stripping.
- Prototype-polluting query keys are dropped during request parsing (see above).
- Internal error detail is kept off the wire in production (see above).

### Upgrading from 3.x

1. Replace `HttpStatus.TOO_MANY_TRequestS` with `HttpStatus.TOO_MANY_REQUESTS`.
2. Replace imports from `vovk/createRPC` and `vovk/createValidateOnClient` with `vovk/create-rpc` and `vovk/create-validate-on-client`.
3. If you destructured `toolsByName` from `deriveTools`, build the map yourself from the returned array.
4. If you used `createTool` / `VovkTool` / `inputSchemas`, move to the `StandardToolV0` shape.
5. If you relied on error responses carrying internal messages in production, read them from `onError` instead.
6. The composed client no longer comes from the `vovk-client` package — see the `vovk-cli` changelog for the client generation changes.

## 3.5.0 — 2026-06-10

**`filterOperations` + `pruneComponents` for OpenAPI mixins.** Two opt-in `openAPIMixin` options that shrink clients generated from large OpenAPI specs ([#22](https://github.com/finom/vovk/pull/22)). `filterOperations` is a predicate deciding which operations are generated; `pruneComponents` drops components nothing references. Full notes: [release](https://github.com/finom/vovk/releases/tag/vovk-v3.5.0).

## 3.4.0 — 2026-05-30

**Merged `inputSchema`, the `standard-tool` convention, and per-call tool `meta`.** Full notes: [release](https://github.com/finom/vovk/releases/tag/vovk-v3.4.0).

## 3.2.2 — 2026-04-03

**Fetcher events, the `VovkInput` type, and LPC (`.fn`) compatibility for Next.js server actions.** Full notes: [release](https://github.com/finom/vovk/releases/tag/vovk-v3.2.2).

## 3.1.3 — 2026-03-21

**`decorate()` and `static prefix` — decorator-free procedures.** Full notes: [release](https://github.com/finom/vovk/releases/tag/vovk-v3.1.3).
