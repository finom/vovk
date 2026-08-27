---
name: tools
description: Building LLM tools with Vovk.ts — `deriveTools()` (procedures → tools) returning a `StandardToolV0[]` array, standalone tools via the `standard-tool` package, `@operation.tool({ name, title, description, hidden, meta })` decorator, `x-tool` metadata, `ToModelOutput.DEFAULT` vs `ToModelOutput.MCP` formatters, the merged `inputSchema`, the `meta` option for passing context to procedures, `withDefaults` for baking auth into third-party API tools, and the `pick` / `omit` pattern for selecting specific procedures. Use whenever the user asks to expose an API to an LLM, wire up tool calling, build an MCP server, "let Claude / GPT call this", "turn my controllers into tools", "function calling with Vercel AI SDK", "standalone tool", "hide a procedure from the LLM", "tool that wraps a third-party SDK", or any variation. Does NOT cover procedure authoring → `procedure` skill. Does NOT cover the OpenAPI spec beyond `@operation`/`x-tool` → `openapi` skill. Does NOT cover third-party OpenAPI mixin setup → `mixins` skill.
---

# Vovk.ts LLM tools

**`deriveTools({ modules })`** turns existing procedures (controllers, RPC modules, OpenAPI mixins) into tools automatically. It returns an **array** of tools, each satisfying [`StandardToolV0`](https://standard-tool.js.org/) — `{ name, title?, description, inputSchema?, outputSchema?, execute }`.

Standalone tools (no procedure backing — SDK wrappers, calculators, file ops) are plain objects of the same shape; the `standard-tool` package's `standardTool()` helper adds input/output validation. Both mix freely in one array and feed to OpenAI / Anthropic / Vercel AI SDK / MCP servers.

> **v4 removed `createTool`, `VovkTool`, `parameters`, `type` and `inputSchemas`.** Tools are the standard-tool shape now: one merged `inputSchema` instead of `parameters` + `inputSchemas`, and `deriveTools` returns the array directly instead of `{ tools, toolsByName }`.

**Out of scope:** procedure authoring (**`procedure`**), `@operation` for OpenAPI docs (**`openapi`**), third-party OpenAPI mixin setup (**`mixins`**). MCP server transport / hosting outside Vovk; **for Next.js, recommended runtime is `mcp-handler` npm package** — example below.

> **Import path note.** Code samples import from `'@/client'`: the composed client generated into `src/client` (or `client/` without a `src` folder). Custom `composedClient.outDir` changes the path. With segmented client, import from `@/client/<segment>`. Call shape identical. See **`rpc`** skill.

## `deriveTools` — core shape

```ts
import { deriveTools } from 'vovk';
import { TaskRPC, PetstoreAPI } from '@/client';
import UserController from '@/modules/user/user-controller';

const tools = deriveTools({
  modules: { UserController, TaskRPC, PetstoreAPI },
});
```

`modules` accepts record of:

- **Controllers** — execute via `.fn()` in-process, no HTTP.
- **RPC modules** (from `@/client`, or `@/client/<segment>` for segmented layout) — execute via HTTP using standard fetcher.
- **OpenAPI mixins** (same client surface) — execute via HTTP against third-party API. See **`mixins`** skill.

Each module yields one tool per procedure with `@operation` schema, not `hidden`.

### Return shape

```ts
const tools = deriveTools({ modules: { TaskRPC } });   // StandardToolV0[]

// Need name-keyed dispatch? Build the map yourself — v4 dropped `toolsByName`.
const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
const result = await byName[call.name].execute(call.arguments);
```

### Each tool's fields

```ts
type StandardToolV0 = {
  name: string;                         // default: `${moduleName}_${handlerName}` — e.g. UserController_getUser
  title?: string;                       // from x-tool.title or operation.summary
  description: string;                  // x-tool.description, OR `${summary}\n${description}`, OR handlerName fallback
  inputSchema?: StandardSchemaV1 & StandardJSONSchemaV1;   // merged body/query/params, see below
  outputSchema?: StandardSchemaV1 & StandardJSONSchemaV1;  // procedure's output schema if declared
  meta?: Record<string, unknown>;       // verbatim from x-tool.meta — static data for consumers
  execute: (input, context?) => Promise<unknown>; // HTTP for RPC/mixins, .fn() for controllers
};
```

**`inputSchema` is one merged schema, nested not flat.** Each slot sits under its own key:

```ts
inputSchema['~standard'].jsonSchema.input({ target: 'draft-2020-12' })
// {
//   type: 'object',
//   properties: { body?: <body schema>, query?: <query schema>, params?: <params schema> },
//   required: [...],            // slots that exist in properties
//   additionalProperties: false,
// }
```

So `execute` is called as `tool.execute({ body, query, params })`, not `tool.execute({ ...flat })`.

It is simultaneously a **Standard Schema** (`~standard.validate`) and a **Standard JSON Schema** (`~standard.jsonSchema.input()`), so consumers take whichever they support without a conversion step.

**What its `validate` actually checks depends on the module kind:**

| Module kind | Slot schemas | `validate` behavior |
|---|---|---|
| Controllers / procedures | Your original Zod / Valibot / ArkType schemas | Envelope **and** slot values |
| RPC modules, OpenAPI mixins | Reconstructed from generated JSON Schema | **Envelope only** — required slots present, no unknown keys; values validated during execution |

Mixins therefore *do* produce usable tools including for MCP — see "Mixins and MCP" below.

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

Equivalent long form: `@operation({ ..., 'x-tool': { name, title, description, hidden, meta } })`. Keys (all optional):

| Key | Effect |
|---|---|
| `hidden: true` | Procedure excluded from `deriveTools` output. |
| `name` | Overrides default `ModuleName_handlerName`. |
| `title` | Optional title — used by MCP clients in tool-list UI. |
| `description` | Overrides `summary\ndescription` concatenation. |
| `meta` | Static `Record<string, unknown>` copied to `tool.meta` for consumers to read. Not sent to the model. |

Don't confuse `x-tool.meta` (static, per tool, ends up on `tool.meta`) with `deriveTools({ meta })` (runtime context handed to every procedure, readable via `req.vovk.meta()`).

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

const tools = deriveTools({
  modules: {
    PostRPC: pick(PostRPC, ['createPost', 'getPost']),
    UserController: omit(UserController, ['deleteUser']),
  },
});
```

## `meta` — pass context into procedures

`deriveTools({ meta })` flows into every tool execution. Controllers read via `req.vovk.meta()`; RPC modules send as `xMetaHeader` request header.

```ts
const tools = deriveTools({
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
import { GithubIssuesAPI } from '@/client';

const tools = deriveTools({
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

## Standalone tools

`createTool` was **removed in v4**. Since derived tools follow the standard-tool convention, a standalone tool is just an object of the same shape. Use `standardTool()` from the [`standard-tool`](https://www.npmjs.com/package/standard-tool) package to get input/output validation wrapped around `execute`:

```ts
import { standardTool } from 'standard-tool';
import { z } from 'zod';

const getWeather = standardTool({
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

`standard-tool` is a separate dependency (`npm i standard-tool`) — vovk vendors only the *type*, not the runtime helper. A plain object literal works equally well when you don't want validation.

### Fields

| Field | Purpose |
|---|---|
| `name` *(required)* | Tool name. |
| `description` *(required)* | Shown to LLM. Action-oriented language works best. |
| `title` | Optional human-readable label, used by MCP clients. |
| `inputSchema` | Standard Schema (Zod / Valibot / ArkType). Validated before `execute`. Omit for no-arg tools. |
| `outputSchema` | Validates `execute`'s return value. Optional, recommended. |
| `execute(input, meta?)` | Tool body. `input` is post-validation. |

**Error handling differs from v3's `createTool`.** `standardTool` **throws** `StandardToolValidationError` on a validation failure and lets `execute` errors propagate. To get the old "errors come back as data, never crash the chat loop" behavior, wrap at the consumer boundary:

```ts
import { withFormattedOutput } from 'standard-tool';

const safe = withFormattedOutput(getWeather); // failures return { error: string }
```

Derived tools keep their own error path: failures go to `deriveTools`' `onError` and are shaped by `toModelOutput`.

**Combine derived + standalone.** Same shape, same chat loop:

```ts
const tools = deriveTools({ modules: { TaskRPC } });
const allTools = [...tools, getWeather, sendEmail];
```

## `ToModelOutput` — format the result

`toModelOutput` controls what `execute` returns. Set on `deriveTools`; pick consistently across tools in one chat loop (standalone tools format their own output, so match them by hand).

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
import UserController from '@/modules/user/user-controller';

@prefix('ai-sdk')
export default class AiSdkController {
  @post('tools')
  static async functionCalling(req: VovkRequest<{ messages: UIMessage[] }>) {
    const { messages } = await req.json();
    const llmTools = deriveTools({ modules: { UserController } });

    const tools = Object.fromEntries(
      llmTools.map(({ name, execute, description, inputSchema }) => [
        name,
        tool({ execute: (input) => execute(input), description, inputSchema }),
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

**No adapter needed** — `inputSchema` is passed as is. The AI SDK supports Standard Schema and Standard JSON Schema natively and uses it for both argument validation and JSON Schema conversion. Don't reach for `jsonSchema(...)` here; that was the v3 shape.

### OpenAI / Anthropic function calling

These want raw JSON Schema, so ask the tool for it:

```ts
const tools = deriveTools({ modules: { TaskController } });
const byName = Object.fromEntries(tools.map((t) => [t.name, t]));

const asJSONSchema = (t) => t.inputSchema?.['~standard'].jsonSchema.input({ target: 'draft-2020-12' });

const resp = await client.chat.completions.create({
  model: 'gpt-5',
  messages,
  tools: tools.map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: asJSONSchema(t) },
  })),
});

for (const call of resp.choices[0].message.tool_calls ?? []) {
  const tool = byName[call.function.name];
  if (!tool) throw new Error(`Unknown tool: ${call.function.name}`);
  const result = await tool.execute(JSON.parse(call.function.arguments));
  // append result as a tool_result message and continue the loop
}
```

For Anthropic: `input_schema = asJSONSchema(t)`, otherwise identical.

The emitted JSON Schema carries vovk's own `x-` annotations (`x-tsType`, `x-contentType`). Providers ignore unknown keywords, but OpenAI **strict** function calling rejects them — strip the `x-*` keys if you enable strict mode.

### MCP servers via `mcp-handler` (recommended for Next.js)

Works for **every** module kind in v4 — controllers, RPC modules and OpenAPI mixins alike — because they all carry a merged `inputSchema`.

At the time of writing `mcp-handler` accepts Zod schemas only, so convert the tool's JSON Schema back to Zod and hand `registerTool` the object shape (its `body`/`query`/`params` slots):

```ts filename="src/app/api/mcp/route.ts"
import { createMcpHandler } from 'mcp-handler';
import { deriveTools, ToModelOutput } from 'vovk';
import { z } from 'zod';
import TaskController from '@/modules/task/task-controller';
import UserController from '@/modules/user/user-controller';

const tools = deriveTools({
  modules: { UserController, TaskController },
  toModelOutput: ToModelOutput.MCP,
  onExecute: (result, { name }) => console.log(`${name} executed`, result),
  onError: (e, { name }) => console.error(`Error in ${name}`, e),
});

const handler = createMcpHandler(
  (server) => {
    tools.forEach(({ title, name, execute, description, inputSchema }) => {
      const shape = inputSchema
        ? (z.fromJSONSchema(
            inputSchema['~standard'].jsonSchema.input({ target: 'draft-2020-12' }),
          ) as z.ZodObject).shape
        : {};
      server.registerTool(name, { title, description, inputSchema: shape }, execute);
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

Test locally with official MCP Inspector: `npx @modelcontextprotocol/inspector`. To mix derived + standalone MCP tools, register them inside the same `createMcpHandler` callback. For non-Next.js MCP runtimes, the same array drops into any SDK that accepts `ListTools` / `CallTool` handlers.

### Mixins and MCP

**No wrapper needed in v4.** Pass mixin modules straight to `deriveTools` alongside controllers:

```ts
import { deriveTools, ToModelOutput } from 'vovk';
import { PetstoreAPI } from '@/client';

const PetstoreAPIWithAuth = PetstoreAPI.withDefaults({
  init: { headers: { Authorization: `Bearer ${process.env.PETSTORE_TOKEN}` } },
});

const tools = deriveTools({
  modules: { PetstoreAPIWithAuth, UserController },
  toModelOutput: ToModelOutput.MCP,
});
```

Mixin-derived tools carry an `inputSchema` reconstructed from the OpenAPI-generated JSON Schema, so the `z.fromJSONSchema` conversion above works for them identically. The only difference is depth of validation: a mixin's `validate` checks the envelope and defers slot values to execution time (see the table under "Each tool's fields"), whereas a controller's checks values too.

> This replaces the v3 requirement to hand-write `createTool` wrappers for mixins — that advice, and `createTool` itself, are gone.

## Gotchas

- **No `@operation` → no tool.** `deriveTools` filters on `handler?.schema?.operationObject && !handler?.schema?.operationObject?.['x-tool']?.hidden`. Procedures without `@operation` skipped silently. Always annotate.
- **Default tool name `ModuleName_handlerName`.** Verbose but unique. Use `@operation.tool({ name: 'get_user_by_id' })` for cleaner LLM-facing name.
- **`inputSchema` nested, not flat.** `tool.execute({ body, query, params })`, not `tool.execute({ ...flat })`. LLM sees nested JSON Schema, constructs arguments accordingly.
- **A slot is required even when all its properties are optional.** A procedure with only optional query params still lists `query` in `required`, so the model must send `query: {}`. Mention it in the description if a model keeps omitting it.
- **`deriveTools` returns an array.** `const { tools } = deriveTools(...)` is the v3 shape and yields `undefined` in v4. Build a name map yourself if you need one.
- **`standardTool` throws on validation failure**, unlike v3's `createTool`, which swallowed errors into `{ error }`. Wrap with `withFormattedOutput` at the consumer boundary to restore that.
- **Output must be JSON-serializable** — except `ToModelOutput.MCP` understands `Response` with binary `Content-Type` (image/audio) and emits correct MCP block.
- **Schema quality drives tool quality.** Use `.describe()` on every Zod field. Tight enums beat free-form strings. Applies equally to `procedure()` schemas and standalone `inputSchema`.
- **Tool name collisions.** Two tools with the same `name` collide in whatever map you build and confuse the model. Override with `@operation.tool({ name })` if module-prefixed defaults collide.
- **Local (`.fn()`) tools skip HTTP.** Auth decorators reading HTTP headers won't fire — use shared service layer for auth logic running both via HTTP and via local tool calls.
- **Mixing `toModelOutput` settings rarely useful.** All tools in one LLM turn should use same formatter, else call site must branch on tool identity.
- **`hidden: true` is canonical exclusion knob** — filtered at derive time. `pick`/`omit` for coarser per-call selection, not substitute.
- **Emitted JSON Schema carries `x-tsType` / `x-contentType`.** Harmless for normal function calling; strip them for OpenAI strict mode.
