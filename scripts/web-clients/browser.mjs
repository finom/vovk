// Runs the bundled client in headless Chrome, from a page of the app itself (same origin, no CORS):
// node browser.mjs <origin> <bundle> <chrome binary>
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [origin, bundle, chrome] = process.argv.slice(2);
const profile = mkdtempSync(path.join(tmpdir(), 'vovk-chrome-'));
const browser = spawn(
  chrome,
  ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
  {
    stdio: ['ignore', 'ignore', 'pipe'],
  }
);

try {
  const port = await new Promise((resolve, reject) => {
    let log = '';
    browser.stderr.on('data', (chunk) => {
      log += chunk;
      const match = log.match(/DevTools listening on ws:\/\/[^:]+:(\d+)\//);
      if (match) resolve(match[1]);
    });
    browser.on('exit', (code) => reject(new Error(`Chrome exited with ${code}: ${log}`)));
  });
  const page = await waitFor(async () => {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    return targets.find((target) => target.type === 'page');
  });
  const session = await connect(page.webSocketDebuggerUrl);
  await session.send('Page.enable');
  const loaded = session.once('Page.loadEventFired');
  await session.send('Page.navigate', { url: `${origin}/` });
  await loaded;
  const { result, exceptionDetails } = await session.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
    const load = (source) => import(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
    const rpc = await load(${JSON.stringify(readFileSync(bundle, 'utf8'))});
    const { runChecks } = await load(${JSON.stringify(readFileSync(new URL('./checks.mjs', import.meta.url), 'utf8'))});
    return runChecks(rpc, location.origin + '/api');
  })()`,
  });
  session.close();
  if (exceptionDetails) throw new Error(JSON.stringify(exceptionDetails));
  const results = result.value;
  for (const { name, ok, error } of results)
    console.log(`${ok ? 'ok' : 'FAIL'} chrome: ${name}${error ? ` (${error})` : ''}`);
  if (results.length === 0 || results.some(({ ok }) => !ok)) process.exitCode = 1;
} finally {
  const exited = new Promise((resolve) => browser.once('exit', resolve));
  browser.kill();
  await exited;
  rmSync(profile, { recursive: true, force: true });
}

async function waitFor(get) {
  for (let i = 0; i < 100; i++) {
    const value = await get().catch(() => undefined);
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Chrome page not found');
}

async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = () => reject(new Error(`CDP connection to ${url} failed`));
  });
  let nextId = 0;
  const pending = new Map();
  let waiting = null;
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id !== undefined) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else if (waiting && message.method === waiting.method) {
      waiting.resolve(message.params);
      waiting = null;
    }
  };
  return {
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      }),
    once: (method) =>
      new Promise((resolve) => {
        waiting = { method, resolve };
      }),
    close: () => socket.close(),
  };
}
