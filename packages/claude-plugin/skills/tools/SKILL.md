---
name: tools
description: Building LLM tools with Vovk.ts — `deriveTools()` (procedures → tools), `createTool()` (standalone tools, no controller/procedure needed), `@operation.tool({ name, title, description, hidden })` decorator, `x-tool` metadata, `ToModelOutput.DEFAULT` vs `ToModelOutput.MCP` formatters, the `tools` + `toolsByName` return shape, the `meta` option for passing context to procedures, `withDefaults` for baking auth into third-party API tools, and the `pick` / `omit` pattern for selecting specific procedures. Use whenever the user asks to expose an API to an LLM, wire up tool calling, build an MCP server, "let Claude / GPT call this", "turn my controllers into tools", "function calling with Vercel AI SDK", "createTool", "standalone tool", "hide a procedure from the LLM", "tool that wraps a third-party SDK", or any variation. Does NOT cover procedure authoring → `procedure` skill. Does NOT cover the OpenAPI spec beyond `@operation`/`x-tool` → `openapi` skill. Does NOT cover third-party OpenAPI mixin setup → `mixins` skill.
---

# Vovk.ts LLM tools

Vovk produces LLM-consumable tool definitions — `{ name, description, parameters, execute, … }` — via two entry points:

- **`deriveTools({ modules })`** — turn existing procedures (controllers, RPC modules, OpenAPI mixins) into tools automatically.
- **`createTool({ name, description, inputSchema?, outputSchema?, execute, … })`** — hand-build a standalone tool that isn't tied to any procedure. Use when the body is plain code (SDK wrappers, calculators, file ops).

Both shapes are interoperable — mix them in one array and feed to OpenAI / Anthropic / Vercel AI SDK / MCP servers.

**Out of scope:** procedure authoring (**`procedure`**), `@operation` for OpenAPI docs (**`openapi`**), third-party OpenAPI mixin setup (**`mixins`**). MCP server transport / hosting is outside Vovk; **for Next.js, the recommended runtime is [`mcp-handler`](https://www.npmjs.com/package/mcp-handler)** — example below.

> **Import path note.** Code samples import from `'vovk-client'` — the **composed client + `js` template** default, re-exported from `node_modules/.vovk-client`. With the `ts` template, import from `composedClient.outDir` (e.g. `@/client`). With the segmented client, import from `@/client/<segment>`. Call shape is identical. See the **`rpc`** skill.

## `deriveTools` — core shape

```ts
import { deriveTools } from 'vovk';
import { TaskRPC, PetstoreAPI } from 'vovk-client';
import UserController from '@/modules/user/UserController';

const { tools, toolsByName } = deriveTools({
  modules: { UserController, TaskRPC, PetstoreAPI },
});
```

`modules` accepts a record of:

- **Controllers** — execute via `.fn()` in-process, no HTTP.
- **RPC modules** (from `vovk-client` or `@/client[/segment]` per layout) — execute via HTTP using the standard fetcher.
- **OpenAPI mixins** (same client surface) — execute via HTTP against the third-party API. See **`mixins`** skill.

Each module contributes one tool per procedure that has an `@operation` schema and isn't `hidden`.

### Return shape

```ts
const { tools, toolsByName } = deriveTools({ modules: { TaskRPC } });

// Array — feed to LLM SDKs
llm.chat({ tools: tools.map(t => ({ name: t.name, description: t.description, input_schema: t.parameters })) });

// Map — dispatch tool calls without scanning
const result = await toolsByName[call.name].execute(call.arguments);
```

### Each tool's fields

```ts
type VovkTool = {
  type: 'function';                     // always
  name: string;                         // default: `${moduleName}_${handlerName}` — e.g. UserController_getUser
  title?: string;                       // from x-tool.title or operation.summary
  description: string;                  // x-tool.description, OR `${summary}\n${description}`, OR handlerName fallback
  parameters: JSONSchema;               // see below
  execute: (input) => Promise<unknown>; // calls the procedure (HTTP for RPC/mixins, .fn() for controllers)
  inputSchemas?: { body?, query?, params? };  // per-key Standard Schemas (Zod/Valibot/ArkType)
  outputSchema?: StandardSchema;        // procedure's output schema if declared
};
```

**`parameters` is nested, not flattened.** Each procedure schema sits under its own key:

```ts
parameters: {
  type: 'object',
  properties: { body?: <body schema>, query?: <query schema>, params?: <params schema> },
  required: ['body', 'query', ...], // keys that exist in properties
  additionalProperties: false,
}
```

So `execute` is called as `tool.execute({ body, query, params })`, not `tool.execute({ ...flat })`.

## Customizing tool name + description

Default `name = ${ModuleName}_${handlerName}`, default `description = ${summary}\n${description}` from `@operation`. Override via `@operation.tool({ … })` (the recommended cleaner form):

```ts
import { prefix, get, operation, procedure } from 'vovk';

@prefix('user')
export default class UserController {
  @operation.tool({
    name: 'get_user_by_id',                // overrides UserController_getUser
    title: 'Get user by ID',               // shown in MCP clients
    description: 'Retrieves a user by their unique ID, including name and email.',
  })
  @operation({ summary: 'Get user by ID', description: 'Retrieves a user by their unique ID.' })
  @get('{id}')
  static getUser = procedure({ /* ... */ });
}
```

Equivalent long form: `@operation({ ..., 'x-tool': { name, title, description, hidden } })`. Keys (all optional):

| Key | Effect |
|---|---|
| `hidden: true` | Procedure is excluded from `deriveTools` output. |
| `name` | Overrides default `ModuleName_handlerName`. |
| `title` | Optional title — used by MCP clients in tool-list UI. |
| `description` | Overrides the `summary\ndescription` concatenation. |

## Hiding procedures

Canonical: `hidden: true`.

```ts
@operation.tool({ hidden: true })
@operation({ summary: 'Internal helper' })
@get()
static internalDebug = procedure({ /* ... */ });
```

For coarser selection — when the same controller serves both REST and tool-exposed callers and you don't want to annotate every method — use `pick`/`omit` from lodash:

```ts
import { pick, omit } from 'lodash';

const { tools } = deriveTools({
  modules: {
    PostRPC: pick(PostRPC, ['createPost', 'getPost']),
    UserController: omit(UserController, ['deleteUser']),
  },
});
```

## `meta` — passing context into procedures

`deriveTools({ meta })` flows into every tool execution. Controllers read it via `req.vovk.meta()`; RPC modules send it as the `xMetaHeader` request header.

```ts
const { tools } = deriveTools({
  modules: { UserController },
  meta: { tenantId: 'acme', actorRole: 'admin' },
});

@get()
static getUser = procedure({ /* ... */ }).handle(async (req) => {
  const { tenantId, actorRole } = req.vovk.meta<{ tenantId: string; actorRole: string }>();
  // ...
});
```

Use for ambient context (tenant, actor, request ID) that should apply to every LLM-triggered call without surfacing to the LLM as a tool argument.

## Authorizing third-party API tools

Mixin modules carry a `withDefaults({ init?, apiRoot? })` method that returns a pre-configured copy. Wrap before passing to `deriveTools` to bake in auth headers without leaking secrets to the LLM:

```ts
import { deriveTools } from 'vovk';
import { GithubIssuesAPI } from 'vovk-client';

const { tools } = deriveTools({
  modules: {
    AuthorizedGithubIssuesAPI: GithubIssuesAPI.withDefaults({
      init: {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    }),
  },
});
```

The LLM sees `AuthorizedGithubIssuesAPI_listForOrg` etc. with the operation parameters — never the token. See **`mixins`** for `withDefaults` setup details.

## `createTool` — standalone tools

For tools with no procedure backing — SDK wrappers, calculators, file operations, plain code:

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
| `name` *(required)* | Tool name. |
| `description` *(required)* | Shown to the LLM. Action-oriented language works best. |
| `title` | Optional human-readable label, used by MCP clients. |
| `inputSchema` | Standard Schema (Zod / Valibot / ArkType). Validated before `execute`. Becomes the JSON Schema. Omit for no-arg tools. |
| `outputSchema` | Validates `execute`'s return value. Optional, recommended. |
| `execute(input, processingMeta?)` | Tool body. `input` is post-validation. |
| `toModelOutput` | Output formatter. Default `ToModelOutput.DEFAULT`; use `ToModelOutput.MCP` for MCP servers. |
| `onExecute(result, tool)` / `onError(err, tool)` | Success / failure callbacks. |
| `target` | Validation target override (rarely needed). |

**No-input tools.** Omit `inputSchema`. `execute` receives `null` (not `undefined` — don't destructure):

```ts
createTool({
  name: 'current_time',
  description: 'Returns current server time as ISO 8601.',
  execute: () => ({ now: new Date().toISOString() }),
});
```

**Error handling.** Errors from `execute`, input validation, or output validation are caught (never re-thrown), monkey-patched with `toJSON() = { isError, message }`, then handed to `toModelOutput`:

- `ToModelOutput.DEFAULT` → `{ error: string }`
- `ToModelOutput.MCP` → `{ content: [{ type: 'text', text: message }], isError: true }`

`onError` fires on the error path. The tool never crashes the chat loop — the LLM can retry.

**Combining derived + standalone.** Same shape, same chat loop:

```ts
const { tools: derived, toolsByName: derivedByName } = deriveTools({ modules: { TaskRPC } });
const allTools = [...derived, getWeather, sendEmail];
const allByName = { ...derivedByName, [getWeather.name]: getWeather, [sendEmail.name]: sendEmail };
```

## `ToModelOutput` — formatting the result

`toModelOutput` controls what `execute` returns. Set on `deriveTools` and/or `createTool`; pick consistently across tools in one chat loop.

| Formatter | Output shape | Use for |
|---|---|---|
| `ToModelOutput.DEFAULT` | Raw result, or `{ error: string }` on failure. | OpenAI / Anthropic function calling, Vercel AI SDK. |
| `ToModelOutput.MCP` | `{ content: [{ type: 'text' \| 'image' \| 'audio', … }], structuredContent?, isError? }`. Detects `Response` objects with binary content types and emits the correct MCP block. | MCP servers. |

Custom formatters: write a function matching `ToModelOutputFn<TInput, TOutput, TFormattedOutput>`.

### Returning binary / file content via `Response` (MCP)

When `ToModelOutput.MCP` is active, returning a `Response` from a procedure auto-converts based on the `Content-Type` header:

| `Content-Type` | MCP block |
|---|---|
| `image/*` | `{ type: 'image', mimeType, data: <base64> }` |
| `audio/*` | `{ type: 'audio', mimeType, data: <base64> }` |
| `application/json` | `{ type: 'text', text: <stringified> }` + `structuredContent` from parsed JSON |
| `text/*`, `application/xml`, `application/javascript`, `application/yaml` | `{ type: 'text', text }` |
| anything else | `isError: true` with an "Unsupported response content type" message |

```ts
import { procedure, get, operation, prefix, toDownloadResponse } from 'vovk';

@prefix('files')
export default class FilesController {
  @operation.tool({ name: 'render_chart' })
  @get('chart')
  static renderChart = procedure({}).handle(async () => {
    const png = await renderChartPng(/* ... */);
    return toDownloadResponse(png, { type: 'image/png', filename: 'chart.png' });
  });

  // fetch() works too — same MCP image block, no manual base64 wiring.
  @operation.tool({ name: 'avatar' })
  @get('avatar')
  static avatar = procedure().handle(() => fetch('https://example.com/avatar.png'));
}
```

JSON `Response`s yield both `content[0].text` (stringified) and `structuredContent` (parsed). Plain object returns also produce `structuredContent` from the object directly — return whichever is more natural.

### Per-call MCP overrides — divergent HTTP and MCP responses

The MCP formatter shallow-merges anything you set under `vovk.meta({ mcpOutput })` *over* the auto-generated output (`mcpOutputMeta` spreads last, so its keys win). Whatever the procedure returns still becomes the HTTP response unchanged — the override only affects the MCP-formatted payload. **One procedure can serve HTTP callers and MCP/LLM callers with completely different shapes**, sharing only the operation logic.

```ts
@operation.tool({ name: 'list_tasks' })
@get()
static listTasks = procedure({
  query: z.object({ status: z.enum(['open', 'done']).optional() }),
  output: z.array(z.object({ id: z.string(), title: z.string(), status: z.string() })),
}).handle(async ({ vovk }) => {
  const tasks = await TaskService.list();

  // MCP caller gets a markdown digest + annotations; HTTP caller gets the typed array.
  vovk.meta({
    mcpOutput: {
      content: [{
        type: 'text',
        text: `You have ${tasks.length} tasks. Open: ${tasks.filter(t => t.status === 'open').length}.\n\n` +
              tasks.map(t => `- **${t.title}** (${t.status})`).join('\n'),
      }],
      structuredContent: { count: tasks.length, tasks }, // optional machine-readable companion
      annotations: { audience: ['user'], priority: 5, lastModified: new Date().toISOString() },
    },
  });

  return tasks; // HTTP response
});
```

Useful patterns built on this seam:

- **JSON for HTTP, prose for the LLM** — REST/UI clients get structured data; the model gets a digest it can reason about without drowning in JSON.
- **Render server-side and ship the image** — return JSON to HTTP, override `content` with an MCP `image` block so the LLM sees a chart instead of numbers.
- **Soft-fail surfacing** — return a normal payload (200 OK) but set `isError: true` in `mcpOutput` so the MCP client treats it as an error.
- **Audience routing** — `annotations.audience: ['user']` exposes the result in the MCP client UI; `['assistant']` keeps it model-only.

Override keys (all optional, all merged shallowly):

| Key | Effect |
|---|---|
| `content: [...]` | Wholesale-replaces the auto-generated content array. |
| `structuredContent` | Wholesale-replaces the parsed structured payload. |
| `isError: true` | Marks the result as an error to the MCP client. |
| `annotations.audience` | `('user' \| 'assistant')[]` — who should see the result. |
| `annotations.priority` | Number, relative importance hint. |
| `annotations.lastModified` | ISO timestamp. |

## Wiring into LLM SDKs

### Vercel AI SDK (canonical pattern)

```ts
import { deriveTools, post, prefix, type VovkRequest } from 'vovk';
import { jsonSchema, streamText, tool, convertToModelMessages, type UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import UserController from '@/modules/user/UserController';

@prefix('ai-sdk')
export default class AiSdkController {
  @post('tools')
  static async functionCalling(req: VovkRequest<{ messages: UIMessage[] }>) {
    const { messages } = await req.json();
    const { tools: llmTools } = deriveTools({ modules: { UserController } });

    const tools = Object.fromEntries(
      llmTools.map(({ name, execute, description, parameters }) => [
        name,
        tool({ execute: (input) => execute(input), description, inputSchema: jsonSchema(parameters) }),
      ])
    );

    return streamText({
      model: openai('gpt-5-nano'),
      system: 'You are a helpful assistant',
      messages: await convertToModelMessages(messages),
      tools,
    }).toUIMessageStreamResponse();
  }
}
```

The key adapter is `jsonSchema(parameters)` — Vercel's `tool()` wants its own typed schema, and our `parameters` is already JSON Schema, so wrap it.

### OpenAI / Anthropic function calling

`parameters` is already JSON Schema, so pass it directly:

```ts
const { tools, toolsByName } = deriveTools({ modules: { TaskController } });

const resp = await client.chat.completions.create({
  model: 'gpt-5',
  messages,
  tools: tools.map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  })),
});

for (const call of resp.choices[0].message.tool_calls ?? []) {
  const tool = toolsByName[call.function.name];
  if (!tool) throw new Error(`Unknown tool: ${call.function.name}`);
  const result = await tool.execute(JSON.parse(call.function.arguments));
  // append result as a tool_result message and continue the loop
}
```

For Anthropic: `input_schema = t.parameters`, otherwise identical.

### MCP servers via `mcp-handler` (recommended for Next.js)

Each Vovk tool's `inputSchemas` field (per-key Standard Schemas for `body` / `query` / `params`) plugs directly into `server.registerTool`'s `inputSchema` argument:

```ts filename="src/app/api/mcp/route.ts"
import { createMcpHandler } from 'mcp-handler';
import { deriveTools, ToModelOutput } from 'vovk';
import type z from 'zod';
import TaskController from '@/modules/task/TaskController';
import UserController from '@/modules/user/UserController';

const { tools } = deriveTools({
  modules: { UserController, TaskController },
  toModelOutput: ToModelOutput.MCP,
  onExecute: (result, { name }) => console.log(`${name} executed`, result),
  onError: (e, { name }) => console.error(`Error in ${name}`, e),
});

const handler = createMcpHandler(
  (server) => {
    tools.forEach(({ title, name, execute, description, inputSchemas }) => {
      server.registerTool(
        name,
        {
          title,
          description,
          inputSchema: inputSchemas as Partial<Record<'body' | 'query' | 'params', z.ZodTypeAny>>,
        },
        execute,
      );
    });
  },
  {},
  { basePath: '/api' }, // server lives at /api/mcp
);

export { handler as GET, handler as POST };
```

**Demo-grade gating with a query-string key.** MCP clients like Claude Desktop can connect to a remote MCP server by URL but don't run a full OAuth flow out of the box. For getting a Vovk-backed MCP server in front of a real client *quickly* — local testing, throwaway demos, sharing a personal endpoint with one collaborator — wrap with a shared-secret check:

```ts
const authorizedHandler = (req: Request) => {
  const { MCP_ACCESS_KEY } = process.env;
  const accessKey = new URL(req.url).searchParams.get('mcp_access_key');
  if (MCP_ACCESS_KEY && accessKey !== MCP_ACCESS_KEY) {
    return new Response('Invalid mcp_access_key', { status: 401 });
  }
  return handler(req);
};
export { authorizedHandler as GET, authorizedHandler as POST };
```

> **This is not production auth.** A query-string secret leaks into browser history, server logs, proxy logs, and bookmarks; it's identical for every caller. For anything user-facing or multi-tenant, use real OAuth / session cookies / header-based middleware in front of the MCP route. The pattern above exists because it's the shortest path to "Claude can talk to my server right now."

Test locally with the official MCP Inspector: `npx @modelcontextprotocol/inspector`. To mix derived + standalone MCP tools, set `toModelOutput: ToModelOutput.MCP` on `createTool` too and register inside the same `createMcpHandler` callback. For non-Next.js MCP runtimes, the same `tools` + `toolsByName` pair drops into any SDK that accepts `ListTools` / `CallTool` handlers.

## Gotchas

- **No `@operation` → no tool.** `deriveTools` filters on `handler.schema.operationObject`. Procedures without `@operation` are skipped silently. Always annotate.
- **Default tool name is `ModuleName_handlerName`.** Verbose but unique. Use `@operation.tool({ name: 'get_user_by_id' })` for a cleaner LLM-facing name.
- **`parameters` is nested, not flat.** `tool.execute({ body, query, params })`, not `tool.execute({ ...flat })`. The LLM sees the nested JSON Schema and constructs arguments accordingly.
- **`createTool` errors don't throw**; they land as `{ error }` (DEFAULT) or `{ content, isError: true }` (MCP). By design — the LLM can recover. Use `onError` for side-channel logs.
- **`createTool` with no `inputSchema` calls `execute(null)`**, not `execute(undefined)`. Don't destructure.
- **Output must be JSON-serializable** — except `ToModelOutput.MCP` understands a `Response` with binary `Content-Type` (image/audio) and emits the correct MCP block.
- **Schema quality drives tool quality.** Use `.describe()` on every Zod field. Tight enums beat free-form strings. Applies equally to `procedure()` schemas and `createTool.inputSchema`.
- **Tool name collisions clobber `toolsByName`.** Two tools with the same `name` produce a map with only the last one. Override with `@operation.tool({ name })` if module-prefixed defaults collide.
- **Local (`.fn()`) tools skip HTTP.** Auth decorators that read HTTP headers won't fire — use a shared service layer for auth logic that needs to run both via HTTP and via local tool calls.
- **Mixing `toModelOutput` settings is rarely useful.** All tools in one LLM turn should use the same formatter, otherwise the call site has to branch on tool identity.
- **`hidden: true` is the canonical exclusion knob** — filtered at derive time. `pick`/`omit` is for coarser per-call selection, not a substitute.
