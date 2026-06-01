<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg" />
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg" />
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg" />
    </picture>
  </a>
  <br />
  <strong>Back-end Framework for Next.js App Router</strong>
  <br />
  <em>One codebase → type-safe clients, OpenAPI, and AI tools</em>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## Vovk.ts [![CI](https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg)](https://github.com/finom/vovk/actions/workflows/main.yml) [![MIT License](https://img.shields.io/badge/license-MIT-0a0a0a.svg)](https://github.com/finom/vovk/blob/main/LICENSE) [![Runtime NPM Version](https://img.shields.io/npm/v/vovk?label=vovk)](https://www.npmjs.com/package/vovk) [![CLI NPM Version](https://img.shields.io/npm/v/vovk-cli?label=vovk-cli)](https://www.npmjs.com/package/vovk-cli) [![Docs Context](https://img.shields.io/badge/ai_context-docs.md-white)](https://vovk.dev/context/docs.md) [![Realtime Kanban Context](https://img.shields.io/badge/ai_context-realtime_ui.md-white)](https://vovk.dev/context/realtime-ui.md)

Vovk.ts lets you build a structured back end on top of **Next.js App Router Route Handlers**. The unit is the **procedure** — a typed function paired with its schema. From that single source, Vovk derives the **HTTP endpoint**, the local **`.fn()`** call, the **type-safe client**, the **OpenAPI** document, and the **AI tool** with `execute`. No separate contract layer, no glue code.

> **Requirements:** Node.js 22+ and Next.js 15+

## Install to existing Next.js project

```sh
npx vovk-cli@latest init
```

See: https://vovk.dev/quick-install

## Why you’d use it

- 🧩 **Stay native to Next.js** (routing, streaming, proxy.js/auth patterns, deployment targets)
- 🏗️ **Structured API layer** (Controller → Service → Repository) on top of Route Handlers
- 📝 **No separate contract layer** — schema is derived from your controller code, not maintained by hand
- 🤖 **Derive AI tools from your API surface** (controllers _and_ emitted RPC modules can be exposed as [AI tools](https://vovk.dev/tools) with parameters + `execute`)
- ⚡ **Back-end segmentation** via [segments](https://vovk.dev/segment): split your API into independently configured units that each compile into their own serverless function
- ✅ **Typed request handling** via [`procedure(...)`](https://vovk.dev/procedure) with `{ params, query, body }`
- 🔗 **Mix in third-party OpenAPI schemas** as modules that share the same client/tooling pipeline ([OpenAPI mixins](https://vovk.dev/mixins))

## What it looks like

A procedure is a typed, validated callable. Define inputs and output with `procedure` and call it directly on the server for SSR/PPR, server actions, or AI tool execution:

```ts
export default class UserController {
  static getUser = procedure({
    params: z.object({ id: z.string().uuid() }),
  }).handle(async (req, { id }) => {
    return UserService.getUserById(id);
  });
}
```

```ts
const user = await UserController.getUser.fn({ params: { id: '123' } });
```

Services hold business logic separately. Plain classes, no decorators — types infer from the procedure:

```ts
import type { VovkParams } from 'vovk';
import type UserController from './UserController';

export default class UserService {
  static async getUserById(id: VovkParams<typeof UserController.getUser>['id']) {
    // ...
  }
}
```

Add an HTTP decorator and the same procedure becomes a Next.js Route Handler. Codegen produces a `fetch`-powered client that mirrors the `.fn()` signature:

```ts
export default class UserController {
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.string().uuid() }),
  }).handle(async (req, { id }) => {
    return UserService.getUserById(id);
  });
}
```

```ts
import { UserRPC, PetstoreAPI } from 'vovk-client';

const user = await UserRPC.getUser({ params: { id: '123' } });
const pet = await PetstoreAPI.getPetById({ params: { petId: 1 } });
```

Annotate with `@operation` and procedures expose as LLM tools — pass controllers (in-process) or RPC modules (HTTP) to `deriveTools`:

```ts
const { tools } = deriveTools({ modules: { UserRPC, TaskController, PetstoreAPI } });
console.log(tools); // [{ name, description, parameters, execute }, ...]
```

## What one procedure becomes

Function plus schema is a complete unit. From that pair Vovk derives:

- the **Next.js Route Handler** — add an HTTP decorator and the same procedure mounts as an endpoint
- the **local `.fn()` callable** — same call shape as the RPC client; for SSR, server components, server actions, and AI tool execution
- the **typed RPC client module** — `fetch`-powered, generated from the emitted schema
- the **OpenAPI 3.x document** — derived from the same schema, no parallel spec to maintain
- the **LLM tool** with `name`, `description`, `parameters`, and `execute` — via `deriveTools`
- a generated **`README.md`** — client library documentation rendered from the procedure surface

One source, multiple destinations.

## Claude Plugin

Official **Claude Code plugin** with [15 topic-based skills](./skills) that teach the coding agent how to use Vovk.ts when you describe what you want to build. Skills load only when relevant — typing *"scaffold a new tenant"* pulls in the multitenant skill, *"stream chat tokens"* pulls in JSON Lines.

Install (inside Claude Code):

```
/plugin marketplace add finom/vovk
/plugin install vovk@vovk
/reload-plugins
```

Verify:

```
/plugin
```

The **Installed** tab should list `vovk`. Skills are namespaced — typing `/vovk:` (with the trailing colon) lists all 15.

Full plugin docs: <https://vovk.dev/claude>.

## Links

- Docs: https://vovk.dev
- Quick Start: https://vovk.dev/quick-install
- Manual install: https://vovk.dev/manual-install
- Claude Plugin: https://vovk.dev/claude
- OpenAPI Mixins: https://vovk.dev/mixins
- Performance: https://vovk.dev/performance
- “Hello World” example app: https://github.com/finom/vovk-hello-world

---

License: MIT (see [LICENSE](https://github.com/finom/vovk/blob/main/LICENSE)).
