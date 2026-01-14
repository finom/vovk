<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end Framework for Next.js App Router</strong>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## Vovk.ts [![CI](https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg)](https://github.com/finom/vovk/actions/workflows/main.yml) [![MIT License](https://img.shields.io/badge/license-MIT-0a0a0a.svg)](https://github.com/finom/vovk/blob/main/LICENSE) [![Runtime NPM Version](https://img.shields.io/npm/v/vovk?label=vovk)](https://www.npmjs.com/package/vovk) [![CLI NPM Version](https://img.shields.io/npm/v/vovk-cli?label=vovk-cli)](https://www.npmjs.com/package/vovk-cli)

Vovk.ts lets you build a structured back end on top of **Next.js App Router Route Handlers**—and generate a **type-safe client**, **OpenAPI**, and **AI tools** from the same code.
Under the hood: you write Controllers (real handlers), and Vovk **emits schema artifacts** for codegen—without maintaining a separate contract layer.

> **Requirements:** Node.js 22+ and Next.js 15+

## Install to existing Next.js project

```sh
npx vovk-cli@latest init
```

See: https://vovk.dev/quick-install

## Why you’d use it

- **Stay native to Next.js** (routing, streaming, middleware/auth patterns, deployment targets)
- **Structured API layer** (Controller → Service → Repository) on top of Route Handlers
- **Schema emission as a build artifact** (`.vovk-schema/`) to power codegen/docs/AI tools
- **Typed request handling** via `procedure(...)` with `{ params, query, body }`
- **Back-end segmentation** via [segments](https://vovk.dev/segment): split your API into independently configured units that each compile into their own serverless function
- **Mix in third-party OpenAPI schemas** as modules that share the same client/tooling pipeline (OpenAPI mixins)
- **Derive AI tools from your API surface** (controllers _and_ emitted RPC modules can be exposed as AI tools with parameters + `execute`)

## What it looks like

Controller + decorator:

```ts
export default class UserController {
  @get('{id}')
  static async getUser(req: NextRequest, { id }: { id: string }) {
    // ...
  }
}
```

With `procedure` you validate and type inputs in-place:

```ts
export default class UserController {
  @get('{id}')
  static getUser = procedure({
    params: z.object({
      id: z.string().uuid(),
    }),
    handle: async (req, { id }) => {
      // ...
    },
  });
}
```

Codegen emits `fetch`-powered client:

```ts
import { UserRPC, PetstoreAPI } from 'vovk-client';

const user = await UserRPC.getUser({ params: { id: '123' } });
const pet = await PetstoreAPI.getPetById({ params: { petId: 1 } });
```

Controllers (current context execution), RPC/API modules (HTTP calls) can be used to derive AI tools:

```ts
const { tools } = deriveTools({ modules: { UserRPC, TaskController, PetstoreAPI } });
console.log(tools); // [{ name, description, parameters, execute }, ...]
```

Procedures can be executed locally for SSR/PPR:

```ts
await UserController.getUser.fn({ params: { id: '123' } });
```

## Runtime vs toolchain

- **`vovk` (runtime)**: decorators, `procedure`, routing helpers, `deriveTools`
- **`vovk-cli` (toolchain)**: codegen, docs generation, bundling/publishing
- **`vovk-client` (optional)**: re-exported composed client for easy imports

Packages overview: https://vovk.dev/packages

## Links

- Docs: https://vovk.dev
- Quick Start: https://vovk.dev/quick-install
- Manual install: https://vovk.dev/manual-install
- OpenAPI Mixins: https://vovk.dev/mixins
- Performance: https://vovk.dev/performance
- “Hello World” example app: https://github.com/finom/vovk-hello-world

---

License: MIT (see [LICENSE](https://github.com/finom/vovk/blob/main/LICENSE)).
