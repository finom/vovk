---
title: "Vovk.ts Documentation Context"
description: "Full documentation for the Vovk.ts framework, excluding the Realtime Kanban tutorial."
see_also:
  label: "Realtime Kanban Context"
  url: https://vovk.dev/context/realtime-ui.md
chars: 394290
est_tokens: 98573
---

Page: https://vovk.dev

Vovk.ts

# Back-end Framework for Next.js App Router

Back-end Framework for Next.js App Router. One codebase → type-safe clients, OpenAPI, and AI tools.

Vovk.ts adds an API layer on top of Next.js App Router Route Handlers. Its unit is the **procedure**: a typed function with its schema. From one procedure, Vovk.ts derives the HTTP endpoint, the local `.fn()` call, the typed RPC client, the OpenAPI document and the AI tool with `execute`. You don't write a separate contract or glue code.

To start, run the `init` command in an existing Next.js project.

```bash npm2yarn
npx vovk-cli@latest init
```

> Requires Node.js 22+, Next.js 15+ and TypeScript 5.5+. &nbsp; [Quick Start](https://vovk.dev/quick-install) · [Manual Install](https://vovk.dev/manual-install) · [Claude Plugin](https://vovk.dev/claude) · [GitHub](https://github.com/finom/vovk)

---

## What it looks like

A procedure is a typed, validated function. Define its params, query, body and output with [`procedure`](https://vovk.dev/procedure), and call it on the server in SSR, server components or server actions:

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

Services hold the business logic. Plain classes, no decorators:

```ts
export default class UserService {
  static async getUser(id: VovkParams<typeof UserController.getUser>['id']) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpException(HttpStatus.NOT_FOUND, 'User not found');
    return user;
  }
}
```

Add an HTTP decorator, and the same procedure is also a Next.js Route Handler, with the same call shape:

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

The CLI reads the emitted schema and generates a `fetch`-based client with the `.fn()` signature:

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

Add `@operation`, and the same procedure is also an LLM tool. Pass controllers (in-process) or RPC modules (over HTTP) to `deriveTools`:

```ts
const tools = deriveTools({ modules: { UserRPC, TaskController } });
// [{ name, description, inputSchema, execute, ... }, ...]
```

---

## What one procedure becomes

From one function and its schema, Vovk.ts derives:

- the **Next.js Route Handler**: add an HTTP decorator to serve the procedure as an endpoint
- the **local `.fn()` call**, with the same call shape as the RPC client, for SSR, server components and server actions
- the **typed RPC client module**, generated from the emitted schema, using `fetch`
- the **OpenAPI 3.x document**, from the same schema, so you don't maintain a separate spec
- the **LLM tool** with `name`, `description`, `inputSchema` and `execute`, from `deriveTools`
- a generated **`README.md`** that documents the client library

---

## How it works

### Segments

Controllers live in a [segment](https://vovk.dev/segment): a Next.js catch-all route that compiles into its own serverless function. Each segment has its own configuration.

```ts filename="src/app/api/[[...vovk]]/route.ts"
const controllers = { UserRPC: UserController };
export type Controllers = typeof controllers;
export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({ controllers });
```

### Schema emission

Handlers are the source of truth. Vovk.ts derives the schema from your code and writes it to `.vovk-schema/` as a build artifact. The tools read the schema; the server runtime doesn't.

```
.vovk-schema/
  root.json
  customer.json
  nested-segment/
    foo.json
  _meta.json
```

### Generated TypeScript clients

Controllers compile into RPC modules that all take `{ params, query, body }`. Generate one [composed client](https://vovk.dev/composed) or [per-segment clients](https://vovk.dev/segmented). See [TypeScript Client](https://vovk.dev/typescript).

Client types map directly to server code, so jump-to-definition and JSDoc on hover work on generated RPC methods.

### Validation

Vovk.ts works with any library that implements [Standard Schema](https://standardschema.dev/schema) and [Standard JSON Schema](https://standardschema.dev/json-schema), such as **Zod**, **Valibot** and **ArkType**.

### OpenAPI mixins

Vovk.ts converts third-party OpenAPI 3.x schemas into modules with the same call shape as your own endpoints. You use them through the same client and tools:

```ts
import { PetstoreAPI } from '@/client';

const pet = await PetstoreAPI.getPetById({ params: { petId: 1 } });
```

See [OpenAPI Mixins](https://vovk.dev/mixins).

### AI tool derivation

Add `@operation` to methods, then derive tools for LLM function calling from controllers (in-process), RPC modules (over HTTP) or third-party APIs:

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

Each tool has `name`, `description`, `inputSchema` (a Standard Schema that also gives JSON Schema) and an `execute` function. See [Deriving AI Tools](https://vovk.dev/tools).

### Streaming

See [JSON Lines](https://vovk.dev/jsonlines) for generator handlers, the client's async iterator and `JSONLinesResponder`.

### Local procedure calls

Call a procedure on the server with `.fn()`. It takes the same arguments as the generated HTTP client. Use it in SSR/PPR, server components and server actions. See [Calling Procedures Locally](https://vovk.dev/fn).

### Docs and publishing

Generate OpenAPI 3.x documentation, and package TypeScript, Python or Rust client libraries for publishing.

See [Generate Command](https://vovk.dev/generate) · [Bundle Command](https://vovk.dev/bundle) · [Python Client](https://vovk.dev/python) · [Rust Client](https://vovk.dev/rust)

---

## Packages

| Package | Role | Version | Install |
|---------|------|--------|---------|
| **`vovk`** | Runtime: decorators, `procedure`, routing, `deriveTools` |  | production |
| **`vovk-cli`** | CLI: codegen, mixins, docs, bundling |  | dev |
| **`vovk-ajv`** | Client-side validation with AJV |  | production (optional) |
| **`vovk-python`** | Python client generation (experimental) |  | dev (optional) |
| **`vovk-rust`** | Rust client generation (experimental) |  | dev (optional) |

See [Packages](https://vovk.dev/packages).

---

## Claude Plugin

The official **Claude Code plugin** has 15 topic skills that teach the coding agent Vovk.ts as you describe what to build. A skill loads only when needed: *"scaffold a tenant"* loads the multitenant skill, *"stream chat tokens"* the JSON Lines one.

Install it inside Claude Code:

```
/plugin marketplace add finom/vovk
/plugin install vovk@vovk
/reload-plugins
```

See [Claude Plugin](https://vovk.dev/claude) for the full skill list and how the framework's layout helps the agent.

---

## Examples

The ["Hello World" example](https://vovk.dev/hello-world) shows Vovk.ts end to end in one project: Zod-validated endpoints, JSON Lines streaming, composed and segmented clients, OpenAPI docs with Scalar, and bundled client libraries in TypeScript, Python and Rust.

The [Multitenancy Tutorial](https://vovk.dev/multitenant) shows how to serve several tenants from different subdomains in one Next.js app.

The [Realtime Kanban](https://vovk.dev/realtime-ui) example builds a board that users, bots, AI agents and MCP clients update in real time. It covers state normalization, database polling, AI chat, voice AI and Telegram.

More snippets are on the [Random Examples](https://examples.vovk.dev) site.

---

## Vocabulary

| Term | Meaning |
|------|---------|
| **Controller** | A class that groups procedures as `static` members; HTTP decorators serve them as endpoints |
| **Procedure** | A typed, validated function made with [`procedure`](https://vovk.dev/procedure). Call it locally with `.fn()`, serve it over HTTP with a decorator, or derive an LLM tool from it |
| **Segment** | A part of the back end with its own route and function |
| **RPC module** | Generated client module that mirrors a controller |
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

The CLI asks a few questions. Then it installs the dependencies you chose, updates the npm scripts, enables `experimentalDecorators` in **tsconfig.json** and creates a [config](https://vovk.dev/config) file.

```bash npm2yarn copy
npx vovk-cli@latest init
```

**More info:**

- [vovk init](https://vovk.dev/init)

### Create a segment

Create the root segment at **./src/app/api/[[...vovk]]/route.ts**:

```bash npm2yarn copy
npm exec -- vovk new segment
```

**More info:**

- [Segment](https://vovk.dev/segment)

### Generate a controller and a service

This command writes **user-controller.ts** and **user-service.ts** to **./src/modules/user/** from built-in templates, which you can customize, and updates the segment’s **route.ts**:

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

The `dev` script runs the Next.js dev server and the Vovk.ts watcher together. Meanwhile, Vovk.ts writes the schema files to **.vovk-schema/** (commit them) and the client library to **src/client** (git-ignored, generated again on every build).

```bash npm2yarn copy
npm run dev
```

Then open http://localhost:3000/api/users/123 to see a placeholder response from `UserController.getSingleUser`: `{"message":"TODO: get single user","id":"123"}{:json}`

The segment also serves its schema at [http://localhost:3000/api/\_schema\_](http://localhost:3000/api/_schema_), only when `NODE_ENV` is `development`.

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

Or manage the request state with [React Query](https://react-query.tanstack.com/):

```ts showLineNumbers copy
import { useQuery } from '@tanstack/react-query';
import { UserRPC } from '@/client';
// ...
const { data, error, isLoading } = useQuery({
  queryKey: UserRPC.getSingleUser.queryKey(['123']),
  queryFn: () => UserRPC.getSingleUser({ params: { id: '123' } }),
});
```

**More info:**

- [TypeScript Client](https://vovk.dev/typescript)

### Deploy

`vovk init` adds a `prebuild` script, so `vovk generate` runs before `next build`. Yarn 2+ doesn't run `pre` scripts, so there `vovk init` puts `vovk generate` at the start of `build`. If you change the scripts yourself, run it before the build:

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

- `vovk` is the runtime library.
- `vovk-cli` is the Vovk.ts command-line tool, a development dependency.

```sh npm2yarn copy
npm i vovk
```

```sh npm2yarn copy
npm i -D vovk-cli
```

**More info:**

- [Packages](https://vovk.dev/packages)

## Create the config file

Create **vovk.config.mjs** in the project root:

```ts showLineNumbers copy filename="vovk.config.mjs"
// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {};

export default vovkConfig;
```

**More info:**

- [Config](https://vovk.dev/config)

## Install a validation library and enable client-side validation

To validate with Zod on the server and with Ajv on the client, install:

```sh npm2yarn copy
npm i zod vovk-ajv
```

Set `validateOnClient` in the config file to turn on client-side validation:

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

You can run Vovk.ts and the Next.js server together in two ways. The explicit way runs both with the `concurrently` package, and you set `PORT`. The implicit way lets the Vovk.ts CLI start Next.js, and **vovk-cli** picks the port.

The `prebuild` script runs `vovk generate` before `next build`, so the client library exists when Next.js builds. Yarn 2+ doesn't run `pre` scripts: there, use `"build": "vovk generate && next build"` instead.

    Install `concurrently`, and `cross-env`, which sets `PORT` on Windows too:
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

## Enable decorators

In **tsconfig.json**, set `"experimentalDecorators"` to `true`. `vovk init` sets it too.

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
    // ...
  }
}
```

A webpack build needs the flag: without it, `next build --webpack` fails, and webpack is the default build in Next.js 15. Turbopack, the default in Next.js 16, compiles Vovk.ts decorators with or without the flag, and TypeScript 5.0+ type-checks them either way. See [Decorators Overview](https://vovk.dev/decorator-overview) for the decorators Vovk.ts provides.

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

Create the root [segment](https://vovk.dev/segment) **/src/app/api/[[...vovk]]/route.ts**. **[[...vovk]]** is an ["Optional Catch-all Segment"](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#optional-catch-all-segments); the slug can be any valid name, such as **[[...mySlug]]**.

In the code below, `HelloRPC` is the name of the generated RPC module, and `HelloController` is the controller from the previous step.

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
import { initSegment } from 'vovk';
import HelloController from '../../../modules/hello/hello-controller';

const controllers = { HelloRPC: HelloController };

// the client infers its types from this
export type Controllers = typeof controllers;

// export Next.js route handlers
export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({ controllers });
```

**More info:**

- [Segment](https://vovk.dev/segment)

## Run the dev server

Run `npm run dev` to start Vovk.ts and Next.js together.

```sh npm2yarn copy
npm run dev
```

Open [http://localhost:3000/api/greetings/greeting](http://localhost:3000/api/greetings/greeting) to see the result.

## Create a React component

Once the client is generated to `src/client`, import it as **@/client**, or with a relative path if your project has no `@/*` alias.

```tsx showLineNumbers copy filename="src/app/page.tsx"
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

  In VS Code, you may need to
  restart the TS server
  after you add a new controller class. Other changes, such as new methods or new validation, are picked up without a
  restart.

**More info:**

- [TypeScript Client](https://vovk.dev/typescript)
- [Composed Mode](https://vovk.dev/composed)
- [Segmented Mode](https://vovk.dev/segmented)

---

Page: https://vovk.dev/claude

# Claude Plugin

The official **Claude Code plugin for Vovk.ts** has topic skills that teach the coding agent the framework as you describe what to build. A skill loads only when needed: "scaffold a new tenant" loads the multitenant skill, "stream chat tokens" the JSON Lines one, and so on.

The plugin lives in the Vovk.ts repo, with the skills at the repo root, and ships with every framework release.

## What the agent gets from Vovk.ts

Vovk.ts sets where code goes, so the agent can predict it:

- **Code by feature in `src/modules//`**: a controller and a service per feature, not files spread across `lib/`.
- **Controller and service apart**: controllers define the decorated procedures; services, plain classes, hold the business logic. *What the endpoint is* stays apart from *what it does*.
- **Service methods, not loose helpers**: fewer files and a predictable layout. The agent finds the right file on the first try.
- **One source of truth**: the same `procedure().handle()` serves the HTTP endpoint, the [SSR call](https://vovk.dev/fn) (`.fn()`) and the [AI tool](https://vovk.dev/tools) (`deriveTools`). Nothing is duplicated, so the model has less to reconcile.
- **Plain REST**: `curl` and `fetch` work. Types go end to end without a custom protocol.
- **[Multitenancy](https://vovk.dev/multitenant)**: the `multitenant()` proxy and a segment per tenant host many tenants on subdomains in one Next.js app.
- **[OpenAPI](https://vovk.dev/openapi) and AI tools**: the schema comes from the procedures, Scalar shows the generated code samples, and one line makes a procedure an LLM tool.

## Why a plugin

Without it, asking Claude to *"scaffold a Vovk procedure with Zod validation"* goes one of two ways. The model makes up an API from months-old training data, though the Vovk.ts API has changed. Or it fetches `vovk.dev` mid-task, which is slow, hits rate limits and often loads the wrong page first.

With the plugin, the agent loads the framework's patterns as topic skills:

- **One topic at a time.** Only the needed skills load, so Claude doesn't read thousands of lines of docs for one question.
- **Self-contained.** The base skill, loaded with every other skill, tells the agent *not to fetch vovk.dev mid-task*: the plugin is the source of truth. It works offline, with a predictable cost and no rate limits.
- **Handoffs between skills.** A skill points to the one that owns a topic: mixins to tools for LLM tools, procedure to jsonlines for streaming. The agent loads the context it needs, not the context next to it.
- **Compressed text.** Terse "caveman" prose: about 10% fewer tokens per load, with the same content.

## Install

Run the command for your agent:

| Agent | Install |
|-------|---------|
| **Claude Code** (CLI) | `claude plugin marketplace add finom/vovk && claude plugin install vovk@vovk` |
| **Claude Code** (interactive) | In the session, run `/plugin marketplace add finom/vovk`, then `/plugin install vovk@vovk` |
| **Cursor** | `npx skills add finom/vovk -a cursor` |
| **Windsurf** | `npx skills add finom/vovk -a windsurf` |
| **Copilot** | `npx skills add finom/vovk -a github-copilot` |
| **Cline** | `npx skills add finom/vovk -a cline` |
| **Any other** | `npx skills add finom/vovk` |

`finom/vovk` points to `.claude-plugin/marketplace.json` in the GitHub repo. The plugin and the marketplace are both named `vovk`: `vovk@vovk` is `<plugin-name>@<marketplace-name>`.

For a local checkout (development), use its path: `claude plugin marketplace add /path/to/vovk` (the repo root).

### Verify

In Claude Code, run `/plugin`: the **Installed** tab lists `vovk`. Skill names start with `vovk:`; typing `/vovk:` (with the colon) lists all 15 skills. In other agents, the skill files are in the agent's skill folder, such as `.cursor/skills/`.

## Skills

The plugin has fifteen topic skills that cover every part of Vovk.ts:

- **`vovk:init`** — set up Vovk.ts in a Next.js App Router project, or create a new Next.js app and run `vovk init` in it.
- **`vovk:base`** — base rules loaded with every other vovk:* skill: commit policy for `.vovk-schema/`, runtime requirements, template names, the `_schema_` endpoint, a short API and inference-type summary (`VovkBody`, `VovkOutput`, …).
- **`vovk:config`** — the `vovk.config.{mjs,cjs,js}` shape, every config key and default (`rootEntry`, `schemaOutDir`, `composedClient`, `segmentedClient`, `clientTemplateDefs`, `outputConfig`, `bundle`, …), and the `tsconfig.json` setup.
- **`vovk:segment`** — segments (root, named, static), `initSegment`, segment priority, `generateStaticParams`.
- **`vovk:multitenant`** — routing tenants by subdomain: the `multitenant()` proxy, the `overrides` shape, per-tenant segments and front-end pages, wildcard DNS.
- **`vovk:procedure`** — procedures, validation (Zod / Valibot / ArkType), controllers, HTTP decorators, `req.vovk`, error handling, content types, `.fn()` for SSR / server components / server actions.
- **`vovk:decorators`** — built-in and custom decorators (`createDecorator`), authorization patterns, `req.vovk.meta()`, stacking order.
- **`vovk:rpc`** — the generated RPC client (`@/client`), composed vs segmented clients, call shape, `createFetcher`, error rethrow, type inference from client methods.
- **`vovk:jsonlines`** — JSON Lines streaming: generator handlers, `JSONLinesResponder`, `progressive()`, client async iteration, `using`, `asPromise`, abort.
- **`vovk:openapi`** — OpenAPI 3.x generation: `@operation` metadata, `outputConfig.openAPIObject`, per-segment overrides, Scalar docs, `_schema_` endpoint.
- **`vovk:mixins`** — import third-party OpenAPI 3.x schemas as typed client modules, called like your own RPC modules.
- **`vovk:tools`** — procedures as LLM tools with `deriveTools()`, MCP-compatible output, `@operation`, controllers vs RPC modules, OpenAI / Anthropic / MCP wiring.
- **`vovk:bundle`** — the `vovk bundle` command for publishable TypeScript SDKs.
- **`vovk:python`** — generate a typed Python client (`vovk-python`), `py` / `pySrc` templates, `TypedDict` shapes, JSON Lines via Python generators, PyPI publishing.
- **`vovk:rust`** — generate a typed Rust crate (`vovk-rust`), `rs` / `rsSrc` templates, async `reqwest` call shape, reading a `futures::Stream`, crates.io publishing.

## First prompts to try

The skills load on their own when you describe what to build. Pick your kind of project:

- **Greenfield** — *"Set up Vovk.ts in a new Next.js project. I want a `/api/tasks` CRUD endpoint with Zod validation, and a Next.js page that consumes it through the typed client."*
- **Existing Next.js project** — *"Add Vovk.ts to my existing Next.js app and scaffold a UserController with `getUser` / `createUser`."*
- **Stream-heavy work** — *"Add a `/api/chat` JSON Lines streaming endpoint that proxies OpenAI completions, plus a Python script that consumes the stream."*

  Short prompts such as *"create a backend for Next.js"* don't always load a skill: Claude finds them too general. Mention "Vovk" or "vovk-cli" once, and the right skill loads.

## Reporting bugs

A skill that writes wrong code or contradicts itself is a plugin bug. Open an issue at github.com/finom/vovk/issues with your prompt and the skill that loaded.

**More info:**

- [Skills source](https://github.com/finom/vovk/tree/main/skills)
- [Claude Code docs — Plugins](https://docs.claude.com/en/docs/claude-code/plugins)

---

Page: https://vovk.dev/segment

# Segment

## Overview

A **segment** is the part of the back end where controllers are initialized. Segments are built on [Next.js Optional Catch-All Segments](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments). They split the back end into smaller serverless functions, each with its own configuration (the Next.js constants it exports, such as `runtime` or `maxDuration`).

![Segment](https://vovk.dev/draw/segment-concept.svg)

Each segment owns a path, such as `/api/foo` or `/api/bar`, and is a small back end of its own. Segments split the back end as pages split the front end in Next.js. To initialize a segment, call `initSegment` in the **route.ts** file of a **[[...slug]]** folder. It returns the Next.js route handlers (`GET`, `POST` and so on) of the segment. Vovk.ts names the slug `vovk`, but any valid name works.

When `NODE_ENV` is `"development"` (as with `next dev`), each segment serves its schema at a `_schema_` endpoint. The [dev CLI](https://vovk.dev/dev) reads it and writes the JSON files in **.vovk-schema/**. This way, Next.js code imports no Node.js modules, and the schema tooling stays simple.

Vovk.ts uses Optional Catch-All Segments instead of [Catch-All Segments](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#catch-all-segments), so a segment can have a root endpoint.

## Creating Segments

Call `initSegment` in **route.ts** and export the route handlers it returns: `GET`, `POST`, `PATCH`, `PUT`, `HEAD`, `OPTIONS` and `DELETE`. A method the file doesn't export never reaches Vovk.ts: Next.js answers `PATCH` with `405`, and a CORS preflight (`OPTIONS`) without CORS headers. `initSegment` takes:

- `controllers` — the controllers of the segment. The object keys are the names of the generated RPC modules (any name works if `emitSchema` is `false`), and the values are the controllers.
- `segmentName` — the segment name. Defaults to an empty string, the root segment.
- `emitSchema` — whether to emit the segment schema. Defaults to `true`.
- `exposeValidation` — whether to expose validation data. Defaults to `true`.
- `onError` — a function called on errors with:
  - `error: Error` — the error.
  - `request: VovkRequest` — the incoming request (headers, URL and so on).
- `onBefore` — a function called with the request before the decorators and the handler run; an error it throws becomes the response.
- `onSuccess` — a function called with the handler's result and the request once the handler returns; for a stream, that is when the stream starts, not when it ends.

**route.ts** also exports `type Controllers = typeof controllers{:ts}`, which the [RPC client](https://vovk.dev/typescript) infers its types from.

### The Root Segment

```sh npm2yarn copy
npm exec -- vovk new segment
```

See [`vovk new` documentation](https://vovk.dev/new).

A simple single-page app needs only the root segment. It deploys the back end as one serverless function.

Example **route.ts** for a single-segment app:

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
import { initSegment } from 'vovk';
import UserController from '../../../modules/user/user-controller';
import PostController from '../../../modules/post/post-controller';

export const maxDuration = 300; // Next.js route handler option

const controllers = {
  UserRPC: UserController,
  PostRPC: PostController,
};

// the client code uses this type
export type Controllers = typeof controllers;

// export the Next.js route handlers
export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  controllers,
});
```

The [schema](https://vovk.dev/schema) of the root segment is in **.vovk-schema/root.json**.

  The name **root** is only for the file name. In the config and elsewhere, the root segment's name is an empty string.

### Multiple Segments

Create more segments to split the back end into separate serverless functions. Reasons include:

- Using different Next.js route handler options or `initSegment` options.
- Reducing bundle size by splitting code.
- Separating areas of the app, such as root, `admin`, `customer` and `customer/public`.
- Serving several API versions, such as `v1` and `v2`.
- Creating a [static segment](https://vovk.dev/static-segment) for OpenAPI specs, historical data and so on.

The folder of a segment sets both its API path and its name. For example, **/src/app/api/`segment-name`/[[...slug]]/** is served at **/api/`segment-name`**. Segments can nest to any depth.

For a segment other than the root, pass `segmentName` to `initSegment`:

```ts showLineNumbers copy filename="src/app/api/foo/[[...vovk]]/route.ts"
// ...

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'foo',
  controllers,
});
```

The schema of `foo` is in **.vovk-schema/`foo`.json**.

For a deeper folder, such as **/src/app/api/`foo/bar/baz`/[[...slug]]/**, set `segmentName` to `"foo/bar/baz"`. Its schema is in **.vovk-schema/`foo/bar/baz`.json**.

## Segment Priority

With several segments, the most specific (deepest) one wins. For example:

- **/src/app/api/[[...slug]]/** — the root segment
- **/src/app/api/foo/[[...slug]]/** — the `foo` segment
- **/src/app/api/foo/bar/[[...slug]]/** — the `foo/bar` segment

The `foo/bar` segment handles a request to **/api/foo/bar**. A request it doesn't match goes to `foo` if `foo` matches it, and to the root segment otherwise.

  The `rootEntry` [config](https://vovk.dev/config) option changes the API folder name from `api` to any other name. An empty string serves the API from the app root. The root segment then takes `/`, so it can't sit next to a root **page.tsx**: Next.js refuses the two routes.

## RPC Client

The same RPC client, with client-side validation and type inference, calls a [static](https://vovk.dev/static-segment) or a dynamic API.

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
npm exec -- vovk new segment openapi --static # creates the static segment "openapi" at src/app/api/openapi/[[...vovk]]/route.ts
```

Next.js can pre-render API endpoints at build time with [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params). The Vovk.ts `controllersToStaticParams` helper uses this to emit static API endpoints, for minimal latency. Use it for OpenAPI definitions, historical datasets (refreshed from time to time by CI/CD) or other data that rarely changes. It also works in [Static Export mode](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports), with the `output: 'export'` Next.js option:

```ts showLineNumbers copy filename="next.config.js"
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
};

module.exports = nextConfig;
```

Make `generateStaticParams` return `controllersToStaticParams` with your controllers, and Next.js pre-renders the route handler at build time. The segment needs no `dynamic` export, with `cacheComponents` on or off. Next.js refuses `dynamic = 'force-static'` when `cacheComponents` is on, as `create-next-app` 16.4+ sets it, so remove one that a segment still exports.

Next.js also refuses `output: 'export'` when `cacheComponents` is on. For a static export, set `cacheComponents: false` in **next.config**.

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
// ...
export type Controllers = typeof controllers;

export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}

export const { GET } = initSegment({ controllers });
```

On static hosting, such as GitHub Pages, end the endpoint paths with `.json`, so the host sends the right HTTP headers.

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

This gives an endpoint such as [https://vovk.dev/api/hello/greeting.json](https://vovk.dev/api/hello/greeting.json), hosted on GitHub Pages.

With a slug other than the default `vovk`, such as `/src/app/api/[[...custom]]/route.ts`, pass it as the second argument:

```ts showLineNumbers copy
export function generateStaticParams() {
  return controllersToStaticParams(controllers, 'custom');
}
```

## Static Endpoint Parameters

The `staticParams` option of `@get` lists the param combinations to render, so one handler serves several static paths. A param in the controller's prefix, such as `@prefix('users/{userId}')`, takes its value from the same objects. Below, one handler renders six variants of two params: section (`a | b`) and page (`1 | 2 | 3`).

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

[static-klines](https://github.com/finom/static-klines) is a Vovk.ts static segment. It pre-renders historical Binance Spot candles into ~17,000 plain JSON files on GitHub Pages. The whole API is static files with no server: no rate limits, no server compute, and no limit on caching. Its TypeScript and Python clients are generated from the same Zod schemas the server uses, and published. It shows `controllersToStaticParams` on a full dataset.

---

Page: https://vovk.dev/procedure

# Controller & Procedure

A **controller** is a class that groups endpoints as `static` members. [`initSegment`](https://vovk.dev/segment#creating-segments) initializes the class (it doesn't create an instance) in a [segment route](https://vovk.dev/segment), and that makes its members HTTP endpoints.

A **procedure** is one such member: one endpoint, usually decorated with an HTTP method such as `@get()`, `@post()`, `@put()`, `@patch()` or `@del()`. You can write it in two styles, and both compile to Next.js Route Handlers:

- **Bare static method**: takes `(req: NextRequest, params)`, as a plain Route Handler does. It still lives in a class, with a generated, typed [RPC client](https://vovk.dev/typescript) and [segments](https://vovk.dev/segment).
- **[`procedure()`](#procedure) wrapper**: turns the static method into a typed function that validates with `body`, `query`, `params` and `output` schemas. It adds [`.fn()`](https://vovk.dev/fn) local calls (SSR, server actions, AI tool execution), [OpenAPI](https://vovk.dev/openapi) generation and [AI tool exposure](https://vovk.dev/tools).

Use the bare style for simple cases, and `procedure()` when you want validation or a function you can call without HTTP.

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

To initialize the class, add it to the `controllers` object of `initSegment` in a [segment route](https://vovk.dev/segment):

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
import { initSegment } from 'vovk';
import UserController from '../../../modules/user/user-controller';

const controllers = {
  UserRPC: UserController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({ controllers });
```

The object key is the name of the RPC module on the client:

```ts showLineNumbers copy
import { UserRPC } from '@/client';

// sends PUT /api/users/69?notify=push
const updatedUser = await UserRPC.updateUser({
  params: { id: '69' },
  query: { notify: 'push' },
  body: userData,
});
```

The RPC method takes `body` and `query` because the request is typed with [`VovkRequest`](#vovkrequest-type); with `NextRequest` it takes `params` only.

See [TypeScript Client](https://vovk.dev/typescript).

> [!TIP]
> 
> For the root endpoint of a [segment](https://vovk.dev/segment), use no prefix and no path (or an empty string) in the HTTP decorator.
> ```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
> import { get } from 'vovk';
> import type { NextRequest } from 'next/server';
> 
> export default class UserController {
>   @get()
>   static async listUsers(req: NextRequest) {
>     // ...
>   }
> }
> ```

## Auto-Generated Endpoints

Every HTTP decorator has an `.auto` method that makes the endpoint path from the method name, so the handler reads more like RPC.

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

With a `params` schema, `.auto()` also adds each param to the path: `getUser` with `{ id }` becomes `get-user/{id}`.

## Request Headers

A procedure can use any Next.js API, such as cookies and headers, from the `next` package. See the Next.js [documentation](https://nextjs.org/docs/app/api-reference/functions/headers).

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { put, prefix } from 'vovk';
import type { NextRequest } from 'next/server';
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

Or read `req.headers` from the [Web Request API](https://developer.mozilla.org/en-US/docs/Web/API/Request/headers): `req.headers.get('user-agent'){:ts}`.

## `VovkRequest` Type

`VovkRequest` mirrors the `NextRequest` type and adds type parameters for the request body (the `json` method) and the query (the `searchParams` property). With them, the procedure reads these parts of the request with types.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { put, prefix, type VovkRequest } from 'vovk';
import type { User } from '../../types';

@prefix('users')
export default class UserController {
  // Example request: PUT /api/users/69?notify=push
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

`VovkRequest` extends `Request`, not `NextRequest`, so the **vovk** package doesn't depend on the **next** package. It copies the documented `NextRequest` properties: `cookies` (with the `get`, `getAll`, `set`, `delete`, `has` and `clear` methods) and `nextUrl` (with `basePath`, `buildId`, `pathname`, `search` and a typed `searchParams`).

`searchParams` reads the raw URL, so its types follow what the URL holds. A required string field keeps its type, and any other field is a string. `get` may return `null` for an optional field, an array or an object (the client sends an array as `tags[0]=a`, under keys of its own). The parsed query comes from [`req.vovk.query()`](https://vovk.dev/req-vovk).

## `procedure` Function

The `procedure` function turns a static method into a **typed, validated function**. It takes schemas for the body, query, params and output from any library that implements both [Standard Schema](https://standardschema.dev/schema) and [Standard JSON Schema](https://standardschema.dev/json-schema), such as [Zod](https://zod.dev/), [Valibot](https://valibot.com/) or [Arktype](https://arktype.io/). A schema that implements only Standard Schema, as Zod before 4.2 does, still validates, but `procedure(){:ts}` warns and emits its JSON Schema as `{}`.

With these three libraries, a type that JSON Schema can't describe, such as a `Date{:ts}` or a `bigint{:ts}`, is emitted as `{}` (any value). The server still validates it, but client-side validation and the [Python](https://vovk.dev/python) and [Rust](https://vovk.dev/rust) clients accept any value there.

`procedure()` returns an object with a `.handle()` method, which takes the handler. The handler gets the request typed as `VovkRequest<TBody, TQuery, TParams>{:ts}`, and the validated `params: TParams{:ts}` as its second argument. Without a `params` schema, the second argument and `req.vovk.params()` hold the route params as strings, typed `Record<string, string>{:ts}`.

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
    const { email } = await req.vovk.body();
    const { notify } = req.vovk.query();
    // ...
  });
}
```

`req.json()` and `req.nextUrl.searchParams` work over HTTP only. A [`.fn()`](https://vovk.dev/fn) call and a [derived AI tool](https://vovk.dev/tools) give the handler only `req.vovk`, so a procedure that is called both ways reads its body and query with `req.vovk.body()` and `req.vovk.query()`.

Without `.handle()`, the procedure throws Not Implemented (501) when called.

To keep business logic in its own layer, see [Services](https://vovk.dev/service).

### HTTP decorator is optional

A procedure made with `procedure()` works without an HTTP decorator. You call it with [`.fn()`](https://vovk.dev/fn) in SSR, server components, server actions, AI tool execution and so on. The decorator also serves the procedure as an HTTP endpoint and adds it to the generated RPC client. See [Calling Procedures Locally](https://vovk.dev/fn) for the full reference, including how to attach a standalone procedure to a controller later.

### `procedure` Options

#### `body`, `query`, and `params`

`body`, `query` and `params` take the input schemas. They validate the request data before the handler runs.

A request without a body is validated as `undefined{:ts}`, so an optional schema such as `z.object({ ... }).optional(){:ts}` lets the client leave the body out. So is an empty body with a JSON content type. An empty text or an empty file is a body.

Data that fails validation gets a `400` response. Its message and its `cause.issues` hold the first 20 issues, and the message says how many more there are. An issue keeps its `message`, its `path` as a list of keys, and the library's other fields that hold text, a number or a boolean, such as Zod's `code`. Fields that copy the failed value are left out.

#### `output` and `iteration`

`output` and `iteration` take the output schemas: `output` for JSON responses, `iteration` for [JSON Lines](https://vovk.dev/jsonlines). Both are optional. When set, the RPC method's result type follows `output`, and the type of its stream items follows `iteration`, instead of the handler's return type. [OpenAPI](https://vovk.dev/openapi), [AI tools](https://vovk.dev/tools), and the [Python](https://vovk.dev/python), [Rust](https://vovk.dev/rust) and future clients use them too. Client-side validation doesn't. A procedure takes one or the other: `procedure(){:ts}` throws when it gets both.

A response that fails `output` or `iteration` validation is a bug in the handler, not in the request. The error is a plain `Error{:ts}` without a status code. In production, the client gets `500` "Internal server error", and the validation issues stay on the server: the segment's [`onError`](https://vovk.dev/segment) gets the first 20 of them as the error's `cause`. In development, the message names the failing fields.

#### `contentType`

`contentType` sets the `Content-Type` the request body must have, as a string or an array of strings. It affects:

- **Client-side `body` type**: the RPC method's `body` type follows the content type, such as `FormData{:ts}` for form data, `string{:ts}` for text types and `File | ArrayBuffer | Uint8Array | Blob{:ts}` for binary types.
- **Server-side body parsing**: [`req.vovk.body()`](https://vovk.dev/req-vovk#body) parses the body by the request's `Content-Type` header, into parsed JSON, a parsed `FormData{:ts}`, a `string{:ts}` or a `File{:ts}`.
- **415 check**: when `contentType` is set, a request without a matching `Content-Type` header gets a `415 Unsupported Media Type` error. The header must name one media type, compared case-insensitively: a comma-separated list is refused. A request without a body skips the check.
- **Wildcards**: patterns such as `'video/*'{:ts}`, `'image/*'{:ts}` or `'*/*'{:ts}` accept a range of media types.

See [Content Type](https://vovk.dev/content-type) for every supported type, how the body is parsed, and examples.

#### `disableServerSideValidation`

Turns off server-side validation: `true` for all of it, or an array of validation types (`body`, `query`, `params`, `output`, `iteration`). It doesn't change the RPC types or client-side validation.

#### `skipSchemaEmission`

Leaves the handler's JSON Schema out of the emitted schema: `true` for all of it, or an array of validation types (`body`, `query`, `params`, `output`, `iteration`). It doesn't change the RPC types, but it turns off the features that read the emitted schema, client-side validation included. The declared `contentType` is still emitted, since the clients encode the body by it.

#### `validateEachIteration`

Applies to `iteration` only. Set it to validate every streamed item. By default, only the first item is validated.

#### `operationObject`

Sets the OpenAPI operation details where the `@operation` decorator can't go, such as with [`fn`](https://vovk.dev/fn) on a regular function instead of a class method.

#### `preferTransformed = true`

By default, the [`req.vovk`](https://vovk.dev/req-vovk) methods return the incoming data as the schemas transform it. The built-in Next.js functions, such as `req.json()` or `req.nextUrl.searchParams.get()`, don't. For the data without transforms, set `preferTransformed` to `false`. Then everything that uses the schemas (`body`, `query`, `params`, `output`, `iteration`) returns the original data instead. The JSON Schema emitted for `output` and `iteration` describes what the server sends: the transformed value, or with `preferTransformed: false` the original one.

#### `target`

The JSON Schema version the validation library emits for the procedure's schemas: `'draft-2020-12'` by default, or another version the library supports, such as `'draft-07'`.

### `procedure` Features

A procedure made with `procedure()` also has these properties.

#### `fn`

`fn` calls the procedure without an HTTP request, for SSR/PPR, server actions, AI tool execution and so on. It takes the same arguments as the generated RPC method:

```ts showLineNumbers copy
const localResult = await UserController.updateUser.fn({
  body: { /* ... */ },
  query: { /* ... */ },
  params: { /* ... */ },
  disableClientValidation: false, // default
});

// the RPC method takes the same input
const rpcResult = await UserRPC.updateUser({
  body: { /* ... */ },
  query: { /* ... */ },
  params: { /* ... */ },
  disableClientValidation: false, // default
});
```

See [Calling Procedures Locally](https://vovk.dev/fn).

#### `schema`

```ts showLineNumbers copy
const schema = UserController.updateUser.schema;

// same as UserRPC.updateUser.schema
```

`schema` holds the method schema, the same as the RPC method's. It is often used with `fn` to build [AI tools](https://vovk.dev/tools) that call handlers without HTTP.

#### `definition`

```ts showLineNumbers copy
const bodyModel = UserController.updateUser.definition.body;
```

`definition` holds the original procedure definition. It exists on server-side methods only, not on RPC methods.

---

Page: https://vovk.dev/service

# Services

A service is part of the Controller–Service–Repository pattern. It keeps business logic out of the request handlers: the controller deals with HTTP, and the service does the work and changes the data.

Like controllers, services are often classes with static methods, but they need no decorators and no special structure. The static class is only a convention: you can use class instances, standalone functions or plain objects instead. The pattern does **not** need dependency injection (DI) either: a service can be a plain module that you import and call.

Take this controller:

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

The `handle` method returns the result of `UserService.updateUser`, and that method takes its types from the procedure. So the validation schemas (Zod here) are the single source of truth for the input and output types, and you define no separate types. Thanks to [Anders Hejlsberg](https://github.com/ahejlsberg) for the fix in [#58616](https://github.com/microsoft/TypeScript/issues/58616): without this TypeScript change, Vovk.ts would not be possible.

```ts showLineNumbers copy filename="src/modules/user/user-service.ts"
import type { VovkBody, VovkOutput, VovkParams, VovkQuery } from 'vovk';
import type UserController from './user-controller';

export default class UserService {
  static updateUser(
    body: VovkBody<typeof UserController.updateUser>,
    query: VovkQuery<typeof UserController.updateUser>,
    params: VovkParams<typeof UserController.updateUser>
  ) {
    // database calls or other business logic
    console.log(body, query, params);
    return { success: true, id: params.id } satisfies VovkOutput<typeof UserController.updateUser>;
  }
}
```

Service methods infer their types from procedures, and procedures call service methods, without circular type errors.

---

Page: https://vovk.dev/req-vovk

# `req.vovk` Interface

The built-in `NextRequest` functions, such as `req.json()` and `req.nextUrl.searchParams.get()`, cover most cases. Vovk.ts also adds a `vovk` property to the request, with methods for more advanced input handling. Use them to:

- Get the data as the validation library transforms it (`req.json()` and `req.nextUrl.searchParams.get()` return it as sent), unless the procedure sets [`preferTransformed`](https://vovk.dev/procedure#prefertransformed--true) to `false`.
- Parse nested query parameters.
- Read form data as a typed object, instead of the `FormData` that `req.formData()` returns.
- Store request metadata.
- Write a handler that also runs in [`.fn()`](https://vovk.dev/fn) calls and [derived AI tools](https://vovk.dev/tools). Their request has only `req.vovk`, so `req.json()` and `req.nextUrl` aren't there.

## `async req.vovk.body()`

`req.vovk.body()` returns the parsed request body. Mostly it works as `req.json()` does, but it also parses the non-JSON content types that `procedure` declares (see [Content Type](https://vovk.dev/content-type)).

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

Once a body schema or `req.vovk.body()` has read the body, the body methods of `req`, `req.body` and `req.clone()` replay it. To forward the request, use `new Request(url, req)`, or pass `body: req.body` to `fetch()`. Don't pass `req` or `req.clone()` as the first argument of `new Request()` or `fetch()`. In a route that doesn't export `dynamic = 'force-dynamic'`, Next.js gives the handler a Proxy of the request and of each clone, which they refuse. In any route, `new Request(req)` and `fetch(req)` take the request's own body, which is read by then.

## `req.vovk.query()`

`req.vovk.query()` returns the typed query parameters, nested data included.

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

Nested data goes in the query string with square brackets, known as "PHP-style" or "bracket notation".

- Square brackets `[ ]` hold the keys of arrays and nested objects.
- Indices `[0]` to `[n-1]`, none missing, make an array of any length; `[]` appends an element after the highest index.
- Any other keys make an object: named keys (such as `[f]` and `[u]`), and numeric keys with gaps, so `record[7]=on` gives `{ record: { 7: "on" } }`.
- A key given more than once collects its values into an array, so `tag=a&tag=b` gives `{ tag: ["a", "b"] }`. A repeated index names the same element, so its last value wins.
- With a `query` schema in a [procedure](https://vovk.dev/procedure), a key given once where the schema takes an array is a one-item array, so `tag=a` gives `{ tag: ["a"] }`, as OpenAPI's default style sends it.
- `[]` followed by more brackets adds to the last element until that element already has the key: `items[][name]=a&items[][price]=1&items[][name]=b` gives `{ items: [{ name: "a", price: "1" }, { name: "b" }] }`.
- Nesting goes up to 32 levels. A key with more brackets gets a 400 response.
- A `+` is a space, as in `URLSearchParams{:ts}`. Send a literal `+` as `%2B`, as the RPC clients do.

The RPC client leaves out `null`, `undefined` and empty objects or arrays, and numbers the remaining array items without gaps, so `{ tags: ['a', null, 'b'] }{:ts}` arrives as `{ tags: ['a', 'b'] }{:ts}`. A value with a `toJSON` method is sent as its result, as `JSON.stringify` does: a `Date{:ts}` as an ISO string, a `URL{:ts}` as its `href`.

This query string:

```
?simple=value&array[0]=first&array[1]=second&object[key]=value&nested[obj][prop]=data&nested[arr][0]=item1&nested[arr][1]=item2&complex[items][0][name]=product&complex[items][0][price]=9.99&complex[items][0][tags][0]=new&complex[items][0][tags][1]=featured
```

is parsed as:

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

`req.vovk.params()` returns the typed route parameters, as the handler's second argument does. To type it, use the third type argument of `VovkRequest`.

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

A path segment can hold several params, such as `@get('range/{from}-{to}'){:ts}` or `@get('files/{name}.{ext}'){:ts}`. Each request gets its own params object. With a `params` schema, `req.vovk.params()` and the handler's second argument both return the validated value.

## `req.vovk.meta()`

`req.vovk.meta()` reads and writes custom metadata, in the procedure and in [custom decorators](https://vovk.dev/decorator).

```ts showLineNumbers copy {4,13}
import { createDecorator, get, type VovkRequest } from 'vovk';

const myDecorator = createDecorator(async (req, next) => {
  req.vovk.meta({ hello: 'world' }); // set the request metadata
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

The metadata is a key-value object. Calls with different keys merge into it, and every call returns it.

```ts showLineNumbers copy
// ...
req.vovk.meta({ foo: 'bar' });
req.vovk.meta({ baz: 'qux' });
console.log(req.vovk.meta<{ foo: string; baz: string }>()); // { foo: 'bar', baz: 'qux' }
```

A type argument is needed only to read the metadata with types. Without one, the type comes from the argument.

To clear the metadata, call `req.vovk.meta(null)`:

```ts showLineNumbers copy
req.vovk.meta(null);
console.log(req.vovk.meta()); // {}
```

#### Client-Side Meta with `xMetaHeader` Key

[The TypeScript client](https://vovk.dev/typescript) can send metadata to the server as a JSON string in the `x-meta` header.

```ts showLineNumbers copy {5}
import { UserRPC } from '@/client';

const user = await UserRPC.getUser({
  params: { id: '123' },
  meta: { hello: 'world' }, // sent in the x-meta header
});
```

The `getUser` procedure and [decorators](./decorator) read it with `req.vovk.meta()`, under the `xMetaHeader` key:

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

Client values stay under the `xMetaHeader` key, so client input can't overwrite server-side metadata.

---

Page: https://vovk.dev/fn

# Local Procedure Call (LPC)

Every procedure made with the [procedure](https://vovk.dev/procedure#procedure) function can be called as a regular function through its `fn` property. It takes `{ params, query, body }`, the same shape as the generated RPC client. The RPC client mirrors `fn`, not the other way around.

Take this controller:

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { z } from 'zod';
import { procedure, prefix, get, operation } from 'vovk';
import UserService from './user-service';

@prefix('users')
export default class UserController {
  @operation({
    summary: 'Get user',
    description: 'Get user by ID with Zod validation',
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

When the controller is in a [segment](https://vovk.dev/segment), the generated RPC client calls the same procedure over HTTP, with the same call shape:

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const user = await UserRPC.getUser({
  params: { id: '123e4567-e89b-12d3-a456-426614174000' },
  disableClientValidation: true, // disables client-side validation
  meta: { hello: 'world' }, // available as xMetaHeader metadata
});

console.log('User:', user);
```

`fn` runs the procedure in the current context, with full validation and no HTTP or network:

```ts showLineNumbers copy
import UserController from '@/modules/user/user-controller';

const user = await UserController.getUser.fn({
  params: { id: '123e4567-e89b-12d3-a456-426614174000' },
  disableClientValidation: true, // disables validation
  meta: { hello: 'world' }, // available as root metadata
});

console.log('User:', user);
```

Local procedures have these main uses:

**For SSR, SSG, PPR and server actions**: call the method in a server component:

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

**For Next.js server actions**: call `fn` in a server action to run the procedure from a form. Set the procedure's `contentType` to `'multipart/form-data'` so it takes `FormData` as the body:

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

**For [AI tool execution](https://vovk.dev/tools)**: pass a controller with `procedure()` procedures to `deriveTools` as a "module". Its tools call the procedures in the current context, without HTTP requests.

```ts showLineNumbers copy
import { deriveTools } from 'vovk';

const tools = deriveTools({
  modules: { UserController },
});

console.log(tools); // [{ name, description, inputSchema, execute, ... }, ...]
```

## Rules of Locally Called Procedures

`fn` doesn't imitate the `Request` object. Its `req` has only the [custom `vovk` property](https://vovk.dev/req-vovk), with `async vovk.body()`, `vovk.query()`, `vovk.params()` and `vovk.meta()`, so properties such as `req.url` or `req.headers` are not defined in a local call. A fitting `req` type is `Pick<VovkRequest<TBody, TQuery, TParams>, 'vovk'>{:ts}`. `vovk.body()` reads a `FormData{:ts}`, `URLSearchParams{:ts}`, `Blob{:ts}`, `ArrayBuffer{:ts}` or typed array body as the server reads a request that carries it, by the content type the RPC client would send. Any other body is passed as it is.

So that an HTTP handler also works with `fn`, destructure the request and use only its `vovk` property:

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

A local call runs the same [decorators](./decorator) as the HTTP handler. In a decorator for a handler you call with `fn`, don't use `NextRequest` properties such as `req.headers` or `req.nextUrl`.

```ts showLineNumbers copy {4}
import { createDecorator } from 'vovk';

const myDecorator = createDecorator(({ vovk }, next) => {
  const meta = vovk.meta<{ foo: string }>();
  // ...
  return next();
});
```

To detect a local call, check `req.url`: it is `undefined` in a call through `fn`:

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

`req` is not a `Request`, but a local call made during a Next.js request, as in a server component or a server action, can still use Next.js functions such as `headers` or `cookies` from `next/headers`. Outside a request, as in a unit test, they throw, so mock `next/headers` there.

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

A local procedure needs no HTTP decorator such as `@get` or `@post`. It only needs to be made with the `procedure` function.

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

A class written this way works as a "validated service". Attach its procedures to a controller later, or use it on its own as a set of validated functions.

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

[Procedures](./procedure) wrap Next.js route handlers, so they can return `Response` objects. They can also return plain objects and throw exceptions, which Vovk.ts turns into `Response` objects.

For type inference in the [TypeScript client](https://vovk.dev/typescript), these snippets are the same:

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

Every HTTP decorator takes custom response headers in its second argument.

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

For `.auto()` endpoints, pass `cors` and `headers` as the only argument.

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

Set headers per response with a `NextResponse` or `Response` object.

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

To redirect, or to render the not-found page, use the Next.js functions from **next/navigation**.

```ts showLineNumbers copy
import { get } from 'vovk';
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

Both functions throw an error, so you need no `return` statement; their return type is `never`. The same goes for `forbidden()` and `unauthorized()`, which Next.js allows only with `experimental.authInterrupts` in **next.config**; without it they throw a plain error, which answers 500. Vovk.ts rethrows these errors, so Next.js answers them.

In a [JSON Lines](https://vovk.dev/jsonlines) stream, after the response has started, they end the stream with an error line instead. `notFound()`, `forbidden()` and `unauthorized()` send their status: 404, 403 or 401. `redirect()` is sent as any other error: "Internal server error" in production.

See the [Next.js documentation](https://nextjs.org/docs/app/building-your-application/routing/redirecting).

## File Downloads

For a file attachment, return a Web API `Response` with the right headers.

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

The `toDownloadResponse` helper builds this response for you. It takes the file content as a `Blob | File | ArrayBuffer | Uint8Array | ReadableStream<Uint8Array> | string{:ts}`, and an optional object with `filename`, `type` and `headers`.

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

Throw HTTP errors with the `HttpException` class, in a syntax inspired by NestJS. It takes three arguments: an HTTP status from `HttpStatus`, a message and an optional `cause` object.

```ts showLineNumbers copy
import { HttpException, HttpStatus } from 'vovk';

// ...
static async updateUser(/* ... */) {
    // ...
    throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong');
}
```

The [TypeScript client](https://vovk.dev/typescript) rethrows them with the same interface.

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

Other errors, such as `Error`, count as an `HttpException` with status `500`. In production, their message and cause stay on the server, and the client gets "Internal server error". The same goes for an `HttpException` with status `0`, which an RPC module throws when a call gets no response or fails client-side validation. To pass such a failure on, catch it and throw an `HttpException` with a status.

```ts showLineNumbers copy
import { HttpException, HttpStatus } from 'vovk';

// ...
static async updateUser(/* ... */) {
    // ...
    throw new Error('Something went wrong'); // 500
}
```

The third argument, `cause`, adds context:

```ts showLineNumbers copy
throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong', { hello: 'World' });
```

## HttpStatus Enum

The values of the `HttpStatus` enum:

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

A proxy endpoint gets data from another server with `fetch` and returns its `Response`, which Next.js sends as is. For the right type on the client, cast the return type:

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

The client then infers that type:

```ts showLineNumbers copy
import { ProxyRPC } from '@/client';

// ...
const { greeting } = await ProxyRPC.getHello();
```

Or keep the server return type as `Response`, and set the type on the client method:

```ts showLineNumbers copy
import { ProxyRPC } from '@/client';

// ...
const { greeting } = await ProxyRPC.getHello<{ greeting: string }>();
```

### Blob Proxy

If you keep the `Response` type, the client resolves the call to a `Response` object. Use this for files or binary data.

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

The `contentType` option of `procedure` sets how the client types the request body, how the server parses it, and which `Content-Type` headers the server accepts. When `contentType` is set, a request without a matching `Content-Type` header gets a **415 Unsupported Media Type** error.

How each content type family maps to the client's `body` type and to what `req.vovk.body()` returns:

| Content Type | Client `body` type | `req.vovk.body()` return type |
|---|---|---|
| `application/json`, `*+json` | `TBody \| Blob` | Parsed JSON object |
| `multipart/form-data` | `TBody \| FormData \| Blob` | Parsed form object |
| `application/x-www-form-urlencoded` | `TBody \| URLSearchParams \| FormData \| Blob` | Parsed form object |
| `text/*`, text-like application types, `*+xml`, `*+text`, `*+yaml`, `*+json-seq` | `string \| Blob` | `string` |
| Everything else (`image/*`, `video/*`, `application/octet-stream`, etc.) | `File \| ArrayBuffer \| Uint8Array \| Blob` | `File` |

> [!NOTE]
>
> The standard `Request` methods, such as `req.json()`, `req.text()`, `req.blob()` and `req.formData()`, work as usual. `contentType` only affects the typed `req.vovk.body()` helper.

Wildcard patterns such as `'video/*'{:ts}`, `'image/*'{:ts}` or `'*/*'{:ts}` match any subtype of their family.

## JSON (default)

Without `contentType`, or with `'application/json'`, the body has the type the schema infers and is parsed as JSON.

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

To accept form data, set `contentType` to `'multipart/form-data'`.

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

The RPC method's `body` type is `TBody | FormData | Blob{:ts}`, where `TBody` comes from the validation schema. The client validates an object as an object, then converts it to `FormData`. It leaves out `null` and `undefined` fields, and sends an array as one entry per item, a `Date{:ts}` as an ISO string and any other object as JSON. When the procedure also takes `application/json`, an object is sent as JSON, unless a field holds a file.

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const formData = new FormData();
formData.append('email', 'user@example.com');
formData.append('name', 'John Doe');

await UserRPC.createUser({
  body: formData,
});
```

On the server, `req.vovk.body()` parses the form data into a plain object (see [`req.vovk` Interface](https://vovk.dev/req-vovk)).

If a key can have one or more values, use a union of the value type and an array of it: `FormData` doesn't tell one value from several.

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

The same goes for files:

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

Client-side validation doesn't fully support the OpenAPI `format: "binary"`, and it doesn't check file size, type and so on.

## URL-Encoded Form Data

Set `contentType` to `'application/x-www-form-urlencoded'` to accept URL-encoded forms. The server parses the body as it parses `multipart/form-data`, and the client `body` type also takes `URLSearchParams{:ts}`. When the procedure doesn't also take `multipart/form-data`, the client sends an object body, or a `FormData{:ts}` without files, as `URLSearchParams{:ts}`.

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

Text content types are parsed as a `string`: `text/*`, known text-like application types such as `application/xml` or `application/yaml`, and the suffixes `*+xml`, `*+text`, `*+yaml` and `*+json-seq`.

The client sends a string body as the text type the procedure declares. A string body to a procedure that takes JSON, such as one with `body: z.string(){:ts}`, or to a handler that declares no content type, is sent as a JSON value.

```ts showLineNumbers copy {6}
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

Any other content type, such as `application/octet-stream`, `image/*`, `video/*` or `application/pdf`, is parsed into a `File{:ts}` on the server. On the client, `body` takes `File | ArrayBuffer | Uint8Array | Blob{:ts}`.

Bytes without a type, such as an `ArrayBuffer{:ts}`, a `Uint8Array{:ts}` or a `Blob{:ts}` with an empty `type`, are sent as the first declared type that isn't JSON, a form or a wildcard, such as `image/png`. If there is none, they are sent as a wildcard other than `*/*`, such as `image/*`. Without either, they are sent as `application/octet-stream` to a procedure that takes any type (`*/*`), and otherwise as the JSON or URL-encoded type it declares. A `File{:ts}` or a typed `Blob{:ts}` is sent as its own type. If the procedure declares `application/octet-stream` but not that type, the TypeScript client sends it as `application/octet-stream`. The server refuses any type the procedure doesn't declare; a wildcard such as `image/*` or `*/*` takes a family or any type.

The server names the `File{:ts}` after the request's `Content-Disposition` header, reading `filename*` before `filename`, and calls it `file` without one. The TypeScript client sends that header for a `File{:ts}` body. The name is client input, as is the name of a file in form data: never use it as a path.

```ts showLineNumbers copy {6}
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

const file = document.querySelector<HTMLInputElement>('input[type="file"]')!.files![0];

await UserRPC.uploadImage({
  body: file,
});
```

## Multiple Content Types

`contentType` takes an array to allow several content types. The body type is then the union of their types.

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

Vovk.ts supports the [JSON Lines](https://jsonlines.org/) format, which answers one request with many responses. It is an output type with its own validation field, `iteration`. The response has the `application/jsonl` content type when the client sends an `Accept: application/jsonl` header. Otherwise it is `text/plain`, so a browser shows it when you open the endpoint URL.

Use JSON Lines for:

- A type-safe alternative to Server-Sent Events (SSE) for streaming data to clients.
- Long-running operations that produce results over time, such as LLM completions or database polling.
- [Progressive](https://vovk.dev/progressive) data loading, which sends partial results as they become ready.

> [!IMPORTANT]
>
> The response size isn't known in advance, so a JSON Lines response can't be compressed with Gzip, Brotli or other algorithms. Keep this in mind for large responses.

## Creating a JSON Lines Generator Procedure

To stream JSON Lines, write the handler as a generator or an async generator. Each yielded value is serialized to JSON and sent as its own line.

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

To stream from a service, delegate to it with `yield*`:

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

On the client, read each line as it arrives with [disposable](https://github.com/tc39/proposal-explicit-resource-management) [async iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator):

```ts showLineNumbers copy
import { StreamRPC } from '@/client';

using stream = await StreamRPC.getJSONLines();

for await (const { message } of stream) {
  console.log('Received message:', message);
}
```

Besides `Symbol.asyncIterator`, `Symbol.dispose` and `Symbol.asyncDispose`, the iterable (`stream` above) has:

- `status`: the HTTP response status, such as 200 for OK or 404 for Not Found.
- `asPromise`: returns a promise that resolves with an array of all items when the stream ends. Every call gets the same items.
- `onIterate`: registers a callback for each item.
- `abortController`: an `AbortController` that aborts the stream. `abortController.abort()` makes the stream reader throw an `AbortError`, which the client finds in the error's `cause` property.
- `abortSilently`: aborts the stream without an error on the stream reader, to stop reading it quietly.

With `using`, the stream is aborted with `stream.abortSilently('Stream disposed')` when it goes out of scope.

The client reads the response only as fast as the iteration takes items, so a slow consumer slows the stream down instead of buffering it. An item is kept until every running iteration has passed it. Iterations that run at the same time each get all items. An iteration that starts later begins at the oldest kept item, and iterating a consumed stream again yields nothing. After a `break`, the items already read stay for a later iteration or `asPromise()`. A line that isn't JSON, such as a last line the connection cut short, ends the iteration with an error.

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

This procedure streams OpenAI's chat completions by delegating to them:

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

On the client, read the streamed completion:

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

`JSONLinesResponder` is the lower-level API behind generator handlers. It gives you more control: you send the lines yourself. It creates the `ReadableStream` that is the response body.

```ts showLineNumbers copy
const responder = new JSONLinesResponder<IterationType>(req);
```

```ts showLineNumbers copy
const responder = new JSONLinesResponder<IterationType>(req, ({ readableStream, headers }) => new Response(readableStream, { headers }));
```

The constructor takes two optional parameters:

- `request?: Request | null`: the incoming request. When given, the responder checks its `Accept: application/jsonl` header and sets `Content-Type: application/jsonl` in the `headers` of the response. Without the request or the header, the content type is `text/plain`. The RPC client streams only a JSON Lines response and returns any other `Response` as is, so pass the request when the client reads the stream. In a procedure with `iteration`, the request also lets the responder validate a line sent before the handler returns it.
- `getResponse?: (responder: JSONLinesResponder<T>) => Response`: builds a custom `Response`, for example with your own headers or other response options. Without it, the responder creates a `Response` with the default headers.

The responder has these members:

- `send(item: T): Promise`: sends a JSON line to the client. The item is validated (when the procedure has `iteration`, only the first item, unless `validateEachIteration: true` is set), serialized to JSON and followed by a newline. Lines go out in call order, also when `send()` is not awaited. A send that fails, on iteration validation or with an item JSON can't serialize, ends the stream as `throw()` does, and the segment's `onError` gets the error.
- `close(): Promise`: closes the response stream once the lines sent before it are out. A line sent after `close()` is dropped.
- `throw(err: Error): Promise`: sends an error line after the lines sent before it, and closes the stream; a line sent after `throw()` is dropped. The error line is `{"isError":true,"reason":"…"}`, plus the `statusCode` of an `HttpException{:ts}`, which is 500 for a status outside 200-599 as on a JSON response. The client rethrows it as an `HttpException{:ts}` with that status. The error of `notFound(){:ts}`, `forbidden(){:ts}` or `unauthorized(){:ts}` from `next/navigation`, which Next.js can no longer answer once the stream started, sends its status: 404, 403 or 401. In production, an error that is not an `HttpException{:ts}`, or is one with status 0, which a client throws for a call that got no response, reads "Internal server error".
- `isClosed: boolean`: whether the stream is closed, by `close()` or `throw()` (from the moment either is called), by a failed send, or by the client going away. `send()` waits while the client reads slower than the handler writes, and a generator handler is stopped, with its `finally` run, when the client disconnects or an item fails.
- `response: Response`: the `Response` that the Next.js route handler returns.
- `headers: Record<string, string>`: the `content-type` of the response.
- `readableStream: ReadableStream<Uint8Array>`: the stream used as the response body.

With `JSONLinesResponder`, the service method is a regular function, not a generator. It takes the responder and sends the lines through it.

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

The handler returns the responder. The streaming runs in a promise that starts before `return` and isn't awaited.

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

To end the stream with an error, call `throw`. The client rethrows the error:

```ts showLineNumbers copy
await responder.throw(new Error('Stream error'));
```

---

Page: https://vovk.dev/progressive

# Progressive Responses with `progressive` Function

  [View Progressive example on examples.vovk.dev »](https://examples.vovk.dev/progressive)

[JSON Lines](https://vovk.dev/jsonlines) is often used to send several chunks of data, one after another, in answer to one request. Long-running operations, such as LLM completions, use it to deliver partial results as they become ready.

When you don't know which chunk comes first, use the experimental “progressive response”. It is inspired by Dan Abramov's proposal [Progressive JSON](https://overreacted.io/progressive-json/), which gave it its name.

Take two functions that return data after a random delay: `getUsers` and `getTasks`, static methods of a service class. In a real app, these could be API calls or queries to different databases.

With the [JSONLinesResponder class](https://vovk.dev/jsonlines#jsonlinesresponder), a service method sends each result when it is ready:

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

- When `getUsers()` or `getTasks()` resolves, `resp.send` sends a JSON line to the client.
- When all promises resolve, `resp.close` closes the response stream.
- If a promise rejects, `resp.throw` sends an error to the client.

The full service module:

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

In the controller, create a `JSONLinesResponder`, pass it to the service method and return it as the response.

```ts showLineNumbers copy
// ...
const responder = new JSONLinesResponder<IterationType>(req);
void ProgressiveService.streamProgressiveResponse(responder);
return responder;
// ...
```

The full controller, with types and validation:

```ts showLineNumbers copy filename="src/modules/progressive/progressive-controller.ts" source="examples/kitchen-sink"
import { procedure, get, JSONLinesResponder, prefix, type VovkIteration } from 'vovk';
import { z } from 'zod';
import ProgressiveService from './progressive-service.js';

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

On the client, use the `progressive` function from the `vovk` package. It takes the RPC method to call (such as `ProgressiveRPC.streamProgressiveResponse`) and optional input parameters. It returns an object with a promise for each property, and you await each one on its own.

```ts showLineNumbers copy
const { users: usersPromise, tasks: tasksPromise } = progressive(ProgressiveRPC.streamProgressiveResponse);
```

If the RPC method takes input parameters, pass them as the second argument:

```ts showLineNumbers copy
const { users: usersPromise, tasks: tasksPromise } = progressive(ProgressiveRPC.streamProgressiveResponse, {
  params: { id: '123' },
  body: { hello: 'world' },
});
```

Each promise resolves as soon as its JSON line arrives from the server:

```ts showLineNumbers copy
usersPromise.then(console.log).catch(console.error);
tasksPromise.then(console.log).catch(console.error);
```

---

`progressive` returns a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) whose `get` trap returns a promise for each property you read.

- When a JSON line arrives, the matching promise resolves with its data.
- A JSON line for a property that has no promise yet creates the promise, already resolved, for you to read later.
- When the response closes, every pending promise is rejected with an error saying that the connection closed before a value for that property came.
- If the response fails, every pending promise is rejected with its error.

---

Page: https://vovk.dev/inference

# Type Inference

These types infer the input and output of both RPC modules and controller procedures.

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

The types of `body`, `query` and `params` come from `VovkRequest<TBody, TQuery, ?TParams>{:ts}`, the type of the procedure's `req` argument. So both raw and validated methods set the input types.

A raw method with `params` as a type argument:

```ts showLineNumbers copy
import { put, type VovkRequest } from 'vovk';

export default class UserController {
  @put('{param}')
  static async updateUser(req: VovkRequest<{ email: string }, { id: string }, { param: string }>) {
    // ...
  }
}
```

A raw method with `params` as a separate argument:

```ts showLineNumbers copy
import { put, type VovkRequest } from 'vovk';

export default class UserController {
  @put('{param}')
  static async updateUser(req: VovkRequest<{ email: string }, { id: string }>, params: { param: string }) {
    // ...
  }
}
```

Validated [procedures](https://vovk.dev/procedure) infer the input types from their schemas:

```ts showLineNumbers copy
import { procedure, put } from 'vovk';
import { z } from 'zod';

export default class UserController {
  @put('{param}')
  static updateUser = procedure({
    query: z.object({ id: z.string() }),
    params: z.object({ param: z.string() }),
    body: z.object({ email: z.string().email() }),
  }).handle((req, params) => {
    // ...
  });
}
```

All three give the same RPC method:

```ts showLineNumbers copy
import { UserRPC } from '@/client';

await UserRPC.updateUser({
  params: { param: 'value' },
  query: { id: 'value' },
  body: { email: 'value' },
});
```

And the same inferred input types:

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

`VovkInput<T>` puts all three input types (`params`, `query`, `body`) in one object.

```ts showLineNumbers copy
import type { VovkInput } from 'vovk';
import type UserController from './user-controller';

type Input = VovkInput<typeof UserController.updateUser>;
// { params: { param: string }; query: { id: string }; body: { email: string } }
```

It works the same with RPC modules:

```ts showLineNumbers copy
import type { VovkInput } from 'vovk';
import { UserRPC } from '@/client';

type Input = VovkInput<typeof UserRPC.updateUser>;
// { params: { param: string }; query: { id: string }; body: { email: string } }
```

## Output/Iteration Inference

Only the [procedure](https://vovk.dev/procedure) function sets output and iteration types.

For output:

```ts showLineNumbers copy
import { procedure, get } from 'vovk';
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
import { procedure, get } from 'vovk';
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
import { UserRPC, StreamRPC } from '@/client';

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

`VovkReturnType<T>` and `VovkYieldType<T>` infer what a method actually returns or yields, for methods without validation. They can't be used for self-references in services: they cause “implicit any” TypeScript errors.

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

Vovk.ts generates an OpenAPI specification from the procedures that have an operation object. It fills `parameters`, `requestBody` and `responses` from the validation models. The `@operation` decorator gives a procedure its operation object, with metadata such as `summary`, `description` and `tags`. `@operation.tool` and `@operation.error` give it one too. A procedure without any of them is left out of the specification, and [deriveTools](https://vovk.dev/tools) makes no tool of it either. The decorator takes the `OperationObject` type from [openapi3-ts/oas31](https://www.npmjs.com/package/openapi3-ts), plus the Vovk.ts `x-tool` property for the [deriveTools](https://vovk.dev/tools) function.

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

The validation models of a [procedure](https://vovk.dev/procedure) map to the operation object like this:

- `params` → `parameters` with `in: "path"`, each one required. A `{name}` in the path that no `params` model describes is a string parameter.
- `query` → `parameters` with `in: "query"`. An object parameter gets `style: "deepObject"`, since the server reads `filter[status]=sold`. An array parameter keeps the default style, `form` (`tags=a&tags=b`), and the server reads a single `tags=a` as a one-item array. OpenAPI has no style for an array of objects; the server reads `items[0][a]=x`, the form that Vovk.ts clients send.
- `body` → `requestBody` with the `application/json` (or custom `contentType`) content type.
- `output` → `responses` with status `200` and the `application/json` content type.
- `iteration` → `responses` with status `200` and the `application/jsonl` content type, with an example of three lines. The server sends `text/plain` unless the `Accept` header includes `application/jsonl`.

A schema with an id, such as a Zod schema with `.meta({ id })`, goes to `components.schemas`. In a name, each character OpenAPI doesn't allow becomes `_`: `User Profile` becomes `User_Profile`. When another schema already has the name, including one in `openAPIObject.components`, the RPC module, procedure and slot names go in front of it: `UserRPCCreateUserBodyUser`.

## Configuring the OpenAPI Specification

Configure the specification in the [vovk.config](https://vovk.dev/config) file, with the [`outputConfig.openAPIObject` option](https://vovk.dev/config#openapiobject). The object is merged into the generated specification, so you can set global properties such as `info` and `servers`.

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

You can also set `openAPIObject` for each [segment](https://vovk.dev/segment), with `outputConfig.segments.[segmentName].openAPIObject`.

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

## Using the OpenAPI Specification

The generated RPC client exports an `openapi` object from its `openapi` module. For the [composed client](https://vovk.dev/composed), it holds the specification of the whole back end. With the [segmented client](https://vovk.dev/segmented), each [segment](https://vovk.dev/segment) also exports its own specification.

```ts showLineNumbers copy
import { openapi } from '@/client/openapi'; // composed client
```

```ts showLineNumbers copy
import { openapi } from '@/client/admin/openapi'; // segmented client
```

Use the specification as a variable, or serve it as JSON from a controller in a static segment:

```ts showLineNumbers copy filename="src/modules/static/openapi/openapi-controller.ts"
import { get } from 'vovk';
import { openapi } from '@/client/openapi';

export default class OpenApiController {
  @get('openapi.json')
  static getSpec = () => openapi;
}
```

A plain Next.js route handler can serve the spec too. Then you register no controller, and the route stays out of the generated schema:

```ts showLineNumbers copy filename="src/app/openapi.json/route.ts"
import { openapi } from '@/client/openapi';

export const GET = () => Response.json(openapi);
```

The [openapiJson](https://vovk.dev/templates#openapijson) template writes `openapi.json` as a file of its own, without a client. Use it to serve the spec as a static file or to pass it to another tool:

```sh npm2yarn copy
npm exec -- vovk generate --from openapiJson --out ./public
```

On the client side, any OpenAPI documentation generator works. [Scalar](https://www.npmjs.com/package/@scalar/api-reference-react) is recommended, because Vovk.ts adds code samples for the generated RPC modules to the spec.

```tsx showLineNumbers copy
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

For a live demo, see the ["Hello World" application spec](https://hello-world.vovk.dev/openapi). The ["Hello World"](https://vovk.dev/hello-world) page has the details.

---

`@operation.tool` sets attributes for the [deriveTools](https://vovk.dev/tools) function. They go under the `x-tool` key of the operation object.

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

For details, see the [deriveTools](https://vovk.dev/tools) documentation.

---

Page: https://vovk.dev/tools

# Deriving AI Tools from Controllers and RPC Modules

`deriveTools` turns controllers and generated RPC or API modules into AI tools for LLM function calling. AI models, MCP clients included, can then call your back end. The function takes a `modules` record with:

- Controllers, which run in the current context, on the back end.
- RPC modules generated from controllers, which make HTTP calls, on the front end or anywhere else with `fetch`.
- Third-party modules generated from OpenAPI ([OpenAPI mixins](https://vovk.dev/mixins) in these docs), so one agent can use both your back end and external APIs.

A tool comes from a [procedure](https://vovk.dev/procedure) or an RPC method that has an operation object, given by [`@operation`](https://vovk.dev/openapi), `@operation.tool` or `@operation.error`. Every [OpenAPI mixin](https://vovk.dev/mixins) method has one. Other members of a module are left out.

```ts showLineNumbers copy filename="src/lib/tools.ts"
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

The function returns an array of tools. Each tool satisfies the `StandardToolV0` interface of the [standard-tool](https://standard-tool.js.org/) convention:

- `name: string{:ts}` - the tool name, made from the module and method names as `${moduleName}_${handlerName}`. `x-tool.name` overrides it (see below). As model APIs require, each character other than `A-Z`, `a-z`, `0-9`, `_` and `-` becomes `_`. A name longer than 64 characters is cut to 64 and ends with a hash of the whole name. Two tools with the same name make `deriveTools` throw.
- `title?: string{:ts}` - an optional title, used mainly by MCP. It comes from `x-tool.title` or the OpenAPI `summary`, if there is one.
- `description: string{:ts}` - the tool description: the `summary` and `description` of the OpenAPI operation, joined. `x-tool.description` overrides it (see below).
- `inputSchema?: StandardSchemaV1 & StandardJSONSchemaV1{:ts}` - one Standard Schema that merges the procedure's `body`, `query` and `params`, when there are any.
- `outputSchema?: StandardSchemaV1 & StandardJSONSchemaV1{:ts}` - the procedure's `output` schema, when there is one.
- `meta?: Record<string, unknown>{:ts}` - static data about the tool, copied as is from `x-tool.meta` (see below). The code that uses the tools reads it; the LLM never gets it.
- `execute: (input: { body?, query?, params? }) => Promise{:ts}` - runs the tool. For RPC modules, it sends an HTTP request. For controllers, it calls the `fn` method, which runs in the current context without HTTP. A [JSON Lines](https://vovk.dev/jsonlines) result, from a generator or a `JSONLinesResponder`, reaches the model as the array of its items.

> `inputSchema` validates the `{ body, query, params }` envelope itself, and leaves each slot's value to your original library schema (Zod, Valibot, ArkType). For RPC modules and OpenAPI mixins, it's rebuilt from the generated JSON Schemas, so it checks only the envelope, and the values are validated when the tool runs.

## `deriveTools` Options

`deriveTools` takes an options object with these properties:

- `modules: Record<string, object>{:ts}` - the modules (RPC or API modules, or controllers) to derive tools from.
- `onExecute?: (result: unknown, tool: StandardToolV0, req: Pick<VovkRequest, 'vovk'> | null) => void{:ts}` - an optional callback that runs when a tool's `execute` function succeeds. For a controller, `req` is the call's request object, with `req.vovk`; for an RPC method, it's `null`.
- `onError?: (error: Error, tool: StandardToolV0, req: Pick<VovkRequest, 'vovk'> | null) => void{:ts}` - an optional callback that runs when a tool's `execute` function throws, or when a controller returns a `Response` with an error status. For a `Response`, the error is an `HttpException` with its status and the message from the body: the `message`, `detail` or `title` of a JSON body, else its text. `ToModelOutput.DEFAULT` gives the model `{ error: message }{:ts}` in both cases. `req` is as in `onExecute`, or `null` for a thrown error.
- `toModelOutput?: ToModelOutputFn<TInput, TOutput, TFormattedOutput>{:ts}` - an optional function that formats the output for the LLM. Set it to your own function or to a built-in formatter from the `ToModelOutput` object, exported from `vovk`:
  - `ToModelOutput.MCP` for MCP formatting.
  - `ToModelOutput.DEFAULT`, the default when `toModelOutput` isn't set.
- `meta?: Record<string, unknown>{:ts}` - optional metadata for each controller or RPC method. The back end reads it with [req.vovk.meta](https://vovk.dev/req-vovk#meta). A controller procedure merges it with its own meta as usual. An RPC method gets it under the `xMetaHeader` key. [OpenAPI mixins](https://vovk.dev/mixins) don't get it, since their hosts are third parties.

## Custom Operation Attributes with `x-tool` or `@operation.tool` Decorator

To override the default tool name and description, or to add other tool attributes, use the custom `x-tool` attribute in the `@operation` decorator.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { z } from 'zod';
import { prefix, get, operation, procedure } from 'vovk';

@prefix('user')
export default class UserController {
  @operation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique ID.',
    'x-tool': {
      // tool attributes
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

`@operation.tool` sets the same attributes with shorter syntax. They go under the `x-tool` key of the OpenAPI operation object.

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

The attributes under `x-tool` are:

- `hidden?: boolean` - `true` leaves the tool out of the derived tools.
- `name?: string` - overrides the generated tool name.
- `title?: string` - an optional title for the tool, used mainly by MCP.
- `description?: string` - overrides the generated tool description.
- `meta?: Record<string, unknown>` - static data that becomes the derived tool's `meta` field. It's not the `meta` option of `deriveTools`, which is runtime metadata for the procedure.

## Tips 

### Selecting Specific Procedures

To include only some procedures of a module, besides the `hidden` attribute, use `pick` or `omit` from `lodash` or a similar utility.

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

The resulting `tools` include `createPost` and `getPost` from `PostRPC`, and all methods of `UserController` except `deleteUser`.

### Authorizing API Calls

Third-party APIs may need authorization headers. Pass them with the `withDefaults` function, which all [generated RPC/API modules](https://vovk.dev/typescript) have. With the `GithubIssuesAPI` module from [OpenAPI mixins](https://vovk.dev/mixins), you can create authorized tools for the GitHub Issues API:

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

The `createTool` utility was removed in v4. Derived tools follow the standard-tool convention. So you can create standalone tools, which don't map to your back end, with the [standard-tool](https://www.npmjs.com/package/standard-tool) package, or write them as plain objects of the same shape. Mix them with derived tools as you like:

```ts showLineNumbers copy
import { deriveTools } from 'vovk';
import { standardTool } from 'standard-tool';
import { z } from 'zod';
import UserController from '@/modules/user/user-controller';

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

This example is a Vercel AI SDK chat that derives its tools from `UserController`. The Realtime Kanban app runs a fuller version of it: [source on GitHub »](https://github.com/finom/vovk/blob/main/examples/realtime-kanban/src/modules/ai/ai-sdk-controller.ts)

First, create an empty controller. The command also updates the root `route.ts` file.

```sh npm2yarn copy
npm exec -- vovk new controller aiSdk --empty
```

Paste this into the new `src/modules/ai-sdk/ai-sdk-controller.ts`, and fix the imports if needed:

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
          execute,
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

The tool's `inputSchema` goes to the Vercel AI SDK as is. The SDK supports Standard Schema and Standard JSON Schema, and uses the schema both to validate arguments and to convert to JSON Schema. A procedure without input has no `inputSchema`, and the SDK requires one, so the example passes an empty object schema instead. Other libraries may need the tools mapped another way.

On the client side, create a component with the [useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) hook:

```tsx showLineNumbers copy filename="src/components/chat.tsx"
'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function Chat() {
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

`useChat` reads a random value when it renders. With `cacheComponents` on, which `create-next-app` 16.4+ sets, `next build` refuses a random value outside `<Suspense>`, so render the component inside `<Suspense>` from a server page:

```tsx showLineNumbers copy filename="src/app/page.tsx"
import { Suspense } from 'react';
import Chat from '@/components/chat';

export default function Page() {
  return (
    <Suspense>
      <Chat />
    </Suspense>
  );
}
```

---

See [Realtime Kanban / Text AI Chat](https://vovk.dev/realtime-ui/text-ai) for more.

## Roadmap

- ✨ Add a `router` option to `deriveTools`, so it can serve hundreds of functions within the LLM tool limits. Routing could use vector search or other methods.

---

Page: https://vovk.dev/tools-mcp

# MCP (Model Context Protocol) Output Formatting

With the `ToModelOutput.MCP` formatter, [derived tools](https://vovk.dev/tools) work as MCP tools. It formats the tool output to the [MCP tool specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools), with `text`, `image` and `audio` output, and meta information in an `annotations` object.

```ts
const tools = deriveTools({
  modules: { UserController },
  toModelOutput: ToModelOutput.MCP,
});
```

## JSON Content

A JSON response becomes text content with a `structuredContent` field. This includes responses made with `Response` or `NextResponse`, and `+json` types such as `application/problem+json`. MCP structured content is an object, so an array goes under `structuredContent.items`. A `Response` with an error status gives `isError: true` and no `structuredContent`. A thrown error is reported the same way. In production, only an `HttpException{:ts}` keeps its message, and any other error reads "Internal server error".

```ts showLineNumbers copy
export default class UserController {
  @operation({ summary: 'Get user' })
  @get('{id}')
  static getUser = procedure().handle(async (req, { id }) => {
    return { hello: 'world' };
  });
}
```

With the `ToModelOutput.MCP` formatter, the tool's output is:

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

When a procedure returns a `Response` with the `Content-Type` header set to `audio/*` or `image/*`, the output is audio or image content. Its `data` field holds the body in base64.

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

With the `ToModelOutput.MCP` formatter, the tool's output is:

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

You can create the response with the [`toDownloadResponse`](https://vovk.dev/response#downloads) utility, or get the media from another source with `fetch`.

```ts showLineNumbers copy
import { get, operation, procedure, toDownloadResponse } from 'vovk';

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

When a procedure returns a `Response` with the `Content-Type` header set to `text/*` or another text type, such as XML, the output is text content.

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

With the `ToModelOutput.MCP` formatter, the tool's output is:

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

A `Response` of any other content type, such as `application/pdf`, gives `isError: true` and the text `Unsupported response content type application/pdf`.

## `annotations`

To add annotations to the output, set the `mcpOutput` metadata key with the [req.vovk.meta](https://vovk.dev/req-vovk#meta) function. When the procedure serves as an endpoint, its response stays the same. MCP takes a `priority` from 0 (least important) to 1 (most important).

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

With the `ToModelOutput.MCP` formatter, each content item gets the `annotations` object, as MCP annotates content items:

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

The `mcpOutput` key can also override other MCP output properties, including `content` and `structuredContent`; its `annotations` go on each content item. This way you can change the MCP output without changing the procedure's response.

## MCP Handler Example

With the [mcp-handler](https://www.npmjs.com/package/mcp-handler) package, you can create an MCP API route that controls what your back end exposes to MCP clients.

At the time of writing, **mcp-handler** supports only Zod schemas. The tool's merged `inputSchema` is a single Standard Schema. So the example converts its JSON Schema back to a Zod object with [`z.fromJSONSchema()`](https://zod.dev/json-schema?id=zfromjsonschema), and passes its `.shape` (the `body`, `query` and `params` slots) to `registerTool`.

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

`ToModelOutput.MCP` works with the `withFormattedOutput` helper from the [standard-tool](https://www.npmjs.com/package/standard-tool) package: both take a result or an `Error`. Wrap a [standalone tool](https://vovk.dev/tools#standalone-tools) with it, and pass `null` as the request argument. Its `execute` then gives the same MCP output as derived tools, so you can register it on the same MCP server:

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

See [Realtime Kanban / MCP](https://vovk.dev/realtime-ui/mcp) for more.

---

Page: https://vovk.dev/decorator-overview

# Decorators Overview

Vovk.ts uses decorators to add metadata and behavior to controllers and their procedures.

## HTTP Method Decorators

An HTTP method decorator sets the HTTP method and path of a procedure. It is the only decorator a procedure **requires** to be reachable over HTTP.

| Decorator | HTTP Method |
|-----------|-------------|
| `@get()` | GET |
| `@post()` | POST |
| `@put()` | PUT |
| `@patch()` | PATCH |
| `@del()` | DELETE |
| `@head()` | HEAD |
| `@options()` | OPTIONS |

Each takes an optional path and an optional options object:

```ts showLineNumbers copy
import { get, prefix, type VovkRequest } from 'vovk';

@prefix('users')
export default class UserController {
  @get('{id}', { cors: true, headers: { 'x-custom': 'value' } })
  static getUser(req: VovkRequest, { id }: { id: string }) {
    return { id };
  }
}
```

**Options:**

- `cors?: boolean` — adds CORS headers and answers OPTIONS, for the methods of that path that set it.
- `headers?: Record<string, string>` — custom response headers. See [Response Headers](https://vovk.dev/response#headers) for dynamic headers.
- `staticParams?: Record<string, string>[]` — `@get` only: static params for `generateStaticParams()`. See [Static Segment](https://vovk.dev/static-segment).
- `before?: (req: VovkRequest) => unknown` — runs on an HTTP request before the segment's [`onBefore`](https://vovk.dev/segment#creating-segments), the custom decorators and the handler, with the controller as `this`; an error it throws becomes the response.

### Auto-Generated Paths

Every HTTP decorator has an `.auto()` method that makes the path from the method name, in kebab-case:

```ts showLineNumbers copy
export default class UserController {
  // creates GET /api/get-all-users
  @get.auto()
  static getAllUsers() {
    return [];
  }
}
```

With a `params` schema, `.auto()` also adds each param to the path: `getUser` with `{ id }` becomes `get-user/{id}`.

## `@operation`

Adds [OpenAPI](https://vovk.dev/openapi) metadata to a procedure:

```ts showLineNumbers copy
import { operation, get } from 'vovk';

export default class UserController {
  @operation({ summary: 'Get user by ID', description: 'Returns a single user' })
  @get('{id}')
  static getUser() { /* ... */ }
}
```

`@operation.error()` documents error responses, and `@operation.tool()` sets [AI tool](https://vovk.dev/tools) metadata.

## Class Decorators

### `@prefix`

Adds a path in front of every endpoint of a controller:

```ts showLineNumbers copy
import { prefix, get } from 'vovk';

@prefix('users')
export default class UserController {
  @get('{id}') // => GET /api/users/{id}
  static getUser() { /* ... */ }
}
```

### `@cloneControllerMetadata`

Copies all metadata from a parent controller to a child class. Use it to reuse a controller in several [segments](https://vovk.dev/segment):

```ts showLineNumbers copy
import { prefix, cloneControllerMetadata } from 'vovk';
import UserController from './user-controller';

@cloneControllerMetadata()
@prefix('v2')
export default class UserControllerV2 extends UserController {}
```

## Custom Decorators

`createDecorator` builds your own middleware-style decorators for concerns that many procedures share, such as authentication, logging or caching. See the [Custom Decorators](https://vovk.dev/decorator) page for the API and the [Decorator Examples](https://vovk.dev/decorator-examples) page for common patterns.

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

---

Page: https://vovk.dev/decorator

# Custom Decorators

A decorator adds behavior to a procedure. Use decorators for concerns that many procedures share, such as logging, caching, validation and authorization. They can also attach custom metadata, for example to identify the authorized user.

`createDecorator` makes a decorator factory: a function that returns a decorator for controller methods. It takes a middleware function with these parameters:

- `request`, which extends `VovkRequest`. Its [req.vovk.meta](https://vovk.dev/req-vovk#meta) gets and sets metadata, to share data between decorators and the route handler.
- `next`, a function that calls the next decorator or the route handler. Call it and return its result. To retry, call it again: each call validates the input as the client sent it.
- The arguments passed to the decorator factory.

The optional second argument is an init handler. It runs each time the decorator is applied, and it can add validation or custom data to **.vovk-schema/\*.json**. It returns an object with the optional keys `"validation"`, `"operationObject"` and `"misc"` (custom metadata) to merge into the handler schema. Or it returns a function that gets the current handler schema and returns that object, so you merge them yourself.

```ts showLineNumbers copy
import { createDecorator, get, HttpException, HttpStatus, type VovkRequest } from 'vovk';

export interface ReqMeta {
  foo: string;
  a: string;
  b: number;
}

const myDecorator = createDecorator(
  (req, next, a: string, b: number) => {
    console.log(a, b); // Outputs: "baz", 1

    req.vovk.meta<ReqMeta>({ foo: 'bar', a, b }); // add metadata to the request

    if (isSomething) {
      // skip the handler and respond with { hello: 'world' }
      return { hello: 'world' };
    }

    if (isSomethingElse) {
      // or throw an HTTP error
      throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong');
    }

    // call the next decorator or the route handler
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
  static doSomething(req: VovkRequest) {
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

This decorator logs the request method and URL, then calls the next decorator or the route handler.

```ts showLineNumbers copy filename="src/decorators/log.ts"
import { createDecorator } from 'vovk';

const log = createDecorator((req, next, message?: string) => {
  console.log(`${message ?? 'Incoming request'}: ${req.method} ${req.url}`);
  return next();
});

export default log;
```

Import `log` and apply it to a procedure below the HTTP decorator (`@get`, `@post` and so on).

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { get, prefix } from 'vovk';
import log from '../../decorators/log';

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

With Basic authentication, the client sends the username and password in the `Authorization` header, encoded in Base64. It is not the most secure method, but it can be useful between older services.

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

Apply `basicAuthGuard` to procedures below the HTTP decorator.

```ts showLineNumbers copy filename="src/modules/secure/secure-controller.ts"
import { get, prefix } from 'vovk';
import basicAuthGuard from '../../decorators/basic-auth-guard';

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

> Role-based access control (RBAC) limits what users can do by their role in an organization, instead of by permissions given to each user.

The `authGuard` decorator below:

- Checks that the user is authorized, and otherwise responds with the `Unauthorized` status.
- Adds `currentUser` to the request metadata, typed by the `AuthMeta` interface.
- Checks the role with the `Permission` enum.

`identifyUserAndCheckPermissions` stands for your code that finds the user from the request (for example, from a JWT or a session) and checks that they have the permission.

```ts showLineNumbers copy filename="src/decorators/auth-guard.ts"
import { createDecorator, HttpException, HttpStatus, type VovkRequest } from 'vovk';
import type { User } from '@/types';

export enum Permission {
  CAN_DO_THIS = 'CAN_DO_THIS',
  CAN_DO_THAT = 'CAN_DO_THAT',
}

// lets the controller read currentUser from the metadata
export interface AuthMeta {
  currentUser: User;
}

// identify the user, check the permission and set the request metadata
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
  // authorized, with the metadata set: call the next decorator or the handler
  return next();
});

export default authGuard;
```

Import `authGuard` with `Permission` and `AuthMeta`, then apply it to procedures below the HTTP decorator.

```ts showLineNumbers copy filename="src/modules/user/user-controller.ts"
import { get, prefix, type VovkRequest } from 'vovk';
import authGuard, { Permission, type AuthMeta } from '../../decorators/auth-guard';

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

[Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) authorize with a secret in an environment variable. A decorator can check the `Authorization` header against it.

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

Apply `cronGuard` to the procedure the cron job calls.

```ts showLineNumbers copy filename="src/modules/cron/cron-controller.ts"
import { get, prefix } from 'vovk';
import cronGuard from '../../decorators/cron-guard';

@prefix('cron')
export default class CronController {
  @get('do-something')
  @cronGuard()
  static async doSomething() {
    // ...
  }
}
```

Add the cron job to `vercel.json`. The `schedule` field uses standard cron syntax; this one runs every day at midnight.

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

A controller, with its procedures as static methods, compiles to an RPC module. The module has the same structure, but its methods take different arguments. For example, take this controller:

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

It compiles to an RPC module with an `updateUser` method. The method takes `body`, `params` and `query` in one object:

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const updatedUser = await UserRPC.updateUser({
  body: { name: 'John Doe', age: 30, email: 'john@example.com' },
  params: { id: '123e4567-e89b-12d3-a456-426614174000' },
  query: { notify: 'push' },
});
```

`updateUser` validates the input on the client, puts `query` and `params` into the URL, and sends a standard `fetch` request, which `UserController.updateUser` handles on the server. The RPC method returns a promise of the procedure's return type. In plain `fetch`, the call looks like this:

```ts showLineNumbers copy
const resp = await fetch(`/api/users/${id}?notify=push`, {
  method: 'POST',
  body: JSON.stringify({
    /* ... */
  }),
});

const updatedUser = await resp.json();
```

An internal function, `createRPC`, creates the RPC module. It uses the default imports, or the imports set in the [vovk.config](https://vovk.dev/config) file. See [imports customization](https://vovk.dev/imports) for details.

```ts showLineNumbers copy
import type { VovkFetcher } from "vovk/fetcher";
import { createRPC } from "vovk/create-rpc";
import { schema } from "./schema";

import type { Controllers as Controllers0 } from "../app/api/[[...vovk]]/route.ts";

// The arguments are: schema, segmentName, rpcModuleName, fetcher and options
export const UserRPC = createRPC<
  Controllers0["UserRPC"],
  typeof import("vovk/fetcher").fetcher extends VovkFetcher<infer U> ? U : never
>(schema, "", "UserRPC", import("vovk/fetcher"), {
  validateOnClient: import("vovk-ajv"),
});
```

The generated client imports `vovk` subpaths, such as `vovk/fetcher`, and JSON files with import attributes. It compiles with `"moduleResolution"` set to `"bundler"` (the Next.js default), `"node16"` or `"nodenext"`. With `"node"`, TypeScript can't find `vovk/fetcher`. The client alone compiles on TypeScript 5.3+, but a service or a handler that takes its types from its own procedure, as in these docs and the files `vovk new` writes, needs TypeScript 5.5+.

Under `"node16"` or `"nodenext"`, the client imports its own files by their `.js` names, such as `./schema.js` (by their `.ts` names when `allowImportingTsExtensions` is on). Turbopack resolves a `.js` name to the `.ts` file, but `next build --webpack` doesn't, unless **next.config** sets `experimental: { extensionAlias: { '.js': ['.ts', '.tsx', '.js'] } }`.

## RPC Method Options

Besides `body`, `params` and `query`, every RPC method accepts the options below. You can [extend the list with a custom `fetcher`](https://vovk.dev/imports#fetcher).

### `apiRoot`

Overrides the API root. The default is `/api`. You can also [configure](https://vovk.dev/config) it with `rootEntry`, `origin` or both.

### `init`

Passes `RequestInit` options (the `fetch` options), such as `headers` and `credentials`, and [Next.js-specific options](https://nextjs.org/docs/app/api-reference/functions/fetch) such as `next: { revalidate: number }{:ts}`.

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

Post-processes the result. The function receives the parsed response data and the original `Response`, and returns a new value.

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

It can also return the `Response` together with the data:

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

Turns off client-side validation for this call. Use it when debugging, to see the server's validation errors instead.

```ts showLineNumbers copy
await UserRPC.updateUser({
  // ...
  disableClientValidation: true,
});
```

### `interpretAs`

Sets the content type that the client uses to read the response. For example, use it when the server returns JSON Lines without setting `content-type` to `application/jsonl`.

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

The `withDefaults` method returns a new RPC module with default options for every call. The defaults are deep-merged with each call's options. Headers merge by name, ignoring case, whether a layer gives them as an object, a `Headers{:ts}` instance or entries. A header given in the call replaces a default one.

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

You can change the client's fetch function and its option types. See the [`fetcher` customization docs](https://vovk.dev/imports#fetcher).

```ts showLineNumbers copy
await UserRPC.updateUser({
  // ...
  successMessage: 'Successfully updated the user',
  someOtherCustomFlag: true,
});
```

## Type Override

If type inference can't find the return type, pass it as a type argument. You don't need to cast to `unknown` first.

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

If the handler returns an async iterable, the RPC method resolves to a [disposable](https://github.com/tc39/proposal-explicit-resource-management) [async iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator) that reads the [JSON Lines](https://vovk.dev/jsonlines) stream.

```ts showLineNumbers copy
import { StreamRPC } from '@/client';

using stream = await StreamRPC.getJSONLines();

for await (const { message } of stream) {
  console.log('Received message:', message);
}
```

## Access to Schema

Every RPC method has the emitted schema in these properties:

- `schema` - the method's schema;
- `controllerSchema` - the schema of the method's controller;
- `segmentSchema` - the schema of the segment;
- `fullSchema` - the full schema, of type `VovkSchema`, with all segments and the emitted config (by default, only the `libs` and `rootEntry` options; see [config documentation](https://vovk.dev/config)).

For the type of one of them, use `typeof`, such as `typeof UserRPC.updateUser.segmentSchema`.

```ts showLineNumbers copy
console.log(UserRPC.updateUser.schema.validation?.body); // the JSON schema of the body
console.log(UserRPC.updateUser.schema.operationObject); // the OpenAPI operation object of this method
console.log(UserRPC.updateUser.fullSchema.meta?.config.libs?.ajv); // a config option
```

[LLM tools](https://vovk.dev/tools) can use this schema to define their parameters.

## `getURL` method

Every RPC method has a type-safe `getURL` function. It returns the method's URL, with `params` and `query` in it.

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const url = UserRPC.updateUser.getURL({
  params: { id: '69' },
  query: { notify: 'push' },
  apiRoot: 'https://api.example.com/v1', // optional
});
console.log(url); // "https://api.example.com/v1/users/69?notify=push"
```

Use it to call `fetch` directly:

```ts showLineNumbers copy
const response = await fetch(
  UserRPC.updateUser.getURL({
    /* ... */
  }),
  {
    method: 'POST',
    // ... other fetch options
  }
);
```

## React Query

Every RPC method has a `queryKey` function. It returns a globally unique key for [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query). The key is an array: `[segmentName, controllerPrefix, rpcModuleName, decoratorPath, httpMethod, ...key]{:ts}`. `...key` holds optional extra values that tell similar queries apart.

```tsx showLineNumbers copy
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

Use the key to invalidate the cache, to refetch, and with other React Query features.

```ts showLineNumbers copy
queryClient.invalidateQueries({
  queryKey: UserRPC.getUser.queryKey().slice(0, 3), // Invalidate all queries for the `UserRPC` module
});
```

For streamed responses, [`streamedQuery`](https://tanstack.com/query/latest/docs/reference/streamedQuery) reads [JSON Lines](https://vovk.dev/jsonlines) as an array.

```tsx showLineNumbers copy
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

RPC methods also work as mutation functions.

```tsx showLineNumbers copy
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
            body: { name: 'John Doe', age: 30, email: 'john@example.com' },
            params: { id: '123e4567-e89b-12d3-a456-426614174000' },
            query: { notify: 'push' },
          })
        }
      >
        Update User
      </button>
      {mutation.isPending ? 'Loading...' : JSON.stringify(mutation.data)}
    </div>
  );
};
```

## `openapi` and `schema`

The generated client also exports the OpenAPI spec as `openapi` and the Vovk Schema as `schema`, each from a module of the same name.

```ts showLineNumbers copy
import { openapi } from '@/client/openapi';
import { schema } from '@/client/schema';
```

The main module exports `schema` too.

```ts showLineNumbers copy
import { schema } from '@/client';
```

The [segmented client](https://vovk.dev/segmented) has the same exports, but `openapi` and `schema` hold only the data of their segment:

```ts showLineNumbers copy
import { openapi } from '@/client/admin/openapi';
import { schema } from '@/client/admin'; // or from '@/client/admin/schema'
```

## Used Templates

The TypeScript RPC client is generated from these templates:

- [ts](https://vovk.dev/templates#ts) - the uncompiled TypeScript module with its types; the default for both the [composed client](https://vovk.dev/composed) and the [segmented client](https://vovk.dev/segmented);
- [mixins](https://vovk.dev/templates#mixins) - the `.d.ts` types and `.json` files for [OpenAPI mixins](https://vovk.dev/mixins);
- [readme](https://vovk.dev/templates#readme), [packageJson](https://vovk.dev/templates#packagejson) - a `README.md` that documents the RPC modules, and a `package.json` for publishing the client as an npm package.

For more, see the [client templates documentation](https://vovk.dev/templates).

---

Page: https://vovk.dev/imports

# TypeScript Client Customization

You can replace the lower-level modules that the generated TypeScript client imports: the [fetcher](#fetcher) and [validateOnClient](#validateonclient). Set them in the `outputConfig.imports` object of the [config](https://vovk.dev/config) file. The object also takes `createRPC`: the module the client imports `createRPC` from, `vovk/create-rpc` by default (see [config](https://vovk.dev/config)).

With **vovk-ajv** (described below) for client-side validation, the generated `index.ts` that creates the `UserRPC` module looks roughly like this:

```ts showLineNumbers copy filename="./src/client/index.ts"
import { createRPC } from 'vovk/create-rpc';
import { schema } from './schema';

export const UserRPC = createRPC(schema, '', 'UserRPC', import('vovk/fetcher'), {
  validateOnClient: import('vovk-ajv'),
  apiRoot: 'http://localhost:3000/api',
});
```

With custom `outputConfig.imports`:

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

The generated `index.ts` imports them, with relative paths adjusted to its folder. A path to a `.ts` file is written the way `tsconfig.json` resolves it: without the extension under bundler resolution, by its `.js` name under `node16` or `nodenext`.

```ts showLineNumbers copy filename="./src/client/index.ts"
import { createRPC } from 'vovk/create-rpc';
import { schema } from './schema';

export const UserRPC = createRPC(schema, '', 'UserRPC', import('../lib/fetcher'), {
  validateOnClient: import('../lib/validate-on-client'),
  apiRoot: 'http://localhost:3000/api',
});
```

You can also set `fetcher` and `validateOnClient` per [segment](https://vovk.dev/segment), [OpenAPI mixins](https://vovk.dev/mixins) included. This way each segment can have its own options, auth and validation library.

```ts showLineNumbers copy
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      // for all segments
      fetcher: './src/lib/fetcher',
      validateOnClient: './src/lib/validate-on-client',
    },
    segments: {
      admin: {
        imports: {
          // for the "admin" segment only
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

The `fetcher` validates the input on the client, sends the HTTP request, and returns the data by content type:

- For `application/json` and any `+json` type, such as `application/problem+json`, it returns the parsed JSON. A response without a body, such as a `204` or the answer to a `HEAD` request, gives `null`. An error status throws an `HttpException{:ts}` with the body's `message`, or with the `detail` or `title` of a problem details document.
- For [JSON Lines](https://vovk.dev/jsonlines) (`application/jsonl`, `application/jsonlines` or `application/x-ndjson`), it returns a disposable async iterable.
- For other content types, it returns the `Response` object as is, so you can read text or binary data. A status of 400 or above throws an `HttpException{:ts}` instead, with the response text as its message.

The comparison ignores the content type's parameters and letter case, so `Application/JSON; charset=utf-8` is JSON.

The fetcher can also take custom options, passed to an RPC method on each call.

```ts showLineNumbers copy
import { UserRPC } from '@/client';

const user = await UserRPC.updateUser({
  // ...
  successMessage: 'Successfully updated the user',
  someOtherCustomFlag: true,
});
```

### `createFetcher`

The module at `imports.fetcher` must export a `fetcher` variable. `createFetcher` from `vovk/fetcher` makes one.

```ts showLineNumbers copy filename="./src/lib/fetcher.ts"
import { createFetcher } from 'vovk/fetcher';

export const fetcher = createFetcher<{
  successMessage?: string; // "Successfully created a new user"
  useAuth?: boolean; // true sets the Authorization header
  someOtherCustomFlag?: boolean; // any other option for the RPC method
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

Every RPC method then accepts these options:

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

`createFetcher` takes an object with:

#### `prepareRequestInit(init: RequestInit, options: T){:ts}`

Runs before the request. It receives the prepared `init` and the call's custom `options`, and must return a `RequestInit` object, usually based on `init`. Use it for auth headers, the Next.js `next` options, logging, or other work before the request.

#### `transformResponse(data: unknown, options: T, info: { response: Response, init: RequestInit, schema }){:ts}`

Changes the response data before the caller gets it. `data` is JSON, a [disposable](https://github.com/tc39/proposal-explicit-resource-management) [async iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator), or a `Response`, depending on the content type. Return the new value. The `info` argument holds the original `Response`, the `RequestInit` used, and the method's schema: the same object as `UserRPC.updateUser.schema`, with fields such as `schema.operationObject`.

#### `onError(error: HttpException, options: T){:ts}`

Runs when a request fails. Use it for error messages, logging, or custom handling. Its third argument, `info`, holds the `response`, `init`, `respData` and `schema`; the first three are `null` when the call failed before it had them.

#### `onSuccess(data: unknown, options: T){:ts}`

Runs when a request succeeds. Use it for success messages, logging, or post-processing. Its third argument, `info`, is the same as in `transformResponse`.

### Event-style callbacks

You can also add `onSuccess` and `onError` callbacks after you create the fetcher. Use this when a callback needs something that doesn't exist at creation time, such as a React context value or a Zustand store. Both methods return a function that removes the callback. Several callbacks run in the order you add them.

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

`validateOnClient` validates the input of an RPC or API method (`params`, `query`, `body`) on the client. Create it with `createValidateOnClient` from `vovk/create-validate-on-client`. It takes a `validate` function, which receives the input data, its JSON schema and metadata, and returns the validated data or throws. Validation runs only when both the input and its schema exist.

```ts showLineNumbers copy filename="./src/lib/validate-on-client.ts"
import { validateData } from 'some-json-validation-library';
import { createValidateOnClient, HttpException, HttpStatus } from 'vovk/create-validate-on-client';

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

[vovk-ajv](https://www.npmjs.com/package/vovk-ajv) is the main client-side validation library, built on [Ajv](https://www.npmjs.com/package/ajv). `npx vovk-cli init` installs and configures it. You can set Ajv options and the target JSON Schema draft under `config.libs.ajv` in [vovk.config](https://vovk.dev/config).

- Ajv runs with `strict: false` unless your options say otherwise, so it ignores keywords JSON Schema doesn't define, such as Zod's `example` or OpenAPI's `discriminator` and `x-*`.
- A `pattern` is read with the `u` flag, which `\p{…}` needs, as in `z.emoji()`. A pattern the `u` flag refuses, such as one with a `\-` escape that Zod's regexes allow, is read without it.
- OpenAPI 3.0's boolean `exclusiveMinimum` and `exclusiveMaximum` are read as the bounds they mark.
- A `FormData` or `URLSearchParams` body holds strings, and so do `params` and `query`, which the URL carries. So they are validated with `coerceTypes: true`: `"5"` passes as a number. Ajv never edits the `params` and `query` it checks, so they are sent as given.
- When Ajv can't compile a schema, the client skips validation for it and logs a warning. Where Ajv can't generate code at all, as on a page whose Content Security Policy has no `'unsafe-eval'`, the client skips every check and warns once. The server still validates the request.

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
      target: 'draft-2020-12', // detected from $schema unless you set it
    },
  },
};
export default config;
```

---

Page: https://vovk.dev/composed

# Composed Client Mode

By default, Vovk.ts generates one RPC client with the RPC modules of every segment: the **Composed Client**. It fits single-page apps, where one import gives you all RPC modules. The files go to the **src/client** folder when the app is in `src/app` (otherwise **client**; you can [change it](https://vovk.dev/config)), and you import them as `@/client` with the default Next.js path alias.

The default [ts](https://vovk.dev/templates#ts) template generates this **src/client** folder:

```
src/client/
  index.ts
  schema.ts
  openapi.ts
  openapi.json
```

The client comes from the committed [schema](https://vovk.dev/schema) and source code, so you don't commit it: [vovk init](https://vovk.dev/quick-install) adds the output folder to `.gitignore` and sets up the NPM scripts, so `vovk generate` generates the client again on every build.

This [CLI](https://vovk.dev/generate) command does the same as the default generation:

```sh npm2yarn copy
npm exec -- vovk generate --from ts --out src/client
```

The composed client exports each RPC module by its name, so two segments can't both have a `UserRPC`: generation fails with a message that names both segments. Rename the module in one segment's `controllers` object, or leave that segment out with [`excludeSegments`](#excludesegments) and import it from the [segmented client](https://vovk.dev/segmented).

## Composed Client Config

The options of the composed client:

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    enabled: true, // default
    fromTemplates: ['ts'], // default
    outDir: './src/client', // default; './client' when there is no src/app folder
    includeSegments: ['foo'], // or excludeSegments: ['bar'], not both
  },
};
export default config;
```

### `enabled`

`false` turns off the composed client, for example when you want only segmented clients.

### `fromTemplates`

The templates that generate the composed client. The default, `["ts"]`, produces TypeScript modules that compile together with the rest of your app. You can mix [built-in templates](https://vovk.dev/templates) and custom ones.

### `outDir`

Where the composed client is generated. Defaults to `./src/client` when the project has a `src/app` folder (and no root `app` folder), or `./client` otherwise. The path is relative to the current working directory (CWD). If the folder already has files with the generated names, such as a hand-written `index.ts`, generation stops and names them; see [`--force`](https://vovk.dev/generate#other-flags).

### `includeSegments`

The segments the composed client includes. By default, all segments.

### `excludeSegments`

The segments the composed client leaves out. By default, none. You can't use it together with `includeSegments`.

### `prettifyClient`

Whether to format the generated code. Defaults to `true`. The CLI uses the [Prettier](https://prettier.io/) package of your project, with your Prettier config; the CLI doesn't install it. Without Prettier, the CLI prints a warning and writes unformatted code. To stop the warning, install Prettier or set `prettifyClient` to `false`.

### `outputConfig`

Overrides the root [`outputConfig` options](https://vovk.dev/config#outputconfig).

---

Page: https://vovk.dev/segmented

# Segmented Client Mode

The [Composed Client Mode](https://vovk.dev/composed) fits single-page apps. In a larger app, you may not want one client to expose the whole schema. The **Segmented Client** is a separate RPC client for each segment: smaller TypeScript modules that you import one by one, so a page doesn't load the RPC modules and schemas of unrelated segments. For example, “customer” pages don't import the “admin” RPC modules, and admin details stay out of customer code.

By default, the segmented client is generated in the `./src/client` folder (or `./client` when the app isn't in `src/app`) from the [ts](https://vovk.dev/templates#ts) template. For an app with several segments, it can look like this:

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

An RPC module imported from one of these `.ts` files brings only the schema and the RPC modules of its segment. For example, `UserRPC` from the `customer` segment brings `.vovk-schema/customer.json`, but not `.vovk-schema/admin.json` or the files of other segments.

```ts showLineNumbers copy
import { UserRPC } from '@/client/customer'; // the import tree has customer.json only

await UserRPC.getUser({ params: { id: '123' } });
```

The [Rust](https://vovk.dev/rust) and [Python](https://vovk.dev/python) templates work with the segmented client too, though it's less common. Each segment folder then holds a whole package, with its `Cargo.toml` or `pyproject.toml`. The package is named after the project's package and the segment: for a project named `app`, the `foo` segment's package is `app_foo` and the root segment's is `app_root`; `py_name` and `rs_name` get the same suffix. A `package.name`, `py_name` or `rs_name` set for the segment in [outputConfig.segments](https://vovk.dev/config#segments) is used as it is. Both templates write a `README.md` to each segment folder, so segmented Python and Rust clients need separate output folders: set `outDir` in the [segmentedClient](https://vovk.dev/templates#segmentedClient) options of a template definition. `vovk generate` refuses two templates that write the same file.

To turn on the segmented client, set `segmentedClient.enabled` to `true` in `vovk.config.mjs`. To turn off the composed client, set `composedClient.enabled` to `false`.

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

The options are the same as the options of the [composed client](https://vovk.dev/composed):

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

The `npm run dev` script runs [vovk dev](https://vovk.dev/dev) next to `next dev` with [concurrently](https://www.npmjs.com/package/concurrently). The Vovk process watches the `modules` folder and the segment route files. On the first run and after a change, it calls the `_schema_` endpoint of the Next.js dev server (served only when `process.env.NODE_ENV` is `development`). It calls the endpoint of the segment whose controller changed, or of every segment when the changed file holds no known controller, such as a service or a validation module. The endpoint returns the schema of its own segment.

Each segment writes its back-end schema to a JSON file of its own, and the client RPC modules are generated from these files. An app with several areas, such as root, admin and customer, has a schema file for each area.

For these segments:

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

The schema files in `.vovk-schema/` are:

```
.vovk-schema/
  root.json
  admin.json
  customer.json
  customer/
    static.json
  _meta.json
```

The files follow the segment tree: a `foo/bar/baz` segment emits `.vovk-schema/foo/bar/baz.json`. Only the root segment is different: its file is `root.json`, for clarity.

`_meta.json` holds more metadata, such as the selected fields of [vovk.config](https://vovk.dev/config) under the `config` key.

The CLI reads these files into one object with `segments` and `meta`. `segments` is flat, keyed by segment name; `meta` holds the content of `_meta.json`. In the project's own schema folder, each value the config exposes comes from the current vovk.config, so `vovk generate` doesn't wait for `vovk dev` to update the file. The client and the OpenAPI output are generated from this object.

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

The client exports it as `schema`.

```ts showLineNumbers copy
import { schema } from '@/client';
// or
import { schema } from '@/client/schema'; // exports only the schema object (no RPC modules)

console.log(schema); // full schema
console.log(schema.segments.admin); // admin segment schema
```

The `schema` object is typed from its JSON files, where every string field is a plain `string`. So it isn't assignable to the `VovkSchema` type, whose fields are literal unions.

The [segmented client](https://vovk.dev/segmented) exports `schema` too, with exactly one segment:

```ts showLineNumbers copy
{
  "segments": {
    "": { ... } // root segment schema from root.json
  },
  "meta": { ... } // content of _meta.json file
}
```

```ts showLineNumbers copy
import { schema } from '@/client/root';
// or
import { schema } from '@/client/root/schema';
```

---

A segment schema file:

```jsonc filename=".vovk-schema/foo.json"
{
  // Segment schema version
  "$schema": "https://vovk.dev/api/schema/v3/segment.json",
  // The initSegment option that sets whether the segment emits its schema
  "emitSchema": true,
  // Segment name, an empty string for the root segment
  "segmentName": "foo",
  // "segment", or "mixin" for an OpenAPI mixin
  "segmentType": "segment",
  // Controllers by name, for fast access
  // The key is the name that "@/client" exports
  // The value describes the controller
  "controllers": {
    "HelloRPC": {
      // RPC module name in the client
      "rpcModuleName": "HelloRPC",
      // Controller class name; "vovk dev" uses it to find the segment of a changed controller
      "originalControllerName": "HelloController",
      // The argument of the @prefix class decorator
      "prefix": "hello",
      // Handlers by name, for fast access
      // The key is the static method name
      // The value describes the handler
      "handlers": {
        "getHello": {
          // Endpoint path, appended to the prefix
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
              // or "iteration" for a JSON Lines response
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
          // OpenAPI operation, for OpenAPI documentation, LLM tools, MCP and so on
          "operationObject": {
            "summary": "Hello world",
            "description": "Hello world",
            // Custom field for AI tools
            "x-tool": { 
              "name": "getHello", // custom name for an AI tool
              "title": "Get Hello", // custom title for an AI tool
              "description": "Hello world", // custom description for an AI tool
              "hidden": false, // whether to leave the tool out of the derived tools
              "meta": { "category": "greetings" } // static data copied to the derived tool
            } 
          },
          // Custom data, set by a custom decorator
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

Vovk.ts can add modules generated from one or more OpenAPI specifications to its client. Use it to call third-party APIs from a Next.js/Vovk.ts app, or as a standalone code generator that doesn't need Next.js. This page covers the [configuration](https://vovk.dev/config) options for code generation. The [generate](https://vovk.dev/generate) command doesn't need a config file.

## Features

### Call Signature

Every method has the same call signature, a single argument object:

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

`withDefaults` creates a copy of an API module with default options:

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

A method sends each query parameter in the `style` and `explode` that the OpenAPI document declares for it: `form` (repeated keys, or comma-separated with `explode: false`), `spaceDelimited`, `pipeDelimited` or `deepObject` (`filter[status]=sold`). A parameter that declares neither is sent in OpenAPI's default, `form` exploded: `tags=a&tags=b` for an array, and the keys of an object as parameters of their own.

```ts showLineNumbers copy
// tags declared with explode: true, ids with explode: false
await PetstoreAPI.listPets({ query: { tags: ['a', 'b'], ids: [1, 2] } }); // GET /pets?tags=a&tags=b&ids=1,2
```

In an `application/x-www-form-urlencoded` body, a property whose `encoding` declares a style is sent in that style, as Stripe's `metadata` with `deepObject`: `metadata[order_id]=6735`. Other properties are sent as in any form body: an array as repeated keys, an object as JSON.

### Client-Side Validation and Schema Availability

Generated API modules can validate the input with [Ajv](https://ajv.js.org/) on the client, before they send the request. To turn validation off, pass `disableClientValidation: true`.

```ts showLineNumbers copy
import { UserAPI } from '@/client';

await UserAPI.updateUser({
  // ...throws a validation error if the input is invalid
});
```

The generated code also exports the Vovk.ts schema. The [composed client](https://vovk.dev/composed) and each chunk of the [segmented client](https://vovk.dev/segmented) export it as a `schema` object.

```ts showLineNumbers copy
import { schema } from '@/client';
// import { schema } from '@/client/schema';
```

Every generated method has its schema too:

```ts showLineNumbers copy
import { UserAPI } from '@/client';
UserAPI.updateUser.schema.validation?.body; // JSON Schema for request body
```

### Deriving AI Tools

Every generated API module can be turned into [AI tools](https://vovk.dev/tools) for function calling APIs.

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

Vovk.ts templates can also generate Python and Rust clients, with client-side validation and the same options. See the [Python](https://vovk.dev/python) and [Rust](https://vovk.dev/rust) pages.

### Type Inference for Unnamed Schemas

In good OpenAPI design, `components/schemas` defines the input and output data, so the generated client functions get named types. Not every specification does this, and moving every input and output into `components/schemas` can be impractical.

Without `components/schemas`, many code generators produce awkward type names, such as `ApiUsersIdPostRequest` or `ApiUsersIdPost200Response`. Developers then often use the `Parameters<T>[index]` generic, or skip code generation and use `fetch` or `axios` with manual casts.

Vovk.ts infers types for unnamed schemas. When a specification doesn't define `components/schemas`, these type utilities give you the input and output types:

```ts showLineNumbers copy
import { PetstoreAPI } from '@/client';
import type { VovkBody, VovkQuery, VovkParams, VovkOutput } from 'vovk';

type Body = VovkBody<typeof PetstoreAPI.updatePet>;
type Query = VovkQuery<typeof PetstoreAPI.updatePet>;
type Params = VovkParams<typeof PetstoreAPI.updatePet>;
type Output = VovkOutput<typeof PetstoreAPI.updatePet>;
```

In the [Python](https://vovk.dev/python) client, the types are `TypedDict`s:

```py
from vovk_client import PetstoreAPI

body: PetstoreAPI.UpdatePetBody = {"id": 1, "name": "Doggo", "photoUrls": []}
output: PetstoreAPI.UpdatePetOutput = {"id": 1, "name": "Doggo", "photoUrls": [], "status": "sold"}
```

In the [Rust](https://vovk.dev/rust) client, the types are nested modules with structs and enums. They follow the structure of the specification's schemas, with the `_::` separator:

```rs
use vovk_client::petstore_api::update_pet_::{
    body as Body,
    output as Output,
    Pet,
    Pet_::status as Status, // for nested data
};
```

### Bundle

Once you configure the `bundle.build` function (see [bundle page](https://vovk.dev/bundle)), the `bundle` command builds the [TypeScript](https://vovk.dev/typescript) client into an npm package. It also writes `package.json` and `README.md`, and the README shows each method with a code sample. See the ["Hello World" example](https://vovk.dev/hello-world#bundle) for details.

A bundle needs `package.json` and `tsconfig.json` at the project root.

## Getting Started

### Using Standalone Codegen

To use the code generator as a standalone CLI, even without `package.json`, install **vovk-cli** globally or as a dev dependency. Skip this section if you use Vovk.ts in a Next.js project.

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

The [composed client](https://vovk.dev/composed), which combines all generated API clients into one, goes to `client/` in standalone codegen, or to `src/client` in a Next.js app whose app folder is `src/app` (`composedClient.outDir` changes it). Your code imports it directly, for example as `@/client`.

### Create Config File

To customize the generated code, create a config file as the [config](https://vovk.dev/config) page describes, or run `vovk-cli init`:

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

A mixin is a pseudo-[segment](https://vovk.dev/segment) in `outputConfig.segments` with an `openAPIMixin` property. The key is the mixin name. Generation fails for `root`, or for a name that a segment or another mixin has, ignoring case, because the [segmented client](https://vovk.dev/segmented) writes each one to a folder of that name. Two mixins also can't give the same `Mixins` namespace, like `my-api` and `myApi`, and two segments of the [composed client](https://vovk.dev/composed) can't export modules of the same name. The property accepts:

- `source`: an object with `url` (a remote spec), `file` (a local spec) or `object` (an inline spec). With `url`, you can add a `fallback` file path. The CLI reads it when the fetch fails, and updates it after each successful fetch.
- `getModuleName`: a string or a function that names the generated API modules. A string is a fixed module name and must be a valid identifier. The default is `'api'`.
- `getMethodName`: a string or a function that names the methods. The strings are `camel-case-operation-id` and `auto` (the default). `camel-case-operation-id` converts an `operationId` such as `get_users` to `getUsers`, with a leading underscore when it starts with a digit (`2fa_verify` becomes `_2FaVerify`). With it, generation fails for an operation without an `operationId`. `auto` uses the `operationId`, or the HTTP method and path when the `operationId` is unsuitable or missing. From the path, `auto` names `GET /users` `listUsers`, `GET /users/{id}` `getUsersById` and `PATCH /users/{userId}/profile` `patchUsersProfileByUserId`. When two operations get the same name, the later one in the document gets a `_2` suffix, and the CLI warns.
- `apiRoot` (optional): the API root URL. The `apiRoot` call option overrides it. Required if the OAS document has no `servers` property.
- `filterOperations` (optional): a predicate that keeps only the operations it returns `true` for. See [Filter Operations and Prune Components](#filter-operations-and-prune-components).
- `pruneComponents` (optional, default `false`): removes the components that the kept operations don't reference from the generated schema. See [Filter Operations and Prune Components](#filter-operations-and-prune-components).

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

This generates one `PetstoreAPI` module, with a method for each operation in the spec.

```ts showLineNumbers copy
import { PetstoreAPI } from '@/client';

await PetstoreAPI.findPetsByStatus({ query: { status: 'available' } });
```

When `getModuleName` or `getMethodName` is a function, it receives:

- `operationObject`: the Operation Object for the operation.
- `method`: the HTTP method (uppercase string).
- `path`: the operation path.
- `openAPIObject`: the entire OpenAPI document.

A larger example is the [GitHub REST API](https://docs.github.com/en/rest). Each `operationId` in the [GitHub OpenAPI spec](https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json) has the form `scope/operation`, such as `repos/remove-status-check-contexts` or `codespaces/list-for-authenticated-user`. The config below makes module names from the first part and method names from the second, with lodash.

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

The result is several modules:

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

Third-party OAS documents can contain keywords that JSON Schema doesn't define, such as `example`, `discriminator` or `x-*`. [vovk-ajv](https://vovk.dev/imports#vovk-ajv) ignores them, and leaves a schema that Ajv can't compile for the server to validate.

### Filter Operations and Prune Components

A large spec makes a large client: every operation becomes a method, and the generated schema carries the whole `components` dictionary. Stripe's spec gives 534 methods and 1693 components, megabytes of generated JSON for an app that may call a few endpoints. Two options cut this down:

- `filterOperations`: only the operations the predicate returns `true` for are generated. It receives the same object as the naming functions (`operationObject`, `method`, `path`, `openAPIObject`) and runs before them, so a filtered-out operation produces no method, types or validation schemas. Omit it to keep all operations.
- `pruneComponents` (default `false`): removes from the segment schema every component that the kept operations don't reference, directly or through other components. Don't turn it on if you import `Mixins.<Segment>.<Component>` types for components that no kept operation uses: they are removed with their schemas.

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

For this Stripe subset, the segment schema drops from ~8.4 MB (534 operations, 1693 components) to ~1.2 MB (8 operations, 863 components). Stripe's core objects reference each other a lot, so the 8 operations still reach 863 components.

### Customize Fetcher

Each mixin can have its own fetch function, or all mixins can share one. The [fetcher](https://vovk.dev/imports#fetcher) sets authorization headers, runs client-side validation, and sends and handles the HTTP requests.

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

By default, the [composed client](https://vovk.dev/composed) uses the [ts](https://vovk.dev/templates#ts) template to generate a TypeScript client.

```ts showLineNumbers copy
import { PetstoreAPI, GithubIssuesAPI } from '@/client';

await PetstoreAPI.findPetsByStatus({ query: { status: 'available' } });
await GithubIssuesAPI.listForOrg({ params: { org: 'finom' } });
```

The `Mixins` namespace holds the types generated from `components/schemas` of all mixed-in OpenAPI specifications, as an alternative to inference. Each mixin gets a namespace, and each component a type, both named in PascalCase: the `petstore` mixin's `Pet` component is `Mixins.Petstore.Pet`. Letters of any script are kept. A name that would start with a digit gets a leading underscore: `2FAConfig` becomes `_2FaConfig`. When two components get the same name, the later one in the document takes a number: `user-profile` and `UserProfile` become `UserProfile` and `UserProfile2`.

```ts showLineNumbers copy
import type { VovkOutput } from 'vovk';
import { PetstoreAPI, type Mixins } from '@/client';

const pet: Mixins.Petstore.Pet = { id: 1, name: 'Doggo', photoUrls: [] };
// Alternatively:
const pet2: VovkOutput<typeof PetstoreAPI.getPetById> = { id: 1, name: 'Doggo', photoUrls: [] };
```

`composedClient.outDir` changes the output folder:

```ts showLineNumbers copy filename="vovk.config.js"
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    outDir: './src/lib/client', // a custom folder
  },
};
export default config;
```

```ts showLineNumbers copy
import { PetstoreAPI, GithubIssuesAPI } from '@/lib/client';
// ...
```

### Segmented Client

The [segmented client](https://vovk.dev/segmented) splits the code into chunks. Each mixin goes to a folder named after its segment (`petstore`, `github` and so on, from `outputConfig.segments`).

By default, the output goes to the composed client's folder: `src/client` with a `src/app` folder, `client/` otherwise. `segmentedClient.outDir` changes the folder.

```ts showLineNumbers copy filename="vovk.config.js"
/** @type {import('vovk').VovkConfig} */
const config = {
  segmentedClient: {
    enabled: true,
    outDir: './src/lib/client', // a folder in your code
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
> The Python client is experimental and may have bugs. Use it with caution.

`vovk generate` creates the Python client from the [py](https://vovk.dev/templates#py) or [pySrc](https://vovk.dev/templates#pysrc) template.

Install the generator package:

```sh npm2yarn copy
npm install vovk-python --save-dev
```

Create a Python package with the [CLI](https://vovk.dev/generate):

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

To generate source files for another Python project instead, use the `pySrc` template:

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

You can [configure](https://vovk.dev/config) the default [generate](https://vovk.dev/generate) command (without flags) to create the client. [vovk dev](https://vovk.dev/dev) creates it too, and creates it again on every schema change. Add the `py` template to the [composed client](https://vovk.dev/composed) config:

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

The Python client calls an absolute URL, so it needs [`outputConfig.origin`](https://vovk.dev/config#outputconfig). Set it on the `py` template, and the TypeScript client keeps its relative URLs. Without an origin, `vovk generate` warns, and every call needs its own `api_root`.

Like other templates, the [py](https://vovk.dev/templates#py) template has a default `outDir` for composed clients: `./dist_python`. Change it in the [template definitions](https://vovk.dev/templates#defs):

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

The samples below are based on the example from the [Hello World](https://vovk.dev/hello-world) page.

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

...emits a [Vovk.ts schema](https://vovk.dev/schema). The Python client is generated from it. It follows Python conventions, adds comments from `description`, and picks matching number types: `age` becomes an `int`, as in the controller.

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

All RPC modules are in `__init__.py`, with the RPC functions and their types. Nested structures get `TypedDict` types. A key the schema doesn't require is `NotRequired`, imported from `typing_extensions` before Python 3.11. A type that isn't a `TypedDict`, such as a `str` output, is a `TypeAlias`, imported the same way.

Types for `body`, `query` and `params` are named `[PascalCaseMethodName][InputType]`. For `updateUser`, they are `UpdateUserBody`, `UpdateUserQuery` and `UpdateUserParams`.

Method names are in snake_case: `UserRPC.updateUser` is `UserRPC.update_user`. Each RPC class names its methods in schema order. A name that is already taken gets the first free suffix, `_2`, `_3`, so `getUserByID` and `getUserById` give `get_user_by_id` and `get_user_by_id_2`.

```py
from vovk_hello_world import UserRPC

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

The client uses [requests](https://pypi.org/project/requests/) for HTTP, [jsonschema](https://pypi.org/project/jsonschema/) for client-side validation, and other common libraries. A `pattern` that Python's `re` can't compile, such as `\p{L}`, is left to the server.

A call returns the parsed JSON, or `None` for an empty JSON body. A `text/*` response, or a response of any type with a charset, comes back as a `str`, decoded as UTF-8 unless the charset names another encoding. Any other response, such as a file, comes back as `bytes`.

### JSON Lines Endpoints

For [JSON Lines](https://vovk.dev/jsonlines) endpoints, the Python client returns a `Generator` that you iterate over.

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
from vovk_hello_world import StreamRPC

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

All calls share one `requests.Session`, so connections stay open between them. The client waits 10 seconds to connect and 300 seconds for each read. An upload fails when the server takes no data for 10 seconds. The timeout and the session are attributes of the module-level `client`:

```py
from package_name import client

client.timeout = 30  # seconds, or a (connect, read) tuple; None waits forever
client.session.headers["Authorization"] = "Bearer ..."
```

The session doesn't keep cookies that responses set, because one client serves every call and thread. A cookie you set by hand, such as `client.session.cookies.set("session", "...")`, goes with every call. To keep the cookies that responses set, call `client.session.cookies.set_policy(http.cookiejar.DefaultCookiePolicy())`.

## Roadmap/bugs

- ✨ Generate importable types for named schemas defined in `components/schemas`.

---

Page: https://vovk.dev/rust

# Rust Client

> [!WARNING]
>
> The Rust client is experimental and may have bugs. Use it with caution.

`vovk generate` creates the Rust client from the [rs](https://vovk.dev/templates#rs) or [rsSrc](https://vovk.dev/templates#rssrc) template.

Install the generator package:

```sh npm2yarn copy
npm install vovk-rust --save-dev
```

Generate a Rust package with the [CLI](https://vovk.dev/generate):

```sh npm2yarn copy
npm exec -- vovk generate --from rs --out ./rust_package
```

This produces:

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

To generate source files for another Rust project instead, use the [rsSrc](https://vovk.dev/templates#rssrc) template:

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

You can [configure](https://vovk.dev/config) the default [generate](https://vovk.dev/generate) command (without flags) to create the client. [vovk dev](https://vovk.dev/dev) creates it too, and creates it again on every schema change. Add the `rs` template to the [composed client](https://vovk.dev/composed) config:

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

The Rust client calls an absolute URL, so it needs [`outputConfig.origin`](https://vovk.dev/config#outputconfig). Set it on the `rs` template, and the TypeScript client keeps its relative URLs. Without an origin, `vovk generate` warns, and every call needs its own `api_root`.

Like other templates, the [rs](https://vovk.dev/templates#rs) template has a default `outDir` for composed clients: `./dist_rust`. Change it in the [template definitions](https://vovk.dev/templates#defs):

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

The samples below are based on the example from the [Hello World](https://vovk.dev/hello-world) page.

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

...emits a [Vovk.ts schema](https://vovk.dev/schema). The Rust client is generated from it. It adds comments from the schema `description` and picks fitting types: `age` becomes a `u8` because of its `min` and `max`.

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

All RPC modules are in `lib.rs`, with the RPC functions and their types. Nested structures become nested modules with their `struct` definitions or types.

An RPC module is a `mod`, and each of its procedures is an `async fn`. Both are named in snake_case: `UserRPC.updateUser` is `user_rpc::update_user`, and its types are in the module `update_user_`. Each module names its functions in schema order. A name that is already taken gets the first free suffix, `_2`, `_3`, so `getUserByID` and `getUserById` give `get_user_by_id` and `get_user_by_id_2`. The module imports `http_request` and `http_request_stream`, so these names count as taken.

Reach nested structures with `_::`: `body.profile` is `update_user_::body_::profile`. This avoids name collisions and follows the schema's structure one to one.

With `use`, you can import the structs under PascalCase names. The functions are `async`; this sample runs them on [tokio](https://tokio.rs/) (`cargo add tokio --features macros,rt-multi-thread`):

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

The client uses [reqwest](https://docs.rs/reqwest/latest/reqwest/) for HTTP, [jsonschema](https://docs.rs/jsonschema/latest/jsonschema/) for client-side validation, and other common crates. Client-side validation reads a schema as JSON Schema 2020-12, or as draft 7 when the schema declares it. It checks formats such as `email` and `uuid`.

The crate builds on Rust 1.86. Its `Cargo.toml` sets `rust-version = "1.85"` and resolver 3, so Cargo locks dependency versions that support Rust 1.85. A project that depends on the crate resolves dependencies with its own resolver. With edition 2024, or with `resolver = "3"` (Cargo 1.84+), it builds on Rust 1.86. An edition 2021 project without that resolver gets the newest versions, which need Rust 1.88.

For a procedure that takes `multipart/form-data`, the body is a [`reqwest::multipart::Form`](https://docs.rs/reqwest/latest/reqwest/multipart/struct.Form.html). Field names go out as written, in quotes, as browsers send them. Give files names without `"`, `\` or line breaks. reqwest escapes these with a backslash, which the server keeps in the name, and a `"` makes the form unreadable.

A function without an output schema returns a `serde_json::Value`: the parsed JSON, or `null` for an empty body. A `text/*` response, or a response of any type with a charset, is a string, decoded as UTF-8 unless the charset names another encoding. Any other response, such as a file, is a string that holds its bytes in base64.

A failed call returns an `HttpException`. Its `status_code()` is the response status, or 0 when the call failed before a response came, for example in client-side validation. `message()` and `cause()` hold the error the server sent. When no response came, or the response broke off, `source()` is the `reqwest::Error`, without the URL.

### JSON Lines Endpoints

For [JSON Lines](https://vovk.dev/jsonlines) endpoints, the async function resolves to a [`futures::Stream`](https://docs.rs/futures/latest/futures/stream/trait.Stream.html) of `Result<T, HttpException>` items. Read it with `StreamExt::next` from the [futures](https://docs.rs/futures) crate.

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

Vovk.ts renders the client libraries from [EJS](https://www.npmjs.com/package/ejs) templates. The template logic works like this:

1. One template definition renders several files: a **template is a folder** with one or more files. A file with the `.ejs` extension is rendered as an EJS template, and other files are copied as they are. `index.ts.ejs` is rendered as `index.ts`; an `index.ts` without the `.ejs` extension is copied as it is.
2. A template can build on another one with the `extends` option: it takes the options of the other template and overrides some of them.
3. A template can include other templates with the `requires` option: it renders them into the output folder.

Template definitions live in the `clientTemplateDefs` option of the [config](https://vovk.dev/config), together with the built-in definitions. To see them all, set [`exposeConfigKeys`](https://vovk.dev/config#exposeConfigKeys) to `true`, or add `clientTemplateDefs` to it if it's an array. Then `.vovk-schema/_meta.json` lists them under `config`.

## Example

Take the built-in template definition of the [Rust client](https://vovk.dev/rust) as an example of the options in the next section. Its main definition is under the [rs](#rs) key: the template name you use in the [segmented client](https://vovk.dev/segmented) or [composed client](https://vovk.dev/composed) config.

The `rs` template has no files of its own, so it has no `templatePath`. It requires:

- [rsSrc](#rssrc), which renders the Rust source files to `./src` (relative to `outDir`),
- [rsPkg](#rspkg), which renders the Cargo files to the root of `outDir`,
- and [rsReadme](#rsreadme), which renders the README to the root of `outDir`.

The `rs` definition also sets `composedClient.outDir` to `dist_rust`, so it doesn't write into the `src/client` folder of the composed [TypeScript](https://vovk.dev/typescript) client.

[rsSrc](#rssrc) points `templatePath` to its template folder (`lib.rs.ejs`, `http_request.rs` and so on). It requires the [schemaJson](#schemajson) template, which renders `schema.json`: the full schema from the `.vovk-schema/` folder.

The same setup in your own `vovk.config.mjs` file:

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

(the paths end with `/` for clarity; it isn't required)

With this setup, generate the full Cargo package:

```sh npm2yarn copy
npm exec -- vovk generate --from rs --out ./dist_rust
```

Or only the source code:

```sh
npx vovk generate --from rsSrc --out ./my_rust_project/src
```

Or only the `README.md` file:

```sh npm2yarn copy
npm exec -- vovk generate --from rsReadme --out ./my_rust_project
```

## Template Definitions

A definition has these options:

### `extends?: string`

The name of the built-in template this definition extends. The definition takes the options of that template and can override them, such as `segmentedClient.outDir`.

### `templatePath?: string`

The path of the template folder: relative to the project root, or a package path such as `vovk-cli/client-templates/ts-base/`. Without it, the template can still include other templates with [requires](#requires).

### `requires?: Record<string, string>`

The template definitions this template includes. The keys are template names; the values are the paths they render to, relative to the output folder.

### `composedClient?: object`

Composed client options for this template, on top of the root `composedClient` options of the [config](https://vovk.dev/config), such as `outDir` or `excludeSegments`.

### `segmentedClient?: object`

Segmented client options for this template, on top of the root `segmentedClient` options of the [config](https://vovk.dev/config), such as `outDir` or `excludeSegments`.

### `outputConfig?: object`

Overrides the root `outputConfig` of the [config](https://vovk.dev/config#outputconfig) for this template, such as `origin` or `openAPIObject`.

## Built-in Templates

### `ts`

The default template of the [composed client](https://vovk.dev/composed) and the [segmented client](https://vovk.dev/segmented). Renders TypeScript code.

- `requires` [tsBase](#tsbase), [openapiTs](#openapits).

### `tsBase`

The default template of the [bundle](https://vovk.dev/bundle), since it has no `openapi` object. Renders TypeScript code.

- `templatePath` is `vovk-cli/client-templates/ts-base/`.
- `requires` [schemaTs](#schemats), [mixins](#mixins) (the last one only when the project has [OpenAPI mixins](https://vovk.dev/mixins)).

### `schemaTs`

Renders `schema.ts`, which imports the segment schemas from the `.vovk-schema/` folder and exports them as a TypeScript object.

- `templatePath` is `vovk-cli/client-templates/schema-ts/`.

### `schemaJson`

Renders `schema.json`: all segment schemas from the `.vovk-schema/` folder for the composed client, or one segment schema for the segmented client.

- `templatePath` is `vovk-cli/client-templates/schema-json/`.

### `openapiTs`

Renders `openapi.ts`, which exports the OpenAPI schema from the `openapi.json` file next to it (rendered by the [openapiJson](#openapijson) template).

- `templatePath` is `vovk-cli/client-templates/openapi-ts/`.
- `requires` [openapiJson](#openapijson), for the OpenAPI schema it imports.

### `openapiJson`

Renders `openapi.json`, the OpenAPI schema. Use it alone to add the OpenAPI schema to your project.

- `templatePath` is `vovk-cli/client-templates/openapi-json/`.

To write only the `openapi.json` file, without a client:

```sh npm2yarn copy
npm exec -- vovk generate --from openapiJson --out ./public
```

### `readme`

Renders `README.md`, the documentation of the generated [TypeScript](https://vovk.dev/typescript) client. It takes its data from `package.json`. The `bundle`, `composedClient` or `segmentedClient` options of the [config](https://vovk.dev/config) can override that data, at the root or in a template definition. Each RPC method gets a code sample that you can copy into your code.

- `templatePath` is `vovk-cli/client-templates/readme/`.

### `packageJson`

Renders `package.json`, so the generated client can be published to NPM. It takes `name`, `version`, `description` and `repository` from the root `package.json`. The `bundle`, `composedClient` or `segmentedClient` options of the [config](https://vovk.dev/config) can override these and other `package` fields, at the root or in a template definition.

- `templatePath` is `vovk-cli/client-templates/package-json/`.

### `mixins`

Renders the types and the [schema](https://vovk.dev/schema) of [OpenAPI mixins](https://vovk.dev/mixins), when the project has them.

- `templatePath` is `vovk-cli/client-templates/mixins/`.

### `rs`

Renders the [Rust](https://vovk.dev/rust) client package: the source code and the Cargo files.

- `requires` [rsSrc](#rssrc) (rendered to `./src/`), [rsPkg](#rspkg) and [rsReadme](#rsreadme).
- Sets `composedClient.outDir` to `dist_rust`.

### `rsSrc`

Renders the source files of the [Rust](https://vovk.dev/rust) client, such as `lib.rs` and `http_request.rs`.

- `templatePath` is `vovk-rust/client-templates/rs-src/`.
- `requires` [schemaJson](#schemajson), for the full schema in the generated code.

### `rsPkg`

Renders `Cargo.toml` for the Rust client.

- `templatePath` is `vovk-rust/client-templates/rs-pkg/`.

### `rsReadme`

Renders `README.md` for the Rust client, like the [readme](#readme) template.

- `templatePath` is `vovk-rust/client-templates/rs-readme/`.

### `py`

Renders the Python client package: the source code and the setup files.

- `requires` [pySrc](#pysrc) (rendered to `./src/[package_name]/`), [pyPkg](#pypkg) and [pyReadme](#pyreadme). `[package_name]` is the package name without `@`, with `/`, `-` and other characters a Python name can't hold turned into `_`: `@acme/web-app` becomes `acme_web_app`. A name that starts with a digit gets a `pkg_` prefix, and a Python or Rust keyword gets a `_pkg` suffix: `3d-viewer` becomes `pkg_3d_viewer`, `class` becomes `class_pkg`. The `Cargo.toml` of the Rust client uses the same name.
- Sets `composedClient.outDir` to `dist_python`.

### `pySrc`

Renders the source files of the [Python](https://vovk.dev/python) client: `__init__.py`, `api_client.py` and `py.typed`.

- `templatePath` is `vovk-python/client-templates/py-src/`.
- `requires` [schemaJson](#schemajson), for the full schema in the generated code.

### `pyPkg`

Renders `pyproject.toml` and `setup.cfg` for the Python client.

- `templatePath` is `vovk-python/client-templates/py-pkg/`.

### `pyReadme`

Renders `README.md` for the Python client, like the [readme](#readme) template.

- `templatePath` is `vovk-python/client-templates/py-readme/`.

## Roadmap

- 📝 Document how to create custom templates.

---

Page: https://vovk.dev/config

# `vovk.config.{js,cjs,mjs}`

The config file sets the CLI options, the [template definitions](https://vovk.dev/templates) and other settings. Often you don't need it: the CLI has defaults and flags. For more advanced use, create one.

## Valid Config File Names

The config is a CJS or ESM module with the **.js**, **.cjs** or **.mjs** extension. It lives in the project root or in the [.config](https://dot-config.github.io/) folder. The CLI checks these paths in this order and uses the first one that exists (it warns if there are more):

- **.config/vovk.config.cjs**
- **vovk.config.cjs**
- **.config/vovk.config.mjs**
- **vovk.config.mjs**
- **.config/vovk.config.js**
- **vovk.config.js**

[vovk init](https://vovk.dev/init) writes **vovk.config.mjs**, in the **.config** folder if that folder exists.

## Config Options

The config has the `VovkConfig` type from the `vovk` package. Its options:

### `exposeConfigKeys: boolean | string[]`

Which config options go to [.vovk-schema/\_meta.json](https://vovk.dev/schema). `true` emits all of them, and an array of strings only the listed ones. `rootEntry` is always emitted: the generated clients build their URLs from it. Default: `["libs", "rootEntry"]`.

### `clientTemplateDefs: object`

Adds custom [template definitions](https://vovk.dev/templates#defs). Use their names in `fromTemplates` of the [composed client](https://vovk.dev/composed) or the [segmented client](https://vovk.dev/segmented).

### `composedClient: object`

Options of the [composed client](https://vovk.dev/composed), such as [outDir](https://vovk.dev/composed#outdir), [fromTemplates](https://vovk.dev/composed#fromtemplates) and [excludeSegments](https://vovk.dev/composed#excludesegments).

### `segmentedClient: object`

Options of the [segmented client](https://vovk.dev/segmented), such as [outDir](https://vovk.dev/composed#outdir), [fromTemplates](https://vovk.dev/composed#fromtemplates) and [excludeSegments](https://vovk.dev/composed#excludesegments).

### `bundle: object`

Options of the [bundle](https://vovk.dev/bundle), such as `excludeSegments` and the `build` function that runs the bundler.

### `modulesDir = 'src/modules'`

The folder of the module files; `modules` when the app isn't in `src/app`. [vovk new](https://vovk.dev/new) creates modules in it, and [vovk dev](https://vovk.dev/dev) watches it for changes.

### `schemaOutDir = '.vovk-schema'`

The folder the schema is written to.

### `rootEntry = 'api'`

The root path of the API. With the default `api`, routes are served under `/api`, and the segment `route.ts` files live in `./src/app/api` (the `src/` folder is optional). An empty string `''` serves the API from the domain root, with the segments in `./src/app`. The root segment then takes `/`, so it can't sit next to a root **page.tsx**: Next.js refuses the two routes.

### `rootSegmentModulesDirName = ''`

Used only by [vovk new](https://vovk.dev/new), for projects with several segments. A non-empty string puts the modules of the root segment in a folder with this name. For example, with `"root"`, `vovk new controller user` creates **src/modules/root/user/user-controller.ts** instead of **src/modules/user/user-controller.ts** (in the root of [modulesDir](#modulesdir)).

### `logLevel = 'info'`

The [log level](https://www.npmjs.com/package/loglevel) of the CLI: `"trace"`, `"debug"`, `"info"`, `"warn"` or `"error"`. `"debug"` shows the internal steps, such as file watching.

### `devHttps = false`

[Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/What_is_a_progressive_web_app) need HTTPS in development and in production. For HTTPS in development, pass `--experimental-https` to `next dev`, and turn on the HTTPS mode of [vovk dev](https://vovk.dev/dev) with `devHttps: true` or the `--https` flag.

```js filename="/vovk.config.mjs"
const config = {
  // ...
  devHttps: true,
};

export default config;
```

To keep HTTPS off by default, add a separate NPM script with the flags:

```json filename="/package.json"
"scripts": {
    "dev-https": "vovk dev --https --next-dev -- --experimental-https",
    "dev": "vovk dev --next-dev"
}
```

### `moduleTemplates: object`

Module template names mapped to their paths. [vovk new](https://vovk.dev/new) uses them to create services, controllers and other module types.

```js filename="/vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  // ...
  moduleTemplates: {
    state: './module-templates/state.ts.ejs',
    // add your own templates here
  },
};
```

Then create a module in [modulesDir](#modulesdir):

```sh npm2yarn copy
npm exec -- vovk new state thing # creates src/modules/thing/thing-state.ts
```

```sh npm2yarn copy
npm exec -- vovk new state segment/thing # creates src/modules/segment/thing/thing-state.ts
```

### `libs: object`

Config for the libraries the client uses, or any other config the client should see. For example, the options of **vovk-ajv**, the main client-side validation library, described on the [customization](https://vovk.dev/imports) page.

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

If [exposeConfigKeys](#exposeConfigKeys) has `"libs"`, it's emitted to `.vovk-schema/_meta.json`, and you can read it in several ways:

```ts showLineNumbers copy
import { schema, UserRPC } from '@/client';

console.log(schema.meta.config.libs.ajv.options.strict);
console.log(UserRPC.updateUser.fullSchema.meta?.config.libs?.ajv.target);
```

### `outputConfig`

Customizes the generated client: its [imports](https://vovk.dev/imports), its `origin` and its [OpenAPI mixins](https://vovk.dev/mixins).

#### `origin: string | null`

The origin of the client URLs. Defaults to `''`, for relative URLs. For absolute URLs, set it to your domain, such as `https://example.com`. An `outputConfig` that overrides this one, such as `composedClient.outputConfig`, can set `origin` to `null` or `''` to go back to relative URLs.

#### `package: PackageJson & { py_name?: string; rs_name?: string }`

The data of the generated `package.json` ([TypeScript client](https://vovk.dev/typescript)), `Cargo.toml` ([Rust client](https://vovk.dev/rust)) and `pyproject.toml` ([Python client](https://vovk.dev/python)). The generated `README.md` uses it too: for the name, version, description and so on, and for the package name in the code samples.

By default, the Python and Rust package names come from `package.name`, as [`[package_name]`](/templates#py) does: `@acme/web-app` becomes `acme_web_app`. `py_name` and `rs_name` override them. They name the package, its folder and the imports in the README samples.

#### `readme: { banner?: string, installCommand?: string, description?: string }`

Customizes the generated `README.md`: a `banner` at the top, an `installCommand`, and a `description` that overrides `package.description`.

#### `samples: { apiRoot?: string, headers?: Record<string, string> }`
Customizes the code samples in the generated `README.md` files and in the [Scalar](https://scalar.com/) OpenAPI documentation: the samples pass the given `apiRoot` and `headers`.

#### `openAPIObject: Partial<import('openapi3-ts/oas31').OpenAPIObject>`

Adds to the generated OpenAPI schema. Fields such as `info` and `servers` are merged into it.

#### `reExports: Record<string, string>`

Re-exports names from other modules, next to the generated RPC modules (in the [bundled](https://vovk.dev/bundle) package too). The keys list the names to re-export, as they go inside the curly braces; the values are module paths. A path that starts with `.` is relative to the project root, like the other config paths, and is rewritten relative to the folder of each generated client. Any other value, such as a package name, stays as it is.

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

With the client in **src/client**, this compiles to:

```ts showLineNumbers copy
export { type MyType } from '../types';
export { MyClass, myFunction } from '../utils';
export { MyComponent as RenamedComponent } from '../components';
export { default as MyDefault } from '../default-export';
```

```ts showLineNumbers copy
import { type MyType, MyClass, myFunction, RenamedComponent, MyDefault } from '@/client';
```

With the [segmented](https://vovk.dev/segmented) client, the top-level `outputConfig.reExports` go to the root segment.

```ts showLineNumbers copy
import { type MyType, MyClass, myFunction, RenamedComponent, MyDefault } from '@/client/root';
```

#### `imports: { fetcher?: string, validateOnClient?: string | null, createRPC?: string }`

The module paths the client imports `fetcher`, `validateOnClient` and `createRPC` from. The defaults are `vovk/fetcher`, no client-side validation, and `vovk/create-rpc`. A segment can set only `fetcher` and `validateOnClient`. See [Imports](https://vovk.dev/imports).

#### `segments`

Options for each segment. It takes the same properties as `outputConfig` (`origin`, `package`, `readme`, `samples`, `openAPIObject`, `reExports`, `imports`) and the ones below.

##### `rootEntry: string`

Overrides the root entry of the segment in the generated clients and the OpenAPI document, for example to change `api` to another path for [multitenancy](https://vovk.dev/multitenant).

##### `segmentNameOverride: string`

Replaces the segment name in the paths that the generated clients call and in the OpenAPI document. An empty string leaves the segment name out, as the [multitenancy](https://vovk.dev/multitenant) setup does.

##### `openAPIMixin: VovkOpenAPIMixin`

Makes the segment an OpenAPI mixin, which adds a third-party API to the generated client. See [OpenAPI mixins](https://vovk.dev/mixins).

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

`vovk dev` runs a watcher that keeps the [schema](https://vovk.dev/schema) and the [client](https://vovk.dev/typescript) up to date. It reads the schema of a segment with an HTTP GET request to `/api/<segment-name>/_schema_`.

## How It Works

1. `vovk dev` and `next dev` run together with [concurrently](https://www.npmjs.com/package/concurrently).
2. `vovk dev` watches the **/src/modules** folder (set by [`modulesDir`](https://vovk.dev/config#modulesdir)) and the segment route files.
3. When a file changes, a regular expression check tells whether it holds a controller of a known [segment](https://vovk.dev/segment).
4. The watcher requests `/api/<segment-name>/_schema_` of that segment for the new schema. When the file holds no known controller, as with a renamed controller, a service or a validation module, it requests the schema of every segment.
5. If the schema changed:
   - If controllers were added, removed or renamed, or methods changed (validation included), the watcher writes the schema to the [.vovk-schema](https://vovk.dev/config#schemaoutdir) folder as `<segment-name>.json`.
   - If the controller list changed, the watcher also generates the client again. The client imports the schema JSON files to set up the library it exports. By default, the [composed client](https://vovk.dev/composed) goes to `./src/client` (or `./client` without a `src/app` folder). With the [segmented client](https://vovk.dev/segmented), the per-segment folders go to the same folder.

![vovk dev](devSvg)

`vovk dev` runs next to the Next.js dev server. There are two ways to run both, each with [concurrently](https://www.npmjs.com/package/concurrently):

1. **Explicit way**: you see the whole command, but you set `PORT` yourself:

```sh
PORT=3000 npx concurrently 'vovk dev' 'next dev' --kill-others
```

Pass Next.js flags as usual:

```sh
PORT=3000 npx concurrently 'vovk dev --https' 'next dev --experimental-https --turbo' --kill-others
```

2. **Implicit way**: the port is chosen for you. By default, the command takes port 3000, or the next free port if 3000 is in use:

```sh
npx vovk dev --next-dev
```

Pass `next dev` flags after `--`:

```sh
npx vovk dev --https --next-dev -- --experimental-https --turbo
```

A port passed this way (`-p 4000` or `--port 4000`) replaces the automatic one, for Next.js and for the schema requests.

The implicit way uses the concurrently API, so both ways work almost the same.

See [HTTPS in development](https://vovk.dev/config#devhttps).

## Run and Exit

`--exit` stops the processes that `vovk dev` started once the schema and the client are generated. Use it for a one-off run, without a watcher.

```sh
npx vovk dev --next-dev --exit
```

The command exits with code 1 when a segment's schema can't be fetched after 5 attempts or can't be used, when the client fails to generate, or when the `next dev` that `--next-dev` started stops first.

Add a script for it to `package.json`:

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

`vovk bundle` turns the [composed](https://vovk.dev/composed) [TypeScript client](https://vovk.dev/typescript) into a package for NPM, with its `package.json` and `README.md` filled in. Set the `bundle.build` function in the [config](https://vovk.dev/config) file first.

The ["Hello World" page](https://vovk.dev/hello-world) has a full bundling example.

Any bundler works, even one you start with the `child_process` module. So far, [tsdown](https://tsdown.dev/) is the only bundler tested with Vovk.ts. If you use another one, share how it went on [GitHub Discussions](https://github.com/finom/vovk/discussions).

Bundling runs these steps:

1. Generates a client into the `tmp_prebundle` folder (set by `bundle.prebundleOutDir: string{:ts}`) from the [tsBase](https://vovk.dev/templates#tsbase) template.
2. Calls the `bundle.build` function, which bundles the generated client into the `dist` folder (set by `bundle.outDir: string{:ts}`).
3. Generates `package.json` and `README.md` from the [packageJson](https://vovk.dev/templates#packagejson) and [readme](https://vovk.dev/templates#readme) templates, for the same segments and [OpenAPI mixins](https://vovk.dev/mixins) as the bundled code.
4. Deletes the `tmp_prebundle` folder (`bundle.keepPrebundleDir: boolean{:ts}` keeps it).

```sh npm2yarn copy
npm exec -- vovk bundle
```

Then publish the package to NPM:

```sh npm2yarn copy
npm publish dist
```

## Configuring the `bundle`

Add a `bundle` object to the [config](https://vovk.dev/config) file:

```ts showLineNumbers copy filename="vovk.config.mjs"
/** @type {import('vovk').VovkConfig} */
const config = {
  bundle: {
    build: async ({ entry, outDir, prebundleDir }) => {
      // call your bundler here
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
        // the package.json content
        // by default, the values of the root package.json
        name: 'my-api-bundle',
        // the entry points
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
      readme: {}, // the README.md content
      samples: {}, // the code samples in README.md
      imports: {
        fetcher: './src/my-fetcher',
      },
      reExports: {}, // re-exports in the generated index.ts
    },
  },
};
export default config;
```

### `build` function (required)

`build` is an async function. It gets an object with `entry` (the `index.ts` file), `outDir` and `prebundleDir`, all absolute paths.

### `prebundleOutDir` or `--prebundle-out` flag

The folder the TypeScript client is generated in before bundling. Defaults to `tmp_prebundle`.

It must be a subfolder of the project, apart from `outDir`. Unless it's kept, it's deleted after bundling, so it must be missing, empty or kept by an earlier bundle: if it holds other files, the command fails before it writes anything.

### `keepPrebundleDir` or `--keep-prebundle-dir` flag

`true` keeps `prebundleOutDir` after bundling, so it can hold other files, such as the composed client. Use it for debugging, for example. Defaults to `false`.

### `requires`

The templates rendered into `outDir` after the build: [template](https://vovk.dev/templates) names mapped to paths relative to `outDir`. Defaults to `{ readme: '.', packageJson: '.' }`. A `requires` object in the config replaces the default, so to keep `readme` and `packageJson`, list them with your own templates.

### `includeSegments` and `excludeSegments` or `--include` and `--exclude` flags

The segments to bundle. Use one of the two. Without either, the bundle uses the `includeSegments` or `excludeSegments` of the [composed client](https://vovk.dev/composed).

### `outputConfig`

Takes the same options as the [outputConfig](https://vovk.dev/config#outputconfig) at the root of the [config](https://vovk.dev/config) file, and overrides them.

Set `origin`, and a `package` field whose entry points (`main`, `types` and `exports`) match the bundler output.

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

To export more from the generated `index.ts`, use the `reExports` option:

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

To keep the bundle small, turn off client-side validation: set `validateOnClient` to `null` in the `imports` option:

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
> The tsdown API can break between minor versions. The config below is tested with **tsdown@0.22.14**. If a newer version breaks it, pin this one until newer versions are confirmed to work.

Install `tsdown` as a dev dependency:

```sh npm2yarn copy
npm install --save-dev tsdown@0.22.14
```

Add this `build` function to the `bundle` object in the [config](https://vovk.dev/config) file:

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

With this config, the bundled package looks like this:

```
dist/
  package.json
  README.md
  index.js
  index.d.ts
```

A full config with `origin`, `package` and no client-side validation:

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

For other tsdown options, see the [tsdown documentation](https://tsdown.dev/reference/api/Interface.UserConfig).

## Using the Bundled Package

Once the package is on NPM, install it in another project like any other package:

```sh npm2yarn copy
npm install my-api-bundle
```

Then import it in your TypeScript code:

```ts showLineNumbers copy
import { UserRPC } from 'my-api-bundle';

await UserRPC.getUser({
  params: { id: '123' },
});
```

The bundled RPC modules have all the features of the [TypeScript](https://vovk.dev/typescript) client.

The [schema](https://vovk.dev/schema) is the `schema` export, and each method has its own `schema` property:

```ts showLineNumbers copy
import { schema, UserRPC } from 'my-api-bundle';

console.log(schema.segments[''].controllers.UserRPC.handlers.getUser.validation.params);
console.log(UserRPC.getUser.schema.validation?.params);
```

The bundle leaves out the `openapi` object of **@/client/openapi**, as it would make the package much larger. It also has no separate `schema` entry point like **@/client/schema**: to keep bundling simple, the bundle has one entry point.

---

Pass the bundled RPC modules to `deriveTools` for [AI tools](https://vovk.dev/tools) that call the matching HTTP endpoints:

```ts showLineNumbers copy
import { UserRPC } from 'my-api-bundle';
import { deriveTools } from 'vovk';

const tools = deriveTools({
  modules: { UserRPC },
});
```

## Roadmap/bugs

- 🐞 Without the **next** package installed, the types of `NextResponse` outputs can't be inferred (see [proposal](https://github.com/vercel/next.js/discussions/88542)). For dynamic response headers, use the `Response` class instead, with a manual type cast.
- ✨ Test and document other bundlers, such as **tsup** and **esbuild**.
- ✨ Segmented bundle: a separate bundle for each segment.

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

`vovk generate` creates [TypeScript](https://vovk.dev/typescript), [Rust](https://vovk.dev/rust) and [Python](https://vovk.dev/python) clients from the [schema](https://vovk.dev/schema) files and from the [OpenAPI mixins](https://vovk.dev/mixins) of the [config](https://vovk.dev/config). It uses these config options:

- `composedClient`: the output folder of the [composed client](https://vovk.dev/composed), the segments it includes or excludes, and its [templates](https://vovk.dev/templates).
- `segmentedClient`: the output folder of the [segmented client](https://vovk.dev/segmented), the segments it includes or excludes, and its [templates](https://vovk.dev/templates).
- `outputConfig`: `origin`, [imports](https://vovk.dev/imports), [OpenAPI mixins](https://vovk.dev/mixins) and more.
- `clientTemplateDefs`: the definitions of the [templates](https://vovk.dev/templates).

See the [config](https://vovk.dev/config) page.

In a Next.js project, a segment whose schema file remains after its route file is gone is left out of the client, with a warning. Delete the schema file when you remove a segment. A schema folder given with `--schema-path`, such as that of another project, is used as it is, unless it's the `schemaOutDir` folder.

## Available Flags

### Composed Client Flags

- `--composed-only` — generates only the composed client, even if the segmented client is enabled.
- `--out`, `--composed-out ` — overrides `composedClient.outDir`.
- `--from`, `--composed-from <templates...>` — overrides `composedClient.fromTemplates`.
- `--include`, `--composed-include-segments <segments...>` — overrides `composedClient.includeSegments`.
- `--exclude`, `--composed-exclude-segments <segments...>` — overrides `composedClient.excludeSegments`.

### Segmented Client Flags

- `--segmented-only` — generates only the segmented client, even if the composed client is enabled.
- `--segmented-out ` — overrides `segmentedClient.outDir`.
- `--segmented-from <templates...>` — overrides `segmentedClient.fromTemplates`.
- `--segmented-include-segments <segments...>` — overrides `segmentedClient.includeSegments`.
- `--segmented-exclude-segments <segments...>` — overrides `segmentedClient.excludeSegments`.

### OpenAPI mixin Flags

Mixins add the APIs of one or more OpenAPI specs to the client. See [OpenAPI mixins](https://vovk.dev/mixins).

- `--openapi`, `--openapi-spec <openapi_path_or_urls...>` — one or more OpenAPI specs, as local paths or URLs. A URL is fetched with HTTP GET. Mirrors `outputConfig.segments.mixinName.openAPIMixin.source.url` (remote) or `.source.file` (local).
- `--openapi-module-name`, `--openapi-get-module-name <names...>` — module names, matched by index to `--openapi`. Mirrors `outputConfig.segments.mixinName.openAPIMixin.getModuleName`. Without it, a module is named after its mixin (`--openapi-mixin-name petstore` gives `petstore`), and mixins without a name give `api`, `api2`, …
- `--openapi-method-name`, `--openapi-get-method-name <names...>` — method names, matched by index to `--openapi`. Mirrors `outputConfig.segments.mixinName.openAPIMixin.getMethodName`.
- `--openapi-root-url <urls...>` — root URLs, matched by index to `--openapi`. Mirrors `outputConfig.segments.mixinName.openAPIMixin.apiRoot`.
- `--openapi-mixin-name <names...>` — mixin names, matched by index to `--openapi`; `mixin`, `mixin2`, … by default. In the config, the name is the key in `outputConfig.segments` and the pseudo-segment name of the mixin.
- `--openapi-fallback <paths...>` — saves the OpenAPI specs to these paths and uses them when the URL is unavailable. The paths match `--openapi` by index.
- `--watch [s]` — generates the client on start, then again on each change of the schema or the OpenAPI spec. Takes a throttle interval in seconds. A remote spec is requested every `s` seconds; a changed local file counts once it has kept the same size for 300 ms.

### Other Flags

- `--prettify` — formats the output files with [Prettier](https://prettier.io/). Mirrors `composedClient.prettifyClient` and `segmentedClient.prettifyClient`.
- `--force` — replaces files at the output paths that vovk-cli did not generate. Without it, the command writes nothing and names those files. A file counts as generated when its first line is the `Generated by vovk-cli` banner; a JSON file, which can't hold one, when it sits next to a file with the banner. Files that a template copies as they are, or renders without the banner, are replaced either way.
- `--schema`, `--schema-path ` — overrides the schema folder, `schemaOutDir`.
- `--config`, `--config-path ` — overrides the config file path. By default, the CLI checks every supported file name and warns if it finds more than one.
- `--origin ` — overrides `outputConfig.origin`.
- `--log-level ` — the log level: `trace`, `debug`, `info`, `warn`, `error`, `silent` (default: `info`).
- `-h, --help` — shows help.

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
  --update-ts-config              add "experimentalDecorators" to tsconfig.json
  --no-update-ts-config           leave tsconfig.json as it is
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

`init` sets up Vovk.ts in an existing Next.js project: it writes the configuration and installs the dependencies.

```sh npm2yarn copy
npx vovk-cli init
```

In a project that already has a [config](https://vovk.dev/config), `init` asks before it sets the project up again (with `--yes`, it doesn't ask). An existing config that differs from the new one is kept as a backup next to it, such as **vovk.config.mjs.bak**, so you can move your settings over.

## Available Flags

### `--prefix `

The project folder. Defaults to the current folder.

### `-y, --yes`

Skips prompts and uses default values.

### `--log-level `

Sets the log level: `trace`, `debug`, `info`, `warn`, `error`, `silent`. Default: `info`.

### `--use-npm`, `--use-yarn`, `--use-pnpm`, `--use-bun`

Sets the package manager that installs the dependencies, so `init` doesn't detect it. Without these flags, `init` takes the `packageManager` field of **package.json**, then the project's lockfile (**pnpm-lock.yaml**, **yarn.lock**, **bun.lock**, **package-lock.json**), then the package manager that runs it (`pnpm dlx`, `yarn dlx`, `bunx`), and npm otherwise.

### `--skip-install`

Doesn't install the dependencies, but still updates `package.json`.

### `--update-ts-config`

Adds `experimentalDecorators` to `tsconfig.json` without asking. Webpack builds need it; see [Enable decorators](https://vovk.dev/manual-install#enable-decorators). With `--yes`, this is the default.

### `--no-update-ts-config`

Leaves `tsconfig.json` as it is, also with `--yes`.

### `--update-scripts `

Updates the `package.json` scripts to run Next.js and Vovk.ts together. Modes:

- `implicit` — uses the concurrently API inside `vovk dev`. It fits a `dev` script that is `next dev` with flags. A `dev` script that runs more, such as `prisma generate && next dev`, gets the `explicit` form.
- `explicit` — uses the `concurrently` CLI: `cross-env PORT=3000 concurrently "next dev" "vovk dev" --kill-others`. [cross-env](https://www.npmjs.com/package/cross-env) and double quotes let the script run on Windows too. `PORT` is the port from `next dev -p` when the old script has one.

The flag also sets `prebuild` to `vovk generate`, so the client is generated before `next build`. Yarn 2+ doesn't run `pre` scripts, so there it puts `vovk generate` at the start of `build`: `vovk generate && next build`. With `--bundle`, it adds a `bundle` script that runs `vovk bundle`. An existing `prebuild` or `bundle` script stays, and the command runs after it, for example `prisma generate && vovk generate`.

### `--bundle`

Sets up [tsdown](https://tsdown.dev/) to [bundle](https://vovk.dev/bundle) the TypeScript client: adds it to `devDependencies` and a `bundle.build` function to the config.

### `--lang <languages...>`

Generates clients for more languages: adds "py" (Python) or "rs" (Rust) to [`composedClient.fromTemplates`](https://vovk.dev/composed#fromtemplates).

### `--validation-library `

Sets the validation library: "zod", "valibot", "arktype", or "none" to set up validation later.

### `--channel `

Sets the channel: the npm tag the Vovk.ts packages are installed from. The channels:

- `latest` (default) for stable releases.
- `beta` for beta releases (tested, but they can break things without notice).

Run the CLI from the same channel:

```sh npm2yarn copy
npx vovk-cli@beta init --channel beta
```

A Vovk.ts package with no release on the channel, such as **vovk-ajv** without a beta, is added at its `latest` version.

### `--dry-run`

Shows what it would do, without writing files.

### `-h, --help`

Shows help.

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

`vovk new` creates [segments](https://vovk.dev/segment) and modules, such as controllers, services or custom modules. It uses the `moduleTemplates` option of the [config](https://vovk.dev/config), where you can add your own templates. It has two forms: `vovk new segment [segment_name]` and `vovk new [module] [module_name_singular]`. It formats the files it writes with [Prettier](https://www.npmjs.com/package/prettier) if the project has Prettier installed.

## vovk new segment

![vovk new segment](newSegmentSvg)

### Root Segment

```sh npm2yarn copy
npm exec -- vovk new segment
```

Without an argument, `vovk new segment` creates the root segment at **/src/app/api/[[...vovk]]/route.ts**. The `segmentName` option of `initSegment` is an empty string for the root segment, so the file leaves it out:

```ts showLineNumbers copy
import { initSegment } from 'vovk';

const controllers = {};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
});
```

With `vovk dev` running, the segment emits its schema to **.vovk-schema/root.json**.

Its API is at **/api/...**.

The root segment can sit next to nested segments of any depth.

### Nested Segment

```sh npm2yarn copy
npm exec -- vovk new segment foo
```

`vovk new segment foo` creates **/src/app/api/foo/[[...vovk]]/route.ts** with:

```ts showLineNumbers copy
// ...
export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'foo',
  emitSchema: true,
  controllers,
});
```

With `vovk dev` running, the segment emits its schema to **.vovk-schema/foo.json**.

Its API is at **/api/foo/...**.

---

`vovk new segment foo/bar/baz` creates a nested segment at **/src/app/api/foo/bar/baz/[[...vovk]]/route.ts**, served at **/api/foo/bar/baz/...**. Its `segmentName` is `"foo/bar/baz"`.

## vovk new [module] [name]

![vovk new module](newModuleSvg)

```sh npm2yarn copy
npm exec -- vovk new controller service foo/user
```

`vovk new` with anything other than `segment` creates modules in **/src/modules**.

The parts of the command:

- `npx vovk new` — the command.
- Components — the module types to create: `controller`, `service` or a custom module.
- The module name, singular, with an optional segment prefix: `foo/user` creates a module in **/src/modules/foo/user/** and updates the `foo` segment. Without a segment, the module goes to the root segment:

```sh npm2yarn copy
npm exec -- vovk new controller service user
```

For a new controller, `vovk new` adds it to the `controllers` object in the `route.ts` of the segment, editing the file through its [AST](https://www.npmjs.com/package/ts-morph).

If one of the module's files already exists, `vovk new` writes none of them, unless you pass `--overwrite`. The module name has to start with a letter, since the templates turn it into class and method names.

The `moduleTemplates` option of the [config](https://vovk.dev/config) sets the template paths:

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

`npx vovk new controller state user` creates **user-controller.ts** and **user-state.ts** in **/src/modules/user** and adds the controller to the root segment.

### Built-in Module Templates

The built-in controller and service templates have the CRUD methods: list, get one, create, update and delete.

[vovk init](https://vovk.dev/init) puts the matching templates in the [config](https://vovk.dev/config):

- Zod controller template: [vovk-cli/module-templates/zod/controller.ts.ejs](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/zod/controller.ts.ejs)
- Arktype controller template: [vovk-cli/module-templates/arktype/controller.ts.ejs](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/arktype/controller.ts.ejs)
- Valibot controller template: [vovk-cli/module-templates/valibot/controller.ts.ejs](https://github.com/finom/vovk/tree/main/packages/vovk-cli/module-templates/valibot/controller.ts.ejs)
- Without a validation library, it uses the validation-agnostic template [vovk-cli/module-templates/type/controller.ts.ejs](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/type/controller.ts.ejs).
- The service template is the same for every validation library: [vovk-cli/module-templates/type/service.ts.ejs](https://github.com/finom/vovk/blob/main/packages/vovk-cli/module-templates/type/service.ts.ejs).

The controller and the service these templates write infer types from each other, which needs TypeScript 5.5+.

### Shortcuts

`c` and `s` are short for `controller` and `service`:

```sh
npx vovk n c s user
```

This is the same as:

```sh
npx vovk new controller service user
```

### Custom Module Templates

A module template is a `.ts.ejs` file. It uses [EJS](https://ejs.co/) to generate the code and YAML front matter for its metadata.

#### Module Template Metadata

The metadata fields:

- `outDir: string` — the output folder, relative to the project root. The EJS variable `t.defaultOutDir` holds **/src/modules/[segmentName/]moduleName/**.
- `fileName: string` — the output file name.
- `sourceName: string` — the controller name (controllers only), added to the `controllers` object of the segment file.
- `compiledName: string` — the RPC module name (controllers only): the name of the module in the generated client.

#### Module Template Variables

The EJS template gets these variables in the `t` object:

- `t.defaultOutDir: string` — the default output folder of the module.
- `t.relativePathToSourceRoot: string` — the path from `t.defaultOutDir` to the source root (`src` when the app is in `src/app`, otherwise the project root), such as `../..`.
- `t.config: VovkConfig` — the Vovk.ts config.
- `t.segmentName: string` — the segment name (an empty string for the root segment).
- `t.withService: boolean` — whether a service is created together with the controller.
- `t.nodeNextResolutionExt: { ts: string; js: string; mjs: string; cjs: string }` — the import file extensions for the `moduleResolution` of `tsconfig.json`, or for `module` when `moduleResolution` isn't set. For `'node16'`, `'node18'`, `'node20'` and `'nodenext'`, the keys hold `.ts`/`.js`/`.mjs`/`.cjs`; in other cases, empty strings. `ts` is `.ts` only with `allowImportingTsExtensions` or `rewriteRelativeImportExtensions`; otherwise it's `.js`, the name TypeScript resolves to the `.ts` file.
- `t.moduleName: string` — the module name as given, without the segment, such as `userCart`.
- `t.TheThing`, `t.TheThings` — the module name and its plural in PascalCase, such as `UserCart` and `UserCarts`.
- `t.theThing`, `t.theThings` — the module name and its plural in camelCase, such as `userCart` and `userCarts`.
- `t['the-thing']`, `t['the-things']` — the module name and its plural in kebab-case, such as `user-cart` and `user-carts`.
- `t.the_thing`, `t.the_things` — the module name and its plural in snake_case, such as `user_cart` and `user_carts`.
- `t.THE_THING`, `t.THE_THINGS` — the module name and its plural in SCREAMING_SNAKE_CASE, such as `USER_CART` and `USER_CARTS`.
- `t._` — the Lodash library.
- `t.pluralize` — the `pluralize` function of the `pluralize` package.

#### Controller & Service Template Example

A module template for an ArkType controller and service. For readability, the template keeps its own variables in a `vars` object.

```ejs filename="packages/vovk-cli/module-templates/arktype/controller.ts.ejs" source="."
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
        const body = await req.vovk.body();
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
        const body = await req.vovk.body();
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

```ejs filename="packages/vovk-cli/module-templates/type/service.ts.ejs" source="."
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

It creates **user-cart-controller.ts** and **user-cart-service.ts** in **/src/modules/user-cart/** and adds the controller to the root segment.

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
    const body = await req.vovk.body();
    return UserCartService.updateUserCart(id, body);
  });
  @operation({
    summary: 'Create userCart',
  })
  @post()
  static createUserCart = procedure({
    body: type({ todo: type('true') }),
  }).handle(async (req) => {
    const body = await req.vovk.body();
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

> **About this example:** Despite the name, this example covers many features: validation, streaming, clients in several languages, and OpenAPI output. For the minimal setup, see the [Quick Start](https://vovk.dev/quick-install) guide first.

For a larger reference app that AI agents operate (Realtime UI, MCP, voice and chat), see the [Realtime UI overview](https://vovk.dev/realtime-ui/overview).

The "Hello World" app at [hello-world.vovk.dev](https://hello-world.vovk.dev/) is a Next.js app built with Vovk.ts. It shows the core features with:

- Back-end:
  - `UserController` with an `updateUser` procedure (POST `/api/users/{id}`).
  - `StreamController` with a JSON Lines procedure, `streamTokens` (GET `/api/streams/tokens`).
  - `OpenApiController` with `getSpec` (GET `/api/static/openapi.json`), which serves the generated OpenAPI spec. The [`/openapi` page](https://hello-world.vovk.dev/openapi) shows it as documentation.
- Front-end:
  - A form, with a JSON Lines streaming demo above it.
- Configuration:
  - Client-side validation, the segmented and composed TypeScript clients, Rust and Python clients, an npm bundle, and OpenAPI metadata (`info` and `servers`).

The source is in the [GitHub repository](https://github.com/finom/vovk/tree/main/examples/hello-world). The generated files are committed under [dist](https://github.com/finom/vovk/tree/main/examples/hello-world/dist), [tmp_prebundle](https://github.com/finom/vovk/tree/main/examples/hello-world/tmp_prebundle), [dist_rust](https://github.com/finom/vovk/tree/main/examples/hello-world/dist_rust) and [dist_python](https://github.com/finom/vovk/tree/main/examples/hello-world/dist_python), so you can read them. In a real project, list them in `.gitignore`.

The code on this page comes from the repository on GitHub. The live pages are embedded as iframes.

## Running the Example Locally

Copy the example. This also installs its dependencies:

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

- Zod validation with the [procedure function](https://vovk.dev/procedure): `body`, `query` and `params` for input, `output` and `iteration` for output, with `description` and `examples` from Zod [meta](https://zod.dev/metadata#meta).
- Client-side validation of RPC input, described in the [customization](https://vovk.dev/imports) article.
- [Composed](https://vovk.dev/composed) and [segmented](https://vovk.dev/segmented) [TypeScript](https://vovk.dev/typescript) clients.
- [JSON Lines](https://vovk.dev/jsonlines) streaming.
- [Type inference](https://vovk.dev/inference) between the service and the controller.
- `useQuery` and `useMutation` with [`queryKey`](https://vovk.dev/typescript#react-query).
- A TypeScript client [bundle](https://vovk.dev/bundle), published on [npm](https://npmjs.com/package/vovk-hello-world) (see [bundlephobia](https://bundlephobia.com/package/vovk-hello-world)).
- Experimental [Rust](https://vovk.dev/rust) and [Python](https://vovk.dev/python) clients, published on [crates.io](https://crates.io/crates/vovk_hello_world) and [PyPI](https://pypi.org/project/vovk-hello-world/).
- An [OpenAPI spec](https://vovk.dev/openapi), served from a [static segment](https://vovk.dev/static-segment) and rendered with [Scalar](https://scalar.com/).

## Live Demo

The demo has a form without native validation attributes, and a “Disable client-side input validation” checkbox that toggles the [disableClientValidation](https://vovk.dev/typescript#disableclientvalidation) option. “Notification type” has an invalid value on purpose, so you can see both the client and the server validation fail.

Link: https://hello-world.vovk.dev

## `UserController` and `UserService`

`UserController` and `UserService` implement `/api/users/{id}` with `updateUser`.

The procedure maps POST with `@post`, and `procedure()` validates `body`, `params`, `query` and `output` with Zod. Each schema calls `meta` to add `description` and `examples` to the OpenAPI output. To show nesting, `body` holds `email` and a `profile` object (`name`, `age`).

The service method takes its parameter types from the procedure. The handler returns the service result directly, which avoids implicit `any` errors from self-reference.

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

`/api/streams/tokens` streams tokens. Its procedure is a generator that delegates to the service with `yield*`. The `iteration` schema validates each streamed item. `setTimeout` adds a delay between tokens.

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

```tsx showLineNumbers copy filename="src/components/demo/index.tsx" source="examples/hello-world"
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

- Validate on the client with Ajv, the main client-side validation library, described in the [customization](https://vovk.dev/imports) article. The bundle has no validation, to stay small.
- Generate [Rust](https://vovk.dev/rust) and [Python](https://vovk.dev/python) code when you run [vovk dev](https://vovk.dev/dev) or [vovk generate](https://vovk.dev/generate).
- Show the [segmented client](https://vovk.dev/segmented), which has RPC modules per [segment](https://vovk.dev/segment).
- Generate the clients and the [bundle](https://vovk.dev/bundle) with a `package` field and an explicit `origin`:
  - Python and Rust clients: `https://hello-world.vovk.dev`.
  - TypeScript bundle: `https://hello-world.vovk.dev`.
  - Composed TypeScript client:
    - In development: `http://localhost:PORT`, so Node.js code can call the local server through the generated **@/client**.
    - In production: an empty origin, so requests go to the current origin.
  - Segmented client: an empty origin, so requests go to the current origin.

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

The package files listed below take their metadata (`repository`, `homepage`, `bugs` and more) from this `package.json`.
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
    "@scalar/api-reference-react": "^0.9.74",
    "@standard-schema/spec": "^1.1.0",
    "@tanstack/react-query": "^5.104.0",
    "ajv": "^8.20.0",
    "ajv-errors": "^3.0.0",
    "next": "^16.3.6",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "vovk": "^4.0.0-beta.0",
    "vovk-ajv": "^0.1.0",
    "zod": "^4.6.5"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.5.14",
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^26",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8",
    "prettier": "^3.9.9",
    "tailwindcss": "^4.3.3",
    "tsdown": "^0.22.14",
    "tsx": "^4.23.15",
    "typescript": "^7",
    "vovk-cli": "^0.3.0-beta.0",
    "vovk-hello-world-published": "npm:vovk-hello-world@^0.0.88",
    "vovk-python": "^0.0.3",
    "vovk-rust": "^0.0.4"
  }
}
```
*[The code above is fetched from GitHub repository.](https://github.com/finom/vovk/blob/main/examples/hello-world/package.json)*

## OpenAPI Specification

A `GET` endpoint serves the [OpenAPI specification](https://hello-world.vovk.dev/api/static/openapi.json). It returns the generated spec, `openapi` from `@/client/openapi`.

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

The spec includes code samples that Scalar shows, ready to copy.

Link: https://hello-world.vovk.dev/openapi

## Building and Packaging

The example also builds the packages it publishes on [npm](https://www.npmjs.com/package/vovk-hello-world), [PyPI](https://pypi.org/project/vovk-hello-world/) and [crates.io](https://crates.io/crates/vovk_hello_world). The [templates](https://vovk.dev/templates) write each package with the files its language needs, such as [package.json](https://github.com/finom/vovk/blob/main/examples/hello-world/dist/package.json), [Cargo.toml](https://github.com/finom/vovk/blob/main/examples/hello-world/dist_rust/Cargo.toml) and [pyproject.toml](https://github.com/finom/vovk/blob/main/examples/hello-world/dist_python/pyproject.toml), and a README whose code samples document the API and the client.

`vovk generate` writes the Python and Rust packages to **dist_python** and **dist_rust**, because `composedClient.fromTemplates` lists `py` and `rs`. `vovk bundle` builds the npm package into **dist**. Each package has its own publish script:

```json
"scripts": {
  // ...
  "publish:node": "npm publish ./dist",
  "publish:rust": "cargo publish --manifest-path dist_rust/Cargo.toml --allow-dirty",
  "publish:python": "python3 -m build ./dist_python --wheel --sdist && python3 -m twine upload ./dist_python/dist/*"
}
```

`vovk generate` and `vovk bundle` rewrite the READMEs on each run: [TypeScript](https://github.com/finom/vovk/blob/main/examples/hello-world/dist/README.md), [Rust](https://github.com/finom/vovk/blob/main/examples/hello-world/dist_rust/README.md) and [Python](https://github.com/finom/vovk/blob/main/examples/hello-world/dist_python/README.md).

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
  version = "1.49"
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

Tests in [test/node](https://github.com/finom/vovk/tree/main/examples/hello-world/test/node), [test/rust](https://github.com/finom/vovk/tree/main/examples/hello-world/test/rust) and [test/python](https://github.com/finom/vovk/tree/main/examples/hello-world/test/python) cover both the local and the published clients.

```sh npm2yarn copy
npm run test
```

The command builds the Next.js app, starts the server and runs the tests.

---

Page: https://vovk.dev/multitenant

# Multitenancy

This tutorial hosts several tenants, or sites, in one Next.js app, each on its own subdomain. The back end and the front end run as separate serverless functions in one project, so you maintain and deploy one project.

![Multitenancy](https://vovk.dev/draw/multitenancy.svg)

It uses Next.js and a small helper from Vovk.ts to serve different areas of the app under different subdomains:

- [example.com](https://multitenant.vovk.dev/) for the root tenant,
- [admin.example.com](https://admin.multitenant.vovk.dev/) for the admin tenant,
- [customer.example.com](https://customer.multitenant.vovk.dev/) for a customer tenant,
- [\*.customer.example.com](https://acme.customer.multitenant.vovk.dev/) for a specific customer tenant (for example, `acme.customer.example.com`),
- [pro.\*.customer.example.com](https://pro.acme.customer.multitenant.vovk.dev/) for a professional version of a customer tenant (for example, `pro.acme.customer.example.com`).

The live example runs at [multitenant.vovk.dev](https://multitenant.vovk.dev/), and its source code is in [vovk-multitenant-example](https://github.com/finom/vovk/tree/main/examples/multitenant).

Each tenant has its own API root at the `/api` path of its domain. For example, the customer tenant's API is at `customer.example.com/api`, and the admin tenant's API at `admin.example.com/api`. These API roots are [segments](https://vovk.dev/segment), and the [Next.js proxy](https://nextjs.org/docs/app/getting-started/proxy) rewrites a request to the right path by its tenant subdomain, with the Vovk.ts `multitenant` function.

This example deploys to Vercel, but you can adapt it to any platform that runs Node.js.

## Configure DNS

The DNS records:

| Type         | Host           | Value                 |
| ------------ | -------------- | --------------------- |
| CNAME Record | \*.multitenant | cname.vercel-dns.com. |

The project domains on Vercel:

![Domain configuration](https://vovk.dev/screenshots/vercel-multitenant-domains.png)

See the [Vercel documentation](https://vercel.com/docs/domains/working-with-domains/add-a-domain) on domains, or your provider's documentation on wildcard subdomains.

The project uses these domains:

- `multitenant.vovk.dev` for the root tenant,
- `admin.multitenant.vovk.dev` for the admin tenant,
- `customer.multitenant.vovk.dev` for the customer tenant,
- `*.customer.multitenant.vovk.dev` for a specific customer tenant (for example, `acme.customer.multitenant.vovk.dev`), which shares the customer tenant API,
- `pro.acme.customer.multitenant.vovk.dev` to show several levels of subdomains. Vercel's wildcard support is limited, so `acme` stands in for any customer.

## Organize Frontend Routes

Use Next.js [dynamic routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) for the tenant paths:

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

After [setting up a Vovk.ts](https://vovk.dev/quick-install) app, create the segments and controllers with the Vovk.ts CLI, which writes the files for you.

First, create an API segment for each tenant. Each segment handles the requests to its API root.

```sh npm2yarn copy
npm exec -- vovk new segment # create the root segment at src/app/api/[[...vovk]]/route.ts
npm exec -- vovk new segment admin # create "admin" segment at src/app/api/admin/[[...vovk]]/route.ts
npm exec -- vovk new segment customer # create "customer" segment at src/app/api/customer/[[...vovk]]/route.ts
npm exec -- vovk new segment customer/pro # create "customer/pro" segment at src/app/api/customer/pro/[[...vovk]]/route.ts
```

More about [segments](https://vovk.dev/segment).

Next, create the controllers of each segment. For example, `ProductService` and `ProductController` for the root segment, in `src/modules/product/`:

```sh npm2yarn copy
npm exec -- vovk new controller service product
```

`UserService` and `UserController` for the admin segment, in `src/modules/admin/user/`:

```sh npm2yarn copy
npm exec -- vovk new controller service admin/user
```

## Enable Segmented Client

By default, Vovk.ts emits a “composed client” to `src/client`, imported as `@/client`. Its modules import all [schemas](https://vovk.dev/schema) from `.vovk-schema`, so every front-end module that imports the client sees the schema of the whole app.

A [segmented client](https://vovk.dev/segmented) generates a separate client for each segment, which imports only that segment's schema. Each segment gets its own folder.

A higher-level segment (such as “admin”) can also import a lower-level one (such as “customer”). Segments share RPC modules this way, and pages that don't use those RPC modules don't see their back-end details.

![Segmented client](https://vovk.dev/draw/segmented-client.svg)

Turn off the composed client and turn on the segmented client in the [config file](https://vovk.dev/config):

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

By default, the segmented client goes to `./src/client`. The `outDir` option changes the folder.

Then import the client in the front-end code:

```ts showLineNumbers copy
import { ProductRPC } from '@/client/root';

await ProductRPC.getProducts();
```

The generated client's files, shortened (see [segmented client docs](https://vovk.dev/segmented)):

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

Set `segmentNameOverride` for every segment other than the root in the [config file](https://vovk.dev/config). It replaces the segment name in the URL path: for example, `"customer/pro"` becomes `""`.

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

`multitenant` from the `"vovk"` package is the router of the multitenant app. It takes the request details and returns what the proxy should do: redirect to a subdomain or rewrite to a path.

Parameters:

- `requestUrl`: the full request URL, such as `request.url`.
- `requestHost`: the request host, such as `request.headers.get("host")`.
- `targetHost`: the main host for redirects and rewrites (your production domain, or `localhost:3000` in development).
- `overrides`: maps tenant subdomain names to routing rules. Each rule is an array of objects with `from` (a path prefix) and `to` (the target path).

For wildcard subdomains, use square-bracket patterns, such as `[customer_name]`, for the [Dynamic Segment](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes). The page gets the value in `params`. A placeholder matches one DNS label (letters, digits and hyphens), and the host is matched case-insensitively, so a host such as `%2e%2e.customer.example.com` gets no rewrite.

A rule rewrites a path prefix, so a host also reaches what is nested under its target: `acme.customer.example.com/api/pro` reaches the `customer/pro` segment, and `acme.customer.example.com/pro` the pro page.

The proxy goes in **src/proxy.ts**. On Next.js 15, name the file **src/middleware.ts**.

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

## Open the Tenants Locally

Browsers resolve `localhost` and every name under it to the loopback address, so `admin.localhost:3000` and `acme.customer.localhost:3000` reach the dev server with no change to `/etc/hosts`. A hosts file takes no wildcards: a `*.localhost` line in it does nothing.

## Roadmap

- 📝 Cover multiple domains.

---

Page: https://vovk.dev/testing

# Testing

A procedure's [`.fn` method](https://vovk.dev/fn) calls the handler without the HTTP round trip. SSR, server actions and tests use the same method, so unit tests need no server.

## Setup

Any test runner works: Vitest, Jest, the Node.js test runner and others. The examples use Vitest.

The `vovk` package is ES modules only. Jest set up with `next/jest` can't load it as is, so add `transpilePackages: ['vovk']` to the Next.js config.

Vitest doesn't read the `paths` of **tsconfig.json**, so it can't resolve `@/client` on its own. With Vite 8, which a new Vitest install uses, turn on `resolve.tsconfigPaths`. With an older Vite, use the `vite-tsconfig-paths` plugin or `resolve.alias`.

```ts showLineNumbers copy filename="vitest.config.ts"
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
});
```

With Vite 8, Vitest also drops the decorators on static fields, such as procedures, when `useDefineForClassFields` is off: `.fn()` then runs without them, auth guards included. It is off by default for a `target` below ES2022, such as the ES2017 that `create-next-app` writes. Set `"useDefineForClassFields": true` in **tsconfig.json**, or `"target": "ES2022"`.

Node.js strips TypeScript types but doesn't compile decorators, so the Node.js test runner needs a loader that does, such as [tsx](https://tsx.is): `node --import tsx --test`. tsx also reads the `paths` of **tsconfig.json**, so `@/client` resolves. Without a loader, Node.js runs only the generated client (it strips types by default since 22.18): set `"module": "nodenext"` and `"allowImportingTsExtensions": true` (it needs `"noEmit": true`) in **tsconfig.json**, and import the client by a relative path. To use the client from another project, [bundle](https://vovk.dev/bundle) it.

## Testing with `.fn`

Given this controller:

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

`.fn` runs the whole procedure, with validation and [decorators](https://vovk.dev/decorator-overview), but without HTTP. That fits tests with mocked or stubbed data: there is no server to start, no network latency and no cold start, so the tests run fast. A test runs outside a Next.js request, so `headers()` and `cookies()` from `next/headers` throw there: mock `next/headers` for a decorator that reads them.

The trade-off: `.fn()` skips `proxy.js` (`middleware.js` in earlier Next.js versions). Logic that lives there, such as authentication checks, rate limiting or added headers, doesn't run in `.fn()` calls. To test that layer, use [integration tests with RPC modules](#integration-testing-with-rpc-modules) against a running dev server instead.

## Testing Validation

Procedures validate their input, so you can test that invalid data is rejected:

```ts showLineNumbers copy filename="src/modules/user/user-controller.test.ts"
import { describe, it, expect } from 'vitest';
import { HttpException } from 'vovk';
import UserController from './user-controller';

describe('UserController validation', () => {
  it('rejects invalid body', async () => {
    await expect(
      UserController.createUser.fn({
        // @ts-expect-error name must be a string
        body: { name: 123 },
      })
    ).rejects.toThrow(HttpException);
  });
});
```

## Integration Testing with RPC Modules

For end-to-end tests through HTTP, call the generated [RPC modules](https://vovk.dev/typescript) against a running dev server. The client calls `/api` by default, and `fetch` in Node.js takes no relative URL, so give it the server's address with `apiRoot`, or set [`outputConfig.origin`](https://vovk.dev/config#outputconfig).

```ts showLineNumbers copy filename="src/modules/user/user-controller.e2e.test.ts"
import { describe, it, expect } from 'vitest';
import { UserRPC } from '@/client';

const LocalUserRPC = UserRPC.withDefaults({ apiRoot: 'http://localhost:3000/api' });

describe('UserController E2E', () => {
  it('gets a user via HTTP', async () => {
    const user = await LocalUserRPC.getUser({ params: { id: '42' } });

    expect(user).toEqual({ id: '42', name: 'John' });
  });
});
```

---

Page: https://vovk.dev/performance

# Next.js API Route Performance Overhead

## Summary

- Goal: measure Vovk.ts overhead over native Next.js route handlers (not the HTTP stack).
- Routing: ~1.5 µs median per request from 1 to 1,000 controllers, ~1.75–1.83 µs at 10,000 (20,000 endpoints). Throughput ~545k–675k ops/s per core. The test repeats one path, which the route cache serves; see the notes below the results.
- Cold start: grows linearly. ~8 ms at 1,000 controllers, ~114 ms at 10,000. About 11–12× the cost of no-op decorators.
- Notes: Tinybench on Node.js 24.1 and an Apple M4 Pro, measured on 2026-10-06. Next.js runtime cost is not measured. Written from real benchmark output with AI help and small edits. The scripts are in the [`perf`](https://github.com/finom/vovk/tree/main/perf) folder of the Vovk.ts repository.

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

The suite also runs in CI: [GitHub Actions](https://github.com/finom/vovk/actions/workflows/perf.yml). CI uses
GitHub-hosted runners, which are slower than a local M4 Pro, so its numbers are higher; the scaling is the same.

## Overview

Vovk.ts runs on top of Next.js API routes and builds the handlers from decorated procedures:

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
export const { GET, POST } = initSegment({ controllers });
```

The tests measure the overhead in two ways:

- Request overhead: routing and handler time per request.
- Cold start overhead: time to initialize controllers and metadata.

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

- Generate N controllers (N ∈ \{1, 10, 100, 1,000, 10,000\}), each with:
  - GET without params.
  - POST with path param "\{id\}" (pattern match).
- Minimal handlers; the full routing and handler path is measured.
- Tinybench: at least 100 ms per test, nanosecond timing; median latency and throughput.

### Results

| Controllers | Endpoints | GET Latency (med) | POST Latency (med) | GET Throughput (med ops/s) | POST Throughput (med ops/s) |
| ----------- | --------- | ----------------- | ------------------ | -------------------------- | --------------------------- |
| 1           | 2         | 1,500 ns          | 1,500 ns           | 666,667                    | 666,667                     |
| 10          | 20        | 1,500 ns          | 1,480 ns           | 666,667                    | 676,034                     |
| 100         | 200       | 1,500 ns          | 1,500 ns           | 666,667                    | 666,667                     |
| 1,000       | 2,000     | 1,500 ns          | 1,500 ns           | 666,667                    | 666,667                     |
| 10,000      | 20,000    | 1,833 ns          | 1,750 ns           | 545,554                    | 571,429                     |

Key takeaways:

- Flat latency up to 1,000 controllers, about 20% higher at 10,000.
- ≈1.5 µs overhead at typical sizes; GET ≈ POST, so reading the path param costs little.
- The test repeats one path, which the route cache serves. The first request to a new path with a param scans the routes of its method: about 2.7 µs at 10 controllers, 42 µs at 1,000 and 0.8 ms at 10,000. A path that matches no route is never cached and costs about 3.4 µs, 123 µs and 3.1 ms.

## Cold Start Overhead

Example cold-start benchmark (N = 1), Vovk.ts against no-op decorators:

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

- App creation, decorator processing, metadata build and `initSegment()`.
- Compare with equivalent classes using no-op decorators, to isolate the framework's work.

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
| 1           | 6.896 μs                | 0.583 μs         | 11.8x          | 145,023            |
| 10          | 64.750 μs               | 5.229 μs         | 12.4x          | 15,444             |
| 100         | 664.021 μs              | 56.251 μs        | 11.8x          | 1,507              |
| 1,000       | 8,000.167 μs            | 698.417 μs       | 11.5x          | 125                |
| 10,000      | 113,550.011 μs          | 18,652.260 μs    | 6.1x           | 9                  |

Key takeaways:

- Linear growth: about 6.5–8 µs per controller up to 1,000 controllers, about 11 µs per controller at 10,000.
- At 10,000 classes, garbage collection dominates the no-op run, so its ratio is low.
- Absolute times are small for long-running services, and acceptable for serverless at typical sizes.

## Practical guidance

- For high-performance workloads, split the app into several [segments](https://vovk.dev/segment) (serverless functions built from Next.js route.ts files), each with up to 1,000 procedures.
- In theory, with well-planned segments and enough hardware, one Next.js/Vovk.ts app can host up to ~100,000 procedures. Test this in your environment: the real limits are memory, bundle size, cold start budgets and platform quotas.

---

Benchmarks: Tinybench on Node.js 24.1, on an Apple M4 Pro, 2026-10-06. Numbers can vary with the runtime, hardware and build settings. Scripts: https://github.com/finom/vovk/tree/main/perf

---

Page: https://vovk.dev/packages

# Packages

The [Vovk.ts repository](https://github.com/finom/vovk) holds the npm packages, the examples, the performance tests and this documentation.

## npm Packages

### [vovk](https://www.npmjs.com/package/vovk)

The runtime library: decorators, utilities, types and other code used on the server and on the client. Its only peer dependency is [openapi3-ts](https://www.npmjs.com/package/openapi3-ts), for types, and [Bundlephobia](https://bundlephobia.com/package/vovk) reports it as 100% self-composed.

```sh npm2yarn copy
npm install vovk
```

### [vovk-cli](https://www.npmjs.com/package/vovk-cli)

The CLI. Install it globally or as a dev dependency. It provides the `vovk` binary.

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

Exports `validateOnClient`, which validates input on the client with the emitted JSON Schema.

```sh npm2yarn copy
npm install vovk-ajv
```

### [vovk-python](https://www.npmjs.com/package/vovk-python)

Templates and utilities that generate the [Python client library](https://vovk.dev/python).

```sh npm2yarn copy
npm install vovk-python --save-dev
```

### [vovk-rust](https://www.npmjs.com/package/vovk-rust)

Templates and utilities that generate the [Rust client library](https://vovk.dev/rust).

```sh npm2yarn copy
npm install vovk-rust --save-dev
```

## Examples and Other Folders

### [examples/kitchen-sink](https://github.com/finom/vovk/tree/main/examples/kitchen-sink)

Examples and proofs of concept, served at [examples.vovk.dev](https://examples.vovk.dev/). Its client library is published to npm as [vovk-examples](https://www.npmjs.com/package/vovk-examples), and this site uses it.

### [examples/hello-world](https://github.com/finom/vovk/tree/main/examples/hello-world)

![PyPI version](https://badge.fury.io/py/vovk-hello-world.svg)

A minimal Vovk.ts example, served at [hello-world.vovk.dev](https://hello-world.vovk.dev/). See the ["Hello World"](https://vovk.dev/hello-world) page. Its client library is published as `vovk-hello-world` on [npm](https://www.npmjs.com/package/vovk-hello-world), [crates.io](https://crates.io/crates/vovk-hello-world) and [PyPI](https://pypi.org/project/vovk-hello-world/).

### [examples/multitenant](https://github.com/finom/vovk/tree/main/examples/multitenant)

Shows [multitenancy](https://vovk.dev/multitenant) with Vovk.ts, served at [multitenant.vovk.dev](https://multitenant.vovk.dev/).

### [examples/realtime-kanban](https://github.com/finom/vovk/tree/main/examples/realtime-kanban)

A realtime Kanban board built with Vovk.ts, described in the [Realtime Kanban](https://vovk.dev/realtime-ui) series of articles.

### [perf](https://github.com/finom/vovk/tree/main/perf)

[Overhead performance](https://vovk.dev/performance) tests for Vovk.ts.

### [docs](https://github.com/finom/vovk/tree/main/docs)

This documentation, served at [vovk.dev](https://vovk.dev).

---

Page: https://vovk.dev/api-ref

# API Reference

## Core

### `initSegment`

Creates the Next.js route handlers of an [Optional Catch-all Segment](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments) route.

It takes:

- `segmentName?: string{:ts}` – the segment name, as used in the route. Defaults to an empty string (the root segment).
- `controllers: Record<string, Function>{:ts}` – the controllers, keyed by RPC module name.
- `exposeValidation?: boolean` – `false` leaves the validation schemas out of the emitted schema, so the client code doesn't see them. The declared content types stay, since the clients encode the body by them. Defaults to `true`.
- `emitSchema?: boolean{:ts}` – `false` emits no schema for the segment. Defaults to `true`.
- `onError?: (err: Error, req: VovkRequest) => void | Promise{:ts}` – called when a controller throws, for example to log the error. The second argument is the request, with its URL, authorization data and other details.
- `onBefore?: (req: VovkRequest) => void | Promise{:ts}` – called with the request after the route's `before` and before the custom decorators and the handler run. An error it throws becomes the response.
- `onSuccess?: (result: unknown, req: VovkRequest) => void | Promise{:ts}` – called with the handler's result and the request once the handler returns. For a stream, that is when the stream starts, not when it ends.

### `JSONLinesResponder`

`JSONLinesResponder` creates a response in the JSON Lines format. Its methods send JSON objects, one per line, to the response stream.

```ts showLineNumbers copy
const responder = new JSONLinesResponder<IterationType>(req, ({ readableStream, headers }) => new Response(readableStream, { headers }));

await responder.send({ message: 'Hello' });
await responder.send({ message: 'World' });
```

It takes:
- `req?: Request` – the incoming request.
- `getResponse?: (responder: JSONLinesResponder<T>) => Response` – an optional function that creates a custom `Response`.

Methods and properties:
- `send(item: T): Promise` – sends one JSON object as a line of the stream.
- `close(): Promise` – closes the stream: nothing more is sent.
- `throw(err: Error): Promise` – sends an error to the client and closes the stream.
- `response: Response` – the `Response` that the Next.js route handler returns.
- `headers: Record<string, string>` – the `content-type` header of the response.
- `readableStream: ReadableStream<Uint8Array>` – the stream used as the response body.

See the [JSON Lines](https://vovk.dev/jsonlines) page.

### `toDownloadResponse`

Creates a `Response` with file or binary content and the matching headers, such as `Content-Type` and `Content-Disposition`. Return it from a controller. MCP tool output formatting accepts such a `Response` too.

**Arguments:**

- `content: Blob | File | ArrayBuffer | Uint8Array | ReadableStream<Uint8Array> | string{:ts}` — the file content.
- `opts?:{:ts}`
  - `filename?: string{:ts}` — sets `Content-Disposition: attachment; filename=...`.
  - `type?: string{:ts}` — overrides the `Content-Type` of the response, such as `audio/mpeg`, `text/csv` or `application/pdf`.
  - `headers?: Record<string, string>{:ts}` — more headers for the response.

Serving an audio file:

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

These decorators set the HTTP method of a handler. A `HEAD` request to a path without a `@head` route gets the response of the `GET` route: its status and headers, without the body. A request to a path that has routes only for other methods gets `405` and an `Allow` header that lists those methods. The decorators take two optional arguments:

- `path? = ''` – the path of the route.
- `opts?: { cors?: boolean, headers?: Record<string, string>, staticParams?: Record<string, string>[], before?: (req: VovkRequest) => unknown }` – route options:
  - `cors: true` adds CORS headers to the response and answers the `OPTIONS` preflight. The preflight allows and lists only the methods whose route on that path has `cors`, so a browser can't call a route without it from another origin. The preflight skips the decorator's `before` and the segment's `onBefore` hooks.
  - `headers` are added to the response.
  - `staticParams` (`@get` only) is an array of path parameter values, for example `[{ id: '123' }]`.
  - `before` runs on an HTTP request before the segment's `onBefore`, the custom decorators and the handler, with the controller as `this`. An error it throws becomes the response.

```ts showLineNumbers copy
import { get, type VovkRequest } from 'vovk';

export default class HelloController {
  @get('world/{id}', { cors: true, headers: { 'x-hello': 'world' }, staticParams: [{ id: '123' }] })
  static getHelloWorld(req: VovkRequest, { id }: { id: string }) {
    return { hello: 'world', id };
  }
}
```

Each HTTP method decorator has an `.auto()` form. It builds the path from the method name in kebab case and adds a `{name}` segment for each property of the procedure's `params` schema, so `getHelloWorld` below is served at `get-hello-world/{id}`. It takes the same options as the decorator.

```ts showLineNumbers copy
import { get, procedure } from 'vovk';
import { z } from 'zod';

export default class HelloController {
  @get.auto({ cors: true, headers: { 'x-hello': 'world' }, staticParams: [{ id: '123' }] })
  static getHelloWorld = procedure({
    params: z.object({ id: z.string() }),
  }).handle((req, { id }) => {
    return { hello: 'world', id };
  });
}
```

### `@prefix`

`@prefix(p: string)` adds a path in front of every endpoint of a controller. It's optional.

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

`@operation(openAPIOperationObject)` adds OpenAPI documentation to a procedure. It takes an object with `summary`, `description` and any other property of the OpenAPI Operation Object.

`@operation.tool()` adds AI tool data under the `x-tool` key of the operation object (see [Deriving AI Tools](https://vovk.dev/tools)), and `@operation.error(status, message)` documents an error response.

```ts showLineNumbers copy
import { get, operation } from 'vovk';

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

A controller can be in several segments, and each segment runs its own hooks. If the [composed client](https://vovk.dev/composed) includes those segments, give the controller a different key in each: the client exports one module per name. To serve the same handlers under another prefix, or together with new handlers, extend the controller and apply `@cloneControllerMetadata` to the new class. It copies all metadata (routes, operations and so on) from the parent controller. The new class keeps the parent's prefix unless it sets its own, as `@prefix('v2')` does below.

```ts showLineNumbers copy
import { prefix, cloneControllerMetadata } from 'vovk';
import UserController from './user-controller';

@cloneControllerMetadata()
@prefix('v2')
export default class UserControllerV2 extends UserController {}
```

## Utils

### `createDecorator`

`createDecorator` creates procedure decorators. Its first argument is a middleware function with these parameters:

- `req: VovkRequest` – the request.
- `next: () => Promise` – calls the next middleware or the handler.
- Other arguments – the values passed to the decorator.

The optional second argument changes the procedure schema based on the decorator arguments.

```ts showLineNumbers copy
import { createDecorator, get } from 'vovk';

const myDecorator = createDecorator(
  (req, next, a: string, b: number) => {
    // do something with the request
    return next();
  },
  (a: string, b: number) => {
    // change the schema here
  }
);

export default class MyController {
  @get.auto()
  @myDecorator('foo', 1) // passes 'foo' as a, and 1 as b
  static doSomething() {
    // ...
  }
}
```

See the [decorator docs](https://vovk.dev/decorator).

### `fetcher`

The default fetcher: the function the RPC client sends its requests with, unless you [customize](https://vovk.dev/imports#fetcher) it. [createFetcher](#createfetcher) creates a new one. Exported from `vovk/fetcher`.

### `createFetcher`

Creates a custom fetcher for the RPC client. Its type parameter defines extra options for the RPC methods. It returns the `fetcher` function that the client is built with.

```ts showLineNumbers copy filename="./src/lib/fetcher.ts"
import { createFetcher } from 'vovk/fetcher';

export const fetcher = createFetcher<{
  successMessage?: string; // "Successfully created a new user"
  useAuth?: boolean; // if true, sets the Authorization header
  someOtherCustomFlag?: boolean; // any other flag you pass to the RPC method
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

Lists the routes as static params, so the API is built at build time instead of on each request. Use it in the Next.js `generateStaticParams()` of `[[...slug]]/route.ts`.

**Arguments:**

- `controllers: Record<string, Function>{:ts}` — the controllers. It lists the path of every handler, whatever its HTTP method: the controller prefix and the handler path. A handler with `staticParams` gives one path per item, with the `{name}` placeholders filled in; other paths keep their placeholders.
- `slugName = 'vovk'{:ts}` — *(optional)* the name of the Optional Catch‑all Segment param, the folder name in `[[...<slugName>]]`. Set it when the folder isn't `[[...vovk]]`.

**Returns:**

- `Array<Record<string, string[]>>{:ts}` — params objects for `generateStaticParams()`: one per path, such as `{ vovk: ['hello', 'greeting.json'] }`. The list starts with `{ vovk: ['_schema_'] }` for the schema endpoint when `NODE_ENV` is `development`, or when there is no other path, as `output: 'export'` needs one.

```ts showLineNumbers copy filename="src/app/api/[[...vovk]]/route.ts"
// ...
export type Controllers = typeof controllers;

export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}

export const { GET } = initSegment({ controllers });
```

The segment needs no `dynamic` export: Next.js pre-renders the listed paths with `cacheComponents` on or off.

For another slug folder, such as `src/app/api/[[...custom]]/route.ts`, pass its name as the second argument:

```ts showLineNumbers copy
export function generateStaticParams() {
  return controllersToStaticParams(controllers, 'custom');
}
```

See the [segment](https://vovk.dev/segment) page.

### `multitenant`

A [Next.js proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) helper that routes subdomains to [segments](https://vovk.dev/segment).

**Returns:**

- `action: 'rewrite' | 'redirect' | null` — what the proxy should do.
- `destination: string | null` — the URL to rewrite or redirect to.
- `message: string` — what it decided and why, for debugging.
- `subdomains: Record<string, string> | null` — the wildcard subdomains from the request host.

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

See the [multitenant](https://vovk.dev/multitenant) guide.

### `deriveTools`

Turns RPC modules or controllers into AI tools that follow the [standard-tool](https://standard-tool.js.org/) convention (the `StandardToolV0` interface).

Options:

- `modules: Record<string, object>{:ts}` – module names mapped to objects with methods. Each method needs the `schema` property that RPC methods and procedures have, and either `isRPC: true` (RPC modules) or the [fn](https://vovk.dev/fn) function (controllers).
- `onExecute?: (result: unknown, tool: StandardToolV0, req: Pick<VovkRequest, 'vovk'> | null) => void{:ts}` – called after each successful tool call. For a controller, `req` is the request of the call, with `req.vovk`; for an RPC method, it's `null`.
- `onError?: (e: Error, tool: StandardToolV0, req: Pick<VovkRequest, 'vovk'> | null) => void{:ts}` – called when a tool call throws, or when a controller returns a `Response` with an error status. `req` is as in `onExecute`, or `null` for a thrown error.
- `toModelOutput` – formats the tool result for the model.
- `meta?: Record<string, any>{:ts}` – data passed to each call of a controller handler or RPC method; see [`req.vovk.meta()`](https://vovk.dev/req-vovk#meta).

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

See the [Deriving AI Tools](https://vovk.dev/tools) guide.

### `ToModelOutput`

Built-in `toModelOutput` formatters for `deriveTools`. They shape tool results for LLMs.

- `ToModelOutput.DEFAULT` — the default, used when `toModelOutput` isn't set.
- `ToModelOutput.MCP` — formats the output in the MCP tool output shape: text, JSON, image or audio. See [tools](https://vovk.dev/tools) for details and examples.

### `createValidateOnClient`

Creates the `validateOnClient` function, which runs client-side validation for RPC methods, for all segments or per segment. It takes a `validate` function, which gets the input data, the validation schema and more options. `validate` returns the validated data, or throws an error when validation fails.

```ts showLineNumbers copy filename="./src/lib/validate-on-client.ts"
import { validateData } from 'validation-library';
import { createValidateOnClient, HttpException, HttpStatus } from 'vovk/create-validate-on-client';

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

For client-side validation, see the [customization](https://vovk.dev/imports) page.

### `procedure`

Defines a procedure: a controller handler with validation and schema emission. `procedure(options)` returns `.handle()`, which takes the handler, `(req, params) => …`.

```ts showLineNumbers copy
import { z } from 'zod';
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

Without `.handle()`, the procedure throws a Not Implemented error.

`procedure` options:

- `body`, `query`, `params` — input validation schemas.
- `output` — the output schema, for JSON responses.
- `iteration` — the item schema, for JSON Lines responses.
- `contentType` — the `Content-Type` (a string or an array of strings) the request body may have, for non-JSON bodies such as forms, text or files. See [`contentType`](https://vovk.dev/procedure#contenttype).
- `disableServerSideValidation` — turns off server-side validation: `true` for all parts, or an array of parts.
- `skipSchemaEmission` — leaves JSON Schemas out of the emitted schema: `true` for all parts, or an array of parts.
- `validateEachIteration` — validates every streamed item, not only the first one.
- `operationObject` — OpenAPI operation details, for when you can't use the `@operation` decorator.
- `preferTransformed` — whether `req.vovk.*` and the response use the transformed values or the raw ones.
- `target` — the JSON Schema version the validation library emits for the procedure's schemas: `'draft-2020-12'` by default, or another version the library supports, such as `'draft-07'`.

A procedure also has:

- `.fn(...)` — calls the procedure locally, without HTTP, with the same arguments as an RPC call.
- `.schema` — the method schema, the same as the RPC method's.
- `.definition` — the options passed to `procedure`.

See the [procedure](https://vovk.dev/procedure) guide.

### `progressive`

Experimental. Makes one request and gets several responses, each as its own promise.

```ts showLineNumbers copy
const { users: usersPromise, tasks: tasksPromise } = progressive(ProgressiveRPC.streamProgressiveResponse);
```

See [Progressive Response](https://vovk.dev/progressive).

### `HttpException`

An error class that extends the built-in `Error`, with an HTTP status code and a message. Throw it from a procedure, and Vovk.ts answers with that status code and message.

```ts showLineNumbers copy
import { HttpException, HttpStatus } from 'vovk';

throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid request', { some: 'cause' });
```

The optional third argument holds more data for logging or debugging. The client gets it as `error.cause`.

See [responses](https://vovk.dev/response).

## Inference Types

### `VovkBody`, `VovkQuery`, `VovkParams`

Infer the input types of RPC methods and procedures.

```ts showLineNumbers copy
import type { VovkBody, VovkQuery, VovkParams } from 'vovk';
import { UserRPC } from '@/client';

type Body = VovkBody<typeof UserRPC.updateUser>;
type Query = VovkQuery<typeof UserRPC.updateUser>;
type Params = VovkParams<typeof UserRPC.updateUser>;
```

See [inference](https://vovk.dev/inference).

### `VovkInput`

Infers the `params`, `query` and `body` of a procedure as one object. Use it to type the arguments of a Next.js server action.

```ts showLineNumbers copy
import type { VovkInput } from 'vovk';
import type UserController from './user-controller';

type Input = VovkInput<typeof UserController.createUser>;
// { params: VovkParams<...>; query: VovkQuery<...>; body: VovkBody<...> }
```

See [inference](https://vovk.dev/inference).

### `VovkOutput`, `VovkIteration`

Output types of validated procedures:

- `VovkOutput<T>` infers the JSON response type of a `procedure({ output })`.
- `VovkIteration<T>` infers the JSON Lines item type of a `procedure({ iteration })`.

```ts showLineNumbers copy
import type { VovkOutput, VovkIteration } from 'vovk';
import { UserRPC, StreamRPC } from '@/client';

type Output = VovkOutput<typeof UserRPC.updateUser>;
type Iteration = VovkIteration<typeof StreamRPC.streamItems>;
```

See [inference](https://vovk.dev/inference).

### `VovkReturnType`, `VovkYieldType`

Infer the return and yield types of a method from its code, when it has *no* validation schemas.

```ts showLineNumbers copy
import type { VovkReturnType, VovkYieldType } from 'vovk';
import { UserRPC, StreamRPC } from '@/client';

type Return = VovkReturnType<typeof UserRPC.updateUser>;
type Yield = VovkYieldType<typeof StreamRPC.streamItems>;
```

See [inference](https://vovk.dev/inference).

## Other Types and Enums

### `VovkRequest`

A copy of the Next.js `NextRequest` type, with stricter types for `.json()` and `.nextUrl.searchParams`, and a `vovk` property with input helpers.

`VovkRequest` doesn't extend `NextRequest`, so the **vovk** package doesn't depend on the **next** package.

See [req.vovk](https://vovk.dev/req-vovk).

### `HttpStatus` enum

Status codes for throwing and catching server errors. `NULL` (0) is for an error without an HTTP response, such as a failed client-side validation.

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

### `VovkSchema`

The full schema of the composed client, or of one segment in a segmented client. It has `segments`, the schema of each segment by name, and an optional `meta` with the emitted config. To type the schema of one segment, use `typeof UserRPC.updateUser.segmentSchema`.

See the [schema docs](https://vovk.dev/schema).

### `VovkConfig`

The type of the [config](https://vovk.dev/config) file.

### `StandardToolV0`

The type of the LLM tools that [deriveTools](#derivetools) returns, from the [standard-tool](https://standard-tool.js.org/) convention.

See [Deriving AI Tools](https://vovk.dev/tools).

### `VovkJSONSchemaBase`

A JSON Schema object with `type`, `properties` and the other standard keywords.

### `VovkFetcher`

The type of a [fetcher](#fetcher), the function that sends the API requests. Exported from `vovk/fetcher`.

See the [fetcher docs](https://vovk.dev/imports#fetcher).

### `VovkStreamAsyncIterable`

The stream a client method returns for a [JSON Lines](https://vovk.dev/jsonlines) response: an async iterable of the items, with `status`, `asPromise`, `onIterate`, `abortController` and `abortSilently`. Generated clients use it in their method types, OpenAPI mixins included.

### `VovkValidateOnClient`

The type of the client-side validation function that [createValidateOnClient](#createvalidateonclient) creates. Exported from `vovk/create-validate-on-client`.

See the [client-side validation docs](https://vovk.dev/imports#validateonclient).