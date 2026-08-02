# Changelog

All notable changes to `vovk-rust` are documented here. This file is the canonical record; GitHub Releases are occasional announcements for headline versions and are generated from these entries.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This package is experimental and its generated output may still shift between releases.

## 0.0.4 — unreleased

### Fixed

- **Generated identifiers are valid Rust for free-form schema names.** Named schemas are keyed by their Rust name so emission and references agree — a component called `user-profile` no longer produces `pub struct user-profile`. serde keeps the original name on the wire.
- **`r#self` and `r#crate` are never emitted.** Those are forbidden raw identifiers, and `self` is a common JSON field; keyword field names now go through the same sanitizer, becoming `self_` with a serde rename.
- **Property names that sanitize alike no longer collide.** `foo-bar` and `foo.bar` previously produced two struct fields of the same name; fields, nested types and their references now share one deduplicated identifier per property.
- An enum value that reduces to a bare `_` (for example `"-"`) no longer emits the reserved identifier.
- Circular `$ref`s terminate, with cyclic named references boxed so types stay finite.
