<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Vovk.ts

The API is built with Vovk.ts. Its docs for agents are at https://vovk.dev/llms.txt; the agent skills install with `npx skills add finom/vovk`.

- Controllers live in `src/modules/*/`, listed in `src/app/api/[[...vovk]]/route.ts`. Every procedure takes `@authGuard()`.
- `src/client` and `.vovk-schema` are generated: `npm run dev` keeps them current. Commit `.vovk-schema`, not `src/client`.
- `npm test` runs the procedures in-process and through the route handler.
