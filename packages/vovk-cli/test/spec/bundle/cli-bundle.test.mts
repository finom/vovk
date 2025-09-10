import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import type { VovkSchema } from 'vovk';
import { deepStrictEqual } from 'node:assert';
import fs from 'node:fs/promises';
import updateConfig from '../../lib/updateConfig.mts';
import { importFresh } from '../../lib/importFresh.mts';

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
  });

  await it('Bundles composed client', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs bundle --tsconfig ../tsconfig.test.json --log-level debug`);

    await assertDirFileList('./dist', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'openapi.cjs',
      'openapi.mjs', // index.mjs's chunk created automatically by tsdown
      'openapi.d.cts',
      'package.json',
      'README.md',
    ]);
  });

  await it('Bundles composed client from custom schema dir using --schema-out for dev and --schema for bundle', async () => {
    await vovkDevAndKill('--schema-out ./custom-schema-dir');
    await runAtProjectDir(
      `../dist/index.mjs bundle --tsconfig ../tsconfig.test.json --log-level debug --schema ./custom-schema-dir`
    );

    await assertDirFileList('./dist', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'openapi.d.cts',
      'openapi.cjs',
      'openapi.mjs',
      'package.json',
      'README.md',
    ]);
  });

  await it('Bundles composed client to an --out dir', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs bundle --out my_dist --tsconfig ../tsconfig.test.json --log-level debug`);

    await assertDirFileList('./my_dist', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'openapi.d.cts',
      'openapi.cjs',
      'openapi.mjs',
      'package.json',
      'README.md',
    ]);
  });

  await it('Builds composed bundle with included segments', async () => {
    await vovkDevAndKill();
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
      'openapi.d.cts',
      'openapi.cjs',
      'openapi.mjs',
      'package.json',
      'README.md',
    ]);
    let { schema }: { schema: VovkSchema } = await importFresh<{ schema: VovkSchema }>(
      path.join(projectDir, 'composed-bundle', 'schema.cjs'),
      ['schema']
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());

    ({ schema } = await importFresh<{ schema: VovkSchema }>(path.join(projectDir, 'composed-bundle', 'index.cjs'), [
      'schema',
    ]));
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Builds composed bundle with excluded segments', async () => {
    await vovkDevAndKill();
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
      'openapi.d.cts',
      'openapi.cjs',
      'openapi.mjs',
      'package.json',
      'README.md',
    ]);
    let { schema }: { schema: VovkSchema } = await importFresh<{ schema: VovkSchema }>(
      path.join(projectDir, 'composed-bundle', 'schema.cjs'),
      ['schema']
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());

    ({ schema } = await importFresh<{ schema: VovkSchema }>(path.join(projectDir, 'composed-bundle', 'index.cjs'), [
      'schema',
    ]));
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Builds composed bundle with included segments using --include flag', async () => {
    await vovkDevAndKill();
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
      'openapi.d.cts',
      'openapi.cjs',
      'openapi.mjs',
      'package.json',
      'README.md',
    ]);
    let { schema }: { schema: VovkSchema } = await importFresh<{ schema: VovkSchema }>(
      path.join(projectDir, 'composed-bundle', 'schema.cjs'),
      ['schema']
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());

    ({ schema } = await importFresh<{ schema: VovkSchema }>(path.join(projectDir, 'composed-bundle', 'index.cjs'), [
      'schema',
    ]));
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Builds composed bundle with excluded segments using --exclude flag', async () => {
    await vovkDevAndKill();
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
      'openapi.d.cts',
      'openapi.cjs',
      'openapi.mjs',
      'package.json',
      'README.md',
    ]);
    let { schema }: { schema: VovkSchema } = await importFresh<{ schema: VovkSchema }>(
      path.join(projectDir, 'composed-bundle', 'schema.cjs'),
      ['schema']
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());

    ({ schema } = await importFresh<{ schema: VovkSchema }>(path.join(projectDir, 'composed-bundle', 'index.cjs'), [
      'schema',
    ]));
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it.only('Uses combined generatorConfig to create re-exports in composed bundle', async () => {
    await vovkDevAndKill();
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      bundle: {
        tsdownBuildOptions: { outDir: './composed-bundle' },
        includeSegments: ['foo', 'bar/baz'],
        generatorConfig: {
          reExports: {
            'x as y': './x.ts',
          },
        },
      },
      generatorConfig: {
        reExports: {
          a: './a.ts',
        },
        segments: {
          foo: {
            reExports: {
              'foo as fooX': './foo.ts',
            },
          },
          'bar/baz': {
            reExports: {
              'bar as barX': './bar.ts',
            },
            // baz segment is nested inside bar, so its re-exports should also be applied
          },
        },
      },
    }));
    await fs.writeFile(path.join(projectDir, 'x.ts'), 'export const x = 1;');
    await fs.writeFile(path.join(projectDir, 'a.ts'), 'export const a = 2;');
    await fs.writeFile(path.join(projectDir, 'foo.ts'), 'export const foo = 3;');
    await fs.writeFile(path.join(projectDir, 'bar.ts'), 'export const bar = 4;');
    await runAtProjectDir(`../dist/index.mjs bundle --tsconfig ../tsconfig.test.json --log-level debug`);
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
      'openapi.d.cts',
      'openapi.cjs',
      'openapi.mjs',
      'package.json',
      'README.md',
    ]);
    const { y, a, fooX, barX } = await importFresh<{
      y: number;
      a: number;
      fooX: number;
      barX: number;
    }>(path.join(projectDir, 'composed-bundle', 'index.cjs'), ['y', 'a', 'fooX', 'barX']);

    deepStrictEqual({ y, a, fooX, barX }, { y: 1, a: 2, fooX: 3, barX: 4 });
  });
});
