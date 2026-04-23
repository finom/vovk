---
name: tools
description: Knowledge base for exposing Vovk.ts procedures as AI / LLM tools — `deriveTools()`, the MCP-compatible output shape, the `@operation` decorator's role (summary/description), the `x-tool` metadata, and how controllers, RPC modules, and third-party OpenAPI schemas all feed the same tool-derivation pipeline. Use whenever the user asks to expose an API to an LLM, wire up tool calling, build an MCP server / client, "let Claude / GPT call this", "turn my controllers into tools", "derive tools from my Vovk app", "add OpenAI function calling", "MCP server from my API", "use `deriveTools`", or any variation. Does NOT cover procedure authoring → hand off to `procedure` skill. Does NOT cover the OpenAPI spec itself beyond the `@operation` fields tools read → hand off to `openapi` skill. Does NOT cover third-party OpenAPI mixin setup → hand off to `mixins` skill.
---

# Vovk.ts AI tool derivation

`deriveTools()` converts Vovk procedures into LLM-consumable tool definitions — `{ name, description, parameters (JSON Schema), execute }`. The shape is MCP-compatible, so the same output plugs into OpenAI function calling, Anthropic tool use, or an MCP server.

## Scope

Covers:

- `deriveTools({ modules })` — input types, output shape.
- `@operation` metadata consumed by tool derivation (`summary`, `description`, `x-tool`).
- Three input sources: controllers (local execution via `.fn`), RPC modules (HTTP execution), third-party OpenAPI mixins.
- Wiring tools into an LLM chat loop.

Out of scope:

- Writing procedures → **`procedure` skill**.
- `@operation` for general OpenAPI docs → **`openapi` skill**.
- Importing third-party OpenAPI schemas → **`mixins` skill**.
- MCP server hosting / transports → outside Vovk's scope; see user's MCP runtime of choice.

## `deriveTools` — core shape

```ts
import { deriveTools } from 'vovk';
import { TaskRPC, PetstoreAPI } from 'vovk-client';

const { tools } = deriveTools({
  modules: { TaskRPC, PetstoreAPI },
});

// tools: Array<{
//   name:        string,
//   description: string,
//   parameters:  JSONSchema,        // { params, body, query } flattened
//   execute:     (args) => Promise<unknown>,
// }>
```

One tool per procedure across all supplied modules. `execute` invokes the procedure.

## Input sources

### 1. Controllers — local execution

Pass a controller class. `execute` calls the procedure via `.fn()` in-process. No HTTP.

```ts
import TaskController from '@/modules/task/TaskController';

const { tools } = deriveTools({
  modules: { TaskController },
});
```

Best for: same-process LLM agents, server-side tool loops, avoiding network overhead.

### 2. RPC modules — HTTP execution

Pass a generated RPC module. `execute` calls over HTTP using the standard RPC fetcher.

```ts
import { TaskRPC } from 'vovk-client';

const { tools } = deriveTools({
  modules: { TaskRPC },
});
```

Best for: LLM running in a different process than the API, cross-service tool calling, when you want the full HTTP path (auth headers, rate limits, observability).

### 3. Third-party OpenAPI — via mixins

Mixins turn an external OpenAPI 3.x schema into a Vovk-compatible module. Once imported, they go through `deriveTools` identically:

```ts
import { PetstoreAPI } from 'vovk-client';

const { tools } = deriveTools({
  modules: { PetstoreAPI },
});
```

See `mixins` skill for mixin setup.

## `@operation` — what tools read

Tool derivation reads `@operation` metadata on each procedure:

| Field | Used for |
|---|---|
| `summary` | Tool `name` / short label. |
| `description` | Tool `description` shown to the LLM. |
| `tags` | Optional grouping. |
| `x-tool` | Vovk-specific per-procedure tool config (e.g., exclusion, custom execution). |

```ts
import { operation, post, procedure } from 'vovk';
import { z } from 'zod';

export default class TaskController {
  @operation({
    summary: 'Create task',
    description: 'Creates a new task with the given title.',
    tags: ['tasks'],
  })
  @post()
  static createTask = procedure({
    body: z.object({ title: z.string() }),
    output: z.object({ id: z.string(), title: z.string() }),
  }).handle(async (req) => {
    const { title } = await req.vovk.body();
    return TaskService.create(title);
  });
}
```

Without `@operation`, a tool is still derived (from method name + schemas) but the description will be minimal. Always add `@operation` on procedures you want LLMs to use well.

### `x-tool`

Per-procedure tool-specific configuration. Use it to:

- Exclude a procedure from tool derivation (when a controller is broadly exposed but some methods shouldn't be tools).
- Customize the derived tool's surface (name, description, parameter shape) beyond what `summary`/`description` give you.

```ts
@operation({
  summary: 'Internal helper',
  'x-tool': { /* ... per-procedure config ... */ },
})
```

Exact shape varies by Vovk version. Default to `summary` + `description` until you have a reason to reach for `x-tool`.

## Output shape (MCP-compatible)

```ts
type DerivedTool = {
  name: string;               // e.g. 'createTask'
  description: string;        // from @operation.description
  parameters: JSONSchema;     // { type: 'object', properties: { params, body, query }, ... }
  execute: (args: unknown) => Promise<unknown>;
};
```

Plugs directly into:

- **OpenAI function calling**: map `{ name, description, parameters }` to the `tools` array.
- **Anthropic tool use**: same shape, `input_schema` = `parameters`.
- **MCP server**: surface `tools` via the MCP `ListTools` / `CallTool` protocol.

## Wiring into an LLM chat loop

Shape (vendor-specific details elided):

```ts
const { tools } = deriveTools({ modules: { TaskController } });

// 1. Send tool defs to the LLM
const resp = await llm.chat({
  messages,
  tools: tools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  })),
});

// 2. When the LLM requests a tool call, find and execute
for (const call of resp.tool_calls ?? []) {
  const tool = tools.find(t => t.name === call.name);
  if (!tool) throw new Error(`Unknown tool: ${call.name}`);
  const result = await tool.execute(call.arguments);
  // 3. Send result back as tool_result message
}
```

`execute` returns whatever the procedure returns (JSON-serializable). Pass it straight back to the LLM.

## Flows

### "Expose my TaskController to Claude"

1. Add `@operation({ summary, description })` to each procedure.
2. Derive:
   ```ts
   const { tools } = deriveTools({ modules: { TaskController } });
   ```
3. Feed into the chat loop.

### "Use my API as tools from a separate agent process"

Use the RPC module instead of the controller:

```ts
import { TaskRPC } from 'vovk-client';
const { tools } = deriveTools({ modules: { TaskRPC } });
// execute() makes HTTP calls
```

Combine with `customFetcher` (see `rpc` skill) for auth.

### "Build an MCP server from my Vovk API"

1. `deriveTools` for the controllers/RPC modules you want to expose.
2. Adapt the output to MCP's `ListTools` / `CallTool` handlers.
3. MCP runtime (server transport, stdio, SSE) is not part of Vovk — pick your MCP SDK.

### "Mix my API with a third-party OpenAPI service"

Import both via `mixins` skill, then combine in one `deriveTools` call:

```ts
const { tools } = deriveTools({
  modules: { TaskRPC, StripeAPI, GitHubAPI },
});
```

### "Skip a procedure from being exposed as a tool"

Use `x-tool` to exclude, or don't include that controller/module in the `modules` arg. Excluding per-module is usually simpler: split the controller into tool-exposed and internal halves.

## Gotchas

- **No `@operation` → weak tool description**. LLMs call tools poorly without good descriptions. Add `summary` + `description` to every tool-exposed procedure.
- **Controller vs RPC module**: same `deriveTools` call; different execution path (`.fn()` vs HTTP). Pick deliberately.
- **Output must be JSON-serializable**. Tools can't return `File`, streams, or `FormData`. For binary/streamed tools, wrap or encode.
- **Schema quality matters**. Descriptive Zod/Valibot schemas with `.describe()` produce better LLM arguments. Tight enums beat free-form strings.
- **Tool name collisions**: two procedures with the same generated name will collide. `summary` / `x-tool` let you override.
- **Schemas flow from `procedure()`**. If you want a tool to accept only `body` and ignore `params`, declare only `body` in `procedure({ body: ... })`.
- **Local (`.fn`) tools skip HTTP**: auth decorators that read HTTP headers won't fire. Use a shared service layer for auth logic you want to apply both ways.
