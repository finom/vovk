import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';

await describe('TypeScript bundle', async () => {
  const { runAtProjectDir, createNextApp, vovkInit, assertNotExists, vovkDevAndKill, assertDirFileList } =
    getCLIAssertions({
      cwd: path.resolve(import.meta.dirname, '../../..'),
      dir: 'tmp_test_dir',
    });

  beforeEach(async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new controller user');
  });

  await it('Bundles composed client', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs bundle`);

    await assertDirFileList('./dist', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'package.json',
      'README.md',
    ]);

    // check if segmented client is not generated
    await assertNotExists('./dist/root/index.mjs');
  });

  await it('Bundles composed client to an --out dir', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs bundle --out my_dist`);

    await assertDirFileList('./my_dist', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'package.json',
      'README.md',
    ]);
    // check if segmented client is not generated
    await assertNotExists('./dist/root/index.mjs');
  });

  await it.skip('Bundles segmented client', async () => {
    // TODO: coming soon
  });
});
