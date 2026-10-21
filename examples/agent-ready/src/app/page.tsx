import TaskBoard from '@/components/task-board';

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Agent-ready Next.js app</h1>
        <p className="text-muted">
          A task list built with{' '}
          <a href="https://vovk.dev" className="underline">
            Vovk.ts
          </a>
          . Each procedure in <code>TaskController</code> is a REST endpoint this page calls, a tool on the MCP server
          at <code>/api/mcp</code>, and an operation in the OpenAPI spec. Every request carries a bearer token, so
          people and their agents see only their own tasks.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <a href="/api-reference" className="underline">
            API reference
          </a>
          <a href="/api/static/openapi.json" className="underline">
            openapi.json
          </a>
          <a href="https://github.com/finom/vovk/tree/main/examples/agent-ready" className="underline">
            Source
          </a>
          <a href="https://vovk.dev/agent-ready" className="underline">
            Guide
          </a>
        </nav>
      </header>
      <TaskBoard />
    </main>
  );
}
