---
name: tools
description: Building AI / LLM tools with Vovk.ts — `deriveTools()` (procedures → tools), `createTool()` (standalone tools from scratch, no controller/procedure needed), `ToModelOutput.DEFAULT` vs `ToModelOutput.MCP` output formatting, the `@operation` decorator's role (summary/description), `x-tool` metadata, and how controllers, RPC modules, third-party OpenAPI schemas, and hand-written tools all merge into one tool array. Use whenever the user asks to expose an API to an LLM, wire up tool calling, build an MCP server / client, "let Claude / GPT call this", "turn my controllers into tools", "write a tool from scratch", "standalone tool", "createTool", "a tool that wraps a third-party SDK", "add OpenAI function calling", "MCP server from my API", or any variation. Does NOT cover procedure authoring → hand off to `procedure` skill. Does NOT cover the OpenAPI spec itself beyond the `@operation` fields tools read → hand off to `openapi` skill. Does NOT cover third-party OpenAPI mixin setup → hand off to `mixins` skill.
---

# Vovk.ts AI tools

Vovk produces LLM-consumable tool definitions — `{ name, description, parameters (JSON Schema), execute }` — via two entry points:

- **`deriveTools({ modules })`** — turn existing procedures (controllers, RPC modules, OpenAPI mixins) into tools automatically.
- **`createTool({ name, description, inputSchema, execute })`** — hand-build a standalone tool that isn't tied to any procedure. Use this when the tool logic has nothing to do with your HTTP API (wrapping an SDK, a database query, a local file operation, etc.).

Output from both shares one shape, so you can mix derived and standalone tools in the same array.

## Scope

Covers:

- `deriveTools({ modules })` — input types, output shape.
- `createTool(options)` — standalone tool factory.
- `ToModelOutput.DEFAULT` vs `ToModelOutput.MCP` output formatting.
- `@operation` metadata consumed by tool derivation (`summary`, `description`, `x-tool`).
- Three derive sources: controllers (local execution via `.fn`), RPC modules (HTTP execution), third-party OpenAPI mixins.
- `onExecute` / `onError` hooks.
- Combining derived + standalone tools in a single chat loop.

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

## `createTool` — standalone tools

For tools that don't map to a procedure — local logic, SDK wrappers, calculator functions, file operations, anything where the tool's body is just plain code.

```ts
import { createTool } from 'vovk';
import { z } from 'zod';

const getWeather = createTool({
  name: 'get_weather',
  description: 'Returns current weather for a city.',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ tempC: z.number(), conditions: z.string() }),
  execute: async ({ city }) => {
    const data = await weatherSdk.current(city);
    return { tempC: data.t, conditions: data.desc };
  },
});
```

### Options

| Field | Purpose |
|---|---|
| `name` | Tool name (required). |
| `description` | Shown to the LLM (required). |
| `title` | Optional human-readable label. |
| `inputSchema` | Standard Schema (Zod / Valibot / ArkType). Becomes the tool's JSON Schema. Omit for no-arg tools. |
| `outputSchema` | Standard Schema validating `execute`'s return. Optional but recommended. |
| `execute(input, meta?)` | The tool body. `input` is validated against `inputSchema` before this runs. |
| `toModelOutput` | Formatter. Default: `ToModelOutput.DEFAULT` (raw output or `{ error }`). `ToModelOutput.MCP` for MCP-spec shape. |
| `onExecute(result, tool)` | Called after successful execution. |
| `onError(err, tool)` | Called when `execute` throws or validation fails. |
| `target` | Validation target override (rarely needed). |

### Return shape

Same `VovkTool` shape as derived tools — `name`, `description`, `parameters` (JSON Schema from `inputSchema`), `execute`. **Derived and standalone tools combine into one array**:

```ts
import { deriveTools, createTool } from 'vovk';
import { TaskRPC } from 'vovk-client';

const { tools: derivedTools } = deriveTools({ modules: { TaskRPC } });
const getWeather = createTool({ /* ... */ });
const calculator = createTool({ /* ... */ });

const allTools = [...derivedTools, getWeather, calculator];
// feed `allTools` to the LLM
```

### Error behavior

`execute` throws → captured, returned as `{ error: message }` (not re-thrown). Tools never crash the chat loop. Validation failures (input or output) behave the same way — the LLM receives the error and can retry.

```ts
const result = await tool.execute({ city: 'unknown' });
// { tempC, conditions }  OR  { error: "..." }
```

`onError` fires whenever the error path is hit.

### No-input tools

Omit `inputSchema`. `execute` receives `null`:

```ts
createTool({
  name: 'current_time',
  description: 'Returns current server time.',
  execute: () => ({ now: new Date().toISOString() }),
});
```

### `ToModelOutput` — output formatting

Controls the shape of what `execute` returns to the caller:

- **`ToModelOutput.DEFAULT`** (default) — returns the raw output, or `{ error: string }` on failure. Good for OpenAI / Anthropic function calling.
- **`ToModelOutput.MCP`** — wraps output in MCP content shape: `{ content: [{ type: 'text' | 'image' | ..., ... }], structuredContent?, isError? }`. Required for MCP servers.

```ts
import { createTool, ToModelOutput } from 'vovk';

createTool({
  name: 'hello',
  description: '...',
  toModelOutput: ToModelOutput.MCP,
  execute: () => ({ message: 'hi' }),
});
// returns: { content: [{ type: 'text', text: '{"message":"hi"}' }], structuredContent: { message: 'hi' } }
```

`ToModelOutput.MCP` also detects `Response` objects with binary content types (images, PDFs) and emits the correct MCP content block. Custom formatters: write a function matching `ToModelOutputFn`.

The same `toModelOutput` option works on `deriveTools({ ..., toModelOutput: ToModelOutput.MCP })` — use it consistently across all tools in a given session.

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

### "Write a standalone tool (no controller, no HTTP)"

Use `createTool` directly:

```ts
import { createTool } from 'vovk';
import { z } from 'zod';

const sendEmail = createTool({
  name: 'send_email',
  description: 'Sends a transactional email via Resend.',
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  execute: async ({ to, subject, body }) => {
    await resend.emails.send({ from: 'hi@app.com', to, subject, html: body });
    return { sent: true };
  },
});
```

No procedure, no controller, no OpenAPI. Good for SDK wrappers, calculators, local file operations, internal queries.

### "Combine derived + standalone tools in one chat loop"

```ts
const { tools: derived } = deriveTools({ modules: { TaskRPC } });
const allTools = [...derived, getWeather, sendEmail];
```

Same shape, same chat-loop code.

### "Build an MCP server with hand-written + derived tools"

1. `deriveTools({ modules, toModelOutput: ToModelOutput.MCP })` for the API half.
2. `createTool({ ..., toModelOutput: ToModelOutput.MCP })` for each standalone tool.
3. Merge into one array, surface via your MCP SDK's `ListTools` / `CallTool`.

Pick `ToModelOutput.MCP` consistently — don't mix formatters in the same tool list.

## Gotchas

- **No `@operation` → weak tool description**. LLMs call derived tools poorly without good descriptions. Add `summary` + `description` to every tool-exposed procedure. For `createTool`, the `description` field is the equivalent — keep it action-oriented.
- **Controller vs RPC module**: same `deriveTools` call; different execution path (`.fn()` vs HTTP). Pick deliberately.
- **Output must be JSON-serializable**. Tools can't return `File`, streams, or `FormData` — except `ToModelOutput.MCP` understands a `Response` with an `image/*` content type and emits the correct MCP block.
- **`createTool` errors don't throw**. They land as `{ error: string }` in the result — by design, so the LLM can recover. Use `onError` if you want a side-channel log.
- **`createTool` input is `null` when `inputSchema` is omitted**, not `undefined`. Don't destructure.
- **Schema quality matters**. Descriptive Zod/Valibot schemas with `.describe()` produce better LLM arguments. Tight enums beat free-form strings. Applies equally to `createTool.inputSchema` and procedure schemas.
- **Tool name collisions**: two tools with the same `name` (derived or standalone) will collide. `summary` / `x-tool.name` overrides for derived; pick a unique `name` for `createTool`.
- **Schemas flow from `procedure()`** for derived tools. If you want a derived tool to accept only `body` and ignore `params`, declare only `body` in `procedure({ body: ... })`.
- **Local (`.fn`) derived tools skip HTTP**: auth decorators that read HTTP headers won't fire. Use a shared service layer for auth logic you want to apply both ways.
- **Mix `toModelOutput` settings at your peril**. All tools in a single LLM turn should use the same formatter — otherwise the call site has to branch.
