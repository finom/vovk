// 1. Test with --yes DONE
// 2. Test with --use-npm and other options DONE
// 3. Test with --skip-install DONE
// 4. Test with --validation-library none/zod/yup/dto DONE
// 5. Test with prompting
// 6. Test with prompting + flags sich as --update-tsconfig
// 7. Test with prompting + flags sich as --validation-library
// 8. Test with prompting + flags sich as --validate-on-client
// 9. Test config creation at .config folder DONE
// 10. If package.json is type module use .mjs extension DONE
// 12. Dry run DONE
// 13. Update scripts option DONE

// what to test: run command, check generated config
// before each: set up next.js project
// after each: remove folder

import { it, describe } from 'node:test';
import path from 'node:path';
import fs from 'node:fs/promises';
import initAssertions from './lib/initAssertions.mjs';
import { runScript } from '../lib/runScript.mjs';

const dir = 'tmp_test_dir';
const cwd = path.resolve(import.meta.dirname, '../../..');

const {
  createNextApp,
  vovkInit,
  assertConfig,
  assertScripts,
  assertDirExists,
  assertDeps,
  assertFileExists,
  assertNotExists,
  assertTsConfig,
} = initAssertions({ cwd, dir });

void describe.only('New project', async () => {
  await it('Works with --yes', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();

    // check if packages are installed
    await assertDirExists('./node_modules/vovk');
    await assertDirExists('./node_modules/vovk-cli');
    await assertFileExists('./package-lock.json');
    // check if yarn.lock does not exist
    await assertNotExists('./yarn.lock');
  });

  await it('Works with --yes and --dry-run', async () => {
    await createNextApp();
    await vovkInit('--yes --dry-run');
    await assertConfig([], null);

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
      opposite: true,
    });

    await assertScripts({
      dev: 'next dev',
      generate: undefined,
    });

    await assertTsConfig(true);

    // check if packages are OK
    await assertNotExists('./node_modules/vovk');
    await assertNotExists('./node_modules/vovk-cli');
    await assertFileExists('./package-lock.json');
  });

  await it('Works with --yes and --update-scripts=implicit', async () => {
    await createNextApp();
    await vovkInit('--yes --update-scripts=implicit');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --update-scripts=explicit', async () => {
    await createNextApp();
    await vovkInit('--yes --update-scripts=explicit');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: "PORT=3000 concurrently 'vovk dev' 'next dev' --kill-others",
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --skip-install', async () => {
    await createNextApp('--skip-install');
    await vovkInit('--yes --skip-install');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();

    await assertNotExists('./node_modules/vovk');
    await assertNotExists('./node_modules/vovk-cli');
  });

  await it('Works with --yes and --use-yarn', async () => {
    await createNextApp('--use-yarn');
    await vovkInit('--yes --use-yarn');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();

    // check if packages are installed
    await assertDirExists('./node_modules/vovk');
    await assertDirExists('./node_modules/vovk-cli');
    await assertFileExists('./yarn.lock');

    // check if yarn.lock does not exist
    await assertNotExists('./package-lock.json');
  });

  await it('Works with --yes and --validation-library="none"', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig(null));

    await assertDeps({
      dependencies: ['vovk'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library="vovk-zod"', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=vovk-zod');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library="vovk-yup"', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=vovk-yup');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-yup'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-yup', 'yup'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library="vovk-dto"', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=vovk-dto');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-dto'));

    await assertDeps({
      dependencies: ['vovk', 'class-validator', 'class-transformer'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Utilizes .config folder', async () => {
    await createNextApp();
    await runScript('mkdir .config', { cwd: path.join(cwd, dir) });
    await vovkInit('--yes');
    await assertConfig(['.config/vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('If type pf package is "module", creates an .mjs file', async () => {
    await createNextApp();
    // set package.json type to module
    const pkgPath = path.join(cwd, dir, 'package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8')) as { type?: string };
    pkg.type = 'module';
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    await vovkInit('--yes');
    await assertConfig(['vovk.config.mjs'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });
});
