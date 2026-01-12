import { it, describe, beforeEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkSchema } from 'vovk';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import updateConfig from '../../lib/updateConfig.mts';

await describe('Composed & Segmented client', async () => {
  const { projectDir, runAtProjectDir, assertNotExists, vovkDevAndKill, assertDirFileList, createVovkApp } =
    getCLIAssertions({
      cwd: path.resolve(import.meta.dirname, '../../..'),
      dir: 'tmp_test_dir_composed_and_segmented',
    });

  const createApp = async ({
    devAndKillFlags = '',
    cache = true,
  }: { devAndKillFlags?: string; cache?: boolean } = {}) => {
    await createVovkApp({
      vovkInitFlags: '--yes',
      cacheKey: 'bundle-or-generate-test', // TODO: DRY
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

  beforeEach(async () => {
    await createApp();
  });
  await it('Generates composed client', async () => {
    await runAtProjectDir('rm -rf ./node_modules/.vovk-client');
    await runAtProjectDir(`../dist/index.mjs generate`);

    await assertDirFileList({
      dirPath: './node_modules/.vovk-client',
      files: ['index.js', 'index.d.ts', 'schema.js', 'schema.d.ts', 'openapi.json', 'openapi.d.ts', 'openapi.js'],
    });

    await assertNotExists('./node_modules/.vovk-client/root/index.mjs');
  });

  await it('Generates composed client using --from, --out and --composed-only', async () => {
    // also make sure that segmented client is not generated even if it is enabled
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      segmentedClient: {
        enabled: true,
        outDir: './composed-client',
      },
    }));
    await runAtProjectDir(`../dist/index.mjs generate --out ./composed-client --from ts --composed-only`);
    await assertNotExists('./composed-client/index.mjs');
    await assertNotExists('./composed-client/root/index.mjs');
    await assertDirFileList({
      dirPath: './composed-client',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
  });

  await it('Generates composed client with included segments', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      composedClient: {
        outDir: './composed-client',
        includeSegments: ['foo', 'bar/baz'],
        fromTemplates: ['ts'],
      },
    }));
    await runAtProjectDir(`../dist/index.mjs generate`);
    await assertDirFileList({
      dirPath: './composed-client',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-client', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Generates composed client with excluded segments', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      composedClient: {
        outDir: './composed-client',
        excludeSegments: ['', 'bar/baz'],
        fromTemplates: ['ts'],
      },
    }));
    await runAtProjectDir(`../dist/index.mjs generate`);
    await assertDirFileList({
      dirPath: './composed-client',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-client', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Generates composed client with included segments using --include flag', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --include foo --include bar/baz --out ./composed-client --from ts`
    );
    await assertDirFileList({
      dirPath: './composed-client',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-client', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Generates composed client with excluded segments using --exclude flag', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --exclude "" --exclude bar/baz --out ./composed-client --from ts`
    );
    await assertDirFileList({
      dirPath: './composed-client',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-client', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Uses outputConfig re-exports with composed client (all re-exports compiled into one file)', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      composedClient: {
        outDir: './composed-client',
        fromTemplates: ['ts'],
      },
      outputConfig: {
        reExports: {
          'x as y': './x.ts',
          z: './z.ts',
        },
        segments: {
          '': {
            reExports: {
              'default as c': './c.ts',
            },
          },
          foo: {
            reExports: {
              'default as a': './a.ts',
            },
          },
          'a/b/c/d/e': {
            reExports: {
              'default as b': './b.ts',
            },
          },
        },
      },
    }));
    await fs.writeFile(path.join(projectDir, 'x.ts'), 'export const x = 1;');
    await fs.writeFile(path.join(projectDir, 'z.ts'), 'export const z = 2;');
    await fs.writeFile(path.join(projectDir, 'a.ts'), 'export default 3;');
    await fs.writeFile(path.join(projectDir, 'b.ts'), 'export default 4;');
    await fs.writeFile(path.join(projectDir, 'c.ts'), 'export default 5;');
    const tsconfig = JSON.parse(await fs.readFile(path.join(projectDir, 'tsconfig.json'), 'utf-8'));
    tsconfig.compilerOptions = tsconfig.compilerOptions || {};
    tsconfig.compilerOptions.moduleResolution = 'nodenext';
    await fs.writeFile(path.join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
    await runAtProjectDir(`../dist/index.mjs generate`);
    await assertDirFileList({
      dirPath: './composed-client',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    const { y, z, a, b, c }: { y: number; z: number; a: number; b: number; c: number } = await import(
      path.join(projectDir, 'composed-client', 'index.ts') + '?' + Math.random()
    );
    deepStrictEqual({ y, z, a, b, c }, { y: 1, z: 2, a: 3, b: 4, c: 5 });
  });

  // -----

  await it('Generates segmented client', async () => {
    await runAtProjectDir(`../dist/index.mjs generate --segmented-only --segmented-out ./segmented-client`);
    await assertDirFileList({
      dirPath: './segmented-client/root',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    await assertNotExists('./segmented-client/index.ts');
  });

  await it('Generates segmented client --segmented-from and --segmented-out', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --segmented-only --segmented-out ./segmented-client --segmented-from ts`
    );
    await assertDirFileList({
      dirPath: './segmented-client/root',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    await assertNotExists('./segmented-client/index.ts');
    await assertNotExists('./segmented-client/schema.ts');
    await assertDirFileList({
      dirPath: './segmented-client/foo',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    await assertDirFileList({ dirPath: './segmented-client/bar', files: ['baz'] });
    await assertDirFileList({
      dirPath: './segmented-client/bar/baz',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    await assertDirFileList({
      dirPath: './segmented-client/a/b/c/d/e',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
  });

  await it('Generates segmented client with included segments', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      composedClient: {
        enabled: false,
      },
      segmentedClient: {
        outDir: './segmented-client',
        includeSegments: ['foo', 'bar/baz'],
        enabled: true,
      },
    }));
    await runAtProjectDir(`../dist/index.mjs generate`);
    await assertDirFileList({ dirPath: './segmented-client', files: ['foo', 'bar'] });
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'segmented-client/bar/baz', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments), ['bar/baz']);
  });
  await it('Generates segmented client with excluded segments', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      composedClient: {
        enabled: false,
      },
      segmentedClient: {
        outDir: './segmented-client',
        excludeSegments: ['', 'bar/baz'],
        enabled: true,
      },
    }));
    await runAtProjectDir(`../dist/index.mjs generate`);
    await assertDirFileList({ dirPath: './segmented-client', files: ['foo', 'a'] });
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'segmented-client/foo', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments), ['foo']);
  });

  await it('Generates segmented client with included segments using --segmented-include-segments flag', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      composedClient: {
        enabled: false,
      },
    }));
    await runAtProjectDir(
      `../dist/index.mjs generate --segmented-include-segments foo --segmented-include-segments bar/baz --segmented-out ./segmented-client`
    );
    await assertDirFileList({ dirPath: './segmented-client', files: ['foo', 'bar'] });
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'segmented-client/bar/baz', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments), ['bar/baz']);
  });

  await it('Generates segmented client with excluded segments using --segmented-include-segments flag', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      composedClient: {
        enabled: false,
      },
    }));
    await runAtProjectDir(
      `../dist/index.mjs generate --segmented-exclude-segments "" --segmented-exclude-segments bar/baz --segmented-out ./segmented-client`
    );
    await assertDirFileList({ dirPath: './segmented-client', files: ['foo', 'a'] });
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'segmented-client/foo', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments), ['foo']);
  });

  await it('Uses outputConfig re-exports with segmented client (re-exports correspond to their segment, and the top-level re-exports are compiled into the root segment)', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      segmentedClient: {
        outDir: './segmented-client',
        fromTemplates: ['ts'],
      },
      outputConfig: {
        reExports: {
          'x as y': './x.ts',
          z: './z.ts',
        },
        segments: {
          '': {
            reExports: {
              'default as c': './c.ts',
            },
          },
          foo: {
            reExports: {
              'default as a': './a.ts',
            },
          },
          'a/b/c/d/e': {
            reExports: {
              'default as b': './b.ts',
            },
          },
        },
      },
    }));
    await fs.writeFile(path.join(projectDir, 'x.ts'), 'export const x = 1;');
    await fs.writeFile(path.join(projectDir, 'z.ts'), 'export const z = 2;');
    await fs.writeFile(path.join(projectDir, 'a.ts'), 'export default 3;');
    await fs.writeFile(path.join(projectDir, 'b.ts'), 'export default 4;');
    await fs.writeFile(path.join(projectDir, 'c.ts'), 'export default 5;');
    const tsconfig = JSON.parse(await fs.readFile(path.join(projectDir, 'tsconfig.json'), 'utf-8'));
    tsconfig.compilerOptions = tsconfig.compilerOptions || {};
    tsconfig.compilerOptions.moduleResolution = 'nodenext';
    await fs.writeFile(path.join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
    await runAtProjectDir(`../dist/index.mjs generate --segmented-only --segmented-out ./segmented-client`);

    await assertDirFileList({
      dirPath: './segmented-client/root',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    await assertDirFileList({
      dirPath: './segmented-client/foo',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    await assertDirFileList({
      dirPath: './segmented-client/a/b/c/d/e',
      files: ['index.ts', 'schema.ts', 'openapi.ts', 'openapi.json'],
    });
    const { y, z, c }: { y: number; z: number; a: number; b: number; c: number } = await import(
      path.join(projectDir, 'segmented-client/root/index.ts') + '?' + Math.random()
    );
    deepStrictEqual({ y, z, c }, { y: 1, z: 2, c: 5 });
    const { a }: { a: number } = await import(
      path.join(projectDir, 'segmented-client/foo/index.ts') + '?' + Math.random()
    );
    deepStrictEqual({ a }, { a: 3 });
    const { b }: { b: number } = await import(
      path.join(projectDir, 'segmented-client/a/b/c/d/e/index.ts') + '?' + Math.random()
    );
    deepStrictEqual({ b }, { b: 4 });
  });

  await it('Uses origin option', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      outputConfig: {
        origin: 'https://example.com/',
      },
    }));

    await runAtProjectDir(`../dist/index.mjs generate --out ./composed-client-origin-1 --from js --composed-only`);
    const { UserRPC } = await import(path.join(projectDir, 'composed-client-origin-1', 'index.js'));

    deepStrictEqual(UserRPC.createUser.apiRoot, 'https://example.com/api');
  });

  await it('Uses --origin flag', async () => {
    await updateConfig(path.join(projectDir, 'vovk.config.js'), (config) => ({
      ...config,
      outputConfig: {
        origin: 'https://example.com/', // should be overridden by --origin
      },
    }));

    await runAtProjectDir(
      `../dist/index.mjs generate --out ./composed-client-origin-2 --from js --composed-only --origin https://example.org/`
    );
    const { UserRPC } = await import(path.join(projectDir, 'composed-client-origin-2', 'index.js'));

    deepStrictEqual(UserRPC.createUser.apiRoot, 'https://example.org/api');
  });
});
