import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import type { VovkSchema } from 'vovk';
import { deepStrictEqual } from 'node:assert';
import updateConfig from '../../lib/updateConfig.mts';

await describe('TypeScript bundle', async () => {
  const { projectDir, runAtProjectDir, createNextApp, vovkInit, vovkDevAndKill, assertDirFileList } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir',
  });

  beforeEach(async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new controller user');
    await runAtProjectDir('../dist/index.mjs new segment foo');
    await runAtProjectDir('../dist/index.mjs new controller foo/cucumber');
    await runAtProjectDir('../dist/index.mjs new controller foo/tomato');
    await runAtProjectDir('../dist/index.mjs new segment bar/baz');
    await runAtProjectDir('../dist/index.mjs new controller bar/baz/pineapple');
    await runAtProjectDir('../dist/index.mjs new controller bar/baz/kiwi');
    await runAtProjectDir('../dist/index.mjs new segment a/b/c/d/e');
    await runAtProjectDir('../dist/index.mjs new controller a/b/c/d/e/post');
    await vovkDevAndKill();
  });

  await it('Bundles composed client', async () => {
    await runAtProjectDir(`../dist/index.mjs bundle --tsconfig ../tsconfig.test.json --log-level debug`);

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
  });

  await it('Bundles composed client to an --out dir', async () => {
    await runAtProjectDir(`../dist/index.mjs bundle --out my_dist --tsconfig ../tsconfig.test.json --log-level debug`);

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
  });

  await it('Builds composed bundle with included segments', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      bundle: {
        tsdownBuildOptions: { outDir: './composed-bundle' },
        includeSegments: ['foo', 'bar/baz'],
      },
    }));
    await runAtProjectDir(`../dist/index.mjs bundle --tsconfig ../tsconfig.test.json --log-level debug`);
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'package.json',
      'README.md',
    ]);
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-bundle', 'schema.cjs') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Builds composed bundle with excluded segments', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      bundle: {
        tsdownBuildOptions: { outDir: './composed-bundle' },
        excludeSegments: ['', 'bar/baz'],
      },
    }));
    await runAtProjectDir(`../dist/index.mjs bundle --tsconfig ../tsconfig.test.json --log-level debug`);
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'package.json',
      'README.md',
    ]);
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-bundle', 'index.mjs') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Builds composed bundle with included segments using --include flag', async () => {
    await runAtProjectDir(
      `../dist/index.mjs bundle --include foo --include bar/baz --out ./composed-bundle --tsconfig ../tsconfig.test.json --log-level debug`
    );
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'package.json',
      'README.md',
    ]);
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-bundle', 'schema.cjs') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Builds composed bundle with excluded segments using --exclude flag', async () => {
    await runAtProjectDir(
      `../dist/index.mjs bundle --exclude "" --exclude bar/baz --out ./composed-bundle --tsconfig ../tsconfig.test.json --log-level debug`
    );
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'package.json',
      'README.md',
    ]);
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-bundle', 'index.cjs') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });
});
