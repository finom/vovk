# vovk

Claude Code plugin for [Vovk.ts](https://vovk.dev). Topic-based skills that teach AI how to use the framework when a developer describes what they want to build.

## Skills

- **`vovk:init`** — initialize Vovk.ts in a Next.js App Router project, or scaffold a fresh Next.js app and run `vovk init` on top.
- **`vovk:segment`** — segments (root, named, static), `initSegment`, segment priority, multi-tenant routing, `generateStaticParams`.
- **`vovk:procedure`** — procedures, validation (Zod / Valibot / ArkType), controllers, HTTP decorators, `req.vovk`, error handling, content types, `.fn()` for SSR / server components / server actions.
- **`vovk:common`** — framework fundamentals: packages, `vovk.config.mjs`, type inference helpers (`VovkBody`, `VovkOutput`, …), short API reference, `experimentalDecorators`.
- **`vovk:test`** — write and run unit tests (via `.fn()`), service tests, and integration tests (via the generated `vovk-client`).

## Install

Add this repository as a Claude Code plugin marketplace, then install the `vovk` plugin from it.
