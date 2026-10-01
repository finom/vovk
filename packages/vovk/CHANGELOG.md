# Changelog

All notable changes to `vovk` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 4.0.0-beta.0 - unreleased

A cleanup major: removals and renames, no new APIs.

### Removed

- `toolsByName`: `deriveTools` returns the tools array only ([#28](https://github.com/finom/vovk/pull/28))
- `VovkTool`, `createTool`, `parameters`, `type` and `inputSchemas`: replaced by the `StandardToolV0` convention ([#27](https://github.com/finom/vovk/pull/27))
- `vovk/createRPC` and `vovk/createValidateOnClient` subpath aliases: use `vovk/create-rpc` and `vovk/create-validate-on-client` ([fd71067](https://github.com/finom/vovk/commit/fd710677))
- Dead `nestjs-operation-id` name-strategy literals ([2ae94a2](https://github.com/finom/vovk/commit/2ae94a2a))

### Changed

- `HttpStatus.TOO_MANY_TRequestS` renamed to `TOO_MANY_REQUESTS` ([900c3ed](https://github.com/finom/vovk/commit/900c3ed6))
- Production error responses carry no internal detail; `onError` still receives the full error ([6dbb795](https://github.com/finom/vovk/commit/6dbb795f), [e069b6c](https://github.com/finom/vovk/commit/e069b6ca))
- A declared `contentType` is enforced even without a body schema; disabling body validation opts out ([17156a3](https://github.com/finom/vovk/commit/17156a3d), [9b9460d](https://github.com/finom/vovk/commit/9b9460d4)); a request without a body skips the check ([#35](https://github.com/finom/vovk/pull/35))
- Failed `output` or `iteration` validation is an internal error: 500 in production, the issues stay on the server ([#35](https://github.com/finom/vovk/pull/35))
- Only an `HttpException` sets the status and keeps its message; any other error answers 500 and is masked in production, for AI tools too ([#35](https://github.com/finom/vovk/pull/35))
- `Content-Type` must name one media type, compared case-insensitively; a list answers 415 ([#35](https://github.com/finom/vovk/pull/35))
- The handler's second argument is the validated params ([#35](https://github.com/finom/vovk/pull/35))
- The client throws `HttpException` for a non-JSON response with a status of 400 or more, sends no `content-type` without a body, and sends a string body as the declared text type ([#35](https://github.com/finom/vovk/pull/35))
- HEAD requests fall back to the GET route ([#35](https://github.com/finom/vovk/pull/35))

### Fixed

- Stacked decorators all run: HTTP routes dispatch through the outermost wrapper ([572f7f0](https://github.com/finom/vovk/commit/572f7f0a))
- Prototype members such as `constructor` no longer resolve as route handlers ([24d727c](https://github.com/finom/vovk/commit/24d727cd))
- The route match cache is scoped to its handlers map, fixing cross-method poisoning ([bae0fde](https://github.com/finom/vovk/commit/bae0fde5))
- Path params are percent-encoded, and an encoded slash stays inside its param ([a41e23a](https://github.com/finom/vovk/commit/a41e23a1), [0ec1aef](https://github.com/finom/vovk/commit/0ec1aefb))
- Chained `withDefaults` deep-merges instead of replacing nested options ([a554d22](https://github.com/finom/vovk/commit/a554d22b))
- `Headers` instances and `init.signal` survive RPC options ([138296c](https://github.com/finom/vovk/commit/138296cd))
- Streaming: mid-stream errors reach `onError`, the error envelope stays out of `onIterate`, an abandoned iterator releases the stream ([78019dc](https://github.com/finom/vovk/commit/78019dc0), [89960e8](https://github.com/finom/vovk/commit/89960e8a), [3378c9b](https://github.com/finom/vovk/commit/3378c9bb))
- Falsy handler output (`false`, `0`, `''`, `null`) is accepted when an output schema is set ([a0bfec7](https://github.com/finom/vovk/commit/a0bfec71))
- Derived tools materialize `Response` and generator results, and failures reach `onError` ([7df7093](https://github.com/finom/vovk/commit/7df7093f), [b50e6e9](https://github.com/finom/vovk/commit/b50e6e97))
- Derived path/query parameters and `components.schemas` merge with user-declared ones ([dda4abf](https://github.com/finom/vovk/commit/dda4abfe), [0e1d735](https://github.com/finom/vovk/commit/0e1d7355))
- Malformed `x-meta` responds 400, `x-meta` is allowed in default CORS headers, non-ASCII meta is escaped ([569da87](https://github.com/finom/vovk/commit/569da871), [307282b](https://github.com/finom/vovk/commit/307282bd), [193385c](https://github.com/finom/vovk/commit/193385c7))
- JSON Lines: backpressure, the generator is returned when the client goes away, falsy items and split multi-byte characters survive, error lines carry `statusCode` ([#35](https://github.com/finom/vovk/pull/35))
- `notFound()`, `forbidden()` and `unauthorized()` reach Next.js instead of answering 500 ([#35](https://github.com/finom/vovk/pull/35))
- Malformed JSON, form and query input answers 400 ([#35](https://github.com/finom/vovk/pull/35))
- Routing: several params in one segment, a dynamic parent folder, `.auto()` with a params schema, a controller in two segments; route errors reach `onError` ([#35](https://github.com/finom/vovk/pull/35))
- CORS: PATCH in the allowed methods, the auto preflight skips auth hooks, headers apply to immutable responses ([#35](https://github.com/finom/vovk/pull/35))
- An empty multitenant `from` prefix matches every path ([#35](https://github.com/finom/vovk/pull/35))
- Client: `deepExtend` without `Buffer` and across VM realms, the URL built from validated input, typed form conversion, `apiRoot` without a leading slash, `Date` in the query ([#35](https://github.com/finom/vovk/pull/35))
- OpenAPI keeps unions, nullables and recursive schemas, names refs per handler and honors `segmentNameOverride` ([#35](https://github.com/finom/vovk/pull/35))
- Mixins: only HTTP methods become operations, path-level parameters merge in, `+json` and charset bodies are read, server variables are substituted, bodies are typed ([#35](https://github.com/finom/vovk/pull/35))
- Derived tool input schemas resolve their `$defs`; MCP output is valid for empty results and `+json` responses ([#35](https://github.com/finom/vovk/pull/35))
- The package ships the MIT license instead of a copy of package.json, and no stale modules from older builds ([#35](https://github.com/finom/vovk/pull/35))
- Query arrays of any length parse as arrays, and a record with numeric keys (`record[7]=on`) stays an object ([#38](https://github.com/finom/vovk/pull/38))

### Security

- `x-tsType` is stripped from third-party OpenAPI specs on ingestion; a crafted value could inject executable code into the generated client ([2b0064e](https://github.com/finom/vovk/commit/2b0064e0))
- Query parsing hardened: prototype-polluting keys dropped, pairs split at the first `=`, a large index cannot size a huge array ([271d51c](https://github.com/finom/vovk/commit/271d51c2), [17de08e](https://github.com/finom/vovk/commit/17de08ee), [0df2cc5](https://github.com/finom/vovk/commit/0df2cc58))
- A non-index bracket key such as `?a[-1]=x` no longer discards the value; it becomes an object key, matching `qs`
- Query keys naming inherited members (`hasOwnProperty[call]=1`) no longer write onto shared built-ins; a form `__proto__` field is skipped ([#35](https://github.com/finom/vovk/pull/35))
- A `Content-Type` list such as `text/plain; x=1,application/json` is refused, so a cross-origin request can't reach a JSON handler without a preflight ([#35](https://github.com/finom/vovk/pull/35))
- Route params are copied per request, and a literal `{param}` URL no longer runs a handler with empty params ([#35](https://github.com/finom/vovk/pull/35))
- The client refuses empty, `.` and `..` path params, also percent-encoded ([#35](https://github.com/finom/vovk/pull/35))

### Upgrading from 3.x

1. Replace `HttpStatus.TOO_MANY_TRequestS` with `HttpStatus.TOO_MANY_REQUESTS`.
2. Replace imports from `vovk/createRPC` and `vovk/createValidateOnClient` with `vovk/create-rpc` and `vovk/create-validate-on-client`.
3. If you destructured `toolsByName` from `deriveTools`, build the map yourself from the returned array.
4. If you used `createTool` / `VovkTool` / `inputSchemas`, move to the `StandardToolV0` shape.
5. If you relied on error responses carrying internal messages in production, read them from `onError` instead.
6. The composed client no longer comes from the `vovk-client` package; see the `vovk-cli` changelog.
7. A handler that read raw strings from its second argument now gets the validated params, coerced types included.
8. Throw `HttpException` for an expected error: another error with a `statusCode` now answers 500.

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
