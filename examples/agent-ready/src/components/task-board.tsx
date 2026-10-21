'use client';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { TaskRPC } from '@/client';
import type { Task } from '@/modules/task/task-schema';

const TOKEN_KEY = 'agent-ready:token';

export default function TaskBoard() {
  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
    setOrigin(window.location.origin);
  }, []);

  const rpc = useMemo(
    () => (token ? TaskRPC.withDefaults({ init: { headers: { Authorization: `Bearer ${token}` } } }) : null),
    [token]
  );

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const refresh = useCallback(() => run(async () => rpc && setTasks(await rpc.listTasks())), [rpc, run]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // An agent may change the tasks too, so the list reloads when the tab gets focus
  useEffect(() => {
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refresh]);

  const signIn = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get('token') ?? '').trim();
    if (!value) return;
    localStorage.setItem(TOKEN_KEY, value);
    setToken(value);
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setTasks([]);
    setError(null);
  };

  if (!rpc) {
    return (
      <form onSubmit={signIn} className="flex flex-col gap-3">
        <label htmlFor="token" className="text-sm text-muted">
          Sign in with one of the tokens from <code>API_TOKENS</code>.
        </label>
        <div className="flex gap-2">
          <input id="token" name="token" className="input flex-1" placeholder="dev-token-alice" autoComplete="off" />
          <button type="submit" className="button">
            Sign in
          </button>
        </div>
      </form>
    );
  }

  const createTask = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await rpc.createTask({ body: { title } });
      setTitle('');
      await refresh();
    });
  };

  const command = `claude mcp add --transport http tasks ${origin}/api/mcp --header "Authorization: Bearer ${token}"`;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Your tasks</h2>
          <button type="button" onClick={signOut} className="text-sm text-muted hover:text-foreground">
            Sign out
          </button>
        </div>
        <form onSubmit={createTask} className="flex gap-2">
          <input
            className="input flex-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
          />
          <button type="submit" className="button">
            Add
          </button>
        </form>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <ul className="divide-y divide-border border-y border-border">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={task.done}
                aria-label={`Mark "${task.title}" ${task.done ? 'not done' : 'done'}`}
                onChange={() =>
                  run(() => rpc.updateTask({ params: { id: task.id }, body: { done: !task.done } }).then(refresh))
                }
              />
              <span className={`flex-1 ${task.done ? 'text-muted line-through' : ''}`}>{task.title}</span>
              <button
                type="button"
                className="text-sm text-muted hover:text-foreground"
                onClick={() => run(() => rpc.deleteTask({ params: { id: task.id } }).then(refresh))}
              >
                Delete
              </button>
            </li>
          ))}
          {tasks.length === 0 && <li className="py-2 text-muted">No tasks yet.</li>}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Connect an agent</h2>
        <p className="text-muted">
          Add the MCP server to Claude Code with your token, then ask it to <em>add a task called Ship it</em>. Come
          back to this tab and the task is here.
        </p>
        <pre className="overflow-x-auto rounded-md bg-code p-3 text-sm">
          <code>{command}</code>
        </pre>
        <p className="text-sm text-muted">
          Other MCP clients connect to <code>{origin}/api/mcp</code> with the same header.
        </p>
      </section>
    </div>
  );
}
