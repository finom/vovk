# Changelog

All notable changes to `vovk-rust` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This package is experimental and its generated output may still shift between releases.

## 0.0.4 - unreleased

- Generated identifiers are valid Rust for free-form schema names: `user-profile`, keywords like `self`, and names that sanitize alike no longer emit broken or colliding code; serde keeps the wire name ([586f80c](https://github.com/finom/vovk/commit/586f80c0), [d108fad](https://github.com/finom/vovk/commit/d108fadc))
- Circular `$ref`s terminate, with cyclic named references boxed so types stay finite ([d108fad](https://github.com/finom/vovk/commit/d108fadc))
- Schema text can no longer break out of doc comments, comments or string literals into code ([#35](https://github.com/finom/vovk/pull/35))
- `["T", "null"]` maps to `Option<T>`, a bare `$ref` slot aliases its type, handler names avoid keywords ([#35](https://github.com/finom/vovk/pull/35))
- Path params and query keys are percent-encoded and `..` is refused ([#35](https://github.com/finom/vovk/pull/35))
- Stream error lines report their reason and status code; the client read a key the server never writes ([#35](https://github.com/finom/vovk/pull/35))
- The package ships its MIT license ([#35](https://github.com/finom/vovk/pull/35))
