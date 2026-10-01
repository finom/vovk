# Define Once, Call Three Ways: Local Procedure Calls and Single Source of Truth in Vovk.ts

A Vovk.ts procedure starts as a validated function. You define a handler with a schema, and you can call it directly with `.fn` — no HTTP, no routing, just a function call with runtime validation. That's the base primitive.

Add `@get('{id}')` and `@prefix('users')`, and the same procedure is now also an HTTP endpoint with a generated type-safe client. Pass it to `deriveTools`, and it becomes an AI tool definition. The decorators are optional — they expand what the procedure can do without changing what it is. The local function call was always there.

This article walks through how that works, what it gives you in practice, and where the edges are.

## The pattern

A procedure in Vovk.ts is a validated handler attached to a controller class:

```ts
import { z } from 'zod';
import { procedure, prefix, get } from 'vovk';
import UserService from './UserService';

@prefix('users')
export default class UserController {
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.uuid() }),
    output: z.object({ id: z.uuid(), name: z.string() }),
  }).handle(async (req, { id }) => {
    return UserService.getUserById(id);
  });
}
```

This single definition produces three things:

### 1. An HTTP endpoint with a type-safe client

The Vovk.ts codegen reads the controller and emits a typed RPC client. Client code calls it like a function, but under the hood it's a `fetch` call to `/api/users/{id}`:

```ts
import { UserRPC } from 'vovk-client';

const user = await UserRPC.getUser({ params: { id: '123' } });
```

The Zod schemas also generate an OpenAPI spec, so the same endpoint is documented and available to third-party consumers.

### 2. A local procedure call (LPC) via `.fn`

Every procedure exposes an `fn` method that calls the handler directly — same validation, same decorators, no HTTP round-trip. It works anywhere on the server.

In a server component:

```tsx
import UserController from '@/modules/user/UserController';

export default async function UserPage() {
  const user = await UserController.getUser.fn({ params: { id: '123' } });
  return <p>{user.name}</p>;
}
```

In a server action with `useActionState`:

```ts
// actions.ts
'use server';
import UserController from '@/modules/user/UserController';

export async function createUserAction(_prevState: unknown, formData: FormData) {
  try {
    return { data: await UserController.createUser.fn({ body: formData }) };
  } catch (e) {
    return { error: String(e) };
  }
}
```

```tsx
// CreateUserPage.tsx
'use client';
import { useActionState } from 'react';
import { createUserAction } from './actions';

export default function CreateUserPage() {
  const [result, formAction, isPending] = useActionState(createUserAction, null);

  return (
    <form action={formAction}>
      <input name="name" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
      {result && 'error' in result && <p>{result.error}</p>}
    </form>
  );
}
```

The call signature mirrors the RPC client, so switching between local and remote execution is a one-line change.

### 3. An AI tool definition

The same procedure can be passed to `deriveTools`, which extracts the name, description, and parameter schema into a format compatible with LLM tool-calling APIs and MCP:

```ts
import { deriveTools } from 'vovk';

const { tools } = deriveTools({
  modules: { UserController },
});
// [{ name: 'UserController_getUser', description: '...', parameters: {...}, execute: fn }]
```

The `execute` function calls the procedure locally — no HTTP overhead, same validation.

## Why this matters

### No duplication, no drift

The traditional approach creates multiple representations of the same operation. An API route handler. A server-side data-fetching function. A server action wrapper. An AI tool schema. Each one can drift from the others — different validation rules, different error handling, different return types. Bugs that get fixed in one place don't get fixed in the others.

With Vovk.ts, there is exactly one procedure definition. The validation schema is the schema — for the HTTP endpoint, for the local call, for the AI tool. Change it once, and every consumer sees the update.

### The "validated service" escape hatch

You don't even need HTTP decorators. A procedure without `@get` or `@post` is just a validated function:

```ts
import { procedure } from 'vovk';

export default class UserProcedures {
  static updateUser = procedure({
    body: z.object({ name: z.string(), email: z.string().email() }),
    output: z.object({ id: z.string(), name: z.string() }),
  }).handle(({ vovk }) => {
    const body = await vovk.body();
    return UserService.updateUser(body);
  });
}
```

This is a standalone collection of validated functions — a "validated service." You can use it via `.fn` anywhere on the server. Later, if you need to expose it over HTTP, you attach it to a controller with one line:

```ts
@prefix('users')
export default class UserController {
  @post('{id}')
  static updateUser = UserProcedures.updateUser.bind(UserProcedures);
}
```

The procedure didn't change. You just gave it an HTTP address.

## Prior art

The idea of calling a server procedure locally isn't new — tRPC's `createCaller` lets you invoke procedures from server components without an HTTP round-trip. Vovk.ts builds on the same concept but extends the procedure further: the same definition also produces standard REST endpoints with OpenAPI specs and AI tool definitions via `deriveTools`. The local call is one of three outputs, not a separate utility.

## Honest caveats

**The abstraction has a small seam.** When a procedure is called via `.fn`, there is no real `Request` object. The `req` parameter exposes only the `vovk` property (`vovk.body()`, `vovk.query()`, `vovk.params()`, `vovk.meta()`). Properties like `req.url` and `req.headers` are `undefined`. This means you need to write handlers that use destructured `{ vovk }` access rather than relying on the full `NextRequest` API. You can detect the execution context by checking `req.url === undefined`, which works but is a pragmatic trade-off rather than a seamless abstraction.


## The bottom line

The Local Procedure Call pattern in Vovk.ts solves a real problem: the multiplication of representations for a single server-side operation. Define a procedure once with its validation schema, and you get an HTTP endpoint, a local function, and an AI tool — all type-safe, all validated, all from the same source.

No other framework I'm aware of unifies these three execution contexts from a single declaration. If you're building on Next.js and your project needs any two of {public API, server-side rendering, AI tool integration}, this pattern eliminates an entire category of duplication and drift.

[Read the full LPC documentation](https://vovk.dev/fn) | [Get started with Vovk.ts](https://vovk.dev/quick-install) | [GitHub](https://github.com/finom/vovk)
