---
title: "Vovk.ts Documentation Context"
description: "Full documentation for the Vovk.ts framework, excluding the Realtime Kanban tutorial."
see_also:
  label: "Realtime Kanban Context"
  url: https://vovk.dev/context/realtime-ui.md
chars: 408557
est_tokens: 102140
---

Page: https://vovk.dev

Vovk.ts

# Back-end Framework for Next.js App Router

Back-end Framework for Next.js App Router. One codebase → type-safe clients, OpenAPI, and AI tools.

Vovk.ts adds a structured API layer on top of Next.js App Router Route Handlers. The unit is the **procedure** — a typed function paired with its schema. From that single source, Vovk derives the HTTP endpoint, the local `.fn()` call, the typed RPC client, the OpenAPI document, and the AI tool with `execute`. No separate contract layer, no glue code.

Run `init` command in an existing Next.js project to get started.

```bash npm2yarn
npx vovk-cli@latest init
```

> Requires Node.js 22+, Next.js 15+ and TypeScript 5.3+. &nbsp; [Quick Start](https://vovk.dev/quick-install) · [Manual Install](https://vovk.dev/manual-install) · [Claude Plugin](https://vovk.dev/claude) · [GitHub](https://github.com/finom/vovk)

---

## What it looks like

A procedure is a typed, validated callable. Define inputs and output with [`procedure`](https://vovk.dev/procedure) — params, query, body — and call it directly on the server for SSR, server components, or server actions:

```ts
export default class UserController {
  static getUser = procedure({
    params: z.object({ id: z.string().uuid() }),
    output: z.object({ id: z.string(), name: z.string() }),
  }).handle(async (req, { id }) => {
    return UserService.getUser(id);
  });
}
```

```ts
const user = await UserController.getUser.fn({ params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
```

Services hold business logic separately. Plain classes, no decorators:

```ts
export default class UserService {
  static async getUser(id: VovkParams<typeof UserController.getUser>['id']) {
    return prisma.user.findUnique({ where: { id } });
  }
}
```

Add an HTTP decorator and the same procedure becomes a Next.js Route Handler — call shape unchanged:

```ts
export default class UserController {
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.string().uuid() }),
    output: z.object({ id: z.string(), name: z.string() }),
  }).handle(async (req, { id }) => {
    return UserService.getUser(id);
  });
}
```

Codegen reads the emitted schema and produces a `fetch`-powered client that mirrors the `.fn()` signature:

```ts
import { UserRPC } from '@/client';

const user = await UserRPC.getUser({ params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
```

Procedures can yield JSON Lines for real-time streaming:

```ts
export default class StreamController {
  @post('completions')
  static streamTokens = procedure({
    iteration: z.object({ message: z.string() }),
  }).handle(async function* () {
    yield* StreamService.getTokens();
  });
}
```

```ts
using stream = await StreamRPC.streamTokens();
for await (const { message } of stream) {
  console.log(message);
}
```

Annotate with `@operation` and the same procedure exposes as an LLM tool — pass controllers (in-process) or RPC modules (HTTP) to `deriveTools`:

```ts
const tools = deriveTools({ modules: { UserRPC, TaskController } });
// [{ name, description, inputSchema, execute, ... }, ...]
```

---

## What one procedure becomes

Function plus schema is a complete unit. From that pair Vovk derives:

- the **Next.js Route Handler** — add an HTTP decorator and the same procedure mounts as an endpoint
- the **local `.fn()` callable** — same call shape as the RPC client; use it in SSR, server components, and server actions
- the **typed RPC client module** — `fetch`-powered, generated from the emitted schema
- the **OpenAPI 3.x document** — derived from the same schema, no parallel spec to maintain
- the **LLM tool** with `name`, `description`, `inputSchema`, and `execute` — via `deriveTools`
- a generated **`README.md`** — client library documentation rendered from the procedure surface

One source, multiple destinations. The sections below cover each in detail.

---

## How it works

### Segments

Every group of controllers lives in a [segment](https://vovk.dev/segment) — a Next.js catch-all route that compiles into its own serverless function. Segments are configured independently.

```ts filename="src/app/api/[[...vovk]]/route.ts"
const controllers = { UserRPC: UserController };
export type Controllers = typeof controllers;
export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({ controllers });
```

### Schema emission

Handlers are the source of truth. Vovk.ts derives schema from the code you already wrote and emits it as a build artifact to `.vovk-schema/`. The runtime stays lean; tooling reads the schema.

```
.vovk-schema/
  root.json
  customer.json
  nested-segment/
    foo.json
  _meta.json
```

### Generated TypeScript clients

Controllers compile into RPC modules with a consistent `{ params, query, body }` call signature. Generate a single [composed client](https://vovk.dev/composed) or [per-segment clients](https://vovk.dev/segmented). See [TypeScript Client](https://vovk.dev/typescript).

Direct type mapping between server and client code gives you jump-to-definition and JSDoc on hover over generated RPC methods.

### Validation

Vovk.ts works with any library that implements [Standard Schema](https://standardschema.dev/schema) + [Standard JSON Schema](https://standardschema.dev/json-schema) — including **Zod**, **Valibot**, and **ArkType**.

### OpenAPI mixins

Third-party OpenAPI 3.x schemas can be converted into modules that share the same calling convention as your own endpoints — then used through the same client and tooling pipeline:

```ts
import { PetstoreAPI } from '@/client';

const pet = await PetstoreAPI.getPetById({ params: { petId: 1 } });
```

See [OpenAPI Mixins](https://vovk.dev/mixins).

### AI tool derivation

Annotate methods with `@operation`, then derive tool definitions for LLM function calling — from controllers (same-context), RPC modules (HTTP), or third-party APIs:

```ts
export default class TaskController {
  @operation({ summary: 'Create task', description: 'Creates a new task.' })
  @post()
  static createTask = procedure({
    body: z.object({ title: z.string() }),
    output: z.object({ id: z.string(), title: z.string() }),
  }).handle(async (req) => {
    // ...
  });
}
```

```ts
import { deriveTools } from 'vovk';
import { TaskRPC, PetstoreAPI } from '@/client';

const tools = deriveTools({ modules: { TaskRPC, PetstoreAPI } });
// [{ name, description, inputSchema, execute, ... }, ...]
```

Each tool has `name`, `description`, `inputSchema` (a Standard Schema that also gives JSON Schema), and an `execute` function. See [Deriving AI Tools](https://vovk.dev/tools).

### Streaming

Procedures can yield JSON Lines for real-time responses. See [JSON Lines](https://vovk.dev/jsonlines).

### Local procedure calls

Procedures call directly on the server with `.fn()` — same call shape as the generated HTTP client. Use them in SSR/PPR, server components, and server actions. See [Calling Procedures Locally](https://vovk.dev/fn).

### Docs and publishing

Generate OpenAPI 3.x documentation and package client libraries for publishing in TypeScript, Python, or Rust.

See [Generate Command](https://vovk.dev/generate) · [Bundle Command](https://vovk.dev/bundle) · [Python Client](https://vovk.dev/python) · [Rust Client](https://vovk.dev/rust)

---

## Packages

| Package | Role | Version | Install |
|---------|------|--------|---------|
| **`vovk`** | Runtime — decorators, `procedure`, routing, `deriveTools` |  | production |
| **`vovk-cli`** | Toolchain — codegen, mixins, docs, bundling |  | dev |
| **`vovk-ajv`** | Client-side validation with AJV |  | production (optional) |
| **`vovk-python`** | Python client generation (experimental) |  | dev (optional) |
| **`vovk-rust`** | Rust client generation (experimental) |  | dev (optional) |

See [Packages](https://vovk.dev/packages).

---

## Claude Plugin

The official **Claude Code plugin** ships 15 topic-based skills that teach the coding agent how to use Vovk.ts when you describe what you want to build. Skills load only when relevant — typing *"scaffold a tenant"* loads the multitenant skill, *"stream chat tokens"* loads JSON Lines.

Install (inside Claude Code):

```
/plugin marketplace add finom/vovk
/plugin install vovk@vovk
/reload-plugins
```

See [Claude Plugin](https://vovk.dev/claude) for the full skill list, the AI mind model behind the framework, and why the pairing works.

---

## Examples

The ["Hello World" example](https://vovk.dev/hello-world) shows Vovk.ts end-to-end in a single project: Zod-validated endpoints, JSON Lines streaming, composed and segmented clients, OpenAPI docs via Scalar, and bundled client libraries in TypeScript, Python, and Rust.

The [Multitenancy Tutorial](https://vovk.dev/multitenant) walks through hosting multiple tenants from different subdomains within a single Next.js app.

The [Realtime Kanban](https://vovk.dev/realtime-ui) example builds a full-stack board where users, bots, AI agents, and MCP clients all update it in real time — covering state normalization, database polling, AI chat, voice AI, and Telegram integration.

Browse more snippets on the [Random Examples](https://examples.vovk.dev) site.

---

## Vocabulary

| Term | Meaning |
|------|---------|
| **Controller** | Class that groups procedures as `static` members; HTTP decorators expose them as endpoints |
| **Procedure** | A typed, validated callable created with [`procedure`](https://vovk.dev/procedure). Call it locally with `.fn()`, expose it over HTTP with a decorator, or derive it as an LLM tool |
| **Segment** | A routed back-end slice, compiled independently into its own function |
| **RPC module** | Generated client module mirroring a controller |
| **API module** | Generated module from a controller or an OpenAPI schema |

---

Page: https://vovk.dev/quick-install

# Quick Start

### Create a Next.js app (App Router + TypeScript)

```bash npm2yarn copy
npx create-next-app@latest my-app --ts --app --src-dir
```
```bash
cd my-app
```

### Initialize Vovk.ts

You will be prompted to answer a few questions. The CLI will install the selected dependencies, update npm scripts, enable `experimentalDecorators` in **tsconfig.json**, and create a [config](https://vovk.dev/config) file.

```bash npm2yarn copy
npx vovk-cli@latest init
```

**More info:**

- [vovk init](https://vovk.dev/init)

### Create a segment

Run the following to create the root segment at **./src/app/api/[[...vovk]]/route.ts**:

```bash npm2yarn copy
npm exec -- vovk new segment
```

**More info:**

- [Segment](https://vovk.dev/segment)

### Generate a controller and a service

This command scaffolds **user-controller.ts** and **user-service.ts** from built-in (customizable) templates under **./src/modules/user/** and updates the segment’s **route.ts**:

```bash npm2yarn copy
npm exec -- vovk new controller service user
```

```ts filename="src/modules/user/user-controller.ts"
import { procedure, prefix, get, put, post, del, operation } from 'vovk';
import { z } from 'zod';
import UserService from './user-service';

@prefix('users')
export default class UserController {
  // ...
  @operation({
    summary: 'Get single user',
  })
  @get('{id}')
  static getSingleUser = procedure({
    params: z.object({
      id: z.string(),
    }),
  }).handle(async (_req, { id }) => {
    return UserService.getSingleUser(id);
  });
  // ...
}
```

**More info:**

- [vovk new](https://vovk.dev/new)
- [Procedure](https://vovk.dev/procedure)

### Start the server and inspect an endpoint

The `dev` script runs the Next.js dev server and the Vovk.ts watcher in parallel. While running, Vovk.ts generates schema files in **.vovk-schema/** (commit these) and the client library in **src/client** (git-ignored; regenerated on every build).

```bash npm2yarn copy
npm run dev
```

Then open: http://localhost:3000/api/users/123  
You’ll see a placeholder response from `UserController.getSingleUser`: `{"message":"TODO: get single user","id":"123"}{:json}`

You can also check the schema endpoint (available only when NODE_ENV is set to development) at [http://localhost:3000/api/\_schema\_](http://localhost:3000/api/_schema_)

**More info:**

- [vovk dev](https://vovk.dev/dev)
- [Schema](https://vovk.dev/schema)
- [Composed Mode](https://vovk.dev/composed)
- [Segmented Mode](https://vovk.dev/segmented)

### Create a React component to display data

Import the generated client library and call the RPC method:

```tsx showLineNumbers copy filename="src/app/page.tsx"
'use client';
import { useEffect, useState } from 'react';
import type { VovkReturnType } from 'vovk';
import { UserRPC } from '@/client';

export default function Home() {
  const [resp, setResp] = useState<VovkReturnType<typeof UserRPC.getSingleUser> | null>(null);

  useEffect(() => {
    void UserRPC.getSingleUser({ params: { id: '123' } }).then(setResp);
  }, []);
  return <pre>Response: {JSON.stringify(resp, null, 2)}</pre>;
}
```

You can alternatively use [React Query](https://react-query.tanstack.com/) for request state management:

```ts showLineNumbers copy
import { useQuery } from '@tanstack/react-query';
import { UserRPC } from '@/client';
// ...
const { data, error, isLoading } = useQuery({
  queryKey: UserRPC.getSingleUser.queryKey(),
  queryFn: () => UserRPC.getSingleUser({ params: { id: '123' } }),
});
```

**More info:**

- [TypeScript Client](https://vovk.dev/typescript)

### Deploy

The `vovk init` command adds a `prebuild` script so `vovk generate` runs automatically before `next build`. Yarn 2+ doesn't run `pre` scripts, so there `vovk init` puts `vovk generate` at the start of `build`. If you adjust scripts manually, run:

```bash npm2yarn copy
npm exec -- vovk generate
```

**More info:**

- [vovk generate](https://vovk.dev/generate)

---

Page: https://vovk.dev/manual-install

# Manual Install

## Create a Next.js project (App Router + TypeScript)

```bash npm2yarn copy
npx create-next-app my-app --ts --app --src-dir
```

```bash
cd my-app
```

## Install vovk and vovk-cli

- `vovk` is the core/runtime library.
- `vovk-cli` is the command-line interface for Vovk.ts (development dependency). 

```sh npm2yarn copy
npm i vovk
```

```sh npm2yarn copy
npm i -D vovk-cli
```

**More info:**

- [Packages](https://vovk.dev/packages)

## Create the config file

Create **vovk.config.mjs** at the project root with the following content:

```ts showLineNumbers copy filename="vovk.config.mjs"
// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {};

export default vovkConfig;
```

**More info:**

- [Config](https://vovk.dev/config)

## Install a validation library and enable client-side validation

For Zod validation on the server and Ajv on the client, install:

```sh npm2yarn copy
npm i zod vovk-ajv
```

Configure `validateOnClient` in your config file to enable client-side validation:

```ts showLineNumbers copy filename="vovk.config.mjs"
// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
  },
};

export default vovkConfig;
```

**More info:**

- [Controller & Procedure](https://vovk.dev/procedure)
- [Customization](https://vovk.dev/imports)

## Update the dev script and add a prebuild script

There are two ways to run Vovk.ts and the Next.js server together: explicitly and implicitly. The explicit option uses the `concurrently` package to run both processes (you must set `PORT`). The implicit option lets the Vovk.ts CLI start Next.js for you; in that case, **vovk-cli** assigns the port automatically.

The `prebuild` script runs `vovk generate` before `next build` so the client library is generated ahead of the Next.js build. Yarn 2+ doesn't run `pre` scripts: there, use `"build": "vovk generate && next build"` instead.

    Install concurrently, and cross-env, which sets `PORT` on Windows too:
```sh npm2yarn copy
npm i -D concurrently cross-env
```

    Update the "dev" script in **package.json**:

    ```json
    "scripts": {
        "build": "next build",
        "dev": "cross-env PORT=3000 concurrently \"vovk dev\" \"next dev\" --kill-others",
        "prebuild": "vovk generate"
    }
    ```

    Update the "dev" script in **package.json**:

    ```json
    "scripts": {
        "build": "next build",
        "dev": "npx vovk dev --next-dev",
        "prebuild": "vovk generate"
    }
    ```

**More info:**

- [vovk dev](https://vovk.dev/dev)
- [vovk generate](https://vovk.dev/generate)

## Enable decorators (optional)

In your **tsconfig.json**, set `"experimentalDecorators"` to `true`.

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
    // ...
  }
}
```

This is required only if you want to use decorators in your controllers and procedures. As an alternative you can use `decorate(...)` from the library to achieve the same result without enabling decorators. See [Decorators Overview](https://vovk.dev/decorator-overview) for details.

## Create a controller

Create **hello-controller.ts** in **/src/modules/hello/** with a `HelloController` class.

```ts showLineNumbers copy filename="src/modules/hello/hello-controller.ts"
import { get, prefix } from 'vovk';

@prefix('greetings') // prefix is optional
export default class HelloController {
  @get('greeting')
  static getHello() {
    return { greeting: 'Hello, World!' };
  }
}
```

**More info:**

- [Procedure](https://vovk.dev/procedure)

## Create a root segment

Create the root [segment](https://vovk.dev/segment) **/src/app/api/[[...vovk]]/route.ts**, where **[[...vovk]]** is an ["Optional Catch-all Segment"](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#optional-catch-all-segments). The slug can be any valid name, such as **[[...mySlug]]**.

In the code below, `HelloRPC` is the name of the generated RPC module, and `HelloController` is the controller created above.

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
import { initSegment } from 'vovk';
import HelloController from '../../../modules/hello/hello-controller';

const controllers = { HelloRPC: HelloController };

// export types that are inferred by the client
export type Controllers = typeof controllers;

// export Next.js route handlers
export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({ controllers });
```

**More info:**

- [Segment](https://vovk.dev/segment)

## Run the dev server

Run `npm run dev` to start Vovk.ts and Next.js concurrently.

```sh npm2yarn copy
npm run dev
```

Navigate to [http://localhost:3000/api/greetings/greeting](http://localhost:3000/api/greetings/greeting) to see the result.

## Create a React component

Once the client is generated to `src/client`, you can import it as **@/client** (or with a relative path if your project doesn't define the `@/*` alias).

```ts showLineNumbers copy filename="src/app/page.tsx"
'use client';
import { useState } from 'react';
import { HelloRPC } from '@/client';
import type { VovkReturnType } from 'vovk';

export default function MyComponent() {
  const [serverResponse, setServerResponse] = useState<VovkReturnType<typeof HelloRPC.getHello>>();

  return (
    <>
      <button
        onClick={async () => {
          const response = await HelloRPC.getHello();
          setServerResponse(response);
        }}
      >
        Get Greeting from Server
      </button>
      <div>{serverResponse?.greeting}</div>
    </>
  );
}
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

  If you're using VSCode, you may need to
  restart the TS server
  when you add a new controller class. This is the only time a manual restart is typically required; other changes—like
  adding methods or updating validation—are picked up automatically.

**More info:**

- [TypeScript Client](https://vovk.dev/typescript)
- [Composed Mode](https://vovk.dev/composed)
- [Segmented Mode](https://vovk.dev/segmented)

---

Page: https://vovk.dev/claude

# Claude Plugin

The official **Claude Code plugin for Vovk.ts** ships topic-based skills that teach the coding agent how to use the framework when you describe what you want to build. Skills load only when relevant — typing "scaffold a new tenant" pulls in the multitenant skill, "stream chat tokens" pulls in JSON Lines, and so on.

The plugin lives in the same repo as Vovk.ts itself — skills at the repo root — and ships alongside the framework on every release.

## Why Vovk.ts is built for AI-assisted coding

Vovk.ts's structure *is* the prompt — the AI mind model is built into the framework:

- **Logic groups under `src/modules//`** — Controller + Service per feature, not scattered across `lib/`.
- **Controller / Service split** — Controllers define procedures (decorated). Services hold business logic (plain classes). Clean separation between *what the endpoint is* and *what it does*.
- **Methods on a service class, not loose helpers** — fewer files, predictable layout. The assistant finds the right file on the first try.
- **Single source of truth** — same `procedure().handle()` powers the HTTP endpoint, the [SSR call](https://vovk.dev/fn) (`.fn()`), and the [AI tool](https://vovk.dev/tools) (`deriveTools`). No duplication. Less for the model to reconcile.
- **Plain REST under the hood** — `curl` works. `fetch` works. Types flow end-to-end without locking you into a custom protocol.
- **[Multitenancy](https://vovk.dev/multitenant) baked in** — `multitenant()` proxy + segment-per-tenant; one Next.js app hosts many tenants on subdomains without re-architecting.
- **[OpenAPI native](https://vovk.dev/openapi), AI tools native** — schema generated from procedures, Scalar docs auto-mounted, every procedure can become an LLM tool with one line.

## Why use the plugin?

Without it, asking Claude to *"scaffold a Vovk procedure with Zod validation"* tends to go one of two ways: the model hallucinates (training data is months stale and Vovk's API has moved on), or it fetches `vovk.dev` mid-task — slow, hits rate limits, and the wrong page often loads first.

With the plugin, the framework's idioms are loaded as topic-scoped skills the agent already understands:

- **Topic-scoped, not all-or-nothing.** Skills load only when relevant — *"stream chat tokens"* pulls in JSON Lines; *"scaffold a tenant"* pulls in multitenant. Claude doesn't drown in thousands of lines of docs to answer a focused question.
- **Self-contained.** A directive at the top of every skill tells the agent *don't fetch vovk.dev mid-task* — the plugin is the source of truth. Works offline; predictable cost; no rate-limit surprises.
- **Cross-skill handoffs.** Skills know to escalate. The mixins skill points at the tools skill for LLM exposure; the procedure skill points at jsonlines for streaming. The agent loads the right context, not adjacent context.
- **Caveman-optimized prose** — skill markdown is token-tightened (~10% fewer tokens per load, no loss of substance).

## Install

Pick your agent. One command. Done.

| Agent | Install |
|-------|---------|
| **Claude Code** (CLI) | `claude plugin marketplace add finom/vovk && claude plugin install vovk@vovk` |
| **Claude Code** (interactive) | Inside the session, run `/plugin marketplace add finom/vovk` then `/plugin install vovk@vovk` |
| **Cursor** | `npx skills add finom/vovk -a cursor` |
| **Windsurf** | `npx skills add finom/vovk -a windsurf` |
| **Copilot** | `npx skills add finom/vovk -a github-copilot` |
| **Cline** | `npx skills add finom/vovk -a cline` |
| **Any other** | `npx skills add finom/vovk` |

`finom/vovk` resolves to the GitHub repo's `.claude-plugin/marketplace.json`. The plugin name is `vovk`; the marketplace name is also `vovk` — `vovk@vovk` is `<plugin-name>@<marketplace-name>`, the symmetry is coincidence.

For a local checkout (development), substitute the path: `claude plugin marketplace add /path/to/vovk` (point at the repo root).

### Verify

In Claude Code, run `/plugin` — the **Installed** tab should list `vovk`. Skills are namespaced; typing `/vovk:` (with the trailing colon) lists all 15 skills available to the agent. In other agents, the skill files appear under that agent's skill directory (e.g. `.cursor/skills/`).

## Skills

The plugin ships fifteen topic-based skills covering every layer of Vovk.ts:

- **`vovk:init`** — initialize Vovk.ts in a Next.js App Router project, or scaffold a fresh Next.js app and run `vovk init` on top.
- **`vovk:base`** — foundational rules loaded alongside any other vovk:* skill: commit policy for `.vovk-schema/`, runtime requirements, template names, `_schema_` endpoint, brief API + type-inference surface (`VovkBody`, `VovkOutput`, …).
- **`vovk:config`** — `vovk.config.{mjs,cjs,js}` shape, every config key + default (`rootEntry`, `schemaOutDir`, `composedClient`, `segmentedClient`, `clientTemplateDefs`, `outputConfig`, `bundle`, …), `tsconfig.json` setup, and the `decorate()` alternative for projects without `experimentalDecorators`.
- **`vovk:segment`** — segments (root, named, static), `initSegment`, segment priority, `generateStaticParams`.
- **`vovk:multitenant`** — multi-tenant routing via subdomains: `multitenant()` proxy, `overrides` shape, per-tenant segments and frontend pages, wildcard DNS.
- **`vovk:procedure`** — procedures, validation (Zod / Valibot / ArkType), controllers, HTTP decorators, `req.vovk`, error handling, content types, `.fn()` for SSR / server components / server actions.
- **`vovk:decorators`** — built-in and custom decorators (`createDecorator`), authorization patterns, `req.vovk.meta()`, stacking order, `decorate()` for projects without `experimentalDecorators`.
- **`vovk:rpc`** — generated RPC client (`@/client`), composed vs segmented clients, call shape, `customFetcher`, error rethrow, type inference from client methods.
- **`vovk:jsonlines`** — JSON Lines streaming: generator handlers, `JSONLinesResponder`, `progressive()`, client async iteration, `using`, `asPromise`, abort.
- **`vovk:openapi`** — OpenAPI 3.x generation: `@operation` metadata, `outputConfig.openAPIObject`, per-segment overrides, Scalar docs, `_schema_` endpoint.
- **`vovk:mixins`** — import third-party OpenAPI 3.x schemas as typed client modules, call them identically to native RPC modules.
- **`vovk:tools`** — expose procedures as LLM tools via `deriveTools()`, MCP-compatible output, `@operation`, controllers vs RPC modules, OpenAI / Anthropic / MCP wiring.
- **`vovk:bundle`** — `vovk bundle` CLI for publishable TypeScript SDKs.
- **`vovk:python`** — generate a typed Python client (`vovk-python`), `py` / `pySrc` templates, `TypedDict` shapes, JSON Lines via Python generators, PyPI publishing.
- **`vovk:rust`** — generate a typed Rust crate (`vovk-rust`), `rs` / `rsSrc` templates, async `reqwest` call shape, `futures::Stream` consumption, crates.io publishing.

## First prompts to try

The skills trigger automatically when you describe what you want to build. Pick the type of project you're starting:

- **Greenfield** — *"Set up Vovk.ts in a new Next.js project. I want a `/api/tasks` CRUD endpoint with Zod validation, and a Next.js page that consumes it through the typed client."*
- **Existing Next.js project** — *"Add Vovk.ts to my existing Next.js app and scaffold a UserController with `getUser` / `createUser`."*
- **Stream-heavy work** — *"Add a `/api/chat` JSON Lines streaming endpoint that proxies OpenAI completions, plus a Python script that consumes the stream."*

  Short prompts like *"create a backend for Next.js"* don't always trigger skill consultation — Claude treats them as too generic. Mention "Vovk" or "vovk-cli" once and the routing reliably catches.

## Reporting bugs

If a skill produces wrong code or contradicts itself, that's a plugin bug — open an issue at github.com/finom/vovk/issues with the prompt you used and the skill that loaded.

**More info:**

- [Skills source](https://github.com/finom/vovk/tree/main/skills)
- [Claude Code docs — Plugins](https://docs.claude.com/en/docs/claude-code/plugins)

---

Page: https://vovk.dev/segment

# Segment

## Overview

Vovk.ts introduces an additional hierarchy level in backend architecture called **segments**, where controllers are initialized, implemented using [Next.js Optional Catch-All Segments](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments). Segments allow you to split your backend into smaller, focused serverless functions with different configurations (exported Next.js constants, such as `runtime` or `maxDuration`), improving maintainability and performance.

![Segment](https://vovk.dev/draw/segment-concept.svg)

Each segment owns a specific path, such as `/api/foo` or `/api/bar` as focused “mini backends,” similar to how frontend code is split into pages in Next.js. Segments are initialized by calling `initSegment` in the **route.ts** file located in **[[...slug]]** folders, that returns Next.js route handlers (`GET`, `POST`, etc.) for that segment. Vovk.ts uses `vovk` as the slug name, but any valid name works.

When `NODE_ENV` is set to `"development"` (by using `next dev`), each segment exposes a `_schema_` endpoint that serves the segment schema. The [dev CLI](https://vovk.dev/dev) calls this endpoint to retrieve the schema and build JSON files in **.vovk-schema/**. This avoids importing Node.js modules in Next.js code, allows `export const runtime = 'edge'` in **route.ts**, but also simplifies schema retrieval tooling.

Optional Catch-All Segments are used insted of [Catch-All Segments](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#catch-all-segments) in order to be able to easily implement a root endpoint for that segment.

## Creating Segments

Initialize a segment by calling `initSegment` in **route.ts** and export the returned route handlers: `GET`, `POST`, `PATCH`, `PUT`, `HEAD`, `OPTIONS` and `DELETE`. A method the file doesn't export never reaches Vovk.ts: Next.js answers `PATCH` with `405`, and a CORS preflight (`OPTIONS`) without CORS headers. The function accepts:

- `controllers` — an object with controllers used by the segment. Object keys define generated RPC module names (use a random name if `emitSchema` is `false`); values are the controllers.
- `segmentName` — the segment name. Defaults to an empty string for the root segment.
- `emitSchema` — whether to emit the schema for the segment. Defaults to `true`.
- `exposeValidation` — whether to expose validation data. Defaults to `true`.
- `onError` — a callback invoked on errors with:
  - `error: HttpError` — the error instance.
  - `request: NextRequest` — the incoming request (headers, URL, etc.).

The segment file (**route.ts**) should also export `type Controllers = typeof controllers{:ts}` to enable type inference in the [RPC client](https://vovk.dev/typescript).

### The Root Segment

```sh npm2yarn copy
npm exec -- vovk new segment
```

See [`vovk new` documentation](https://vovk.dev/new)

For simple single-page apps, a single root segment is sufficient. In this setup, the backend is bundled into one serverless function when deployed.

Example **route.ts** for a single-segment app:

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
import { initSegment } from 'vovk';
import UserController from '../../modules/user/user-controller';
import PostController from '../../modules/post/post-controller';

export const maxDuration = 300; // Next.js route handler option

const controllers = {
  UserRPC: UserController,
  PostRPC: PostController,
};

// export the controllers type to be used in the client code
export type Controllers = typeof controllers;

// export the Next.js route handlers
export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  controllers,
});
```

The [schema](https://vovk.dev/schema) for the root segment is stored at **.vovk-schema/root.json**.

  The name **root** is used only for file naming. In configuration and elsewhere, the root segment name is an empty string.

### Multiple Segments

Create multiple segments to split your backend into separate serverless functions. Reasons include:

- Using different Next.js route handler options or `initSegment` configurations.
- Reducing bundle size by splitting code.
- Separating app areas (e.g., root, `admin`, `customer`, `customer/public`).
- Supporting multiple API versions (e.g., `v1`, `v2`).
- Creating a [static segment](https://vovk.dev/static-segment) for OpenAPI specs, historical data, etc.

Each segment’s nested folder determines both the API path and the segment name. For example, **/src/app/api/`segment-name`/[[...slug]]/** is served at **/api/`segment-name`**. Nesting is unlimited.

For non-root segments, provide `segmentName` to `initSegment`:

```ts showLineNumbers copy filename="src/app/api/foo/[[...vovk]]/route.ts"
// ...

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'foo',
  controllers,
});
```

The schema for `foo` is stored at **.vovk-schema/`foo`.json**.

For deeper nesting, e.g., **/src/app/api/`foo/bar/baz`/[[...slug]]/**, set `segmentName` to `"foo/bar/baz"`. The schema is stored at **.vovk-schema/`foo/bar/baz`.json**.

## Segment Priority

With multiple segments, the most specific (deepest) one takes priority. For example:

- **/src/app/api/[[...slug]]/** — the root segment
- **/src/app/api/foo/[[...slug]]/** — `foo` segment
- **/src/app/api/foo/bar/[[...slug]]/** — `foo/bar` segment

A request to **/api/foo/bar** is handled by the `foo/bar` segment. If it doesn’t match, but the `foo` segment does, `foo` handles it. Otherwise, the root segment handles it.

  You can change the API folder name from `api` to anything else via the `rootEntry` [config](https://vovk.dev/config) option, including setting it to an empty to serve the API from the app root.

## RPC Client

Whether the API is [static](https://vovk.dev/static-segment) or dynamic, you can call it with the same RPC client, including client-side validation and type inference.

```ts showLineNumbers copy
const resp = await StaticParamsRPC.getStaticParams({
  params: {
    section: 'a',
    page: '1',
  },
});

console.log(resp); // { section: 'a', page: '1' }
```

---

Page: https://vovk.dev/static-segment

# Static Segment

```sh npm2yarn copy
npm exec -- vovk new segment openapi --static # creates a new static segment named "openapi" at src/app/api/openapi/[[...vovk]]/route.ts
```

Next.js can pre-render API endpoints at build time using [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params). Vovk.ts provides the `controllersToStaticParams` helper to take advantage of this and emit static API endpoints for minimal latency. Use it to serve OpenAPI definitions, historical datasets (refreshed periodically via CI/CD), or other infrequently changing data. It also works in [Static Export mode](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports) with the `output: 'export'` Next.js option:

```ts showLineNumbers copy filename="next.config.js"
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
};

module.exports = nextConfig;
```

Export `dynamic = 'force-static'` so Next.js pre-renders the route handler at build time, implement `generateStaticParams`, and return `controllersToStaticParams` with your controller list.

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
// ...
export type Controllers = typeof controllers;

export const dynamic = 'force-static';

export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}

export const { GET } = initSegment({ controllers });
```

When deploying to static hosting (e.g., GitHub Pages), include a `.json` extension in endpoint paths to ensure proper HTTP headers are served.

```ts showLineNumbers copy
import { get, prefix } from 'vovk';

@prefix('hello')
export default class HelloController {
  @get('greeting.json')
  static async getHello() {
    return { greeting: 'Hello world!' };
  }
}
```

This produces an endpoint like: [https://vovk.dev/api/hello/greeting.json](https://vovk.dev/api/hello/greeting.json) (hosted on GitHub Pages).

If you use a custom slug (e.g., `/src/app/api/[[...custom]]/route.ts`) instead of the default `vovk`, pass it as the second argument:

```ts showLineNumbers copy
export function generateStaticParams() {
  return controllersToStaticParams(controllers, 'custom');
}
```

## Static Endpoint Parameters

The `@get` decorator accepts an options object. One of the options, `staticParams`, lets you enumerate static parameter combinations to simulate conditional routing. A param in the controller's prefix, such as `@prefix('users/{userId}')`, takes its value from the same objects. The example below shows a single handler that renders six variants for two parameters: section (`a | b`) and page (`1 | 2 | 3`).

```ts showLineNumbers copy
import { z } from 'zod';
import { procedure, prefix, get, operation } from 'vovk';

@prefix('static-params')
export default class StaticParamsController {
  @operation({
    summary: 'Static Params',
    description: 'Get the static params: section and page',
  })
  @get('{section}/page{page}.json', {
    staticParams: [
      { section: 'a', page: '1' },
      { section: 'a', page: '2' },
      { section: 'a', page: '3' },
      { section: 'b', page: '1' },
      { section: 'b', page: '2' },
      { section: 'b', page: '3' },
    ],
  })
  static getStaticParams = procedure({
    params: z.object({
      section: z.enum(['a', 'b']),
      page: z.enum(['1', '2', '3']),
    }),
  }).handle(async (_req, { section, page }) => {
    return { section, page };
  });
}
```

[View live example on examples.vovk.dev »](https://examples.vovk.dev/static-params)

This builds six JSON files:

- [/static-params/a/page1.json](https://examples.vovk.dev/api/static/static-params/a/page1.json)
- [/static-params/a/page2.json](https://examples.vovk.dev/api/static/static-params/a/page2.json)
- [/static-params/a/page3.json](https://examples.vovk.dev/api/static/static-params/a/page3.json)
- [/static-params/b/page1.json](https://examples.vovk.dev/api/static/static-params/b/page1.json)
- [/static-params/b/page2.json](https://examples.vovk.dev/api/static/static-params/b/page2.json)
- [/static-params/b/page3.json](https://examples.vovk.dev/api/static/static-params/b/page3.json)

## Real-world example: static-klines

[static-klines](https://github.com/finom/static-klines) is a Vovk.ts static segment that pre-renders historical Binance Spot candles into ~17,000 plain JSON files on GitHub Pages. The whole API ships as static assets with no runtime — no rate limits, no server compute, infinitely cacheable — and auto-generated TypeScript and Python clients are published from the same Zod schemas the server uses. It's a practical illustration of `controllersToStaticParams` scaled to a full dataset.

---

Page: https://vovk.dev/procedure

# Controller & Procedure

A **controller** in Vovk.ts is a class that groups endpoint logic as `static` members. The class is initialized (not instantiated) inside a [segment route](https://vovk.dev/segment) via [`initSegment`](https://vovk.dev/segment#creating-segments) — that's how its members become reachable HTTP endpoints.

A **procedure** is one such member: a single endpoint definition, typically decorated with an HTTP method like `@get()`, `@post()`, `@put()`, `@patch()`, or `@del()`. Vovk.ts supports two authoring styles, both of which compile to real Next.js Route Handlers:

- **Bare static method** — `(req: NextRequest, params)` signature, same as a plain Route Handler. Class-organized, with a codegen-typed [RPC client](https://vovk.dev/typescript) and [segments](https://vovk.dev/segment).
- **[`procedure()`](#procedure) wrapper** — turns the static method into a typed, validated callable with `body` / `query` / `params` / `output` schemas. Unlocks [`.fn()`](https://vovk.dev/fn) local calls (SSR, server actions, AI tool execution), [OpenAPI](https://vovk.dev/openapi) generation, and [AI tool exposure](https://vovk.dev/tools).

Pick the bare style for simple cases; reach for `procedure()` whenever you want validation or a transport-agnostic callable.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { put, prefix, type VovkRequest } from 'vovk';

@prefix('users') // optional prefix for all routes in this controller
export default class UserController {
  @put('{id}')
  static async updateUser(
    req: VovkRequest<{ email: string }, { notify: 'email' | 'push' | 'none' }>,
    { id }: { id: string }
  ) {
    const data = await req.json();
    // ...
  }
}
```

The class itself is initialized in a [segment route](https://vovk.dev/segment) by adding it to the `controllers` object accepted by `initSegment`:

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
import { initSegment } from 'vovk';
import UserController from '../../../modules/user/user-controller';

const controllers = {
  UserRPC: UserController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({ controllers });
```

The key of this object defines the name of the resulting RPC module variable used by the client side:

```ts showLineNumbers copy
import { UserRPC } from '@/client';

// performs PUT /api/users/69?notify=push
const updatedUser = await UserRPC.updateUser({
  params: { id: '69' },
  query: { notify: 'push' },
  body: userData,
});
```

The RPC method takes `body` and `query` because the request is typed with [`VovkRequest`](#vovkrequest-type); with `NextRequest` it takes `params` only.

For more information, see [TypeScript Client](https://vovk.dev/typescript).

> [!TIP]
> 
> In order to create a root endpoint for a [segment](https://vovk.dev/segment), use no prefix and an empty path (or an empty string) in the HTTP decorator.
> ```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
> import { get } from 'vovk';
> 
> export default class UserController {
>   @get()
>   static async listUsers(req: NextRequest) {
>     // ...
>   }
> }
> ```

## Auto-Generated Endpoints

All HTTP decorators provide an `.auto` method that generates the endpoint name from the method name, making the handler definition more RPC‑like.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { prefix, put } from 'vovk';

@prefix('users')
export default class UserController {
  // creates PUT /api/users/do-something
  @put.auto()
  static async doSomething(/* ... */) {
    // ...
  }
}
```

## Request Headers

A procedure can access any Next.js APIs, such as cookies, headers, and so on via `next` package imports. See Next.js [documentation](https://nextjs.org/docs/app/api-reference/functions/headers) for details.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { put, prefix } from 'vovk';
import { cookies, headers } from 'next/headers';

@prefix('users')
export default class UserController {
  @put('{id}')
  static async updateUser(req: NextRequest, { id }: { id: string }) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('sessionToken');
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    // ...
  }
}
```

Alternatively, use `req.headers` from the [Web Request API](https://developer.mozilla.org/en-US/docs/Web/API/Request/headers): `req.headers.get('user-agent'){:ts}`.

## `VovkRequest` Type

`VovkRequest` mirrors the `NextRequest` type by adding generics for request body (`json` method) and query (`searchParams` property) parameters. This allows you to define the expected types for these parts of the request, enabling type-safe access within procedure.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { put, prefix, type VovkRequest } from 'vovk';
import type { User } from '../../types';

@prefix('users')
export default class UserController {
  // Example request: PUT /api/users/69?role=moderator
  @put('{id}')
  static async updateUser(
    req: VovkRequest<Partial<User>, { notify: 'email' | 'push' | 'none' }>,
    { id }: { id: string }
  ) {
    const data = await req.json(); // Partial<User>
    const notify = req.nextUrl.searchParams.get('notify'); // 'email' | 'push' | 'none'
    // ...
    return updatedUser;
  }
}
```

`VovkRequest` extends `Request` but doesn't extend `NextRequest` in order to keep the **vovk** package independent of **next** package. However, it replicates the documented `NextRequest` properties such as `cookies` (with `get`, `getAll`, `set`, `delete`, `has`, `clear` methods) and `nextUrl` (with `basePath`, `buildId`, `pathname`, `search`, and typed `searchParams`).

`searchParams` holds the raw URL, so its types follow what the URL carries: a required string field keeps its type, any other field is a string, and `get` may return `null` for an optional field, an array or an object (the client sends an array as `tags[0]=a`, under keys of its own). The parsed query comes from [`req.vovk.query()`](https://vovk.dev/req-vovk).

## `procedure` Function

The `procedure` function turns a static method into a **typed, validated callable**. It accepts validation schemas for body, query, params, and output — using any library that implements both [Standard Schema](https://standardschema.dev/schema) and [Standard JSON Schema](https://standardschema.dev/json-schema), such as [Zod](https://zod.dev/), [Valibot](https://valibot.com/), or [Arktype](https://arktype.io/). A schema that implements Standard Schema alone, as Zod before 4.2 does, still validates, but `procedure(){:ts}` warns and emits its JSON Schema as `{}`.

With these three libraries, a type that JSON Schema can't describe, such as a `Date{:ts}` or a `bigint{:ts}`, is emitted as `{}` (any value). The server still validates it, but client-side validation and the [Python](https://vovk.dev/python) and [Rust](https://vovk.dev/rust) clients accept any value there.

It returns an object with a `.handle()` method that accepts the actual async handler. The handler receives a type-enhanced request as `VovkRequest<TBody, TQuery, TParams>{:ts}` and the validated `params: TParams{:ts}` value as the second argument. Without a `params` schema, the second argument and `req.vovk.params()` hold the route params as strings, typed `Record<string, string>{:ts}`.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { procedure, prefix, put } from 'vovk';
import { z } from 'zod';

@prefix('users')
export default class UserController {
  @put('{id}')
  static updateUser = procedure({
    params: z.object({ id: z.uuid() }),
    body: z.object({ email: z.email() }),
    query: z.object({ notify: z.enum(['email', 'push', 'none']) }),
    output: z.object({ success: z.boolean() }),
  }).handle(async (req, { id }) => {
    const { email } = await req.json();
    const notify = req.nextUrl.searchParams.get('notify');
    // ...
  });
}
```

If `.handle()` is not provided, the procedure throws Not Implemented (501) at runtime.

For separating business logic into its own layer, see [Services](https://vovk.dev/service).

### HTTP decorator is optional

A procedure created with `procedure()` does not need an HTTP decorator to work. Without one, it remains a typed validated callable usable via [`.fn()`](https://vovk.dev/fn) — for SSR, server components, server actions, AI tool execution, and so on. The decorator is what additionally mounts the procedure as an HTTP endpoint and makes it appear in the generated RPC client. See [Calling Procedures Locally](https://vovk.dev/fn) for the full reference and patterns like binding standalone procedures into a controller later.

### Alternative: `decorate` Syntax

If you prefer not to use decorators, you can define procedures using the `decorate` function. `decorate` returns an object with a `.handle()` method for the handler. The controller prefix is defined as a `static prefix` property. This produces the same result as decorators in terms of functionality, types, and generated RPC modules.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { decorate, procedure, put, operation } from 'vovk';
import { z } from 'zod';

class UserController {
  static prefix = 'users';

  static updateUser = decorate(
    put('{id}'),
    operation({ summary: 'Update user' }),
    procedure({
      params: z.object({ id: z.uuid() }),
      body: z.object({ email: z.email() }),
      query: z.object({ notify: z.enum(['email', 'push', 'none']) }),
      output: z.object({ success: z.boolean() }),
    }),
  ).handle(async (req, { id }) => {
    const { email } = await req.vovk.body();
    const { notify } = req.vovk.query();
    // ...
  });
}

export default UserController;
```

The `decorate` function applies decorators in the same order as the stacked decorator syntax — the last decorator listed (closest to the handler) is applied first. For handlers without validation, pass a plain async function to `.handle()`:

```ts showLineNumbers copy
static listUsers = decorate(
  get(),
).handle(
  async (req: VovkRequest) => {
    // ...
  }
);
```

See the [Decorators Overview](https://vovk.dev/decorator-overview) page for more details on when to use decorators vs `decorate`.

### `procedure` Options

#### `body`, `query`, and `params`

Use `body`, `query`, and `params` to provide input validation schemas. These validate incoming request data before it reaches the controller handler.

A request without a body is validated as `undefined{:ts}`, so an optional schema such as `z.object({ ... }).optional(){:ts}` lets the client leave the body out. So is an empty body with a JSON content type; an empty text or an empty file is a body.

Data that fails validation gets a `400` response. Its message and its `cause.issues` hold the first 20 issues, and the message says how many more there are. An issue keeps its `message`, its `path` as a list of keys, and the library's other fields that hold text, a number or a boolean, such as Zod's `code`; fields that copy the value that failed are left out.

#### `output` and `iteration`

Use `output` and `iteration` to provide output validation schemas. `output` is for regular JSON responses, while `iteration` is for [JSON Lines](https://vovk.dev/jsonlines). Both are optional. When given, the RPC method's result type follows `output`, and the type of its stream items follows `iteration`, instead of the handler's return type. They also enable key features like [OpenAPI](https://vovk.dev/openapi), [AI tools](https://vovk.dev/tools), and the [Python](https://vovk.dev/python), [Rust](https://vovk.dev/rust), and future clients. These schemas are not used for client-side validation. A procedure takes one or the other: `procedure(){:ts}` throws when it gets both.

A response that fails `output` or `iteration` validation is a bug in the handler, not in the request. It is thrown as a plain `Error{:ts}`, without a status code: in production the client gets `500` "Internal server error", and the validation issues stay on the server, where the segment's [`onError`](https://vovk.dev/segment) receives the first 20 of them as the error's `cause`. In development the message names the failing fields.

#### `contentType`

`contentType` specifies the expected `Content-Type` for the request body. It can be a string or an array of strings. It affects several areas of the procedure:

- **Client-side `body` typing** — The RPC method's `body` type is inferred based on the content type (e.g. `FormData{:ts}` for form data, `string{:ts}` for text types, `File | ArrayBuffer | Uint8Array | Blob{:ts}` for binary types).
- **Server-side body parsing** — [`req.vovk.body()`](https://vovk.dev/req-vovk#body) automatically parses the request body into the appropriate shape (parsed JSON object, parsed `FormData{:ts}`, `string{:ts}`, or `File{:ts}`) based on the incoming `Content-Type` header.
- **415 enforcement** — When `contentType` is set, requests that arrive without a matching `Content-Type` header receive a `415 Unsupported Media Type` error. The header must name one media type, compared case-insensitively: a comma-separated list is refused. A request without a body skips the check.
- **Wildcard matching** — Supports wildcard patterns such as `'video/*'{:ts}`, `'image/*'{:ts}`, or `'*/*'{:ts}` to accept a range of media types.

See [Content Type](https://vovk.dev/content-type) for a full breakdown of supported types, body parsing behaviour, and examples.

#### `disableServerSideValidation`

Disables server-side validation for the specified library. Provide a boolean to disable it entirely, or an array of validation types (`body`, `query`, `params`, `output`, `iteration`). This does not affect generated RPC typings or client-side validation.

#### `skipSchemaEmission`

Skips emitting JSON Schema for the handler. Provide a boolean to skip entirely, or an array of validation types (`body`, `query`, `params`, `output`, `iteration`). This does not change RPC typings but disables features that depend on emitted schemas, including client-side validation.

#### `validateEachIteration`

Applies only to `iteration`. Controls whether to validate each item in the streamed response. By default, only the first `iteration` item is validated.

#### `operationObject`

Optionally provide an `operationObject` to specify OAS details when the `@operation` decorator is not applicable—useful with [`fn`](https://vovk.dev/fn) on a regular function instead of a class method.

#### `preferTransformed = true`

By default, methods provided by [`req.vovk`](https://vovk.dev/req-vovk) transform (but not the built-in Next.js functions such as `req.json()` or `req.nextUrl.searchParams.get()`) incoming data into the validation result shape. If you need raw I/O without transformations, set `preferTransformed` to `false`. This causes all features that rely on validation models (`body`, `query`, `params`, `output`, `iteration`) to return the original data format instead of the transformed one. The JSON Schema emitted for `output` and `iteration` describes what the server sends: the transformed value, or with `preferTransformed: false` the original one.

### `procedure` Features

Procedures created with `procedure()` gain extra capabilities beyond plain handlers.

#### `fn`

The `fn` property calls the procedure directly without making an HTTP request — for SSR/PPR, server actions, AI tool execution, etc. Same call shape as the generated RPC method:

```ts showLineNumbers copy
const result = await UserController.updateUser.fn({
  body: { /* ... */ },
  query: { /* ... */ },
  params: { /* ... */ },
  disableClientValidation: false, // default
});

// same call shape as the RPC client
const result = await UserRPC.updateUser({
  body: { /* ... */ },
  query: { /* ... */ },
  params: { /* ... */ },
  disableClientValidation: false, // default
});
```

See [Calling Procedures Locally](https://vovk.dev/fn) for details.

#### `schema`

```ts showLineNumbers copy
const schema = UserController.updateUser.schema;

// same as UserRPC.updateUser.schema
```

The `schema` property exposes the method schema, mirroring the RPC method schema. It's typically used with `fn` to build [AI tools](https://vovk.dev/tools) that invoke handlers without HTTP.

#### `definition`

```ts showLineNumbers copy
const bodyModel = UserController.updateUser.definition.body;
```

The `definition` property is available only on server-side methods, but not on the RPC methods. It lets you access the original procedure definition.

---

Page: https://vovk.dev/service

# Services

A service is part of the Controller–Service–Repository pattern. It separates business logic from request handlers, keeping controllers focused on HTTP concerns while the service encapsulates the actual work and data manipulation.

Like controllers, services are often written as static classes with static methods, but they do not require decorators or any special structure. The static-class style is simply a convention—you can instead use instantiated classes, standalone functions, or plain objects. This pattern also does **not** require dependency injection (DI): services can be plain modules you import and call directly.

Let's say you have the following controller class:

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts" {22}
import { z } from 'zod';
import { procedure, prefix, post, operation } from 'vovk';
import UserService from './user-service';

@prefix('users')
export default class UserController {
  @operation({
    summary: 'Update user',
    description: 'Update user by ID with Zod validation',
  })
  @post('{id}')
  static updateUser = procedure({
    body: z.object({ /* ... */ }),
    params: z.object({ /* ... */ }),
    query: z.object({ /* ... */ }),
    output: z.object({ /* ... */ }),
  }).handle(async (req) => {
    const body = await req.vovk.body();
    const query = req.vovk.query();
    const params = req.vovk.params();

    return UserService.updateUser(body, query, params);
  });
}
```

The `handle` method returns the result of `UserService.updateUser`. That method, in turn, infers its types from the procedure, making the validation models (Zod schemas in this case) the single source of truth for input and output types, with no need to define separate types, thanks to the legendary [Anders Hejlsberg](https://github.com/ahejlsberg) for the fix in [#58616](https://github.com/microsoft/TypeScript/issues/58616)—without this TypeScript change, Vovk.ts would not be possible.

```ts showLineNumbers copy filename="src/modules/user/user-service.ts"
import type { VovkBody, VovkOutput, VovkParams, VovkQuery } from 'vovk';
import type UserController from './user-controller';

export default class UserService {
  static updateUser(
    body: VovkBody<typeof UserController.updateUser>,
    query: VovkQuery<typeof UserController.updateUser>,
    params: VovkParams<typeof UserController.updateUser>
  ) {
    // perform DB operations or other business logic here
    console.log(body, query, params);
    return { success: true, id: params.id } satisfies VovkOutput<typeof UserController.updateUser>;
  }
}
```

In other words, service methods can infer types from procedures, and procedures can call service methods without self-referencing type issues.

---

Page: https://vovk.dev/req-vovk

# `req.vovk` Interface

While using built-in `NextRequest` functions like `req.json()` and `req.nextUrl.searchParams.get()` are sufficient for most use cases, Vovk.ts also patches the request object with `vovk` property that provides additional methods for more advanced input data handling. It covers the following scenarios:

- Receive data transformed by the validation library (`req.json()` and `req.nextUrl.searchParams.get()` return data as is), unless the procedure sets [`preferTransformed`](https://vovk.dev/procedure#prefertransformed--true) to `false`.
- Implement nested query parameters parsing.
- Read form data as a typed object, instead of `FormData`, provided by `req.formData()`.
- Implement request metadata storage.

## `async req.vovk.body()`

The `req.vovk.body` function returns the request body parsed as an object. In most cases, it behaves the same as `req.json()`, but can also return data based on non-JSON content type set at `procedure` function (see [Content Type](https://vovk.dev/content-type) for details).

```ts showLineNumbers copy
import { post, type VovkRequest } from 'vovk';
export default class UserController {
  @post()
  static async createUser(req: VovkRequest<{ foo: string }>) {
    const body = await req.vovk.body(); // body type is { foo: string }
    // ...
  }
}
```

## `req.vovk.query()`

The `req.vovk.query` function returns typed query parameters, allowing for nested data structures.

```ts showLineNumbers copy
import { get, type VovkRequest } from 'vovk';
export default class UserController {
  @get()
  static async getUser(req: VovkRequest<null, { id: string }>) {
    const query = req.vovk.query(); // query type is { id: string }
    // ...
  }
}
```

Nested data is serialized as a query string with square brackets, commonly referred to as "PHP‑style" or "bracket notation".

- Square brackets `[ ]` denote keys for arrays or nested objects.
- Indices `[0]` to `[n-1]`, none missing, make an array of any length; `[]` appends an element after the highest index.
- Any other keys make an object: named keys (e.g., `[f]`, `[u]`), and numeric keys with gaps, so `record[7]=on` gives `{ record: { 7: "on" } }`.
- A key given more than once collects its values into an array, so `tag=a&tag=b` gives `{ tag: ["a", "b"] }`. A repeated index names the same element, so its last value wins.
- With a `query` schema in a [procedure](https://vovk.dev/procedure), a key given once where the schema takes an array is a one-item array, so `tag=a` gives `{ tag: ["a"] }`, as OpenAPI's default style sends it.
- `[]` followed by more brackets adds to the last element until that element already has the key: `items[][name]=a&items[][price]=1&items[][name]=b` gives `{ items: [{ name: "a", price: "1" }, { name: "b" }] }`.
- The structure can be nested up to 32 levels deep. A key with more brackets gets a 400 response.

The RPC client leaves out `null`, `undefined` and empty objects or arrays, and numbers the remaining array items without gaps, so `{ tags: ['a', null, 'b'] }{:ts}` arrives as `{ tags: ['a', 'b'] }{:ts}`. A value with a `toJSON` method is sent as its result, as `JSON.stringify` does: a `Date{:ts}` as an ISO string, a `URL{:ts}` as its `href`.

The following query string:

```
?simple=value&array[0]=first&array[1]=second&object[key]=value&nested[obj][prop]=data&nested[arr][0]=item1&nested[arr][1]=item2&complex[items][0][name]=product&complex[items][0][price]=9.99&complex[items][0][tags][0]=new&complex[items][0][tags][1]=featured
```

Is parsed as:

```ts showLineNumbers copy
{
  simple: "value",
  array: ["first", "second"],
  object: {
    key: "value"
  },
  nested: {
    obj: {
      prop: "data"
    },
    arr: ["item1", "item2"]
  },
  complex: {
    items: [
      {
        name: "product",
        price: "9.99",
        tags: ["new", "featured"]
      }
    ]
  }
}
```

## `req.vovk.params()`

The `req.vovk.params` function returns typed route parameters. To type it properly, use the third generic argument of `VovkRequest` (alternative to the second procedure argument).

```ts showLineNumbers copy
import { get, type VovkRequest } from 'vovk';

export default class UserController {
  @get('{id}')
  static async getUser(req: VovkRequest<null, null, { id: string }>) {
    const params = req.vovk.params(); // params type is { id: string }
    // ...
  }
}
```

A path segment can hold several params, e.g. `@get('range/{from}-{to}'){:ts}` or `@get('files/{name}.{ext}'){:ts}`. Each request gets its own params object. With a `params` schema, `req.vovk.params()` and the handler's second argument both return the validated value.

## `req.vovk.meta()`

Custom metadata is accessible through the `vovk.meta` method in the procedure and in [custom decorators](https://vovk.dev/decorator).

```ts showLineNumbers copy {4,13}
import { createDecorator, get, type VovkRequest } from 'vovk';

const myDecorator = createDecorator(async (req, next) => {
  req.vovk.meta({ hello: 'world' }); // set request meta for the request
  // ...
  return next();
});

export default class MyController {
  @get('/my-endpoint')
  @myDecorator()
  static async myHandler(req: VovkRequest) {
    console.log(req.vovk.meta<{ hello: string }>()); // { hello: 'world' }
    // ...
  }
}
```

The metadata is a key‑value object that is merged when you call `vovk.meta` multiple times with different keys.

```ts showLineNumbers copy
// ...
req.vovk.meta({ foo: 'bar' });
req.vovk.meta({ baz: 'qux' });
console.log(req.vovk.meta<{ foo: string; baz: string }>()); // { foo: 'bar', baz: 'qux' }
```

As you can see, a generic is required only when you want type‑safe access to metadata. If you don't provide a generic, the metadata is inferred from the argument.

To reset metadata, call `req.vovk.meta(null)`, which clears the metadata object.

```ts showLineNumbers copy
req.vovk.meta(null);
console.log(req.vovk.meta()); // {}
```

To summarize:

- To set metadata, use `req.vovk.meta({ key: value })`. It will return the metadata object typed as the passed object.
- To access metadata, use `req.vovk.meta<{ key: Type }>()`, which will return the metadata object typed as the passed generic type.
- To reset metadata, use `req.vovk.meta(null)`, which will clear the metadata object.

#### Client-Side Meta with `xMetaHeader` Key

[The TypeScript client](https://vovk.dev/typescript) can send custom metadata to the server in the `x-meta` header as a JSON string.

```ts showLineNumbers copy {5}
import { UserRPC } from '@/client';

const user = await UserRPC.getUser({
  params: { id: '123' },
  meta: { hello: 'world' }, // pass metadata to the server via x-meta header
});
```

The `getUser` procedure, as well as [decorators](./decorator), can access this metadata via `req.vovk.meta` under the `xMetaHeader` key:

```ts showLineNumbers copy {6-7}
import { get, type VovkRequest } from 'vovk';

export default class UserController {
  @get('{id}')
  static async getUser(req: VovkRequest) {
    const meta = req.vovk.meta<{ xMetaHeader: { hello: string } }>();
    console.log(meta.xMetaHeader); // { hello: 'world' }
    // ...
  }
}
```

This design prevents server‑side metadata from being overwritten by client input, as client values are only exposed under the `xMetaHeader` key.

---

Page: https://vovk.dev/fn

# Local Procedure Call (LPC)

Every procedure created with the [procedure](https://vovk.dev/procedure#procedure) function is callable as a regular function via its `fn` property. The call signature is `{ params, query, body }` — the same shape as the generated RPC client, which mirrors `fn` (not the other way around).

Let's say you have the following controller class:

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { z } from 'zod';
import { procedure, prefix, get, operation } from 'vovk';
import UserService from './user-service';

@prefix('users')
export default class UserController {
  @operation({
    summary: 'Update user',
    description: 'Update user by ID with Zod validation',
  })
  @get('{id}')
  static getUser = procedure({
    params: z.object({
      id: z.string().uuid(),
    }),
  }).handle((req) => {
    // ...
  });
}
```

When the controller is mounted in a [segment](https://vovk.dev/segment), the same procedure is also reachable over HTTP through the generated RPC client — same call shape:

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const user = await UserRPC.getUser({
  params: { id: '123e4567-e89b-12d3-a456-426614174000' },
  disableClientValidation: true, // disables client-side validation
  meta: { hello: 'world' }, // available as xMetaHeader metadata
});

console.log('User:', user);
```

Calling the procedure with `fn` runs it in the current evaluation context — no HTTP, no network, full validation:

```ts showLineNumbers copy
import UserController from '@/modules/user/user-controller';

const user = await UserController.getUser.fn({
  params: { id: '123e4567-e89b-12d3-a456-426614174000' },
  disableClientValidation: true, // disables validation
  meta: { hello: 'world' }, // available as root metadata
});

console.log('User:', user);
```

This will invoke `UserController.getUser` like a normal function, performing validation before executing the handler.

There are several core use cases for local procedures:

**For SSR, SSG, PPR, and server actions**: You can use the method in a server component:

```tsx showLineNumbers copy filename="src/app/user/page.tsx"
import UserController from '@/modules/user/user-controller';

export default async function UserPage() {
  const user = await UserController.getUser.fn({
    params: { id: '123e4567-e89b-12d3-a456-426614174000' },
  });

  return (
    <p>User: {JSON.stringify(user)}</p>
  );
}
```

**For Next.js server actions**: You can use `fn` inside a server action to call the procedure directly from a form submission. Make sure the procedure has `contentType` set to `'multipart/form-data'` to accept `FormData` as the body:

```tsx showLineNumbers copy filename="src/app/user/create/page.tsx"
import UserController from '@/modules/user/user-controller';

export default function CreateUserPage() {
  async function handleCreate(body: FormData) {
    'use server';
    await UserController.createUser.fn({ body });
  }

  return (
    <form action={handleCreate}>
      <input name="name" required />
      <button type="submit">Create User</button>
    </form>
  );
}
```

**For [AI tool execution](https://vovk.dev/tools)**: controllers that define procedures with `procedure()` can be passed as a "module" to the `deriveTools` utility to call procedures in the current context without performing HTTP requests.

```ts showLineNumbers copy
import { deriveTools } from 'vovk';

const tools = deriveTools({
  modules: { UserController },
});

console.log(tools); // [{ name, description, inputSchema, execute, ... }, ...]
```

## Rules of Locally Called Procedures

`fn` functions do not imitate the `Request` object but partially implement the `VovkRequest` interface by exposing only the [custom `vovk` property](https://vovk.dev/req-vovk) with `async vovk.body()`, `vovk.query()`, `vovk.params()`, and `vovk.meta()`. In other words, properties such as `req.url` or `req.headers` are not defined in the local procedure context. A suitable `req` signature looks like `Pick<VovkRequest<TBody, TQuery, TParams>, 'vovk'>{:ts}`. `vovk.body()` reads a `FormData{:ts}`, `URLSearchParams{:ts}`, `Blob{:ts}`, `ArrayBuffer{:ts}` or typed array body as the server reads a request that carries it, by the content type the RPC client would send; any other body is passed as it is.

To ensure that the implemented HTTP handler can also be called with `fn`, you can use request object destructuring when defining the handler to use only the `vovk` property:

```ts showLineNumbers copy {16}
export default class UserController {
  @post('{id}')
  static updateUser = procedure({
    body: z.object({
      /* ... */
    }),
    params: z.object({
      /* ... */
    }),
    query: z.object({
      /* ... */
    }),
    output: z.object({
      /* ... */
    }),
  }).handle(async ({ vovk }) => {
    const body = await vovk.body();
    const query = vovk.query();
    const params = vovk.params();
    const meta = vovk.meta<{ hello: string }>();
    // ...
  });
}
```

Local procedure is [decorated](./decorator) with the same decorators as the HTTP handler. If you create a decorator to wrap an HTTP handler for use with `fn`, avoid using `NextRequest`‑specific properties like `req.headers`, or `req.nextUrl`.

```ts showLineNumbers copy {4}
import { createDecorator } from 'vovk';

const myDecorator = createDecorator(({ vovk }, next) => {
  const meta = vovk.meta<{ foo: string }>();
  // ...
  return next();
});
```

You can detect if the procedure is called locally by checking `req.url`, which is `undefined` when called via `fn`:

```ts showLineNumbers copy {4}
import { createDecorator } from 'vovk';

const myDecorator = createDecorator((req, next) => {
  if (typeof req.url === 'undefined') {
    console.log('Local context');
  } else {
    console.log('HTTP request context');
  }
  // ...
  return next();
});
```

Even though `req` is not a `Request`, you can still use Next.js features like `headers` or `cookies` from `next/headers` in the local procedure context:

```ts showLineNumbers copy {5}
import { createDecorator } from 'vovk';
import { headers } from 'next/headers';

const myDecorator = createDecorator(async ({ vovk }, next) => {
  const reqHeaders = await headers();
  // ...
  return next();
});
```

---

An HTTP decorator such as `@get`, `@post`, etc., is not required for a local procedure to work. The only requirement is to use the `procedure` function to create the procedure.

```ts showLineNumbers copy filename="src/modules/user/user-procedures.ts"
import { z } from 'zod';
import { procedure } from 'vovk';

export default class UserProcedures {
  static updateUser = procedure({
    body: z.object({
      /* ... */
    }),
    // ...
  }).handle(({ vovk }) => {
    // ...
  });
}

UserProcedures.updateUser.fn({
  /* ... */
});
```

When a static class is implemented this way, it behaves like a "validated service", which can be attached to the controller later or used as a standalone collection of validated functions.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts" {7}
import { prefix, post } from 'vovk';
import UserProcedures from './user-procedures';

@prefix('users')
export default class UserController {
  @post('{id}')
  static updateUser = UserProcedures.updateUser;
}
```

Assign the procedure itself. `.bind()` returns a plain function: it has no `fn`, and the emitted schema loses the procedure's validation, which client-side validation, OpenAPI, the Python and Rust clients and AI tools read.

---

Page: https://vovk.dev/response

# Response and Errors

[Procedures](./procedure), being a wrapper over Next.js route handlers, return `Response` objects. Alternatively, they can return JSON objects and throw exceptions, that internally get converted to `Response` objects.

The following snippets are equivalent for type inference at [TypeScript client](https://vovk.dev/typescript).

```ts showLineNumbers copy
// ...
export default class HelloController {
  @get()
  static helloWorld() {
    return { hello: 'world' };
  }
}
```

```ts showLineNumbers copy
import { NextResponse } from 'next/server';
// ...
export default class HelloController {
  @get()
  static helloWorld() {
    return NextResponse.json({ hello: 'world' });
  }
}
```

```ts showLineNumbers copy
// ...
export default class HelloController {
  @get()
  static helloWorld() {
    return new Response(JSON.stringify({ hello: 'world' }), {
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as { hello: string };
  }
}
```

## Response Headers

### Static Response Headers

All HTTP decorators support custom response headers via the second argument.

```ts showLineNumbers copy
// ...
export default class UserController {
  @put('do-something', { headers: { 'x-hello': 'world' } })
  static async doSomething(/* ... */) {
    /* ... */
  }
}
```

Enable CORS headers with the `cors: true` option.

```ts showLineNumbers copy
// ...
export default class UserController {
  @put('do-something', { cors: true })
  static async doSomething(/* ... */) {
    /* ... */
  }
}
```

For auto‑generated endpoints, `cors` and `headers` are specified as the single argument.

```ts showLineNumbers copy
// ...
export default class UserController {
  @put.auto({ cors: true, headers: { 'x-hello': 'world' } })
  static async doSomething(/* ... */) {
    /* ... */
  }
}
```

### Dynamic Response Headers

Set dynamic response headers with the `NextResponse` or `Response` object.

```ts showLineNumbers copy
import { NextResponse } from 'next/server';

// ...
export default class UserController {
  @put('do-something')
  static async doSomething() {
    return NextResponse.json({ hello: 'world' }, { headers: { 'x-hello': 'world' } });
  }
}
```

## `redirect` and `notFound`

To perform a redirect or render the not‑found page, use the built‑in Next.js functions from **next/navigation**.

```ts showLineNumbers copy
import { redirect, notFound } from 'next/navigation';

export default class UserController {
  @get('redirect')
  static async redirect() {
    // ... if something
    redirect('/some-other-endpoint');
  }

  @get('not-found')
  static async notFound() {
    // ... if something
    notFound();
  }
}
```

Both functions work by throwing an error, so you don’t need a `return` statement. TypeScript casts their return type as `never`. The same goes for `forbidden()` and `unauthorized()`: Vovk.ts rethrows these errors so Next.js answers them.

Thrown in a [JSON Lines](https://vovk.dev/jsonlines) stream, after the response has started, they end the stream with an error line instead: `notFound()`, `forbidden()` and `unauthorized()` send their status, 404, 403 or 401, and `redirect()` is sent as any other error, "Internal server error" in production.

See the [Next.js documentation](https://nextjs.org/docs/app/building-your-application/routing/redirecting) for more information.

## File Downloads

For attachments use `Response` from the Web API with appropriate headers.

```ts showLineNumbers copy
// ...
export default class DownloadController {
  @get('csv-report')
  static async downloadCSV() {
    return new Response(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=report.csv`,
      },
    });
  }
}
```

In order to simplify file responses, Vovk provides a helper function `toDownloadResponse`, which accepts a `Blob | File | ArrayBuffer | Uint8Array | ReadableStream<Uint8Array> | string{:ts}` as the file content, along with optional `filename`, `type` and `headers` object.

```ts showLineNumbers copy

import { toDownloadResponse } from 'vovk';
// ...
export default class DownloadController {
  @get('csv-report')
  static async downloadCSV() {
    return toDownloadResponse(csvString, { 
        filename: 'report.csv', 
        type: 'text/csv', 
        headers: { 'x-hello': 'world' } 
    });
  }
}
```

## Errors

You can gracefully throw HTTP exceptions using syntax inspired by NestJS. The `HttpException` class accepts three arguments: an HTTP code from `HttpStatus`, a message, and an optional `cause` object.

```ts showLineNumbers copy
import { HttpException, HttpStatus } from 'vovk';

// ...
static async updateUser(/* ... */) {
    // ...
    throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong');
}
```

Errors are rethrown on the [client side](https://vovk.dev/typescript) with the same interface.

```ts showLineNumbers copy
import { UserRPC } from '@/client';
import { HttpException } from 'vovk';

// ...
try {
  const updatedUser = await UserRPC.updateUser(/* ... */);
} catch (e) {
  console.log(e instanceof HttpException); // true
  const err = e as HttpException;
  console.log(err.message, err.statusCode);
}
```

Regular errors such as `Error` are equivalent to `HttpException` with code `500`. In production, their message and cause stay on the server and the client gets "Internal server error". So does an `HttpException` with status `0`, which an RPC module throws when a call gets no response or fails client-side validation. To pass such a failure on, catch it and throw an `HttpException` with a status.

```ts showLineNumbers copy
import { HttpException, HttpStatus } from 'vovk';

// ...
static async updateUser(/* ... */) {
    // ...
    throw new Error('Something went wrong'); // 500
}
```

You can provide a `cause` as the third argument to `HttpException` to supply additional context.

```ts showLineNumbers copy
throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong', { hello: 'World' });
```

## HttpStatus Enum

Here are the values of the `HttpStatus` enum for quick reference.

```ts showLineNumbers copy
export enum HttpStatus {
  NULL = 0, // for client-side errors, such as client-side validation
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
}
```

## Proxy Response

### JSON Proxy

You can create a proxy endpoint by fetching data from another server with `fetch`. It returns a `Response`, which Next.js handles automatically. To ensure correct client-side inference, force a different return type.

```ts showLineNumbers copy
import { get } from 'vovk';

export default class ProxyController {
  @get('greeting')
  static getHello() {
    return fetch('https://vovk.dev/api/hello/greeting.json') as unknown as { greeting: string };
  }
}
```

[View live example on examples.vovk.dev »](https://examples.vovk.dev/proxy)

On the client, the return type is inferred as expected.

```ts showLineNumbers copy
import { ProxyRPC } from '@/client';

// ...
const { greeting } = await ProxyRPC.getHello();
```

Alternatively, you can define the response type at the client method and keep the server return type as `Response`.

```ts showLineNumbers copy
import { ProxyRPC } from '@/client';

// ...
const { greeting } = await ProxyRPC.getHello<{ greeting: string }>();
```

### Blob Proxy

When you keep the original `Response` type, the client resolves the result as a `Response` object. This is useful for files or binary data.

```ts showLineNumbers copy
import { get } from 'vovk';

export default class ProxyController {
  @get('pdf-proxy')
  static getPdf() {
    return fetch('https://example.com/example.pdf');
  }
}
```

```ts showLineNumbers copy
import { ProxyRPC } from '@/client';

// ...
const response = await ProxyRPC.getPdf();
const buffer = await response.arrayBuffer();
const blob = new Blob([buffer], { type: 'application/pdf' });
// ...
```

---

Page: https://vovk.dev/content-type

# Content Type

The `contentType` option on a `procedure` controls how the request body is typed on the client, how it is parsed on the server, and which `Content-Type` headers are accepted. When `contentType` is set, the server returns a **415 Unsupported Media Type** error if the incoming request doesn't carry a matching `Content-Type` header.

The following table summarises how each content type family maps to client-side `body` typing and server-side `req.vovk.body()` return type:

| Content Type | Client `body` type | `req.vovk.body()` return type |
|---|---|---|
| `application/json`, `*+json` | `TBody \| Blob` | Parsed JSON object |
| `multipart/form-data` | `TBody \| FormData \| Blob` | Parsed form object |
| `application/x-www-form-urlencoded` | `TBody \| URLSearchParams \| FormData \| Blob` | Parsed form object |
| `text/*`, text-like application types, `*+xml`, `*+text`, `*+yaml`, `*+json-seq` | `string \| Blob` | `string` |
| Everything else (`image/*`, `video/*`, `application/octet-stream`, etc.) | `File \| ArrayBuffer \| Uint8Array \| Blob` | `File` |

> [!NOTE]
>
> Standard `Request` methods like `req.json()`, `req.text()`, `req.blob()`, and `req.formData()` remain available and work as usual—`contentType` only affects the typed helper on `req.vovk.body()`.

Wildcard patterns such as `'video/*'{:ts}`, `'image/*'{:ts}`, or `'*/*'{:ts}` are supported and match any subtype within that family.

## JSON (default)

When no `contentType` is specified, or when it is set to `'application/json'`, the body is typed as the schema-inferred type and parsed as JSON.

```ts showLineNumbers copy
import { z } from 'zod';
import { procedure, post, prefix } from 'vovk';

@prefix('users')
export default class UserController {
  @post()
  static createUser = procedure({
    body: z.object({
      email: z.string().email(),
      name: z.string(),
    }),
  }).handle(async (req) => {
    const { email, name } = await req.vovk.body(); // { email: string; name: string }
    // ...
  });
}
```

## Form Data

To accept form data requests, set `contentType` to `'multipart/form-data'`.

```ts showLineNumbers copy {8}
import { z } from 'zod';
import { procedure, post, prefix } from 'vovk';

@prefix('users')
export default class UserController {
  @post()
  static createUser = procedure({
    contentType: 'multipart/form-data',
    body: z.object({
      email: z.string().email(),
      name: z.string().min(2).max(100),
    }),
  }).handle(async (req) => {
    const { email, name } = await req.vovk.body(); // { email: string; name: string }
    // or use req.formData() for the raw FormData instance
    // ...
  });
}
```

The RPC method's `body` type is inferred as `TBody | FormData | Blob{:ts}`, where `TBody` is the type inferred from the validation schema. An object is validated as an object, then converted to `FormData` on the client side: `null` and `undefined` fields are left out, an array becomes one entry per item, a `Date{:ts}` is sent as an ISO string and another object as JSON. When the procedure also takes `application/json`, an object is sent as JSON, unless a field holds a file.

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const formData = new FormData();
formData.append('email', 'user@example.com');
formData.append('name', 'John Doe');

await UserRPC.createUser({
  body: formData,
});
```

On the server-side `req.vovk.body()` automatically parses the form data into a plain object (see [`req.vovk` Interface](https://vovk.dev/req-vovk)). You can also access the raw `FormData{:ts}` instance via `req.formData()`.

If the form data can contain one or more values for the same key, use a union of the value type and an array of the value type, because `FormData` doesn't distinguish between single and multiple values.

```ts showLineNumbers copy {9}
import { z } from 'zod';
import { procedure, post } from 'vovk';

export default class UserController {
  @post()
  static createUser = procedure({
    contentType: 'multipart/form-data',
    body: z.object({
      tags: z.union([z.array(z.string()), z.string()]),
    }),
  }).handle(async (req) => {
    const { tags } = await req.vovk.body(); // string | string[]
    // ...
  });
}
```

The same recommendation applies to files:

```ts showLineNumbers copy {9}
import { z } from 'zod';
import { procedure, post } from 'vovk';

export default class UserController {
  @post()
  static uploadFiles = procedure({
    contentType: 'multipart/form-data',
    body: z.object({
      files: z.union([z.array(z.file()), z.file()]),
    }),
  }).handle(async (req) => {
    const { files } = await req.vovk.body(); // File | File[]
    // ...
  });
}
```

Note that client-side validation does not fully support the OpenAPI-compatible `format: "binary"`, and file size, type, etc., are not validated on the client side.

## URL-Encoded Form Data

Set `contentType` to `'application/x-www-form-urlencoded'` to accept URL-encoded form submissions. The body is parsed the same way as `multipart/form-data`, but the client `body` type also accepts `URLSearchParams{:ts}`. When the procedure doesn't also accept `multipart/form-data`, an object body, or a `FormData{:ts}` without files, is sent as `URLSearchParams{:ts}`.

```ts showLineNumbers copy {7}
import { z } from 'zod';
import { procedure, post } from 'vovk';

export default class UserController {
  @post()
  static submitForm = procedure({
    contentType: 'application/x-www-form-urlencoded',
    body: z.object({
      username: z.string(),
      password: z.string(),
    }),
  }).handle(async (req) => {
    const { username, password } = await req.vovk.body();
    // ...
  }); 
}
```

## Text

For text-based content types (`text/*`, known text-like application types such as `application/xml` or `application/yaml`, and suffix patterns like `*+xml`, `*+text`, `*+yaml`, `*+json-seq`), the body is parsed as a `string`.

The client sends a string body as the text type the procedure declares. A string body to a procedure that takes JSON, such as one with `body: z.string(){:ts}`, is sent as a JSON value.

```ts showLineNumbers copy {7}
import { procedure, post } from 'vovk';

export default class UserController {
  @post()
  static importXml = procedure({
    contentType: 'application/xml',
  }).handle(async (req) => {
    const xmlString = await req.vovk.body(); // string
    // ...
  });
}
```

## Binary / File Uploads

For any content type that doesn't fall into the above categories—such as `application/octet-stream`, `image/*`, `video/*`, `application/pdf`, etc.—the body is parsed into a `File{:ts}` on the server. On the client side, the `body` accepts `File | ArrayBuffer | Uint8Array | Blob{:ts}`.

Bytes without a type, such as an `ArrayBuffer{:ts}`, a `Uint8Array{:ts}` or a `Blob{:ts}` with an empty `type`, are sent as the first declared type, so an `image/*` procedure receives them as `image/*`. A `File{:ts}` or a typed `Blob{:ts}` is sent as its own type, and the server refuses a type the procedure doesn't declare, unless it declares `application/octet-stream`, which takes any file.

The server names the `File{:ts}` after the request's `Content-Disposition` header, reading `filename*` before `filename`, and calls it `file` without one. The TypeScript client sends that header for a `File{:ts}` body. The name is client input, as is the name of a file in form data: never use it as a path.

```ts showLineNumbers copy {7}
import { procedure, post } from 'vovk';

export default class UserController {
  @post()
  static uploadImage = procedure({
    contentType: 'image/*',
  }).handle(async (req) => {
    const file = await req.vovk.body(); // File
    // or use req.blob() for raw Blob access
    // ...
  });
}
```

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const file = document.querySelector('input[type="file"]').files[0];

await UserRPC.uploadImage({
  body: file,
});
```

## Multiple Content Types

`contentType` accepts an array of strings to allow multiple content types. The body type becomes a union of all corresponding types.

```ts showLineNumbers copy {7}
import { z } from 'zod';
import { procedure, post } from 'vovk';

export default class UserController {
  @post()
  static importData = procedure({
    contentType: ['application/json', 'text/csv'],
    body: z.union([z.object({ items: z.array(z.string()) }), z.string()]),
  }).handle(async (req) => {
    const body = await req.vovk.body(); // parsed object or string, depending on the request
    // ...
  });
}
```

---

Page: https://vovk.dev/jsonlines

# JSON Lines Streaming

  [View JSON Lines example on examples.vovk.dev »](https://examples.vovk.dev/jsonlines)

## Overview

Vovk.ts includes first‑class support for the [JSON Lines](https://jsonlines.org/) format, a convenient way to implement “one request—many responses.” JSON Lines is another output type that uses the `iteration` validation field and produces the `application/jsonl` content type if the client sends an `Accept: application/jsonl` header. If the `Accept` header doesn’t include `application/jsonl`, the output is returned as `text/plain` so it’s viewable when the endpoint URL is opened directly in a browser.

The use cases for JSON Lines include:

- Type-safe alternative to Server-Sent Events (SSE) for streaming data to clients.
- Long‑running operations that produce multiple results over time, such as LLM completions or database polling.
- [Progressive](https://vovk.dev/progressive) data loading, where partial results are sent as they become available.

> [!IMPORTANT]
>
> Because the response size is not known in advance, JSON Lines responses cannot be compressed with Gzip, Brotli, or other algorithms. Keep this in mind for large responses.

## Creating a JSON Lines Generator Procedure

To create a JSON Lines procedure, define a procedure as a generator or async generator function. Each yielded object is serialized to JSON and sent as a separate line in the response.

```ts showLineNumbers copy
import { z } from 'zod';
import { procedure, prefix, post, type VovkIteration } from 'vovk';

@prefix('stream')
export default class StreamController {
  @post('completions')
  static getJSONLines = procedure({
    // ...
    iteration: z.object({
      message: z.string(),
    }),
  }).handle(async function*() {
    const tokens: VovkIteration<typeof StreamController.getJSONLines>[] = [
      { message: 'Hello,' },
      { message: ' World' },
      { message: ' from' },
      { message: ' Stream' },
      { message: '!' },
    ];

    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      yield token;
    }
  });
}
```

When used with a service, the iterable can be delegated using the `yield*` syntax:

```ts showLineNumbers copy filename="src/modules/stream/stream-controller.ts"
import { z } from 'zod';
import { procedure, prefix, post } from 'vovk';
import StreamService from './stream-service';

@prefix('stream')
export default class StreamController {
  @post('completions')
  static getJSONLines = procedure({
    // ...
    iteration: z.object({
      message: z.string(),
    }),
  }).handle(async function* () {
    yield* StreamService.getJSONLines();
  });
}
```

```ts showLineNumbers copy filename="src/modules/stream/stream-service.ts"
import type { VovkIteration } from 'vovk';
import type StreamController from './stream-controller';

export default class StreamService {
  static async *getJSONLines() {
    const tokens: VovkIteration<typeof StreamController.getJSONLines>[] = [
      { message: 'Hello,' },
      { message: ' World' },
      { message: ' from' },
      { message: ' Stream' },
      { message: '!' },
    ];

    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      yield token;
    }
  }
}
```

On the client side, the JSON Lines output can be consumed using [disposable](https://github.com/tc39/proposal-explicit-resource-management) [async iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator), to process each line as it arrives:

```ts showLineNumbers copy
import { StreamRPC } from '@/client';

using stream = await StreamRPC.getJSONLines();

for await (const { message } of stream) {
  console.log('Received message:', message);
}
```

The iterable (represented as `stream` above), besides `Symbol.asyncIterator`, `Symbol.dispose`, and `Symbol.asyncDispose`, also provides:

- `status`: The HTTP response status (e.g., 200 for OK, 404 for Not Found).
- `asPromise`: A promise that resolves with an array of all emitted values when the stream completes. Every call gets the same items.
- `onIterate`: Registers a callback for each iteration.
- `abortController`: An `AbortController` instance to abort the stream. When the stream is closed with `abortController.abort()`, it throws an `AbortError` on the stream reader that can be caught on the client side via error `cause` property.
- `abortSilently`: A method to abort the stream without throwing an error on the stream reader. This is useful when you want to stop processing the stream gracefully.

The `using` statement ensures the stream is aborted with `stream.abortSilently('Stream disposed')` when it goes out of scope.

The client reads the response only as fast as the iteration takes items, so a slow consumer slows the stream down instead of buffering it. An item is kept until every running iteration has passed it: iterations that run at the same time each get all items, an iteration that starts later begins at the oldest kept item, and iterating a consumed stream again yields nothing. After a `break`, the items already read stay for a later iteration or `asPromise()`. A line that isn't JSON, such as a last line the connection cut short, ends the iteration with an error.

```ts showLineNumbers copy
console.log('Response status:', stream.status);
stream.onIterate((item) => {
  console.log('Iterated item:', item);
});
if (someCondition) {
  stream.abortSilently();
}
console.log('All messages:', await stream.asPromise());
```

## OpenAI Chat Example

Create a procedure that delegates iterable output from OpenAI's streaming chat completions:

```ts showLineNumbers copy filename="src/modules/llm/llm-controller.ts"
import { post, prefix, operation, type VovkRequest } from 'vovk';
import OpenAI from 'openai';

@prefix('openai')
export default class OpenAiController {
  @operation({
    summary: 'Create a chat completion',
  })
  @post('chat')
  static async *createChatCompletion(
    req: VovkRequest<{ messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] }>
  ) {
    const { messages } = await req.json();
    const openai = new OpenAI();

    yield* await openai.chat.completions.create({
      messages,
      model: 'gpt-5-nano',
      stream: true,
    });
  }
}
```

On the client side, consume the streamed completion as follows:

```ts showLineNumbers copy
// ...
using completion = await OpenAiRPC.createChatCompletion({
  body: { messages: [...messages, userMessage] },
});

for await (const part of completion) {
  // ...
}
```

[View full example on examples.vovk.dev »](https://examples.vovk.dev/openai)

## `JSONLinesResponder` Class

`JSONLinesResponder` class is a lower-level API that works behind the scenes of the generator-based approach described above. It gives more control over the streaming logic, allowing to send messages manually. It constructs `ReadableStream` internally that's used as the response body.

```ts showLineNumbers copy
const responder = new JSONLinesResponder<IterationType>(req);
```

```ts showLineNumbers copy
const responder = new JSONLinesResponder<IterationType>(req, ({ readableStream, headers }) => new Response(readableStream, { headers }));
```

The constructor accepts two optional parameters:

- `request?: Request | null` – The incoming request object. If provided, it checks for `Accept: application/jsonl` header to create `headers` record for the response with `Content-Type: application/jsonl`. If not provided or the header is missing, it defaults to `text/plain`. The RPC client streams only a JSON Lines response and returns any other `Response` as is, so pass the request when the client reads the stream. In a procedure with `iteration`, the request also lets the responder validate a line sent before the handler returns it.
- `getResponse?: (responder: JSONLinesResponder<T>) => Response` – A function that allows to construct a custom `Response` object. Allows to set custom headers or other response options. If not provided, `Response` is created internally with default headers.

The responder instance provides the following members:

- `send(item: T): Promise` – Sends a JSON line to the client. The item is validated (if `iteration` is present; by default only the first item is validated unless `validateEachIteration: true` is set), serialized to JSON and followed by a newline character. Lines go out in call order, also when `send()` is not awaited. A send that fails, on iteration validation or with an item JSON can't serialize, ends the stream as `throw()` does, and the segment's `onError` receives the error.
- `close(): Promise` – Closes the response stream once the lines sent before it are out. A line sent after `close()` is dropped.
- `throw(err: Error): Promise` – Sends an error line after the lines sent before it and closes the stream; a line sent after `throw()` is dropped. The error line is `{"isError":true,"reason":"…"}`, plus the `statusCode` of an `HttpException{:ts}`, which is 500 for a status outside 200-599 as on a JSON response; the client rethrows it as an `HttpException{:ts}` with that status. The error of `notFound(){:ts}`, `forbidden(){:ts}` or `unauthorized(){:ts}` from `next/navigation`, which Next.js can no longer answer once the stream started, sends its status: 404, 403 or 401. In production, an error that is not an `HttpException{:ts}`, or is one with status 0, which a client throws for a call that got no response, reads "Internal server error".
- `isClosed: boolean` – Whether the stream is closed: by `close()` or `throw()`, from the moment either is called, by a failed send, or by the client going away. `send()` waits while the client reads slower than the handler writes, and a generator handler is stopped, with its `finally` run, when the client disconnects or an item fails.
- `response: Response` – The underlying `Response` object that will be returned from the Next.js route handler.
- `headers: Record<string, string>` – The `content-type` for the response.
- `readableStream: ReadableStream<Uint8Array>` – The readable stream used as the response body.

With `JSONLinesResponder` a service method is implemented as a regular function (not a generator) that accepts a `JSONLinesResponder` instance as a pointer to send messages manually.

```ts showLineNumbers copy filename="src/modules/stream/stream-service.ts"
import type { JSONLinesResponder, VovkIteration } from 'vovk';
import type StreamController from './stream-controller';

export type Token = VovkIteration<typeof StreamController.streamTokens>

export default class StreamService {
  static async streamTokens(responder: JSONLinesResponder<Token>) {
    const tokens: Token[] = [{ message: 'Hello,' }, { message: ' World' }, { message: '!' }];

    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await responder.send(token);
    }

    responder.close();
  }
}
```

Tokens are sent with `JSONLinesResponder#send`, and when the stream completes, close it with `JSONLinesResponder#close`.

The controller class returns an instance of `JSONLinesResponder`, and the streaming is performed in a floating Promise above the `return` statement.

```ts showLineNumbers copy
import { z } from 'zod';
import { prefix, get, procedure, JSONLinesResponder } from 'vovk';
import StreamService, { type Token } from './stream-service';

@prefix('stream')
export default class StreamController {
  @get('tokens')
  static streamTokens = procedure({
    iteration: z.object({ message: z.string() }),
  }).handle(async (req) => {
    const responder = new JSONLinesResponder<Token>(req);

    void StreamService.streamTokens(responder);

    return responder;
  });
}
```

The `iteration` schema gives `Token` its type, in the service and in the RPC client.

The `JSONLinesResponder` class also provides a `throw` method that safely closes the stream and causes the client to rethrow the received error.

```ts showLineNumbers copy
await resp.throw(new Error('Stream error'));
```

---

Page: https://vovk.dev/progressive

# Progressive Responses with `progressive` Function

  [View Progressive example on examples.vovk.dev »](https://examples.vovk.dev/progressive)

A common use of the [JSON Lines](https://vovk.dev/jsonlines) format is to sequentially send multiple data chunks in response to a single request. This is useful for long‑running operations, such as LLM completions, where you want to deliver partial results as they become available.

But what if you don’t know which chunk will arrive first, second, and so on? In this case, you can use an experimental feature called “progressive response,” inspired by Dan Abramov’s proposal [Progressive JSON](https://overreacted.io/progressive-json/), from which the “progressive” name originates.

Let's say you have two functions that return data after some random delay: `getUsers` and `getTasks`, implemented as static methods of a service class. In a real application, these could be API calls or queries to different databases.

With the help of the [JSONLinesResponder class](https://vovk.dev/jsonlines#jsonlinesresponder), we can create a simple service method that looks like this:

```ts showLineNumbers copy
// ...
void Promise.all([
  this.getUsers().then((users) => resp.send({ users })),
  this.getTasks().then((tasks) => resp.send({ tasks })),
])
  .then(resp.close)
  .catch(resp.throw);
// ...
```

- Once `getUsers()` or `getTasks()` resolves, `resp.send` sends a JSON line to the client.
- When all promises resolve, `resp.close` closes the response stream.
- If any promise rejects, `resp.throw` sends an error response to the client.

The full implementation of the service module looks like this:

```ts showLineNumbers copy filename="src/modules/progressive/progressive-service.ts" source="examples/kitchen-sink"
import type { JSONLinesResponder, VovkIteration } from 'vovk';
import type ProgressiveController from './progressive-controller.ts';

export default class ProgressiveService {
  static async getUsers() {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 10_000));
    return [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Alice Johnson' },
      { id: 4, name: 'Bob Brown' },
      { id: 5, name: 'Charlie White' },
    ];
  }

  static async getTasks() {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 10_000));
    return [
      { id: 1, title: 'Task One', completed: false },
      { id: 2, title: 'Task Two', completed: true },
      { id: 3, title: 'Task Three', completed: false },
      { id: 4, title: 'Task Four', completed: true },
      { id: 5, title: 'Task Five', completed: false },
    ];
  }

  static streamProgressiveResponse(
    responder: JSONLinesResponder<VovkIteration<typeof ProgressiveController.streamProgressiveResponse>>
  ) {
    return Promise.all([
      ProgressiveService.getUsers().then((users) => responder.send({ users })),
      ProgressiveService.getTasks().then((tasks) => responder.send({ tasks })),
    ])
      .then(responder.close)
      .catch(responder.throw);
  }
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/kitchen-sink/src/modules/progressive/progressive-service.ts)*

On the controller side, instantiate `JSONLinesResponder`, pass it to the service method, and return it as the response.

```ts showLineNumbers copy
// ...
const responder = new JSONLinesResponder<IterationType>(req);
void ProgressiveService.streamProgressiveResponse(responder);
return responder;
// ...
```

The full controller implementation with typing and validation looks like this:

```ts showLineNumbers copy filename="src/modules/progressive/progressive-controller.ts" source="examples/kitchen-sink"
import { procedure, get, JSONLinesResponder, prefix, type VovkIteration } from 'vovk';
import { z } from 'zod';
import ProgressiveService from './progressive-service.ts';

@prefix('progressive')
export default class ProgressiveController {
  @get('', { cors: true })
  static streamProgressiveResponse = procedure({
    validateEachIteration: true,
    iteration: z.union([
      z.strictObject({
        users: z.array(
          z.strictObject({
            id: z.number(),
            name: z.string(),
          })
        ),
      }),
      z.strictObject({
        tasks: z.array(
          z.strictObject({
            id: z.number(),
            title: z.string(),
            completed: z.boolean(),
          })
        ),
      }),
    ]),
  }).handle(async (req) => {
    const responder = new JSONLinesResponder<VovkIteration<typeof ProgressiveController.streamProgressiveResponse>>(
      req
    );

    void ProgressiveService.streamProgressiveResponse(responder);

    return responder;
  });
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/kitchen-sink/src/modules/progressive/progressive-controller.ts)*

For the client-side, we will use the `progressive` function from the `vovk` package, which creates a promise for each property of the resulting object. It accepts the RPC method to call (e.g., `ProgressiveRPC.streamProgressiveResponse`) and optional input parameters. The function returns an object with promises per property, which can be awaited separately.

```ts showLineNumbers copy
const { users: usersPromise, tasks: tasksPromise } = progressive(ProgressiveRPC.streamProgressiveResponse);
```

If the RPC method requires input parameters, you can pass them as the second argument:

```ts showLineNumbers copy
const { users: usersPromise, tasks: tasksPromise } = progressive(ProgressiveRPC.streamProgressiveResponse, {
  params: { id: '123' },
  body: { hello: 'world' },
});
```

After that, the promises can be awaited separately, and the data will be available as soon as the corresponding JSON line is received from the server:

```ts showLineNumbers copy
usersPromise.then(console.log).catch(console.error);
tasksPromise.then(console.log).catch(console.error);
```

---

Behind the scenes, `progressive` returns a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that implements a `get` trap to return a promise for each accessed property.

- When a new JSON line arrives, the corresponding promise resolves with that data.
- If a JSON line arrives for a property without an existing promise, the promise is created and resolved (so it can be retrieved later).
- When the response closes, all unsettled promises are rejected with an error indicating that the connection closed before sending a value for that property.
- If the response errors, all unsettled promises are rejected with that error.

---

Page: https://vovk.dev/inference

# Type Inference

Input and output inference is provided by universal types that work for both RPC modules and controller procedures.

Client-side inference:

```ts showLineNumbers copy
import type { VovkBody, VovkQuery, VovkParams, VovkInput, VovkOutput, VovkIteration, VovkReturnType, VovkYieldType } from 'vovk';
import { UserRPC, StreamRPC } from '@/client';

// infer input
type Body = VovkBody<typeof UserRPC.updateUser>;
type Query = VovkQuery<typeof UserRPC.updateUser>;
type Params = VovkParams<typeof UserRPC.updateUser>;
type Input = VovkInput<typeof UserRPC.updateUser>; // { params, query, body }

// infer output
type Output = VovkOutput<typeof UserRPC.updateUser>;
type Iteration = VovkIteration<typeof StreamRPC.streamTokens>;

// see below
type Return = VovkReturnType<typeof UserRPC.updateUser>;
type Yield = VovkYieldType<typeof StreamRPC.streamTokens>;
```

Server-side inference:

```ts showLineNumbers copy
import type { VovkBody, VovkQuery, VovkParams, VovkInput, VovkOutput, VovkIteration, VovkReturnType, VovkYieldType } from 'vovk';
import type UserController from './user-controller';
import type StreamController from './stream-controller';

// infer input
type Body = VovkBody<typeof UserController.updateUser>;
type Query = VovkQuery<typeof UserController.updateUser>;
type Params = VovkParams<typeof UserController.updateUser>;
type Input = VovkInput<typeof UserController.updateUser>; // { params, query, body }

// infer output
type Output = VovkOutput<typeof UserController.updateUser>;
type Iteration = VovkIteration<typeof StreamController.streamTokens>;

// see below
type Return = VovkReturnType<typeof UserController.updateUser>;
type Yield = VovkYieldType<typeof StreamController.streamTokens>;
```

## Input Inference

Source types for `body`, `query`, and `params` are defined via `VovkRequest<TBody, TQuery, ?TParams>{:ts}`, which specifies the type of the `req` argument in procedures. In other words, both raw and validated method definitions determine the input types.

Raw method definition with `params` as a generic argument:

```ts showLineNumbers copy
import type { VovkRequest } from 'vovk';

export default class UserController {
  @get()
  static async updateUser(req: VovkRequest<{ email: string }, { id: string }, { param: string }>) {
    // ...
  }
}
```

Raw method definition with `params` as a separate argument:

```ts showLineNumbers copy
import type { VovkRequest } from 'vovk';

export default class UserController {
  @get()
  static async updateUser(req: VovkRequest<{ email: string }, { id: string }>, params: { param: string }) {
    // ...
  }
}
```

Validated [procedures](https://vovk.dev/procedure) infer input types automatically:

```ts showLineNumbers copy
import { procedure } from 'vovk';
import { z } from 'zod';

export default class UserController {
  @get()
  static updateUser = procedure({
    query: z.object({ id: z.string() }),
    params: z.object({ param: z.string() }),
    body: z.object({ email: z.string().email() }),
  }).handle((req, params) => {
    // ...
  });
}
```

All three cases result the same RPC method:

```ts showLineNumbers copy
import { UserRPC } from '@/client';

await UserRPC.updateUser({
  params: { param: 'value' },
  query: { id: 'value' },
  body: { email: 'value' },
});
```

And they allow to infer input types identically:

```ts showLineNumbers copy
import type { VovkBody, VovkQuery, VovkParams } from 'vovk';
import { UserRPC } from '@/client';

type Body = VovkBody<typeof UserRPC.updateUser>; // { email: string }
type Query = VovkQuery<typeof UserRPC.updateUser>; // { id: string }
type Params = VovkParams<typeof UserRPC.updateUser>; // { param: string }
```

```ts showLineNumbers copy
import type { VovkBody, VovkQuery, VovkParams } from 'vovk';
import type UserController from './user-controller';

type Body = VovkBody<typeof UserController.updateUser>; // { email: string }
type Query = VovkQuery<typeof UserController.updateUser>; // { id: string }
type Params = VovkParams<typeof UserController.updateUser>; // { param: string }
```

For a procedure, the RPC method and [`fn`](https://vovk.dev/fn) take what the schemas accept (their input types), and the handler gets what the schemas return (their output types). The two differ when a schema has a default, a coercion or a transform. With `body: z.object({ tags: z.string().transform((s) => s.split(',')) }){:ts}`, `VovkBody` of the RPC method is `{ tags: string }{:ts}`, and `VovkBody` of the controller method is `{ tags: string[] }{:ts}`.

## Combined Input Type

`VovkInput<T>` extracts all three input types (`params`, `query`, `body`) into a single object.

```ts showLineNumbers copy
import type { VovkInput } from 'vovk';
import type UserController from './user-controller';

type Input = VovkInput<typeof UserController.updateUser>;
// { params: { param: string }; query: { id: string }; body: { email: string } }
```

It works the same way with RPC modules:

```ts showLineNumbers copy
import type { VovkInput } from 'vovk';
import { UserRPC } from '@/client';

type Input = VovkInput<typeof UserRPC.updateUser>;
// { params: { param: string }; query: { id: string }; body: { email: string } }
```

## Output/Iteration Inference

Output and iteration types are set only when using [procedure](https://vovk.dev/procedure) function.

For output:

```ts showLineNumbers copy
import { procedure } from 'vovk';
import { z } from 'zod';

export default class UserController {
  @get()
  static updateUser = procedure({
    output: z.object({ success: z.boolean() }),
  }).handle(async (req, params) => {
    return { success: true };
  });
}
```

For [JSON Lines](https://vovk.dev/jsonlines) responses:

```ts showLineNumbers copy
import { procedure } from 'vovk';
import { z } from 'zod';

export default class StreamController {
  @get()
  static streamItems = procedure({
    iteration: z.object({ item: z.boolean() }),
  }).handle(function *(req, params) {
    yield { item: true };
    yield { item: true };
  });
}
```

```ts showLineNumbers copy
import type { VovkOutput, VovkIteration } from 'vovk';
import { UserRPC } from '@/client';

type Output = VovkOutput<typeof UserRPC.updateUser>; // { success: boolean }
type Iteration = VovkIteration<typeof StreamRPC.streamItems>; // { item: boolean }
```

```ts showLineNumbers copy
import type { VovkOutput, VovkIteration } from 'vovk';
import type UserController from './user-controller';
import type StreamController from './stream-controller';

type Output = VovkOutput<typeof UserController.updateUser>; // { success: boolean }
type Iteration = VovkIteration<typeof StreamController.streamItems>; // { item: boolean }
```

## Return/Yield Inference

`VovkReturnType<T>` and `VovkYieldType<T>` infer the actual return or yield type of methods when input is not validated. These types cannot be used for self-references in services, as they cause “implicit any” TypeScript errors.

```ts showLineNumbers copy
export default class UserController {
  @get()
  static updateUser = () => {
    return { success: true };
  };
}
```

```ts showLineNumbers copy
export default class StreamController {
  @get()
  static async *streamItems() {
    yield { item: true };
    yield { item: true };
  }
}
```

```ts showLineNumbers copy
import type { VovkReturnType, VovkYieldType } from 'vovk';
import { UserRPC, StreamRPC } from '@/client';

type Return = VovkReturnType<typeof UserRPC.updateUser>; // { success: boolean }
type Yield = VovkYieldType<typeof StreamRPC.streamItems>; // { item: boolean }
```

```ts showLineNumbers copy
import type { VovkReturnType, VovkYieldType } from 'vovk';
import type UserController from './user-controller';
import type StreamController from './stream-controller';

type Return = VovkReturnType<typeof UserController.updateUser>; // { success: boolean }
type Yield = VovkYieldType<typeof StreamController.streamItems>; // { item: boolean }
```

---

Page: https://vovk.dev/openapi

# OpenAPI Specification and `@operation` Decorator

Vovk.ts generates an OpenAPI specification from the procedures that have an operation object, using validation models to populate it with `parameters`, `requestBody`, and `responses`. The `@operation` decorator gives a procedure its operation object and enriches it with metadata such as `summary`, `description`, `tags`, and more; `@operation.tool` and `@operation.error` give it one too. A procedure without any of them is left out of the specification, and [deriveTools](https://vovk.dev/tools) makes no tool of it either. The decorator accepts `OperationObject` type from [openapi3-ts/oas31](https://www.npmjs.com/package/openapi3-ts), enhanced with Vovk-specific `x-tool` property related to [deriveTools](https://vovk.dev/tools) function.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { procedure, put, prefix, operation } from 'vovk';
import { z } from 'zod';

@prefix('users')
export default class UserController {
  @operation({
    summary: 'Update User',
    description: 'Update user information',
  })
  @put('{id}')
  static updateUser = procedure({
    // ...
  });
}
```

The validation models, accepted by the [procedure](https://vovk.dev/procedure) are converted to OpenAPI operation objects according to the following mapping:

- `params` → `parameters` with `in: "path"`, each one required; a `{name}` of the path that no `params` model describes is a string parameter
- `query` → `parameters` with `in: "query"`; an object parameter gets `style: "deepObject"`, as the server reads `filter[status]=sold`. An array parameter keeps the default style, `form` (`tags=a&tags=b`), and the server reads a lone `tags=a` as a one-item array. OpenAPI has no style for an array of objects: the server reads `items[0][a]=x`, the form vovk clients send
- `body` → `requestBody` with the `application/json` (or custom `contentType`) content type
- `output` → `responses` with status `200` and `application/json` content type
- `iteration` → `responses` with status `200` and `application/jsonl` content type, with an example of three lines; the server sends `text/plain` unless the `Accept` header includes `application/jsonl`

A schema with an id, such as a Zod schema with `.meta({ id })`, goes to `components.schemas`. A name OpenAPI doesn't allow has its other characters replaced with `_` (`User Profile` becomes `User_Profile`), and a schema whose name another schema took, one of `openAPIObject.components` included, gets the RPC module, procedure and slot names in front: `UserRPCCreateUserBodyUser`.

## Configuring the OpenAPI Specification

The OpenAPI specification can be configured in the [vovk.config](https://vovk.dev/config) file under the [`outputConfig.openAPIObject` option](https://vovk.dev/config#openapiobject). This object is merged with the generated specification, allowing you to set global properties such as `info`, `servers`, and more.

```ts showLineNumbers copy filename="vovk.config.js"
// @ts-check

/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    openAPIObject: {
      info: {
        title: 'My app API',
        description: 'API for My App hosted at https://myapp.example.com/.',
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
        version: '1.0.0',
      },
      servers: [
        {
          url: 'https://myapp.example.com',
          description: 'Production',
        },
        {
          url: 'http://localhost:3000',
          description: 'Localhost',
        },
      ],
    },
  },
};

module.exports = config;
```

The `openAPIObject` can also be configured individually for each [segment](https://vovk.dev/segment) using `outputConfig.segments.[segmentName].openAPIObject`.

```ts showLineNumbers copy filename="vovk.config.js"
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    segments: {
      admin: {
        openAPIObject: {
          info: {
            title: 'Admin API',
            description: 'API for Admin segment.',
            version: '1.0.0',
          },
        },
      },
    },
  },
};
```

## Utilizing the OpenAPI Specification

The generated RPC client exports an `openapi` object from `openapi` module that contains the full back-end specification for the [composed client](https://vovk.dev/composed). When using the [segmented client](https://vovk.dev/segmented), each [segment](https://vovk.dev/segment) also exports its own specification.

```ts showLineNumbers copy
import { openapi } from '@/client/openapi'; // composed client
```

```ts showLineNumbers copy
import { openapi } from '@/client/admin/openapi'; // segmented client
```

You can use the specification directly as a variable or expose it via a static segment with a simple controller that serves it as a JSON endpoint.

```ts showLineNumbers copy filename="src/modules/static/openapi/openapi-controller.ts"
import { get, operation } from 'vovk';
import { openapi } from '@/client/openapi';

export default class OpenApiController {
  @get('openapi.json')
  static getSpec = () => openapi;
}
```

If you prefer to skip Vovk entirely for the spec endpoint, a plain Next.js route handler works just as well. This avoids registering a controller and keeps the docs route outside the generated schema:

```ts showLineNumbers copy filename="src/app/openapi.json/route.ts"
import { openapi } from '@/client/openapi';

export const GET = () => Response.json(openapi);
```

You can also emit `openapi.json` as a standalone file with the [openapiJson](https://vovk.dev/templates#openapijson) template, without generating a client. Useful for serving the spec as a static asset or handing it to another tool:

```sh npm2yarn copy
npm exec -- vovk generate --from openapiJson --out ./public
```

On the client side, you can use any OpenAPI documentation generator. [Scalar](https://www.npmjs.com/package/@scalar/api-reference-react) is a recommended choice as Vovk.ts generates code snippets for the generated RPC modules.

```ts showLineNumbers copy
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

async function App() {
  return (
    <ApiReferenceReact
      configuration={{
        url: "/api/static/openapi.json"
      }}
    />
  );
}

export default App;
```

![](https://vovk.dev/screenshots/scalar-screenshot-light.png)
![](https://vovk.dev/screenshots/scalar-screenshot-dark.png)

For a live demonstration, see the ["Hello World" application spec](https://hello-world.vovk.dev/openapi). Check ["Hello World"](https://vovk.dev/hello-world) page for details.

---

The `@operation` decorator also provides `tool` property that defines tool-specific attributes for [deriveTools](https://vovk.dev/tools) function. It's set under `x-tool` key in the OpenAPI operation object.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { procedure, put, operation } from 'vovk';

export default class UserController {
  @operation.tool({
    name: 'update_user',
    description: 'Update user information in the system',
  })
  @operation({
    summary: 'Update User',
    description: 'Update user information',
  })
  @put('{id}')
  static updateUser = procedure({
    // ...
  });
}
```

For more details, see the [deriveTools](https://vovk.dev/tools) documentation.

---

Page: https://vovk.dev/tools

# Deriving AI Tools from Controllers and RPC Modules

Controllers as well as generated RPC/API modules can be converted into AI tools for LLM function calling, using `deriveTools` utility. This makes your back-end functionality accessible to AI models (including MCP clients) with minimum code. The function accepts `modules` record with 

- Controllers for same-context execution to be used on back-end.
- RPC modules generated from controllers for HTTP calls or be used on front-end or other environments that support `fetch`.
- Third-party OpenAPI-based modules (called [OpenAPI mixins](https://vovk.dev/mixins) in this documentation), enabling to combine back-end functionality with external APIs in a single agent.

A tool comes from a [procedure](https://vovk.dev/procedure) or an RPC method that has an operation object, given by [`@operation`](https://vovk.dev/openapi), `@operation.tool` or `@operation.error`. Every [OpenAPI mixin](https://vovk.dev/mixins) method has one. Other members of a module are left out.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { deriveTools } from 'vovk';
import { TaskRPC, PetstoreAPI } from '@/client';
import UserController from '@/modules/user/user-controller';

const tools = deriveTools({
  modules: {
    UserController,
    TaskRPC,
    PetstoreAPI,
  },
});

console.log('Derived tools:', tools); // [{ name, description, inputSchema, execute, ... }, ...]
```

The function returns an array of tools. Each tool satisfies the `StandardToolV0` interface from the [standard-tool](https://standard-tool.js.org/) convention:

- `name: string{:ts}` - the name of the tool, derived from the module and method names as `${moduleName}_${handlerName}` (can be overridden with `x-tool.name`, see below). As model APIs require, a character other than `A-Z`, `a-z`, `0-9`, `_` and `-` becomes `_`, and a name longer than 64 characters is cut to 64, ending with a hash of the whole name. Two tools with the same name make `deriveTools` throw.
- `title?: string{:ts}` - optional title for the tool. Used mainly for MCPs, derived from OpenAPI `summary` or `x-tool.title` if available.
- `description: string{:ts}` - the description of the tool, derived concatenating `summary` and `description` from OpenAPI operation (can be overridden with `x-tool.description`, see below).
- `inputSchema?: StandardSchemaV1 & StandardJSONSchemaV1{:ts}` - a single merged Standard Schema of the procedure's `body`, `query`, and `params`, when available.
- `outputSchema?: StandardSchemaV1 & StandardJSONSchemaV1{:ts}` - equals to the procedure's `output` schema, when available.
- `meta?: Record<string, unknown>{:ts}` - static data about the tool, copied as is from `x-tool.meta` (see below). It's read by the code that consumes the tools and never sent to the LLM.
- `execute: (input: { body?, query?, params? }) => Promise{:ts}` - the function to execute the tool logic. For RPC modules, it performs an HTTP request; for controllers, it calls the `fn` method to execute in the current context without HTTP. A [JSON Lines](https://vovk.dev/jsonlines) result, from a generator or a `JSONLinesResponder`, reaches the model as the array of its items.

> `inputSchema` validates the `{ body, query, params }` envelope itself and delegates slot values to your original library schemas (Zod, Valibot, ArkType). For RPC modules and OpenAPI mixins it's reconstructed from the generated JSON Schemas, so only the envelope is checked and the values are validated during execution.

## `deriveTools` Options

The `deriveTools` function accepts an options object with the following properties:

- `modules: Record<string, object>{:ts}` - a record of modules (RPC/API modules or controllers) to derive tools from.
- `onExecute?: (result: unknown, tool: StandardToolV0) => void{:ts}` - optional callback invoked when a tool's `execute` function completes successfully.
- `onError?: (error: Error, tool: StandardToolV0) => void{:ts}` - optional callback invoked when a tool's `execute` function throws an error, or when a controller returns a `Response` with an error status. The error for a `Response` is an `HttpException` with its status and the message from the body: the `message`, `detail` or `title` of a JSON body, else its text. `ToModelOutput.DEFAULT` gives the model `{ error: message }{:ts}` for both.
- `toModelOutput?: ToModelOutputFn<TInput, TOutput, TFormattedOutput>{:ts}` - optional function to format the output returned to the LLM. Can be set to a custom function or one of the built-in formatters, defined in `ToModelOutput` object, exported from `vovk`, such as 
  - `ToModelOutput.MCP` for MCP formatting.
  - `ToModelOutput.DEFAULT` that's used by default when `toModelOutput` is not provided.
- `meta?: Record<string, unknown>{:ts}` - optional metadata passed to each controller/RPC method. The meta can be read on the back end using [req.vovk.meta](https://vovk.dev/req-vovk#meta). When passed to a controller procedure, it's merged with procedure-level meta normally. When passed to an RPC method, it's available as `xMetaHeader` key. [OpenAPI mixins](https://vovk.dev/mixins) don't get it, as their hosts are third parties.

## Custom Operation Attributes with `x-tool` or `@operation.tool` Decorator

By default, tool description is derived from OpenAPI `summary` and `description` fields and the tool name is generated in the form of `${moduleName}_${handlerName}`. You can override these values and add tool-specific attributes using `x-tool` custom attributes in the `@operation` decorator.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { z } from 'zod';
import { prefix, get, operation, procedure } from 'vovk';

@prefix('user')
export default class UserController {
  @operation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique ID.',
    'x-tool': {
      // tool-specific attributes
    }
  })
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.string() }),
  }).handle(async (req, { id }) => {
    // ...
  });
}
```

`@operation` also provides `tool` property that defines tool-specific attributes for `deriveTools` function. It's set under `x-tool` key in the OpenAPI operation object and created for cleaner syntax.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { z } from 'zod';
import { prefix, get, operation, procedure } from 'vovk';

@prefix('user')
export default class UserController {
  @operation.tool({
    title: 'Get user by ID',
    name: 'get_user_by_id',
    description: 'Retrieves a user by their unique ID, including name and email.',
  })
  @operation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique ID.',
  })
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.string() }),
  }).handle(async (req, { id }) => {
    // ...
  });
}
```

The tool attributes available under `x-tool` are:

- `hidden?: boolean` - if set to `true`, the tool is excluded from the derived tools.
- `name?: string` - overrides the generated tool name.
- `title?: string` - optional title for the tool. Used mainly for MCPs.
- `description?: string` - overrides the generated tool description.
- `meta?: Record<string, unknown>` - static data that lands on the derived tool as its `meta` field. Don't confuse it with the `meta` option of `deriveTools`, which is runtime metadata passed to the procedure instead.

## Tips 

### Selecting Specific Procedures

To include only certain procedures from a module (besides using `hidden` attribute), use the `pick`/`omit` pattern from `lodash` or a similar utility.

```ts showLineNumbers copy
import { deriveTools } from 'vovk';
import { PostRPC } from '@/client';
import { pick, omit } from 'lodash';
import UserController from '../user/user-controller';

const tools = deriveTools({
  modules: {
    PostRPC: pick(PostRPC, ['createPost', 'getPost']),
    UserController: omit(UserController, ['deleteUser']),
  },
});
```

The resulting `tools` include `createPost` and `getPost` from `PostRPC`, and all methods from `UserController` except `deleteUser`.

### Authorizing API Calls

Third-party API calls may require authorization headers that can be passed by using `withDefaults` function, available for all [generated RPC/API modules](https://vovk.dev/typescript). Having `GithubIssuesAPI` module, described in [OpenAPI mixins](https://vovk.dev/mixins), you can create authorized tools for Github Issues API:

```ts showLineNumbers copy

import { deriveTools } from 'vovk';
import { GithubIssuesAPI } from '@/client';

const tools = deriveTools({
  modules: {
    AuthorizedGithubIssuesAPI: GithubIssuesAPI.withDefaults({
      init: {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28'
        },
      },
    }),
  },
});
```

## Standalone Tools

The `createTool` utility was removed in v4. Since derived tools follow the standard-tool convention, standalone tools that don't map to back-end functionality can be created with the [standard-tool](https://www.npmjs.com/package/standard-tool) package (or written as plain objects of the same shape) and mixed freely with derived tools:

```ts showLineNumbers copy
import { standardTool } from 'standard-tool';
import { z } from 'zod';

const sumNumbers = standardTool({
  name: 'sum_numbers',
  description: 'Returns the sum of two numbers provided as input.',
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  outputSchema: z.number(),
  execute({ a, b }) {
    return a + b;
  },
});

const tools = deriveTools({ modules: { UserController } });
const allTools = [...tools, sumNumbers];
```

## Vercel AI SDK Example

That's an example of Vercel AI SDK chat that uses `UserController` to derive tools. [View live example on examples.vovk.dev »](https://examples.vovk.dev/ai-sdk)

First, create an empty controller. The command will also update the root `route.ts` file.

```sh npm2yarn copy
npm exec -- vovk new controller aiSdk --empty
```

Paste the following into the newly created `src/modules/ai-sdk/ai-sdk-controller.ts`, adjusting imports as needed:

```ts showLineNumbers copy filename="src/modules/ai-sdk/ai-sdk-controller.ts" {24-26, 28-37}
import {
  deriveTools,
  post,
  prefix,
  type VovkRequest,
} from 'vovk';
import {
  streamText,
  tool,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import UserController from '@/modules/user/user-controller';

@prefix('ai-sdk')
export default class AiSdkController {
  @post('tools')
  static async functionCalling(req: VovkRequest<{ messages: UIMessage[] }>) {
    const { messages } = await req.json();
    const llmTools = deriveTools({
      modules: { UserController },
    });

    const tools = Object.fromEntries(
      llmTools.map(({ name, execute, description, inputSchema }) => [
        name,
        tool({
          execute: (input) => execute(input),
          description,
          inputSchema: inputSchema ?? z.object({}),
        }),
      ])
    );

    const result = streamText({
      model: openai('gpt-5-nano'),
      instructions: 'You are a helpful assistant',
      messages: await convertToModelMessages(messages),
      tools,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream, tools }),
    });
  }
}
```

Here, the tool's `inputSchema` is passed to Vercel AI SDK as is: the SDK supports Standard Schema and Standard JSON Schema natively, using it for both argument validation and JSON Schema conversion. A procedure without input has no `inputSchema`, and the SDK requires one, so the example passes an empty object schema instead. For other libraries, you can map the tools differently.

On the client-side, create a component using the [useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) hook:

```tsx showLineNumbers copy filename="src/app/page.tsx"
'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai-sdk/tools',
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'assistant' ? '🤖' : '👤'}{' '}
          {message.parts.map((part, partIndex) => (
            <span key={partIndex}>{part.type === 'text' ? part.text : ''}</span>
          ))}
        </div>
      ))}
      {error && <div>❌ {error.message}</div>}
      <div className="input-group">
        <input type="text" placeholder="Send a message..." value={input} onChange={(e) => setInput(e.target.value)} />
        <button>Send</button>
      </div>
    </form>
  );
}
```

---

See [Realtime Kanban / Text AI Chat](https://vovk.dev/realtime-ui/text-ai) for more info.

## Roadmap

- ✨ Add a `router` option to `deriveTools` to support hundreds of functions without hitting LLM tools limits. Routing can be implemented using vector search or other approaches.

---

Page: https://vovk.dev/tools-mcp

# MCP (Model Context Protocol) Output Formatting

[Derived tools](https://vovk.dev/tools) can be used as MCP tools with `ToModelOutput.MCP` formatter. It formats the tool output to meet [MCP tool specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools), supporting the following types of outputs: `text`, `image`, `audio`, alongside with meta information, described with `annotations` object.

```ts
const tools = deriveTools({
  modules: { UserController },
  toModelOutput: ToModelOutput.MCP,
});
```

## JSON Content

JSON responses (including ones created with `Response` or `NextResponse`, and `+json` types such as `application/problem+json`) will be formatted as text content with `structuredContent` field. A `Response` with an error status is reported with `isError: true` and no `structuredContent`. A thrown error is reported the same way; in production only an `HttpException{:ts}` keeps its message, and any other error reads "Internal server error".

```ts showLineNumbers copy
export default class UserController {
  @operation({ summary: 'Get user' })
  @get('{id}')
  static getUser = procedure().handle(async (req, { id }) => {
    return { hello: 'world' };
  });
}
```

When the tool is executed with `ToModelOutput.MCP` formatter, the output will be:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"hello\":\"world\"}"
    }
  ],
  "structuredContent": { "hello": "world" }
}
```

## Audio and Image Content

If procedure returns a `Response` with `Content-Type` header set to `audio/*` or `image/*`, the output will be formatted accordingly. Its `data` field holds the body in base64.

```ts showLineNumbers copy
export default class MediaController {
  @operation({ summary: 'Get image' })
  @get('image')
  static getImage = procedure().handle(() => {
    return new Response(buffer, {
      headers: { 'Content-Type': 'image/png' },
    });
  });
}
```

When the tool is executed with `ToModelOutput.MCP` formatter, the output will be:

```json
{
  "content": [
    {
      "type": "image",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ]
}
```

The response can be created with [`toDownloadResponse`](https://vovk.dev/response#downloads) utility, or using `fetch` to get media from an external source.

```ts showLineNumbers copy
import { toDownloadResponse } from 'vovk';

export default class MediaController {
  @operation({ summary: 'Get audio' })
  @get('audio')
  static getAudio = procedure().handle(() => {
    return toDownloadResponse(buffer, { type: 'audio/mpeg' });
  });
}
```

```ts showLineNumbers copy
export default class MediaController {
  @operation({ summary: 'Get audio from a URL' })
  @get('from-url')
  static getAudioFromURL = procedure().handle(() => {
    return fetch('https://example.com/audio.mp3');
  });
}
```

## Text Content

If procedure returns a `Response` with `Content-Type` header set to `text/*` or other text-based types, such as XML, the output will be formatted as text content.

```ts showLineNumbers copy
export default class TextController {
  @operation({ summary: 'Get greeting' })
  @get('greeting')
  static getGreeting = procedure().handle(() => {
    return new Response('Hello, world!', {
      headers: { 'Content-Type': 'text/plain' },
    });
  });
}
```

When the tool is executed with `ToModelOutput.MCP` formatter, the output will be:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Hello, world!"
    }
  ]
}
```

## `annotations`

Annotations can be added to the output by setting a special metadata key `mcpOutput` using [req.vovk.meta](https://vovk.dev/req-vovk#meta) function. This approach makes sure that if the procedure used as an endpoint, the response will not be affected. MCP takes a `priority` from 0 (least important) to 1 (most important).

```ts showLineNumbers copy
export default class AnnotatedController {
  @operation({ summary: 'Get annotated image' })
  @get('annotated-image')
  static getAnnotatedImage = procedure().handle((req) => {
    req.vovk.meta({
      mcpOutput: { annotations: { audience: ['user'], priority: 0.8 } },
    });
    return fetch('https://example.com/image.jpg');
  });
}
```

When the tool is executed with `ToModelOutput.MCP` formatter, each content item will include the `annotations` object, as MCP annotates content items:

```json
{
  "content": [
    {
      "type": "image",
      "data": "/9j/4AAQSkZJRgABAQAAAQABAAD...",
      "mimeType": "image/jpeg",
      "annotations": {
        "audience": ["user"],
        "priority": 0.8
      }
    }
  ]
}
```

Note that `mcpOutput` metadata key can also override other MCP output properties, including `content` and `structuredContent`; its `annotations` go on each content item. This might be useful if you want to customize the MCP output without changing the actual procedure response.

## MCP Handler Example

With [mcp-handler](https://www.npmjs.com/package/mcp-handler) package, you can create an MCP-compatible API route that is going to control the back-end functionality exposed to MCP clients.

By writing this documentation, **mcp-handler** supports Zod schemas only. The tool's merged `inputSchema` is a single Standard Schema, so we convert its JSON Schema back to a Zod object with [`z.fromJSONSchema()`](https://zod.dev/json-schema?id=zfromjsonschema) and pass its `.shape` — the `body`/`query`/`params` slots — to `registerTool`.

```ts showLineNumbers copy filename="src/app/api/mcp/route.ts"
import { createMcpHandler } from "mcp-handler";
import { deriveTools, ToModelOutput } from "vovk";
import z from "zod";
import UserController from "@/modules/user/user-controller";

const tools = deriveTools({
  modules: { UserController },
  toModelOutput: ToModelOutput.MCP,
});

const handler = createMcpHandler(
  (server) => {
    tools.forEach(({ title, name, execute, description, inputSchema }) => {
      // `inputSchema` is a single merged Standard Schema; mcp-handler wants a Zod
      // raw shape, so convert its JSON Schema back to Zod and take the object shape.
      const shape = inputSchema
        ? (z.fromJSONSchema(inputSchema["~standard"].jsonSchema.input({ target: "draft-2020-12" })) as z.ZodObject).shape
        : {};
      server.registerTool(name, { title, description, inputSchema: shape }, execute);
    });
  },
);

export { handler as GET, handler as POST };
```

## Standalone Tools with `withFormattedOutput`

`ToModelOutput.MCP` is compatible with the `withFormattedOutput` helper from the [standard-tool](https://www.npmjs.com/package/standard-tool) package: both operate on a result-or-`Error` value. Wrap a [standalone tool](https://vovk.dev/tools#standalone-tools) with it, passing `null` as the request argument, and its `execute` produces the same MCP output shape as derived tools, so it can be registered on the same MCP server:

```ts showLineNumbers copy
import { standardTool, withFormattedOutput } from 'standard-tool';
import { ToModelOutput } from 'vovk';
import { z } from 'zod';

const sumNumbers = standardTool({
  name: 'sum_numbers',
  description: 'Returns the sum of two numbers provided as input.',
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  outputSchema: z.number(),
  execute({ a, b }) {
    return a + b;
  },
});

const sumNumbersMCP = withFormattedOutput(sumNumbers, (result) =>
  ToModelOutput.MCP(result, sumNumbers, null)
);
```

---

See [Realtime Kanban / MCP](https://vovk.dev/realtime-ui/mcp) for more info.

---

Page: https://vovk.dev/decorator-overview

# Decorators Overview

Vovk.ts uses decorators to attach metadata and behavior to controller methods. This page gives a comprehensive overview of all built-in decorators, the `decorate` alternative, and guidance on when to use each approach.

## HTTP Method Decorators

HTTP method decorators define the HTTP method and path for a procedure. They are the only **required** decorator for a procedure to be reachable via HTTP.

| Decorator | HTTP Method |
|-----------|-------------|
| `@get()` | GET |
| `@post()` | POST |
| `@put()` | PUT |
| `@patch()` | PATCH |
| `@del()` | DELETE |
| `@head()` | HEAD |
| `@options()` | OPTIONS |

Each accepts an optional path and options object:

```ts showLineNumbers copy
import { get, prefix } from 'vovk';

@prefix('users')
export default class UserController {
  @get('{id}', { cors: true, headers: { 'x-custom': 'value' } })
  static getUser(req, { id }: { id: string }) {
    return { id };
  }
}
```

**Options:**

- `cors?: boolean` — adds CORS headers and handles OPTIONS automatically, for the methods of that path that set it.
- `headers?: Record<string, string>` — custom response headers. See [Response Headers](https://vovk.dev/response#headers) for dynamic headers.
- `staticParams?: Record<string, string>[]` — (`@get` only) static params for `generateStaticParams()`. See [Static Segment](https://vovk.dev/static-segment) for details.

### Auto-Generated Paths

Every HTTP decorator provides an `.auto()` method that derives the path from the method name in kebab-case:

```ts showLineNumbers copy
export default class UserController {
  // creates GET /api/get-all-users
  @get.auto()
  static getAllUsers() {
    return [];
  }
}
```

## Class Decorators

### `@prefix`

Prepends a sub-path to all endpoints in a controller:

```ts showLineNumbers copy
import { prefix, get } from 'vovk';

@prefix('users')
export default class UserController {
  @get('{id}') // => GET /api/users/{id}
  static getUser() { /* ... */ }
}
```

### `@operation`

Attaches [OpenAPI](https://vovk.dev/openapi) metadata to a procedure:

```ts showLineNumbers copy
import { operation, get } from 'vovk';

export default class UserController {
  @operation({ summary: 'Get user by ID', description: 'Returns a single user' })
  @get('{id}')
  static getUser() { /* ... */ }
}
```

Also provides `@operation.error()` for documenting error responses and `@operation.tool()` for [AI tool](https://vovk.dev/tools) metadata.

### `@cloneControllerMetadata`

Copies all metadata from a parent controller to a child class, useful for reusing a controller in multiple [segments](https://vovk.dev/segment):

```ts showLineNumbers copy
import { prefix, cloneControllerMetadata } from 'vovk';
import UserController from './user-controller';

@cloneControllerMetadata()
@prefix('v2')
export default class UserControllerV2 extends UserController {}
```

## Custom Decorators

Use `createDecorator` to build custom middleware-style decorators for cross-cutting concerns like authentication, logging, or caching. See the [Custom Decorators](https://vovk.dev/decorator) page for full API documentation and the [Decorator Examples](https://vovk.dev/decorator-examples) page for practical patterns.

```ts showLineNumbers copy
import { createDecorator, get, HttpException, HttpStatus, type VovkRequest } from 'vovk';

const authGuard = createDecorator(async (req: VovkRequest, next) => {
  const token = req.headers.get('authorization');
  if (!token) throw new HttpException(HttpStatus.UNAUTHORIZED, 'Missing token');
  req.vovk.meta({ userId: await verifyToken(token) });
  return next();
});

export default class UserController {
  @get('{id}')
  @authGuard()
  static getUser(req: VovkRequest) {
    const { userId } = req.vovk.meta();
    // ...
  }
}
```

## `decorate` Function

The `decorate` function provides an alternative to the stacked decorator syntax. Instead of using `@decorator` annotations, you pass decorator results to `decorate` (which returns `{ handle }`). The controller prefix is defined via `static prefix`. This is useful when you want to avoid decorators entirely or need more flexibility in how procedures are defined.

```ts showLineNumbers copy
import { decorate, get, post, operation, HttpStatus, procedure } from 'vovk';
import { z } from 'zod';

class UserController {
  static prefix = 'users';

  static updateUser = decorate(
    post('{id}'),
    operation({
      summary: 'Update user',
      description: 'Updates a user by ID',
    }),
    operation.error(HttpStatus.BAD_REQUEST, 'Invalid input'),
    procedure({
      params: z.object({ id: z.string() }),
      body: z.object({ email: z.email() }),
      query: z.object({ notify: z.enum(['email', 'push', 'none']) }),
    }),
  ).handle(async (req, { id }) => {
    const body = await req.vovk.body();
    const { notify } = req.vovk.query();
    return { id, ...body, notify };
  });
}

export default UserController;
```

All arguments to `decorate` are decorator results; `decorate` returns an object with a `.handle()` method that accepts the handler (or a `procedure` can be included as one of the arguments). The prefix is set as a `static prefix` property on the class — equivalent to using the `@prefix()` decorator.

### With Custom Decorators

Custom decorators created with `createDecorator` work with `decorate` as well:

```ts showLineNumbers copy
static getUser = decorate(
  get('{id}'),
  authGuard(),
).handle(async (req: VovkRequest) => {
  const { userId } = req.vovk.meta();
  // ...
});
```

### Without Validation

For handlers that don't need validation, pass a plain function to `.handle()`:

```ts showLineNumbers copy
static listUsers = decorate(
  get(),
).handle(
  async () => {
    return [];
  }
);
```

## Decorator Syntax vs `decorate`

Both approaches produce identical results in terms of functionality, types, and generated RPC modules. Choose based on your preference and project conventions.

### When to Use Decorators

- You're already using TypeScript decorators in your project.
- You prefer the visual separation of concerns that stacked decorators provide.
- You want the most concise syntax for simple procedures.

```ts showLineNumbers copy
@operation({ summary: 'Get user' })
@get('{id}')
@authGuard()
static getUser = procedure({
  params: z.object({ id: z.string() }),
}).handle(async (req, { id }) => {
  return { id };
});
```

### When to Use `decorate`

- You want to avoid decorators (`experimentalDecorators` or TC39 Stage 3).
- You prefer a functional composition style.
- You want all metadata for a procedure in one expression.

```ts showLineNumbers copy
class UserController {
  static prefix = 'users';

  static getUser = decorate(
    get('{id}'),
    authGuard(),
    operation({ summary: 'Get user' }),
    procedure({
      params: z.object({ id: z.string() }),
    }),
  ).handle(async (req, { id }) => {
    return { id };
  });
}

export default UserController;
```

### Mixing Both

You can mix decorator and `decorate` syntax within the same controller:

```ts showLineNumbers copy
@prefix('users')
export default class UserController {
  // Decorator syntax
  @get()
  static listUsers = procedure().handle(async () => []);

  // decorate syntax
  static getUser = decorate(
    get('{id}'),
    procedure({
      params: z.object({ id: z.string() }),
    }),
  ).handle(async (req, { id }) => ({ id }));
}
```

---

Page: https://vovk.dev/decorator

# Decorators

Decorators extend the functionality of procedures. Use them to implement cross‑cutting concerns such as logging, caching, validation, and authorization. They can also attach custom metadata to the handler for purposes like identifying authorized users.

`createDecorator` is a higher‑order function that produces a decorator factory (a function that returns a decorator) for controller class methods. It accepts a middleware function with the following parameters:

- `request`, which extends `VovkRequest`. It provides [req.vovk.meta](https://vovk.dev/req-vovk#meta) to get and set metadata for sharing data between decorators and the route handler.
- `next`, a function you call (and return) to invoke subsequent decorators or the route handler.
- Additional arguments passed through the decorator factory.

The second argument to `createDecorator` is an optional init handler. It runs each time the decorator is initialized and can populate **.vovk-schema/\*.json** with validation or custom data. It may return an object with optional keys `"validation"`, `"operationObject"`, and `"misc"` (for custom metadata) to merge into the handler schema, or a function returning that object and receiving the existing handler schema for proper merging.

```ts showLineNumbers copy
import { createDecorator, get, HttpException, HttpStatus } from 'vovk';

export interface ReqMeta {
  foo: string;
  a: string;
  b: number;
}

const myDecorator = createDecorator(
  (req, next, a: string, b: number) => {
    console.log(a, b); // Outputs: "baz", 1

    req.vovk.meta<ReqMeta>({ foo: 'bar', a, b }); // Add metadata to the request object

    if (isSomething) {
      // override route method behavior and return { hello: 'world' } from the endpoint
      return { hello: 'world' };
    }

    if (isSomethingElse) {
      // throw HTTP error if needed
      throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong');
    }

    // Continue to the next decorator or the route handler
    return next();
  },
  (a: string, b: number) => {
    console.info('Decorator is initialized with', a, b);
    return {
      validation: {
        /* ... */
      },
      misc: { a, b }, // adds `a` and `b` to the handler schema
    };
  }
);

export default class MyController {
  @get.auto()
  @myDecorator('baz', 1) // Passes 'baz' as 'a' and 1 as 'b'
  static doSomething(req) {
    const meta = req.vovk.meta<ReqMeta>();
    console.log(meta); // { foo: 'bar', a: 'baz', b: 1 }
    // ...
  }
}
```

---

Page: https://vovk.dev/decorator-examples

# Decorator Examples

## `console.log` Decorator

A simple logging decorator that logs the request method and URL before proceeding to the next decorator or route handler.

```ts showLineNumbers copy filename="src/decorators/log.ts"
import { createDecorator } from 'vovk';

const log = createDecorator((req, next, message?: string) => {
  console.log(`${message ?? 'Incoming request'}: ${req.method} ${req.url}`);
  return next();
});

export default log;
```

Import the `log` decorator and apply it to a procedure after the `@get`, `@post`, etc., decorators.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { get, prefix } from 'vovk';
import log from '../decorators/log';

@prefix('users')
export default class UserController {
  @get('info')
  @log('Fetching user info')
  static async getUserInfo() {
    // ...
  }
}
```

## Basic Authorization Decorator

Basic authentication is a simple HTTP protocol for user authentication where credentials (username and password) are sent in the Authorization header of a request after being encoded in Base64. While not the most secure method, it can be useful for legacy cross-service communication.

```ts showLineNumbers copy filename="src/decorators/basic-auth-guard.ts"
import { HttpException, HttpStatus, createDecorator } from 'vovk';

const basicAuthGuard = createDecorator((req, next) => {
  const authorisation = req.headers.get('authorization');

  if (!authorisation) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'No authorisation header');
  }

  const token = authorisation.split(' ')[1];

  if (!token) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'No token provided');
  }

  let login, password;

  try {
    [login, password] = Buffer.from(token, 'base64').toString().split(':');
  } catch (error) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unable to parse token. ' + String(error));
  }

  if (login !== process.env.BASIC_AUTH_LOGIN || password !== process.env.BASIC_AUTH_PASSWORD) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid login or password');
  }
  return next();
});

export default basicAuthGuard;
```

Import the `basicAuthGuard` decorator and apply it to procedures after the `@get`, `@post`, etc., decorators.

```ts showLineNumbers copy filename="src/modules/secure/secure-controller.ts"
import { get, prefix } from 'vovk';
import basicAuthGuard from '../decorators/basic-auth-guard';

@prefix('secure')
export default class SecureController {
  @get('data')
  @basicAuthGuard()
  static async getSecureData() {
    // ...
  }
}
```

## RBAC Decorator

> Role-based access control (RBAC) is a method of restricting system access for users based on their role within an organization, rather than assigning permissions individually.

The `authGuard` decorator below:

- Verifies the user is authorized; otherwise returns an `Unauthorized` status.
- Adds `currentUser` to request metadata, represented by the `AuthMeta` TypeScript interface.
- Implements role-based access control with the `Permission` enum.

The `identifyUserAndCheckPermissions` function is a placeholder for your logic to identify the user from the request (e.g., from a JWT token or session) and check whether they have the required permission.

```ts showLineNumbers copy filename="src/decorators/auth-guard.ts"
import { createDecorator, HttpException, HttpStatus, type VovkRequest } from 'vovk';
import type { User } from '@/types';

export enum Permission {
  CAN_DO_THIS = 'CAN_DO_THIS',
  CAN_DO_THAT = 'CAN_DO_THAT',
}

// Metadata interface allows access to currentUser in the controller
export interface AuthMeta {
  currentUser: User;
}

// Identify the user, check permissions, and update request metadata
const checkAuth = async (req: VovkRequest, permission: Permission) => {
  const currentUser = identifyUserAndCheckPermissions(req, permission);

  if (!currentUser) {
    return false;
  }

  // Add currentUser to the request metadata
  req.vovk.meta<AuthMeta>({ currentUser });

  return true;
};

// Create the decorator
const authGuard = createDecorator(async (req, next, permission: Permission) => {
  const isAuthorized = await checkAuth(req, permission);

  if (!isAuthorized) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  // The user is authorized and metadata is set; proceed to the next decorator or controller handler
  return next();
});

export default authGuard;
```

Import the `authGuard` decorator and related members, then apply it to procedures after the `@get`, `@post`, etc., decorators.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { get, prefix } from 'vovk';
import authGuard, { Permission, type AuthMeta } from '../decorators/auth-guard';

@prefix('users')
export default class UserController {
  // ...
  @get('something')
  @authGuard(Permission.CAN_DO_THIS)
  static async getSomething(req: VovkRequest) {
    const { currentUser } = req.vovk.meta<AuthMeta>();
    // ...
  }

  // ...
}
```

## Vercel Cron Jobs Authorization Decorator

[Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) require simple authorization via an environment variable. You can implement this by creating a decorator that checks the `Authorization` header against a secret.

```ts showLineNumbers copy filename="src/decorators/cron-guard.ts"
import { HttpException, HttpStatus, createDecorator } from 'vovk';

const cronGuard = createDecorator(async (req, next) => {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  return next();
});

export default cronGuard;
```

Apply the `cronGuard` decorator to the procedure that should be protected by the cron job authorization.

```ts showLineNumbers copy filename="src/modules/cron/cron-controller.ts"
import { get, prefix } from 'vovk';
import cronGuard from '../decorators/cron-guard';

@prefix('cron')
export default class CronController {
  @get('do-something')
  @cronGuard()
  static async doSomething() {
    // ...
  }
}
```

Add a cron job to `vercel.json`. The `schedule` field uses standard cron syntax (this example runs daily at midnight).

```json filename="/vercel.json"
{
  "crons": [
    {
      "path": "/api/cron/do-something",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

Page: https://vovk.dev/typescript

# TypeScript RPC Client

Controllers and its procedures implemented as static methods compile to so-called RPC modules that share the same structure but have different argument signatures. For example, given the controller below:

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { z } from 'zod';
import { procedure, prefix, post, operation } from 'vovk';

@prefix('users')
export default class UserController {
  @operation({
    summary: 'Update user (Zod)',
    description: 'Update user by ID with Zod validation',
  })
  @post('{id}')
  static updateUser = procedure({
    body: z
      .object({
        name: z.string().meta({ description: 'User full name' }),
        age: z.number().min(0).max(120).meta({ description: 'User age' }),
        email: z.email().meta({ description: 'User email' }),
      })
      .meta({ description: 'User object' }),
    params: z.object({
      id: z.uuid().meta({ description: 'User ID' }),
    }),
    query: z.object({
      notify: z.enum(['email', 'push', 'none']).meta({ description: 'Notification type' }),
    }),
    output: z
      .object({
        success: z.boolean().meta({ description: 'Success status' }),
      })
      .meta({ description: 'Response object' }),
  }).handle(async (req, { id }) => {
    const { name, age } = await req.json();
    const notify = req.nextUrl.searchParams.get('notify');

    // do something with the data
    console.log(`Updating user ${id}:`, { name, age, notify });
    return {
      success: true,
    };
  });
}
```

It compiles to the following RPC module with `updateUser` method, which accepts `body`, `params`, and `query` as a three-part input.

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const updatedUser = await UserRPC.updateUser({
  body: { name: 'John Doe', age: 30, email: 'john@example.com' },
  params: { id: '69' },
  query: { notify: 'push' },
});
```

`updateUser` performs client-side validation, serializes `query` and `params` into the URL, and issues a standard `fetch` request. The server handles it in `UserController.updateUser`. The RPC method returns a promise that resolves to the return type used in the procedure.

```ts showLineNumbers copy
const resp = await fetch(`/api/users/${id}?notify=push`, {
  method: 'POST',
  body: JSON.stringify({
    /* ... */
  }),
});

const updatedUser = await resp.json();
```

Behind the scenes the RPC module is created by an internal function `createRPC` and uses default imports or imports defined in the [vovk.config](https://vovk.dev/config) file. See [imports customization](https://vovk.dev/imports) for details.

```ts showLineNumbers copy
import type { VovkFetcher } from "vovk/fetcher";
import { createRPC } from "vovk/create-rpc";
import { schema } from "./schema";

import type { Controllers as Controllers0 } from "../../app/api/[[...vovk]]/route.ts";

// The arguments are: schema, segmentName, controllerName, fetcher and options
export const UserRPC = createRPC<
  Controllers0["UserRPC"],
  typeof import("vovk/fetcher").fetcher extends VovkFetcher<infer U> ? U : never
>(schema, "", "UserRPC", import("vovk/fetcher"), {
  validateOnClient: import("vovk-ajv"),
});
```

The generated client imports `vovk` subpaths, such as `vovk/fetcher`, and JSON files with import attributes. It compiles on TypeScript 5.3+ with `"moduleResolution"` set to `"bundler"`, the Next.js default, `"node16"` or `"nodenext"`; under `"node"`, TypeScript can't find `vovk/fetcher`.

## RPC Method Options

In addition to `body`, `params`, and `query`, every RPC method accepts a set of options. This list can be [extended via a custom `fetcher`](https://vovk.dev/imports#fetcher).

### `apiRoot`

Overrides the default API root path. The default is `/api` and can also be [configured](https://vovk.dev/config) via `rootEntry` and/or `origin`.

### `init`

Lets you pass `RequestInit` options (the `fetch` options) such as `headers` and `credentials`, as well as [Next.js-specific options](https://nextjs.org/docs/app/api-reference/functions/fetch) like `next: { revalidate: number }{:ts}`.

```ts showLineNumbers copy
const user = await UserRPC.updateUser({
  body: {
    /* ... */
  },
  params: {
    /* ... */
  },
  query: {
    /* ... */
  },
  init: {
    headers: {
      'X-Custom-Header': 'value',
    },
    credentials: 'include',
    next: { revalidate: 60 },
  },
});
```

### `transform`

Allows you to post-process the result. Provide a function that receives the parsed response data and the original `Response` and returns a transformed value.

```ts showLineNumbers copy
const user = await UserRPC.updateUser({
  body: {
    /* ... */
  },
  params: {
    /* ... */
  },
  query: {
    /* ... */
  },
  transform: (data, response) => {
    // Modify the response here
    return value;
  },
});
```

You can also return the `Response` alongside the data:

```ts showLineNumbers copy
const [user, response] = await UserRPC.updateUser({
  body: {
    /* ... */
  },
  params: {
    /* ... */
  },
  query: {
    /* ... */
  },
  transform: (data, response) => [data, response] as const,
});

response satisfies Response;
```

### `disableClientValidation`

Turns off client-side validation for this call. Useful when debugging to surface server-side validation errors instead.

```ts showLineNumbers copy
await UserRPC.updateUser({
  // ...
  disableClientValidation: true,
});
```

### `interpretAs`

Overrides how the response content type is interpreted. Useful, for example, when the server returns JSON Lines but does not set `content-type` to `application/jsonl`.

```ts showLineNumbers copy
const user = await UserRPC.updateUser({
  body: {
    /* ... */
  },
  params: {
    /* ... */
  },
  query: {
    /* ... */
  },
  interpretAs: 'application/jsonl',
});
```

### `validateOnClient`

Overrides the `validateOnClient` setting from [imports](https://vovk.dev/imports#validateonclient). It takes the function or a module that exports it, such as `import('vovk-ajv'){:ts}`.

### `fetcher`

Overrides the [fetcher](https://vovk.dev/imports#fetcher) for this call, for example one made with `createFetcher{:ts}`.

## `withDefaults`

An RPC module can be wrapped with default options using the `withDefaults` method. It returns a new RPC module with the specified deeply-merged defaults applied to every method call. Headers merge by name, case-insensitively, whether a layer gives them as an object, a `Headers{:ts}` instance or entries, and a per-call header replaces a default one.

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const WithDefaultsUserRPC = UserRPC.withDefaults({
  apiRoot: 'https://api.example.com/v1',
  init: {
    headers: {
      'x-hello': 'world',
    },
  },
});

const user = await WithDefaultsUserRPC.updateUser({
  // ...
});
```

## Customization

You can customize the client's fetch function and its types to match your app’s needs. See the [`fetcher` customization docs](https://vovk.dev/imports#fetcher) for details.

```ts showLineNumbers copy
await UserRPC.updateUser({
  // ...
  successMessage: 'Successfully updated the user',
  someOtherCustomFlag: true,
});
```

## Type Override

If type inference cannot determine the return type, you can specify it explicitly—no need to cast to `unknown` first.

```ts showLineNumbers copy
import { UserRPC } from '@/client';
import type { SomeType } from '../types';

// ...

// Override the return type
const updatedUser = await UserRPC.updateUser<SomeType>(/* ... */);
```

## Async Iterable

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { get } from 'vovk';
export default class UserController {
  @get()
  static async *doSomething(/* ... */) {
    yield* iterable;
  }
}
```

If the handler returns an async iterable, the client casts the method to a [disposable](https://github.com/tc39/proposal-explicit-resource-management) [async iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator) to enable [JSON Lines](https://vovk.dev/jsonlines) streaming.

```ts showLineNumbers copy
import { StreamRPC } from '@/client';

using stream = await StreamRPC.getJSONLines();

for await (const { message } of stream) {
  console.log('Received message:', message);
}
```

## Access to Schema

Every RPC method exposes the emitted JSON schema through the following properties:

- `schema` - the schema for this method of type `VovkHandlerSchema`;
- `controllerSchema` - the schema object of the method's controller of type `VovkControllerSchema`;
- `segmentSchema` - the schema object of the segment of type `VovkSegmentSchema`;
- `fullSchema` - the full schema object of type `VovkSchema` that includes all available segments as well as emitted config (by default, `"libs"` and `"rootEntry"` options only; see [config documentation](https://vovk.dev/config)).

```ts showLineNumbers copy
console.log(UserRPC.updateUser.schema.validation.body); // get body validation JSON schema
console.log(UserRPC.updateUser.schema.operationObject); // get OpenAPI operationObject spec for this method
console.log(UserRPC.updateUser.fullSchema.meta.config.libs.ajv); // get config option
```

This design also allows you to create [LLM tools](https://vovk.dev/tools) that can use the schema to define the tool parameters.

## `getURL` method

Every RPC method exposes a type-safe `getURL` utility that returns the URL for the method, including serialized `params` and `query`.

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const url = UserRPC.updateUser.getURL({
  params: { id: '69' },
  query: { notify: 'push' },
  apiRoot: 'https://api.example.com/v1', // optional
});
console.log(url); // "https://api.example.com/v1/users/69?notify=push"
```

It can be used to call `fetch` directly if needed.

```ts showLineNumbers copy
const response = await fetch(
  UserRPC.updateUser.getURL({
    /* ... */
  }),
  {
    method: 'PUT',
    // ... other fetch options
  }
);
```

## React Query

Every RPC method exposes a `queryKey` utility that returns a globally unique key for use with [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query). It is an array: `[segmentName, controllerPrefix, rpcModuleName, decoratorPath, httpMethod, ...key]{:ts}`, where `...key` is an optional array of extra values you provide to differentiate similar queries.

```ts showLineNumbers copy
import { useQuery } from '@tanstack/react-query';
import { UserRPC } from '@/client';

const MyComponent = () => {
  const query = useQuery({
    queryKey: UserRPC.getUser.queryKey(['123']),
    queryFn: () =>
      UserRPC.getUser({
        params: { id: '123' },
      }),
  });

  return <div>{query.isLoading ? 'Loading...' : JSON.stringify(query.data)}</div>;
};
```

[View live example on examples.vovk.dev »](https://examples.vovk.dev/react-query)

You can use the key for cache invalidation, refetching, and other React Query features.

```ts showLineNumbers copy
queryClient.invalidateQueries({
  queryKey: UserRPC.getUser.queryKey().slice(0, 3), // Invalidate all queries for the `UserRPC` module
});
```

Streamed responses can utilize [`streamedQuery`](https://tanstack.com/query/latest/docs/reference/streamedQuery), which lets you consume [JSON Lines](https://vovk.dev/jsonlines) as an array.

```ts showLineNumbers copy
import { useQuery, experimental_streamedQuery as streamedQuery } from '@tanstack/react-query';
import { JSONLinesRPC } from '@/client';

const JSONLinesComponent = () => {
  const query = useQuery({
    queryKey: JSONLinesRPC.streamTokens.queryKey(),
    queryFn: streamedQuery({
      streamFn: () => JSONLinesRPC.streamTokens(),
    }),
  });

  return (
    <div>
      Stream result: {query.data?.map(({ message }, i) => <span key={i}>{message}</span>) ?? <em>Loading...</em>}
    </div>
  );
};
```

Mutations work with RPC module methods as expected.

```ts showLineNumbers copy
import { useMutation } from '@tanstack/react-query';
import { UserRPC } from '@/client';

const MyComponent = () => {
  const mutation = useMutation({
    mutationFn: UserRPC.updateUser,
  });

  return (
    <div>
      <button
        onClick={() =>
          mutation.mutate({
            body: { name: 'John Doe', age: 30 },
            params: { id: '123' },
          })
        }
      >
        Update User
      </button>
      {mutation.isLoading ? 'Loading...' : JSON.stringify(mutation.data)}
    </div>
  );
};
```

## `openapi` and `schema`

The generated client also exposes `openapi` and `schema` exports in corresponding modules for accessing the OpenAPI spec and the Vovk Schema, respectively.

```ts showLineNumbers copy
import { openapi } from '@/client/openapi';
import { schema } from '@/client/schema';
```

The `schema` object can also be exported from the main module.

```ts showLineNumbers copy
import { schema } from '@/client';
```

This also works with the [segmented client](https://vovk.dev/segmented); in that case, both `openapi` and `schema` include data only for the selected segment:

```ts showLineNumbers copy
import { openapi } from '@/client/admin/openapi';
import { schema } from '@/client/admin/schema';
import { schema } from '@/client/admin';
```

## Used Templates

The TypeScript RPC client is generated from the following templates:

- [ts](https://vovk.dev/templates#ts) - uncompiled TypeScript module with type definitions; used by default in both the [composed client](https://vovk.dev/composed) and the [segmented client](https://vovk.dev/segmented);
- [mixins](https://vovk.dev/templates#mixins) - `.d.ts` types and `.json` files generated when [OpenAPI mixins](https://vovk.dev/mixins) are used;
- [readme](https://vovk.dev/templates#readme), [packageJson](https://vovk.dev/templates#packagejson) - `README.md` with RPC documentation and `package.json` suitable for publishing the generated library as an NPM package.

For more information, see the [client templates documentation](https://vovk.dev/templates).

---

Page: https://vovk.dev/imports

# TypeScript Client Customization

You can customize the generated TypeScript client by replacing imports of lower-level libraries. Do this via the `outputConfig.imports` object in the [config](https://vovk.dev/config) file, which can specify a [fetcher](#fetcher) and [validateOnClient](#validateonclient).

By default, when **vovk-ajv** (described below) is used for client-side validation, the `index.ts` file generating the `UserRPC` module might look like:

```ts showLineNumbers copy filename="./src/client/index.ts"
import { createRPC } from 'vovk/create-rpc';
import { schema } from './schema';

export const UserRPC = createRPC(schema, '', 'UserRPC', import('vovk/fetcher'), {
  validateOnClient: import('vovk-ajv'),
  apiRoot: 'http://localhost:3000/api',
});
```

When `outputConfig.imports` is modified:

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      fetcher: './src/lib/fetcher',
      validateOnClient: './src/lib/validate-on-client',
    },
  },
};
export default config;
```

The generated `index.ts` uses these imports and resolves relative paths:

```ts showLineNumbers copy filename="./src/client/index.ts"
import { createRPC } from 'vovk/create-rpc';

export const UserRPC = createRPC(schema, '', 'UserRPC', import('../lib/fetcher'), {
  validateOnClient: import('../lib/validate-on-client'),
  apiRoot: 'http://localhost:3000/api',
});
```

`fetcher` and `validateOnClient` can also be set per [segment](https://vovk.dev/segment). This enables different options or auth mechanisms per segment (including [OpenAPI mixins](https://vovk.dev/mixins)) and different validation libraries where needed.

```ts showLineNumbers copy
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      // applied to all segments
      fetcher: './src/lib/fetcher',
      validateOnClient: './src/lib/validate-on-client',
    },
    segments: {
      admin: {
        imports: {
          // applied only to "admin" segment
          fetcher: './src/lib/admin-fetcher',
          validateOnClient: './src/lib/admin-validate-on-client',
        },
      },
    },
  },
};
export default config;
```

## `fetcher`

The `fetcher` prepares handlers, performs client-side validation, issues HTTP requests, differentiates content types (JSON, [JSON Lines](https://vovk.dev/jsonlines), or other `Response` types), and returns data in the appropriate format.

- For `application/json` and any `+json` type, such as `application/problem+json`, it returns the parsed JSON, or `null` for a response without a body, such as a `204` or the answer to a `HEAD` request. An error status throws an `HttpException{:ts}` with the body's `message`, or with the `detail` or `title` of a problem details document.
- For `application/jsonl`, `application/jsonlines` or `application/x-ndjson`, it returns a disposable async iterable.
- For other content types, it returns the `Response` object as-is, letting you access text or binary data. A status of 400 or above throws an `HttpException{:ts}` with the response text as its message instead.

The content type is compared without its parameters and in any case, so `Application/JSON; charset=utf-8` is JSON.

It can also process custom per-call options passed to RPC methods.

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const user = await UserRPC.updateUser({
  // ...
  successMessage: 'Successfully updated the user',
  someOtherCustomFlag: true,
});
```

### `createFetcher`

The file at `imports.fetcher` must export a `fetcher` variable. To simplify creating a custom fetcher, use `createFetcher` from `vovk`.

```ts showLineNumbers copy filename="./src/lib/fetcher.ts"
import { createFetcher } from 'vovk';

export const fetcher = createFetcher<{
  successMessage?: string; // "Successfully created a new user"
  useAuth?: boolean; // if true, Authorization header will be set
  someOtherCustomFlag?: boolean; // any custom flag that you want to pass to the RPC method
}>({
  prepareRequestInit: async (init, { useAuth, someOtherCustomFlag }) => {
    // ...
    return {
      ...init,
      headers: {
        ...init.headers,
        ...(useAuth ? { Authorization: 'Bearer token' } : {}),
      },
    };
  },
  transformResponse: async (data, { someOtherCustomFlag }) => {
    // ...
    return data;
  },
  onSuccess: async (data, { successMessage }) => {
    if (successMessage) {
      alert(successMessage);
    }
  },
  onError: async (error) => {
    alert(error.message);
  },
});
```

With this setup, all RPC module methods accept the desired options:

```ts showLineNumbers copy
import { UserRPC } from '@/client';

await UserRPC.updateUser({
  params: { param: 'value' },
  query: { id: 'value' },
  body: { email: 'value' },
  successMessage: 'Successfully updated the user',
  useAuth: true,
  someOtherCustomFlag: true,
});
```

`createFetcher` accepts an object with:

#### `prepareRequestInit(init: RequestInit, options: T){:ts}`

Prepares `RequestInit` before making the request. Use it to set auth headers or Next.js-specific `next` options. Receives the prepared `init` and custom call `options`, and must return a `RequestInit` object (usually based on `init`). Useful for logging or other pre-request logic.

#### `transformResponse(data: unknown, options: T, info: { response: Response, init: RequestInit, schema: VovkHandlerSchema }){:ts}`

Transforms the response before returning it to the caller. The `data` type depends on the content type: JSON, a [disposable](https://github.com/tc39/proposal-explicit-resource-management) [async iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator), or a `Response`. Return the transformed value. The `info` argument provides the original `Response`, the `RequestInit` used, and the `VovkHandlerSchema` (e.g., `schema.operationObject`).

#### `onError(error: HttpException, options: T){:ts}`

Called when a request fails. Use it for error messages, logging, or custom handling.

#### `onSuccess(data: unknown, options: T){:ts}`

Called on success. Use it for success messages, logging, or post-processing.

### Event-style callbacks

`onSuccess` and `onError` can also be registered after the fetcher is created. This is useful when callbacks depend on context that isn't available at creation time (e.g. a React context value or a Zustand store reference). Both methods return an unsubscribe function. Multiple callbacks can be registered — they run in order.

```ts showLineNumbers copy
const unsubSuccess = fetcher.onSuccess((data, { successMessage }) => {
  console.log('Success:', successMessage);
});

const unsubError = fetcher.onError((error) => {
  console.error('Error:', error.message);
});

// Later, remove the callbacks:
unsubSuccess();
unsubError();
```

## `validateOnClient`

`validateOnClient` defines how client-side validation is performed for RPC/API method input (`params`, `query`, `body`). Create it via `createValidateOnClient` from `vovk`. It accepts a `validate` function that receives the input data, the JSON schema, and metadata, and returns validated data or throws on failure. Validation runs only when both input and schema are provided.

```ts showLineNumbers copy filename="./src/lib/validate-on-client.ts"
import { validateData } from 'some-json-validation-library';
import { createValidateOnClient, HttpException, HttpStatus } from 'vovk';

export const validateOnClient = createValidateOnClient({
  validate: async (input, schema, meta) => {
    const isValid = validateData(input, schema);
    if (!isValid) {
      throw new HttpException(HttpStatus.NULL, 'Validation failed', {
        // ... optional cause
      });
    }

    return input;
  },
});
```

### vovk-ajv

[vovk-ajv](https://www.npmjs.com/package/vovk-ajv) is the primary library for client-side validation, built on top of [Ajv](https://www.npmjs.com/package/ajv). It’s installed and configured automatically when you run `npx vovk-cli init`. **vovk-ajv** supports additional configuration under `config.libs.ajv` in [vovk.config](https://vovk.dev/config), including Ajv options and the target JSON Schema draft.

Ajv runs with `strict: false` unless the options say otherwise, so keywords JSON Schema doesn't define, such as Zod's `example` or OpenAPI's `discriminator` and `x-*`, are ignored. A `pattern` is read with the `u` flag, which `\p{…}` needs, as in `z.emoji()`, or without it when the `u` flag refuses the pattern, as it refuses escapes such as `\-` that Zod's regexes allow. OpenAPI 3.0's boolean `exclusiveMinimum` and `exclusiveMaximum` are read as the bounds they mark. A `FormData` or `URLSearchParams` body holds strings, as do `params` and `query`, which the URL carries, so they are validated with `coerceTypes: true`: `"5"` passes as a number. The `params` and `query` are checked as a copy and sent as given. When Ajv can't compile a schema, the client skips validation for it and logs a warning; the server still validates the request.

```bash npm2yarn copy
npm install vovk-ajv
```

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
  },
  libs: {
    /** @type {import('vovk-ajv').VovkAjvConfig} */
    ajv: {
      options: {
        // Ajv options
        strict: false,
      },
      target: 'draft-2020-12', // auto-detected from $schema but can be configured
    },
  },
};
export default config;
```

---

Page: https://vovk.dev/composed

# Composed Client Mode

By default, Vovk.ts generates a single RPC client that aggregates all RPC modules from every segment. This approach—called the **Composed Client**—is useful for single-page applications where you want a single import entry point for all RPC modules across all segments. The files are emitted to the [reconfigurable](https://vovk.dev/config) **src/client** folder (or **client** if the project has no `src` folder) and imported as `@/client` with the default Next.js path alias.

The structure of the **src/client** folder generated by the default [ts](https://vovk.dev/templates#ts) template looks like this:

```
src/client/
  index.ts
  schema.ts
  openapi.ts
  openapi.json
```

The generated client is derived from the committed [schema](https://vovk.dev/schema) and source code, so it doesn't need to be committed itself: [vovk init](https://vovk.dev/quick-install) adds the output folder to `.gitignore` and sets up the NPM scripts so `vovk generate` regenerates the client on every build.

The default generation can be reproduced with the [CLI](https://vovk.dev/generate) command:

```sh npm2yarn copy
npm exec -- vovk generate --from ts --out src/client
```

## Composed Client Config

The composed client can be configured with the following options:

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    enabled: true, // default
    fromTemplates: ['ts'], // default
    outDir: './src/client', // default; './client' if there is no src folder
    includeSegments: ['foo'], // or excludeSegments: ['bar'], not both
  },
};
export default config;
```

### `enabled`

If set to `false`, the composed client will not be generated. Useful when you only want segmented clients.

### `fromTemplates`

An array of templates used to generate the composed client. By default, `["ts"]` produces TypeScript modules compiled together with the rest of your application. You can mix [built-in templates](https://vovk.dev/templates) and custom templates.

### `outDir`

The path where the composed client is generated. Defaults to `./src/client` when the project has a `src` folder, or `./client` otherwise. The path is relative to the current working directory (CWD). If the folder already holds files under the generated names, such as a hand-written `index.ts`, generation stops and names them; see [`--force`](https://vovk.dev/generate#other-flags).

### `includeSegments`

An array of segments to include in the composed client. By default, all segments are included. Use this to include only specific segments.

### `excludeSegments`

An array of segments to exclude from the composed client. By default, none are excluded. This option is mutually exclusive with `includeSegments`.

### `prettifyClient`

Whether to format the generated client code. Defaults to `true`. The [Prettier](https://prettier.io/) package resolved from your project is used with your local configuration; it's not installed with the CLI. If Prettier is not installed, the CLI prints a warning and emits unformatted code—install Prettier or set `prettifyClient` to `false` to suppress the warning.

### `outputConfig`

Overrides the root [`outputConfig` options](https://vovk.dev/config#outputconfig).

---

Page: https://vovk.dev/segmented

# Segmented Client Mode

The [Composed Client Mode](https://vovk.dev/composed) works well for single-page applications, but in larger apps exposing the entire schema through a single client may be undesirable. With a small configuration change, you can instruct Vovk.ts to generate separate RPC clients for each segment. This approach—called the **Segmented Client**—splits the client into smaller per-segment TypeScript modules that can be imported independently, keeping RPC modules and their schemas hidden from unrelated pages. For example, “customer” pages won’t import “admin” RPC modules, keeping admin details out of customer code.

By default, the segmented client is generated in the `./src/client` folder (or `./client` if you don’t use a `src` folder) from the [ts](https://vovk.dev/templates#ts) template. For an app with multiple segments, the generated structure may look like this:

```
src/client/
  root/
    index.ts (imports ./schema.ts)
    schema.ts (imports .vovk-schema/root.json)
    openapi.json (root segment OpenAPI schema)
    openapi.ts (imports ./openapi.json)
  admin/
    index.ts (imports ./schema.ts)
    schema.ts (imports .vovk-schema/admin.json)
    openapi.json (admin segment OpenAPI schema)
    openapi.ts (imports ./openapi.json)
  customer/
    index.ts (imports ./schema.ts)
    schema.ts (imports .vovk-schema/customer.json)
    openapi.json (customer segment OpenAPI schema)
    openapi.ts (imports ./openapi.json)
    static/
      index.ts (imports ./schema.ts)
      schema.ts (imports .vovk-schema/customer/static.json)
      openapi.json (customer static sub-segment OpenAPI schema)
      openapi.ts (imports ./openapi.json)
```

When you import an RPC module from one of the `.ts` files, the import tree includes only the schema and RPC modules for that segment. For example, importing `UserRPC` from the `customer` segment pulls in `.vovk-schema/customer.json` only; `.vovk-schema/admin.json` and other segment files are not included.

```ts showLineNumbers copy
import { UserRPC } from '@/client/customer'; // import tree will contain customer.json

await UserRPC.getUser({ params: { id: '123' } });
```

The segmented client also applicable to [Rust](https://vovk.dev/rust) and [Python](https://vovk.dev/python) templates, though use cases are less common. Each segment folder then holds a whole package, `Cargo.toml` or `pyproject.toml` included, named after the project's package and the segment: for a project named `app`, the `foo` segment's package is `app_foo` and the root segment's is `app_root`. A `package.name` set for the segment in [outputConfig.segments](https://vovk.dev/config#segments) is used as is.

To enable the segmented client, set `segmentedClient.enabled` to `true` in `vovk.config.mjs`, and optionally disable the composed client by setting `composedClient.enabled` to `false`.

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  segmentedClient: {
    enabled: true,
  },
  composedClient: {
    enabled: false,
  },
};
export default config;
```

In this case, the composed client files are not generated.

The settings are the same as the settings for the [composed client](https://vovk.dev/composed).

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  segmentedClient: {
    enabled: false, // default
    fromTemplates: ['ts'], // default
    outDir: './src/client', // default
    includeSegments: ['foo'], // or excludeSegments: ['bar'], not both
  },
};

export default config;
```

---

Page: https://vovk.dev/schema

# Schema

The `npm run dev` script runs [vovk dev](https://vovk.dev/dev) alongside `next dev` via [concurrently](https://www.npmjs.com/package/concurrently). The Vovk process watches the `modules` folder for controller and validation changes. On the first run or after changes, it calls the Next.js dev server’s `_schema_` endpoint for the relevant segment (available only when `process.env.NODE_ENV` is `development`). That endpoint returns the schema for the target segment, enabling isolated JSON emission per segment.

Each segment emits its backend schema to an individual JSON file, which is then used to generate client-side RPC modules. If your application has multiple areas (e.g., root, admin, customer), each area has its own schema file.

For a segment structure like this:

```
src/app/api/
  [[...vovk]]/
    route.ts (root segment /api/)
  admin/[[...vovk]]/
    route.ts (admin segment /api/admin)
  customer/[[...vovk]]/
    route.ts (customer segment /api/customer)
    static/[[...vovk]]/
      route.ts (static segment /api/customer/static for OpenAPI)
```

The resulting schema files are written to `.vovk-schema/`:

```
.vovk-schema/
  root.json
  admin.json
  customer.json
  customer/
    static.json
  _meta.json
```

Emitted files mirror the segment tree. For example, a `foo/bar/baz` segment emits `.vovk-schema/foo/bar/baz.json`. The root segment is the only exception and uses `root.json` for clarity.

`_meta.json` contains additional metadata, including selected fields from [vovk.config](https://vovk.dev/config) under the `config` key.

When the Vovk CLI reads these files, it builds a single object with `segments` and `meta`. `segments` is flat, keyed by segment name, and `meta` contains the `_meta.json` content. This object powers client generation and OpenAPI output.

```ts showLineNumbers copy
{
  "segments": {
    "": { ... }, // root segment schema from root.json
    "admin": { ... }, // admin segment schema from admin.json
    "customer": { ... }, // customer segment schema from customer.json
    "customer/static": { ... } // static segment schema from customer/static.json
  },
  "meta": { ... } // content of _meta.json file
}
```

The schema is available as the `schema` export.

```ts showLineNumbers copy
import { schema } from '@/client';
// or
import { schema } from '@/client/schema'; // exports only the schema object (no RPC modules)

console.log(schema); // full schema
console.log(schema.segments.admin); // admin segment schema
```

The `schema` object is typed from the JSON files it's built from, where every string field is a plain `string`, so it isn't assignable to the `VovkSchema` type, whose fields are literal unions.

The `schema` is also available in the [segmented client](https://vovk.dev/segmented), containing exactly one segment:

```ts showLineNumbers copy
{
  "segments": {
    "": { ... } // root segment schema from root.json
  },
  "meta": { ... } // content of _meta.json file
}
```

```ts showLineNumbers copy
import { schema } from '@client/root';
// or
import { schema } from '@client/root/schema';
```

---

Example of a segment schema file:

```js filename=".vovk-schema/foo.json"
{
  // Segment schema version
  "$schema": "https://vovk.dev/api/schema/v3/segment.json",
  // vovkInit function option that defines is the schema going to be emitted for this segment
  "emitSchema": true,
  // Segment name, for the root segment it's an empty string
  "segmentName": "foo",
  // "segment", or "mixin" for an OpenAPI mixin
  "segmentType": "segment",
  // List of controllers as key-value pairs for fast access
  // Key is a name of the variable that's going to be exported from "@/client"
  // Value is controller information
  "controllers": {
    "HelloRPC": {
      // RPC name that's going to be used in the client
      "rpcModuleName": "HelloRPC",
      // Original name of the controller class, used to determine segment name when the controller is changed on "vovk dev"
      "originalControllerName": "HelloController",
      // An argument of @prefix class decorator
      "prefix": "hello",
      // List of handlers as key-value pairs for fast access
      // Key is a static method name
      // Value is a handler information
      "handlers": {
        "getHello": {
          // Endpoint that's concatenated with the prefix
          "path": "greeting",
          // HTTP method
          "httpMethod": "POST",
          // Validation for "body", "query", "params", "output" and "iteration"
          "validation": {
            "body": {
              "type": "object",
              "properties": {
                "foo": {
                  "type": "string"
                }
              },
              "required": ["foo"],
              "additionalProperties": false,
              // A procedure with a `contentType` option also gets "x-contentType" here,
              // the list of accepted types, such as ["multipart/form-data"]; a JSON body has none
              "$schema": "https://json-schema.org/draft/2020-12/schema"
            },
            "query": {
              "type": "object",
              "properties": {
                "bar": {
                  "type": "string"
                }
              },
              "required": ["bar"],
              "additionalProperties": false,
              "$schema": "https://json-schema.org/draft/2020-12/schema"
            },
            "params": {
              "type": "object",
              "properties": {
                "baz": {
                  "type": "string"
                }
              },
              "required": ["baz"],
              "additionalProperties": false,
              "$schema": "https://json-schema.org/draft/2020-12/schema"
            },
            "output": {
              // or "iteration" for JSONLines response
              "type": "object",
              "properties": {
                "hello": {
                  "type": "string"
                }
              },
              "required": ["hello"],
              "additionalProperties": false,
              "$schema": "https://json-schema.org/draft/2020-12/schema"
            }
          },
          // OpenAPI object that can be used to generate OpenAPI documentation, LLM tools, MCP etc.
          "operationObject": {
            "summary": "Hello world",
            "description": "Hello world",
            // Custom field for AI tools generation
            "x-tool": { 
              "name": "getHello", // custom name for an AI tool
              "title": "Get Hello", // custom title for an AI tool
              "description": "Hello world", // custom description for an AI tool
              "hidden": false, // whether to hide the tool from AI tool generation
              "meta": { "category": "greetings" } // static data copied to the derived tool
            } 
          },
          // Custom data that can be defined by a custom decorator
          "misc": {
            "hello": "World"
          }
        }
      }
    }
  }
}
```

---

Page: https://vovk.dev/mixins

# Code Generation via OpenAPI Mixins

Vovk.ts can combine the existing Vovk.ts client with modules generated from one or more OpenAPI specifications. This lets you integrate third-party APIs into a Next.js/Vovk.ts application, or use it as a standalone codegen tool—Next.js is not required. This page covers [configuration](https://vovk.dev/config) options related to code generation; note that the [generate](https://vovk.dev/generate) command does not require a config file.

## Features

### Comprehensible Syntax

Vovk.ts preserves a consistent call signature for every method using a single argument object, making it easy to learn and remember:

```ts showLineNumbers copy
import { PetstoreAPI } from '@/client';

await PetstoreAPI.updatePetWithForm({
  params: { petId: 1 }, // URL params (if any)
  query: { name: 'Doggo', status: 'sold' }, // Query params (if any)
  init: { headers: { 'X-Custom-Header': 'value' } }, // Optional: fetch init
  apiRoot: 'https://api.example.com', // Optional: override API root URL
});

await PetstoreAPI.updatePet({
  body: { id: 1, name: 'Doggo', photoUrls: [] }, // Request body (if any)
  disableClientValidation: true, // Optional: disable client-side validation
});
```

For defaults, you can use `withDefaults` to create a pre-configured version of an API module.

```ts showLineNumbers copy
import { PetstoreAPI } from '@/client';

const PetstoreAPIWithAuth = PetstoreAPI.withDefaults({
  init: {
    headers: {
      Authorization: 'Bearer my-token',
    },
  },
  apiRoot: 'https://api.example.com',
});

await PetstoreAPIWithAuth.updatePet({
  body: { name: 'Doggo', photoUrls: [] },
});
```

### Query and Form Styles

A method sends its query the way the OpenAPI document declares each parameter's `style` and `explode`: `form` (repeated keys, or comma-separated with `explode: false`), `spaceDelimited`, `pipeDelimited` and `deepObject` (`filter[status]=sold`). A parameter that declares neither is sent as OpenAPI's default, `form` exploded: `tags=a&tags=b` for an array, and the keys of an object as parameters of their own.

```ts showLineNumbers copy
// tags declared with explode: true, ids with explode: false
await PetstoreAPI.listPets({ query: { tags: ['a', 'b'], ids: [1, 2] } }); // GET /pets?tags=a&tags=b&ids=1,2
```

In an `application/x-www-form-urlencoded` body, a property whose `encoding` declares a style is sent in it, as Stripe's `metadata` with `deepObject`: `metadata[order_id]=6735`. Other properties are sent as any form body: an array as repeated keys, an object as JSON.

### Client-Side Validation and Schema Availability

API modules generated by Vovk.ts include built-in, optional client-side validation using [Ajv](https://ajv.js.org/). You can validate input data before sending a request to ensure it conforms to the expected schema. Disable validation by passing `disableClientValidation: true`.

```ts showLineNumbers copy
import { UserAPI } from '@/client';

await UserAPI.updateUser({
  // ...will throw a validation error if input data is invalid
});
```

In addition to runtime validation, the generated code also exports the Vovk.ts schema for broader use cases. The [composed client](https://vovk.dev/composed) and each chunk of the [segmented client](https://vovk.dev/segmented) export a `schema` object that contains an organized, easy-to-navigate Vovk.ts schema.

```ts showLineNumbers copy
import { schema } from '@/client';
// import { schema } from '@/client/schema';
```

The schema is also accessible on every generated method.

```ts showLineNumbers copy
import { UserAPI } from '@/client';
UserAPI.updateUser.schema.validation.body; // JSON Schema for request body
```

### Deriving AI Tools

Every API module generated by Vovk.ts can be mapped to [AI tools](https://vovk.dev/tools), making them accessible through function calling APIs.

```ts showLineNumbers copy
import { deriveTools } from 'vovk';
import { PetstoreAPI } from '@/client';

const tools = deriveTools({
  modules: {
    PetstoreAPI,
  },
});

console.log(tools);
// [{ execute: (llmInput) => {}, name: 'PetstoreAPI_updatePet', description: 'Update an existing pet by Id', inputSchema: { ... } }, ...]
```

### Python and Rust Clients (Experimental)

Vovk.ts templates also support generating Python and Rust clients with client-side validation and the same consistent options. See the [Python](https://vovk.dev/python) and [Rust](https://vovk.dev/rust) pages for details.

### Type Inference for Unnamed Schemas

A good practice in OpenAPI/mixins design is to use `components/schemas` to define input and output data. This enables properly named types for generated client functions. However, not every OpenAPI specification follows this pattern, and extracting every input/output into `components/schemas` can be impractical.

Without `components/schemas`, many code generators produce awkward type names (e.g., `ApiUsersIdPostRequest`, `ApiUsersIdPost200Response`). This often drives developers to use `Parameters<T>[index]` generic or avoid code generation and fall back to `fetch` or `axios` with manual casting.

Vovk.ts supports type inference for unnamed schemas. Even if the OpenAPI spec doesn't define `components/schemas`, Vovk.ts can infer input and output types using simple utilities.

```ts showLineNumbers copy
import { PetstoreAPI } from '@/client';
import type { VovkBody, VovkQuery, VovkParams, VovkOutput } from 'vovk';

type Body = VovkBody<typeof PetstoreAPI.updatePet>;
type Query = VovkQuery<typeof PetstoreAPI.updatePet>;
type Params = VovkParams<typeof PetstoreAPI.updatePet>;
type Output = VovkOutput<typeof PetstoreAPI.updatePet>;
```

In the [Python](https://vovk.dev/python) client, types are exposed as TypedDicts.

```py
from vovk_client import PetstoreAPI

body: PetstoreAPI.UpdatePetBody = {}
query: PetstoreAPI.UpdatePetQuery = {}
params: PetstoreAPI.UpdatePetParams = {}
output: PetstoreAPI.UpdatePetOutput = {}
```

For the [Rust](https://vovk.dev/rust) client, types are generated as nested modules that contain structs and enums, following the same structure as the OpenAPI spec schemas via `_::` separator.

```rs
use vovk_client::petstore_api::update_pet_::{
    body as Body,
    body_::foo as Foo, // for nested data
    query as Query,
    params as Params,
    output as Output,
};
```

### Bundle

The [TypeScript](https://vovk.dev/typescript) artifacts can be bundled into an npm package using the `bundle` command after configuring `bundle.build` function (see [bundle page](https://vovk.dev/bundle)). It also creates `package.json` and `README.md` files, where the README outlines each method with self-documenting code samples. See the ["Hello World" example](https://vovk.dev/hello-world#bundle) for details.

To create a bundle, ensure `package.json` and `tsconfig.json` are present at the project root.

## Getting Started

### Using Standalone Codegen

If you’re using codegen as a standalone CLI (even without `package.json`), install **vovk-cli** globally or as a dev dependency. You can skip this section if you use Vovk.ts within a Next.js project.

```sh npm2yarn copy
npm install -g vovk-cli
```

Or install **vovk-cli** as a dev dependency and `vovk` and **vovk-ajv** as regular dependencies:

```sh npm2yarn copy
npm install -D vovk-cli
```

```sh npm2yarn copy
npm install vovk vovk-ajv
```

The [composed client](https://vovk.dev/composed) (where all generated API clients are combined into a single client) is generated into `src/client` (or a custom `composedClient.outDir`) and imported directly from your code, e.g. as `@/client`.

### Create Config File

Create a config file as described on the [config](https://vovk.dev/config) page to customize code generation results. Alternatively, use the `vovk-cli init` command:

```sh npm2yarn copy
npx vovk-cli init
```

A basic config file looks like this:

```ts showLineNumbers copy filename="vovk.config.js"
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
  },
};
export default config;
```

### Define OpenAPI mixins

Define a mixin as a pseudo-[segment](https://vovk.dev/segment) in `outputConfig.segments` by setting the `openAPIMixin` property. The key is the mixin name: generation fails for `root`, or for a name a segment or another mixin has, compared ignoring case, as the [segmented client](https://vovk.dev/segmented) writes each one to a folder of that name. Two mixins also can't give the same `Mixins` namespace, like `my-api` and `myApi`, and two segments of the [composed client](https://vovk.dev/composed) can't export a module of the same name. The property accepts:

- `source`: an object with either `url` (remote specs), `file` (local specs), or `object` (inline specs). The `url` variant may include a `fallback` file path used if the remote URL is unreachable.
- `getModuleName`: a string or function to name generated API modules. The string can be any custom string for hard-coded module names, as long as it is a valid identifier.
- `getMethodName`: a string or function to generate method names. Supported strings: `camel-case-operation-id` (converts `operationId` like `get_users` to `getUsers`; one that starts with a digit gets a leading underscore, `2fa_verify` becomes `_2FaVerify`), or `auto` (generates from `operationId` or from HTTP method + path if `operationId` is unsuitable or missing). From the path, `auto` names `GET /users` `listUsers`, `GET /users/{id}` `getUsersById` and `PATCH /users/{userId}/profile` `patchUsersProfileByUserId`. When two operations get the same name, the later one in the document gets a `_2` suffix, and the CLI warns.
- `apiRoot` (optional): the API root URL, overridable per call via the `apiRoot` option. Required if the OAS document has no `servers` property.
- `filterOperations` (optional): a predicate that keeps only the operations it returns `true` for. See [Filter Operations and Prune Components](#filter-operations-and-prune-components).
- `pruneComponents` (optional, default `false`): removes components the kept operations don't reference from the generated schema. See [Filter Operations and Prune Components](#filter-operations-and-prune-components).

Petstore example with a remote URL and a local fallback:

```ts showLineNumbers copy filename="vovk.config.js"
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
    segments: {
      petstore: {
        openAPIMixin: {
          source: {
            url: 'https://petstore3.swagger.io/api/v3/openapi.json',
            fallback: './.openapi-cache/petstore.json',
          },
          getModuleName: 'PetstoreAPI',
          getMethodName: 'auto',
          apiRoot: 'https://petstore3.swagger.io/api/v3',
        },
      },
    },
  },
};
export default config;
```

This generates a single `PetstoreAPI` module with methods for each operation defined in the OpenAPI spec.

```ts showLineNumbers copy
import { PetstoreAPI } from '@/client';

await PetstoreAPI.findPetsByStatus({ query: { status: 'available' } });
```

When `getModuleName` or `getMethodName` are functions, they receive:

- `operationObject`: the Operation Object for the operation.
- `method`: the HTTP method (uppercase string).
- `path`: the operation path.
- `openAPIObject`: the entire OpenAPI document.

For a more advanced example, consider the [GitHub REST API](https://docs.github.com/en/rest). The `operationId` in the [GitHub OpenAPI spec](https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json) has the form `scope/operation` (e.g., `repos/remove-status-check-contexts`, `codespaces/list-for-authenticated-user`). We can use the first part to generate module names and the second part to generate method names via lodash.

For example, `issues/list-for-org` becomes the `GithubIssuesAPI` module with a `listForOrg` method.

```ts showLineNumbers copy filename="vovk.config.js"
// @ts-check
import camelCase from 'lodash/camelCase.js';
import startCase from 'lodash/startCase.js';

/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
    segments: {
      github: {
        openAPIMixin: {
          source: {
            url: 'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json',
            fallback: './.openapi-cache/github.json',
          },
          getModuleName: ({ operationObject }) => {
            const [operationNs] = operationObject.operationId?.split('/') ?? ['unknown'];
            return `Github${startCase(camelCase(operationNs)).replace(/ /g, '')}API`;
          },
          getMethodName: ({ operationObject }) => {
            const [, operationName] = operationObject.operationId?.split('/') ?? ['', 'ERROR'];
            return camelCase(operationName);
          },
        },
      },
    },
  },
};

export default config;
```

Results in multiple modules with well-structured method names:

```ts showLineNumbers copy
import { 
  GithubIssuesAPI, 
  GithubReposAPI,
  GithubPullsAPI,
  GithubActionsAPI,
  GithubUsersAPI
} from '@/client';

await GithubIssuesAPI.listForOrg({ params: { org: 'octocat' } });
await GithubReposAPI.removeStatusCheckContexts({
  params: { owner: 'octocat', repo: 'Hello-World', branch: 'main' },
  body: { contexts: ['ci/build'] },
});
await GithubPullsAPI.list({ params: { owner: 'octocat', repo: 'Hello-World' } });
await GithubActionsAPI.listRepoWorkflows({ params: { owner: 'octocat', repo: 'Hello-World' } });
await GithubReposAPI.getLatestRelease({ params: { owner: 'octocat', repo: 'Hello-World' } });
await GithubUsersAPI.getAuthenticated();
```

Third-party OAS documents can contain keywords JSON Schema doesn't define, such as `example`, `discriminator` or `x-*`. [vovk-ajv](https://vovk.dev/imports#vovk-ajv) ignores them, and a schema Ajv can't compile is left to the server to validate.

### Filter Operations and Prune Components

Large specs produce large clients: every operation becomes a method, and the entire `components` dictionary is carried in the generated schema. Stripe's spec yields 534 methods and 1693 components — megabytes of generated JSON for an app that may call a handful of endpoints. Two options cut it down:

- `filterOperations`: only operations the predicate returns `true` for are generated. It receives the same object as the naming functions (`operationObject`, `method`, `path`, `openAPIObject`) and runs before them, so a filtered-out operation produces no method, types, or validation schemas. Omit it to keep all operations.
- `pruneComponents` (default `false`): removes every component the kept operations don't reference, directly or transitively, from the segment schema. Don't enable it if you import `Mixins.<Segment>.<Component>` types for components no kept operation uses — they are removed along with their schemas.

```ts showLineNumbers copy filename="vovk.config.js"
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    segments: {
      stripe: {
        openAPIMixin: {
          source: {
            url: 'https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.sdk.json',
            fallback: './.openapi-cache/stripe.json',
          },
          apiRoot: 'https://api.stripe.com',
          getModuleName: 'StripeAPI',
          getMethodName: 'camel-case-operation-id',
          filterOperations: ({ method, path }) =>
            method === 'GET' &&
            /^\/v1\/(invoices|customers|subscriptions|charges|refunds|disputes|balance_transactions|prices)$/.test(path),
          pruneComponents: true,
        },
      },
    },
  },
};
export default config;
```

For this Stripe subset, the segment schema drops from ~8.4 MB (534 operations, 1693 components) to ~1.2 MB (8 operations, 863 components — Stripe's core objects reference each other heavily, so that's the transitive floor).

### Customize Fetcher

You can customize the fetch function per mixin or use a single fetcher for all mixins. The [fetcher](https://vovk.dev/imports#fetcher) prepares authorization headers, performs client-side validation, and makes/handles HTTP requests.

```ts showLineNumbers copy filename="vovk.config.js"
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    // ...
    segments: {
      petstore: {
        openAPIMixin: {
          /* ... */
        },
        imports: { fetcher: './src/lib/petstore-fetcher' },
      },
    },
  },
};
export default config;
```

### Composed Client

By default, the [composed client](https://vovk.dev/composed) uses the [ts](https://vovk.dev/templates#ts) template to generate a TypeScript client. It is emitted to `src/client` and importable as `@/client`.

```ts showLineNumbers copy
import { PetstoreAPI, GithubIssuesAPI } from '@/client';

await PetstoreAPI.findPetsByStatus({ query: { status: 'available' } });
await GithubIssuesAPI.listForOrg({ params: { org: 'finom' } });
```

The `Mixins` namespace contains types generated from `components/schemas` across all mixed OpenAPI specifications, providing an alternative to the inference. Each mixin gets a namespace, and each component a type, both named in PascalCase: the `petstore` mixin's `Pet` component is `Mixins.Petstore.Pet`. Letters of any script are kept, a name that would start with a digit gets a leading underscore (`2FAConfig` becomes `_2FaConfig`), and when two components get the same name, the later one in the document takes a number: `user-profile` and `UserProfile` become `UserProfile` and `UserProfile2`.

```ts showLineNumbers copy
import type { VovkOutput } from 'vovk';
import { PetstoreAPI, type Mixins } from '@/client';

const pet: Mixins.Petstore.Pet = { id: 1, name: 'Doggo', photoUrls: [] };
// Alternatively:
const pet2: VovkOutput<typeof PetstoreAPI.getPetById> = { id: 1, name: 'Doggo', photoUrls: [] };
```

The output directory can be changed via `composedClient.outDir`:

```ts showLineNumbers copy filename="vovk.config.js"
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    outDir: './src/lib/client', // emit to a custom directory
  },
};
export default config;
```

```ts showLineNumbers copy
import { PetstoreAPI, GithubIssuesAPI } from '@/lib/client';
// ...
```

### Segmented Client

The [segmented client](https://vovk.dev/segmented) splits code into multiple chunks, placing each mixin in a folder named after its segment (`petstore`, `github`, etc., from `outputConfig.segments`).

By default, output goes to `src/client`. You can change the folder via `segmentedClient.outDir`.

```ts showLineNumbers copy filename="vovk.config.js"
/** @type {import('vovk').VovkConfig} */
const config = {
  segmentedClient: {
    outDir: './src/lib/client', // emit to your codebase
    prettifyClient: true, // prettify the output
  },
};
export default config;
```

```ts showLineNumbers copy
import { PetstoreAPI } from '@/lib/client/petstore';
import { GithubIssuesAPI } from '@/lib/client/github';
// ...
```

---

Page: https://vovk.dev/python

# Python Client

> [!WARNING]
>
> The Python client library is experimental and may contain bugs. Use with caution.

The Python client can be generated with `vovk generate` using the [py](https://vovk.dev/templates#py) or [pySrc](https://vovk.dev/templates#pysrc) template.

Install the generator package:

```sh npm2yarn copy
npm install vovk-python --save-dev
```

Create a Python package with the [CLI](https://vovk.dev/generate) command:

```sh npm2yarn copy
npm exec -- vovk generate --from py --out ./python_package
```

This produces:

```
python_package/
  src/package_name/
    __init__.py
    api_client.py
    py.typed
    schema.json
  pyproject.toml
  setup.cfg
  README.md
```

Publish to [PyPI](https://pypi.org/) with:

```sh
python3 -m build ./python_package --wheel --sdist && python3 -m twine upload ./python_package/dist/*
```

If you prefer generating source files to embed in another Python project, use the `pySrc` template:

```sh npm2yarn copy
npm exec -- vovk generate --from pySrc --out ./python_src
```

This generates:

```
python_src/
  __init__.py
  api_client.py
  py.typed
  schema.json
```

## Configuring the Python Client

You can [configure](https://vovk.dev/config) generation so the client is produced automatically by the default [generate](https://vovk.dev/generate) command (no flags) and during [vovk dev](https://vovk.dev/dev), which performs “hot generation” on schema changes. Add the `py` template to the [composed client](https://vovk.dev/composed) config:

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    fromTemplates: ['ts', 'py'], // keeps the default "ts" template
  },
  clientTemplateDefs: {
    py: {
      extends: 'py', // extends the built-in "py" template
      outputConfig: {
        origin: 'https://example.com', // the server the Python client calls
      },
    },
  },
};
export default config;
```

The Python client sends its calls to an absolute URL, so it needs [`outputConfig.origin`](https://vovk.dev/config#outputconfig). Set on the `py` template, it leaves the TypeScript client's relative URLs as they are. Without an origin, `vovk generate` warns, and every call needs its own `api_root`.

The [py](https://vovk.dev/templates#py) template (and others) has a default `outDir` (`./dist_python`) for composed clients. Override it via [template definitions](https://vovk.dev/templates#defs):

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  // ...
  clientTemplateDefs: {
    py: {
      extends: 'py', // extends the built-in "py" template
      composedClient: {
        outDir: './my_dist_python', // custom output directory for the composed client
      },
    },
  },
};
export default config;
```

## Generated Python Client Example

### JSON Endpoints

The snippets below are adapted from a real example described on the [Hello World](https://vovk.dev/hello-world) page.

A controller like this:

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts" source="examples/hello-world"
import { operation, post, prefix, procedure } from 'vovk';
import { z } from 'zod';
import UserService from './user-service';

@prefix('users')
export default class UserController {
  @operation({
    summary: 'Update user',
    description: 'Update user by ID',
  })
  @post('{id}')
  static updateUser = procedure({
    body: z
      .object({
        email: z.email().meta({
          description: 'User email',
          examples: ['john@example.com', 'jane@example.com'],
        }),
        profile: z
          .object({
            name: z
              .string()
              .min(2)
              .meta({
                description: 'User full name',
                examples: ['John Doe', 'Jane Smith'],
              }),
            age: z
              .int()
              .min(16)
              .max(120)
              .meta({ description: 'User age', examples: [25, 30] }),
          })
          .meta({ description: 'User profile object' }),
      })
      .meta({ description: 'User data object' }),
    params: z
      .object({
        id: z.uuid().meta({
          description: 'User ID',
          examples: ['123e4567-e89b-12d3-a456-426614174000'],
        }),
      })
      .meta({
        description: 'Path parameters',
      }),
    query: z
      .object({
        notify: z
          .enum(['email', 'push', 'none'])
          .meta({ description: 'Notification type' }),
      })
      .meta({
        description: 'Query parameters',
      }),
    output: z
      .object({
        success: z.boolean().meta({ description: 'Success status' }),
        id: z.uuid().meta({ description: 'User ID' }),
        notify: z.enum(['email', 'push', 'none']).meta({
          description: 'Notification type',
        }),
      })
      .meta({ description: 'Response object' }),
  }).handle(async (req, { id }) => {
    const body = await req.json();
    const notify = req.nextUrl.searchParams.get('notify');

    return UserService.updateUser(id, body, notify);
  });
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/user/user-controller.ts)*

```ts showLineNumbers copy filename="src/modules/user/user-service.ts" source="examples/hello-world"
import type { VovkBody, VovkOutput, VovkParams, VovkQuery } from 'vovk';
import type UserController from './user-controller';

export default class UserService {
  static updateUser = (
    id: VovkParams<typeof UserController.updateUser>['id'],
    body: VovkBody<typeof UserController.updateUser>,
    notify: VovkQuery<typeof UserController.updateUser>['notify'],
  ) => {
    console.log(
      id satisfies string,
      body satisfies { email: string; profile: { name: string; age: number } },
      notify satisfies 'email' | 'push' | 'none',
    );
    return {
      id,
      notify,
      success: true,
    } satisfies VovkOutput<typeof UserController.updateUser>;
  };
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/user/user-service.ts)*

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts" source="examples/hello-world"
import { initSegment } from 'vovk';
import StreamController from '../../../modules/stream/stream-controller';
import UserController from '../../../modules/user/user-controller';

export const runtime = 'edge';

const controllers = {
  UserRPC: UserController,
  StreamRPC: StreamController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
  onError: console.error,
});
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/app/api/[[...vovk]]/route.ts)*

...emits a [Vovk.ts schema](https://vovk.dev/schema), which is then used to generate the Python client, following Python conventions, adding comments from `description`, and selecting appropriate number types. For example, `age` is generated as `int`, matching the controller definition.

```py filename="./dist_python/src/package_name/__init__.py"
from __future__ import annotations
import sys
from typing import Any, Dict, List, Literal, Optional, Set, TypedDict, Union, Tuple, Generator, BinaryIO # type: ignore
from .api_client import ApiClient, HttpException

if sys.version_info >= (3, 11):
    from typing import NotRequired, TypeAlias
else:
    from typing_extensions import NotRequired, TypeAlias

HttpException = HttpException

client = ApiClient("https://hello-world.vovk.dev/api", {
    "": ("https://hello-world.vovk.dev/api", ""),
})

class UserRPC:
    # UserRPC.update_user POST `https://hello-world.vovk.dev/api/users/{id}`
    class _UpdateUserBody_profile(TypedDict):
        """
        User profile object
        """
        name: str
        age: int
    class UpdateUserBody(TypedDict):
        """
        User data object
        """
        email: str
        profile: UserRPC._UpdateUserBody_profile
    class UpdateUserQuery(TypedDict):
        """
        Query parameters
        """
        notify: Literal["email", "push", "none"]
    class UpdateUserParams(TypedDict):
        """
        Path parameters
        """
        id: str
    class UpdateUserOutput(TypedDict):
        """
        Response object
        """
        success: bool
        id: str
        notify: Literal["email", "push", "none"]
    @staticmethod
    def update_user(
        body: UpdateUserBody,
        query: UpdateUserQuery,
        params: UpdateUserParams,
        headers: Optional[Dict[str, str]] = None,
        api_root: Optional[str] = None,
        disable_client_validation: bool = False
    ) -> UpdateUserOutput:
        """
        Update user
        Description: Update user by ID
        Body: User data object
        Query: Query parameters
        Returns: Response object
        """
        return client.request( # type: ignore
            segment_name="",
            rpc_name="UserRPC",
            handler_name="updateUser",
            body=body,
            query=query,
            params=params,
            headers=headers,
            api_root=api_root,
            disable_client_validation=disable_client_validation
        )
```

All RPC modules are generated in `__init__.py`, which contains the RPC functions and the associated types. Types for nested structures are emitted as `TypedDict`s. A key the schema doesn't require is `NotRequired`, imported from `typing_extensions` before Python 3.11. A type that isn't a `TypedDict`, such as a `str` output, is a `TypeAlias`, imported the same way.

Types for `body`, `query`, and `params` follow the pattern `[PascalCaseMethodName][InputType]`. For a method `updateUser`, you get `UpdateUserBody`, `UpdateUserQuery`, and `UpdateUserParams`.

Method names are in snake_case: `UserRPC.updateUser` is `UserRPC.update_user`. They are per RPC class, in schema order: a name already taken gets the first free suffix, `_2`, `_3`, so `getUserByID` and `getUserById` give `get_user_by_id` and `get_user_by_id_2`.

```py
from dist_python.src.vovk_hello_world import UserRPC
import vovk_hello_world

def main() -> None:
    body: UserRPC.UpdateUserBody = {
        "email": "john@example.com",
        "profile": {
            "name": "John Doe",
            "age": 25
        }
    }
    query: UserRPC.UpdateUserQuery = {"notify": "email"}
    params: UserRPC.UpdateUserParams = {"id": "123e4567-e89b-12d3-a456-426614174000"}
    update_user_response = UserRPC.update_user(
        params=params,
        body=body,
        query=query
    )
    print('UserRPC.update_user:', update_user_response)

if __name__ == "__main__":
  try:
      main()
  except Exception as e:
      print(f"Error: {e}")
```

Under the hood, it uses [requests](https://pypi.org/project/requests/) for HTTP, [jsonschema](https://pypi.org/project/jsonschema/) for client-side validation, and other common libraries. A `pattern` that Python's `re` can't compile, such as `\p{L}`, is left to the server.

A call returns the parsed JSON, or `None` for an empty JSON body. A response of a `text/*` type, or of any type with a charset, comes back as `str`, decoded as UTF-8 unless the charset names another encoding. Any other response, such as a file, comes back as `bytes`.

### JSON Lines Endpoints

For continuous streaming with [JSON Lines](https://vovk.dev/jsonlines) endpoints, the Python client returns a `Generator` you can iterate over.

A controller like this:

```ts showLineNumbers copy filename="src/modules/stream/stream-controller.ts" source="examples/hello-world"
import { get, operation, prefix, procedure } from 'vovk';
import { z } from 'zod';
import StreamService from './stream-service';

@prefix('streams')
export default class StreamController {
  @operation({
    summary: 'Stream tokens',
    description: 'Stream tokens to the client',
  })
  @get('tokens')
  static streamTokens = procedure({
    validateEachIteration: true,
    iteration: z
      .object({
        message: z.string().meta({ description: 'Message from the token' }),
      })
      .meta({
        description: 'Streamed token object',
      }),
  }).handle(async function* () {
    yield* StreamService.streamTokens();
  });
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/stream/stream-controller.ts)*

```ts showLineNumbers copy filename="src/modules/stream/stream-service.ts" source="examples/hello-world"
import type { VovkIteration } from 'vovk';
import type StreamController from './stream-controller';

export default class StreamService {
  static async *streamTokens() {
    const tokens: VovkIteration<typeof StreamController.streamTokens>[] =
      'Vovk.ts is a RESTful back-end meta-framework with RPC, built on top of the Next.js App Router. This text is a JSONLines stream demo.'
        .match(/[^\s-]+-?(?:\s+)?/g)
        ?.map((message) => ({ message })) || [];

    for (const token of tokens) {
      yield token;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/stream/stream-service.ts)*

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts" source="examples/hello-world"
import { initSegment } from 'vovk';
import StreamController from '../../../modules/stream/stream-controller';
import UserController from '../../../modules/user/user-controller';

export const runtime = 'edge';

const controllers = {
  UserRPC: UserController,
  StreamRPC: StreamController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
  onError: console.error,
});
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/app/api/[[...vovk]]/route.ts)*

Compiles to:

```py filename="./dist_python/src/package_name/__init__.py"
class StreamRPC:
    # StreamRPC.stream_tokens GET `https://hello-world.vovk.dev/api/streams/tokens`
    class StreamTokensIteration(TypedDict):
        """
        Streamed token object
        """
        message: str
    @staticmethod
    def stream_tokens(

        headers: Optional[Dict[str, str]] = None,
        api_root: Optional[str] = None,
        disable_client_validation: bool = False
    ) -> Generator[StreamTokensIteration, None, None]:
        """
        Stream tokens
        Description: Stream tokens to the client
        """
        return client.request( # type: ignore
            segment_name="",
            rpc_name="StreamRPC",
            handler_name="streamTokens",

            headers=headers,
            api_root=api_root,
            disable_client_validation=disable_client_validation
        )
```

Usage:

```py
from dist_python.src.vovk_hello_world import StreamRPC
import vovk_hello_world

def main() -> None:
    stream_response = StreamRPC.stream_tokens()
    print("streamTokens:")
    for item in stream_response:
        print(item['message'], end='', flush=True)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

### Timeout and Session

All calls share one `requests.Session`, so connections stay open between them. The client waits 10 seconds to connect and 300 seconds for each read, and an upload fails when the server takes no data for 10 seconds. Both are attributes of the module-level `client`:

```py
from package_name import client

client.timeout = 30  # seconds, or a (connect, read) tuple; None waits forever
client.session.headers["Authorization"] = "Bearer ..."
```

The session keeps no cookie a response sets, since one client serves every call and thread. A cookie set by hand, as `client.session.cookies.set("session", "...")`, goes with every call. To keep the cookies responses set, call `client.session.cookies.set_policy(http.cookiejar.DefaultCookiePolicy())`.

## Roadmap/bugs

- ✨ Generate importable types for named schemas defined in `components/schemas`.

---

Page: https://vovk.dev/rust

# Rust Client

> [!WARNING]
>
> The Rust client library is experimental and may contain bugs. Use with caution.

The Rust client can be generated with `vovk generate` using the [rs](https://vovk.dev/templates#rs) or [rsSrc](https://vovk.dev/templates#rssrc) template.

Install the generator package:

```sh npm2yarn copy
npm install vovk-rust --save-dev
```

Generate a Rust package with the [CLI](https://vovk.dev/generate):

```sh npm2yarn copy
npm exec -- vovk generate --from rs --out ./rust_package
```

This produces the following structure:

```
rust_package/
  src/
    http_request.rs
    lib.rs
    read_full_schema.rs
    schema.json
  Cargo.toml
  README.md
```

Publish to [crates.io](https://crates.io/) with:

```sh
cargo publish --manifest-path rust_package/Cargo.toml
```

If you prefer generating source files to embed in another Rust project, use the [rsSrc](https://vovk.dev/templates#rssrc) template:

```sh npm2yarn copy
npm exec -- vovk generate --from rsSrc --out ./rust_src
```

This generates:

```
rust_src/
  http_request.rs
  lib.rs
  read_full_schema.rs
  schema.json
```

## Configuring the Rust Client

You can [configure](https://vovk.dev/config) generation so the client is produced automatically by the default [generate](https://vovk.dev/generate) command (no flags) and during [vovk dev](https://vovk.dev/dev), which performs “hot generation” whenever the schema changes. Add the `rs` template to the [composed client](https://vovk.dev/composed) config:

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    fromTemplates: ['ts', 'rs'], // keep the default "ts" template
  },
  clientTemplateDefs: {
    rs: {
      extends: 'rs', // extends the built-in "rs" template
      outputConfig: {
        origin: 'https://example.com', // the server the Rust client calls
      },
    },
  },
};
export default config;
```

The Rust client sends its calls to an absolute URL, so it needs [`outputConfig.origin`](https://vovk.dev/config#outputconfig). Set on the `rs` template, it leaves the TypeScript client's relative URLs as they are. Without an origin, `vovk generate` warns, and every call needs its own `api_root`.

The [rs](https://vovk.dev/templates#rs) template (and others) has a default `outDir` (`./dist_rust`) for composed clients. Override it via [template definitions](https://vovk.dev/templates#defs):

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  // ...
  clientTemplateDefs: {
    rs: {
      extends: 'rs', // extends the built-in "rs" template
      composedClient: {
        outDir: './my_dist_rust', // custom output directory for the composed client
      },
    },
  },
};
export default config;
```

## Generated Rust Client Example

### JSON Endpoints

The snippets below are adapted from a real example described on the [Hello World](https://vovk.dev/hello-world) page.

A controller like this:

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts" source="examples/hello-world"
import { operation, post, prefix, procedure } from 'vovk';
import { z } from 'zod';
import UserService from './user-service';

@prefix('users')
export default class UserController {
  @operation({
    summary: 'Update user',
    description: 'Update user by ID',
  })
  @post('{id}')
  static updateUser = procedure({
    body: z
      .object({
        email: z.email().meta({
          description: 'User email',
          examples: ['john@example.com', 'jane@example.com'],
        }),
        profile: z
          .object({
            name: z
              .string()
              .min(2)
              .meta({
                description: 'User full name',
                examples: ['John Doe', 'Jane Smith'],
              }),
            age: z
              .int()
              .min(16)
              .max(120)
              .meta({ description: 'User age', examples: [25, 30] }),
          })
          .meta({ description: 'User profile object' }),
      })
      .meta({ description: 'User data object' }),
    params: z
      .object({
        id: z.uuid().meta({
          description: 'User ID',
          examples: ['123e4567-e89b-12d3-a456-426614174000'],
        }),
      })
      .meta({
        description: 'Path parameters',
      }),
    query: z
      .object({
        notify: z
          .enum(['email', 'push', 'none'])
          .meta({ description: 'Notification type' }),
      })
      .meta({
        description: 'Query parameters',
      }),
    output: z
      .object({
        success: z.boolean().meta({ description: 'Success status' }),
        id: z.uuid().meta({ description: 'User ID' }),
        notify: z.enum(['email', 'push', 'none']).meta({
          description: 'Notification type',
        }),
      })
      .meta({ description: 'Response object' }),
  }).handle(async (req, { id }) => {
    const body = await req.json();
    const notify = req.nextUrl.searchParams.get('notify');

    return UserService.updateUser(id, body, notify);
  });
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/user/user-controller.ts)*

```ts showLineNumbers copy filename="src/modules/user/user-service.ts" source="examples/hello-world"
import type { VovkBody, VovkOutput, VovkParams, VovkQuery } from 'vovk';
import type UserController from './user-controller';

export default class UserService {
  static updateUser = (
    id: VovkParams<typeof UserController.updateUser>['id'],
    body: VovkBody<typeof UserController.updateUser>,
    notify: VovkQuery<typeof UserController.updateUser>['notify'],
  ) => {
    console.log(
      id satisfies string,
      body satisfies { email: string; profile: { name: string; age: number } },
      notify satisfies 'email' | 'push' | 'none',
    );
    return {
      id,
      notify,
      success: true,
    } satisfies VovkOutput<typeof UserController.updateUser>;
  };
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/user/user-service.ts)*

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts" source="examples/hello-world"
import { initSegment } from 'vovk';
import StreamController from '../../../modules/stream/stream-controller';
import UserController from '../../../modules/user/user-controller';

export const runtime = 'edge';

const controllers = {
  UserRPC: UserController,
  StreamRPC: StreamController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
  onError: console.error,
});
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/app/api/[[...vovk]]/route.ts)*

...emits a [Vovk.ts schema](https://vovk.dev/schema), which is then used to generate the Rust client, adding comments from the schema `description`, and choosing suitable types. For example, `age` is generated as `u8` due to `min`/`max` constraints.

```rs filename="./dist_rust/src/lib.rs"
mod http_request;
mod read_full_schema;

pub use crate::http_request::HttpException;

pub mod user_rpc {
    #[allow(unused_imports)]
    use crate::http_request::{Endpoint, HttpException, RequestBody, http_request, http_request_stream};
    #[allow(unused_imports)]
    use futures_util::Stream;
    use std::collections::HashMap;
    #[allow(unused_imports)]
    use std::pin::Pin;

    // UserRPC.update_user POST `https://hello-world.vovk.dev/api/users/{id}`
    pub mod update_user_ {
      use serde::{Serialize, Deserialize};
      /// User data object
      #[derive(Debug, Serialize, Deserialize, Clone)]
      #[allow(non_snake_case, non_camel_case_types)]
      pub struct body {
        /// User email
        pub email: String,
        /// User profile object
        pub profile: body_::profile,
      }

      #[allow(non_snake_case)]
      pub mod body_ {
        use serde::{Serialize, Deserialize};

        /// User profile object
        #[derive(Debug, Serialize, Deserialize, Clone)]
        #[allow(non_snake_case, non_camel_case_types)]
        pub struct profile {
          /// User full name
          pub name: String,
          /// User age
          pub age: u8,
        }

      }
      /// Query parameters
      #[derive(Debug, Serialize, Deserialize, Clone)]
      #[allow(non_snake_case, non_camel_case_types)]
      pub struct query {
        /// Notification type
        pub notify: query_::notify,
      }

      #[allow(non_snake_case)]
      pub mod query_ {
        use serde::{Serialize, Deserialize};

        /// Notification type
        #[derive(Debug, Serialize, Deserialize, Clone)]
        #[allow(non_camel_case_types)]
        pub enum notify {
          #[serde(rename = "email")]
          email,
          #[serde(rename = "push")]
          push,
          #[serde(rename = "none")]
          none,
        }

      }
      /// Path parameters
      #[derive(Debug, Serialize, Deserialize, Clone)]
      #[allow(non_snake_case, non_camel_case_types)]
      pub struct params {
        /// User ID
        pub id: String,
      }

      /// Response object
      #[derive(Debug, Serialize, Deserialize, Clone)]
      #[allow(non_snake_case, non_camel_case_types)]
      pub struct output {
        /// Success status
        pub success: bool,
        /// User ID
        pub id: String,
        /// Notification type
        pub notify: output_::notify,
      }

      #[allow(non_snake_case)]
      pub mod output_ {
        use serde::{Serialize, Deserialize};

        /// Notification type
        #[derive(Debug, Serialize, Deserialize, Clone)]
        #[allow(non_camel_case_types)]
        pub enum notify {
          #[serde(rename = "email")]
          email,
          #[serde(rename = "push")]
          push,
          #[serde(rename = "none")]
          none,
        }

      }
    }

    /// Params: Path parameters
    /// Body: User data object
    /// Query: Query parameters
    /// Returns: Response object
    pub async fn update_user( 
        body: update_user_::body,
        query: update_user_::query,
        params: update_user_::params,
        headers: Option<&HashMap<String, String>>,
        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<update_user_::output, HttpException>{
        let result = http_request::<
            update_user_::output,
            update_user_::body,
            update_user_::query,
            update_user_::params
        >(
            &Endpoint {
                api_root: "https://hello-world.vovk.dev/api",
                segment_path: "",
                segment_name: "",
                controller_name: "UserRPC",
                handler_name: "updateUser",
            },
            RequestBody::Json(&body),
            Some(&query),
            Some(&params),
            headers,
            api_root,
            disable_client_validation,
        ).await;

        result
    }

}
```

All RPC modules are generated in `lib.rs`, which contains RPC functions and the associated types. Nested structures are emitted as nested modules with corresponding `struct` definitions or types.

An RPC module is a `mod` and each of its procedures an `async fn`, both named in snake_case: `UserRPC.updateUser` is `user_rpc::update_user`, and its types are in the module `update_user_`. Function names are per module, in schema order: a name already taken gets the first free suffix, `_2`, `_3`, so `getUserByID` and `getUserById` give `get_user_by_id` and `get_user_by_id_2`. The module imports `http_request` and `http_request_stream`, so these names count as taken.

Access nested structures via `_::`. For example, `body.profile` is `update_user_::body_::profile`. This syntax avoids name collisions and maps 1:1 to the schema structure.

Use `use` to import and rename structs to follow PascalCase. The functions are `async`; this sample runs them on [tokio](https://tokio.rs/) (`cargo add tokio --features macros,rt-multi-thread`):

```rs
use vovk_hello_world::user_rpc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  use user_rpc::update_user_::{
    body as Body,
    body_::profile as Profile,
    query as Query,
    query_::notify as Notify,
    params as Params,
  };

  let update_user_response = user_rpc::update_user(
    Body {
      email: String::from("john@example.com"),
      profile: Profile {
        name: String::from("John Doe"),
        age: 25
      }
    },
    Query {
      notify: Notify::email
    },
    Params {
      id: String::from("123e4567-e89b-12d3-a456-426614174000")
    },
    None, // Headers (hashmap)
    None, // API root
    false, // Disable client validation
  ).await?;

  println!("user_rpc.update_user response: {:?}", update_user_response);
  Ok(())
}
```

Under the hood, it uses [reqwest](https://docs.rs/reqwest/latest/reqwest/) for HTTP, [jsonschema](https://docs.rs/jsonschema/latest/jsonschema/) for client-side validation, and other common crates. Client-side validation reads a schema as JSON Schema 2020-12, or draft 7 when the schema declares it, and checks formats such as `email` and `uuid`.

The crate builds on Rust 1.86: its `Cargo.toml` sets `rust-version = "1.85"` and resolver 3, so Cargo locks dependency versions that support Rust 1.85. A project that depends on the crate resolves dependencies with its own resolver. With edition 2024, or `resolver = "3"` (Cargo 1.84+), it builds on Rust 1.86; an edition 2021 project without it gets the newest versions, which need Rust 1.88.

A procedure that takes `multipart/form-data` gets a [`reqwest::multipart::Form`](https://docs.rs/reqwest/latest/reqwest/multipart/struct.Form.html) as its body. Field names go out as written, in quotes, as browsers send them. Give files names without `"`, `\`, or line breaks: reqwest escapes these with a backslash, which the server keeps in the name, and a `"` makes the form unreadable.

A function without an output schema returns a `serde_json::Value`: the parsed JSON, or `null` for an empty body. A response of a `text/*` type, or of any type with a charset, is a string, decoded as UTF-8 unless the charset names another encoding. Any other response, such as a file, is a string that holds its bytes in base64.

A failed call returns an `HttpException`. Its `status_code()` is the response status, or 0 when the call failed before a response came, for example on client-side validation; `message()` and `cause()` hold the error the server sent. When no response came or it broke off, `source()` is the `reqwest::Error`, without the URL.

### JSON Lines Endpoints

For continuous streaming with [JSON Lines](https://vovk.dev/jsonlines) endpoints, the async function resolves to a [`futures::Stream`](https://docs.rs/futures/latest/futures/stream/trait.Stream.html) of `Result<T, HttpException>` items. Read it with `StreamExt::next` from the [futures](https://docs.rs/futures) crate.

A JSON Lines endpoint without an `iteration` schema gets a regular function instead: it reads the whole response and returns the items as a JSON array.

A controller like this:

```ts showLineNumbers copy filename="src/modules/stream/stream-controller.ts" source="examples/hello-world"
import { get, operation, prefix, procedure } from 'vovk';
import { z } from 'zod';
import StreamService from './stream-service';

@prefix('streams')
export default class StreamController {
  @operation({
    summary: 'Stream tokens',
    description: 'Stream tokens to the client',
  })
  @get('tokens')
  static streamTokens = procedure({
    validateEachIteration: true,
    iteration: z
      .object({
        message: z.string().meta({ description: 'Message from the token' }),
      })
      .meta({
        description: 'Streamed token object',
      }),
  }).handle(async function* () {
    yield* StreamService.streamTokens();
  });
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/stream/stream-controller.ts)*

```ts showLineNumbers copy filename="src/modules/stream/stream-service.ts" source="examples/hello-world"
import type { VovkIteration } from 'vovk';
import type StreamController from './stream-controller';

export default class StreamService {
  static async *streamTokens() {
    const tokens: VovkIteration<typeof StreamController.streamTokens>[] =
      'Vovk.ts is a RESTful back-end meta-framework with RPC, built on top of the Next.js App Router. This text is a JSONLines stream demo.'
        .match(/[^\s-]+-?(?:\s+)?/g)
        ?.map((message) => ({ message })) || [];

    for (const token of tokens) {
      yield token;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/stream/stream-service.ts)*

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts" source="examples/hello-world"
import { initSegment } from 'vovk';
import StreamController from '../../../modules/stream/stream-controller';
import UserController from '../../../modules/user/user-controller';

export const runtime = 'edge';

const controllers = {
  UserRPC: UserController,
  StreamRPC: StreamController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
  onError: console.error,
});
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/app/api/[[...vovk]]/route.ts)*

Compiles to:

```rs filename="./dist_rust/src/lib.rs"
pub mod stream_rpc {
    #[allow(unused_imports)]
    use crate::http_request::{Endpoint, HttpException, RequestBody, http_request, http_request_stream};
    #[allow(unused_imports)]
    use futures_util::Stream;
    use std::collections::HashMap;
    #[allow(unused_imports)]
    use std::pin::Pin;

    // StreamRPC.stream_tokens GET `https://hello-world.vovk.dev/api/streams/tokens`
    pub mod stream_tokens_ {
      use serde::{Serialize, Deserialize};
      /// Streamed token object
      #[derive(Debug, Serialize, Deserialize, Clone)]
      #[allow(non_snake_case, non_camel_case_types)]
      pub struct iteration {
        /// Message from the token
        pub message: String,
      }

    }

    pub async fn stream_tokens( 
        body: (),
        query: (),
        params: (),
        headers: Option<&HashMap<String, String>>,
        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<stream_tokens_::iteration, HttpException>> + Send>>, HttpException>{
        let result = http_request_stream::<
            stream_tokens_::iteration,
            (),
            (),
            ()
        >(
            &Endpoint {
                api_root: "https://hello-world.vovk.dev/api",
                segment_path: "",
                segment_name: "",
                controller_name: "StreamRPC",
                handler_name: "streamTokens",
            },
            RequestBody::None,
            Some(&query),
            Some(&params),
            headers,
            api_root,
            disable_client_validation,
        ).await;

        result
    }

}
```

Usage, with the futures crate (`cargo add futures`):

```rs
use futures::StreamExt;
use std::io::{stdout, Write};
use vovk_hello_world::stream_rpc;

pub async fn consume_stream() -> Result<(), Box<dyn std::error::Error>> {
  let mut stream = stream_rpc::stream_tokens((), (), (), None, None, false).await?;
  while let Some(item) = stream.next().await {
    let val = item.expect("stream item should be Ok");
    let message = val.message;
    print!("{}", message.as_str());
    stdout().flush().expect("flush stdout");
  }
  Ok(())
}
```

## Roadmap/bugs

- ✨ Generate importable types for named schemas defined in `components/schemas`.

---

Page: https://vovk.dev/templates

# Client Templates

## Introduction

Vovk.ts renders client libraries from [EJS](https://www.npmjs.com/package/ejs) templates. To accommodate a wide range of use cases, Vovk.ts provides simple yet powerful template logic that meets the following requirements:

1. Render multiple files from a single template definition. This means a **"template" is a directory** with one or more files, where files with the `.ejs` extension are rendered as EJS templates and other files are copied as-is. An `index.ts.ejs` file is rendered as `index.ts`, and an `index.ts` without the `.ejs` extension is copied as-is.
2. Use existing templates as a base for other templates using the `extends` option. This allows to create a new template that extends an existing one and overrides some of its options.
3. Use existing templates as dependencies for other templates using the `requires` option. This allows to create a new template that composes existing templates and renders them into the output directory.

Template definitions are configured in [config](https://vovk.dev/config) under the `clientTemplateDefs` option. By default, this object includes built-in template definitions that become visible if you set [`exposeConfigKeys`](https://vovk.dev/config#exposeConfigKeys) to `true` or, if `exposeConfigKeys` is an array, add `clientTemplateDefs`. You can then inspect `.vovk-schema/_meta.json`, which lists all available template definitions under `config`.

## Example

To make the options in the next section concrete, let’s break down the built-in template definition for the [Rust client](https://vovk.dev/rust). The primary definition is stored under the [rs](#rs) key, which is the template name used in the [segmented client](https://vovk.dev/segmented) or [composed client](https://vovk.dev/composed) configuration.

By itself, the `rs` template doesn’t contain files, so it omits `templatePath`. Instead, it requires:

- the [rsSrc](#rssrc) definition that renders Rust source files to `./src` (relative to `outDir`)
- the [rsPkg](#rspkg) definition that renders Cargo-related files to the root of `outDir`, 
- and the [rsReadme](#rsreadme) definition that renders README files to the root of `outDir`.

 The `rs` template definition also sets a `composedClient` option that overrides the default `outDir` to `dist_rust`, so it isn’t emitted into the `src/client` folder used by the composed [TypeScript](https://vovk.dev/typescript) client.

The [rsSrc](#rssrc) definition uses `templatePath` to point to its template directory (`lib.rs.ejs`, `http_request.rs`, etc.). It `requires` the [schemaJson](#schemajson) template that renders `schema.json`, which combines the full schema from the `.vovk-schema/` folder.

Let's simulate how you would define this setup in your own `vovk.config.mjs` file.

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  clientTemplateDefs: {
    schemaJson: {
      templatePath: `vovk-cli/client-templates/schema-json/`,
    },
    rsSrc: {
      templatePath: `vovk-rust/client-templates/rs-src/`,
      requires: {
        schemaJson: './',
      },
    },
    rsPkg: {
      templatePath: `vovk-rust/client-templates/rs-pkg/`,
    },
    rsReadme: {
      templatePath: `vovk-rust/client-templates/rs-readme/`,
    },
    rs: {
      composedClient: {
        outDir: 'dist_rust',
      },
      requires: {
        rsSrc: './src/',
        rsPkg: './',
        rsReadme: './',
      },
    },
  }
};

export default config;
```

(all paths end with a slash `/` for clarity, though it isn’t required)

This setup allows you to generate the full Cargo package with:

```sh npm2yarn copy
npm exec -- vovk generate --from rs --out ./dist_rust
```

Or generate only the source code with:

```sh
npx vovk generate --from rsSrc --out ./my_rust_project/src
```

Or only the `README.md` file with:

```sh npm2yarn copy
npm exec -- vovk generate --from rsReadme --out ./my_rust_project
```

## Template Definitions

The available options:

### `extends?: string`

Specifies the name of the built-in template this definition extends. Use `extends` to inherit and override options, such as `segmentedClient.outDir`.

### `templatePath?: string`

Path to the template directory, relative to the project root. If omitted, the template can still use [requires](#requires) to include files from other templates.

### `requires?: Record<string, string>`

Other template definitions this template depends on. Keys are template names; values are target paths where those templates will be rendered, relative to the output directory root.

### `composedClient?: object`

Options for the composed client that extend the root `composedClient` options in [config](https://vovk.dev/config). Use this to customize behavior for this template (e.g., `outDir`, `excludeSegments`, etc.).

### `segmentedClient?: object`

Options for the segmented client that extend the root `segmentedClient` options in [config](https://vovk.dev/config). Use this to customize behavior for this template (e.g., `outDir`, `excludeSegments`, etc.).

### `outputConfig?: object`

Overrides `outputConfig` in the root [config](https://vovk.dev/config#outputconfig). Use this to customize the generated client (e.g., `origin`, `openAPIObject`, etc.).

## Built-in Templates

### `ts`

Used as the default template for both the [composed client](https://vovk.dev/composed) and the [segmented client](https://vovk.dev/segmented). Renders TypeScript code.

- `requires` [tsBase](#tsbase), [openapiTs](#openapits).

### `tsBase`

Used as the default template for the [bundle](https://vovk.dev/bundle) as it doesn't include `openapi` object. Renders TypeScript code.

- `templatePath` is `vovk-cli/client-templates/ts-base/`.
- `requires` [schemaTs](#schemats), [mixins](#mixins) (the last one is used conditionally if [OpenAPI mixins](https://vovk.dev/mixins) are used).

### `schemaTs`

Renders the `schema.ts` file that imports the schema of available segments from the `.vovk-schema/` folder and re-exports it as a TypeScript object.

- `templatePath` is `vovk-cli/client-templates/schema-ts/`.

### `schemaJson`

Renders the `schema.json` file that contains the full schema of all segment schemas combined from the `.vovk-schema/` folder for the composed client, or of a single segment schema for the segmented client.

- `templatePath` is `vovk-cli/client-templates/schema-json/`.

### `openapiTs`

Renders the `openapi.ts` file that re-exports the OpenAPI schema located in the `openapi.json` file (provided by the [openapiJson](#openapijson) template) in the same folder.

- `templatePath` is `vovk-cli/client-templates/openapi-ts/`.
- `requires` [openapiJson](#openapijson) template to import the OpenAPI schema in the generated code.

### `openapiJson`

Renders the `openapi.json` file that contains the OpenAPI schema. Can be used separately if you need to provide the OpenAPI schema in your project.

- `templatePath` is `vovk-cli/client-templates/openapi-json/`.

To emit just the `openapi.json` file, without generating a client:

```sh npm2yarn copy
npm exec -- vovk generate --from openapiJson --out ./public
```

### `readme`

Renders the `README.md` file that contains the generated [TypeScript](https://vovk.dev/typescript) client documentation. It's rendered from data provided in the `package.json` file, whose properties can be overridden in the `bundle`, `composedClient`, or `segmentedClient` options in the [config](https://vovk.dev/config) file, at the root level or on the template definition level. Each method is documented as code, providing self-documented code examples for each RPC method that can be copied directly to your codebase.

- `templatePath` is `vovk-cli/client-templates/readme/`.

### `packageJson`

Renders the `package.json` file that makes the generated client ready to be published to NPM. It includes the `name`, `version`, `description`, and `repository` taken from the root `package.json`, and other `package` fields that can be overridden in the `bundle`, `composedClient`, or `segmentedClient` options in the [config](https://vovk.dev/config) file, at the root level or on the template definition level.

- `templatePath` is `vovk-cli/client-templates/package-json/`.

### `mixins`

Generates types and [schema](https://vovk.dev/schema) for [OpenAPI mixins](https://vovk.dev/mixins) when they are present.

- `templatePath` is `vovk-cli/client-templates/mixins/`.

### `rs`

Renders the [Rust](https://vovk.dev/rust) client package that includes both source code and Cargo files.

- `requires` [rsSrc](#rssrc) (rendered to `./src/`), [rsPkg](#rspkg) and [rsReadme](#rsreadme) templates.
- Defines a `composedClient` option to set the output directory to `dist_rust`.

### `rsSrc`

Renders [Rust](https://vovk.dev/rust) client source code files, such as `lib.rs`, `http_request.rs`, etc.

- `templatePath` is `vovk-rust/client-templates/rs-src/`.
- `requires` [schemaJson](#schemajson) template to include the full schema in the generated code.

### `rsPkg`

Renders the `Cargo.toml` file for the Rust client.

- `templatePath` is `vovk-rust/client-templates/rs-pkg/`.

### `rsReadme`

Renders the `README.md` file for the Rust client. Works similarly to the [readme](#readme) template.

- `templatePath` is `vovk-rust/client-templates/rs-readme/`.

### `py`

Renders the Python client package that includes both source code and setup files.

- `requires` [pySrc](#pysrc) (rendered to `./src/[package_name]/`), [pyPkg](#pypkg) and [pyReadme](#pyreadme) templates. `[package_name]` is the package name without `@`, with `/`, `-` and other characters a Python name can't hold turned into `_`: `@acme/web-app` becomes `acme_web_app`. A name that starts with a digit gets a `pkg_` prefix and a Python or Rust keyword a `_pkg` suffix: `3d-viewer` becomes `pkg_3d_viewer`, `class` becomes `class_pkg`. The Rust client's `Cargo.toml` uses the same name.
- Defines a `composedClient` option to set the output directory to `dist_python`.

### `pySrc`

Renders [Python](https://vovk.dev/python) client source code files: `__init__.py`, `api_client.py` and `py.typed`.
- `templatePath` is `vovk-python/client-templates/py-src/`.
- `requires` [schemaJson](#schemajson) template to include the full schema in the generated code.

### `pyPkg`
Renders `pyproject.toml` and `setup.cfg` files for the Python client.
- `templatePath` is `vovk-python/client-templates/py-pkg/`.

### `pyReadme`
Renders the `README.md` file for the Python client. Works similarly to the [readme](#readme) template.
- `templatePath` is `vovk-python/client-templates/py-readme/`.

## Roadmap

- 📝 Describe creation of custom templates.

---

Page: https://vovk.dev/config

# `vovk.config.{js,cjs,mjs}`

The configuration file defines options for the CLI, updates [template definitions](https://vovk.dev/templates), and customizes other settings. In many cases, it’s optional because the CLI can rely on defaults or flags. For more advanced use, creating a config file is recommended.

## Valid Config File Names

The config can be authored as either a CJS or ESM module. It supports the following extensions: **.js**, **.cjs**, **.mjs**, and can live either at the project root or inside the [.config](https://dot-config.github.io/) folder. The CLI checks the following paths in this order and uses the first one that exists (it warns if there are more):

- **.config/vovk.config.cjs**
- **vovk.config.cjs**
- **.config/vovk.config.mjs**
- **vovk.config.mjs**
- **.config/vovk.config.js**
- **vovk.config.js**

When [vovk init](https://vovk.dev/init) runs, it writes **vovk.config.mjs**, inside the **.config** folder if that folder exists.

## Config Options

The configuration extends the `VovkConfig` type from the `vovk` package and exposes the following options:

### `exposeConfigKeys: boolean | string[]`

Controls whether to emit config options to [.vovk-schema/\_meta.json](https://vovk.dev/schema). If `true`, emits all options. If set to an array of strings, emits only the listed options. `rootEntry` is emitted in any case: the generated clients build their URLs from it. Default: `["libs", "rootEntry"]`.

### `clientTemplateDefs: object`

Extends [template definitions](https://vovk.dev/templates#defs) with custom entries that can be used as the `fromTemplates` field in the [composed client](https://vovk.dev/composed) or [segmented client](https://vovk.dev/segmented).

### `composedClient: object`

Overrides configuration for the [composed client](https://vovk.dev/composed), such as [outDir](https://vovk.dev/composed#outdir), [fromTemplates](https://vovk.dev/composed#fromtemplates), [excludeSegments](https://vovk.dev/composed#excludesegments), and more.

### `segmentedClient: object`

Overrides configuration for the [segmented client](https://vovk.dev/segmented), such as [outDir](https://vovk.dev/composed#outdir), [fromTemplates](https://vovk.dev/composed#fromtemplates), [excludeSegments](https://vovk.dev/composed#excludesegments), and more.

### `bundle: object`

Overrides options for the [bundle](https://vovk.dev/bundle), including `excludeSegments` and `build` function to customize the bundler.

### `modulesDir = 'src/modules'`

Path to the directory containing module files. Used by [vovk new](https://vovk.dev/new) to generate modules and by [vovk dev](https://vovk.dev/dev) to watch for module changes.

### `schemaOutDir = '.vovk-schema'`

Directory where the schema is generated. Default: `.vovk-schema`.

### `rootEntry = 'api'`

The root entry point for API routes. By default it is `api`, so routes are served under `/api`, and segment `route.ts` files live in `./src/app/api` (the `src/` directory is optional). To serve the API from the domain root, set it to an empty string `''`. In that case, segments are located in `./src/app`.

### `rootSegmentModulesDirName = ''`

Used exclusively by [vovk new](https://vovk.dev/new) when multiple segments are present. If set to a non-empty string, root-segment modules are created inside a folder with this name. For example, if it’s `"root"`, then running `vovk new controller user` will create **src/modules/root/user/user-controller.ts** instead of **src/modules/user/user-controller.ts** (the root of [modulesDir](#modulesdir)).

### `logLevel = 'info'`

Sets the [log level](https://www.npmjs.com/package/loglevel) for the CLI. Accepted values: `"trace"`, `"debug"`, `"info"`, `"warn"`, `"error"`. Default: `"info"`. Use `"debug"` to see underlying operations (e.g., file watching).

### `devHttps = false`

[Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/What_is_a_progressive_web_app) require HTTPS in both development and production. To enable HTTPS in development, pass `--experimental-https` to `next dev` and enable HTTPS mode for [vovk dev](https://vovk.dev/dev) by setting `devHttps: true` or passing the `--https` flag.

```js filename="/vovk.config.mjs"
const config = {
  // ...
  devHttps: true,
};

export default config;
```

If you prefer not to enable HTTPS by default, create a separate NPM script with the necessary flags:

```json filename="/package.json"
"scripts": {
    "dev-https": "vovk dev --https --next-dev -- --experimental-https",
    "dev": "vovk dev --next-dev",
}
```

### `moduleTemplates: object`

A record of module template names mapped to their paths. Used by [vovk new](https://vovk.dev/new) to define templates for services, controllers, or any other module type.

```js filename="/vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  // ...
  moduleTemplates: {
    state: './module-templates/state.ts.ejs',
    // you can add your own templates here
  },
};
```

You can then generate a module in [modulesDir](#modulesdir):

```sh npm2yarn copy
npm exec -- vovk new state thing # creates src/modules/thing/ThingState.ts
```

```sh npm2yarn copy
npm exec -- vovk new state segment/thing # creates src/modules/segment/thing/ThingState.ts
```

### `libs: object`

A conventional place to define configuration for libraries used by the client—or any configuration you want exposed to the client. For example, it can define options for **vovk-ajv** - the primary client-side validation library, described at the [customization](https://vovk.dev/imports) article.

```js filename="/vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  // ...
  libs: {
    /** @type {import('vovk-ajv').VovkAjvConfig} */
    ajv: {
      options: {
        strict: false,
      },
      target: 'draft-2020-12', // auto-detected by default
    },
  },
};

export default config;
```

If `"libs"` is present in [exposeConfigKeys](#exposeConfigKeys), it is emitted to `.vovk-schema/_meta.json` and can be accessed in multiple ways:

```ts showLineNumbers copy
import { schema, UserRPC } from '@/client';

console.log(schema.meta.config.libs.ajv.options.strict);
console.log(UserRPC.updateUser.fullSchema.meta?.config.libs?.ajv.target);
```

### `outputConfig`

The `outputConfig` object customizes the generated client code by changing [imports](https://vovk.dev/imports), `origin`, or adding [OpenAPI mixins](https://vovk.dev/mixins).

#### `origin: string | null`

Base origin used to generate client URLs. Defaults to `''` (relative URLs). To use absolute URLs, set it to your domain, e.g., `https://example.com`. An `outputConfig` that overrides this one, such as `composedClient.outputConfig`, can set `origin` to `null` or `''` to go back to relative URLs.

#### `package: PackageJson & { py_name?: string; rs_name?: string }`

Used to generate `package.json` (for the [TypeScript client](https://vovk.dev/typescript)), `Cargo.toml` (for the [Rust client](https://vovk.dev/rust)), or `pyproject.toml` (for the [Python client](https://vovk.dev/python)). It also influences `README.md` generation (name, version, description, etc.) and updates code samples to use the proper package name.

By default, Python and Rust package names are derived from `package.name` by converting `kebab-case` to `snake_case`. You can override them using the `py_name` and `rs_name` fields, respectively.

#### `readme: { banner?: string, installCommand?: string, description?: string }`

Customizes the generated `README.md`. Supports a `banner` appended to the top, an `installCommand`, and a `description` that overrides `package.description`.

#### `samples: { apiRoot?: string, headers?: Record<string, string> }`
Customizes generated code samples in `README.md` files and in [Scalar](https://scalar.com/) OpenAPI documentation. Allows the snippet function to explicitly render `apiRoot` and `headers` fields.

#### `openAPIObject: Partial<import('openapi3-ts/oas31').OpenAPIObject>`

Augments the generated OpenAPI schema. You can provide `info`, `servers`, and other fields; they are merged with the auto-generated schema.

#### `reExports: Record<string, string>`

Re-exports variables from other modules. Keys list the identifiers to re-export; values are module paths. Identifiers are placed inside curly braces. A path that starts with `.` is relative to the project root, like the other paths of the config, and is rewritten relative to each generated client's folder; any other value, such as a package name, is kept as is. This is useful when you want to re-export additional items alongside generated RPC modules (including the [bundled](https://vovk.dev/bundle) package).

```js filename="/vovk.config.mjs"
const config = {
  // ...
  outputConfig: {
    reExports: {
      'type MyType': './src/types',
      'MyClass, myFunction': './src/utils',
      'MyComponent as RenamedComponent': './src/components',
      'default as MyDefault': './src/default-export',
    },
  },
};
```

With the client in **src/client**, this is compiled to:

```ts showLineNumbers copy
export { type MyType } from '../types';
export { MyClass, myFunction } from '../utils';
export { MyComponent as RenamedComponent } from '../components';
export { default as MyDefault } from '../default-export';
```

```ts showLineNumbers copy
import { type MyType, MyClass, myFunction, RenamedComponent, MyDefault } from '@/client';
```

When the [segmented](https://vovk.dev/segmented) client is used, top-level `outputConfig.reExports` are applied to the root segment code.

```ts showLineNumbers copy
import { type MyType, MyClass, myFunction, RenamedComponent, MyDefault } from '@/client/root';
```

#### `imports: { fetcher: VovkFetcher, validateOnClient: VovkValidateOnClient }`

Customizes the imports for `fetcher` and `validateOnClient`. See [Imports](https://vovk.dev/imports) for details.

#### `segments`

Configures each segment individually. It accepts the same properties as `outputConfig` (such as `origin`, `package`, `readme`, `samples`, `openAPIObject`, `reExports`, `imports`) and adds a few more, described below.

##### `rootEntry: string | null`

Overrides the entry point for the segment. Useful for [multitenancy](https://vovk.dev/multitenant) to change the root entry from `api` to something else.

##### `segmentNameOverride: string | null`

Overrides the segment name used in generated code. Useful for [multitenancy](https://vovk.dev/multitenant) to change the served path.

##### `openAPIMixin: VovkOpenAPIMixin`

Turns the segment into an OpenAPI mixin, combining the generated client with third-party APIs. See [OpenAPI mixins](https://vovk.dev/mixins) for details.

---

Page: https://vovk.dev/dev

# vovk dev

```sh filename="Quick CLI Ref"
$ npx vovk dev --help

Usage: vovk dev|d [options] [nextArgs...]

Start schema watcher (optional flag --next-dev to start it with Next.js)

Arguments:
  nextArgs              extra arguments for the implicit next dev command call

Options:
  --next-dev            start schema watcher and Next.js with automatic port allocation
  --exit                kill the processes when schema and client are generated
  --schema-out <path>   path to schema output directory (default: .vovk-schema)
  --https, --dev-https  use HTTPS for the dev server (default: false)
  --log-level <level>   set the log level
  -h, --help            display help for command
```

---

The `vovk dev` command runs a watcher that monitors controllers and updates the [schema](https://vovk.dev/schema) and [client](https://vovk.dev/typescript) as needed. It does this by issuing HTTP GET requests to `/api/<segment-name>/_schema_`, where `<segment-name>` is the relevant segment. If the schema has changed, the watcher updates the JSON files and regenerates the client modules.

## How It Works

1. `vovk dev` and `next dev` run together via [concurrently](https://www.npmjs.com/package/concurrently).
2. `vovk dev` watches the **/src/modules** directory (configurable with [`modulesDir`](https://vovk.dev/config#modulesdir)).
3. On change, the script checks whether the file contains a controller and belongs to a [segment](https://vovk.dev/segment) using simple RegExp checks.
4. If it is a controller within a segment, the script requests `/api/<segment-name>/_schema_` to retrieve the updated schema.
5. If the schema differs:
   - If the controller list has changed (added, removed, renamed) or method definitions (including validation) were updated, the script writes the schema to the [.vovk-schema](https://vovk.dev/config#schemaoutdir) directory as `<segment-name>.json`.
   - If the controller list changed, the client is also regenerated. The client imports schema JSON files to initialize the exported library. By default, the [composed client](https://vovk.dev/composed) is generated in `./src/client` (or `./client` without a `src` folder). When the [segmented client](https://vovk.dev/segmented) is enabled, per-segment folders are generated in the same directory.

![vovk dev](devSvg)

Because `vovk dev` is typically used alongside the Next.js dev server, there are two ways to run it, both using [concurrently](https://www.npmjs.com/package/concurrently):

1. **Explicit way**: Preferable if you want minimal abstraction. The downside is that you must set `PORT` explicitly:

```sh
PORT=3000 npx concurrently 'vovk dev' 'next dev' --kill-others
```

You can pass Next.js flags as usual:

```sh
PORT=3000 npx concurrently 'vovk dev --https' 'next dev --experimental-https --turbo' --kill-others
```

2. **Implicit way**: Ports are assigned automatically. The script checks whether port 3000 (by default) is in use and selects the next available port:

```sh
npx vovk dev --next-dev
```

To pass flags to `next dev`, append them after `--`:

```sh
npx vovk dev --https --next-dev -- --experimental-https --turbo
```

A port passed this way (`-p 4000` or `--port 4000`) is used instead of the automatic one, for Next.js and for the schema requests.

Internally, the implicit mode uses the concurrently API, making both approaches nearly identical.

Read more about [HTTPS in development](https://vovk.dev/config#devhttps).

## Run and Exit

Use the `--exit` flag to terminate the processes started by `vovk dev` after the schema and client are generated. This is useful for one-off runs without keeping the watcher active.

```sh
npx vovk dev --next-dev --exit
```

The command exits with code 1 when a segment's schema can't be fetched after 5 retries or the client fails to generate.

For convenience, add a dedicated script in `package.json`:

```json
{
  "scripts": {
    // ...
    "dev-exit": "vovk dev --next-dev --exit",
    // or
    "dev-exit": "cross-env PORT=3000 concurrently \"vovk dev --exit\" \"next dev\" --kill-others"
  }
}
```

---

Page: https://vovk.dev/bundle

# TypeScript Bundle

```sh filename="Quick CLI Ref"
$ npx vovk bundle --help

Usage: vovk bundle|b [options]

Generate TypeScript RPC and bundle it

Options:
  --out, --out-dir <path>                                      path to output directory for bundle
  --include, --include-segments <segments...>                  include segments
  --exclude, --exclude-segments <segments...>                  exclude segments
  --prebundle-out, --prebundle-out-dir <path>                  path to output directory for prebundle
  --keep-prebundle-dir                                         do not delete prebundle directory after bundling
  --schema, --schema-path <path>                               path to schema folder (default: .vovk-schema)
  --config, --config-path <config>                             path to config file
  --origin <url>                                               set the origin URL for the generated client
  --openapi, --openapi-spec <openapi_path_or_urls...>          use OpenAPI mixins for client generation
  --openapi-module-name, --openapi-get-module-name <names...>  module name strategies corresponding to the index of --openapi option
  --openapi-method-name, --openapi-get-method-name <names...>  method name strategies corresponding to the index of --openapi option
  --openapi-root-url <urls...>                                 root URLs corresponding to the index of --openapi option
  --openapi-mixin-name <names...>                              mixin names corresponding to the index of --openapi option
  --openapi-fallback <paths...>                                save OpenAPI spec corresponding to the index of --openapi option to a local file and use it as a fallback if URL is not available
  --log-level <level>                                          set the log level
  -h, --help                                                   display help for command
```

---

The [composed](https://vovk.dev/composed) [TypeScript Client](https://vovk.dev/typescript) library can be bundled and published to NPM as a package with pre-filled `package.json` and `README.md` files by using the `bundle` command after you configure the `bundle.build` function in the [config](https://vovk.dev/config) file.

Check the ["Hello World" page](https://vovk.dev/hello-world) for a complete bundling example.

This feature is library-agnostic, so you can use any bundler you prefer, including one invoked via the `child_process` module. At the moment, [tsdown](https://tsdown.dev/) is the only bundler that has been tested with Vovk.ts. If you use a different bundler, please share your experience on [GitHub Discussions](https://github.com/finom/vovk/discussions).

Internally, bundling runs the following steps:

1. It generates a client into the `tmp_prebundle` directory (configured with `bundle.prebundleOutDir: string{:ts}`) using the [tsBase](https://vovk.dev/templates#tsbase) template.
2. Calls `bundle.build` function to bundle the generated client to the `dist` directory (configured with `bundle.outDir: string{:ts}`).
3. Generates `package.json` and `README.md` files from the [packageJson](https://vovk.dev/templates#packagejson) and [readme](https://vovk.dev/templates#readme) templates, for the same segments and [OpenAPI mixins](https://vovk.dev/mixins) as the bundled code.
4. Deletes the `tmp_prebundle` directory (configured with `bundle.keepPrebundleDir: boolean{:ts}`).

```sh npm2yarn copy
npm exec -- vovk bundle
```

After bundling, the package can be published to NPM:

```sh npm2yarn copy
npm publish dist
```

## Configuring the `bundle`

You can configure bundling by adding a `bundle` object to the [config](https://vovk.dev/config) file:

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  bundle: {
    build: async ({ entry, outDir, prebundleDir }) => {
      // plug in the bundler of your choice here
    },
    prebundleOutDir: 'tmp_prebundle', // default
    keepPrebundleDir: false, // default
    outDir: 'dist', // default
    requires: {
      readme: '.', // default
      packageJson: '.', // default
      myTemplate: './foo', // custom template
    },
    excludeSegments: ['admin'], // or includeSegments, not both
    outputConfig: {
      origin: 'https://example.com',
      package: {
        // modifies package.json content
        // by default uses values from the root package.json
        name: 'my-api-bundle',
        // entry point configuration
        type: 'module',
        main: './index.js',
        types: './index.d.ts',
        exports: {
          '.': {
            types: './index.d.ts',
            default: './index.js',
          },
        },
      },
      readme: {}, // modifies README.md content
      samples: {}, // modifies README.md samples content
      imports: {
        fetcher: './src/my-fetcher',
      },
      reExports: {}, // modifies re-exports in the generated index.ts
    },
  },
};
export default config;
```

### `build` function (required)

The `build` function is an asynchronous function that receives an object with `entry` (the `index.ts` file), `outDir`, and `prebundleDir`, all resolved as absolute paths.

### `prebundleOutDir` or `--prebundle-out` flag

The `prebundleOutDir` is the directory in which the TypeScript client will be generated before bundling. It defaults to `tmp_prebundle`.

The directory must be a subdirectory of the project, apart from `outDir`. Unless it is kept, it is deleted after bundling, so it must be missing, empty or kept by an earlier bundle: the command fails before it writes anything if the directory holds other files.

### `keepPrebundleDir` or `--keep-prebundle-dir` flag

If set to `true`, the `prebundleOutDir` will not be deleted after bundling, so it may hold other files, such as the composed client. This can be useful for debugging or other purposes. The default is `false`.

### `requires`

The templates rendered into `outDir` after the build, keyed by [template](https://vovk.dev/templates) name, with the path relative to `outDir`. The default is `{ readme: '.', packageJson: '.' }`. A `requires` object in the config replaces the default, so list `readme` and `packageJson` along with your own templates to keep them.

### `includeSegments` and `excludeSegments` or `--include` and `--exclude` flags

The segments to bundle. Use one of the two. Without either, the bundle follows the `includeSegments` or `excludeSegments` of the [composed client](https://vovk.dev/composed).

### `outputConfig`

The `outputConfig` object accepts and overrides the same options as the [outputConfig](https://vovk.dev/config#outputconfig) at the root of the [config](https://vovk.dev/config) file.

For correct generation, the `outputConfig` should provide an `origin` option as well as a `package` field that includes entry point configuration: `main`, `types`, and `exports`, which should be set according to the bundler output.

```ts showLineNumbers copy filename="vovk.config.mjs"
const config = {
  // ...
  bundle: {
    outputConfig: {
      origin: 'https://example.com',
      package: {
        main: './index.js',
        types: './index.d.ts',
        exports: {
          '.': {
            types: './index.d.ts',
            default: './index.js',
          },
        },
      },
    },
  },
};
```

You can also include additional exports in the generated `index.ts` file using the `reExports` option:

```ts showLineNumbers copy filename="vovk.config.mjs"
const config = {
  // ...
  bundle: {
    outputConfig: {
      reExports: {
        'doSomething': './src/utils',
      },
    },
  },
};
```

In order to keep the bundle size minimal, consider disabling client-side validation by setting `validateOnClient` to `null` in the `imports` option:

```ts showLineNumbers copy filename="vovk.config.mjs"
const config = {
  // ...
  bundle: {
    outputConfig: {
      imports: {
        validateOnClient: null,
      },
    },
  },
};
```

## Bundling with tsdown (Experimental)

> [!IMPORTANT]
>
> The tsdown API may introduce breaking changes between minor versions. The configuration below has been tested and validated with **tsdown@0.22.14**. If you encounter issues after upgrading, please pin this version until compatibility with newer releases is confirmed.

Install `tsdown` as a development dependency:

```sh npm2yarn copy
npm install --save-dev tsdown@0.22.14
```

Add the following `build` function to the `bundle` object in the [config](https://vovk.dev/config) file:

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  bundle: {
    build: async ({ entry, outDir }) => {
      const { build } = await import('tsdown');
      await build({
        entry,
        dts: true,
        format: 'esm',
        hash: false,
        fixedExtension: true,
        clean: true,
        outDir,
        platform: 'neutral',
        outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
        outputOptions: {
          codeSplitting: false,
        },
        inputOptions: {
          resolve: {
            mainFields: ['module', 'main'],
          },
        },
        deps: { alwaysBundle: ['!next/**'] },
      });
    },
    // ...
  },
};
export default config;
```

With the configuration above, the resulting bundled package will have the following structure:

```
dist/
  package.json
  README.md
  index.js
  index.d.ts
```

The full configuration with `origin`, `package`, and no client-side validation might look like this:

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  bundle: {
    build: async ({ entry, outDir }) => {
      const { build } = await import('tsdown');
      await build({
        entry,
        dts: true,
        format: 'esm',
        hash: false,
        fixedExtension: true,
        clean: true,
        outDir,
        platform: 'neutral',
        outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
        outputOptions: {
          codeSplitting: false,
        },
        inputOptions: {
          resolve: {
            mainFields: ['module', 'main'],
          },
        },
        deps: { alwaysBundle: ['!next/**'] },
      });
    },
    outputConfig: {
      origin: 'https://example.com',
      package: {
        main: './index.js',
        types: './index.d.ts',
        exports: {
          '.': {
            types: './index.d.ts',
            default: './index.js',
          },
        },
      },
      imports: {
        validateOnClient: null,
      },
    },
  },
};
export default config;
```

For different tsdown configurations, please refer to the [tsdown documentation](https://tsdown.dev/reference/api/Interface.UserConfig).

## Using the Bundled Package

After publishing the bundled package to NPM, you can install and use it in other projects like any other NPM package:

```sh npm2yarn copy
npm install my-api-bundle
```

And import it in your TypeScript code:

```ts showLineNumbers copy
import { UserRPC } from 'my-api-bundle';

await UserRPC.getUser({
  params: { id: '123' },
});
```

All features described in the [TypeScript](https://vovk.dev/typescript) article remain available to the bundled RPC modules.

The [Schema](https://vovk.dev/schema) is available via the `schema` import, as well as a property on every method individually:

```ts showLineNumbers copy
import { schema, UserRPC } from 'my-api-bundle';

console.log(schema.segments[''].controllers.UserRPC.handlers.getUser.validation.params);
console.log(UserRPC.getUser.schema.validation?.params);
```

Note that the `openapi` object that is usually available from **@/client/openapi** is not bundled, as it would significantly increase the package size. The `schema` module that is usually available from **@/client/schema** is also omitted to keep the bundling flow simple by using only a single entry point.

---

The bundled methods can be used as [AI tools](https://vovk.dev/tools) that will invoke the corresponding HTTP endpoints when called:

```ts showLineNumbers copy
import { UserRPC } from 'my-api-bundle';
import { deriveTools } from 'vovk';

const tools = deriveTools({
  modules: { UserRPC },
});
```

## Roadmap/bugs

- 🐞 Type inference from `NextResponse` outputs is not available without the **next** package installed (see [proposal](https://github.com/vercel/next.js/discussions/88542)). For dynamic response headers, use the `Response` class instead, with manual type casting.
- ✨ Test and document other bundlers, such as **tsup** and **esbuild**.
- ✨ Segmented bundle — create separate bundles for each segment.

---

Page: https://vovk.dev/generate

# vovk generate

```sh filename="Quick CLI Ref"
$ npx vovk generate --help

Usage: vovk generate|g [options]

Generate RPC client from schema

Options:
  --composed-only                                              generate only composed client even if segmented client is enabled
  --out, --composed-out <path>                                 path to output directory for composed client
  --from, --composed-from <templates...>                       client template names for composed client
  --include, --composed-include-segments <segments...>         include segments in composed client
  --exclude, --composed-exclude-segments <segments...>         exclude segments in composed client
  --segmented-only                                             generate only segmented client even if composed client is enabled
  --segmented-out <path>                                       path to output directory for segmented client
  --segmented-from <templates...>                              client template names for segmented client
  --segmented-include-segments <segments...>                   include segments in segmented client
  --segmented-exclude-segments <segments...>                   exclude segments in segmented client
  --prettify                                                   prettify output files
  --force                                                      replace files at the output paths that vovk-cli did not generate
  --schema, --schema-path <path>                               path to schema folder (default: ./.vovk-schema)
  --config, --config-path <config>                             path to config file
  --origin <url>                                               set the origin URL for the generated client
  --watch [s]                                                  watch for changes in schema or openapi spec and regenerate client; accepts a number in seconds to throttle the watcher or
                                                               make an HTTP request to the OpenAPI spec URLs
  --openapi, --openapi-spec <openapi_path_or_urls...>          use OpenAPI mixins for client generation
  --openapi-module-name, --openapi-get-module-name <names...>  module name strategies corresponding to the index of --openapi option
  --openapi-method-name, --openapi-get-method-name <names...>  method name strategies corresponding to the index of --openapi option
  --openapi-root-url <urls...>                                 root URLs corresponding to the index of --openapi option
  --openapi-mixin-name <names...>                              mixin names corresponding to the index of --openapi option
  --openapi-fallback <paths...>                                save OpenAPI spec corresponding to the index of --openapi option to a local file and use it as a fallback if URL is not
                                                               available
  --log-level <level>                                          set the log level
  -h, --help                                                   display help for command
```

The `vovk generate` command creates [TypeScript](https://vovk.dev/typescript), [Rust](https://vovk.dev/rust), and [Python](https://vovk.dev/python) clients from existing [schema](https://vovk.dev/schema) files and from [OpenAPI mixins](https://vovk.dev/mixins) declared in the [config](https://vovk.dev/config). Relevant configuration spans several options and documentation pages, including:

- `composedClient`: settings for the [composed client](https://vovk.dev/composed), including the output directory, included/excluded segments, and [templates](https://vovk.dev/templates).
- `segmentedClient`: settings for the [segmented client](https://vovk.dev/segmented), including the output directory, included/excluded segments, and [templates](https://vovk.dev/templates).
- `outputConfig`: options to configure `origin`, [imports](https://vovk.dev/imports), [OpenAPI mixins](https://vovk.dev/mixins), and more.
- `clientTemplateDefs`: definitions of available [templates](https://vovk.dev/templates).

See the [config](https://vovk.dev/config) page for details.

In a Next.js project, a segment whose route file is gone while its schema file remains is left out of the client, with a warning; delete the schema file once the segment is removed.

## Available Flags

### Composed Client Flags

- `--composed-only` — generate only the composed client, even if the segmented client is enabled.
- `--out`, `--composed-out ` — override `composedClient.outDir`.
- `--from`, `--composed-from <templates...>` — override `composedClient.fromTemplates`.
- `--include`, `--composed-include-segments <segments...>` — override `composedClient.includeSegments`.
- `--exclude`, `--composed-exclude-segments <segments...>` — override `composedClient.excludeSegments`.

### Segmented Client Flags

- `--segmented-only` — generate only the segmented client, even if the composed client is enabled.
- `--segmented-out ` — override `segmentedClient.outDir`.
- `--segmented-from <templates...>` — override `segmentedClient.fromTemplates`.
- `--segmented-include-segments <segments...>` — override `segmentedClient.includeSegments`.
- `--segmented-exclude-segments <segments...>` — override `segmentedClient.excludeSegments`.

### OpenAPI mixin Flags

Mixins extend the sclient declared in one or more OpenAPI specs. See [OpenAPI mixins](https://vovk.dev/mixins).

- `--openapi`, `--openapi-spec <openapi_path_or_urls...>` — use one or more OpenAPI specs (local paths or URLs). For URLs, the command fetches the spec via HTTP GET. Mirrors `outputConfig.segments.mixinName.openAPIMixin.source.url` (remote) or `.source.file` (local).
- `--openapi-module-name`, `--openapi-get-module-name <names...>` — module names aligned by index with `--openapi`. Mirrors `outputConfig.segments.mixinName.openAPIMixin.getModuleName`. Without it, a module is named after its mixin (`--openapi-mixin-name petstore` gives `petstore`), and mixins without a name give `api`, `api2`, …
- `--openapi-method-name`, `--openapi-get-method-name <names...>` — method names aligned by index with `--openapi`. Mirrors `outputConfig.segments.mixinName.openAPIMixin.getMethodName`.
- `--openapi-root-url <urls...>` — root URLs aligned by index with `--openapi`. Mirrors `outputConfig.segments.mixinName.openAPIMixin.apiRoot`.
- `--openapi-mixin-name <names...>` — mixin names aligned by index with `--openapi`, `mixin`, `mixin2`, … by default. In config, serves as the key in `outputConfig.segments` and defines pseudo-segment names for the mixins.
- `--openapi-fallback <paths...>` — save OpenAPI specs to the specified paths and use them as a fallback if the URL is unavailable. Paths align by index with `--openapi`.
- `--watch ` — generate the client on start, then watch the schema or OpenAPI spec and regenerate it. Accepts a throttle interval in seconds. For remote specs, performs an HTTP request every `s` seconds; for local files, regenerates on change, once the changed file has stayed the same size for 300 ms.

### Other Flags

- `--prettify` — prettify output files with [Prettier](https://prettier.io/). Mirrors `composedClient.prettifyClient` and `segmentedClient.prettifyClient`.
- `--force` — replace files at the output paths that vovk-cli did not generate. Without it, the command writes nothing and names those files. A file counts as generated when its first line is the `Generated by vovk-cli` banner; a JSON file, which can't hold one, when it sits beside a file with the banner. Files that a template copies as they are, or renders without the banner, are replaced either way.
- `--schema`, `--schema-path ` — override the schema folder defined by `schemaOutDir`.
- `--config`, `--config-path ` — override the config file path. By default, all supported filenames are checked; a warning is shown if multiple are found.
- `--origin ` — override `outputConfig.origin`.
- `--log-level ` — set log level: `trace`, `debug`, `info`, `warn`, `error`, `silent` (default: `info`).
- `-h, --help` — show help.

---

Page: https://vovk.dev/init

# vovk init

```sh filename="Quick CLI Ref"
$ npx vovk init --help

Usage: vovk init [options]

Initialize Vovk.ts in an existing Next.js project

Options:
  --prefix <prefix>               directory to initialize project in
  -y, --yes                       skip all prompts and use default values
  --log-level <level>             set log level (default: "info")
  --use-npm                       use npm as package manager
  --use-yarn                      use yarn as package manager
  --use-pnpm                      use pnpm as package manager
  --use-bun                       use bun as package manager
  --skip-install                  skip installing dependencies
  --update-ts-config              update tsconfig.json
  --update-scripts <mode>         update package.json scripts ("implicit" or "explicit")
  --bundle                        set up "tsdown" bundler
  --lang <languages...>           generate client for other programming languages by default ("py" for Python and "rs" for Rust are
                                  supported)
  --validation-library <library>  validation library to use ("zod", "valibot", "arktype"); set to "none" to skip
  --channel <channel>             channel to use for fetching packages (default: "latest")
  --dry-run                       do not write files to disk
  -h, --help                      display help for command
```

---

The `init` command sets up Vovk.ts in an existing Next.js project. It applies the required configuration and installs the necessary dependencies.

```sh npm2yarn copy
npx vovk-cli init
```

In a project that already has a [config](https://vovk.dev/config), `init` asks before it reinitializes the project (`--yes` doesn't ask). An existing config that differs from the new one is kept as a backup next to it, for example **vovk.config.mjs.bak**, so you can move your settings over.

## Available Flags

### `--prefix `

Directory to initialize the project in. Defaults to the current directory.

### `-y, --yes`

Skips prompts and uses default values.

### `--log-level `

Sets the log level: `trace`, `debug`, `info`, `warn`, `error`, `silent`. Default: `info`.

### `--use-npm`, `--use-yarn`, `--use-pnpm`, `--use-bun`

Choose the package manager for installing dependencies to skip auto-detection. Without these flags, `init` takes the `packageManager` field of **package.json**, then the project's lockfile (**pnpm-lock.yaml**, **yarn.lock**, **bun.lock**, **package-lock.json**), then the package manager that runs it (`pnpm dlx`, `yarn dlx`, `bunx`), and npm otherwise.

### `--skip-install`

Skips installing dependencies but still updates `package.json`.

### `--update-ts-config`

Updates `tsconfig.json` with settings needed for Vovk.ts, such as `experimentalDecorators`.

### `--update-scripts `

Updates `package.json` scripts to run Next.js and Vovk.ts together. Modes:

- `implicit` — runs the concurrently API under the hood. It fits a `dev` script that is `next dev` with flags. A `dev` script that runs more, such as `prisma generate && next dev`, gets the `explicit` form.
- `explicit` — uses the `concurrently` CLI: `cross-env PORT=3000 concurrently "next dev" "vovk dev" --kill-others`. [cross-env](https://www.npmjs.com/package/cross-env) and double quotes let the script run on Windows too. `PORT` is the port from `next dev -p` when the old script has one.

The flag also sets `prebuild` to run `vovk generate` before `next build` to ensure the client is generated before building. Yarn 2+ doesn't run `pre` scripts, so there it puts `vovk generate` at the start of `build` instead: `vovk generate && next build`. With `--bundle`, it adds a `bundle` script that runs `vovk bundle`. An existing `prebuild` or `bundle` script is kept, and the command is chained after it, for example `prisma generate && vovk generate`.

### `--bundle`

Sets up [tsdown](https://tsdown.dev/) to [bundle](https://vovk.dev/bundle) the TypeScript client: adds it to `devDependencies` and a `bundle.build` function to the config.

### `--lang <languages...>`

Generates clients for additional languages. Sets [`composedClient.fromTemplates`](https://vovk.dev/composed#fromtemplates) to include "py" (Python) and "rs" (Rust).

### `--validation-library `

Selects a validation library: "zod", "valibot", "arktype", or "none" to set up validation later.

### `--channel `

Specifies the package channel (default: "latest").

- `latest` for stable releases.
- `beta` for beta releases (tested but might introduce breaking changes without notice).

Run the CLI from the same channel:

```sh npm2yarn copy
npx vovk-cli@beta init --channel beta
```

A Vovk.ts package with no release on the channel, such as **vovk-ajv** without a beta, is added at its `latest` version.

### `--dry-run`

Shows actions without writing files.

### `-h, --help`

Displays help.

---

Page: https://vovk.dev/new

# vovk new

```sh filename="Quick CLI Ref"
npx vovk-cli new --help
Usage: vovk new|n [options] [components...]

Create new components. "vovk new [...components] [segmentName/]moduleName" to create a new module or "vovk
new segment [segmentName]" to create a new segment

Options:
  -o, --overwrite                         overwrite existing files
  --static                                (new segment only) if the segment is static
  --template, --templates <templates...>  (new module only) override config template; accepts an array of
                                          strings that correspond to the order of the components
  --out, --out-dir <dirname>              (new module only) override outDir in template file; relative to the
                                          root of the project
  --no-segment-update                     (new module only) do not update segment files when creating a new
                                          module
  --empty                                 (new module only) create an empty module
  --dry-run                               do not write files to disk
  --log-level <level>                     set the log level
  -h, --help                              display help for command
```

The `vovk new` command creates [segments](https://vovk.dev/segment) and modules (such as controllers, services, or custom modules). It uses the `moduleTemplates` option from the [config](https://vovk.dev/config) and can be extended with your own templates. It combines two workflows in one: `vovk new segment [segment_name]` and `vovk new [module] [module_name_singular]`.

## vovk new segment

![vovk new segment](newSegmentSvg)

### Root Segment

```sh npm2yarn copy
npm exec -- vovk new segment
```

If you run `vovk new segment` without an argument, it creates a root segment at **/src/app/api/[[...vovk]]/route.ts** (formatted with [Prettier](https://www.npmjs.com/package/prettier)). The `segmentName` option of `initSegment` is an empty string and can be omitted. The generated file contains:

```ts showLineNumbers copy
import { initSegment } from 'vovk';

const controllers = {};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
});
```

When you run `vovk dev`, the segment emits a schema at **.vovk-schema/root.json**.

The segment exposes an API at **/api/...**.

Root segments can be used alongside nested segments of any depth.

### Nested Segment

```sh npm2yarn copy
npm exec -- vovk new segment foo
```

Running `vovk new segment foo` creates **/src/app/api/foo/[[...vovk]]/route.ts** (formatted with Prettier). The generated file includes:

```ts showLineNumbers copy
// ...
export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'foo',
  emitSchema: true,
  controllers,
});
```

When you run `vovk dev`, the segment emits a schema at **.vovk-schema/foo.json**.

The segment exposes an API at **/api/foo/...**.

---

`vovk new segment foo/bar/baz` creates a nested segment at **/src/app/api/foo/bar/baz/[[...vovk]]/route.ts**, available at **/api/foo/bar/baz/...**. Here, `segmentName` is `"foo/bar/baz"`.

## vovk new [module] [name]

![vovk new module](newModuleSvg)

```sh npm2yarn copy
npm exec -- vovk new controller service foo/user
```

`vovk new` (with anything other than `segment`) creates new modules in **/src/modules** (formatted with Prettier).

Command structure:

- `npx vovk new` — the command.
- Components — the module types to create (`controller`, `service`, or a custom module).
- Module name (singular) with optional segment prefix: `foo/user` creates a module in **/src/modules/foo/user/** and updates the `foo` segment. Omit the segment to target the root:

```sh npm2yarn copy
npm exec -- vovk new controller service user
```

When you create a controller with `vovk new`, the script updates the `controllers` list in the segment file and modifies `route.ts` using [AST](https://www.npmjs.com/package/ts-morph).

If one of the module's files already exists, `vovk new` writes none of them, unless you pass `--overwrite`. The module name has to start with a letter, since the templates turn it into class and method names.

Template paths are defined via `moduleTemplates` in the [config](https://vovk.dev/config):

```js filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  moduleTemplates: {
    controller: 'vovk-cli/module-templates/type/controller.ts.ejs',
    service: 'vovk-cli/module-templates/type/service.ts.ejs',
    state: './my-templates/state.ts.ejs',
  },
};

export default config;
```

`npx vovk new controller state user` creates **user-controller.ts** and **user-state.ts** in **/src/modules/user** and updates the root segment with the new controller.

### Built-in Module Templates

The built-in templates cover standard CRUD operations for controllers and services, including methods like `get`, `list`, `create`, `update`, and `delete`.

[vovk init](https://vovk.dev/init) sets up a Vovk.ts project with the corresponding templates defined in the [config](https://vovk.dev/config). More specifically:

- Zod controller template: [vovk-cli/module-templates/zod/controller.ts.ejs](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/zod/controller.ts.ejs)
- Arktype controller template: [vovk-cli/module-templates/arktype/controller.ts.ejs](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/arktype/controller.ts.ejs)
- Valibot controller template: [vovk-cli/module-templates/valibot/controller.ts.ejs](https://github.com/finom/vovk/tree/main/packages/vovk-cli/module-templates/valibot/controller.ts.ejs)
- When no library is selected, it uses the validation-agnostic template [vovk-cli/module-templates/type/controller.ts.ejs](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/type/controller.ts.ejs).
- Service template is used regardless of the validation library: [vovk-cli/module-templates/type/service.ts.ejs](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/type/service.ts.ejs).

The controller and the service these templates write infer types from each other, which needs TypeScript 5.5+.

### Shortcuts

Controllers and services can be created with shortcuts:

```sh
npx vovk n c s user
```

Which is equivalent to:

```sh
npx vovk new controller service user
```

### Custom Module Templates

A module template is created with `.ts.ejs` extension. It uses [EJS](https://ejs.co/) syntax to generate code and [gray-matter](https://www.npmjs.com/package/gray-matter) frontmatter to define metadata in YAML format. 

#### Module Template Metadata

The metadata supports the following fields:

- `outDir: string` — output directory relative to the project root. A ejs variable `t.defaultOutDir` is available, which points to **/src/modules/[segmentName/]moduleName/**.
- `fileName: string` — output file name. 
- `sourceName: string` — a controller name (applicable to controllers only); used to update the `controllers` list in the segment file
- `compiledName: string` — an RPC module name (applicable to controllers only); used to define the name of the compiled module in the generated client.

#### Module Template Variables

Available variables are passed to the EJS template via the `t` object:

- `t.defaultOutDir: string` — default output directory for the module.
- `t.config: VovkConfig` — the Vovk.ts config.
- `t.segmentName: string` — the segment name (empty string for the root segment).
- `t.withService: boolean` — whether a service module is being created alongside the controller.
- `t.nodeNextResolutionExt: { ts: string; js: string; mjs: string; cjs: string }` — file extension based on the `moduleResolution` in `tsconfig.json`. The object will contain extension values corresponding to the keys, such as `.ts`/`.js`/`.mjs`/`.cjs` for `'node16'` and `'nodenext'` and empty strings for other cases.
- `t.TheThing`, `t.TheThings` — module name and pluralized module name in PascalCase (e.g., `UserCart`, `UserCarts`).
- `t.theThing`, `t.theThings` — module name and pluralized module name in camelCase (e.g., `userCart`, `userCarts`).
- `t['the-thing']`, `t['the-things']` — module name and pluralized module name in kebab-case (e.g., `user-cart`, `user-carts`).
- `t.THE_THING`, `t.THE_THINGS` — module name and pluralized module name in SCREAMING_SNAKE_CASE (e.g., `USER_CART`, `USER_CARTS`).
- `t._` - Lodash library instance for utility functions.
- `t.pluralize` - Pluralize function from the `pluralize` package.

#### Controller & Service Template Example

Here is an example of a module template for an Arktype-based controller and service. For code clarity, internal variables are defined in `vars` object.

```ejs filename="packages/vovk-cli/module-templates/arktype/controller.ts.ejs" source=".">
<% const vars = { 
  ModuleName: t.TheThing + 'Controller',
  ServiceName: t.TheThing + 'Service',
}; %>
---
outDir: <%= t.defaultOutDir %>
fileName: <%= t['the-thing'] + '-controller.ts' %>
sourceName: <%= vars.ModuleName %>
compiledName: <%= t.TheThing + 'RPC' %>
---

import { procedure, prefix, get, put, post, del, operation } from 'vovk';
import { type } from 'arktype';
<% if(t.withService) { %>
import <%= vars.ServiceName %> from './<%= t['the-thing'] %>-service<%= t.nodeNextResolutionExt.ts %>';
<% } %>

@prefix('<%= t['the-things'] %>')
export default class <%= vars.ModuleName %> {
    @operation({
      summary: 'Get <%= t.theThings %>',
    })
    @get()
    static get<%= t.TheThings %> = procedure().handle(() => {
        <% if(t.withService) { %>
        return <%= vars.ServiceName %>.get<%= t.TheThings %>();
        <% } else { %>
        return { message: 'TODO: get <%= t.theThings %>' };
        <% } %>
    });

    @operation({
      summary: 'Get single <%= t.theThing %>',
    })
    @get('{id}')
    static getSingle<%= t.TheThing %> = procedure({
        params: type({ id: type('string') }),
    }).handle((_req, { id }) => {
        <% if(t.withService) { %>
        return <%= vars.ServiceName %>.getSingle<%= t.TheThing %>(id);
        <% } else { %>
        return { message: 'TODO: get single <%= t.theThing %>', id };
        <% } %>
    });

    @operation({
        summary: 'Update <%= t.theThing %>',
    })
    @put('{id}')
    static update<%= t.TheThing %> = procedure({
        body: type({ todo: type('true') }),
        params: type({ id: type('string') }),
    }).handle(async (req, { id }) => {
        const body = await req.json();
        <% if(t.withService) { %>
        return <%= vars.ServiceName %>.update<%= t.TheThing %>(id, body);
        <% } else { %>
        return { message: `TODO: update <%= t.theThing %>`, id, body };
        <% } %>
    });

    @operation({
      summary: 'Create <%= t.theThing %>',
    })
    @post()
    static create<%= t.TheThing %> = procedure({
        body: type({ todo: type('true') }),
    }).handle(async (req) => {
        const body = await req.json();
        <% if(t.withService) { %>
        return <%= vars.ServiceName %>.create<%= t.TheThing %>(body);
        <% } else { %>
        return { message: `TODO: create <%= t.theThing %>`, body };
        <% } %>
    });

    @operation({
      summary: 'Delete <%= t.theThing %>',
    })
    @del('{id}')
    static delete<%= t.TheThing %> = procedure({
        params: type({ id: type('string') }),
    }).handle((_req, { id }) => {
        <% if(t.withService) { %>
        return <%= vars.ServiceName %>.delete<%= t.TheThing %>(id);
        <% } else { %>
        return { message: `TODO: delete <%= t.theThing %>`, id };
        <% } %>
    });
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/arktype/controller.ts.ejs)*

```ejs filename="packages/vovk-cli/module-templates/type/service.ts.ejs" source=".">
<% const vars = {
  ControllerName: t.TheThing + 'Controller',
  ServiceName: t.TheThing + 'Service',
}; %>
---
outDir: <%= t.defaultOutDir %>
fileName: <%= t['the-thing'] + '-service.ts' %>
sourceName: <%= vars.ServiceName %>
---

import type { VovkBody, VovkParams } from 'vovk';
import type <%= vars.ControllerName %> from './<%= t['the-thing'] %>-controller<%= t.nodeNextResolutionExt.ts %>';

export default class <%= vars.ServiceName %> {
  static get<%= t.TheThings %> = () => {
    return { message: 'TODO: get <%= t.theThings %>' };
  };

  static getSingle<%= t.TheThing %> = (
    id: VovkParams<typeof <%= vars.ControllerName %>.getSingle<%= t.TheThing %>>['id']
  ) => {
    return { message: 'TODO: get single <%= t.theThing %>', id };
  }

  static update<%= t.TheThing %> = (
    id: VovkParams<typeof <%= vars.ControllerName %>.update<%= t.TheThing %>>['id'],
    body: VovkBody<typeof <%= vars.ControllerName %>.update<%= t.TheThing %>>
  ) => {
    return { message: `TODO: update <%= t.theThing %>`, id, body };
  };

  static create<%= t.TheThing %> = (
    body: VovkBody<typeof <%= vars.ControllerName %>.create<%= t.TheThing %>>
  ) => {
    return { message: `TODO: create <%= t.theThing %>`, body };
  };

  static delete<%= t.TheThing %> = (
    id: VovkParams<typeof <%= vars.ControllerName %>.delete<%= t.TheThing %>>['id']
  ) => {
    return { message: `TODO: delete <%= t.theThing %>`, id };
  };
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/type/service.ts.ejs)*

When you run:

```sh npm2yarn copy
npm exec -- vovk new controller service userCart
```

It creates **user-cart-controller.ts** and **user-cart-service.ts** in **/src/modules/user-cart/** and updates the root segment with the new controller.

```ts showLineNumbers copy filename="src/modules/user-cart/user-cart-controller.ts"
import { procedure, prefix, get, put, post, del, operation } from 'vovk';
import { type } from 'arktype';
import UserCartService from './user-cart-service';

@prefix('user-carts')
export default class UserCartController {
  @operation({
    summary: 'Get userCarts',
  })
  @get()
  static getUserCarts = procedure().handle(() => {
    return UserCartService.getUserCarts();
  });
  @operation({
    summary: 'Get single userCart',
  })
  @get('{id}')
  static getSingleUserCart = procedure({
    params: type({ id: type('string') }),
  }).handle((_req, { id }) => {
    return UserCartService.getSingleUserCart(id);
  });
  @operation({
    summary: 'Update userCart',
  })
  @put('{id}')
  static updateUserCart = procedure({
    body: type({ todo: type('true') }),
    params: type({ id: type('string') }),
  }).handle(async (req, { id }) => {
    const body = await req.json();
    return UserCartService.updateUserCart(id, body);
  });
  @operation({
    summary: 'Create userCart',
  })
  @post()
  static createUserCart = procedure({
    body: type({ todo: type('true') }),
  }).handle(async (req) => {
    const body = await req.json();
    return UserCartService.createUserCart(body);
  });
  @operation({
    summary: 'Delete userCart',
  })
  @del('{id}')
  static deleteUserCart = procedure({
    params: type({ id: type('string') }),
  }).handle((_req, { id }) => {
    return UserCartService.deleteUserCart(id);
  });
}
```

```ts showLineNumbers copy filename="src/modules/user-cart/user-cart-service.ts"
import type { VovkBody, VovkParams } from 'vovk';
import type UserCartController from './user-cart-controller';

export default class UserCartService {
  static getUserCarts = () => {
    return { message: 'TODO: get userCarts' };
  };

  static getSingleUserCart = (
    id: VovkParams<typeof UserCartController.getSingleUserCart>['id']
  ) => {
    return { message: 'TODO: get single userCart', id };
  };

  static updateUserCart = (
    id: VovkParams<typeof UserCartController.updateUserCart>['id'],
    body: VovkBody<typeof UserCartController.updateUserCart>
  ) => {
    return { message: `TODO: update userCart`, id, body };
  };

  static createUserCart = (
    body: VovkBody<typeof UserCartController.createUserCart>
  ) => {
    return { message: `TODO: create userCart`, body };
  };

  static deleteUserCart = (
    id: VovkParams<typeof UserCartController.deleteUserCart>['id']
  ) => {
    return { message: `TODO: delete userCart`, id };
  };
}
```

The updated segment file:

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
import { initSegment } from 'vovk';
import UserCartController from '../../../modules/user-cart/user-cart-controller';
const controllers = {
  UserCartRPC: UserCartController,
};
export type Controllers = typeof controllers;
export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
});
```

---

Page: https://vovk.dev/hello-world

# "Hello World" Example

> **About this example:** Although it is called “Hello World,” this sample is intentionally comprehensive. It brings together validation, streaming, multi‑language client generation, and OpenAPI output in a single, focused project. If you need the absolute minimal starting point, see the [Quick Start](https://vovk.dev/quick-install) guide first.

If you want a more advanced, agent-operated reference app (Realtime UI + MCP + voice/chat surfaces), see the [Realtime UI overview](https://vovk.dev/realtime-ui/overview).

The "Hello World" app at [hello-world.vovk.dev](https://hello-world.vovk.dev/) is a Next.js / Vovk.ts example showcasing core features by implementing:

- Back-end:
  - `UserController` with an `updateUser` method (POST `/api/users/{id}`).
  - `StreamController` with a JSONLines `streamTokens` handler (GET `/api/streams/tokens`).
  - `OpenApiController` with `getSpec` (GET `/api/static/openapi.json`), serving the generated OpenAPI spec. Documentation is viewable at the [`/openapi` page](https://hello-world.vovk.dev/openapi).
- Front-end:
  - A form plus a JSONLines streaming demo above it.
- Configuration:
  - Client‑side validation; segmented & composed TypeScript clients; generation of Rust/Python clients; npm bundle output; and OpenAPI metadata (info + servers).

Explore the source in the [GitHub repository](https://github.com/finom/vovk/tree/main/examples/hello-world). Generated artifacts are committed under [dist](https://github.com/finom/vovk/tree/main/examples/hello-world/dist), [tmp_prebundle](https://github.com/finom/vovk/tree/main/examples/hello-world/tmp_prebundle), [dist_rust](https://github.com/finom/vovk/tree/main/examples/hello-world/dist_rust), and [dist_python](https://github.com/finom/vovk/tree/main/examples/hello-world/dist_python) for inspection (in real projects they should go in `.gitignore`).

All snippets on this page are pulled directly from GitHub; live example pages are embedded via iframes.

## Running the Example Locally

Create a copy of the example; this also installs the dependencies:

```sh copy
npx create-next-app@latest --example https://github.com/finom/vovk/tree/main/examples/hello-world vovk-hello-world
cd vovk-hello-world
```

Start the dev server:

```sh copy
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Topics and Concepts Covered

- Zod validation via [procedure function](https://vovk.dev/procedure) for `body`, `query`, and `params` input, plus `output` and `iteration` output schemas with `description` and `examples` via Zod [meta](https://zod.dev/metadata#meta).
- Client-side validation for RPC inputs, described in the [customization](https://vovk.dev/imports) article.
- [Composed](https://vovk.dev/composed) and [segmented](https://vovk.dev/segmented) [TypeScript](https://vovk.dev/typescript) clients.
- [JSONLines](https://vovk.dev/jsonlines) streaming.
- [Type inference](https://vovk.dev/inference) between service and controller layers.
- `useQuery` / `useMutation` usage with [`queryKey`](https://vovk.dev/typescript#react-query).
- TypeScript client [bundle](https://vovk.dev/bundle) published on [npm](https://npmjs.com/package/vovk-hello-world) (see [bundlephobia](https://bundlephobia.com/package/vovk-hello-world)).
- Experimental [Rust](https://vovk.dev/rust) and [Python](https://vovk.dev/python) clients published on [crates.io](https://crates.io/crates/vovk_hello_world) / [PyPI](https://pypi.org/project/vovk-hello-world/).
- [OpenAPI spec](https://vovk.dev/openapi) served from a [static segment](https://vovk.dev/static-segment) and rendered via [Scalar](https://scalar.com/).

## Live Demo

The demo provides a simple form (no native validation attributes) and a “Disable client-side input validation” checkbox toggling the [disableClientValidation](https://vovk.dev/typescript#disableclientvalidation) option. “Notification type” is intentionally mis-set to show both client and server validation behavior.

Link: https://hello-world.vovk.dev

## `UserController` and `UserService`

`/api/users/{id}` is implemented by `UserController` / `UserService` through `updateUser`.

The controller method uses `@post` to map POST and `procedure()` for Zod validation of `body`, `params`, `query` and `output`. Each schema applies `meta` for richer OpenAPI (`description`, `examples`). For illustration, `body` nests `email` and a `profile` object (`name`, `age`).

The service method infers parameter types from the procedure, returning the service method result directly and avoiding implicit `any` self-reference issues.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts" source="examples/hello-world"
import { operation, post, prefix, procedure } from 'vovk';
import { z } from 'zod';
import UserService from './user-service';

@prefix('users')
export default class UserController {
  @operation({
    summary: 'Update user',
    description: 'Update user by ID',
  })
  @post('{id}')
  static updateUser = procedure({
    body: z
      .object({
        email: z.email().meta({
          description: 'User email',
          examples: ['john@example.com', 'jane@example.com'],
        }),
        profile: z
          .object({
            name: z
              .string()
              .min(2)
              .meta({
                description: 'User full name',
                examples: ['John Doe', 'Jane Smith'],
              }),
            age: z
              .int()
              .min(16)
              .max(120)
              .meta({ description: 'User age', examples: [25, 30] }),
          })
          .meta({ description: 'User profile object' }),
      })
      .meta({ description: 'User data object' }),
    params: z
      .object({
        id: z.uuid().meta({
          description: 'User ID',
          examples: ['123e4567-e89b-12d3-a456-426614174000'],
        }),
      })
      .meta({
        description: 'Path parameters',
      }),
    query: z
      .object({
        notify: z
          .enum(['email', 'push', 'none'])
          .meta({ description: 'Notification type' }),
      })
      .meta({
        description: 'Query parameters',
      }),
    output: z
      .object({
        success: z.boolean().meta({ description: 'Success status' }),
        id: z.uuid().meta({ description: 'User ID' }),
        notify: z.enum(['email', 'push', 'none']).meta({
          description: 'Notification type',
        }),
      })
      .meta({ description: 'Response object' }),
  }).handle(async (req, { id }) => {
    const body = await req.json();
    const notify = req.nextUrl.searchParams.get('notify');

    return UserService.updateUser(id, body, notify);
  });
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/user/user-controller.ts)*

```ts showLineNumbers copy filename="src/modules/user/user-service.ts" source="examples/hello-world"
import type { VovkBody, VovkOutput, VovkParams, VovkQuery } from 'vovk';
import type UserController from './user-controller';

export default class UserService {
  static updateUser = (
    id: VovkParams<typeof UserController.updateUser>['id'],
    body: VovkBody<typeof UserController.updateUser>,
    notify: VovkQuery<typeof UserController.updateUser>['notify'],
  ) => {
    console.log(
      id satisfies string,
      body satisfies { email: string; profile: { name: string; age: number } },
      notify satisfies 'email' | 'push' | 'none',
    );
    return {
      id,
      notify,
      success: true,
    } satisfies VovkOutput<typeof UserController.updateUser>;
  };
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/user/user-service.ts)*

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts" source="examples/hello-world"  
import { initSegment } from 'vovk';
import StreamController from '../../../modules/stream/stream-controller';
import UserController from '../../../modules/user/user-controller';

export const runtime = 'edge';

const controllers = {
  UserRPC: UserController,
  StreamRPC: StreamController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
  onError: console.error,
});
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/app/api/[[...vovk]]/route.ts)*

## `StreamController` and `StreamService`

`/api/streams/tokens` streams tokens using a controller generator method that delegates with `yield*` to the service. Each streamed item is validated via the `iteration` schema. Delays are simulated with `setTimeout`.

```ts showLineNumbers copy filename="src/modules/stream/stream-controller.ts" source="examples/hello-world"
import { get, operation, prefix, procedure } from 'vovk';
import { z } from 'zod';
import StreamService from './stream-service';

@prefix('streams')
export default class StreamController {
  @operation({
    summary: 'Stream tokens',
    description: 'Stream tokens to the client',
  })
  @get('tokens')
  static streamTokens = procedure({
    validateEachIteration: true,
    iteration: z
      .object({
        message: z.string().meta({ description: 'Message from the token' }),
      })
      .meta({
        description: 'Streamed token object',
      }),
  }).handle(async function* () {
    yield* StreamService.streamTokens();
  });
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/stream/stream-controller.ts)*

```ts showLineNumbers copy filename="src/modules/stream/stream-service.ts" source="examples/hello-world"
import type { VovkIteration } from 'vovk';
import type StreamController from './stream-controller';

export default class StreamService {
  static async *streamTokens() {
    const tokens: VovkIteration<typeof StreamController.streamTokens>[] =
      'Vovk.ts is a RESTful back-end meta-framework with RPC, built on top of the Next.js App Router. This text is a JSONLines stream demo.'
        .match(/[^\s-]+-?(?:\s+)?/g)
        ?.map((message) => ({ message })) || [];

    for (const token of tokens) {
      yield token;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/stream/stream-service.ts)*

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts" source="examples/hello-world"  
import { initSegment } from 'vovk';
import StreamController from '../../../modules/stream/stream-controller';
import UserController from '../../../modules/user/user-controller';

export const runtime = 'edge';

const controllers = {
  UserRPC: UserController,
  StreamRPC: StreamController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
  onError: console.error,
});
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/app/api/[[...vovk]]/route.ts)*

## React Components

The demo uses [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query) for both standard requests and streaming.

```ts showLineNumbers copy filename="src/components/demo/index.tsx" source="examples/hello-world"
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StreamDemo from './stream-demo';
import UserFormDemo from './user-form-demo';

const queryClient = new QueryClient();

const Demo = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StreamDemo />
      <h2 className="text-lg font-bold mb-1 text-center">
        &quot;Update User&quot; Demo
      </h2>
      <p className="text-xs mb-4 text-center">
        <strong>*</strong> form validation isn&apos;t enabled for demo purposes
      </p>
      <UserFormDemo />
    </QueryClientProvider>
  );
};

export default Demo;
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/components/demo/index.tsx)*

```tsx showLineNumbers copy filename="src/components/demo/user-form-demo.tsx" source="examples/hello-world"
'use client';
import { useMutation } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import type { VovkQuery } from 'vovk';
import { UserRPC } from '../../client/root'; // segmented client

const UserFormDemo = () => {
  const [disableClientValidation, setDisableClientValidation] = useState(false);
  const [name, setName] = useState('John Doe');
  const [age, setAge] = useState(35);
  const [email, setEmail] = useState('john@example.com');
  const [id, setId] = useState('a937629d-e8f6-4b1e-a819-7669358650a0');
  const [notify, setNotify] = useState<
    VovkQuery<typeof UserRPC.updateUser>['notify']
  >(
    'sms' as 'email', // intentionally use an invalid value
  );

  const updateUserMutation = useMutation({
    mutationFn: UserRPC.updateUser,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateUserMutation.mutate({
      body: {
        email,
        profile: {
          name,
          age,
        },
      },
      query: { notify },
      params: { id },
      disableClientValidation,
    });
  };
  return (
    <form onSubmit={handleSubmit}>
      <h3>Body</h3>
      <div>
        <label htmlFor="email">User email</label>
        <input
          id="email"
          name="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="name">User full name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="age">User age</label>
        <input
          id="age"
          name="age"
          type="number"
          placeholder="35"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
      </div>

      <h3>Params</h3>
      <div>
        <label htmlFor="id">User ID</label>
        <input
          id="id"
          name="id"
          type="text"
          placeholder="123e4567-e89b-12d3-a456-426614174000"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>
      <h3>Query</h3>
      <div>
        <label htmlFor="notify">Notification type</label>
        <select
          id="notify"
          name="notify"
          value={notify}
          onChange={(e) =>
            setNotify(e.target.value as 'email' | 'push' | 'none')
          }
        >
          <option value="none">None</option>
          <option value="email">Email</option>
          <option value="push">Push</option>
          <option value="sms">SMS (error)</option>
        </select>
      </div>
      <br />
      <label>
        <input
          type="checkbox"
          onChange={({ target }) => setDisableClientValidation(target.checked)}
          checked={disableClientValidation}
        />{' '}
        Disable client-side input validation
      </label>
      <button type="submit">Submit</button>
      {(updateUserMutation.data || updateUserMutation.error) && (
        <output>
          <strong>Response:</strong>{' '}
          {updateUserMutation.error ? (
            <div className="text-red-500">
              {updateUserMutation.error.message}
            </div>
          ) : (
            <div className="text-green-500">
              {JSON.stringify(updateUserMutation.data)}
            </div>
          )}
        </output>
      )}
    </form>
  );
};

export default UserFormDemo;
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/components/demo/user-form-demo.tsx)*

```tsx showLineNumbers copy filename="src/components/demo/stream-demo.tsx" source="examples/hello-world"
'use client';
import {
  experimental_streamedQuery as streamedQuery,
  useQuery,
} from '@tanstack/react-query';
import { StreamRPC } from '../../client/root'; // segmented client, just for demo

const StreamDemo = () => {
  const { data, refetch } = useQuery({
    queryKey: StreamRPC.streamTokens.queryKey(),
    queryFn: streamedQuery({
      streamFn: () => StreamRPC.streamTokens(),
    }),
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: ignore for refetch demo
    // biome-ignore lint/a11y/useKeyWithClickEvents: ignore for refetch demo
    <div className="h-20 cursor-pointer" onClick={() => refetch()}>
      {data?.map((token, index) => (
        <span key={index}>{token.message}</span>
      ))}
    </div>
  );
};
export default StreamDemo;
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/components/demo/stream-demo.tsx)*

## Config

The app is [configured](https://vovk.dev/config) to:

- Validate on client-side via Ajv, the primary client-side validation library, described in the [customization](https://vovk.dev/imports) article (disabled for the bundle to keep it lightweight).
- Generate [Rust](https://vovk.dev/rust) and [Python](https://vovk.dev/python) code when running [vovk dev](https://vovk.dev/dev) or [vovk generate](https://vovk.dev/generate).
- Demonstrate the [segmented client](https://vovk.dev/segmented), generating RPC modules per [segment](https://vovk.dev/segment).
- Generate clients and [bundle](https://vovk.dev/bundle) with `package` field and an explicit `origin`:
  - Python and Rust clients: use `https://hello-world.vovk.dev`.
  - TypeScript Bundle: use `https://hello-world.vovk.dev`.
  - Composed TypeScript client:
    - In development: use `http://localhost:PORT` (so Node.js via the generated **@/client** can call locally).
    - In production: use an empty origin (requests are relative to the current origin).
  - Segmented client: use an empty origin (requests are relative to the current origin).

```ts showLineNumbers copy filename="vovk.config.js" source="examples/hello-world"
// @ts-check

const PROD_ORIGIN = 'https://hello-world.vovk.dev';
// Commented lines indicate default values
/** @type {import('vovk').VovkConfig} */
const config = {
  logLevel: 'debug',
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
    openAPIObject: {
      info: {
        title: '"Hello World" app API',
        description:
          'API for "Hello World" app hosted at https://hello-world.vovk.dev/. Source code is available on Github https://github.com/finom/vovk/tree/main/examples/hello-world. For more information about this app, visit the documentation page https://vovk.dev/hello-world.',
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
        version: '1.0.0',
      },
      servers: [
        {
          url: 'https://hello-world.vovk.dev',
          description: 'Production',
        },
        {
          url: 'http://localhost:3000',
          description: 'Localhost',
        },
      ],
    },
  },
  composedClient: {
    fromTemplates: ['ts', 'py', 'rs'],
    // enabled: true,
    // outDir: "./src/client",
    outputConfig: {
      origin:
        process.env.NODE_ENV === 'production'
          ? null
          : `http://localhost:${process.env.PORT ?? 3000}`,
    },
    // prettifyClient: true,
  },
  segmentedClient: {
    // fromTemplates: ["ts"],
    enabled: true,
    // outDir: "./src/client",
    // outputConfig: { origin: '' },
    // prettifyClient: true,
  },
  bundle: {
    outputConfig: {
      origin: PROD_ORIGIN,
      imports: { validateOnClient: null },
      package: {
        type: 'module',
        main: './index.js',
        types: './index.d.ts',
        exports: {
          '.': {
            default: './index.js',
            types: './index.d.ts',
          },
        },
      },
    },
    keepPrebundleDir: true,
    build: async ({ entry, outDir }) => {
      const { build } = await import('tsdown');
      await build({
        entry,
        dts: true,
        format: 'esm',
        hash: false,
        fixedExtension: true,
        clean: true,
        outDir,
        platform: 'neutral',
        outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
        outputOptions: {
          inlineDynamicImports: true,
        },
        inputOptions: {
          resolve: {
            mainFields: ['module', 'main'],
          },
        },
        noExternal: ['!next/**'],
      });
    },
  },
  clientTemplateDefs: {
    py: {
      extends: 'py',
      outputConfig: { origin: PROD_ORIGIN },
      // composedClient: { outDir: "./dist_python" },
    },
    rs: {
      extends: 'rs',
      outputConfig: { origin: PROD_ORIGIN },
      // composedClient: { outDir: "./dist_rust" },
    },
  },
};

module.exports = config;
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/vovk.config.js)*

The original package.json is used to populate metadata (`repository`, `homepage`, `bugs` etc) in the package files listed below.
```json showLineNumbers copy  source="examples/hello-world" filename="package.json"
{
  "name": "vovk-hello-world",
  "version": "0.0.88",
  "description": "A \"Hello World!\" app built with Next.js, Vovk.ts and Zod. For details, visit https://vovk.dev/hello-world",
  "scripts": {
    "dev": "vovk dev --next-dev",
    "prebuild": "vovk generate",
    "build": "next build",
    "start": "next start",
    "lint": "biome check",
    "test:node": "tsx --test --test-concurrency=1",
    "test:python": "python3 -m pip install -q -r test/python/requirements.txt && python3 -m unittest discover -s test/python -p local_test.py && python3 -m unittest discover -s test/python -p packaged_test.py",
    "test:rust": "RUST_BACKTRACE=full RUST_TEST_THREADS=1 cargo test --manifest-path ./test/rust/Cargo.toml --tests -- --nocapture --show-output",
    "pretest": "next build",
    "test": "concurrently 'next start' \"sleep 10 && printf '\\n\\033[1;96mNode tests\\033[0m\\n' && npm run test:node && printf '\\n\\033[1;96mPython tests\\033[0m\\n' && npm run test:python && printf '\\n\\033[1;96mRust tests\\033[0m\\n' && npm run test:rust\" --kill-others --success first",
    "publish:node": "npm publish ./dist",
    "publish:rust": "cargo publish --manifest-path dist_rust/Cargo.toml --allow-dirty",
    "publish:python": "python3 -m build ./dist_python --wheel --sdist && python3 -m twine upload ./dist_python/dist/*",
    "ncu": "npm-check-updates -u"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/finom/vovk.git",
    "directory": "examples/hello-world"
  },
  "homepage": "https://vovk.dev/hello-world",
  "bugs": {
    "url": "https://github.com/finom/vovk/issues"
  },
  "author": "Andrey Gubanov",
  "keywords": [
    "vovk",
    "openapi",
    "zod",
    "api"
  ],
  "dependencies": {
    "@scalar/api-reference-react": "^0.9.60",
    "@standard-schema/spec": "^1.1.0",
    "@tanstack/react-query": "^5.101.4",
    "ajv": "^8.20.0",
    "ajv-errors": "^3.0.0",
    "next": "^16.3.6",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "vovk": "^4.0.0-beta.0",
    "vovk-ajv": "^0.1.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.5.14",
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^26",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8",
    "prettier": "^3.9.6",
    "tailwindcss": "^4.3.3",
    "tsdown": "^0.22.14",
    "tsx": "^4.23.7",
    "typescript": "^5",
    "vovk-cli": "^0.3.0-beta.0",
    "vovk-hello-world-published": "npm:vovk-hello-world@^0.0.88",
    "vovk-python": "^0.0.3",
    "vovk-rust": "^0.0.4"
  }
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/package.json)*

## OpenAPI Specification

The [OpenAPI specification](https://hello-world.vovk.dev/api/static/openapi.json) is served by a `GET` endpoint returning the generated spec (`openapi` from `@/client/openapi`).

```ts showLineNumbers copy filename="src/modules/static/openapi/openapi-controller.ts" source="examples/hello-world"
import { get, operation } from 'vovk';
import { openapi } from '@/client/openapi';

export default class OpenApiController {
  @operation({
    summary: 'OpenAPI spec',
    description: 'Get the OpenAPI spec for the "Hello World" app API',
  })
  @get('openapi.json', { cors: true })
  static getSpec = () => openapi;
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/modules/static/openapi/openapi-controller.ts)*

```ts showLineNumbers copy filename="src/app/api/static/[[...vovk]]/route.ts" source="examples/hello-world"  
import { controllersToStaticParams, initSegment } from 'vovk';
import OpenApiController from '../../../../modules/static/openapi/openapi-controller';

const controllers = {
  OpenApiRPC: OpenApiController,
};

export type Controllers = typeof controllers;

export const dynamic = 'force-static';

export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}
export const { GET } = initSegment({
  segmentName: 'static',
  emitSchema: true,
  controllers,
});
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/src/app/api/static/[[...vovk]]/route.ts)*

The spec includes Scalar‑compatible samples you can reuse immediately.

Link: https://hello-world.vovk.dev/openapi

## Building and Packaging

This example also demonstrates how to quickly produce distributable packages published on [npm](https://www.npmjs.com/package/vovk-hello-world), [PyPI](https://pypi.org/project/vovk-hello-world/), and [crates.io](https://crates.io/crates/vovk_hello_world). The provided [templates](https://vovk.dev/templates) compile ready-to-use packages with language-specific files such as [package.json](https://github.com/finom/vovk/blob/main/examples/hello-world/dist/package.json), [Cargo.toml](https://github.com/finom/vovk/blob/main/examples/hello-world/dist_rust/Cargo.toml), and [pyproject.toml](https://github.com/finom/vovk/blob/main/examples/hello-world/dist_python/pyproject.toml), as well as README files that use code samples served as API/client documentation.

`vovk generate` writes the Python and Rust packages to **dist_python** and **dist_rust**, as `composedClient.fromTemplates` lists `py` and `rs`, and `vovk bundle` builds the npm package into **dist**. Each package is published with its own script:

```json
"scripts": {
  // ...
  "publish:node": "npm publish ./dist",
  "publish:rust": "cargo publish --manifest-path dist_rust/Cargo.toml --allow-dirty",
  "publish:python": "python3 -m build ./dist_python --wheel --sdist && python3 -m twine upload ./dist_python/dist/*"
}
```

The `README.md` files are updated with the latest examples and descriptions. IFrames below are rendered from the READMEs by Github Pages.

    Link: https://finom.github.io/vovk-hello-world/dist/

    Link: https://finom.github.io/vovk-hello-world/dist_rust/

    Link: https://finom.github.io/vovk-hello-world/dist_python/

The generated package files:

```json showLineNumbers copy filename="dist/package.json" source="examples/hello-world"
{
  "name": "vovk-hello-world",
  "version": "0.0.88",
  "description": "A \"Hello World!\" app built with Next.js, Vovk.ts and Zod. For details, visit https://vovk.dev/hello-world",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/finom/vovk.git",
    "directory": "examples/hello-world"
  },
  "homepage": "https://vovk.dev/hello-world",
  "bugs": {
    "url": "https://github.com/finom/vovk/issues"
  },
  "author": "Andrey Gubanov",
  "keywords": [
    "vovk",
    "openapi",
    "zod",
    "api"
  ],
  "type": "module",
  "main": "./index.js",
  "types": "./index.d.ts",
  "exports": {
    ".": {
      "default": "./index.js",
      "types": "./index.d.ts"
    }
  }
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/dist/package.json)*

```toml showLineNumbers copy filename="dist_rust/Cargo.toml" source="examples/hello-world"
# Generated by vovk-cli v0.3.0-beta.0

[package]
name = "vovk_hello_world"
version = "0.0.88"
edition = "2021"
rust-version = "1.85"
resolver = "3"
description = 'A "Hello World!" app built with Next.js, Vovk.ts and Zod. For details, visit https://vovk.dev/hello-world'
license = "MIT"
repository = "https://github.com/finom/vovk.git"
homepage = "https://vovk.dev/hello-world"
authors = [ "Andrey Gubanov" ]
keywords = [ "vovk", "openapi", "zod", "api" ]

[package.metadata.package]
bugs = "https://github.com/finom/vovk/issues"

[dependencies]
serde_json = "1.0.143"
futures-util = "0.3"
urlencoding = "2.1"
once_cell = "1.17"

  [dependencies.serde]
  version = "1.0.164"
  features = [ "derive" ]

  [dependencies.reqwest]
  version = "0.12"
  features = [ "json", "multipart", "stream" ]

  [dependencies.tokio]
  version = "1"
  features = [ "macros", "rt-multi-thread", "io-util" ]

  [dependencies.tokio-util]
  version = "0.7"
  features = [ "codec" ]

  [dependencies.jsonschema]
  version = "0.57"
  default-features = false
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/dist_rust/Cargo.toml)*

```toml showLineNumbers copy filename="dist_python/pyproject.toml" source="examples/hello-world"
# Generated by vovk-cli v0.3.0-beta.0

[build-system]
requires = [ "hatchling" ]
build-backend = "hatchling.build"

[project]
name = "vovk_hello_world"
version = "0.0.88"
description = 'A "Hello World!" app built with Next.js, Vovk.ts and Zod. For details, visit https://vovk.dev/hello-world'
requires-python = ">=3.9"
keywords = [ "vovk", "openapi", "zod", "api" ]
dependencies = [
  "requests",
  "jsonschema[format-nongpl]",
  "typing_extensions>=4.0.0; python_version < '3.11'"
]
readme = "README.md"

  [project.license]
  text = "MIT"

  [[project.authors]]
  name = "Andrey Gubanov"

  [project.optional-dependencies]
  dev = [ "types-requests", "types-jsonschema" ]

  [project.urls]
  Homepage = "https://vovk.dev/hello-world"
  Source = "https://github.com/finom/vovk.git"
  Issues = "https://github.com/finom/vovk/issues"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
"*" = ["py.typed"]

[tool.mypy]
warn_return_any = true
warn_unused_configs = true
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/dist_python/pyproject.toml)*

## Tests

The project also includes tests located in the [test/node](https://github.com/finom/vovk/tree/main/examples/hello-world/test/node), [test/rust](https://github.com/finom/vovk/tree/main/examples/hello-world/test/rust), and [test/python](https://github.com/finom/vovk/tree/main/examples/hello-world/test/python) directories, covering both local and published clients.

```sh npm2yarn copy
npm run test
```

When run, the command builds the Next.js app, starts the server, and executes the tests.

## Conclusion

Even with only three endpoints (`updateUser`, `streamTokens`, `getSpec`), Vovk.ts delivers:

- Turnkey multi-language client generation (TypeScript bundle + Rust + Python) with publish-ready metadata and READMEs.
- Rich, documented OpenAPI output rendered via Scalar.
- Text streaming and unified client-side validation flows.

---

Page: https://vovk.dev/multitenant

# Multitenancy

This article explains how to host multiple tenants or sites—each served from a different subdomain—within a single Next.js application. The backend and frontend run as separate serverless functions in one project, which keeps maintenance and deployment simple and reduces infrastructure complexity.

![Multitenancy](https://vovk.dev/draw/multitenancy.svg)

This guide walks you through implementing multitenancy in Next.js with a small assist from Vovk.ts. It shows how to serve different areas of your application under distinct subdomains, illustrating several use cases:

- [example.com](https://multitenant.vovk.dev/) for the root tenant,
- [admin.example.com](https://admin.multitenant.vovk.dev/) for the admin tenant,
- [customer.example.com](https://customer.multitenant.vovk.dev/) for a customer tenant,
- [\*.customer.example.com](https://acme.customer.multitenant.vovk.dev/) for a specific customer tenant (for example, `acme.customer.example.com`),
- [pro.\*.customer.example.com](https://pro.acme.customer.multitenant.vovk.dev/) for a professional version of a customer tenant (for example, `pro.acme.customer.example.com`).

The live example is available at [multitenant.vovk.dev](https://multitenant.vovk.dev/), and the source code is in the [vovk-multitenant-example](https://github.com/finom/vovk/tree/main/examples/multitenant).

Each tenant has its own root API endpoint under that domain’s `/api` path. For example, the customer tenant’s API lives at `customer.example.com/api`, and the admin tenant’s API at `admin.example.com/api`. These root endpoints are implemented as [segments](https://vovk.dev/segment) and rewritten at [Next.js proxy](https://nextjs.org/docs/app/getting-started/proxy) to the appropriate path based on the tenant subdomain.

On the frontend, use Next.js [dynamic routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) for tenant‑specific paths. For example, a customer’s dedicated tenant page lives at `src/customer/[customer_name]/page.tsx`, and the admin tenant uses `src/admin/page.tsx`.

Vovk.ts provides a small routing utility, `multitenant`, that accepts request information and returns the action the proxy should take—redirecting to a subdomain or rewriting to a path. You’ll use it in Next.js proxy to route requests based on the tenant subdomain.

This example uses Vercel for deployment, but you can adapt it to any platform that supports Node.js.

## Configure DNS

DNS records are configured as follows:

| Type         | Host           | Value                 |
| ------------ | -------------- | --------------------- |
| CNAME Record | \*.multitenant | cname.vercel-dns.com. |

On Vercel, the project domains are configured like this:

![Domain configuration](https://vovk.dev/screenshots/vercel-multitenant-domains.png)

See the [Vercel documentation](https://vercel.com/docs/domains/working-with-domains/add-a-domain) for details on configuring domains, or consult your provider’s documentation for wildcard subdomains.

As it was mentioned above, the project uses the following domains:

- `multitenant.vovk.dev` for the root tenant,
- `admin.multitenant.vovk.dev` for the admin tenant,
- `customer.multitenant.vovk.dev` for the customer tenant,
- `*.customer.multitenant.vovk.dev` for a specific customer tenant (for example, `acme.customer.multitenant.vovk.dev`), which shares the customer tenant API,
- `pro.acme.customer.multitenant.vovk.dev` to illustrate multiple subdomains. Vercel has limited wildcard support, so `acme` is used as a placeholder.

## Organize Frontend Routes

Use Next.js [dynamic routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) to handle tenant‑specific paths.

```
src/app/
  page.tsx domain: multitenant.vovk.dev, segment: "root"
  admin/
    page.tsx domain: admin.multitenant.vovk.dev, segment: "admin"
  customer/
    page.tsx domain: customer.multitenant.vovk.dev, segment: "customer"
    [customer_name]/
      page.tsx domain: *.customer.multitenant.vovk.dev, segment: "customer"
      pro/
        page.tsx domain: pro.*.customer.multitenant.vovk.dev, segment: "customer/pro"
```

## Create Backend API Segments and Controllers

After [setting up a Vovk.ts](https://vovk.dev/quick-install) app, the simplest approach is to use the Vovk.ts CLI to create segments and controllers. The CLI generates the necessary files so you can focus on business logic.

First, create the API segments for each tenant. Each segment handles requests to its root API endpoint.

```sh npm2yarn copy
npm exec -- vovk new segment # create the root segment at src/app/api/[[...vovk]]/route.ts
npm exec -- vovk new segment admin # create "admin" segment at src/app/api/admin/[[...vovk]]/route.ts
npm exec -- vovk new segment customer # create "customer" segment at src/app/api/customer/[[...vovk]]/route.ts
npm exec -- vovk new segment customer/pro # create "customer/pro" segment at src/app/api/customer/pro/[[...vovk]]/route.ts
```

Read more about Vovk.ts [segments](https://vovk.dev/segment).

Next, create controllers for each segment. For example, to create `ProductService` and `ProductController` for the root segment in `src/modules/product/`:

```sh npm2yarn copy
npm exec -- vovk new controller service product
```

Create `UserService` and `UserController` for the admin segment in `src/modules/admin/user/`:

```sh npm2yarn copy
npm exec -- vovk new controller service admin/user
```

## Enable Segmented Client

By default, Vovk.ts emits a “composed client” to `src/client`, imported as `@/client`. Those modules import all [schemas](https://vovk.dev/schema) from `.vovk-schema`, making the entire app schema visible in every frontend module that imports the client.

A [segmented client](https://vovk.dev/segmented) solves this by generating a separate client per segment, importing only the schemas relevant to that segment. Each segment gets its own directory in the project, and the client imports only what it needs.

This also lets higher‑order segments (such as “admin”) import lower‑order segments (such as “customer”), enabling RPC sharing across segments while keeping backend details hidden from pages that don’t use those RPC modules.

![Segmented client](https://vovk.dev/draw/segmented-client.svg)

Disable the composed client and enable the segmented client in your [config file](https://vovk.dev/config):

```ts showLineNumbers copy filename="vovk.config.mjs"
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    enabled: false, // Disable composed client
  },
  segmentedClient: {
    enabled: true, // Enable segmented client
  },
};
export default config;
```

By default, the segmented client is generated in `./src/client`. You can change the output directory via the `outDir` option.

Once enabled, import the client in your frontend code:

```ts showLineNumbers copy
import { ProductRPC } from '@/client/product';

await ProductRPC.getProducts();
```

The generated client’s file structure looks like this (truncated for brevity—see [segmented client docs](https://vovk.dev/segmented) for details):

```
src/client/
  root/
    index.ts segment: root
  admin/
    index.ts segment: admin
  customer/
    index.ts segment: customer
    pro/
      index.ts segment: customer/pro
```

## Update Segment Configuration

Specify `segmentNameOverride` for every non‑root segment in the [config file](https://vovk.dev/config). This overrides the default segment name used in the URL path (for example, `"customer/pro"` becomes `""`).

```ts showLineNumbers copy filename="vovk.config.mjs"
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    enabled: false, // Disable composed client
  },
  segmentedClient: {
    enabled: true, // Enable segmented client
  },
  outputConfig: {
    segments: {
      admin: {
        segmentNameOverride: '',
      },
      customer: {
        segmentNameOverride: '',
      },
      'customer/pro': {
        segmentNameOverride: '',
      },
    },
  },
};
export default config;
```

## Create Next.js Proxy

The `"vovk"` package provides a `multitenant` utility that acts as the router for your multitenant app. It accepts request information and returns the action the proxy should take—redirect to a subdomain or rewrite to a path.

Parameters:

- `requestUrl`: the full request URL (e.g., from `request.url`).
- `requestHost`: the request host (e.g., from `request.headers.get("host")`).
- `targetHost`: the canonical host for redirects/rewrites (your production domain or `localhost:3000` in development).
- `overrides`: a map from tenant subdomain names to routing rules. Each rule is an array of objects with `from` (path prefix) and `to` (target path).

For wildcard subdomains, use square‑bracket patterns (such as `[customer_name]`) to define the [Dynamic Segment](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes). The value is passed via `params`. A placeholder matches one DNS label (letters, digits and hyphens), and the host is matched case-insensitively, so a host such as `%2e%2e.customer.example.com` gets no rewrite.

A rule rewrites a path prefix, so a host also reaches what is nested under its target: `acme.customer.example.com/api/pro` reaches the `customer/pro` segment, and `acme.customer.example.com/pro` the pro page.

```ts showLineNumbers copy filename="src/proxy.ts" source="examples/multitenant"
import { type NextRequest, NextResponse } from 'next/server';
import { multitenant } from 'vovk';

export default function proxy(request: NextRequest) {
  const { action, destination, message, subdomains } = multitenant({
    requestUrl: request.url,
    requestHost: request.headers.get('host') ?? '',
    targetHost: process.env.VERCEL ? 'multitenant.vovk.dev' : 'localhost:3000',
    overrides: {
      admin: [
        { from: 'api', to: 'api/admin' }, // API
        { from: '', to: 'admin' }, // UI
      ],
      customer: [
        { from: 'api', to: 'api/customer' }, // API
        { from: '', to: 'customer' }, // UI
      ],
      '[customer_name].customer': [
        { from: 'api', to: 'api/customer' }, // API
        { from: '', to: 'customer/[customer_name]' }, // UI
      ],
      'pro.[customer_name].customer': [
        { from: 'api', to: 'api/customer/pro' }, // API
        { from: '', to: 'customer/[customer_name]/pro' }, // UI
      ],
    },
  });

  console.log({
    requestUrl: request.url,
    requestHost: request.headers.get('host') ?? '',
    targetHost: process.env.VERCEL ? 'multitenant.vovk.dev' : 'localhost:3000',
    action,
    destination,
    message,
    subdomains,
  });

  // the API reads the tenant from this header; only the proxy sets it, not the client
  const headers = new Headers(request.headers);
  headers.delete('x-subdomains');
  if (subdomains) {
    headers.set('x-subdomains', new URLSearchParams(subdomains).toString());
  }

  if (action === 'rewrite' && destination) {
    return NextResponse.rewrite(new URL(destination), { request: { headers } });
  }
  if (action === 'redirect' && destination) {
    return NextResponse.redirect(new URL(destination));
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - SVG files
     */
    '/((?!static|.*\\.png|.*\\.svg|.*\\.ico|.well-known|_next/image|_next/static).*)',
  ],
};
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/multitenant/src/proxy.ts)*

The proxy passes the captured `subdomains` to the API in an `x-subdomains` request header and drops one the client sent, so a client can't choose its tenant. The customer controllers read it with `headers()` from `next/headers`.

## Update Hosts for Local Development

Add a wildcard mapping to `/etc/hosts` to support subdomains locally:

```
127.0.0.1       *.localhost
```

## Roadmap

- 📝 Cover multi-domain topic.

---

Page: https://vovk.dev/testing

# Testing

Vovk.ts procedures expose an [`.fn` method](https://vovk.dev/fn) that calls the handler directly, skipping the HTTP round-trip. The same method powers SSR, server actions, and testing. This makes unit testing straightforward — no server required.

## Setup

Any test runner works (Vitest, Jest, Node.js test runner, etc.). Examples below use Vitest.

The `vovk` package is ES modules only. Jest set up with `next/jest` can't load it as is, so add `transpilePackages: ['vovk']` to the Next.js config.

## Testing with `.fn`

Given a controller:

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { z } from 'zod';
import { procedure, get, post, prefix } from 'vovk';

@prefix('users')
export default class UserController {
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.string() }),
    output: z.object({ id: z.string(), name: z.string() }),
  }).handle(async ({ vovk }) => {
    const { id } = vovk.params();
    return { id, name: 'John' };
  });

  @post()
  static createUser = procedure({
    body: z.object({ name: z.string() }),
    output: z.object({ id: z.string(), name: z.string() }),
  }).handle(async ({ vovk }) => {
    const { name } = await vovk.body();
    return { id: 'new-id', name };
  });
}
```

Test it directly:

```ts showLineNumbers copy filename="src/modules/user/user-controller.test.ts"
import { describe, it, expect } from 'vitest';
import UserController from './user-controller';

describe('UserController', () => {
  it('gets a user by ID', async () => {
    const user = await UserController.getUser.fn({
      params: { id: '42' },
    });

    expect(user).toEqual({ id: '42', name: 'John' });
  });

  it('creates a user', async () => {
    const user = await UserController.createUser.fn({
      body: { name: 'Alice' },
    });

    expect(user).toEqual({ id: 'new-id', name: 'Alice' });
  });
});
```

The `.fn` method runs the full procedure pipeline including validation and [decorators](https://vovk.dev/decorator-overview), but without HTTP overhead. This makes it a perfect fit for tests built around mocked or stubbed data — there is no server to start, no network latency, and no cold-start penalty, so test suites complete remarkably fast.

The trade-off is that `.fn()` bypasses `proxy.js` (previously `middleware.js` in earlier Next.js versions). Any logic that lives there — authentication checks, rate limiting, header injection — will not run during `.fn()` calls. If your tests need to exercise that layer, use [integration tests with RPC modules](#integration-testing-with-rpc-modules) against a running dev server instead.

## Testing Validation

Since procedures validate input, you can test that invalid data is rejected:

```ts showLineNumbers copy filename="src/modules/user/user-controller.test.ts"
import { describe, it, expect } from 'vitest';
import { HttpException } from 'vovk';
import UserController from './user-controller';

describe('UserController validation', () => {
  it('rejects invalid body', async () => {
    await expect(
      UserController.createUser.fn({
        body: { name: 123 }, // invalid
      })
    ).rejects.toThrow(HttpException);
  });
});
```

## Integration Testing with RPC Modules

For end-to-end tests that go through the HTTP layer, use the generated [RPC modules](https://vovk.dev/typescript) against a running dev server:

```ts showLineNumbers copy filename="src/modules/user/user-controller.e2e.test.ts"
import { describe, it, expect } from 'vitest';
import { UserRPC } from '@/client';

describe('UserController E2E', () => {
  it('gets a user via HTTP', async () => {
    const user = await UserRPC.getUser({ params: { id: '42' } });

    expect(user).toEqual({ id: '42', name: 'John' });
  });
});
```

---

Page: https://vovk.dev/performance

# Next.js API Route Performance Overhead

## TL;DR

- Goal: measure Vovk.ts overhead over native Next.js route handlers (not HTTP stack).
- Routing: O(1) across 1–10,000 controllers (20,000 endpoints). Median latency ~1.25–1.33 µs even at 10,000 controllers. Throughput ~745k–800k ops/s/core.
- Cold start: O(n). ~5.7 ms at 1,000 controllers; ~83 ms at 10,000. About 8–10× the cost of no‑op decorators.
- Notes: Tinybench on Apple M4 Pro. Next.js runtime cost is out of scope. Compiled from real benchmark output with AI assistance and minor edits. The scripts live in the [`perf`](https://github.com/finom/vovk/tree/main/perf) folder of the Vovk.ts repository.

## Reproducing the Tests

Clone the repository, install dependencies at its root, and build the packages:

```sh copy
git clone https://github.com/finom/vovk.git
cd vovk
npm ci
npm run build
```

Run the performance tests from the `perf` folder. The script first generates the 11,111 test controllers.

```sh copy
cd perf
npm run perf-test
```

Perf suite also runs in CI: [GitHub Actions](https://github.com/finom/vovk/actions/workflows/perf.yml). CI runs on
GitHub-hosted runners, so numbers are slower than local M4 Pro runs—request-overhead medians are typically
~7.0–8.7× slower (e.g. ~9–11.5 µs vs ~1.3 µs), and cold-start medians ~3.7–4.9× slower (e.g. ~22 µs vs ~5 µs
for 1 controller). The scaling trend (O(1) request overhead, O(n) cold start) still holds.

## Overview

Vovk.ts sits on top of Next.js API routes and generates handlers via decorators applied to procedures:

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
export const { GET, POST } = initSegment({ controllers });
```

We measure framework overhead in two dimensions:

- Request Overhead: per-request routing/handler overhead.
- Cold Start Overhead: initialization time for controllers/metadata.

Source: test scripts in the [`perf`](https://github.com/finom/vovk/tree/main/perf) folder.

## Request Overhead

Example controller (N = 1) used in the request-overhead tests:

```ts showLineNumbers copy filename="src/modules/one/a/a-controller.ts"
import { procedure, prefix, get, post, operation } from "vovk";
import z from "zod";

@prefix("a")
export default class AController {
  @operation({
    summary: "Get A",
  })
  @get()
  static getA = procedure().handle(() => {
    return { get: true };
  });

  @operation({
    summary: "Create A",
  })
  @post("{id}")
  static createA = procedure({
    disableServerSideValidation: ["params"],
    params: z.object({ id: z.string() }),
  }).handle((_req, { id }) => {
    return { post: true, id };
  });
}
```
*Every test controller is generated by [`scripts/createModules.ts`](https://github.com/finom/vovk/blob/main/perf/scripts/createModules.ts).*

### Methodology (short)

- Autogenerate N controllers (N ∈ \{1, 10, 100, 1,000, 10,000\}), each exposing:
  - GET without params.
  - POST with path param "\{id\}" (pattern match).
- Minimal handler logic; measure full routing + handler path.
- Tinybench: 100 ms min per test, nanosecond timing; report median latency/throughput.

### Results

| Controllers | Endpoints | GET Latency (med) | POST Latency (med) | GET Throughput (med ops/s) | POST Throughput (med ops/s) |
| ----------- | --------- | ----------------- | ------------------ | -------------------------- | --------------------------- |
| 1           | 2         | 1,250 ns          | 1,250 ns           | 800,000                    | 800,000                     |
| 10          | 20        | 1,291 ns          | 1,292 ns           | 774,593                    | 773,994                     |
| 100         | 200       | 1,250 ns          | 1,292 ns           | 800,000                    | 773,994                     |
| 1,000       | 2,000     | 1,250 ns          | 1,291 ns           | 800,000                    | 774,593                     |
| 10,000      | 20,000    | 1,292 ns          | 1,333 ns           | 773,994                    | 750,188                     |

Key takeaways:

- O(1) routing: flat latency from 1 to 10,000 controllers.
- ≈1.3 µs overhead at typical scales; GET≈POST indicates efficient param extraction.

## Cold Start Overhead

Example cold-start benchmark (N = 1) contrasting Vovk.ts vs. no-op decorators:

```ts showLineNumbers copy filename="bench/generated_coldStartPerfTest.ts"
bench.add("Cold start for 1 controllers", async () => {
  const controllers: Record<string, Function> = {};
  @prefix("one/0")
  class One0Controller {
    @operation({
      summary: "Create",
    })
    @post("{id}")
    static create = procedure().handle(() => null);
  }

  controllers["One0Controller"] = One0Controller;

  initSegment({
    segmentName: "",
    emitSchema: true,
    controllers,
  });
});

bench.add("No-op decorators for 1 classes", async () => {
  const controllers: Record<string, Function> = {};
  @noopClassDecorator()
  class One0Controller {
    @noopDecorator({
      summary: "Create",
    })
    @noopDecorator("{id}")
    static create = () => {
      return null;
    };
  }
});
```

### Methodology (short)

For N ∈ \{1, 10, 100, 1,000, 10,000\} measure:

- App creation, decorator processing, metadata build, and initSegment().
- Compare to equivalent classes using no‑op decorators to isolate framework work.

Example no‑op decorators:

```ts showLineNumbers copy
function noopDecorator() {
  return function (..._args: any[]) {};
}
function noopClassDecorator() {
  return function <T extends new (...a: any[]) => any>(c: T) {
    return c;
  };
}
```

### Results

| Controllers | Vovk.ts Init Time (med) | No-op Time (med) | Overhead Ratio | Throughput (ops/s) |
| ----------- | ----------------------- | ---------------- | -------------- | ------------------ |
| 1           | 5.125 μs                | 0.500 μs         | 10.3x          | 195,122            |
| 10          | 47.167 μs               | 5.208 μs         | 9.1x           | 21,201             |
| 100         | 526.416 μs              | 53.541 μs        | 9.8x           | 1,900              |
| 1,000       | 5,719.333 μs            | 702.896 μs       | 8.1x           | 175                |
| 10,000      | 82,924.833 μs           | 10,370.729 μs    | 8.0x           | 12                 |

Key takeaways:

- O(n) init: linear growth with a near-constant per-controller cost through 10,000 controllers.
- Absolute times are small for long-lived services; still acceptable for serverless at typical sizes.

## Practical guidance

- For high-performance workloads: split the app into multiple [segments](https://vovk.dev/segment) (e.g., serverless functions built with Next.js route.ts files), each with a manageable number of procedures (up to 1,000).
- In theory, with careful segment management and adequate hardware, a single Next.js/Vovk.ts app can host up to ~100,000 procedures. Validate this in your environment; practical limits will be memory, bundle size, cold start budgets, and platform quotas.

---

Benchmarks: Tinybench on Node.js; hardware Apple M4 Pro. Numbers can vary by runtime, hardware, and build settings. Scripts: https://github.com/finom/vovk/tree/main/perf

---

Page: https://vovk.dev/packages

# Packages and Repos

## Packages of the [Main Monorepo](https://github.com/finom/vovk)

### [vovk](https://www.npmjs.com/package/vovk)

The core/runtime library providing decorators, utilities, types, and other features used by both server-side and client-side code. It peer-depends only on type-focused [openapi3-ts](https://www.npmjs.com/package/openapi3-ts) and is reported as 100% self-composed on [Bundlephobia](https://bundlephobia.com/package/vovk).

```sh npm2yarn copy
npm install vovk
```

### [vovk-cli](https://www.npmjs.com/package/vovk-cli)

The CLI package. Install globally or as a dev dependency. Provides the `vovk` binary.

```sh npm2yarn copy
npm install vovk-cli --save-dev
```

```sh npm2yarn copy
npx vovk-cli <command>
```

Or: 

```sh npm2yarn copy
npm exec -- vovk <command>
```

### [vovk-ajv](https://www.npmjs.com/package/vovk-ajv)

Exposes `validateOnClient` to validate input data on the client using the emitted JSON Schema.

```sh npm2yarn copy
npm install vovk-ajv
```

### [vovk-python](https://www.npmjs.com/package/vovk-python)

Provides Python client templates and utilities to generate the [Python client library](https://vovk.dev/python).

```sh npm2yarn copy
npm install vovk-python --save-dev
```

### [vovk-rust](https://www.npmjs.com/package/vovk-rust)

Provides Rust client templates and utilities to generate the [Rust client library](https://vovk.dev/rust).

```sh npm2yarn copy
npm install vovk-rust --save-dev
```

## Other Repos and Packages

### [vovk-examples](https://examples.vovk.dev/)

A collection of examples and proofs of concept. The client library is published on [NPM](https://www.npmjs.com/package/vovk-examples) and used on this site.

### [vovk-hello-world](https://github.com/finom/vovk/tree/main/examples/hello-world)

![PyPI version](https://badge.fury.io/py/vovk-hello-world.svg)

A minimal example of using Vovk.ts. See the ["Hello World"](https://vovk.dev/hello-world) page for details. The client library is published on [NPM](https://www.npmjs.com/package/vovk-hello-world), [Crate](https://crates.io/crates/vovk-hello-world), and [PyPI](https://pypi.org/project/vovk-hello-world/).

### [vovk-multitenant-example](https://github.com/finom/vovk/tree/main/examples/multitenant)

Demonstrates [multitenancy](https://vovk.dev/multitenant) with Vovk.ts.

### [realtime-kanban](https://github.com/finom/vovk/tree/main/examples/realtime-kanban)

A realtime Kanban board application built with Vovk.ts, described in the [Realtime Kanban](https://vovk.dev/realtime-ui) series of articles.

### [vovk-perf-test](https://github.com/finom/vovk/tree/main/perf)

[Overhead performance](https://vovk.dev/performance) tests for Vovk.ts.

### [vovk.dev](https://github.com/finom/vovk/tree/main/docs)

This documentation.

---

Page: https://vovk.dev/api-ref

# API Reference

## Core

### `initSegment`

Creates Next.js App Route handlers for the main [Optional Catch-all Segment](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments).

The function accepts:

- `segmentName?: string{:ts}` – the segment name used in the route. Defaults to an empty string (the root segment).
- `controllers: Record<string, Function>{:ts}` – a record of controllers.
- `exposeValidation?: boolean` – set to `false` to hide validation logic from client-side code. Defaults to `true`.
- `emitSchema?: boolean{:ts}` – set to `false` to skip emitting the schema for the segment. Defaults to `true`.
- `onError?: (err: Error, req: VovkRequest) => void | Promise{:ts}` – called when a controller throws. Can be used for logging. The second argument can be used to access the request URL, authorization data, and other request details.

### `JSONLinesResponder`

`JSONLinesResponder` is a utility class for creating responses in the JSON Lines format. It provides methods to send individual JSON objects as lines in the response stream.

```ts showLineNumbers copy
const responder = new JSONLinesResponder<IterationType>(req, ({ readableStream, headers }) => new Response(readableStream, { headers }));

await responder.send({ message: 'Hello' });
await responder.send({ message: 'World' });
```

Accepts:
- `req?: Request` – the incoming request object.
- `getResponse?: (responder: JSONLinesResponder<T>) => Response` – optional factory function to create a custom `Response` object.

Provides the following methods and properties:
- `send(item: T): Promise` – Sends a single JSON object as a line in the response stream.
- `close(): Promise` – Closes the response stream, indicating that no more data will be sent.
- `throw(err: Error): Promise` – Sends an error message to the client and closes the stream.
- `response: Response` – The underlying `Response` object that will be returned from the Next.js route handler.
- `headers: Record<string, string>` – The `content-type` for the response.
- `readableStream: ReadableStream<Uint8Array>` – The readable stream used as the response body.

See the [JSON Lines](https://vovk.dev/jsonlines) documentation for more details.

### `toDownloadResponse`

Utility for constructing a `Response` that returns file/binary content with appropriate headers (e.g. `Content-Type`, `Content-Disposition`). It can be used directly in controllers and is also compatible with MCP tool output formatting when returning `Response` objects.

**Arguments:**

- `content: Blob | File | ArrayBuffer | Uint8Array | ReadableStream<Uint8Array> | string{:ts}` — file content/body.
- `opts?:{:ts}`
  - `filename?: string{:ts}` — if provided, sets `Content-Disposition: attachment; filename=...`.
  - `type?: string{:ts}` — overrides the response `Content-Type` (e.g. `audio/mpeg`, `text/csv`, `application/pdf`).
  - `headers?: Record<string, string>{:ts}` — extra headers to merge into the response.

Example (serving audio):

```ts showLineNumbers copy
import { get, toDownloadResponse } from 'vovk';

export default class MediaController {
  @get('audio')
  static getAudio() {
    return toDownloadResponse(buffer, {
      filename: 'track.mp3',
      type: 'audio/mpeg',
      headers: { 'x-hello': 'world' },
    });
  }
}
```

## Decorators

### `@get`, `@post`, `@put`, `@patch`, `@del`, `@head`, `@options`

HTTP method decorators define the HTTP method for a handler. A `HEAD` request without its own `@head` route is answered by the `GET` route, with its status and headers and no body. A request to a path that only other methods have routes for is answered with `405` and an `Allow` header that lists them. They accept two optional arguments:

- `path? = ''` – the path segment for the route.
- `opts?: { cors?: boolean, headers?: Record<string, string>, staticParams?: Record<string, string>[] }` – route options:
  - If `cors` is `true`, CORS headers are added to the response, and the `OPTIONS` method is handled automatically. The automatic preflight approves and lists only the methods whose route on that path has `cors`, so a route without it can't be called cross-origin from a browser. It skips the decorator's `before` and the segment's `onBefore` hooks.
  - `headers` is an object with headers that will be added to the response.
  - `staticParams` (`@get` decorator only) is an array of objects with static parameters that can be used in the route path, for example `[{ id: '123' }]`.

```ts showLineNumbers copy
import { get } from 'vovk';

export default class HelloController {
  @get('world', { cors: true, headers: { 'x-hello': 'world' }, staticParams: [{ id: '123' }] })
  static getHelloWorld(req, { id }: { id: string }) {
    return { hello: 'world', id };
  }
}
```

Each HTTP method decorator has an `.auto()` helper that generates the path from the method name in kebab case, so `getHelloWorld` is served at `get-hello-world`, followed by a `{name}` segment for each property of the procedure's `params` schema. It accepts the same options as the decorator itself.

```ts showLineNumbers copy
import { get } from 'vovk';

export default class HelloController {
  @get.auto({ cors: true, headers: { 'x-hello': 'world' }, staticParams: [{ id: '123' }] })
  static getHelloWorld(req, { id }: { id: string }) {
    return { hello: 'world', id };
  }
}
```

### `@prefix`

The `@prefix(p: string)` decorator is used to prepend a sub-path to all endpoints of a controller. Its use is optional.

```ts showLineNumbers copy
import { prefix, get } from 'vovk';

@prefix('hello')
export default class HelloController {
  @get('world')
  static getHelloWorld() {
    return { hello: 'world' };
  }
}
```

### `@operation`

The `@operation(openAPIOperationObject)` decorator attaches OpenAPI documentation to a procedure. It accepts an object with `summary`, `description`, and any other OpenAPI Operation Object properties.

It also exposes a `tool` helper that can be used to add AI tool–related metadata, stored under the `x-tool` key of the operation object. Read more on the [Deriving AI Tools](https://vovk.dev/tools) page.

```ts showLineNumbers copy
import { operation } from 'vovk';

export default class HelloController {
  @operation.tool({
    title: 'Get Hello World',
  })
  @operation({
    summary: 'Get Hello World',
    description: 'Returns a hello world message',
  })
  @get('world')
  static getHelloWorld() {
    return { hello: 'world' };
  }
}
```

### `@cloneControllerMetadata`

A controller can be listed in several segments; each segment runs its own hooks. Give it a different key in each when the [composed client](https://vovk.dev/composed) includes them, as the client exports one module per name. To serve the same handlers under another prefix, or next to handlers of its own, extend the controller and apply the `@cloneControllerMetadata` decorator to the new class. This copies all metadata (routes, operations, etc.) from the original controller to the new one. The new class keeps the original prefix unless it sets its own, as `@prefix('v2')` does below.

```ts showLineNumbers copy
import { prefix, cloneControllerMetadata } from 'vovk';
import UserController from './user-controller';

@cloneControllerMetadata()
@prefix('v2')
export default class UserControllerV2 extends UserController {}
```

## Utils

### `createDecorator`

`createDecorator` is a higher-order helper for building procedure decorators. It accepts a middleware function with the following parameters:

- `req: VovkRequest` – the request object.
- `next: () => Promise` – a function that calls the next middleware or the actual handler.
- Additional arguments – any extra values passed to the decorator factory.

The second argument is a schema modifier function that can be used to adjust the procedure schema based on the decorator arguments.

```ts showLineNumbers copy
import { createDecorator, get } from 'vovk';

const myDecorator = createDecorator(
  (req, next, a: string, b: number) => {
    // do something with the request
  },
  (a: string, b: number) => {
    // modify schema here
  }
);

export default class MyController {
  @get.auto()
  @myDecorator('foo', 1) // Passes 'foo' as 'a', and 1 as 'b'
  static doSomething() {
    // ...
  }
}
```

See the [decorator docs](https://vovk.dev/decorator) for more details.

### `decorate`

Applies decorator results to a handler without using decorator syntax, providing an alternative to the stacked decorator syntax. Returns an object with a `.handle()` method.

**Arguments:**

- `...decorators: Function[]{:ts}` – one or more decorator results (e.g. `get('path')`, `operation(...)`, `myCustomDecorator(...)`, `procedure(...)`).

**Returns:** an object with a `.handle(handler)` method, which takes the handler. Pass `procedure(...)` without its own `.handle()`: the handler given to `decorate(...).handle()` becomes the procedure's handler.

The controller prefix can be defined as a `static prefix` property on the class instead of using the `@prefix()` decorator:

```ts showLineNumbers copy
import { decorate, post, get, operation, HttpStatus, procedure } from 'vovk';
import { z } from 'zod';

class UserController {
  static prefix = 'users';

  // With procedure validation
  static updateUser = decorate(
    post('{id}'),
    operation({
      summary: 'Update user',
      description: 'Updates a user by ID',
    }),
    operation.error(HttpStatus.BAD_REQUEST, 'Invalid input'),
    procedure({
      params: z.object({ id: z.string() }),
      body: z.object({ email: z.email() }),
      query: z.object({ notify: z.enum(['email', 'push', 'none']) }),
    }),
  ).handle(async (req, { id }) => {
    const body = await req.vovk.body();
    const { notify } = req.vovk.query();
    return { id, ...body, notify };
  });

  // Without validation
  static listUsers = decorate(
    get(),
  ).handle(async () => {
    return [];
  });
}

export default UserController;
```

Decorator application follows the same order as the stacked syntax: the last decorator in the list (closest to the handler) is applied first. See [Decorators Overview](https://vovk.dev/decorator-overview) for guidance on choosing between `decorate` and decorator syntax.

### `fetcher`

Function that creates a data-fetching layer for the RPC client. It is used by default when the fetcher is not [customized](https://vovk.dev/imports#fetcher). A new fetcher can be created using the [createFetcher](#createfetcher) function.

### `createFetcher`

Function that creates a custom fetcher for the RPC client. It accepts a generic type parameter that defines additional options for the resulting RPC methods. The function returns a `fetcher` function that will be used to build the client.

```ts showLineNumbers copy filename="./src/lib/fetcher.ts"
import { createFetcher } from 'vovk';

export const fetcher = createFetcher<{
  successMessage?: string; // "Successfully created a new user"
  useAuth?: boolean; // if true, Authorization header will be set
  someOtherCustomFlag?: boolean; // any custom flag that you want to pass to the RPC method
}>({
  prepareRequestInit: async (init, { useAuth, someOtherCustomFlag }) => {
    // ...
    return {
      ...init,
      headers: {
        ...init.headers,
        ...(useAuth ? { Authorization: 'Bearer token' } : {}),
      },
    };
  },
  transformResponse: async (data, { someOtherCustomFlag }) => {
    // ...
    return data;
  },
  onSuccess: async (data, { successMessage }) => {
    if (successMessage) {
      alert(successMessage);
    }
  },
  onError: async (error) => {
    alert(error.message);
  },
});
```

See the [fetcher docs](https://vovk.dev/imports#fetcher).

### `controllersToStaticParams`

Function that generates an API surface at build time (static params) instead of on-demand at request time. Intended for usage with Next.js `generateStaticParams()` in `[[...slug]]/route.ts`.

**Arguments:**

- `controllers: Record<string, Function>{:ts}` — record of controllers to scan for `@get(...)` routes (including `staticParams` variants).
- `slugName = 'vovk'{:ts}` — *(optional)* the name of your Optional Catch‑all Segment param (the folder name in `[[...<slugName>]]`). Use this when your segment is not `[[...vovk]]`.

**Returns:**

- `Array<Record<string, string[]>>{:ts}` — an array of params objects consumable by `generateStaticParams()` (e.g. `{ vovk: ['hello', 'greeting.json'] }`).

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
// ...
export type Controllers = typeof controllers;

export const dynamic = 'force-static';

export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}

export const { GET } = initSegment({ controllers });
```

If you use a custom slug folder like `src/app/api/[[...custom]]/route.ts`, pass it as the second argument:

```ts showLineNumbers copy
export function generateStaticParams() {
  return controllersToStaticParams(controllers, 'custom');
}
```

See the [segment](https://vovk.dev/segment) documentation for more details.

### `multitenant`

A [Next.js proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) utility that routes subdomains to specific [segments](https://vovk.dev/segment).

**Returns:**

- `action: 'rewrite' | 'redirect' | null` — what the proxy should do.
- `destination?: string` — destination URL for `rewrite`/`redirect` actions.
- `message: string` — explanation/debug info about the routing decision.
- `subdomains: Record<string, string> | null` — wildcard subdomains extracted from the request host.

```ts showLineNumbers copy filename="src/proxy.ts"
// ... proxy ...
const { action, destination, message, subdomains } = multitenant({
  requestUrl: request.url,
  requestHost: request.headers.get('host') ?? '',
  targetHost: process.env.VERCEL ? 'multitenant.vovk.dev' : 'localhost:3000',
  overrides: {
    // ...
  },
});

console.log({ action, destination, message, subdomains });
// ...
```

For more information, see the [multitenant](https://vovk.dev/multitenant) guide.

### `deriveTools`

Utility that turns RPC modules or controllers into AI tools that satisfy the [standard-tool](https://standard-tool.js.org/) convention (`StandardToolV0` interface).

The function accepts the following options:

- `modules: Record<string, object>{:ts}` – key-value object where keys are module names and values are objects with methods. Each method should have a `schema: VovkHandlerSchema` property and either `isRPC: true` (for RPC modules) or the [fn](https://vovk.dev/fn) function (for controllers).
- `onExecute?: (result: unknown, tool: StandardToolV0) => void | Promise{:ts}` – called after each tool execution.
- `onError?: (e: Error, tool: StandardToolV0) => void | Promise{:ts}` – called when an error is thrown during tool execution.
- `toModelOutput` – function that formats the tool result into a model-friendly output.
- `meta?: Record<string, any>{:ts}` – data attached as the `meta` property of each function (controller handler or RPC method).

```ts showLineNumbers copy
import { deriveTools } from 'vovk';
import { UserRPC } from '@/client';
import TaskController from '@/modules/task/task-controller';

const tools = deriveTools({
  meta: { hello: 'world' },
  modules: {
    UserRPC,
    TaskController,
  },
  toModelOutput: (result) => `Result: ${JSON.stringify(result, null, 2)}`,
  onExecute: (result, { name }) => console.log(`${name} executed`, result),
  onError: (e) => console.error('Error', e),
});
```

For more details, see the [Deriving AI Tools](https://vovk.dev/tools) guide.

### `ToModelOutput`

Collection of built-in `toModelOutput` formatters used by `deriveTools` to shape tool results for LLMs.

Documented built-ins:

- `ToModelOutput.DEFAULT` — default formatting when `toModelOutput` is not provided.
- `ToModelOutput.MCP` — formats output according to the MCP tool output shape (supports text, JSON, image, and audio). See [tools](https://vovk.dev/tools) for details and examples.

### `createValidateOnClient`

Creates the `validateOnClient` function, which controls how client-side validation is performed for RPC methods (globally or per segment). `createValidateOnClient` accepts a `validate` function that receives input data, the validation schema, and additional options, and returns the validated data or throws an error if validation fails.

```ts showLineNumbers copy filename="./src/lib/validate-on-client.ts"
import { validateData } from 'validation-library';
import { createValidateOnClient, HttpException, HttpStatus } from 'vovk';

export const validateOnClient = createValidateOnClient({
  validate: async (input, schema, meta) => {
    const isValid = validateData(input, schema);
    if (!isValid) {
      throw new HttpException(HttpStatus.NULL, 'Validation failed');
    }

    return input;
  },
});
```

For more details on client-side validation, see the [customization](https://vovk.dev/imports) page.

### `procedure`

Higher-level helper for defining procedures that adds validation and schema emission on top of a controller handler. The procedure returns `.handle(req, params)` that is used to define the endpoint handler.

```ts showLineNumbers copy
import { procedure } from 'vovk';

export default class UserController {
  static createUser = procedure({
    body: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
    output: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
    }),
  }).handle((req) => {
    // ...
  });
}
```

If `.handle()` is not called, the procedure will throw Not Implemented error.

`procedure` options:

- `body`, `query`, `params` — input validation schemas.
- `output` — output validation schema for JSON responses.
- `iteration` — item schema for JSON Lines streaming responses.
- `contentType` — the `Content-Type` (string or an array of strings) the request body may have, for non-JSON bodies such as forms, text or files. See [`contentType`](https://vovk.dev/procedure#contenttype).
- `disableServerSideValidation` — disable server-side validation (boolean or granular by parts).
- `skipSchemaEmission` — skip JSON Schema emission (boolean or granular by parts).
- `validateEachIteration` — validate each streamed item (iteration), not just the first one.
- `operationObject` — provide OAS details when the `@operation` decorator isn’t applicable.
- `preferTransformed` — choose between transformed vs raw values when using `req.vovk.*`.

Extra capabilities on procedures:

- `.fn(...)` — call the procedure locally (same shape as an RPC call) without HTTP.
- `.schema` — method JSON schema (mirrors the RPC method JSON schema).
- `.definition` — original procedure definition (all options passed to `procedure`).

See the full guide on [procedure](https://vovk.dev/procedure).

### `progressive`

Experimental utility that lets you perform one request and receive multiple responses, each resolved as a separate promise.

```ts showLineNumbers copy
const { users: usersPromise, tasks: tasksPromise } = progressive(ProgressiveRPC.streamProgressiveResponse);
```

Read more in the [Progressive Response](https://vovk.dev/progressive) documentation.

### `HttpException`

Custom error class that extends the built-in `Error`. It represents an HTTP error with a status code and a message. It can be thrown from a procedure and is caught by the framework to produce proper HTTP responses.

```ts showLineNumbers copy
import { HttpException, HttpStatus } from 'vovk';

throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid request', { some: 'cause' });
```

The third argument is optional and can be used to pass additional data that is useful for logging or debugging. It is available via the `error.cause` property on the client side.

Read more in the [responses](https://vovk.dev/response) documentation.

## Inference Types

### `VovkBody`, `VovkQuery`, `VovkParams`

Universal input inference helpers for both RPC methods and controller procedures.

```ts showLineNumbers copy
import type { VovkBody, VovkQuery, VovkParams } from 'vovk';
import { UserRPC } from '@/client';

type Body = VovkBody<typeof UserRPC.updateUser>;
type Query = VovkQuery<typeof UserRPC.updateUser>;
type Params = VovkParams<typeof UserRPC.updateUser>;
```

See [inference](https://vovk.dev/inference).

### `VovkInput`

Combined input type that extracts `params`, `query`, and `body` from a procedure into a single object. Useful for typing Next.js server action arguments.

```ts showLineNumbers copy
import type { VovkInput } from 'vovk';
import type UserController from './user-controller';

type Input = VovkInput<typeof UserController.createUser>;
// { params: VovkParams<...>; query: VovkQuery<...>; body: VovkBody<...> }
```

See [inference](https://vovk.dev/inference).

### `VovkOutput`, `VovkIteration`

Output helpers for validated procedures:

- `VovkOutput<T>` infers the JSON return type when `procedure({ output })` is provided.
- `VovkIteration<T>` infers the yielded item type for JSON Lines streams when `procedure({ iteration })` is provided.

```ts showLineNumbers copy
import type { VovkOutput, VovkIteration } from 'vovk';
import { UserRPC, StreamRPC } from '@/client';

type Output = VovkOutput<typeof UserRPC.updateUser>;
type Iteration = VovkIteration<typeof StreamRPC.streamItems>;
```

See [inference](https://vovk.dev/inference).

### `VovkReturnType`, `VovkYieldType`

Lower-level helpers that infer the actual return/yield types of methods when you *don’t* use validation schemas (i.e. you are relying on the method implementation’s type).

```ts showLineNumbers copy
import type { VovkReturnType, VovkYieldType } from 'vovk';
import { UserRPC, StreamRPC } from '@/client';

type Return = VovkReturnType<typeof UserRPC.updateUser>;
type Yield = VovkYieldType<typeof StreamRPC.streamItems>;
```

See [inference](https://vovk.dev/inference).

## Other Types and Enums

### `VovkRequest`

Mirrors the Next.js built-in `NextRequest` to provide better typing for `.json()`, `.nextUrl.searchParams`, and a `vovk` property with advanced input retrieval helpers.

`VovkRequest` doesn't extend `NextRequest` directly in order to keep the **vovk** package independent of **next** package.

See the [req.vovk](https://vovk.dev/req-vovk) documentation for more information.

#### `HttpStatus` enum

Used to throw and catch errors produced by the server. Note the `NULL` member, which can be used to simulate HTTP errors for client-side validation failures.

```ts showLineNumbers copy
export enum HttpStatus {
  NULL = 0,
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
}
```

#### `HttpMethod` enum

Represents the HTTP methods:

```ts showLineNumbers copy
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}
```

### `VovkSchema`

The full schema of the composed client or of a single segment in a segmented client. Shape:

```ts showLineNumbers copy
{
  segments: { [key: string]: VovkSegmentSchema };
  meta?: VovkMetaSchema
}
```

See the [schema docs](https://vovk.dev/schema) for more details.

### `VovkConfig`

The shape of the [config](https://vovk.dev/config) file.

### `StandardToolV0`

The shape of an LLM tool returned by the [deriveTools](#derivetools) function, defined by the [standard-tool](https://standard-tool.js.org/) convention. Exported from `vovk/internal`.

See the [Deriving AI Tools](https://vovk.dev/tools) documentation for more information.

### `VovkJSONSchemaBase`

Basic JSON Schema object with `type`, `properties`, and other standard JSON Schema keywords.

### `VovkFetcher`

Object that represents a [fetcher](#fetcher) function used to make API requests.

See the [fetcher docs](https://vovk.dev/imports#fetcher) for more information.

### `VovkStreamAsyncIterable`

The stream a client method returns for a [JSON Lines](https://vovk.dev/jsonlines) response: an async iterable of the items with `status`, `asPromise`, `onIterate`, `abortController` and `abortSilently`. Generated clients use it in their method types, OpenAPI mixins included.

### `VovkValidateOnClient`

Function type that represents the client-side validation function created by [createValidateOnClient](#createvalidateonclient).

See the [client-side validation docs](https://vovk.dev/imports#validateonclient) for more details.