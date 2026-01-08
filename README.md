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

## Vovk.ts (beta) [![CI](https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg)](https://github.com/finom/vovk/actions/workflows/main.yml) [![MIT License](https://img.shields.io/badge/license-MIT-0a0a0a.svg)](https://github.com/finom/vovk/blob/main/LICENSE) 

Vovk.ts is a **Next.js App Router–native back-end meta-framework**: you write real Route Handlers (via Controllers), and Vovk **derives schema artifacts** to **generate type-safe clients**, **OpenAPI docs**, and **AI tools**—without maintaining a separate contract layer.

> **Requirements:** Node.js 22+ and Next.js 15+

### Why Vovk exists

If you like Next.js App Router, but want a “real backend layer” (structure, validation, typed clients, docs, tooling) **without leaving Route Handlers**, Vovk.ts is built for that:
- **Native runtime**: keep Next.js routing, streaming, middleware/auth patterns, and deployment targets.
- **Structured API layer**: Controller → Service → Repository style organization on top of Route Handlers.
- **Schema emission as a build artifact**: enables codegen for clients/docs/tools while keeping runtime lean.

## Get started

- **Quick Start:** https://vovk.dev/quick-install
- **Manual install:** https://vovk.dev/manual-install
- **Docs:** https://vovk.dev

## Core concepts (the vocabulary you’ll see)

- **Controller**: a class that defines endpoints using decorators on `static` methods.
- **Procedure**: a decorated handler; optionally wrapped by `procedure(...)` for typed/validated `{ params, query, body }`.
- **Segment**: a Next.js-routed backend “slice” compiled independently (often into its own function).
- **Schema emission**: each segment emits JSON schema artifacts to `.vovk-schema/` for tooling.

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

With `procedure` you validate and type inputs in-place (no separate contract module to maintain):

```ts
export default class UserController {
  @get('{id}')
  static getUser = procedure({
    params: z.object({
      id: z.string().uuid(),
    }),
    async handle(req, { id }) {
      // ...
    },
  });
}
```

## Toolchain outputs (what you can generate)

Vovk is intentionally split:

- **`vovk` (runtime)**: decorators, `procedure`, routing helpers, `deriveTools` — what you ship.
- **`vovk-cli` (toolchain)**: codegen, documentation generation, bundling/publishing — dev automation.
- **`vovk-client` (optional)**: re-exported composed client for easy imports.

From your existing handlers, Vovk can generate:
- **TypeScript clients** (composed or segmented) with a consistent `{ params, query, body }` call shape.
- **OpenAPI 3.1** (and docs pipelines that render it).
- **AI tool definitions** (structured parameters + real `execute`), derived from controllers or generated modules.
- **OpenAPI mixins**: convert third-party OpenAPI schemas into modules matching the same call convention.

Example client call shape:

```ts
import { UserRPC } from 'vovk-client';

const user = await UserRPC.getUser({ params: { id: '123' } });
```

Example tool derivation:

```ts
const { tools } = deriveTools({ modules: { UserRPC, TaskController, PetstoreAPI } });
// tools: [{ name, description, parameters, execute }, ...]
```

## When it’s a great fit

- You use **Next.js App Router** and want to stay native.
- You want **typed clients + docs** without maintaining a separate contract layer.
- You want to reuse the same API surface for **OpenAPI** and **AI tooling**.
- You care about **serverless parity** (segments map cleanly to deployable units).

## When it’s probably not for you

- You don’t use Next.js.
- You prefer strictly **contract-first** API design.
- You need runtime access to original validation schemas everywhere (Vovk focuses on emitted artifacts; JSON Schema is available).

## Examples & references

- Docs: https://vovk.dev
- “Hello World” example app: https://github.com/finom/vovk-hello-world
- Random examples / PoCs: https://github.com/finom/vovk-examples
- Multitenancy example: https://github.com/finom/vovk-multitenant-example

## Packages in this repo

This repository is a monorepo for:
- [`vovk`](https://npmjs.com/package/vovk) — runtime [![NPM Version](https://img.shields.io/npm/v/vovk?label=vovk)](https://www.npmjs.com/package/vovk)
- [`vovk-cli`](https://npmjs.com/package/vovk-cli) — generator/tooling [![NPM Version](https://img.shields.io/npm/v/vovk-cli?label=vovk-cli)](https://www.npmjs.com/package/vovk-cli)
- [`vovk-client`](https://npmjs.com/package/vovk-client) - optional re-exports for [segmented TypeScript client](https://vovk.dev/segmented) [![NPM Version](https://img.shields.io/npm/v/vovk-client?label=vovk-client)](https://www.npmjs.com/package/vovk-client)
- [`vovk-ajv`](https://npmjs.com/package/vovk-ajv) - client-side validation library for RPC modules [![NPM Version](https://img.shields.io/npm/v/vovk-ajv?label=vovk-ajv)](https://www.npmjs.com/package/vovk-ajv)
- [`vovk-python`](https://npmjs.com/package/vovk-python) - [Python/mypy](https://vovk.dev/python) client template files [![NPM Version](https://img.shields.io/npm/v/vovk-python?label=vovk-python)](https://www.npmjs.com/package/vovk-python)
- [`vovk-rust`](https://npmjs.com/package/vovk-rust) - [Rust](https://vovk.dev/rust) client template files [![NPM Version](https://img.shields.io/npm/v/vovk-rust?label=vovk-rust)](https://www.npmjs.com/package/vovk-rust)

More info: https://vovk.dev/packages

---

License: MIT (see [LICENSE](https://github.com/finom/vovk/blob/main/LICENSE)).
