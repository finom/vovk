# vovk

Claude Code plugin for [Vovk.ts](https://vovk.dev). Topic-based skills that teach AI how to use the framework when a developer describes what they want to build.

## Skills

- **`vovk:init`** — initialize Vovk.ts in a Next.js App Router project, or scaffold a fresh Next.js app and run `vovk init` on top.
- **`vovk:common`** — framework fundamentals: packages, `vovk.config.mjs`, type inference helpers (`VovkBody`, `VovkOutput`, …), short API reference, `experimentalDecorators`.
- **`vovk:segment`** — segments (root, named, static), `initSegment`, segment priority, `generateStaticParams`.
- **`vovk:multitenant`** — multi-tenant routing via subdomains: `multitenant()` proxy, `overrides` shape (static / dynamic / nested patterns), per-tenant segments + frontend pages, `segmentNameOverride`, wildcard DNS.
- **`vovk:procedure`** — procedures, validation (Zod / Valibot / ArkType), controllers, HTTP decorators, `req.vovk`, error handling, content types, `.fn()` for SSR / server components / server actions.
- **`vovk:decorators`** — built-in + custom decorators (`createDecorator`), auth/authorization patterns, `req.vovk.meta()`, stacking order, `decorate()` for projects without `experimentalDecorators`.
- **`vovk:rpc`** — generated `vovk-client`, composed vs segmented clients, call shape, `customFetcher`, error rethrow, type inference from client methods.
- **`vovk:jsonlines`** — JSON Lines streaming: generator handlers, `JSONLinesResponder`, `progressive()`, client async iteration, `using`, `asPromise`, abort.
- **`vovk:openapi`** — OpenAPI 3.x generation: `@operation` metadata, `outputConfig.openAPIObject`, per-segment overrides, Scalar docs, `_schema_` endpoint.
- **`vovk:mixins`** — import third-party OpenAPI 3.x schemas as typed client modules, use them identically to native RPC modules and with `deriveTools`.
- **`vovk:tools`** — expose procedures as LLM tools via `deriveTools()`, MCP-compatible output, `@operation`, controllers vs RPC modules, OpenAI / Anthropic / MCP wiring.
- **`vovk:bundle`** — `vovk bundle` CLI for publishable TypeScript SDKs (`bundle.build`, tsdown recipe, `outputConfig` knobs, npm publishing). Python / Rust ship via `vovk generate` — see those skills.
- **`vovk:python`** — generate a typed Python client (`vovk-python`), `py` / `pySrc` templates, `TypedDict` shapes, JSON Lines via Python generators, PyPI publishing.
- **`vovk:rust`** — generate a typed Rust crate (`vovk-rust`), `rs` / `rsSrc` templates, async `reqwest` call shape, `futures::Stream` consumption, crates.io publishing.

## Install

Add this repository as a Claude Code plugin marketplace, then install the `vovk` plugin from it.
