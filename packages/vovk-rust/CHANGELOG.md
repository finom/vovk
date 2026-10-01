# Changelog

All notable changes to `vovk-rust` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This package is experimental and its generated output may still shift between releases.

## 0.0.5 - unreleased

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
- Non-JSON success responses, JSON Lines without an `iteration` schema and `isError` in success data are read correctly ([#40](https://github.com/finom/vovk/pull/40))
- `HttpException` has `message()`, `status_code()` and `cause()`; one HTTP client per thread, and validators are cached ([#40](https://github.com/finom/vovk/pull/40))
- `vovk` is an optional peer dependency, since the package's types import from it ([#40](https://github.com/finom/vovk/pull/40))

## 0.0.4 - 2026-08-05

- Generated identifiers are valid Rust for free-form schema names: `user-profile`, keywords like `self`, and names that sanitize alike no longer emit broken or colliding code; serde keeps the wire name ([586f80c](https://github.com/finom/vovk/commit/586f80c0), [d108fad](https://github.com/finom/vovk/commit/d108fadc))
- Circular `$ref`s terminate, with cyclic named references boxed so types stay finite ([d108fad](https://github.com/finom/vovk/commit/d108fadc))
