# AGENTS.md

Vovk.ts is a back-end meta-framework for Next.js App Router that turns Route Handlers into a structured API layer (Controller → Service) with auto-generated type-safe RPC clients, OpenAPI specs, and AI tool definitions. It uses TypeScript decorators on static class methods, Zod for validation, and a CLI for code generation.

## Core commands

```bash
npm run dev                   # start dev servers (vovk dev + next dev)
npx vovk dev --next-dev       # implicit mode: vovk starts Next.js itself
npx vovk generate             # generate client library from schema (run before builds)
npm run build                 # next build (prebuild runs vovk generate automatically)
npx vovk new segment <n>   # scaffold a new segment (e.g. admin, customer)
npx vovk new controller service <n>  # scaffold controller + service pair
```

Typical `package.json` scripts:

```json
{
  "dev": "PORT=3000 concurrently 'vovk dev' 'next dev' --kill-others",
  "prebuild": "vovk generate",
  "build": "next build"
}
```

## Packages and installation

Three packages are required:

- `vovk` — runtime library (decorators, procedure, types, utilities)
- `vovk-client` — re-exports the generated TypeScript RPC client
- `vovk-cli` — CLI for code generation, dev server (dev dependency)

Optional:

- `vovk-ajv` — client-side validation via Ajv
- `zod` — server-side validation schemas
- `concurrently` — run vovk dev + next dev in parallel

```bash
npm i vovk vovk-client zod vovk-ajv
npm i -D vovk-cli concurrently
```

Requires **Node.js 22+** and **Next.js 15+**. Enable `"experimentalDecorators": true` in `tsconfig.json`.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   └── [[...vovk]]/        # root segment (catch-all route)
│   │       └── route.ts        # initSegment + controller registration
│   │   └── admin/
│   │       └── [[...vovk]]/    # admin segment
│   │           └── route.ts
│   └── page.tsx
├── modules/
│   ├── hello/
│   │   ├── HelloController.ts
│   │   └── HelloService.ts
│   └── user/
│       ├── UserController.ts
│       ├── UserService.ts
│       └── UserIsomorphicService.ts
├── decorators/
│   ├── authGuard.ts
│   └── cronGuard.ts
vovk.config.mjs                # framework configuration
.vovk-schema/                   # generated schema (commit this)
```

## Architecture concepts

**Controller** — A static class with HTTP method decorators (`@get`, `@post`, `@put`, `@patch`, `@del`). Handles routing, validation, authorization. All methods MUST be `static`.

**Service** — A static class (no decorators) handling business logic, DB calls, external APIs. Used into controllers via import (no DI) and direct method calls.

**Segment** — A Next.js catch-all route (`[[...vovk]]/route.ts`) that registers controllers via `initSegment()`. Each segment compiles into its own serverless function.

**Procedure** — A `procedure()` call wrapping a handler with Zod validation schemas for body, query, params, and output.

**RPC Module** — Auto-generated client module mirroring a controller. Called with `{ body, query, params }`.

## Segment (route.ts) pattern

Every segment file follows this exact pattern:

```typescript
// src/app/api/[[...vovk]]/route.ts
import { initSegment } from 'vovk';
import HelloController from '../../../modules/hello/HelloController';
import UserController from '../../../modules/user/UserController';

const controllers = {
  HelloRPC: HelloController, // key = generated RPC module name
  UserRPC: UserController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS } = initSegment({
  emitSchema: true,
  controllers,
  onError: console.error,
});
```

`initSegment` options: `segmentName`, `emitSchema`, `controllers`, `onError`.

## Controller pattern with procedure()

```typescript
import { procedure, prefix, put, operation } from 'vovk';
import { z } from 'zod';
import UserService from './UserService';

@prefix('users')
export default class UserController {
  @operation({ summary: 'Update user', description: 'Update user by ID' })
  @put('{id}')
  static updateUser = procedure({
    body: z.object({
      email: z.email(),
      profile: z.object({ name: z.string().min(2), age: z.int().min(16).max(120) }),
    }),
    params: z.object({ id: z.uuid() }),
    query: z.object({ notify: z.enum(['email', 'push', 'none']) }),
    output: z.object({ success: z.boolean(), id: z.uuid() }),
  }).handle(async (req, { id }) => {
    const body = await req.json();
    const notify = req.nextUrl.searchParams.get('notify');
    return UserService.updateUser(id, body, notify);
  });

  @operation({ summary: 'Get user' })
  @get('{id}')
  static getUser = procedure({
    params: z.object({ id: z.uuid() }),
    output: z.object({ id: z.string(), name: z.string() }),
  }).handle(async (_req, { id }) => {
    return UserService.getUser(id);
  });
}
```

`procedure()` fields: `body`, `query`, `params`, `output`, `iteration` (streaming), `handle`, `contentType`, `validateEachIteration`, `disableServerSideValidation`.

## `contentType` option

The `contentType` option on `procedure` controls client-side `body` typing, server-side `req.vovk.body()` parsing, and `Content-Type` enforcement (415 error on mismatch). It can be a single string or an array. Wildcards like `'image/*'`, `'video/*'`, `'*/*'` are supported.

| Content Type | Client `body` type | `req.vovk.body()` return type |
|---|---|---|
| `application/json` (default) | `TBody \| Blob` | Parsed JSON object |
| `multipart/form-data` | `FormData \| Blob` | Parsed form object |
| `application/x-www-form-urlencoded` | `URLSearchParams \| FormData \| Blob` | Parsed form object |
| `text/*` and text-like types | `string \| Blob` | `string` |
| Everything else (`image/*`, `video/*`, `application/octet-stream`, etc.) | `File \| ArrayBuffer \| Uint8Array \| Blob` | `File` |

```typescript
@post()
static uploadImage = procedure({
  contentType: 'image/*',
}).handle(async (req) => {
  const file = await req.vovk.body(); // File
  // ...
});
```

## Service pattern

Services are plain static classes — no decorators:

```typescript
import type { VovkParams, VovkBody, VovkQuery } from 'vovk';
import type UserController from './UserController';

export default class UserService {
  static async updateUser(id: VovkParams<typeof UserController.updateUser>['id'], data: VovkBody<typeof UserController.updateUser>, notify: VovkQuery<typeof UserController.updateUser>['notify']) {
    return prisma.user.update({ where: { id }, data });
  }
  static async getUser(id: VovkParams<typeof UserController.getUser>['id']) {
    return prisma.user.findUnique({ where: { id } });
  }
}
```

## Client-side usage (generated RPC)

```typescript
'use client';
import { UserRPC } from 'vovk-client';

const user = await UserRPC.updateUser({
  body: { email: 'john@example.com', profile: { name: 'John', age: 25 } },
  query: { notify: 'email' },
  params: { id: '123e4567-e89b-12d3-a456-426614174000' },
});
```

For React Query:

```typescript
const { data } = useQuery({
  queryKey: UserRPC.getUser.queryKey(),
  queryFn: () => UserRPC.getUser({ params: { id } }),
});
```

## JSON Lines streaming

Server (generator syntax):

```typescript
@post('completions')
static streamTokens = procedure({
  iteration: z.object({ message: z.string() }),
}).handle(function* () {
  yield* StreamService.getTokens();
});
```

Client (disposable async iterator):

```typescript
using stream = await StreamRPC.streamTokens();
for await (const { message } of stream) {
  console.log(message);
}
```

## Decorator-free alternative: `decorate` and `static prefix`

When decorator syntax is not available or not preferred, use `decorate()` for methods and `static prefix` for the controller prefix:

```typescript
import { get, post, operation, HttpStatus, procedure, decorate } from 'vovk';
import { z } from 'zod';

class UserController {
  static prefix = 'users';

  static handleAll = decorate(
    post('all/{foo}/{bar}'),
    operation({
      summary: 'Decorate version of handleAll',
      description: 'This is a decorate description',
    }),
    operation.error(HttpStatus.BAD_REQUEST, 'This is a bad request'),
    procedure({
      body: z.object({ hello: z.string() }),
      query: z.object({ search: z.string() }),
      params: z.object({ foo: z.string(), bar: z.string() }),
    })
  ).handle(async ({ vovk }, params) => {
    const body = await vovk.body();
    const { search } = vovk.query();
    const vovkParams = vovk.params();
    return { body, query: { search }, params, vovkParams };
  });

  // Simple handler without procedure
  static getMethod = decorate(get()).handle(async () => {
    return { method: 'get' };
  });

  // With body validation
  static handleBody = decorate(
    post.auto(),
    procedure({
      body: z.object({ hello: z.string() }),
    })
  ).handle(async (req) => {
    return req.vovk.body();
  });
}

export default UserController;
```

`decorate()` takes decorator functions (HTTP method, operation, custom decorators) and optionally a `procedure()` as the last argument, then returns `{ handle }`. The controller prefix is set via `static prefix` property — equivalent to using the `@prefix()` decorator.

## Custom decorators (middleware)

Vovk.ts has no built-in middleware — use `createDecorator` instead:

```typescript
import { createDecorator, HttpException, HttpStatus } from 'vovk';

const authGuard = createDecorator(async (req, next) => {
  const token = req.headers.get('authorization');
  if (!token || !verifyToken(token)) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  return next();
});

// Usage:
@get('profile')
@authGuard()
static getProfile(req) { /* ... */ }
```

## Error handling

```typescript
import { HttpException, HttpStatus } from 'vovk';

// Server: throw to return HTTP error
throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid input');
throw new HttpException(HttpStatus.NOT_FOUND, 'User not found');

// Regular Error → 500
throw new Error('Something went wrong');

// Client: errors re-thrown with same interface
try {
  await UserRPC.getUser({ params: { id } });
} catch (e) {
  const err = e as HttpException;
  console.log(err.statusCode, err.message);
}
```

## Configuration (vovk.config.mjs)

```javascript
// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
      // fetcher: './src/lib/myFetchingFunction',
    },
    openAPIObject: {
      info: { title: 'My API', version: '1.0.0' },
      servers: [{ url: 'https://myapp.example.com' }],
    },
  },
  composedClient: { enabled: true },
  segmentedClient: { enabled: false },
};
export default config;
```

## Key imports from 'vovk'

```typescript
import {
  // Segment init
  initSegment,
  // Decorators
  get,
  post,
  put,
  patch,
  del,
  head,
  options, // HTTP methods
  prefix, // class URL prefix
  operation, // OpenAPI metadata
  // Procedure
  procedure,
  // Decorator factory
  createDecorator,
  // Error handling
  HttpException,
  HttpStatus,
  // Streaming
  JSONLinesResponder,
  // Types
  type VovkRequest, // extends NextRequest with typed body/query
  type VovkReturnType, // extract return type from controller method
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkOutput,
  type VovkClientBody,
  type VovkClientQuery,
  type VovkClientParams,
  type VovkClientReturnType,
  type VovkConfig,
  type VovkIteration,
  // Utilities
  deriveTools, // AI function calling
  controllersToStaticParams, // static export
  multitenant, // multitenancy routing
} from 'vovk';
```

## AI tools / function calling

```typescript
import { deriveTools } from 'vovk';
import { UserRPC } from 'vovk-client';
import TaskController from '@/modules/task/TaskController';

const { tools, toolsByName } = deriveTools({
  modules: { UserRPC, TaskController },
});
// tools = [{ name, description, parameters, execute }, ...]
```

### `@operation.tool` decorator

Use `@operation.tool()` to define tool-specific attributes (name, description, title, hidden) separately from OpenAPI metadata. These are set under the `x-tool` key in the OpenAPI operation object.

```typescript
import { prefix, get, operation } from 'vovk';

@prefix('user')
export default class UserController {
  @operation.tool({
    name: 'get_user_by_id',
    title: 'Get user by ID',
    description: 'Retrieves a user by their unique ID, including name and email.',
  })
  @operation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique ID.',
  })
  @get('{id}')
  static getUser() { /* ... */ }
}
```

`x-tool` attributes: `name` (override tool name), `description` (override tool description), `title` (MCP title), `hidden` (exclude from derived tools).

Methods without a summary or description are excluded from tools by default.

## CLI module scaffolding

`vovk new` creates segments and modules (controllers, services, custom modules). When creating a controller, the CLI automatically updates the segment's `route.ts` (adds import and registers the controller in `controllers` object) using AST manipulation.

```bash
npx vovk new controller service user          # creates UserController + UserService in root segment
npx vovk new controller service admin/user     # creates in admin segment, updates admin route.ts
npx vovk n c s user                            # shortcut syntax
```

Use `--empty` flag to create empty controllers and services (without CRUD boilerplate):

```bash
npx vovk new controller service user --empty
```

Other flags: `--overwrite`, `--no-segment-update` (skip route.ts update), `--template <path>` (override template), `--out-dir <dir>` (override output directory), `--dry-run`.

## Nested segments

Segments can be nested to unlimited depth. The `segmentName` must match the folder path under `src/app/api/`.

```bash
npx vovk new segment foo/bar/baz
```

This creates `src/app/api/foo/bar/baz/[[...vovk]]/route.ts` with `segmentName: 'foo/bar/baz'`, serving at `/api/foo/bar/baz/...`. Schema is stored at `.vovk-schema/foo/bar/baz.json`.

```typescript
// src/app/api/foo/bar/baz/[[...vovk]]/route.ts
export const { GET, POST, PUT, DELETE } = initSegment({
  segmentName: 'foo/bar/baz',
  controllers,
});
```

Modules for nested segments are placed under `src/modules/foo/bar/baz/`:

```bash
npx vovk new controller service foo/bar/baz/user
```

## OpenAPI Mixins

Third-party OpenAPI specs can be integrated into the Vovk.ts client as pseudo-segments. Define in `outputConfig.segments` with `openAPIMixin` property:

```javascript
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: { validateOnClient: 'vovk-ajv' },
    segments: {
      petstore: {
        openAPIMixin: {
          source: {
            url: 'https://petstore3.swagger.io/api/v3/openapi.json',
            fallback: './.openapi-cache/petstore.json',
          },
          getModuleName: 'PetstoreAPI',
          getMethodName: 'auto',
          apiRoot: 'https://petstore3.swagger.io/api/v3',
        },
      },
    },
  },
};
export default config;
```

`openAPIMixin` options:
- `source` — `{ url, fallback }`, `{ path }`, or `{ object }` to provide the OpenAPI spec.
- `getModuleName` — string or `(ctx) => string` to name generated API modules.
- `getMethodName` — `'auto'`, `'camel-case-operation-id'`, or `(ctx) => string`.
- `apiRoot` — base URL for API calls (required if OAS has no `servers`).

Usage:

```typescript
import { PetstoreAPI } from 'vovk-client';

await PetstoreAPI.updatePet({
  body: { name: 'Doggo' },
  params: { id: '123' },
});
```

Mixin modules support `withDefaults`, `deriveTools`, client-side validation, and type inference (`VovkBody`, `VovkQuery`, etc.) just like regular RPC modules.

## `req.vovk` interface

The `req.vovk` property provides enhanced request methods beyond standard `NextRequest`:

- `req.vovk.body()` — returns parsed body (respects validation library transforms). For unknown content types (e.g., `image/*`) returns `File`.
- `req.vovk.query()` — returns typed query params with nested object support (bracket notation: `?arr[0]=a&obj[key]=val`).
- `req.vovk.params()` — returns typed route params.
- `req.vovk.meta()` / `req.vovk.meta({ key: value })` — get/set request metadata (used in decorators and procedures). Client-side meta sent via `x-meta` header is available under `xMetaHeader` key.

```typescript
@post('{id}')
static updateUser = procedure({
  contentType: 'multipart/form-data',
  body: z.object({ name: z.string() }),
  query: z.object({ filters: z.object({ role: z.string() }) }),
  params: z.object({ id: z.uuid() }),
}).handle(async (req, { id }) => {
  const body = await req.vovk.body();      // parsed form data as object
  const query = req.vovk.query();          // nested query params
  const params = req.vovk.params();        // { id: string }
  // ...
});
```

## Custom fetcher

Override the default fetch behavior by specifying `outputConfig.imports.fetcher` in config. The file must export a `fetcher` variable. Use `createFetcher` from `vovk` to build it:

```typescript
// src/lib/fetcher.ts
import { createFetcher } from 'vovk';

export const fetcher = createFetcher<{
  successMessage?: string;
  useAuth?: boolean;
}>({
  prepareRequestInit: async (init, { useAuth }) => ({
    ...init,
    headers: {
      ...init.headers,
      ...(useAuth ? { Authorization: 'Bearer token' } : {}),
    },
  }),
  onSuccess: async (data, { successMessage }) => {
    if (successMessage) alert(successMessage);
  },
  onError: async (error) => {
    alert(error.message);
  },
});
```

Config:

```javascript
const config = {
  outputConfig: {
    imports: {
      fetcher: './src/lib/fetcher',
    },
  },
};
```

Custom options are then available on every RPC call:

```typescript
await UserRPC.updateUser({
  body: { email: 'john@example.com' },
  useAuth: true,
  successMessage: 'User updated!',
});
```

Fetcher can be set per-segment for different auth mechanisms:

```javascript
outputConfig: {
  segments: {
    admin: {
      imports: { fetcher: './src/lib/adminFetcher' },
    },
  },
},
```

## Segmented client

Splits the generated RPC client into per-segment TypeScript modules instead of a single composed client. Each segment gets its own folder with `index.ts`, `schema.ts`, and `openapi.json`. This keeps admin code out of customer bundles.

```javascript
const config = {
  segmentedClient: {
    enabled: true,
    // outDir: './src/client', // default
  },
  composedClient: {
    enabled: false, // disable composed if using segmented only
  },
};
```

Import from segment-specific paths:

```typescript
import { UserRPC } from '@/client/customer';
import { AdminRPC } from '@/client/admin';
```

When using segmented client, `vovk-client` package is no longer needed.

## Composed client and pnpm

By default, the composed client is emitted to `node_modules/.vovk-client` and re-exported by the `vovk-client` package. When using **pnpm**, this may cause hoisting issues.

To fix, emit the composed client to a local project directory using the `ts` template:

```javascript
const config = {
  composedClient: {
    fromTemplates: ['ts'],
    outDir: './src/client',
  },
};
```

In this case, `vovk-client` package is not needed — import directly from the local directory:

```typescript
import { UserRPC } from '@/client';
```

## Conventions and patterns

- All controller methods must be **static**
- Use `@prefix()` on the class, HTTP method decorator + `procedure()` on methods. Alternatively, use `decorate()` + `static prefix` without decorator syntax
- Path params use `{id}` syntax (not `:id`) in current API
- The `handle` function returned by `procedure()` receives `(req, params)` — params are the second argument
- `vovk-client` re-exports from `node_modules/.vovk-client` (auto-generated, do not edit)
- `.vovk-schema/` directory should be committed to version control
- Restart TypeScript server in VS Code after adding new controller classes
- JSON Lines streaming responses cannot use Gzip/Brotli compression
- Schema is emitted when `dev` script is running (use `--exit` flag to emit on demand). `vovk generate` generates the client library from the emitted schema

## Do not

- Do not edit files inside `node_modules/.vovk-client` — they are auto-generated
- Do not use instance methods on controllers — all methods must be `static`
- Do not use `:id` for path params in `procedure()` — use `{id}` instead
- Do not forget to register controllers in the segment's `route.ts` file if they are not created via CLI
- Do not import directly from `.vovk-schema/` — use `vovk-client` or `vovk-client/openapi`
- Do not skip `vovk generate` before production builds
