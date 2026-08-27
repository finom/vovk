# Changelog

All notable changes to `vovk-python` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This package is experimental and its generated output may still shift between releases.

## 0.0.3 - unreleased

- Named `$ref`s resolve into `TypedDict` classes, and binary bodies are detected from the content type ([d1b05b6](https://github.com/finom/vovk/commit/d1b05b65))
- Schema names become valid Python identifiers: `google.protobuf.Timestamp` no longer emits a syntax error that breaks the generated module ([d5700a3](https://github.com/finom/vovk/commit/d5700a3d))
- `$ref` cycles terminate, and unknown refs fall back to `Any` ([d1b05b6](https://github.com/finom/vovk/commit/d1b05b65))
