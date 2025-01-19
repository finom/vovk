import { it, describe } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../lib/getCLIAssertions.mjs';

// TODO add more tests
await describe('Custom client templates', async () => {
  const { runAtProjectDir, createNextApp, vovkInit, assertFile } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir',
  });

  const ejsFilePath = path.join(import.meta.dirname, '../../../test_data/client-templates/foo.js.ejs');

  await it('Basic check', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment');
    const dev = runAtProjectDir(`../dist/index.mjs dev --next-dev`);
    await new Promise((resolve) => setTimeout(resolve, 15000));
    await dev.kill();
    await runAtProjectDir(`../dist/index.mjs generate --full-schema --template ${ejsFilePath} --out from-template --file-name foo.js`);

    await assertFile('from-template/foo.js', [
      `Hello, World!`,
    ]);
  });
});
