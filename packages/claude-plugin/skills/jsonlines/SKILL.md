---
name: jsonlines
description: Vovk.ts JSON Lines streaming — generator handlers (`function*`, `async function*`), the `iteration` validation option, `validateEachIteration`, the `JSONLinesResponder` manual API, progressive responses via `progressive()`, consuming streams from the RPC client (async iteration, `using`, `asPromise`, `onIterate`, `abortController`), and `VovkIteration` / `VovkYieldType` inference. Use whenever the user asks to stream data ("stream tokens", "SSE-like streaming", "server-sent events", "progressive response", "poll in a loop", "yield results as they arrive", "chat completion streaming", "JSON Lines", "JSONL", "async generator endpoint", "incremental response", "push updates to the client"). Does NOT cover procedure basics → hand off to `procedure` skill. Does NOT cover RPC client setup / `vovk generate` → hand off to `rpc` skill. Does NOT cover WebSockets / bidirectional realtime — that's outside Vovk's scope.
---

# Vovk.ts JSON Lines streaming

JSON Lines is Vovk's streaming model: the server yields one JSON object per line, the client consumes them as an async iterable. Works for chat completions, progress updates, long-running jobs, and anything where data arrives over time.

Two authoring styles:

- **Generator handlers** — `function*` / `async function*` with `yield`. The common case.
- **`JSONLinesResponder`** — low-level manual `send` / `close` / `throw`. For orchestration, fan-in, or when the stream shape doesn't fit a generator.

## Scope

Covers:

- Generator handler syntax (`function*`, `async function*`, `yield*`).
- `procedure({ iteration, validateEachIteration })` for per-item schema validation.
- `JSONLinesResponder` class — `send`, `close`, `throw`, properties.
- Client consumption — `for await`, `using`, `asPromise`, `onIterate`, `abortController`, `abortSilently`.
- `progressive()` utility for multi-shape progressive responses.
- `VovkIteration` and `VovkYieldType` type helpers.
- `Accept: application/jsonl` behavior.
- Real-world patterns (OpenAI chat streaming, polling, multi-promise fan-in).

Out of scope:

- Writing non-streaming procedures → **`procedure` skill**.
- Client generation / `vovk-client` setup → **`rpc` skill**.
- Generator basics (JavaScript language) — assume the reader knows them.

## Generator handler

The simplest streaming handler: an `async function*` that yields objects. Each yield becomes one JSON line on the wire.

```ts
import { post, procedure, operation } from 'vovk';
import { z } from 'zod';

export default class StreamController {
  @operation({ summary: 'Stream messages' })
  @post('completions')
  static getJSONLines = procedure({
    iteration: z.object({ message: z.string() }),
  }).handle(async function* () {
    yield { message: 'Hello,' };
    yield { message: ' World' };
  });
}
```

**`iteration`**: validation schema for each yielded object. Plays the same role `output` plays for non-streaming procedures.

### Delegating to a service with `yield*`

Keep controller thin, let the service do the work:

```ts
static getJSONLines = procedure({
  iteration: z.object({ message: z.string() }),
}).handle(function* () {
  yield* StreamService.getJSONLines();
});
```

### Validation cadence

By default, **only the first yielded item is validated** — cheap, catches shape bugs early. Opt into every-iteration validation when the shape varies:

```ts
procedure({
  iteration: z.union([
    z.strictObject({ users: z.array(UserSchema) }),
    z.strictObject({ tasks: z.array(TaskSchema) }),
  ]),
  validateEachIteration: true,
})
```

Use sparingly — every-item validation adds per-yield cost.

## `JSONLinesResponder` — manual control

For cases the generator shape can't express: fan-in from multiple concurrent sources, conditional close, error signaling outside the generator protocol. Still a `procedure` — the handler is a plain `async` function that builds a responder, kicks off the producer, and returns the responder. When `iteration` is defined, Vovk wires `responder.onBeforeSend` automatically so every `send()` runs through the same schema (and same `validateEachIteration` rules) as a generator handler.

```ts
import { JSONLinesResponder, procedure, get } from 'vovk';
import { z } from 'zod';

class StreamController {
  @get('tokens')
  static streamTokens = procedure({
    iteration: z.object({ message: z.string() }),
  }).handle(async (req) => {
    const responder = new JSONLinesResponder<{ message: string }>(req);
    void StreamService.streamTokens(responder);
    return responder;
  });
}
```

The handler returns synchronously; the service runs as a floating promise (`void ...`) and feeds the responder over time. Don't `await` the service — that would block the response.

**Constructor**:

```ts
new JSONLinesResponder<T>(
  request?: Request | null,              // checks Accept: application/jsonl
  getResponse?: (responder) => Response, // custom Response builder
);
```

**Methods**:

| Method | Purpose |
|---|---|
| `send(item: T): Promise<void>` | Serialize + send one JSON line. Validates per `validateEachIteration`. |
| `close(): void` | End the stream. |
| `throw(err: Error): void` | Send error frame + close. |

**Properties**: `response`, `headers`, `readableStream`.

### Service-owned streaming

Let the service accept the responder and orchestrate:

```ts
export default class StreamService {
  static async streamTokens(responder: JSONLinesResponder<Token>) {
    const tokens = [{ message: 'Hello,' }, { message: ' World' }];
    for (const t of tokens) await responder.send(t);
    responder.close();
  }
}
```

The controller returns the responder immediately; the service populates it via a floating promise (`void service.run(responder)`).

## Client consumption

The generated RPC method returns an async iterable.

### Basic iteration

```ts
import { StreamRPC } from 'vovk-client';

using stream = await StreamRPC.getJSONLines();

for await (const { message } of stream) {
  console.log(message);
}
```

`using` triggers `Symbol.asyncDispose` → calls `abortSilently('Stream async disposed')` on scope exit (error, break, function return). Safer than plain `const`.

### Stream object API

The returned value is a `VovkStreamAsyncIterable<T>` (from `vovk`) — an async iterable plus:

```ts
type VovkStreamAsyncIterable<T> = AsyncIterable<T> & {
  status: number;                                       // HTTP status
  asPromise(): Promise<T[]>;                            // collect all items
  onIterate(cb: (item: T, i: number) => void): () => void; // returns unsubscribe
  abortController: AbortController;                     // programmatic abort — throws AbortError on the reader
  abortSilently(reason?: unknown): void;                // close without throwing
  [Symbol.dispose](): void;
  [Symbol.asyncDispose](): Promise<void>;
};
```

`abortController.abort()` throws an `AbortError` on the consumer (catchable via `error.cause`); `abortSilently()` tears the stream down without throwing. Pick deliberately.

### Common patterns

**Collect all at once:**

```ts
const items = await (await StreamRPC.getJSONLines()).asPromise();
```

**Observe without consuming:**

```ts
using stream = await StreamRPC.getJSONLines();
stream.onIterate((item) => console.log(item));
await stream.asPromise();
```

**Abort mid-stream:**

```ts
using stream = await StreamRPC.getJSONLines();
for await (const item of stream) {
  if (someCondition(item)) stream.abortSilently();
}
```

## Progressive responses

Multi-shape stream where different lines populate different promises. Use when a single request produces several distinct payloads (users, tasks, summary) in parallel. **Experimental** — API may change.

**Client:**

```ts
import { progressive } from 'vovk';

const { users, tasks } = progressive(
  ProgressiveRPC.streamProgressiveResponse,
  { params: { id: '123' } },
);

users.then(console.log);
tasks.then(console.log);
```

`progressive()` returns a proxy — each property access creates a promise that resolves when a matching JSON line arrives.

**Server** — controller declares the iteration union and builds the responder; service orchestrates fan-in. Every line has its own shape, so turn on `validateEachIteration`:

```ts
// ProgressiveController.ts
@get('/')
static streamProgressiveResponse = procedure({
  iteration: z.union([
    z.strictObject({ users: z.array(UserSchema) }),
    z.strictObject({ tasks: z.array(TaskSchema) }),
  ]),
  validateEachIteration: true,
}).handle(async (req) => {
  const responder = new JSONLinesResponder<Iter>(req);
  void ProgressiveService.streamProgressiveResponse(responder);
  return responder;
});

// ProgressiveService.ts — no req, just the sink
static streamProgressiveResponse(responder: JSONLinesResponder<Iter>) {
  return Promise.all([
    ProgressiveService.getUsers().then((users) => responder.send({ users })),
    ProgressiveService.getTasks().then((tasks) => responder.send({ tasks })),
  ])
    .then(() => responder.close())
    .catch((e) => responder.throw(e));
}
```

## Type inference

```ts
import type { VovkIteration, VovkYieldType } from 'vovk';

// From iteration schema:
type Item = VovkIteration<typeof StreamRPC.getJSONLines>;

// From generator return type (when no iteration schema):
type Yield = VovkYieldType<typeof StreamController.streamItems>;
```

Use `VovkIteration` when an `iteration` schema exists (preferred). `VovkYieldType` infers from the handler's actual yield type when no schema is declared.

## Content negotiation

- `Accept: application/jsonl` → response `Content-Type: application/jsonl`.
- Otherwise → `Content-Type: text/plain` (browser-viewable during debugging).

JSON Lines responses **bypass compression** (Gzip/Brotli) — size is unknown, streaming matters more than size. For large streams, factor bandwidth into design.

## Real-world example: OpenAI chat completion

Controller does thin pre-calc (validated body → plain values), the service owns the OpenAI call and `yield*`s its stream:

```ts
// ChatController.ts
@post('chat')
static createChatCompletion = procedure({
  body: z.object({ messages: z.array(MessageSchema) }),
  iteration: ChatChunkSchema,
}).handle(async function* ({ vovk }) {
  const { messages } = await vovk.body();
  yield* ChatService.streamCompletion({ messages });
});

// ChatService.ts — no req, no VovkRequest
export default class ChatService {
  static async *streamCompletion({ messages }: { messages: Message[] }) {
    const openai = new OpenAI();
    yield* await openai.chat.completions.create({ messages, model: 'gpt-5.5', stream: true });
  }
}
```

```ts
// Client
using completion = await ChatRPC.createChatCompletion({ body: { messages } });
for await (const part of completion) {
  process.stdout.write(part.choices[0]?.delta?.content ?? '');
}
```

## Flows

### "Stream GPT tokens to the browser"

Generator handler yielding OpenAI chunks → client `for await`. See example above.

### "Long-running job with progress + final result"

Server yields progress shapes then a terminal `done` shape carrying the result; client iterates until it sees the terminal one. This is what people usually mean by "poll until done" — the server pushes, the client just reads until the terminal line:

```ts
// Server
@post('import')
static runImport = procedure({
  iteration: z.discriminatedUnion('status', [
    z.object({ status: z.literal('progress'), percent: z.number() }),
    z.object({ status: z.literal('done'), result: z.string() }),
  ]),
  validateEachIteration: true,
}).handle(async function* () {
  for (let i = 10; i < 100; i += 10) {
    await importStep(i);
    yield { status: 'progress', percent: i } as const;
  }
  yield { status: 'done', result: await finalize() } as const;
});

// Client
using stream = await ImportRPC.runImport();
for await (const update of stream) {
  if (update.status === 'done') return update.result;
  renderBar(update.percent);
}
```

### "Infinite polling / reconnect ticker"

For connections that outlast what proxies or load-balancers tolerate, or when you want bounded per-connection cost: server streams a short run, then closes at a natural boundary; client wraps the call in `while(true)` and resumes with the last cursor. JSON Lines is the primitive, `while` on both sides does the work.

```ts
// Server — yield until a break point, then let the stream end
static streamPoll = procedure({
  query: z.object({ i: z.string() }),
  iteration: z.object({ i: z.number() }),
}).handle(async function* (req) {
  let i = parseInt(req.vovk.query().i, 10);
  while (true) {
    yield { i: ++i };
    await new Promise((r) => setTimeout(r, 1000));
    if (!(i % 10)) break; // natural reconnect point
  }
});

// Client — reconnect forever, passing the last cursor back in
let i = 0;
while (true) {
  using iterable = await PollRPC.streamPoll({ query: { i: i.toString() } });
  for await ({ i } of iterable) render(i);
}
```

### "Dashboard: users and tasks load in parallel, render each as it arrives"

`progressive()` pattern — server fires both fetches concurrently, sends each result when ready; client awaits each property independently and renders piecewise.

### "Cancel the stream when the user navigates away"

```ts
using stream = await StreamRPC.getJSONLines();
controller.signal.addEventListener('abort', () => stream.abortSilently());
```

## Gotchas

- **Only the first iteration is validated by default**. Turn on `validateEachIteration: true` for variable-shape streams, or accept that later items bypass schema enforcement.
- **`using` matters**. Without it, `abortSilently` isn't called on early exit, and the server can keep pushing into a dropped connection.
- **`asPromise()` vs `for await`**: `asPromise` is simpler but buffers everything. Use `for await` (or `onIterate`) to process items as they stream.
- **No compression**. JSON Lines skips Gzip/Brotli. For large payloads, design accordingly.
- **`yield*` with a service generator**: types must line up. If the service's yield type doesn't match the `iteration` schema, first-item validation catches it.
- **`JSONLinesResponder` requires manual `close`**. Forgetting it leaves the client hanging.
- **Error mid-stream**: use `responder.throw(err)` or throw from within the generator. Bare unhandled rejections just hang the connection.
- **`VovkYieldType` is brittle for self-referential service methods** — explicit return types on the service method help.
