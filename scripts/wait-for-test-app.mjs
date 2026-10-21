// Waits until the test app answers, then requests the schema of every segment one at a time.
// In `next dev` two compilations at once can read a half-written manifest and answer 500,
// so each segment is compiled here, before the tests and `vovk dev`'s own schema requests overlap.
// Usage: node scripts/wait-for-test-app.mjs <origin> [timeout seconds, 300 by default]
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const [origin, timeoutSeconds = '300'] = process.argv.slice(2);
const deadline = Date.now() + Number(timeoutSeconds) * 1000;
const schemaDir = path.join(import.meta.dirname, '../test/.vovk-schema');

const segmentNames = (await readdir(schemaDir, { recursive: true }))
  .filter((file) => file.endsWith('.json') && file !== '_meta.json')
  .map((file) => file.slice(0, -'.json'.length).split(path.sep).join('/'))
  .map((name) => (name === 'root' ? '' : name))
  .sort();

async function waitFor(url) {
  while (true) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    if (Date.now() > deadline) {
      console.error(`${url} did not answer within ${timeoutSeconds}s`);
      process.exit(1);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

await waitFor(`${origin}/api/foo/client/common/nested-query`);
for (const segmentName of segmentNames) {
  await waitFor(`${origin}/api/${segmentName ? `${segmentName}/` : ''}_schema_`);
}
