---
name: bundle
description: Knowledge base for the Vovk.ts `vovk bundle` CLI — packaging client libraries for publishing in TypeScript, Python, or Rust. Use whenever the user asks to "publish my API client", "ship an SDK", "build a client package", "release a Python/Rust client for my Vovk API", "bundle the client for npm/PyPI/crates.io", "generate a distributable SDK", or any variation. Does NOT cover `vovk generate` (in-project client codegen) → hand off to `rpc` skill. Does NOT cover Python-specific client details → hand off to `python` skill. Does NOT cover Rust-specific client details → hand off to `rust` skill.
---

# Vovk.ts `vovk bundle`

`vovk bundle` produces **publishable** client libraries from the generated schemas. Think of it as the "release" step — you use `vovk generate` during development for the in-project TypeScript client, and `vovk bundle` when you want to ship an SDK that other teams / services / languages can consume.

## Scope

Covers:

- What `vovk bundle` does and how it differs from `vovk generate`.
- Supported targets: TypeScript, Python (experimental), Rust (experimental).
- Basic CLI invocation.
- When to reach for it vs. the in-project client.

Out of scope:

- In-project `vovk-client` TypeScript client generation → **`rpc` skill**.
- Python runtime / usage details → **`python` skill**.
- Rust runtime / usage details → **`rust` skill**.

## `bundle` vs `generate`

| Command | Purpose | Output | When |
|---|---|---|---|
| `vovk generate` | In-project TypeScript client + OpenAPI spec | `node_modules/.vovk-client/`, `.vovk-schema/` | Every build (`prebuild` hook), on schema changes during `vovk dev`. |
| `vovk bundle` | Publishable SDK packages (TS / Python / Rust) | Standalone package directories ready for registry publish | When you want to ship an SDK to consumers outside the Next.js app. |

**Don't** use `vovk bundle` for day-to-day development — the in-project client is faster and simpler. Reach for bundle only when you need a distributable artifact.

## Targets

| Target | Package | Status |
|---|---|---|
| TypeScript | `vovk-client` or a standalone package | Production |
| Python | `vovk-python` | Experimental |
| Rust | `vovk-rust` | Experimental |

Experimental targets may change between versions; treat them as early adopters.

## CLI

```bash
npx vovk bundle [options]
```

Flags and exact syntax vary by Vovk version. Consult `npx vovk bundle --help` on the user's installed CLI for the authoritative option list. Typical concerns the flags cover:

- Which target(s) to produce (TS / Python / Rust, or all).
- Output directory per target.
- Package-metadata inputs (name, version) — often drawn from `vovk.config.mjs` or per-target config files.

## Configuration

Bundling pulls from the same `vovk.config.mjs` that drives generation:

- **`outputConfig.openAPIObject.info`**: feeds the SDK's metadata (title → package name, version).
- **`outputConfig.segments`**: per-segment OpenAPI overrides carry into per-segment SDKs when segmented bundling is used.

Target-specific config (Python package name, Rust crate name, etc.) lives either in `vovk.config.mjs` or in per-target config files; check the docs on the installed version for the current shape.

## Flows

### "Publish a TypeScript SDK for my API"

1. Set `openAPIObject.info.title` + `.version` in `vovk.config.mjs`.
2. `npx vovk bundle` with the TS target.
3. `npm publish` from the generated package directory.

### "Ship a Python client of our backend"

1. Install the Python target (`vovk-python` as a dev dep).
2. `npx vovk bundle` with the Python target.
3. Publish to PyPI from the generated package. See `python` skill for consumer-side usage.

### "Ship a Rust crate"

Same pattern with `vovk-rust`. See `rust` skill for consumer-side usage.

### "Bundle just one segment as a public SDK"

Segmented bundling (when supported by the target) ships one SDK per segment — useful for public-facing `public` vs internal `admin`. Check segmented-bundle flags in the CLI help.

## Gotchas

- **Don't confuse bundle with generate**. `bundle` is release tooling; `generate` is dev tooling. Running bundle during normal development is slow and unnecessary.
- **Experimental targets shift**. Python and Rust clients are marked experimental — pin versions when consuming, and be ready for API changes between Vovk releases.
- **CI integration**: bundling usually belongs in a release workflow, not the main build. Wire it up as a separate job triggered on tag / manual dispatch.
- **Auth in published clients**: don't bake secrets into bundled SDKs. Document that consumers pass credentials themselves (fetcher, interceptor, base-URL config — depending on target).
- **Package naming** flows from `openAPIObject.info.title` by default. Override in the target-specific config when the OpenAPI title isn't a good package name.
- **When in doubt, read `npx vovk bundle --help`**. CLI flag shapes are the authoritative answer and shift between versions.
