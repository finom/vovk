# Changelog

All notable changes to `vovk-ajv` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Removed

- `validateOnClient.configure()`: set the Ajv options and the target draft under `libs.ajv` in `vovk.config` ([#44](https://github.com/finom/vovk/pull/44))

### Changed

- Strict mode is off by default, so `example`, `x-*` and other annotations no longer block the request; options still override it ([#40](https://github.com/finom/vovk/pull/40))
- A schema Ajv can't compile skips client-side validation with a warning; the server still validates ([#40](https://github.com/finom/vovk/pull/40))
- The `vovk` peer range is `>=3.7.0 || ^4.0.0-0` ([#40](https://github.com/finom/vovk/pull/40))

### Fixed

- Where Ajv can't generate code, as under a Content Security Policy without `'unsafe-eval'`, client-side validation is skipped with one warning and the server validates; every call with a schema failed with status 0 and sent no request. An Ajv option error still throws ([#51](https://github.com/finom/vovk/pull/51))
- Params and query values are checked as the strings a URL carries, so `z.coerce.number()` fields pass; the check runs on a copy, so what goes out stays as given, also with `useDefaults` ([#44](https://github.com/finom/vovk/pull/44))
- A falsy body, such as `0`, `''`, `false` or `null`, is validated; only `undefined`, no body, is skipped ([#44](https://github.com/finom/vovk/pull/44))
- Patterns are read with the `u` flag, so `\p{...}` patterns such as `z.emoji()` pass, and without it when the `u` flag refuses them, so escapes such as `\-` compile ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- OpenAPI 3.0 boolean `exclusiveMinimum` and `exclusiveMaximum` are converted ([#40](https://github.com/finom/vovk/pull/40))
- `FormData` and `URLSearchParams` bodies are validated with type coercion ([#40](https://github.com/finom/vovk/pull/40))
- Validators are cached by schema text as well, so fresh copies of one schema compile once ([#40](https://github.com/finom/vovk/pull/40))
- Formats Ajv doesn't know, such as Zod's `cuid` or `e164`, no longer fail compilation and block the request ([#35](https://github.com/finom/vovk/pull/35))
- An object body sent as form data is validated before the conversion, so numbers and arrays keep their types ([#35](https://github.com/finom/vovk/pull/35))
- Compiled validators are cached per schema instead of rebuilt on every call ([#35](https://github.com/finom/vovk/pull/35))
- The `types` condition comes first in `exports` ([1e7f9f4](https://github.com/finom/vovk/commit/1e7f9f44))
