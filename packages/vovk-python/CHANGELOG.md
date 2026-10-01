# Changelog

All notable changes to `vovk-python` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This package is experimental and its generated output may still shift between releases.

## 0.0.3 - unreleased

- Named `$ref`s resolve into `TypedDict` classes, and binary bodies are detected from the content type ([5ecf779](https://github.com/finom/vovk/commit/5ecf7793))
- Schema names become valid Python identifiers: `google.protobuf.Timestamp` no longer emits a syntax error that breaks the generated module ([316c17d](https://github.com/finom/vovk/commit/316c17d2))
- `$ref` cycles terminate, and unknown refs fall back to `Any` ([5ecf779](https://github.com/finom/vovk/commit/5ecf7793))
- Schema text can no longer run code on import: docstrings, comments, strings and enum literals are escaped ([#35](https://github.com/finom/vovk/pull/35))
- Keys that are not Python names (`from`, `content-type`) use the functional `TypedDict` syntax; class and method names avoid keywords ([#35](https://github.com/finom/vovk/pull/35))
- Path params and query keys are percent-encoded, `..` is refused, booleans go out as `true`/`false` ([#35](https://github.com/finom/vovk/pull/35))
- A bare `$ref` body gets its `body` and `files` parameters, `allOf` merges `$ref` members, docs read the v4 `operationObject` ([#35](https://github.com/finom/vovk/pull/35))
- Stream error lines raise `HttpException` with their status code ([#35](https://github.com/finom/vovk/pull/35))
- The package ships its MIT license ([#35](https://github.com/finom/vovk/pull/35))
