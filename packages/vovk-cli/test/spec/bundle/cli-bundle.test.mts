import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import type { VovkSchema, VovkStrictConfig } from 'vovk';
import { deepStrictEqual, strictEqual } from 'node:assert';
import fs from 'node:fs/promises';
import updateConfig from '../../lib/updateConfig.mts';
import { importFresh } from '../../lib/importFresh.mts';
import updateConfigProperty from '../../lib/updateConfigProperty.mts';

await describe('TypeScript bundle', async () => {
  const { projectDir, runAtProjectDir, createNextApp, vovkInit, vovkDevAndKill, assertDirFileList } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir',
  });

  const setupBuildConfig = async () => {
    await updateConfigProperty(
      path.join(projectDir, 'vovk.config.js'),
      ['bundle', 'build'],
      async ({ entry, outDir }: Parameters<VovkStrictConfig['bundle']['build']>[0]) => {
        const { build } = await import('tsdown');
        await build({
          entry,
          dts: true,
          format: ['cjs', 'esm'],
          hash: false,
          fixedExtension: true,
          clean: true,
          outDir,
          tsconfig: './tsconfig.build.json',
        });
      }
    );
  };

  beforeEach(async () => {
    await createNextApp();
    await vovkInit('--yes');
    await fs.writeFile(
      path.join(projectDir, 'tsconfig.build.json'),
      JSON.stringify({
        compilerOptions: {
          moduleResolution: 'bundler',
          paths: {
            'vovk/*': ['./node_modules/vovk/*'],
          },
        },
      })
    );
    await setupBuildConfig();
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
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug`);

    await assertDirFileList('./dist', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'package.json',
      'README.md',
    ]);
  });

  await it('Bundles composed client from custom schema dir using --schema-out for dev and --schema for bundle', async () => {
    await vovkDevAndKill('--schema-out ./custom-schema-dir');
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug --schema ./custom-schema-dir`);

    await assertDirFileList('./dist', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'package.json',
      'README.md',
    ]);
  });

  await it('Bundles composed client to an --out dir', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs bundle --out my_dist --log-level debug`);

    await assertDirFileList('./my_dist', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'package.json',
      'README.md',
    ]);
  });

  await it('Builds composed bundle with included segments', async () => {
    await vovkDevAndKill();
    await updateConfigProperty(path.join(projectDir, 'vovk.config.js'), ['bundle', 'outDir'], './composed-bundle');
    await updateConfigProperty(
      path.join(projectDir, 'vovk.config.js'),
      ['bundle', 'includeSegments'],
      ['foo', 'bar/baz']
    );
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug`);
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
      'package.json',
      'README.md',
    ]);

    const { schema } = await importFresh<{ schema: VovkSchema }>(
      path.join(projectDir, 'composed-bundle', 'index.cjs'),
      ['schema']
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Builds composed bundle with excluded segments', async () => {
    await vovkDevAndKill();
    await updateConfigProperty(path.join(projectDir, 'vovk.config.js'), ['bundle', 'outDir'], './composed-bundle');
    await updateConfigProperty(path.join(projectDir, 'vovk.config.js'), ['bundle', 'excludeSegments'], ['', 'bar/baz']);
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug`);
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
      'package.json',
      'README.md',
    ]);

    const { schema } = await importFresh<{ schema: VovkSchema }>(
      path.join(projectDir, 'composed-bundle', 'index.cjs'),
      ['schema']
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Builds composed bundle with included segments using --include flag', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(
      `../dist/index.mjs bundle --include foo --include bar/baz --out ./composed-bundle --log-level debug`
    );
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
      'package.json',
      'README.md',
    ]);

    const { schema } = await importFresh<{ schema: VovkSchema }>(
      path.join(projectDir, 'composed-bundle', 'index.cjs'),
      ['schema']
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Builds composed bundle with excluded segments using --exclude flag', async () => {
    await vovkDevAndKill();
    await runAtProjectDir(
      `../dist/index.mjs bundle --exclude "" --exclude bar/baz --out ./composed-bundle --log-level debug`
    );
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
      'package.json',
      'README.md',
    ]);

    const { schema } = await importFresh<{ schema: VovkSchema }>(
      path.join(projectDir, 'composed-bundle', 'index.cjs'),
      ['schema']
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Uses combined outputConfig to create re-exports in composed bundle', async () => {
    await vovkDevAndKill();
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      bundle: {
        build: () => Promise.resolve(),
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
    await setupBuildConfig();
    await fs.writeFile(path.join(projectDir, 'x.ts'), 'export const x = 1;');
    await fs.writeFile(path.join(projectDir, 'a.ts'), 'export const a = 2;');
    await fs.writeFile(path.join(projectDir, 'foo.ts'), 'export const foo = 3;');
    await fs.writeFile(path.join(projectDir, 'bar.ts'), 'export const bar = 4;');
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug`);
    await assertDirFileList('./composed-bundle', [
      'index.mjs',
      'index.cjs',
      'index.d.mts',
      'index.d.cts',
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

  await it('Uses origin option', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      bundle: {
        build: () => Promise.resolve(),
        outputConfig: {
          origin: 'https://example.com/',
        },
      },
    }));

    await setupBuildConfig();

    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs bundle --log-level debug --out ./dist-origin-1`);
    const { UserRPC } = await import(path.join(projectDir, 'dist-origin-1', 'index.mjs'));

    strictEqual(UserRPC.createUser.apiRoot, 'https://example.com/api');
  });

  await it('Uses --origin flag', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      bundle: {
        build: () => Promise.resolve(),
        outputConfig: {
          origin: 'https://example.com/', // should be overridden by --origin
        },
      },
    }));

    await setupBuildConfig();
    await vovkDevAndKill();
    await runAtProjectDir(
      `../dist/index.mjs bundle --log-level debug --out ./dist-origin-2 --origin https://example.org/`
    );
    const { UserRPC } = await import(path.join(projectDir, 'dist-origin-2', 'index.mjs'));

    strictEqual(UserRPC.createUser.apiRoot, 'https://example.org/api');
  });
});
