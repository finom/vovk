---
name: base
description: Vovk.ts foundational rules — ALWAYS load alongside any other vovk:* skill. Trigger on any mention of Vovk, vovk-cli, .vovk-schema, segments, procedures, controllers, RPC clients, or any back-end task in a Next.js project that may involve Vovk. This is the base context every other Vovk skill assumes — commit policy, runtime requirements, template names, _schema_ endpoint, brief API + type-inference surface. Pushy on purpose — do not skip. If the user mentions "vovk" or shows a vovk.config.* / .vovk-schema/ in their tree, this skill applies.
---

# Vovk.ts base

Always load. Tiny by design. Detail by topic → owning skill.

## Source of truth

Don't `WebFetch` vovk.dev mid-task. This skill + sibling vovk:* skills = canonical. If something seems missing, name the gap; don't fall back to the live docs site.

## Rules

- **`.vovk-schema/`** — back-end schema artifacts. **Commit.** Source of truth for codegen on fresh clone.
- **Requirements** — Node 22+, Next 15+ (App Router).
- **Templates** — `js` for `vovk-client` re-exports; `ts` for project-source emission. Variants: `jsSrc` / `tsSrc` (raw source).
- **`_schema_`** — dev-only endpoint per segment (when `NODE_ENV=development`); `vovk dev` polls these to write `.vovk-schema/`.
- **`vovk dev` vs `vovk generate`** — dev = watcher (writes schema artifacts continuously); generate = one-shot (used in `prebuild`).
- **Plain REST under the hood** — every procedure mounts as normal HTTP endpoint at `/{rootEntry}/{segmentName}/{controllerPrefix}/{methodPath}`. `curl`, `fetch`, any HTTP client works.

## API surface (brief)

- **Inference** — `VovkBody`, `VovkQuery`, `VovkParams`, `VovkInput`, `VovkOutput`, `VovkIteration`, `VovkReturnType`, `VovkYieldType`.
- **Core** — `procedure`, `initSegment`, `controllersToStaticParams`, `decorate`, `multitenant`, `deriveTools`, `createTool`, `JSONLinesResponder`, `progressive`, `HttpException`, `HttpStatus`, `toDownloadResponse`, `createDecorator`.
- **HTTP decorators** — `@get` `@post` `@put` `@patch` `@del` `@head` `@options` `@prefix` `@operation`.
- **Types** — `VovkRequest` (extends `NextRequest`), `VovkConfig`.
