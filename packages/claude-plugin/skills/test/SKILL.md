---
name: test
description: Write and run tests for controllers, services, and procedures in a Vovk.ts project. Use whenever the user asks to test, add test coverage, write a spec, verify behavior, or unit-test/integration-test a Vovk controller, service, module, procedure, endpoint, or RPC handler — phrases like "test this controller", "add tests for the user module", "write a spec for getUser", or "cover this with integration tests" all apply. Handles two complementary styles: fast unit tests that call `.fn()` on a procedure directly (no HTTP, no running server) and integration tests that hit a running dev server through the generated `vovk-client` RPC client. Defaults to `node --test` with `--experimental-strip-types` and `node:assert` — that's what the Vovk repo itself uses and it needs zero extra dependencies — but honors Vitest/Jest/etc. when the project already has one wired up. There is no `vovk new test` command; test files are hand-written, colocated next to the code they cover.
---

# Vovk.ts testing

Vovk gives you two natural testing surfaces, and they answer different questions:

- **`.fn()` unit tests** call a procedure's handler directly — no HTTP, no server, no serialization. They verify that the handler's logic, validation, and service interactions behave correctly given a structured input. Fast, isolated, parallelizable.
- **Integration tests via the `vovk-client` RPC client** hit a running dev server over real HTTP. They verify that routing, decorators, middleware, status codes, content negotiation, and the generated client all agree. Slower, but catch a class of bugs `.fn()` never will.

A healthy Vovk project uses both. Prefer `.fn()` for logic coverage and integration for a thin smoke layer on the HTTP surface.

Services are plain TypeScript classes with no Vovk-specific machinery, so they're tested as plain classes — no framework, no `.fn()`, just instantiate and call. This is often the cheapest coverage per line and should be the default for anything non-trivial in a service.

## Prereq: is this a Vovk project?

Same check as the `new` skill:

- `vovk.config.mjs` exists at the project root.
- `package.json` has `vovk` + `vovk-client` in `dependencies` and `vovk-cli` in `devDependencies`.

If these are missing, stop and point the user at the `init` skill — generating tests against a non-Vovk project wastes everyone's time.

## Decide the style

Interpret the user's phrasing:

- "unit test", "test the handler", "test the procedure", "test validation", "test without the server" → **`.fn()` style**
- "test the service", "test the business logic", "unit-test `UserService`" → **service style**
- "integration test", "end-to-end", "hit the API", "test the RPC client", "test over HTTP" → **integration style**
- Ambiguous ("add tests for the user module") → propose a mix: a service test for business logic, one integration test for the happy path. Ask before writing more than ~3 test files at once.

## Pick a test runner

Scan `package.json` before writing anything:

1. If `scripts.test` already runs something (vitest, jest, mocha, ava, node --test) → **use that**. Match the existing project's assertion library and file conventions too.
2. If no test setup exists → propose `node --test` with `--experimental-strip-types` and `node:assert`. That's what Vovk itself uses, needs no install, and runs `.ts` files natively on Node 22+. Add a `test` script and confirm with the user before assuming.

Don't silently introduce Vitest/Jest into a project that has neither.

### Default (`node --test`) boilerplate

Test file naming: `**/*.test.ts`, colocated next to the file under test.

```ts
import { describe, it } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
```

Add to `package.json` `scripts` if absent:

```json
"test": "node --experimental-strip-types --test --test-concurrency=1 './src/**/*.test.ts'"
```

`--test-concurrency=1` matters for integration tests that share a dev server — drop it for pure unit tests if the user wants parallel runs.

## Style A — `.fn()` unit test (procedure)

Call the procedure directly. Validation runs, services execute for real (unless you inject a stub), but nothing goes over HTTP.

Given a procedure:

```ts
// src/modules/user/UserController.ts
class UserController {
  static getUser = procedure({
    params: z.object({ id: z.string() }),
  }).handle(async ({ vovk }) => {
    return UserService.getUser(vovk.params.id);
  });
}
```

A unit test:

```ts
// src/modules/user/UserController.test.ts
import { describe, it } from 'node:test';
import { deepStrictEqual, rejects } from 'node:assert';
import UserController from './UserController.ts';

describe('UserController.getUser', () => {
  it('returns the user by id', async () => {
    const user = await UserController.getUser.fn({
      params: { id: '42' },
    });
    deepStrictEqual(user, { id: '42', name: 'Ada' });
  });

  it('rejects when validation fails', async () => {
    await rejects(
      () => UserController.getUser.fn({ params: { id: 42 as unknown as string } }),
      /params/i,
    );
  });
});
```

`.fn()` accepts `{ body, query, params, meta }` — only pass what the procedure defines. The input is validated against the procedure's schemas exactly as it would be over HTTP, so this is a real test of the validation layer, not a bypass.

If the handler pulls in a service that does network/DB I/O, either:

- Keep the test as an integration-ish unit test (real service, real I/O) — fine for small projects or thin services.
- Inject a stub through the service module (e.g., import-time patch, or have the controller accept a service instance). Don't add a DI framework for this unless the project already has one.

## Style B — Service test (plain class)

Services have no decorators, no Vovk dependency, no `.fn()`. Test them as regular TypeScript:

```ts
// src/modules/user/UserService.test.ts
import { describe, it } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import UserService from './UserService.ts';

describe('UserService', () => {
  it('formats the display name', () => {
    deepStrictEqual(UserService.displayName({ first: 'Ada', last: 'Lovelace' }), 'Ada Lovelace');
  });
});
```

This is where most logic coverage should live. If the service talks to a DB, the usual options apply: in-memory driver, testcontainers, or a test-scoped repository stub. Those choices are project-specific — follow what the project already does, don't invent one.

## Style C — Integration test via `vovk-client`

Tests the whole chain: HTTP, routing, decorators, validation, handler, generated client. Requires the dev server running.

### 1. Make sure the generated client is up to date

The `vovk-client` package is generated from the controllers. Before running integration tests, ensure it's current:

```bash
npx vovk generate
```

If the project has a `prebuild` script with `vovk generate` (standard after `vovk init`), that already runs before `next build`. For tests, run it explicitly.

### 2. Start the dev server

Two options — pick based on the project's setup:

**Manual (simplest)**: the user already runs `npm run dev` in another terminal. Tests just connect.

**Scripted (CI-friendly)**: use `concurrently` to launch the server and tests together, killing both when the tests finish. The Vovk repo itself uses this shape:

```json
"test:integration": "PORT=3210 concurrently \"npm run dev\" \"sleep 10 && npm run test:run\" --kill-others --success first"
```

Tune the `sleep` to however long `next dev` needs on the target machine. Prefer polling the server (e.g., `curl -fsS http://localhost:3210/api 2>/dev/null`) over a fixed sleep if the user cares about CI flakiness.

### 3. Write the test against the generated client

```ts
// src/modules/user/UserController.integration.test.ts
import { describe, it } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { UserControllerRPC } from 'vovk-client';

const apiRoot = `http://localhost:${process.env.PORT ?? 3000}/api`;

describe('UserController (HTTP)', () => {
  it('GET /user/:id returns the user', async () => {
    const user = await UserControllerRPC.getUser({
      apiRoot,
      params: { id: '42' },
    });
    deepStrictEqual(user, { id: '42', name: 'Ada' });
  });
});
```

The RPC client name is `<ControllerClassName>RPC`, exported from `vovk-client`. `apiRoot` points at the running server's `/api` mount. Every RPC method accepts `{ apiRoot, params, query, body, ... }`, the same shape the server procedure declared.

Use `.integration.test.ts` (or similar) as the filename when you want to separate unit and integration runs — then the integration script globs that suffix while the unit script excludes it. Not required, just a common split.

### 4. Error-path assertions

The RPC client throws `HttpException` on non-2xx. Test it like any other thrown error:

```ts
import { rejects } from 'node:assert';

await rejects(
  () => UserControllerRPC.getUser({ apiRoot, params: { id: '' } }),
  (err: Error) => err.message.includes('422') || /validation/i.test(err.message),
);
```

The exact error surface depends on the validation library — check what the project uses (zod/valibot/arktype) and match the message shape rather than guessing.

## Running the tests

After writing, run them and report the result verbatim — don't paraphrase a failure.

- Unit-only: `npm run test` (or the specific script).
- Integration: start the server first (or use the `concurrently` script), then run the test script.

If the test runner complains about TypeScript syntax, the project is likely missing `--experimental-strip-types` on Node 22 (or using a Node < 22 that predates strip-types entirely). Surface the exact error — don't swap runners silently.

## No `vovk new test` command

`vovk-cli` generates controllers and services, not tests. Test files are written by hand. That also means `vovk.config.mjs` `moduleTemplates` has no `test` key — there's nothing to configure. If the user asks you to "add a template for tests", explain this and offer to write a small helper script or a documented convention instead.

## Where tests live

Colocate next to the code under test:

```
src/modules/user/
├── UserController.ts
├── UserController.test.ts          # .fn() unit tests
├── UserController.integration.test.ts  # HTTP via vovk-client
├── UserService.ts
└── UserService.test.ts             # plain class tests
```

This keeps the blast radius of a module visible in one directory, which matches how `vovk new` already organizes modules. A central `test/` directory also works — follow whatever the project has already chosen.

## When things go wrong

- **`vovk-client` exports are stale or missing**: re-run `npx vovk generate`. The client is generated from controllers; if a controller was just added, the client doesn't know about it until generation runs.
- **Integration test hangs**: the dev server probably isn't up on the expected port. Check `PORT` env, check the server logs, extend the readiness wait.
- **`--experimental-strip-types` warnings in Node 23+**: harmless; the flag is still accepted and behaves the same. Don't chase the warning into a toolchain change unless the user asks.
- **Decorator-related test failures**: confirm `tsconfig.json` has `experimentalDecorators: true` — `vovk init` sets this, but a custom `tsconfig` for tests might miss it.
