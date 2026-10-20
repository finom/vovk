<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end Framework for Next.js App Router</strong>
  <br />
  <em>One codebase → type-safe clients, OpenAPI, and AI tools</em>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## vovk [![npm version](https://badge.fury.io/js/vovk.svg)](https://www.npmjs.com/package/vovk)

The Vovk.ts runtime: `procedure`, the HTTP decorators, `initSegment`, `HttpException`, `deriveTools` and the types. It has [no dependencies](https://bundlephobia.com/result?p=vovk); `openapi3-ts` is a peer dependency for the OpenAPI types.

It needs Next.js 15+ with the App Router and TypeScript 5.5+. The CLI, [vovk-cli](https://www.npmjs.com/package/vovk-cli), needs Node.js 24.15+ (or Bun 1.4+, Deno 2.9+).

## Install

In a Next.js app:

```sh
npx vovk-cli@latest init
```

`vovk init` installs `vovk`, `vovk-cli`, a validation library and [vovk-ajv](https://www.npmjs.com/package/vovk-ajv), adds the npm scripts, turns on `experimentalDecorators` in `tsconfig.json` and writes `vovk.config.mjs`. To set it up by hand, see [Manual Install](https://vovk.dev/manual-install).

## Usage

A controller is a class of procedures. A procedure validates its input and output with any [Standard Schema](https://standardschema.dev/) library, such as Zod, Valibot or ArkType:

```ts
// src/modules/user/user-controller.ts
import { get, HttpException, HttpStatus, operation, prefix, procedure } from 'vovk';
import { z } from 'zod';
import UserService from './user-service';

@prefix('users')
export default class UserController {
  @operation({ summary: 'Get a user' })
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.uuid() }),
    output: z.object({ id: z.uuid(), name: z.string() }),
  }).handle(async (req, { id }) => {
    const user = await UserService.getUser(id);
    if (!user) throw new HttpException(HttpStatus.NOT_FOUND, 'User not found');
    return user;
  });
}
```

A segment is a Next.js catch-all route that serves the controllers:

```ts
// src/app/api/[[...vovk]]/route.ts
import { initSegment } from 'vovk';
import UserController from '../../../modules/user/user-controller';

const controllers = { UserRPC: UserController };
export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({ controllers });
```

Now `GET /api/users/{id}` answers. `vovk dev` writes the schema to `.vovk-schema/` and generates a typed client into `src/client`:

```ts
import { UserRPC } from '@/client';

const user = await UserRPC.getUser({ params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
```

On the server, `.fn()` calls the same procedure without HTTP, with the same arguments. Use it in server components, server actions and tests:

```ts
const user = await UserController.getUser.fn({ params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
```

A procedure with `@operation` is also an LLM tool. `deriveTools` takes controllers (called in-process) or RPC modules (called over HTTP) and returns [standard-tool](https://standard-tool.js.org/) objects with `name`, `description`, `inputSchema` and `execute`:

```ts
import { deriveTools } from 'vovk';

const tools = deriveTools({ modules: { UserController } });
```

A procedure that is an async generator streams [JSON Lines](https://vovk.dev/jsonlines), and the client reads it with `for await`.

Errors: throw `HttpException` for what the client should see. Any other error answers 500, with no detail in production.

## Docs

- [Quick Start](https://vovk.dev/quick-install) and [Manual Install](https://vovk.dev/manual-install)
- [Procedure](https://vovk.dev/procedure), [Segment](https://vovk.dev/segment), [Response and errors](https://vovk.dev/response)
- [TypeScript client](https://vovk.dev/typescript), [local calls with `.fn()`](https://vovk.dev/fn), [JSON Lines](https://vovk.dev/jsonlines)
- [AI tools](https://vovk.dev/tools), [OpenAPI](https://vovk.dev/openapi), [OpenAPI mixins](https://vovk.dev/mixins)
- [API reference](https://vovk.dev/api-ref)
