import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import updateConfigProperty from '../../lib/updateConfigProperty.mts';

await describe('Full & segment client', async () => {
  const { projectDir, runAtProjectDir, createNextApp, vovkInit, assertNotExists, vovkDevAndKill, assertDirFileList } =
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

  await it('Generates full client', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs generate`);

    await assertDirFileList('./node_modules/.vovk-client', [
      'module.mjs',
      'module.d.mts',
      'main.cjs',
      'main.d.cts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);

    await assertNotExists('./node_modules/.vovk-client/root/module.mjs');
  });

  await it('Generates segment client', async () => {
    await updateConfigProperty(path.join(projectDir, 'vovk.config.js'), ['generateFullClient'], false);
    await updateConfigProperty(path.join(projectDir, 'vovk.config.js'), ['generateSegmentClient'], true);
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs generate`);

    await assertDirFileList('./node_modules/.vovk-client/root', [
      'module.mjs',
      'module.d.mts',
      'main.cjs',
      'main.d.cts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);

    await assertNotExists('./node_modules/.vovk-client/module.mjs');
  });
});
