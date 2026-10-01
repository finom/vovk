import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { getUserConfig } from '../../../dist/get-project-info/get-config/get-user-config.mjs';
import { createProject } from '../../lib/minimal-project.mts';

const tmpDir = path.join(process.cwd(), 'tmp_get_user_config');

after(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// a package only the project has, as with npx or pnpm, where the CLI is installed elsewhere
const projectOnlyPackage = {
  'node_modules/local-only-bundler/package.json': {
    name: 'local-only-bundler',
    version: '1.0.0',
    type: 'module',
    exports: './index.js',
  },
  'node_modules/local-only-bundler/index.js': `export const name = 'local-only-bundler';`,
  'my-build.mjs': `export const name = 'my-build';`,
};

type BuildResult = Record<string, string | undefined>;
const runBuild = async (cwd: string) => {
  const { userConfig, error } = await getUserConfig({ cwd });
  assert.ok(userConfig, error?.message ?? 'No config loaded');
  return (await userConfig.bundle?.build?.({ entry: '', outDir: '', prebundleDir: '' })) as unknown as BuildResult;
};

await describe('getUserConfig', async () => {
  await it('Resolves imports and import.meta of an ESM config from the config file', async () => {
    const cwd = path.join(tmpDir, 'esm');
    await createProject(cwd, {
      ...projectOnlyPackage,
      'vovk.config.mjs': `export default {
        bundle: {
          build: async () => ({
            relative: (await import('./my-build.mjs')).name,
            bare: (await import('local-only-bundler')).name,
            dirname: import.meta.dirname,
            filename: import.meta.filename,
          }),
        },
      };`,
    });

    assert.deepStrictEqual(await runBuild(cwd), {
      relative: 'my-build',
      bare: 'local-only-bundler',
      dirname: cwd,
      filename: path.join(cwd, 'vovk.config.mjs'),
    });
  });

  await it('Resolves dynamic imports of a CommonJS config from the config file', async () => {
    const cwd = path.join(tmpDir, 'cjs');
    await createProject(cwd, {
      ...projectOnlyPackage,
      'vovk.config.cjs': `module.exports = {
        bundle: {
          build: async () => ({
            relative: (await import('./my-build.mjs')).name,
            bare: (await import('local-only-bundler')).name,
            dirname: __dirname,
          }),
        },
      };`,
    });

    assert.deepStrictEqual(await runBuild(cwd), { relative: 'my-build', bare: 'local-only-bundler', dirname: cwd });
  });

  await it('Reads an edited CommonJS config again', async () => {
    const cwd = path.join(tmpDir, 'cjs-edit');
    const configPath = path.join(cwd, 'vovk.config.cjs');
    // the import keeps it a real import, which Node caches for CommonJS
    const configWithLogLevel = (logLevel: string) =>
      `module.exports = { logLevel: '${logLevel}', bundle: { build: () => import('node:path') } };`;
    await createProject(cwd, { 'vovk.config.cjs': configWithLogLevel('info') });

    assert.strictEqual((await getUserConfig({ cwd })).userConfig?.logLevel, 'info');
    await fs.writeFile(configPath, configWithLogLevel('debug'));
    assert.strictEqual((await getUserConfig({ cwd })).userConfig?.logLevel, 'debug');
  });
});
