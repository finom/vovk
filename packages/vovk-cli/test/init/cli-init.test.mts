// 1. Test with --yes DONE
// 2. Test with --use-npm and other options DONE
// 3. Test with --skip-install DONE
// 4. Test with --validation-library none/zod/yup/dto
// 5. Test with prompting
// 6. Test with prompting + flags sich as --update-tsconfig
// 7. Test with prompting + flags sich as --validation-library
// 8. Test with prompting + flags sich as --validate-on-client
// 9. Test config creation at .config folder
// 0. If package.json is type module use .mjs extension
// 10. otherwise use .js
// 11. If tsconfig.json doesn't exists, error
// 12. Dry run

// what to test: run command, check generated config
// before each: set up next.js project
// after each: remove folder

import { it, describe, beforeEach, afterEach } from 'node:test';
import path from 'node:path';
import initAssertions from './lib/initAssertions.mjs';

const dir = 'tmp_test_dir';
const cwd = path.resolve(import.meta.dirname, '../../..');

const { createNextApp, vovkInit, assertConfig, assertDirExists, assertDeps, assertFileExists, assertNotExists } =
  initAssertions({ cwd, dir });

beforeEach(async () => {});

afterEach(async () => {
  // await runScript(`rm -rf ${projectDir}`);
});

void describe.only('New project', async () => {
  await it('Works with --yes', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    // check if packages are installed
    await assertDirExists('./node_modules/vovk');
    await assertDirExists('./node_modules/vovk-cli');
    await assertFileExists('./package-lock.json');
    // check if yarn.lock does not exist
    await assertNotExists('./yarn.lock');
  });

  await it('Works with --yes and --skip-install', async () => {
    await createNextApp('--skip-install');
    await vovkInit('--yes --skip-install');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

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

    // check if packages are installed
    await assertDirExists('./node_modules/vovk');
    await assertDirExists('./node_modules/vovk-cli');
    await assertFileExists('./yarn.lock');

    // check if yarn.lock does not exist
    await assertNotExists('./package-lock.json');
  });
});

void describe('New project (prompting)', async () => {});
