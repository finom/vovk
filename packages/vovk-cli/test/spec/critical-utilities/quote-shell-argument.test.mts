import assert from 'node:assert';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { promisify } from 'node:util';
import { getCommandShell, quoteShellArgument } from '../../../dist/utils/quote-shell-argument.mjs';

const tmpDir = path.join(process.cwd(), "tmp_shell dir with spaces & it's quotes");

after(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

await describe('quoteShellArgument', async () => {
  await it('Leaves plain arguments as they are', () => {
    for (const platform of ['darwin', 'linux', 'win32'] as const) {
      assert.strictEqual(quoteShellArgument('--turbo', platform), '--turbo');
      assert.strictEqual(quoteShellArgument('--port=3001', platform), '--port=3001');
    }
  });

  await it('Quotes for cmd.exe on Windows', () => {
    assert.strictEqual(
      quoteShellArgument('C:\\Users\\John Doe\\node_modules\\vovk-cli\\dist\\dev\\index.mjs', 'win32'),
      '"C:\\Users\\John Doe\\node_modules\\vovk-cli\\dist\\dev\\index.mjs"'
    );
    assert.strictEqual(quoteShellArgument('C:\\proj\\dev\\index.mjs', 'win32'), 'C:\\proj\\dev\\index.mjs');
    assert.strictEqual(quoteShellArgument('a "b" & c', 'win32'), '"a ""b"" & c"');
    assert.strictEqual(getCommandShell('win32'), 'cmd.exe');
  });

  await it('Passes paths with spaces and quotes through sh unchanged', {
    skip: process.platform === 'win32',
  }, async () => {
    const scriptPath = path.join(tmpDir, 'dev', 'index.mjs');
    await fs.mkdir(path.dirname(scriptPath), { recursive: true });
    await fs.writeFile(scriptPath, 'console.log(JSON.stringify(process.argv.slice(2)));');
    const args = ['--hostname', 'my host', "it's", '$HOME', '`id`', 'a\\b', ''];

    const command = ['node', scriptPath, ...args].map((arg) => quoteShellArgument(arg)).join(' ');
    const { stdout } = await promisify(execFile)(getCommandShell(), ['-c', command]);

    assert.deepStrictEqual(JSON.parse(stdout), args);
  });
});
