import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getNextDevCommand } from '../../../dist/dev/get-next-dev-command.mjs';
import { getRuntimeCommand } from '../../../dist/dev/get-runtime-command.mjs';

const node = { node: '24.15.0' } as NodeJS.ProcessVersions;

await describe('getRuntimeCommand', async () => {
  await it('Runs Node.js by its own path', () => {
    assert.deepStrictEqual(getRuntimeCommand(node, '/usr/bin/node'), ['/usr/bin/node']);
  });

  await it('Keeps Bun on Bun', () => {
    assert.deepStrictEqual(getRuntimeCommand({ ...node, bun: '1.4.3' }, '/opt/bun'), ['/opt/bun', '--bun']);
  });

  await it('Keeps Deno on Deno', () => {
    assert.deepStrictEqual(getRuntimeCommand({ ...node, deno: '2.9.6' }, '/opt/deno'), ['/opt/deno', 'run', '-A']);
  });

  await it('Starts next dev with the runtime that runs the CLI', () => {
    const command = getNextDevCommand(['--webpack'], import.meta.dirname, ['/opt/deno', 'run', '-A']);
    assert.match(command, /^\/opt\/deno run -A \S+next\S* dev --webpack$/);
  });
});
