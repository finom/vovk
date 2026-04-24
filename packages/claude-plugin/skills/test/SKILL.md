---
name: test
description: Testing Vovk.ts code — procedures (via `.fn()`), services (plain classes), and HTTP integration (via the generated `vovk-client` RPC client). Use whenever the user asks to test, add test coverage, write a spec, verify behavior, or unit-test / integration-test a procedure, controller, service, endpoint, or RPC call — phrases like "test this procedure", "add tests for the user module", "write a spec for getUser", "cover this with integration tests", "test validation", "test the error path". Covers three test styles keyed to the Vovk architecture: `.fn()` for procedures (works regardless of HTTP decorator), plain-class tests for services, HTTP-over-`vovk-client` for end-to-end. Defaults to `node --test` + `node:assert` (no extra deps, matches what the Vovk repo itself uses) but honors an existing Vitest/Jest setup. Does NOT write procedures or services — hand off to `procedure` skill. Does NOT wire up the RPC client — hand off to `rpc` skill. Does NOT cover JSON Lines stream testing beyond mentioning the seam — hand off to `jsonlines` skill when depth is needed.
---

# Vovk.ts testing

Vovk's architecture gives you three natural test seams. Each answers a different question, and a healthy project uses them together:

| Seam | Tests via | What it verifies |
|---|---|---|
| **Procedure** | `.fn({ params, body, query, meta })` | Handler logic + validation, without HTTP. Works for every procedure — HTTP decorator or not. |
| **Service** | plain class/function calls | Business logic. No Vovk machinery involved. |
| **HTTP integration** | `UserRPC.method({ apiRoot, params, body, query })` via `vovk-client` | Routing, decorators, middleware, status codes, content negotiation, the generated client — the whole chain. Only works for procedures with an HTTP decorator. |

**Rule of thumb:** push logic into services and test them as plain classes (fastest, cheapest). Use `.fn()` tests for procedure-level concerns: validation boundaries, error translation, meta handling. Keep HTTP integration tests thin — smoke coverage on the wire, not a replacement for unit tests.

## Scope of this skill

Covers:

- Test-runner choice (`node --test` default, honor existing Vitest/Jest).
- File layout + naming conventions.
- `.fn()` unit tests — input shape, validation assertions, error-path assertions.
- Plain-class service tests.
- HTTP integration tests via `vovk-client`.
- Running the tests, integrating with a dev server.

Out of scope:

- Writing the procedures / services under test → **`procedure` skill**.
- Generating / configuring `vovk-client` → **`rpc` skill**.
- Testing JSON Lines streams / iteration assertions → mentioned below; depth in **`jsonlines` skill**.
- Mocking databases / external services — project-specific; follow whatever pattern the repo uses.

## Decide the style

**When the user says...**

| Intent | Style |
|---|---|
| "test this procedure", "test the handler", "test validation", "test without the server" | **Procedure (`.fn()`)** |
| "test the service", "test the business logic", "unit-test `UserService`" | **Service (plain class)** |
| "integration test", "end-to-end", "hit the API", "test the RPC client", "test over HTTP" | **HTTP integration (`vovk-client`)** |
| "test the whole user module" / ambiguous | Propose a mix — one service test for logic, one `.fn()` test for the procedure contract, optionally one HTTP test for the happy path. Ask before writing more than ~3 files at once. |
| "test a procedure without any HTTP decorator" | **`.fn()` only** — there's no HTTP surface to integration-test. |

## Pick a test runner

Scan `package.json` **before writing anything**:

1. If `scripts.test` runs Vitest / Jest / Mocha / Ava / `node --test` → **use that**. Match existing assertion library and file-naming conventions.
2. If no test setup exists → propose **`node --test`** with `--experimental-strip-types` + `node:assert`. Zero dependencies, runs `.ts` natively on Node 22+, matches what the Vovk repo uses.

Do not silently pull in Vitest/Jest when the project has neither. Ask first.

### `node --test` boilerplate

Colocate tests next to the file under test, suffix `.test.ts`:

```ts
import { describe, it } from 'node:test';
import { strictEqual, deepStrictEqual, rejects } from 'node:assert';
```

Add to `package.json` `scripts` if absent:

```json
{
  "scripts": {
    "test": "node --experimental-strip-types --test --test-concurrency=1 './src/**/*.test.ts'"
  }
}
```

`--test-concurrency=1` matters when integration tests share a dev server. Drop it for a pure unit-test script.

If the project already has the `vovk dev` / `prebuild` setup from `vovk init`, just add the `test` script — don't touch the others.

## Style A — procedure test via `.fn()`

Works for **any procedure**, whether or not it has an HTTP decorator. That's the point: a procedure is the atom of logic, and `.fn()` is its direct call path.

Given a procedure:

```ts
// src/modules/user/UserController.ts
import { procedure, get, prefix } from 'vovk';
import { z } from 'zod';
import UserService from './UserService';

@prefix('users')
export default class UserController {
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.string() }),
    output: z.object({ id: z.string(), name: z.string() }),
  }).handle(async ({ vovk }) => {
    const { id } = vovk.params();
    return UserService.getUser(id);
  });
}
```

Test:

```ts
// src/modules/user/UserController.test.ts
import { describe, it } from 'node:test';
import { deepStrictEqual, rejects } from 'node:assert';
import UserController from './UserController.ts';

describe('UserController.getUser', () => {
  it('returns the user', async () => {
    const user = await UserController.getUser.fn({
      params: { id: '42' },
    });
    deepStrictEqual(user, { id: '42', name: 'Ada' });
  });

  it('rejects invalid params (validation runs by default)', async () => {
    await rejects(
      () => UserController.getUser.fn({
        params: { id: 42 as unknown as string },
      }),
      /params/i,
    );
  });
});
```

### `.fn()` input shape

Pass only what the procedure declares plus optionally `meta`:

```ts
await Controller.method.fn({
  params?: { ... },
  body?: { ... } | FormData | string | File | ...,  // matches contentType
  query?: { ... },
  meta?: { ... },
  disableClientValidation?: boolean,  // default false — skips validation
});
```

### Validation in `.fn()`

- **Runs by default** — the same schemas as the HTTP path. This is what makes `.fn()` tests meaningful for validation coverage.
- Pass `disableClientValidation: true` to skip it. Use for testing the handler logic in isolation, not for routine test data.
- Output validation (`output` schema) also runs — a handler returning the wrong shape throws in the test.

### Procedures without an HTTP decorator

No change. `.fn()` works identically:

```ts
class UserController {
  // no @get/@post — this procedure is only called via .fn()
  static listInternal = procedure({
    output: z.array(z.object({ id: z.string() })),
  }).handle(async () => UserService.listAll());
}

// Test it the same way:
const users = await UserController.listInternal.fn({});
```

### Stubbing services

If the handler calls a service that does real I/O, either:

- **Leave it real** for small projects / thin services. Often simpler than mocking.
- **Inject a stub** — import-time patch the service module, or have the controller accept a service reference. Don't add a DI framework just for tests.

Match what the project already does.

## Style B — service test (plain class)

Services have no decorators, no `.fn()`, no framework tie-in. Test them as regular TypeScript:

```ts
// src/modules/user/UserService.test.ts
import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import UserService from './UserService.ts';

describe('UserService', () => {
  it('formats the display name', () => {
    strictEqual(
      UserService.displayName({ first: 'Ada', last: 'Lovelace' }),
      'Ada Lovelace',
    );
  });
});
```

Services are the cheapest coverage per line. Push logic here and let `.fn()` tests focus on the procedure contract.

Database/external-service interaction is project-specific — use the repo's existing approach (in-memory driver, testcontainers, repository stubs). Don't invent one.

## Style C — HTTP integration test via `vovk-client`

Tests the whole chain over real HTTP. **Only works for procedures with an HTTP decorator** — there's nothing on the wire otherwise.

### 1. Ensure the generated client is current

```bash
npx vovk generate
```

After `vovk init`, `prebuild` runs this automatically before `next build`. For tests, run it explicitly — skipping it will surface as `vovk-client` imports missing methods that were recently added.

### 2. Start the dev server

Two shapes:

**Manual** — user runs `npm run dev` in another terminal; tests connect.

**Scripted (CI-friendly)** — `concurrently` launches both, kills both when tests finish:

```json
{
  "scripts": {
    "test:integration": "PORT=3210 concurrently \"npm run dev\" \"sleep 10 && npm run test:run\" --kill-others --success first"
  }
}
```

Tune `sleep` to however long `next dev` needs on the target machine. For CI, prefer polling the server over a fixed sleep:

```bash
until curl -fsS "http://localhost:3210/api" >/dev/null 2>&1; do sleep 1; done
```

### 3. Write the test

```ts
// src/modules/user/UserController.integration.test.ts
import { describe, it } from 'node:test';
import { deepStrictEqual, rejects } from 'node:assert';
import { UserRPC } from 'vovk-client';

const apiRoot = `http://localhost:${process.env.PORT ?? 3000}/api`;

describe('UserController (HTTP)', () => {
  it('GET /users/{id} returns the user', async () => {
    const user = await UserRPC.getUser({
      apiRoot,
      params: { id: '42' },
    });
    deepStrictEqual(user, { id: '42', name: 'Ada' });
  });

  it('rejects invalid params with a validation error', async () => {
    await rejects(
      () => UserRPC.getUser({ apiRoot, params: { id: '' } }),
      (err: Error) => /validation|422|400/i.test(err.message),
    );
  });
});
```

**RPC client naming**: the client module name is the **key** you used in `initSegment`'s `controllers` map — `UserRPC: UserController` → `import { UserRPC } from 'vovk-client'`. Not `UserControllerRPC`. See `segment` skill for segment registration details.

**Call shape**: `RPC.method({ apiRoot, params, query, body, meta, disableClientValidation })` — same as `.fn()` plus `apiRoot`.

**Filename convention**: `.integration.test.ts` (or similar) lets a test script glob only integration tests separately from unit tests. Optional.

### 4. Error-path assertions

The RPC client rethrows server `HttpException`s with the original status and message — so error tests read like normal `rejects`:

```ts
await rejects(
  () => UserRPC.getUser({ apiRoot, params: { id: 'nonexistent' } }),
  (err: Error) => err.message.includes('not found') || err.message.includes('404'),
);
```

Exact error shape depends on the validation library (Zod / Valibot / ArkType) and any custom decorators. Assert on the status/message rather than exact text — easier to maintain.

## Streams — brief

Procedures that yield (`function*` / `async function*`) return an async iterable from `.fn()` and from the RPC client. Assert by iterating and collecting.

```ts
const results = [];
for await (const item of MyRPC.stream({ apiRoot })) results.push(item);
deepStrictEqual(results, [...expected]);
```

Depth (iteration validation, early-close semantics, `JSONLinesResponder`) lives in the **`jsonlines` skill**.

## File layout

Colocate:

```
src/modules/user/
  UserController.ts
  UserController.test.ts              ← .fn() tests
  UserController.integration.test.ts  ← HTTP tests
  UserService.ts
  UserService.test.ts                 ← plain-class tests
```

Central `test/` directory works too — match the repo's existing layout.

## Running

- Unit: `npm run test` (or whatever the script is).
- Integration: start the dev server first (or use the scripted `test:integration`), then run.
- Report failures verbatim — don't paraphrase a test runner's output.

## No `vovk new test` command

`vovk-cli` scaffolds controllers and services, not tests. Test files are hand-written. `vovk.config.mjs` `moduleTemplates` has no `test` key — nothing to configure there. If the user asks for a test template, offer a documented convention (filename, imports) rather than inventing a CLI flag.

## Gotchas

- **`.fn()` validation is on by default.** Tests that pass malformed inputs without `disableClientValidation: true` are asserting the validation layer, not just the handler body. That's usually what you want — be explicit when it isn't.
- **RPC import name = the `controllers` key**, not the controller class name. `UserRPC` not `UserControllerRPC`. Most common "why can't I import it" cause.
- **Stale `vovk-client`**: if a method is missing from the client, run `npx vovk generate`. The client is code-generated from controllers; it doesn't auto-sync.
- **Integration test hangs**: dev server not up on the expected port. Verify `PORT`, check server logs, prefer polling over `sleep`.
- **`--experimental-strip-types` on Node 23+**: flag accepted, warning harmless — don't chase it into a toolchain change.
- **`experimentalDecorators` in a test-specific `tsconfig.json`**: if tests use their own tsconfig, confirm the flag is set there too. `vovk init` sets it in the main tsconfig; a test config can easily miss it.
- **Mixing unit + integration in one script**: the integration tests need a running server; the unit tests don't. Split scripts (`test`, `test:integration`) or gate with an env var. Running a pure unit suite shouldn't require booting Next.
