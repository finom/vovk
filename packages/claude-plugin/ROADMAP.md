# Roadmap

Planned skill coverage for the `vovk` Claude Code plugin. Skills map the Vovk.ts CLI and framework surface (see [vovk.dev/context/docs.md](https://vovk.dev/context/docs.md)) onto Claude Code invocations so users stay on the CLI-driven happy path.

## Shipped

| Skill | Wraps | Description |
|-------|-------|-------------|
| `vovk:init` | `vovk init`, `create-next-app` | Initialize Vovk.ts in an existing Next.js App Router project, or scaffold a fresh Next.js app and run `vovk init` on top. |
| `vovk:new` | `vovk new segment`, `vovk new controller service` | Create segments (root / named / static) and modules (controller + service). |
| `vovk:test` | `node --test` + `vovk-client` | Three test patterns: `.fn()` unit tests, plain-class service tests, HTTP integration tests via the generated RPC client. |

## Planned

### CLI wrappers

| Skill | Wraps | Description |
|-------|-------|-------------|
| `vovk:dev` | `vovk dev` | Start the Next.js + Vovk watcher, diagnose common startup failures (port in use, schema emit errors, decorator config). |
| `vovk:generate` | `vovk generate` | Emit schema + regenerate `node_modules/.vovk-client`; troubleshoot stale-client errors. |
| `vovk:bundle` | `vovk bundle` | Package the client for publishing — TypeScript, Python, or Rust targets. |

### Framework feature skills

| Skill | Covers | Description |
|-------|--------|-------------|
| `vovk:validate` | `procedure()`, Standard Schema | Wire up Zod / Valibot / ArkType validation on handlers; add `vovk-ajv` client-side validation. |
| `vovk:stream` | JSON Lines, `JSONLinesResponder`, async generators | Convert a handler to a streaming response; consume streams from the client. |
| `vovk:openapi` | `@operation`, Scalar, per-segment specs | Enrich handlers with OpenAPI metadata and wire up Scalar docs. |
| `vovk:ai-tools` | `@operation`, `deriveTools()` | Expose controllers as MCP/LLM tool definitions; derive tools from third-party OpenAPI schemas. |
| `vovk:segment` | static segments, multi-tenant routing, subdomains | Scaffold advanced segment setups beyond `vovk:new` defaults. |
| `vovk:error` | `HttpException`, `HttpStatus` | Add typed error paths that round-trip through `vovk-client`. |
| `vovk:decorator` | `createDecorator()`, `decorate()` | Author custom decorators (auth, logging, CORS) or switch between decorator and `decorate()` syntax. |
| `vovk:upload` | multipart/form-data, `toDownloadResponse()` | Add file-upload handlers and attachment responses. |
| `vovk:server-action` | `.fn()` in RSC | Use controllers directly from server components, server actions, and SSR/SSG/PPR paths. |
| `vovk:client` | `vovk-python`, `vovk-rust` | Scaffold and publish the experimental Python / Rust clients. |

Ordering and scope are non-binding — skills ship when there is a clear CLI-driven happy path worth automating.
