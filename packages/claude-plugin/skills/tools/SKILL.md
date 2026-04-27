---
name: tools
description: Building LLM tools with Vovk.ts — `deriveTools()` (procedures → tools), `createTool()` (standalone tools, no controller/procedure needed), `@operation.tool({ name, title, description, hidden })` decorator, `x-tool` metadata, `ToModelOutput.DEFAULT` vs `ToModelOutput.MCP` formatters, the `tools` + `toolsByName` return shape, the `meta` option for passing context to procedures, `withDefaults` for baking auth into third-party API tools, and the `pick` / `omit` pattern for selecting specific procedures. Use whenever the user asks to expose an API to an LLM, wire up tool calling, build an MCP server, "let Claude / GPT call this", "turn my controllers into tools", "function calling with Vercel AI SDK", "createTool", "standalone tool", "hide a procedure from the LLM", "tool that wraps a third-party SDK", or any variation. Does NOT cover procedure authoring → `procedure` skill. Does NOT cover the OpenAPI spec beyond `@operation`/`x-tool` → `openapi` skill. Does NOT cover third-party OpenAPI mixin setup → `mixins` skill.
---

# Vovk.ts LLM tools

Vovk produces LLM-consumable tool definitions — `{ name, description, parameters, execute, … }` — via two entry points:

- **`deriveTools({ modules })`** — turn existing procedures (controllers, RPC modules, OpenAPI mixins) into tools auto.
- **`createTool({ name, description, inputSchema?, outputSchema?, execute, … })`** — hand-build standalone tool, no procedure backing. Use when body is plain code (SDK wrappers, calculators, file ops).

Both shapes interoperable — mix in one array, feed to OpenAI / Anthropic / Vercel AI SDK / MCP servers.

**Out of scope:** procedure authoring (**`procedure`**), `@operation` for OpenAPI docs (**`openapi`**), third-party OpenAPI mixin setup (**`mixins`**). MCP server transport / hosting outside Vovk; **for Next.js, recommended runtime is `mcp-handler` npm package** — example below.

> **Import path note.** Code samples import from `'vovk-client'` — **composed client + `js` template** default, re-exported from `node_modules/.vovk-client`. With `ts` template, import from `composedClient.outDir` (e.g. `@/client`). With segmented client, import from `@/client/<segment>`. Call shape identical. See **`rpc`** skill.

## `deriveTools` — core shape

```ts
import { deriveTools } from 'vovk';
import { TaskRPC, PetstoreAPI } from 'vovk-client';
import UserController from '@/modules/user/UserController';

const { tools, toolsByName } = deriveTools({
  modules: { UserController, TaskRPC, PetstoreAPI },
});
```

`modules` accepts record of:

- **Controllers** — execute via `.fn()` in-process, no HTTP.
- **RPC modules** (from `vovk-client` or `@/client[/segment]` per layout) — execute via HTTP using standard fetcher.
- **OpenAPI mixins** (same client surface) — execute via HTTP against third-party API. See **`mixins`** skill.

Each module yields one tool per procedure with `@operation` schema, not `hidden`.

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

**`parameters` nested, not flat.** Each procedure schema sits under own key:

```ts
parameters: {
  type: 'object',
  properties: { body?: <body schema>, query?: <query schema>, params?: <params schema> },
  required: ['body', 'query', ...], // keys that exist in properties
  additionalProperties: false,
}
```

So `execute` called as `tool.execute({ body, query, params })`, not `tool.execute({ ...flat })`.

## Customizing tool name + description

Default `name = ${ModuleName}_${handlerName}`, default `description = ${summary}\n${description}` from `@operation`. Override via `@operation.tool({ … })` (recommended cleaner form):

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
| `hidden: true` | Procedure excluded from `deriveTools` output. |
| `name` | Overrides default `ModuleName_handlerName`. |
| `title` | Optional title — used by MCP clients in tool-list UI. |
| `description` | Overrides `summary\ndescription` concatenation. |

## Hide procedures

Canonical: `hidden: true`.

```ts
@operation.tool({ hidden: true })
@operation({ summary: 'Internal helper' })
@get()
static internalDebug = procedure({ /* ... */ });
```

For coarser selection — when same controller serves both REST and tool-exposed callers, don't want to annotate every method — use `pick`/`omit` from lodash:

```ts
import { pick, omit } from 'lodash';

const { tools } = deriveTools({
  modules: {
    PostRPC: pick(PostRPC, ['createPost', 'getPost']),
    UserController: omit(UserController, ['deleteUser']),
  },
});
```

## `meta` — pass context into procedures

`deriveTools({ meta })` flows into every tool execution. Controllers read via `req.vovk.meta()`; RPC modules send as `xMetaHeader` request header.

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

Use for ambient context (tenant, actor, request ID) that applies to every LLM-triggered call without surfacing to LLM as tool argument.

## Authorize third-party API tools

Mixin modules carry `withDefaults({ init?, apiRoot? })` method returning pre-configured copy. Wrap before passing to `deriveTools` to bake auth headers without leaking secrets to LLM:

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

LLM sees `AuthorizedGithubIssuesAPI_listForOrg` etc. with operation parameters — never token. See **`mixins`** for `withDefaults` setup details.

## `createTool` — standalone tools

For tools with no procedure backing — SDK wrappers, calculators, file ops, plain code:

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
| `description` *(required)* | Shown to LLM. Action-oriented language works best. |
| `title` | Optional human-readable label, used by MCP clients. |
| `inputSchema` | Standard Schema (Zod / Valibot / ArkType). Validated before `execute`. Becomes JSON Schema. Omit for no-arg tools. |
| `outputSchema` | Validates `execute`'s return value. Optional, recommended. |
| `execute(input, processingMeta?)` | Tool body. `input` post-validation. |
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

**Error handling.** Errors from `execute`, input validation, or output validation caught (never re-thrown), monkey-patched with `toJSON() = { isError, message }`, then handed to `toModelOutput`:

- `ToModelOutput.DEFAULT` → `{ error: string }`
- `ToModelOutput.MCP` → `{ content: [{ type: 'text', text: message }], isError: true }`

`onError` fires on error path. Tool never crashes chat loop — LLM can retry.

**Combine derived + standalone.** Same shape, same chat loop:

```ts
const { tools: derived, toolsByName: derivedByName } = deriveTools({ modules: { TaskRPC } });
const allTools = [...derived, getWeather, sendEmail];
const allByName = { ...derivedByName, [getWeather.name]: getWeather, [sendEmail.name]: sendEmail };
```

## `ToModelOutput` — format the result

`toModelOutput` controls what `execute` returns. Set on `deriveTools` and/or `createTool`; pick consistently across tools in one chat loop.

| Formatter | Output shape | Use for |
|---|---|---|
| `ToModelOutput.DEFAULT` | Raw result, or `{ error: string }` on failure. | OpenAI / Anthropic function calling, Vercel AI SDK. |
| `ToModelOutput.MCP` | `{ content: [{ type: 'text' \| 'image' \| 'audio', … }], structuredContent?, isError? }`. Detects `Response` objects with binary content types and emits correct MCP block. | MCP servers. |

Custom formatters: write function matching `ToModelOutputFn<TInput, TOutput, TFormattedOutput>`.

### Return binary / file content via `Response` (MCP)

When `ToModelOutput.MCP` active, returning `Response` from procedure auto-converts based on `Content-Type` header:

| `Content-Type` | MCP block |
|---|---|
| `image/*` | `{ type: 'image', mimeType, data: <base64> }` |
| `audio/*` | `{ type: 'audio', mimeType, data: <base64> }` |
| `application/json` | `{ type: 'text', text: <stringified> }` + `structuredContent` from parsed JSON |
| `text/*`, `application/xml`, `application/javascript`, `application/yaml` | `{ type: 'text', text }` |
| anything else | `isError: true` with "Unsupported response content type" message |

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

JSON `Response`s yield both `content[0].text` (stringified) and `structuredContent` (parsed). Plain object returns also produce `structuredContent` from object directly — return whichever more natural.

### Per-call MCP overrides — divergent HTTP and MCP responses

MCP formatter shallow-merges anything set under `vovk.meta({ mcpOutput })` *over* auto-generated output (`mcpOutputMeta` spreads last → its keys win). Whatever procedure returns still becomes HTTP response unchanged — override only affects MCP-formatted payload. **One procedure can serve HTTP callers and MCP/LLM callers with completely different shapes**, sharing only operation logic.

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

- **JSON for HTTP, prose for LLM** — REST/UI clients get structured data; model gets digest it can reason about without drowning in JSON.
- **Render server-side, ship image** — return JSON to HTTP, override `content` with MCP `image` block → LLM sees chart instead of numbers.
- **Soft-fail surfacing** — return normal payload (200 OK), set `isError: true` in `mcpOutput` → MCP client treats as error.
- **Audience routing** — `annotations.audience: ['user']` exposes result in MCP client UI; `['assistant']` keeps model-only.

Override keys (all optional, all merged shallowly):

| Key | Effect |
|---|---|
| `content: [...]` | Wholesale-replaces auto-generated content array. |
| `structuredContent` | Wholesale-replaces parsed structured payload. |
| `isError: true` | Marks result as error to MCP client. |
| `annotations.audience` | `('user' \| 'assistant')[]` — who should see result. |
| `annotations.priority` | Number, relative importance hint. |
| `annotations.lastModified` | ISO timestamp. |

## Wire into LLM SDKs

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

Key adapter is `jsonSchema(parameters)` — Vercel's `tool()` wants own typed schema, our `parameters` already JSON Schema → wrap.

### OpenAI / Anthropic function calling

`parameters` already JSON Schema → pass directly:

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

Pattern works for **procedure-backed controllers** (each handler produced by `procedure({...}).handle(...)` carries `.definition` field). Does **not** work for mixin-backed RPC modules — mixins go through `createRPC` and don't carry `definition` → `inputSchemas` come back empty `{}` → LLM has no input shape. For mixins, hand-write `createTool({...})` wrappers (snippet in "Mixins → MCP" below).

Each Vovk tool's `inputSchemas` field (per-key Standard Schemas for `body` / `query` / `params`) plugs directly into `server.registerTool`'s `inputSchema` arg:

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

**Demo-grade gating with query-string key.** MCP clients like Claude Desktop connect to remote MCP server by URL but don't run full OAuth flow out of box. For getting a Vovk-backed MCP server in front of real client *quickly* — local testing, throwaway demos, sharing personal endpoint with one collaborator — wrap with shared-secret check:

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

> **Not production auth.** Query-string secret leaks into browser history, server logs, proxy logs, bookmarks; identical for every caller. For anything user-facing or multi-tenant, use real OAuth / session cookies / header-based middleware in front of MCP route. Pattern above exists because shortest path to "Claude can talk to my server right now."

Test locally with official MCP Inspector: `npx @modelcontextprotocol/inspector`. To mix derived + standalone MCP tools, set `toModelOutput: ToModelOutput.MCP` on `createTool` too and register inside same `createMcpHandler` callback. For non-Next.js MCP runtimes, same `tools` + `toolsByName` pair drops into any SDK that accepts `ListTools` / `CallTool` handlers.

### Mixins → MCP — wrap with `createTool`

Wrap required **only for MCP**, not general LLM tool exposure. `deriveTools` reads each handler's `.definition` field for `inputSchemas` (Standard Schemas), which only exists on procedure-backed controllers (set by `procedure({...}).handle(...)` in `withValidationLibrary.ts`). Mixin RPC modules come from `createRPC` and don't carry that — passing directly to `deriveTools` yields tools with empty `inputSchemas`, unusable for `mcp-handler`. Function-calling paths (OpenAI / Anthropic / Vercel) work fine — they read `parameters` (JSON Schema), populated from mixin's `schema.validation`. For MCP, wrap each mixin call in `createTool` instead:

```ts
import { createTool, ToModelOutput } from 'vovk';
import { z } from 'zod';
import { PetstoreAPI } from 'vovk-client';

const PetstoreAPIWithAuth = PetstoreAPI.withDefaults({
  init: { headers: { Authorization: `Bearer ${process.env.PETSTORE_TOKEN}` } },
});

export const findPetsByStatusTool = createTool({
  name: 'petstore_find_pets_by_status',
  title: 'Find Petstore pets by status',
  description: 'Look up pets by lifecycle status: available, pending, or sold.',
  inputSchema: z.object({
    status: z.enum(['available', 'pending', 'sold']),
  }),
  toModelOutput: ToModelOutput.MCP,
  execute: async ({ status }) => {
    return await PetstoreAPIWithAuth.findPetsByStatus({ query: { status } });
  },
});
```

You write input schema by hand (Zod / Valibot / ArkType) — cost of going through `createTool` instead of `deriveTools`. Mixin still gives typed call shape and OpenAPI-derived response types via `VovkOutput<typeof PetstoreAPI.findPetsByStatus>`, so input is only manual piece.

## Gotchas

- **No `@operation` → no tool.** `deriveTools` filters on `handler?.schema?.operationObject && !handler?.schema?.operationObject?.['x-tool']?.hidden`. Procedures without `@operation` skipped silently. Always annotate.
- **Default tool name `ModuleName_handlerName`.** Verbose but unique. Use `@operation.tool({ name: 'get_user_by_id' })` for cleaner LLM-facing name.
- **`parameters` nested, not flat.** `tool.execute({ body, query, params })`, not `tool.execute({ ...flat })`. LLM sees nested JSON Schema, constructs arguments accordingly.
- **`createTool` errors don't throw**; land as `{ error }` (DEFAULT) or `{ content, isError: true }` (MCP). By design — LLM can recover. Use `onError` for side-channel logs.
- **`createTool` with no `inputSchema` calls `execute(null)`**, not `execute(undefined)`. Don't destructure.
- **Output must be JSON-serializable** — except `ToModelOutput.MCP` understands `Response` with binary `Content-Type` (image/audio) and emits correct MCP block.
- **Schema quality drives tool quality.** Use `.describe()` on every Zod field. Tight enums beat free-form strings. Applies equally to `procedure()` schemas and `createTool.inputSchema`.
- **Tool name collisions clobber `toolsByName`.** Two tools with same `name` produce map with only last one. Override with `@operation.tool({ name })` if module-prefixed defaults collide.
- **Local (`.fn()`) tools skip HTTP.** Auth decorators reading HTTP headers won't fire — use shared service layer for auth logic running both via HTTP and via local tool calls.
- **Mixing `toModelOutput` settings rarely useful.** All tools in one LLM turn should use same formatter, else call site must branch on tool identity.
- **`hidden: true` is canonical exclusion knob** — filtered at derive time. `pick`/`omit` for coarser per-call selection, not substitute.
- **Mixins + `deriveTools` + `mcp-handler`: `inputSchemas` come back empty for mixin-backed modules** — `mcp-handler` needs Standard Schemas, mixins only carry JSON Schema in `parameters`. For MCP servers exposing mixin endpoints, wrap calls in `createTool` (see "Mixins → MCP — wrap with `createTool`" above). Function-calling paths (OpenAI / Anthropic / Vercel) work fine — they read `parameters`, not `inputSchemas`.
