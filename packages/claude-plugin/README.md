# vovk

Claude Code plugin for [Vovk.ts](https://vovk.dev). Topic-based skills that teach AI how to use the framework when a developer describes what they want to build.

Full plugin docs at <https://vovk.dev/claude>.

## Why Vovk.ts + Claude is the pairing for vibe coding

Vovk.ts's structure *is* the prompt — the AI mind model is built into the framework:

- **Logic groups under `src/modules/<name>/`** — Controller + Service per feature, not scattered across `lib/`.
- **Controller / Service split** — Controllers define procedures (decorated). Services hold business logic (plain classes). Clean separation between *what the endpoint is* and *what it does*.
- **Methods on a service class, not loose helpers** — fewer files, predictable layout. Claude finds the right file on the first try.
- **Single source of truth** — same `procedure().handle()` powers the HTTP endpoint, the SSR call (`.fn()`), and the AI tool (`deriveTools`). No duplication. Less for the model to reconcile.
- **Plain REST under the hood** — `curl` works. `fetch` works. Types flow end-to-end without locking you into a custom protocol.
- **Multitenancy baked in** — `multitenant()` proxy + segment-per-tenant; one Next.js app hosts many tenants on subdomains without re-architecting.
- **OpenAPI + AI tools native** — schema generated from procedures, Scalar docs auto-mounted, every procedure can become an LLM tool with one line.

The plugin packages all of this as 14 topic-scoped skills the agent loads only when relevant.

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

Pick your agent. One command. Done.

| Agent | Install |
|-------|---------|
| **Claude Code** (CLI) | `claude plugin marketplace add finom/vovk && claude plugin install vovk@vovk` |
| **Claude Code** (interactive) | Inside the session: `/plugin marketplace add finom/vovk` then `/plugin install vovk@vovk` |
| **Cursor** | `npx skills add finom/vovk -a cursor` |
| **Windsurf** | `npx skills add finom/vovk -a windsurf` |
| **Copilot** | `npx skills add finom/vovk -a github-copilot` |
| **Cline** | `npx skills add finom/vovk -a cline` |
| **Any other** | `npx skills add finom/vovk` |

`finom/vovk` resolves to the GitHub repo's `.claude-plugin/marketplace.json`. The plugin name is `vovk`; the marketplace name is also `vovk` — `vovk@vovk` is `<plugin-name>@<marketplace-name>`. For a local checkout, substitute a path: `claude plugin marketplace add /path/to/vovk` (point at the repo root, not at `packages/claude-plugin/`).

In Claude Code, verify with `/plugin` — the **Installed** tab should list `vovk`. Skills are namespaced; `/vovk:` lists all 14.

## First prompt to try

Once installed, the skills trigger automatically when you describe what you want to build. Pick the type of project you're starting:

- **Greenfield** — *"Set up Vovk.ts in a new Next.js project. I want a `/api/tasks` CRUD endpoint with Zod validation, and a Next.js page that consumes it through the typed client."*
- **Existing Next.js project** — *"Add Vovk.ts to my existing Next.js app and scaffold a UserController with `getUser` / `createUser`."*
- **Stream-heavy work** — *"Add a `/api/chat` JSON Lines streaming endpoint that proxies OpenAI completions, plus a Python script that consumes the stream."*
- **Cold-discovery tip** — short prompts like "create a backend for next.js" don't always trigger skill consultation (Claude treats them as too generic). Mention "Vovk" or "vovk-cli" once and the routing reliably catches.

Run any of these and the agent will load the relevant skills (you'll see them in `/vovk:` after the run).

## Reporting bugs

If a skill produces wrong code or contradicts itself, open an issue at <https://github.com/finom/vovk/issues> with the prompt you used and the skill it loaded.

> Skills are token-tightened ("caveman-style") — ~10% fewer tokens per load, no loss of substance.
