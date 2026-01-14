import { it, describe } from 'node:test';
import path from 'node:path';
import { deepStrictEqual, strictEqual } from 'node:assert';
import fs from 'node:fs/promises';
import type { VovkSchema } from 'vovk';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import updateConfig from '../../lib/updateConfig.mts';
import { importFresh } from '../../lib/importFresh.mts';
import { updateConfigFileProperty } from '../../../dist/utils/updateConfigProperty.mjs';

await describe('TypeScript bundle', async () => {
  const { projectDir, runAtProjectDir, vovkDevAndKill, assertDirFileList, createVovkApp } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir_bundle',
  });

  const createApp = async ({
    devAndKillFlags = '',
    cache = true,
  }: { devAndKillFlags?: string; cache?: boolean } = {}) => {
    await createVovkApp({
      vovkInitFlags: '--yes',
      cacheKey: 'bundle-or-generate-test',
      cache,
      runInCacheDir: async ({ cwd }) => {
        await runAtProjectDir('../dist/index.mjs new segment', { cwd });
        await runAtProjectDir('../dist/index.mjs new controller user', { cwd });
        await runAtProjectDir('../dist/index.mjs new segment foo', { cwd });
        await runAtProjectDir('../dist/index.mjs new controller foo/cucumber', { cwd });
        await runAtProjectDir('../dist/index.mjs new controller foo/tomato', { cwd });
        await runAtProjectDir('../dist/index.mjs new segment bar/baz', { cwd });
        await runAtProjectDir('../dist/index.mjs new controller bar/baz/pineapple', { cwd });
        await runAtProjectDir('../dist/index.mjs new controller bar/baz/kiwi', { cwd });
        await runAtProjectDir('../dist/index.mjs new segment a/b/c/d/e', { cwd });
        await runAtProjectDir('../dist/index.mjs new controller a/b/c/d/e/post', { cwd });
        await vovkDevAndKill(devAndKillFlags, { cwd });
      },
    });
  };

  await it('Bundles composed client', async () => {
    await createApp();
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug`);

    await assertDirFileList({
      dirPath: './dist',
      files: ['index.js', 'index.d.ts', 'package.json', 'README.md'],
    });
  });

  await it('Bundles composed client to an --out dir', async () => {
    await createApp();
    await runAtProjectDir(`../dist/index.mjs bundle --out my_dist --log-level debug`);

    await assertDirFileList({
      dirPath: './my_dist',
      files: ['index.js', 'index.d.ts', 'package.json', 'README.md'],
    });
  });

  await it('Builds composed bundle with included segments', async () => {
    await createApp();
    await updateConfigFileProperty(path.join(projectDir, 'vovk.config.js'), ['bundle', 'outDir'], './composed-bundle');
    await updateConfigFileProperty(
      path.join(projectDir, 'vovk.config.js'),
      ['bundle', 'includeSegments'],
      ['foo', 'bar/baz']
    );
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug`);
    await assertDirFileList({
      dirPath: './composed-bundle',
      files: ['index.js', 'index.d.ts', 'package.json', 'README.md'],
    });

    const { schema } = await importFresh<{ schema: VovkSchema }>(path.join(projectDir, 'composed-bundle', 'index.js'), [
      'schema',
    ]);
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Builds composed bundle with excluded segments', async () => {
    await createApp();
    await updateConfigFileProperty(path.join(projectDir, 'vovk.config.js'), ['bundle', 'outDir'], './composed-bundle');
    await updateConfigFileProperty(
      path.join(projectDir, 'vovk.config.js'),
      ['bundle', 'excludeSegments'],
      ['', 'bar/baz']
    );
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug`);
    await assertDirFileList({
      dirPath: './composed-bundle',
      files: ['index.js', 'index.d.ts', 'package.json', 'README.md'],
    });

    const { schema } = await importFresh<{ schema: VovkSchema }>(path.join(projectDir, 'composed-bundle', 'index.js'), [
      'schema',
    ]);
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Builds composed bundle with included segments using --include flag', async () => {
    await createApp();
    await runAtProjectDir(
      `../dist/index.mjs bundle --include foo --include bar/baz --out ./composed-bundle --log-level debug`
    );
    await assertDirFileList({
      dirPath: './composed-bundle',
      files: ['index.js', 'index.d.ts', 'package.json', 'README.md'],
    });

    const { schema } = await importFresh<{ schema: VovkSchema }>(path.join(projectDir, 'composed-bundle', 'index.js'), [
      'schema',
    ]);
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Builds composed bundle with excluded segments using --exclude flag', async () => {
    await createApp();
    await runAtProjectDir(
      `../dist/index.mjs bundle --exclude "" --exclude bar/baz --out ./composed-bundle --log-level debug`
    );
    await assertDirFileList({
      dirPath: './composed-bundle',
      files: ['index.js', 'index.d.ts', 'package.json', 'README.md'],
    });

    const { schema } = await importFresh<{ schema: VovkSchema }>(path.join(projectDir, 'composed-bundle', 'index.js'), [
      'schema',
    ]);
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Uses combined outputConfig to create re-exports in composed bundle', async () => {
    await createApp();
    await updateConfig(path.join(projectDir, 'vovk.config.js'), () => ({
      bundle: {
        outDir: './composed-bundle',
        includeSegments: ['foo', 'bar/baz'],
        outputConfig: {
          reExports: {
            'x as y': './x.ts',
          },
        },
      },
      outputConfig: {
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
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug`);
    await assertDirFileList({
      dirPath: './composed-bundle',
      files: ['index.js', 'index.d.ts', 'package.json', 'README.md'],
    });
    const { y, a, fooX, barX } = await importFresh<{
      y: number;
      a: number;
      fooX: number;
      barX: number;
    }>(path.join(projectDir, 'composed-bundle', 'index.js'), ['y', 'a', 'fooX', 'barX']);

    deepStrictEqual({ y, a, fooX, barX }, { y: 1, a: 2, fooX: 3, barX: 4 });
  });

  await it('Uses origin option', async () => {
    await createApp();

    await updateConfig(path.join(projectDir, 'vovk.config.js'), () => ({
      bundle: {
        outputConfig: {
          origin: 'https://example.com/',
        },
      },
    }));

    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug --out ./dist-origin-1`);
    const { UserRPC } = await import(path.join(projectDir, 'dist-origin-1', 'index.js'));

    strictEqual(UserRPC.createUser.apiRoot, 'https://example.com/api');
  });

  await it('Uses --origin flag', async () => {
    await createApp();
    await updateConfig(path.join(projectDir, 'vovk.config.js'), () => ({
      bundle: {
        outputConfig: {
          origin: 'https://example.com/', // should be overridden by --origin
        },
      },
    }));

    await runAtProjectDir(
      `../dist/index.mjs bundle --log-level debug --out ./dist-origin-2 --origin https://example.org/`
    );
    const { UserRPC } = await import(path.join(projectDir, 'dist-origin-2', 'index.js'));

    strictEqual(UserRPC.createUser.apiRoot, 'https://example.org/api');
  });

  await it('Bundles composed client from custom schema dir using --schema-out for dev and --schema for bundle', async () => {
    await createApp({
      devAndKillFlags: '--schema-out ./custom-schema-dir',
      cache: false, // no need to cache as this test is unique
    });
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug --schema ./custom-schema-dir`);

    await assertDirFileList({
      dirPath: './dist',
      files: ['index.js', 'index.d.ts', 'package.json', 'README.md'],
    });
  });
});
