# vovk

Claude Code plugin for [Vovk.ts](https://vovk.dev). Topic-based skills that teach AI how to use the framework when a developer describes what they want to build.

## Skills

- **`vovk:init`** — initialize Vovk.ts in a Next.js App Router project, or scaffold a fresh Next.js app and run `vovk init` on top.
- **`vovk:common`** — framework fundamentals: packages, `vovk.config.mjs`, type inference helpers (`VovkBody`, `VovkOutput`, …), short API reference.
- **`vovk:segment`** — segments (root, named, static), `initSegment`, segment priority, `generateStaticParams`.
- **`vovk:multitenant`** — multi-tenant routing via subdomains: `multitenant()` proxy, `overrides` shape (static / dynamic / nested patterns), per-tenant segments + frontend pages, `segmentNameOverride`, wildcard DNS.
- **`vovk:procedure`** — procedures, validation (Zod / Valibot / ArkType), controllers, HTTP decorators, `req.vovk`, error handling, content types, `.fn()` for SSR / server components / server actions.
- **`vovk:decorators`** — built-in + custom decorators (`createDecorator`), auth/authorization patterns, `req.vovk.meta()`, stacking order, `decorate()` for projects without `experimentalDecorators`.
- **`vovk:rpc`** — generated `vovk-client`, composed vs segmented clients, call shape, `customFetcher`, error rethrow, type inference from client methods.
- **`vovk:jsonlines`** — JSON Lines streaming: generator handlers, `JSONLinesResponder`, `progressive()`, client async iteration, `using`, `asPromise`, abort.
- **`vovk:openapi`** — OpenAPI 3.x generation: `@operation` metadata, `outputConfig.openAPIObject`, per-segment overrides, Scalar docs, `_schema_` endpoint.
- **`vovk:mixins`** — import third-party OpenAPI 3.x schemas as typed client modules, call them identically to native RPC modules. (For LLM tool exposure, wrap mixin calls in `createTool` — the `tools` skill explains why and how.)
- **`vovk:tools`** — expose procedures as LLM tools via `deriveTools()`, MCP-compatible output, `@operation`, controllers vs RPC modules, OpenAI / Anthropic / MCP wiring.
- **`vovk:bundle`** — `vovk bundle` CLI for publishable TypeScript SDKs (`bundle.build`, tsdown recipe, `outputConfig` knobs, npm publishing). Python / Rust ship via `vovk generate` — see those skills.
- **`vovk:python`** — generate a typed Python client (`vovk-python`), `py` / `pySrc` templates, `TypedDict` shapes, JSON Lines via Python generators, PyPI publishing.
- **`vovk:rust`** — generate a typed Rust crate (`vovk-rust`), `rs` / `rsSrc` templates, async `reqwest` call shape, `futures::Stream` consumption, crates.io publishing.

## Install

Inside Claude Code:

```
/plugin marketplace add finom/vovk
/plugin install vovk@vovk
/reload-plugins
```

The `finom/vovk` shorthand resolves to the GitHub repo's `.claude-plugin/marketplace.json`. For private forks, ensure your `gh` auth is set; for a local checkout, replace the first command with `/plugin marketplace add /path/to/vovk` (point at the repo root, not at `packages/claude-plugin/`).

Verify it loaded:

```
/plugin
```

The **Installed** tab should list `vovk`. Skills are namespaced — running `/vovk:` (with the trailing colon) lists all 14 skills available to the agent.

## First prompt to try

Once installed, the skills trigger automatically when you describe what you want to build. Pick the type of project you're starting:

- **Greenfield** — *"Set up Vovk.ts in a new Next.js project. I want a `/api/tasks` CRUD endpoint with Zod validation, and a Next.js page that consumes it through the typed client."*
- **Existing Next.js project** — *"Add Vovk.ts to my existing Next.js app and scaffold a UserController with `getUser` / `createUser`."*
- **Stream-heavy work** — *"Add a `/api/chat` JSON Lines streaming endpoint that proxies OpenAI completions, plus a Python script that consumes the stream."*
- **Cold-discovery tip** — short prompts like "create a backend for next.js" don't always trigger skill consultation (Claude treats them as too generic). Mention "Vovk" or "vovk-cli" once and the routing reliably catches.

Run any of these and the agent will load the relevant skills (you'll see them in `/vovk:` after the run).

## Token-efficient prose

Skill markdown uses a terse "caveman" style — articles, filler, and hedging dropped while every code block, file path, line-number pin, and cross-reference is preserved verbatim. ~10% fewer tokens per skill load with no loss of substance. The skill files read like fragments-and-arrows, but the technical content is intact and source-verified.

## Reporting bugs

If a skill produces wrong code or contradicts itself, that's a plugin bug — open an issue at <https://github.com/finom/vovk/issues> with the prompt you used and the skill it loaded. The skills are source-verified against `packages/vovk/`, so bugs usually mean the docs and source diverged faster than the plugin tracked.
