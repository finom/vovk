# Changelog

All notable changes to `vovk-python` are documented here. This file is the canonical record; GitHub Releases are occasional announcements for headline versions and are generated from these entries.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This package is experimental and its generated output may still shift between releases.

## 0.0.3 — unreleased

### Added

- Named `$ref`s resolve into `TypedDict` classes instead of falling back to `Any`, and binary request bodies are detected from the declared content type.

### Fixed

- **Schema names are turned into valid Python identifiers.** A spec naming a component `google.protobuf.Timestamp` or `user-profile` previously emitted `class _Body_google.protobuf.Timestamp`, a syntax error that broke the whole generated module. Names that collide after sanitizing are kept apart.
- Cycles terminate: a `$ref` chain that loops back no longer recurses forever.
- Unknown or external `$ref`s fall back to `Any` rather than raising.

### Changed

- Tool derivation follows the `StandardToolV0` convention ([#27](https://github.com/finom/vovk/pull/27)).
