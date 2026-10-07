# Changelog

All notable changes to `vovk` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 4.0.0-beta.0 - unreleased

A cleanup major: removals and renames; the only new exports are types.

### Removed

- `decorate()`: put its decorators on the member with `@`, as in `@get() static list = procedure({...}).handle(fn)` ([#44](https://github.com/finom/vovk/pull/44))
- The static `prefix` class property: use `@prefix()` on the class. A `static prefix` left in a class is ignored without an error, so its routes lose the prefix ([#44](https://github.com/finom/vovk/pull/44))
- `fetcher`, `createFetcher` and `VovkFetcher` from `vovk`: import them from `vovk/fetcher` ([#44](https://github.com/finom/vovk/pull/44))
- `createValidateOnClient` and `VovkValidateOnClient` from `vovk`: import them from `vovk/create-validate-on-client` ([#44](https://github.com/finom/vovk/pull/44))
- `DEFAULT_ERROR_MESSAGE`, `CreateFetcherOnSuccess` and `CreateFetcherOnError` from `vovk/fetcher` ([#44](https://github.com/finom/vovk/pull/44))
- The exports of `vovk/internal` that no vovk package uses, such as `vovkApp` and `withValidationLibrary`; `VovkHandlerSchema` comes from `vovk/create-rpc`, and `vovk/internal` is not public API ([#44](https://github.com/finom/vovk/pull/44))
- `toolsByName`: `deriveTools` returns the tools array only ([#28](https://github.com/finom/vovk/pull/28))
- `VovkTool`, `createTool`, `parameters`, `type` and `inputSchemas`: replaced by the `StandardToolV0` convention ([#27](https://github.com/finom/vovk/pull/27))
- `vovk/createRPC` and `vovk/createValidateOnClient` subpath aliases: use `vovk/create-rpc` and `vovk/create-validate-on-client` ([fd71067](https://github.com/finom/vovk/commit/fd710677))
- Dead `nestjs-operation-id` name-strategy literals ([2ae94a2](https://github.com/finom/vovk/commit/2ae94a2a))

### Changed

- `.fn()` is typed as it runs: it requires the body, query and params the server requires, and returns a promise of the handler's result, or of an async generator of the checked items with an `iteration` schema ([#44](https://github.com/finom/vovk/pull/44))
- `procedure()` type parameters: `TContentType` and a new `TPreferTransformed` come before `TReq`; a plain method typed `VovkRequest<string>` requires its body in the client ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- A call without a body gives the fetcher and `validateOnClient` `body: undefined`, not `null`; a `null` body goes out as JSON when the body schema accepts null, and is no body otherwise ([#44](https://github.com/finom/vovk/pull/44))
- Production error responses carry no internal detail; `onError` still receives the full error ([6dbb795](https://github.com/finom/vovk/commit/6dbb795f), [e069b6c](https://github.com/finom/vovk/commit/e069b6ca))
- A declared `contentType` is enforced even without a body schema; disabling body validation opts out ([17156a3](https://github.com/finom/vovk/commit/17156a3d), [9b9460d](https://github.com/finom/vovk/commit/9b9460d4)); a request without a body skips the check ([#35](https://github.com/finom/vovk/pull/35))
- Failed `output` or `iteration` validation is an internal error: 500 in production, the issues stay on the server ([#35](https://github.com/finom/vovk/pull/35))
- Only an `HttpException` sets the status and keeps its message; any other error answers 500 and is masked in production, for AI tools too ([#35](https://github.com/finom/vovk/pull/35))
- `Content-Type` must name one media type, compared case-insensitively; a list answers 415 ([#35](https://github.com/finom/vovk/pull/35))
- The handler's second argument is the validated params ([#35](https://github.com/finom/vovk/pull/35))
- The client throws `HttpException` for a non-JSON response with a status of 400 or more, sends no `content-type` without a body, and sends a string body as the declared text type, or as JSON to a method that declares none ([#35](https://github.com/finom/vovk/pull/35), [#40](https://github.com/finom/vovk/pull/40))
- HEAD requests fall back to the GET route ([#35](https://github.com/finom/vovk/pull/35))
- Repeated query keys collect into an array (`tag=a&tag=b` gives `['a','b']`), `[]` appends after the highest index, `a[][b]=1&a[][c]=2` is one element again, and `x=1&x[]=2` keeps the `1`; where the query schema takes an array, a key given once is a one-item array, as OpenAPI clients send it ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- A known path called with another method answers 405 with `Allow` instead of 404 ([#40](https://github.com/finom/vovk/pull/40))
- A CORS preflight approves only the methods whose route sets `cors`, and `access-control-allow-methods` lists only those ([#40](https://github.com/finom/vovk/pull/40))
- Two handlers on one method and path throw when the class is defined; one path in two controllers of a segment answers 500 ([#40](https://github.com/finom/vovk/pull/40))
- A request without a body, or with an empty one and a JSON content type, is validated as `undefined`: an optional body can be left out, a required one answers 400 instead of 415 ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- A type JSON Schema can't describe, such as `Date` or `bigint`, is emitted as `{}` instead of failing the segment's schema ([#40](https://github.com/finom/vovk/pull/40))
- The JSON Lines client reads only as fast as the consumer takes items and drops the items every running iteration has passed, so a consumed stream iterated again yields nothing ([#40](https://github.com/finom/vovk/pull/40))
- Client input types come from the schemas' input types, so `.default()` and `.transform()` work; `searchParams` is typed as the strings it returns; a handler without a params schema gets `Record<string, string>` ([#40](https://github.com/finom/vovk/pull/40))
- Mixin requests follow the OpenAPI document's `style`, `explode` and `encoding`; without one, arrays repeat their key (`tags=a&tags=b`) ([#40](https://github.com/finom/vovk/pull/40))
- The optional `next` peer dependency is gone, and the types no longer import `next` ([#40](https://github.com/finom/vovk/pull/40))
- Output and iteration JSON Schemas describe what the server sends, after defaults and transforms, unless `preferTransformed: false`; OpenAPI, the Python and Rust types and tool output schemas follow ([#44](https://github.com/finom/vovk/pull/44))
- `procedure()` with both `output` and `iteration` throws where it is defined; it answered 500 after the handler ran ([#44](https://github.com/finom/vovk/pull/44))
- `procedure()` warns for each schema that has no Standard JSON Schema; its JSON Schema is emitted as `{}`, any value ([#44](https://github.com/finom/vovk/pull/44))
- MCP output puts the `annotations` of `mcpOutput` on each content item, where MCP clients read them ([#44](https://github.com/finom/vovk/pull/44))
- The `vovk-cli-npx` bin, which `pnpm dlx vovk` and `yarn dlx vovk` run, starts the project's vovk-cli and falls back to `npx vovk-cli@latest` only without one ([#44](https://github.com/finom/vovk/pull/44))
- A `+` in the query is a space, as in `URLSearchParams`, so a literal `+` comes as `%2B`, as the vovk clients send it; under Next.js, v3 kept a raw `+` and read every space a client sent as `+` ([#35](https://github.com/finom/vovk/pull/35))
- `.fn()` of a bare procedure, and the tools derived from a module of bare procedures, run no controller's decorators; they ran those of the controller member decorated last ([#51](https://github.com/finom/vovk/pull/51))
- A controller serves the routes of the class it extends, and lists them in its schema and static params, only when that class is in the same segment or the controller has `@cloneControllerMetadata()`; the schema listed them always, and whether they answered depended on which segment loaded first ([#51](https://github.com/finom/vovk/pull/51))

### Added

- `StandardToolV0`, the type of the tools `deriveTools` returns; it was in `vovk/internal` ([#44](https://github.com/finom/vovk/pull/44))
- Types for declaration emit: `VovkRouteParams`, `VovkNoSchema`, `VovkProcedureInput` and `VovkNoInference` from `vovk`, and the types `createFetcher()` returns from `vovk/fetcher`; a route file, a procedure, a fetcher or a bundled client failed to emit its declarations with TS2883 ([#44](https://github.com/finom/vovk/pull/44))

### Fixed

- `HttpStatus.TOO_MANY_REQUESTS` was misspelled `TOO_MANY_TRequestS` ([900c3ed](https://github.com/finom/vovk/commit/900c3ed6))
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
- CORS: the auto preflight skips auth hooks, headers apply to immutable responses ([#35](https://github.com/finom/vovk/pull/35))
- An empty multitenant `from` prefix matches every path ([#35](https://github.com/finom/vovk/pull/35))
- Client: `deepExtend` without `Buffer` and across VM realms, the URL built from validated input, typed form conversion, `apiRoot` without a leading slash, `Date` in the query ([#35](https://github.com/finom/vovk/pull/35))
- OpenAPI keeps unions, nullables and recursive schemas, names refs per handler and honors `segmentNameOverride` ([#35](https://github.com/finom/vovk/pull/35))
- Mixins: only HTTP methods become operations, path-level parameters merge in, `+json` and charset bodies are read, server variables are substituted, bodies are typed ([#35](https://github.com/finom/vovk/pull/35))
- Derived tool input schemas resolve their `$defs`; MCP output is valid for empty results and `+json` responses ([#35](https://github.com/finom/vovk/pull/35))
- The package ships the MIT license instead of a copy of package.json, and no stale modules from older builds ([#35](https://github.com/finom/vovk/pull/35))
- Query arrays of any length parse as arrays, and a record with numeric keys (`record[7]=on`) stays an object ([#38](https://github.com/finom/vovk/pull/38))
- Responses: a result that can't be serialized answers a JSON 500 through `onError`; 204, 205 and 304 have no body; a status outside 200-599 becomes 500 ([#40](https://github.com/finom/vovk/pull/40))
- JSON Lines: `throw()` keeps its order and ends the stream, sends after `close()` are dropped, failed sends reach `onError`, `yield undefined` writes `null`, a sync generator works with an `iteration` schema, the generator is returned when `onSuccess` throws ([#40](https://github.com/finom/vovk/pull/40))
- Routing: `.auto()` with `skipSchemaEmission: ['params']` keeps its params, param names such as `{user-id}`, long paths stay out of the match cache ([#40](https://github.com/finom/vovk/pull/40))
- A guard or `onBefore` can read the body before validation, a chunked body counts as a body, and `filename*` names an uploaded file ([#40](https://github.com/finom/vovk/pull/40))
- `controllersToStaticParams` fills the prefix params, and its declared return type is valid ([#40](https://github.com/finom/vovk/pull/40))
- Client bodies follow the declared content type: strings, binary data, objects for a procedure that takes JSON and forms, `contentType` without a body schema, a `FormData` without files for a procedure that takes only urlencoded, and untyped bytes, as the Python and Rust clients send them ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- Client: HEAD and empty JSON responses give `null`, also without `Content-Length`, `+json` types are parsed, headers merge by name, `init.signal` works without `AbortSignal.any`, query arrays have no index gaps, `toJSON` values and lone surrogates are encoded, no trailing slash at a segment root, network errors keep their cause and name the URL once ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44), [#51](https://github.com/finom/vovk/pull/51))
- Types: `.transform()` to a primitive, generators without an `iteration` schema, `createRPC<T>` with one type argument, per-call `fetcher` and `validateOnClient`; the client entry points typecheck without Node types ([#40](https://github.com/finom/vovk/pull/40))
- Tools: a JSON Lines responder's items reach the model, an error status is an error, tool names are sanitized, capped at 64 characters and deduplicated, `execute(undefined)` works ([#40](https://github.com/finom/vovk/pull/40))
- OpenAPI output validates as 3.1: every path param is declared and required, `$ref` query and params schemas are resolved, object query params use `deepObject`, component names are sanitized ([#40](https://github.com/finom/vovk/pull/40))
- Mixins: `Mixins` type names match on both sides (accents kept, collisions numbered), controllers carry `prefix` and `originalControllerName`, `VovkStreamAsyncIterable` is exported, `rootEntry` reaches the client ([#40](https://github.com/finom/vovk/pull/40))
- Decorators: in a Turbopack build without `experimentalDecorators`, `@prefix()` and `cloneControllerMetadata()` work, where the prefix was dropped without an error; `@operation()` reaches the method's schema whatever its order with the HTTP decorator, so `deriveTools` keeps the tool ([#44](https://github.com/finom/vovk/pull/44))
- Requests: `req.clone()` works after body validation, also in a default Next.js route, and hidden validation (`exposeValidation: false`, `skipSchemaEmission`) keeps the declared content types, so form, text and file calls no longer get 415 ([#44](https://github.com/finom/vovk/pull/44), [#51](https://github.com/finom/vovk/pull/51))
- Procedures: an `output` schema that accepts `undefined` lets the handler return nothing, `validateEachIteration` with iteration validation turned off no longer answers 500, and `fn()` reads `Blob`, `ArrayBuffer`, typed array and `URLSearchParams` bodies as HTTP does ([#44](https://github.com/finom/vovk/pull/44))
- JSON Lines: `notFound()` (Next.js 15.0's too), `forbidden()` and `unauthorized()` thrown mid-stream send 404, 403 and 401 in the error line, and a status outside 200-599 there becomes 500 ([#44](https://github.com/finom/vovk/pull/44), [#51](https://github.com/finom/vovk/pull/51))
- A segment under a dynamic parent folder, such as `app/[lang]/api/[[...vovk]]`, passes `next build` on Next.js 15.5+ ([#44](https://github.com/finom/vovk/pull/44))
- Client: `rootEntry: ''` calls the root of the origin, a `Date` path param goes out as its ISO string, an `application/x-ndjson` response streams as JSON Lines, and client-side validation checks a falsy body such as `0` or `''` ([#44](https://github.com/finom/vovk/pull/44))
- `progressive()` works where `Promise.withResolvers` is missing (Safari before 17.4, Chrome before 119), and takes a key such as `constructor` or `__proto__` as any other ([#44](https://github.com/finom/vovk/pull/44))
- Client types: a key is there when its schema is given and optional when the server accepts a request without it, so `z.unknown()`, `z.preprocess()`, a `.optional()` body and an all-optional query work; a procedure without a params schema takes `params` as strings, a mixin keeps a primitive or union body, and none of it needs `strictNullChecks` ([#44](https://github.com/finom/vovk/pull/44))
- Handler types: `req.json()` and `searchParams` are typed as what the client sent, before defaults and transforms, and `searchParams` takes any key without a query schema; a handler with an `output` schema returns the schema's input, `preferTransformed: false` types what is sent, and a returned `Set`, `Map` or SDK stream is typed as the stream the client gets ([#44](https://github.com/finom/vovk/pull/44))
- Tools: the input is checked and transformed once under the AI SDK, where a transform ran twice and `z.stringbool()` failed; any iterable result, such as a sync generator or a `Set`, reaches the model as its items; a member that is neither a procedure nor an RPC method is left out instead of a tool that always fails ([#44](https://github.com/finom/vovk/pull/44))
- Mixins: a body with several content types keeps its file, a response given as a `$ref` gets its type, OpenAPI 3.0 `nullable` and boolean `exclusiveMinimum` and `exclusiveMaximum` validate as JSON Schema does, a read-only property isn't required in a request, `application/x-ndjson` reads as JSON Lines, a property named `x-tsType` is kept, a binary form field is typed `Blob`, and `pruneComponents` keeps every schema a kept operation reaches ([#44](https://github.com/finom/vovk/pull/44))
- OpenAPI: the document and the generated packages get version `0.0.0` when package.json has none, and the JSON Lines example of an item with `$defs` is no longer `null` ([#44](https://github.com/finom/vovk/pull/44))
- Code samples in generated READMEs and OpenAPI: Python and Rust samples call the names the clients have and run as written (`True`, `None`), text from a schema stays inside strings and comments, a method name that isn't an identifier is called with brackets, and a description that isn't a string is left out ([#44](https://github.com/finom/vovk/pull/44))
- A procedure that several controller members hold runs, in `.fn()` and in its tool, the decorators of the member it is called through; it ran those of the member decorated last ([#51](https://github.com/finom/vovk/pull/51))
- Route options (`before`, `headers`, `cors`) stay with their route when one procedure serves several routes; the options of one route applied to all of them ([#51](https://github.com/finom/vovk/pull/51))
- A decorated member that another controller reuses keeps its schema, its `@operation` data and its tool; the other controller's HTTP decorator replaced them ([#51](https://github.com/finom/vovk/pull/51))
- `fn()` always returns a promise: a sync decorator that throws rejects it, one that answers without `next()` resolves it, and with an `iteration` schema it gives an async generator also with `disableClientValidation` ([#51](https://github.com/finom/vovk/pull/51))
- A segment's or template's `package` option with a nested field, such as `author` or `repository`, stays in its own package; it was merged into the project's package.json object, so every other package got it ([#51](https://github.com/finom/vovk/pull/51))
- `controllersToStaticParams()` lists `_schema_` only in development, or for a segment with no other path, as `output: 'export'` needs one: a build wrote its 404 body, and a static export put it in `out`, where a static host serves it with 200 ([#51](https://github.com/finom/vovk/pull/51))
- A static segment pre-renders with no `dynamic` export, also with `cacheComponents` on: `next build` reads no request header, where reading `x-meta` made every route dynamic; a malformed `x-meta` still answers 400 ([#51](https://github.com/finom/vovk/pull/51))

### Security

- `x-tsType` is stripped from third-party OpenAPI specs on ingestion; a crafted value could inject executable code into the generated client ([2b0064e](https://github.com/finom/vovk/commit/2b0064e0))
- Query parsing hardened: prototype-polluting keys dropped, pairs split at the first `=`, a large index cannot size a huge array ([271d51c](https://github.com/finom/vovk/commit/271d51c2), [17de08e](https://github.com/finom/vovk/commit/17de08ee), [0df2cc5](https://github.com/finom/vovk/commit/0df2cc58))
- A non-index bracket key such as `?a[-1]=x` no longer discards the value; it becomes an object key, matching `qs`
- Query keys naming inherited members (`hasOwnProperty[call]=1`) no longer write onto shared built-ins; a form `__proto__` field is skipped ([#35](https://github.com/finom/vovk/pull/35))
- A `Content-Type` list such as `text/plain; x=1,application/json` is refused, so a cross-origin request can't reach a JSON handler without a preflight ([#35](https://github.com/finom/vovk/pull/35))
- Route params are copied per request, and a literal `{param}` URL no longer runs a handler with empty params ([#35](https://github.com/finom/vovk/pull/35))
- The client refuses empty, `.` and `..` path params, also percent-encoded ([#35](https://github.com/finom/vovk/pull/35))
- A 400 is no longer many times the size of its input: it lists at most 20 issues, each with its `message`, a `path` of keys and the library's text, number and boolean fields; a 1 MB body could produce a 91 MB response, and with Valibot, whose issues held copies of the input, a 2 MB body a 120 MB one ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- A query nested deeper than 32 levels answers 400 instead of overflowing the stack ([#40](https://github.com/finom/vovk/pull/40))
- multitenant: hosts match case-insensitively, only a DNS label is a wildcard value (a `%2e%2e` label could leave the tenant folder), only a `_schema_` path segment skips the rewrite ([#40](https://github.com/finom/vovk/pull/40))
- Derived tools send no `x-meta` to mixins, whose host is a third party ([#40](https://github.com/finom/vovk/pull/40))
- A form body that repeats one field name is parsed in linear time; a 500 KB body could stall the server for seconds, before validation ([#44](https://github.com/finom/vovk/pull/44))
- In production, an `HttpException` with status 0, which the client throws for a call that got no response or failed client-side validation, answers 500 with no detail, also in a stream: its message and cause could hold the URL, a credential in it, and the input ([#44](https://github.com/finom/vovk/pull/44))
- Lines a handler sends through `new JSONLinesResponder(req)` before it returns the responder are checked against the `iteration` schema, so keys the schema strips no longer go out ([#44](https://github.com/finom/vovk/pull/44))
- A crafted OpenAPI spec no longer makes code samples and form body types grow exponentially, which could exhaust memory in `vovk generate` and `vovk bundle` ([#44](https://github.com/finom/vovk/pull/44))

### Upgrading from 3.x

1. Replace imports from `vovk/createRPC` and `vovk/createValidateOnClient` with `vovk/create-rpc` and `vovk/create-validate-on-client`.
2. If you destructured `toolsByName` from `deriveTools`, build the map yourself from the returned array.
3. If you used `createTool` / `VovkTool` / `inputSchemas`, move to the `StandardToolV0` shape. `parameters` is `tool.inputSchema['~standard'].jsonSchema.input({ target: 'draft-2020-12' })` without `$schema`, and `type` was always `'function'`. For createTool's `{ error }` results use `withFormattedOutput(standardTool(def))` from standard-tool, and for MCP output `withFormattedOutput(tool, (result) => ToModelOutput.MCP(result, tool, null))`.
4. If you relied on error responses carrying internal messages in production, read them from `onError` instead.
5. The composed client no longer comes from the `vovk-client` package; see the `vovk-cli` changelog.
6. A handler that read raw strings from its second argument now gets the validated params, coerced types included.
7. Throw `HttpException` for an expected error: another error with a `statusCode` now answers 500.
8. A repeated query key now gives an array, so a plain string query field answers 400 for `tag=a&tag=b`.
9. Read a JSON Lines stream once, or call `asPromise()`: a consumed stream iterated again yields nothing.
10. `req.nextUrl.searchParams.get()` is typed as the string it returns; use `req.vovk.query()` for validated values.
11. Rewrite a `decorate(get(), ..., procedure(...)).handle(fn)` member as `@get() ... static name = procedure(...).handle(fn)`, and a `static prefix = 'users'` as `@prefix('users')` on the class: a `static prefix` is now ignored without an error.
12. Import `fetcher`, `createFetcher` and `VovkFetcher` from `vovk/fetcher`, and `createValidateOnClient` and `VovkValidateOnClient` from `vovk/create-validate-on-client`.
13. In a custom fetcher, a call without a body has `body: undefined`, not `null`.
14. A `+` in the query is a space, as in `URLSearchParams`; send a literal `+` as `%2B`, as the vovk clients do. Under Next.js, v3 kept a raw `+` and turned every space into `+`.
15. A string body to a method that declares no content type, such as a plain handler typed `VovkRequest<string>`, goes out as JSON, where v3 sent raw `text/plain`: `req.vovk.body()` still gives the string, `req.text()` now gives it quoted. To keep raw text, use a procedure with a text `contentType`.
16. `.fn()` of a bare procedure and the tools derived from a module of bare procedures run no controller's decorators: call `.fn()` on the controller member, or derive the tools from the controller, to run them.
17. A controller that extends another one serves the parent's routes only when the parent is in the same segment: otherwise add `@cloneControllerMetadata()` to it.

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
