import { it, describe, beforeEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import path from 'node:path';
import type { VovkSchema } from 'vovk';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import updateConfig from '../../lib/updateConfig.mts';

await describe('Full & segmented client', async () => {
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

  await it('Generates composed client', async () => {
    await runAtProjectDir(`../dist/index.mjs generate`);

    await assertDirFileList('./node_modules/.vovk-client', [
      'index.mjs',
      'index.d.mts',
      'index.cjs',
      'index.d.cts',
      'schema.cjs',
      'schema.d.cts',
    ]);

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
    await assertDirFileList('./composed-client', ['index.ts', 'schema.ts']);
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
    await assertDirFileList('./composed-client', ['index.ts', 'schema.ts']);
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
    await assertDirFileList('./composed-client', ['index.ts', 'schema.ts']);
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-client', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Generates composed client with included segments using --include flag', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --include foo --include bar/baz --out ./composed-client --from ts`
    );
    await assertDirFileList('./composed-client', ['index.ts', 'schema.ts']);
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-client', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'bar/baz'].sort());
  });

  await it('Generates composed client with excluded segments using --exclude flag', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --exclude "" --exclude bar/baz --out ./composed-client --from ts`
    );
    await assertDirFileList('./composed-client', ['index.ts', 'schema.ts']);
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'composed-client', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments).sort(), ['foo', 'a/b/c/d/e'].sort());
  });

  await it('Generates segmented client', async () => {
    await runAtProjectDir(`../dist/index.mjs generate --segmented-only --segmented-out ./segmented-client`);
    await assertDirFileList('./segmented-client/root', ['index.ts', 'schema.ts']);
    await assertNotExists('./segmented-client/index.ts');
  });

  await it('Generates segmented client --segmented-from and --segmented-out', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --segmented-only --segmented-out ./segmented-client --segmented-from ts`
    );
    await assertDirFileList('./segmented-client/root', ['index.ts', 'schema.ts']);
    await assertNotExists('./segmented-client/index.ts');
    await assertNotExists('./segmented-client/schema.ts');
    await assertDirFileList('./segmented-client/foo', ['index.ts', 'schema.ts']);
    await assertDirFileList('./segmented-client/bar', ['baz']);
    await assertDirFileList('./segmented-client/bar/baz', ['index.ts', 'schema.ts']);
    await assertDirFileList('./segmented-client/a/b/c/d/e', ['index.ts', 'schema.ts']);
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
    await assertDirFileList('./segmented-client', ['foo', 'bar']);
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
    await assertDirFileList('./segmented-client', ['foo', 'a']);
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
    await assertDirFileList('./segmented-client', ['foo', 'bar']);
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
    await assertDirFileList('./segmented-client', ['foo', 'a']);
    const { schema }: { schema: VovkSchema } = await import(
      path.join(projectDir, 'segmented-client/foo', 'schema.ts') + '?' + Math.random()
    );
    deepStrictEqual(Object.keys(schema.segments), ['foo']);
  });
});
