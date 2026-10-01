import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getDevScript } from '../../../dist/init/update-npm-scripts.mjs';

// only the fields getDevScript reads
const withDevScript = (dev: string) =>
  ({ content: { name: 'app', scripts: { dev } } }) as unknown as Parameters<typeof getDevScript>[0];

await describe('getDevScript', async () => {
  await it('Keeps the next dev flags in the implicit script', () => {
    assert.strictEqual(getDevScript(withDevScript('next dev -p 4000'), 'implicit'), 'vovk dev --next-dev -- -p 4000');
  });

  await it('Sets PORT to the port next dev listens on in the explicit script', () => {
    assert.match(getDevScript(withDevScript('next dev -p 4000'), 'explicit'), /PORT=4000 /);
    assert.match(getDevScript(withDevScript('next dev --turbopack'), 'explicit'), /PORT=3000 /);
  });
});
