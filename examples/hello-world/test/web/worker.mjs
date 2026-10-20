// Runs the bundled client inside workerd through Miniflare: node worker.mjs <apiRoot> <bundle> <miniflare dir>
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [apiRoot, bundle, miniflareDir] = process.argv.slice(2);
// miniflare is installed apart from the app: it brings its own workerd binary
const { Miniflare } = await import(
  pathToFileURL(
    createRequire(path.join(miniflareDir, 'noop.js')).resolve('miniflare'),
  ).href
);

const entry = `
import * as rpc from './client.js';
import { runChecks } from './checks.js';
export default { fetch: async () => Response.json(await runChecks(rpc, ${JSON.stringify(apiRoot)})) };
`;
const mf = new Miniflare({
  modules: [
    { type: 'ESModule', path: 'entry.js', contents: entry },
    {
      type: 'ESModule',
      path: 'client.js',
      contents: readFileSync(bundle, 'utf8'),
    },
    {
      type: 'ESModule',
      path: 'checks.js',
      contents: readFileSync(new URL('./checks.mjs', import.meta.url), 'utf8'),
    },
  ],
  compatibilityDate: '2026-07-01',
});
try {
  const results = await (await mf.dispatchFetch('http://localhost/')).json();
  report('workerd', results);
} finally {
  await mf.dispose();
}

function report(where, results) {
  for (const { name, ok, error } of results)
    console.log(
      `${ok ? 'ok' : 'FAIL'} ${where}: ${name}${error ? ` (${error})` : ''}`,
    );
  if (results.length === 0 || results.some(({ ok }) => !ok))
    process.exitCode = 1;
}
