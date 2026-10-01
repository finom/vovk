# Changelog

All notable changes to `vovk-rust` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This package is experimental and its generated output may still shift between releases.

## 0.0.4 - unreleased

- Generated identifiers are valid Rust for free-form schema names: `user-profile`, keywords like `self`, and names that sanitize alike no longer emit broken or colliding code; serde keeps the wire name ([76138f6](https://github.com/finom/vovk/commit/76138f66), [ff201fa](https://github.com/finom/vovk/commit/ff201fa3))
- Circular `$ref`s terminate, with cyclic named references boxed so types stay finite ([ff201fa](https://github.com/finom/vovk/commit/ff201fa3))
