# Changelog

All notable changes to `vovk-python` are documented here. This file is the canonical record: noteworthy changes only, one short line each, linked to the pull request or commit that made them. GitHub Releases are not used.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This package is experimental and its generated output may still shift between releases.

## 0.0.4 - unreleased

- **Breaking:** a response that is neither JSON nor text, such as a file, comes back as `bytes`, not `str`; a `+json` type is parsed as JSON, and `text/*` without a charset is read as UTF-8, not Latin-1 ([#44](https://github.com/finom/vovk/pull/44))
- Schema text can no longer run code on import: docstrings, comments, strings and enum literals are escaped ([#35](https://github.com/finom/vovk/pull/35))
- Keys that are not Python names (`from`, `content-type`) use the functional `TypedDict` syntax; class and method names avoid keywords ([#35](https://github.com/finom/vovk/pull/35))
- Path params and query keys are percent-encoded, `..` is refused, and booleans and whole numbers go out as JavaScript writes them (`true`, `5`) in the path, the query and a form ([#35](https://github.com/finom/vovk/pull/35), [#44](https://github.com/finom/vovk/pull/44))
- A bare `$ref` body gets its `body` and `files` parameters, `allOf` merges `$ref` members, docs read the v4 `operationObject` ([#35](https://github.com/finom/vovk/pull/35))
- Stream error lines raise `HttpException` with their status code ([#35](https://github.com/finom/vovk/pull/35))
- The package ships its MIT license ([#35](https://github.com/finom/vovk/pull/35))
- Every 4xx and 5xx raises `HttpException`; a JSON response that isn't an object no longer crashes, and `isError` in success data stays data ([#40](https://github.com/finom/vovk/pull/40))
- Every JSON body kind (arrays, unions, records) gets a `body` parameter; recursive types such as `z.json()` import ([#40](https://github.com/finom/vovk/pull/40))
- Form fields go out as the TypeScript client sends them: `false`, one entry per item, JSON for objects, `None` left out ([#40](https://github.com/finom/vovk/pull/40))
- Per-segment `origin`, `rootEntry` and `segmentNameOverride`, and OpenAPI mixins, call the right URL ([#40](https://github.com/finom/vovk/pull/40))
- An empty path param is refused, and a malformed stream line raises ([#40](https://github.com/finom/vovk/pull/40))
- One `requests` session per client, with a default timeout; an upload fails only when the server takes no data for 10 s, and the session keeps no cookie a response sets ([#40](https://github.com/finom/vovk/pull/40), [#44](https://github.com/finom/vovk/pull/44))
- Optional keys are `NotRequired`, and nested classes get names `get_type_hints` resolves ([#40](https://github.com/finom/vovk/pull/40))
- The generated package no longer pins `urllib3==1.26.15`, which has known CVEs, or requires the GPL `rfc3987`; it needs Python 3.9+ ([#40](https://github.com/finom/vovk/pull/40))
- `vovk` is an optional peer dependency, `^4.0.0-0`, since the package's types import from it ([#40](https://github.com/finom/vovk/pull/40), [#PR](https://github.com/finom/vovk/pull/PR))
- A procedure without a params schema takes the params its path names, as `Dict[str, str]` ([#44](https://github.com/finom/vovk/pull/44))
- Bodies: an object goes out as JSON when the procedure also takes JSON and no file is sent, or also takes a text type; a string goes out as the text type the procedure declares; a file in any branch of a union body goes in `files`, and the file branch of a file-or-JSON body can be sent as `bytes` ([#44](https://github.com/finom/vovk/pull/44))
- Handler names alike in snake_case get a method each, `get_user_by_id` and then `get_user_by_id_2` in schema order, and the README headings name the methods the package has ([#44](https://github.com/finom/vovk/pull/44))
- The package imports when a controller has no handlers, and a pattern Python can't compile, such as `\p{L}`, is left to the server instead of failing every call ([#44](https://github.com/finom/vovk/pull/44))
- JSON Lines: `application/jsonl`, `application/jsonlines` and `application/x-ndjson` are read as streams, a large item is read in linear time, and without chunked encoding each item comes as it arrives ([#44](https://github.com/finom/vovk/pull/44))
- An error without a `message` takes its `detail` or `title` and keeps the JSON body as `cause`, and `HttpException` can be pickled and copied ([#44](https://github.com/finom/vovk/pull/44))
- A type that isn't a `TypedDict` is declared a `TypeAlias`, so the package passes mypy, and the mypy config no longer pins `python_version` ([#44](https://github.com/finom/vovk/pull/44))
- The README starts with `readme.banner`, and a title or description that isn't a string is written as text ([#44](https://github.com/finom/vovk/pull/44))
- A mixin's query and urlencoded body follow the OpenAPI document's `style` and `explode`, as the TypeScript client sends them; without them an array repeats its key (`tags=a&tags=b`), where it went out as `tags[0]=a` ([#PR](https://github.com/finom/vovk/pull/PR))
- A 2020-12 tuple (`prefixItems`) is typed `Tuple[...]`, and a tuple that takes more items after its own is a `List` ([#PR](https://github.com/finom/vovk/pull/PR))
- A `date`, `time` or `datetime` goes out as ISO 8601 text and a tuple as a list, in the body, the query and the params, client-side validation included ([#PR](https://github.com/finom/vovk/pull/PR))
- The error message is read where a mixin's `errorMessageKey` points, as the TypeScript client reads it ([#PR](https://github.com/finom/vovk/pull/PR))
- File fields are found in tuples and `allOf` too, by the same rule as vovk-rust ([#PR](https://github.com/finom/vovk/pull/PR))
- A mixin body that takes one schema as JSON or as a form is typed as that schema, not a union of two copies ([#PR](https://github.com/finom/vovk/pull/PR))

## 0.0.3 - 2026-08-05

- Named `$ref`s resolve into `TypedDict` classes, and binary bodies are detected from the content type ([5ecf779](https://github.com/finom/vovk/commit/5ecf7793))
- Schema names become valid Python identifiers: `google.protobuf.Timestamp` no longer emits a syntax error that breaks the generated module ([316c17d](https://github.com/finom/vovk/commit/316c17d2))
- `$ref` cycles terminate, and unknown refs fall back to `Any` ([5ecf779](https://github.com/finom/vovk/commit/5ecf7793))
