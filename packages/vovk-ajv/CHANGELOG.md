# Changelog

All notable changes to `vovk-ajv` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed

- Formats Ajv doesn't know, such as Zod's `cuid` or `e164`, no longer fail compilation and block the request ([#35](https://github.com/finom/vovk/pull/35))
- An object body sent as form data is validated before the conversion, so numbers and arrays keep their types ([#35](https://github.com/finom/vovk/pull/35))
- Compiled validators are cached per schema instead of rebuilt on every call ([#35](https://github.com/finom/vovk/pull/35))
- The `types` condition comes first in `exports` ([232022d](https://github.com/finom/vovk/commit/232022d3))
