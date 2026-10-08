# Changelog

All notable changes to `vovk-rust` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This package is experimental and its generated output may still shift between releases.

## 0.0.5 - unreleased

- **Breaking:** a procedure that takes JSON or a form, with no field that holds a file, takes its typed body and sends JSON; it took a `reqwest::multipart::Form`, so typed fields reached the server as text ([#44](https://github.com/finom/vovk/pull/44))
- Schema text can no longer break out of doc comments, comments or string literals into code ([#35](https://github.com/finom/vovk/pull/35))
- `["T", "null"]` maps to `Option<T>`, a bare `$ref` slot aliases its type, handler names avoid keywords ([#35](https://github.com/finom/vovk/pull/35))
- Path params and query keys are percent-encoded and `..` is refused ([#35](https://github.com/finom/vovk/pull/35))
- Stream error lines report their reason and status code; the client read a key the server never writes ([#35](https://github.com/finom/vovk/pull/35))
- The package ships its MIT license ([#35](https://github.com/finom/vovk/pull/35))
- Unset optional fields are left out instead of sent as `null` ([#40](https://github.com/finom/vovk/pull/40))
- The crate compiles for every tested schema shape: enum arrays, nullable enums and arrays, records, `any`, tuples, recursive unions, named non-object types ([#40](https://github.com/finom/vovk/pull/40))
- The schema is compiled into the crate, so a binary runs without the source tree ([#40](https://github.com/finom/vovk/pull/40))
- Per-segment `origin`, `rootEntry` and `segmentNameOverride`, and OpenAPI mixins, call the right URL ([#40](https://github.com/finom/vovk/pull/40))
- Number and boolean path params work, empty params are refused, declared text and urlencoded content types are sent ([#40](https://github.com/finom/vovk/pull/40))
- `number` is `f64`, `any` is `serde_json::Value`, a mixed enum reads each value ([#40](https://github.com/finom/vovk/pull/40))
- Validation follows JSON Schema 2020-12 (jsonschema 0.57, so Rust 1.85+) ([#40](https://github.com/finom/vovk/pull/40))
- A success that isn't JSON comes back as a string: text decoded by its charset, UTF-8 by default, and any other type, such as a file, as base64; JSON Lines without an `iteration` schema and `isError` in success data are read correctly ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- `HttpException` has `message()`, `status_code()` and `cause()`; one HTTP client per thread and runtime (tokio 1.49+), and validators are cached ([#40](https://github.com/finom/vovk/pull/40), [#51](https://github.com/finom/vovk/pull/51))
- `vovk` is an optional peer dependency, `^4.0.0-0`, since the package's types import from it ([#40](https://github.com/finom/vovk/pull/40), [#56](https://github.com/finom/vovk/pull/56))
- A procedure without a params schema takes the params its path names, as `HashMap<String, String>`, and the file variant of a file-or-JSON union body goes out as bytes ([#44](https://github.com/finom/vovk/pull/44))
- Requests: a header value goes out trimmed, and a header that is still invalid fails the call instead of being dropped; form field names with spaces or non-ASCII letters reach the server; a whole number goes into the query without `.0` ([#44](https://github.com/finom/vovk/pull/44))
- Responses: a status outside 2xx is an error, a redirect reqwest didn't follow included, whose message names the `Location`; an error without `message` takes its `detail` or `title` and keeps the JSON body as `cause()`; a failed call keeps reqwest's error as `source()`, without the URL; `application/jsonlines` is read as JSON Lines ([#44](https://github.com/finom/vovk/pull/44))
- Handler names alike in snake_case get a function each (`get_user_by_id`, `get_user_by_id_2`), `httpRequest` no longer clashes with the crate's own `http_request`, and the README headings name the functions the crate has ([#44](https://github.com/finom/vovk/pull/44))
- `Cargo.toml` declares `rust-version = "1.85"` and resolver 3, so Cargo picks dependencies that build on it; a project on edition 2021 without resolver 3 picks newer ones, which need Rust 1.88 ([#44](https://github.com/finom/vovk/pull/44))
- The crate builds without warnings, the README adds it with `cargo add` and starts with `readme.banner`, and a title or description that isn't a string is written as text ([#44](https://github.com/finom/vovk/pull/44))
- `set_client_factory` sets how the calls build their `reqwest::Client`, as with a timeout, a proxy or default headers ([#56](https://github.com/finom/vovk/pull/56))
- A mixin's query and urlencoded body follow the OpenAPI document's `style` and `explode`, as the TypeScript client sends them; without them an array repeats its key (`tags=a&tags=b`) ([#56](https://github.com/finom/vovk/pull/56))
- The error message is read where a mixin's `errorMessageKey` points, as the TypeScript client reads it ([#56](https://github.com/finom/vovk/pull/56))
- File fields are found in tuples and `allOf` too, by the same rule as vovk-python ([#56](https://github.com/finom/vovk/pull/56))
- A mixin body that takes one schema as JSON or as a form is that schema's type, not `Variant0`/`Variant1` ([#56](https://github.com/finom/vovk/pull/56))

## 0.0.4 - 2026-08-05

- Generated identifiers are valid Rust for free-form schema names: `user-profile`, keywords like `self`, and names that sanitize alike no longer emit broken or colliding code; serde keeps the wire name ([586f80c](https://github.com/finom/vovk/commit/586f80c0), [d108fad](https://github.com/finom/vovk/commit/d108fadc))
- Circular `$ref`s terminate, with cyclic named references boxed so types stay finite ([d108fad](https://github.com/finom/vovk/commit/d108fadc))
