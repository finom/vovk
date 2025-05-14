import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';

await describe('Full & segmented client', async () => {
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
    /* await runAtProjectDir('../dist/index.mjs new segment foo');
    await runAtProjectDir('../dist/index.mjs new controller foo/cucumber');
    await runAtProjectDir('../dist/index.mjs new controller foo/tomato');
    await runAtProjectDir('../dist/index.mjs new segment bar/baz');
    await runAtProjectDir('../dist/index.mjs new controller bar/baz/pineapple');
    await runAtProjectDir('../dist/index.mjs new controller bar/baz/kiwi'); */
  });

  await it('Generates full client', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs generate`);

    await assertDirFileList('./node_modules/.vovk-client', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);

    await assertNotExists('./node_modules/.vovk-client/root/index.mjs');
  });

  await it.skip('Generates full client with included segments', async () => {});
  await it.skip('Generates full client with excluded segments', async () => {});

  await it('Generates segmented client', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs generate --segmented-only --segmented-out ./segmented-client`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await assertDirFileList('./segmented-client/root', ['index.ts', 'fullSchema.ts']);

    await assertNotExists('./segmented-client/index.ts');
  });

  await it.skip('Generates segmented client with included segments', async () => {});
  await it.skip('Generates segmented client with excluded segments', async () => {});
});
