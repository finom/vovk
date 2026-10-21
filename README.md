<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg" />
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg" />
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg" />
    </picture>
  </a>
  <br />
  <strong>Make your Next.js app agent-ready</strong>
  <br />
  <em>Route handlers → MCP tools, typed clients and OpenAPI</em>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## Vovk.ts

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/finom/vovk/badge)](https://scorecard.dev/viewer/?uri=github.com/finom/vovk) [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/15414/badge)](https://www.bestpractices.dev/projects/15414) [![CI](https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg)](https://github.com/finom/vovk/actions/workflows/main.yml) [![MIT License](https://img.shields.io/badge/license-MIT-0a0a0a.svg)](https://github.com/finom/vovk/blob/main/LICENSE) [![AI context: llms-full.txt](https://img.shields.io/badge/ai_context-llms--full.txt-white)](https://vovk.dev/llms-full.txt) [![Runtime NPM Version](https://img.shields.io/npm/v/vovk?label=vovk)](https://www.npmjs.com/package/vovk) [![CLI NPM Version](https://img.shields.io/npm/v/vovk-cli?label=vovk-cli&color=brightgreen)](https://www.npmjs.com/package/vovk-cli)

Vovk.ts makes your Next.js app agent-ready: every procedure is also an **MCP tool**, a typed client method and an OpenAPI operation. See [the guide](https://vovk.dev/agent-ready).

Vovk.ts adds an API layer on top of **Next.js App Router Route Handlers**. Its unit is the **procedure**: a typed function with its schema. From one procedure, Vovk.ts derives the **HTTP endpoint**, the local **`.fn()`** call, the **type-safe client**, the **OpenAPI** document and the **AI tool** with `execute`. You don't write a separate contract or glue code.

> **Requirements:** Node.js 24.15+ (or Bun 1.4+, Deno 2.9+), Next.js 15+ and TypeScript 5.5+

## Install to existing Next.js project

```sh
npx vovk-cli@latest init
```

See: https://vovk.dev/quick-install

## Features

- 🧩 **Plain Next.js**: its routing, streaming, proxy.js and auth patterns, and deployment targets work as usual
- 🏗️ **NestJS-style Controller → Service → Repository** layers on top of Route Handlers, without the DI container or a custom server
- 📝 **No separate contract**: the schema comes from your controller code, so you don't maintain it by hand
- 🤖 **AI tools from your API**: controllers _and_ generated RPC modules can become [AI tools](https://vovk.dev/tools) with an input schema and `execute`
- ⚡ **[Segments](https://vovk.dev/segment)**: split the API into parts, each with its own config and its own serverless function
- ✅ **Typed requests** with [`procedure(...)`](https://vovk.dev/procedure): `{ params, query, body }`
- 🔗 **Third-party OpenAPI schemas** as modules of the same client and tools ([OpenAPI mixins](https://vovk.dev/mixins))

## What it looks like

A procedure is a typed, validated function. Define its inputs and output with `procedure`, and call it on the server for SSR/PPR, server actions or AI tool calls:

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
const user = await UserController.getUser.fn({ params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
```

Services hold the business logic. Plain classes, no decorators; their types come from the procedure:

```ts
import type { VovkParams } from 'vovk';
import type UserController from './user-controller';

export default class UserService {
  static async getUserById(id: VovkParams<typeof UserController.getUser>['id']) {
    // ...
  }
}
```

Add an HTTP decorator, and the same procedure is also a Next.js Route Handler. The CLI generates a `fetch`-based client with the `.fn()` signature:

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
import { UserRPC, PetstoreAPI } from '@/client';

const user = await UserRPC.getUser({ params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
const pet = await PetstoreAPI.getPetById({ params: { petId: 1 } });
```

Add `@operation`, and the procedure is also an LLM tool. Pass controllers (in-process) or RPC modules (over HTTP) to `deriveTools`:

```ts
const tools = deriveTools({ modules: { UserRPC, TaskController, PetstoreAPI } });
console.log(tools); // [{ name, description, inputSchema, execute }, ...]
```

## What one procedure becomes

From one function and its schema, Vovk.ts derives:

- the **Next.js Route Handler**: add an HTTP decorator to serve the procedure as an endpoint
- the **local `.fn()` call**, with the same call shape as the RPC client, for SSR, server components, server actions and AI tool calls
- the **typed RPC client module**, generated from the emitted schema, using `fetch`
- the **OpenAPI 3.x document**, from the same schema, so you don't maintain a separate spec
- the **LLM tool** with `name`, `description`, `inputSchema` and `execute`, from `deriveTools`
- a generated **`README.md`** that documents the client library

## Agent Skills

[15 topic skills](./skills) teach a coding agent how to use Vovk.ts: Claude Code, Cursor, Windsurf, GitHub Copilot, Cline and the other agents that read skills. A skill loads only when it's relevant: *"scaffold a new tenant"* loads the multitenant skill, and *"stream chat tokens"* loads JSON Lines.

Install in your project:

```sh
npx skills add finom/vovk
```

In Claude Code, they also install as a plugin, with skill names that start with `vovk:`:

```
/plugin marketplace add finom/vovk
/plugin install vovk@vovk
```

See: https://vovk.dev/about#agent-skills

## Repository

- `packages/`: the npm packages `vovk`, `vovk-cli`, `vovk-ajv`, `vovk-python` and `vovk-rust`
- `docs/`: the [vovk.dev](https://vovk.dev) site
- `examples/`: `hello-world` ([hello-world.vovk.dev](https://hello-world.vovk.dev)), `kitchen-sink` ([examples.vovk.dev](https://examples.vovk.dev)), `realtime-kanban` ([kanban.vovk.dev](https://kanban.vovk.dev)) and `multitenant` ([multitenant.vovk.dev](https://multitenant.vovk.dev))
- `perf/`: the [overhead benchmarks](https://vovk.dev/performance)
- `test/`: the integration test app

## Links

- Docs: https://vovk.dev
- Quick Start: https://vovk.dev/quick-install
- Manual install: https://vovk.dev/manual-install
- Agent Skills: https://vovk.dev/about#agent-skills
- OpenAPI Mixins: https://vovk.dev/mixins
- Performance: https://vovk.dev/performance
- “Hello World” example app: https://github.com/finom/vovk/tree/main/examples/hello-world

---

License: MIT (see [LICENSE](https://github.com/finom/vovk/blob/main/LICENSE)).
