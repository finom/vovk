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

## Vovk.ts [![CI](https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg)](https://github.com/finom/vovk/actions/workflows/main.yml) [![MIT License](https://img.shields.io/badge/license-MIT-0a0a0a.svg)](https://github.com/finom/vovk/blob/main/LICENSE)

Vovk.ts is a **Next.js App Router–native back-end meta-framework**: write real Route Handlers (via Controllers), and Vovk **derives schema artifacts** to **generate type-safe clients**, **OpenAPI docs**, and **AI tools**—without maintaining a separate contract layer.

> **Requirements:** Node.js 22+ and Next.js 15+

## Install to existing Next.js project

```sh
npx vovk-cli@latest init
```

See: https://vovk.dev/quick-install

## Why you’d use it

- **Stay native to Next.js** (routing, streaming, middleware/auth patterns, deployment targets)
- **Structured API layer** (Controller → Service → Repository) on top of Route Handlers
- **Schema emission as a build artifact** (`.vovk-schema/`) to power codegen/docs/tools
- **Typed request handling** via `procedure(...)` with `{ params, query, body }`
- **Derive AI tools from your API surface** (controllers *or* emitted RPC modules can be exposed as tools with structured parameters + a real `execute`)

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

## Runtime vs toolchain

- **`vovk` (runtime)**: decorators, `procedure`, routing helpers, `deriveTools`
- **`vovk-cli` (toolchain)**: codegen, docs generation, bundling/publishing
- **`vovk-client` (optional)**: re-exported composed client for easy imports

Packages overview: https://vovk.dev/packages

## Links

- Docs: https://vovk.dev
- Quick Start: https://vovk.dev/quick-install
- Manual install: https://vovk.dev/manual-install
- Performance: https://vovk.dev/performance
- “Hello World” example app: https://github.com/finom/vovk-hello-world

---

License: MIT (see [LICENSE](https://github.com/finom/vovk/blob/main/LICENSE)).
