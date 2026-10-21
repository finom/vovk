# Agent-ready Next.js app

A Next.js task list whose API is also an MCP server, an OpenAPI spec and a typed client, with per-user bearer auth. Built with [Vovk.ts](https://vovk.dev).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffinom%2Fvovk%2Ftree%2Fmain%2Fexamples%2Fagent-ready&project-name=agent-ready&repository-name=agent-ready&env=API_TOKENS&envDescription=Users%20and%20their%20tokens%2C%20as%20userId%3Atoken%20pairs%20separated%20by%20commas&envLink=https%3A%2F%2Fgithub.com%2Ffinom%2Fvovk%2Fblob%2Fmain%2Fexamples%2Fagent-ready%2F.env.example)

The four procedures in [`TaskController`](src/modules/task/task-controller.ts) are written once and served as:

| | Where | Used by |
|---|---|---|
| REST endpoints | `/api/tasks`, `/api/tasks/{id}` | the page, through the generated client |
| MCP tools | `/api/mcp` | Claude Code, Cursor, any MCP client |
| OpenAPI operations | `/api/static/openapi.json`, `/api-reference` | other services, API tools |

Each request carries a bearer token. The token names a user, and every procedure works on that user's tasks only, whether a person calls it from the page or their agent calls it as a tool.

## Run it

Node.js 24.15 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 and sign in with `dev-token-alice` or `dev-token-bob`.

## Connect an agent

The page shows the command for your token. For Claude Code:

```bash
claude mcp add --transport http tasks http://localhost:3000/api/mcp --header "Authorization: Bearer dev-token-alice"
```

Ask it to *add a task called Ship it*, then switch back to the page. Sign in as Bob, connect a second agent with Bob's token, and neither sees the other's tasks.

To call the tools by hand, run `npx @modelcontextprotocol/inspector` and connect to `http://localhost:3000/api/mcp` with the same header.

## How it fits together

```
src/
  app/
    api/[[...vovk]]/route.ts         the REST API: one catch-all route for every controller
    api/static/[[...vovk]]/route.ts  openapi.json, pre-rendered at build time
    api/mcp/route.ts                 the MCP server: checks the token, turns the procedures into tools
    api-reference/route.ts           Scalar API reference
    page.tsx
  components/task-board.tsx          the UI, calling the API through the generated client
  decorators/auth-guard.ts           resolves the user for HTTP requests and in-process calls
  lib/auth.ts                        token lookup
  modules/task/                      schema, controller, service
test/tasks.test.ts
```

- **One auth check for both paths.** An HTTP request reaches `authGuard` with its `Authorization` header. The MCP route checks the token itself, with the SDK's `requireBearerAuth`, and passes the user to the tools through `deriveTools({ meta })`. The tools call the procedures in-process, and `authGuard` reads the user from that meta.
- **Same validation.** A tool's input schema comes from the procedure's Zod schemas, and an in-process call is validated just like an HTTP request: an empty title is refused either way.
- **Generated files.** `npm run dev` regenerates the client in `src/client` and the schema in `.vovk-schema` whenever a controller changes; `npm run build` generates the client from the committed schema first.

## Make it yours

- **Storage.** `TaskService` keeps tasks in memory, so they reset on restart, and on Vercel separate function instances don't share them. Replace the map with your database; the controller, the MCP route and the client stay as they are.
- **Auth.** `getUserIdByToken` reads `API_TOKENS`. Replace it with a lookup in your API key table, session store or OAuth provider. Use long random tokens anywhere public: `openssl rand -hex 32`.
- **More procedures.** `npx vovk new controller service <name>` writes a controller and a service and adds the controller to the segment route. Add it to `modules` in the MCP route to make it a tool, and give its procedures `@authGuard()`.

## Learn more

- [Make your Next.js app agent-ready](https://vovk.dev/agent-ready): the guide this template follows
- [Vovk.ts docs](https://vovk.dev)
- [Agent skills for Vovk.ts](https://vovk.dev/about#agent-skills): `npx skills add finom/vovk`
