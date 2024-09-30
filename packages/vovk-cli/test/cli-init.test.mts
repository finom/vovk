// 1. Test with --yes DONE
// 2. Test with --use-npm and other options
// 4. Test with --skip-install DONE
// 3. Test with prompting
// 5. Test with prompting + flags sich as --update-tsconfig
// 6. Test with prompting + flags sich as --validation-library
// 7. Test with prompting + flags sich as --validate-on-client
// 8. Test config creation at .config folder
// 9. If package.json is type module use .mjs extension
// 10. Template list in config
// 10. otherwise use .js
// 11. If tsconfig.json doesn't exists?

// what to test: run command, check generated config
// before each: set up next.js project
// after each: remove folder

import assert from 'node:assert';
import { it, describe, beforeEach, afterEach } from 'node:test';
import path from 'node:path';
import getUserConfig from '../src/getProjectInfo/getUserConfig.mjs';
import { runScript } from './lib/runScript.mjs';
import getFileSystemEntryType, { FileSystemEntryType } from '../src/utils/getFileSystemEntryType.mjs';
import { VovkConfig } from '../src/types.mjs';

const dir = 'tmp_test_dir';
const cwd = path.resolve(import.meta.dirname, '..');
const projectDir = path.join(cwd, dir);

async function createNextApp(extraParams?: string) {
  await runScript(`rm -rf ${projectDir}`);
  await runScript(
    `npx create-next-app ${dir} --ts --app --src-dir --no-eslint --no-tailwind --no-import-alias ${extraParams ?? ''}`,
    {
      cwd,
    }
  );
}

async function initVovk(extraParams?: string) {
  await runScript(`./dist/index.mjs init ${dir} ${extraParams}`, { cwd });
}

async function assertConfig(testConfigPaths: string[], testConfig: VovkConfig) {
  const { userConfig, configAbsolutePaths } = await getUserConfig({ cwd: projectDir });

  assert.deepStrictEqual(userConfig, testConfig);

  assert.deepStrictEqual(
    configAbsolutePaths,
    testConfigPaths.map((p) => path.join(projectDir, p))
  );
}

beforeEach(async () => {});

afterEach(async () => {
  // await runScript(`rm -rf ${projectDir}`);
});

void describe.only('New project', async () => {
  await it.only('Works with --yes', async () => {
    await createNextApp();
    await initVovk('--yes');
    await assertConfig(['vovk.config.js'], {
      validationLibrary: 'vovk-zod',
      validateOnClient: 'vovk-zod/validateOnClient',
      templates: {
        controller: 'vovk-zod/templates/controller.ejs',
        service: 'vovk-zod/templates/service.ejs',
        worker: 'vovk-cli/templates/worker.ejs',
      },
    });

    // check if packages are installed
    assert.strictEqual(
      await getFileSystemEntryType(path.join(projectDir, './node_modules/vovk')),
      FileSystemEntryType.DIRECTORY
    );

    assert.strictEqual(
      await getFileSystemEntryType(path.join(projectDir, './node_modules/vovk-cli')),
      FileSystemEntryType.DIRECTORY
    );

    assert.strictEqual(
      await getFileSystemEntryType(path.join(projectDir, './package-lock.json')),
      FileSystemEntryType.FILE
    );
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, './yarn.lock')), null);
  });

  await it('Works with --yes and --skip-install', async () => {
    await createNextApp('--skip-install');
    await initVovk('--yes --skip-install');
    await assertConfig(['vovk.config.js'], {
      validationLibrary: 'vovk-zod',
      validateOnClient: 'vovk-zod/validateOnClient',
      templates: {
        controller: 'vovk-zod/templates/controller.ejs',
        service: 'vovk-zod/templates/service.ejs',
        worker: 'vovk-cli/templates/worker.ejs',
      },
    });

    // check if packages are NOT installed
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, './node_modules')), null);
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, './package-lock.json')), null);
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, './yarn.lock')), null);
  });

  await it('Works with --yes and --use-yarn', async () => {
    await createNextApp('--use-yarn');
    await initVovk('--yes --use-yarn');
    await assertConfig(['vovk.config.js'], {
      validationLibrary: 'vovk-zod',
      validateOnClient: 'vovk-zod/validateOnClient',
      templates: {
        controller: 'vovk-zod/templates/controller.ejs',
        service: 'vovk-zod/templates/service.ejs',
        worker: 'vovk-cli/templates/worker.ejs',
      },
    });

    // check if packages are installed
    assert.strictEqual(
      await getFileSystemEntryType(path.join(projectDir, './node_modules/vovk')),
      FileSystemEntryType.DIRECTORY
    );

    assert.strictEqual(
      await getFileSystemEntryType(path.join(projectDir, './node_modules/vovk-cli')),
      FileSystemEntryType.DIRECTORY
    );

    assert.strictEqual(
      await getFileSystemEntryType(path.join(projectDir, './package-lock.json')),
      FileSystemEntryType.FILE
    );
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, './yarn.lock')), null);
  });

  await it('Works with --yes, --use-yarn and --skip-install', async () => {
    await createNextApp('--use-yarn --skip-install');
    await initVovk('--yes --use-yarn --skip-install');
    await assertConfig(['vovk.config.js'], {
      validationLibrary: 'vovk-zod',
      validateOnClient: 'vovk-zod/validateOnClient',
      templates: {
        controller: 'vovk-zod/templates/controller.ejs',
        service: 'vovk-zod/templates/service.ejs',
        worker: 'vovk-cli/templates/worker.ejs',
      },
    });

    // check if packages are NOT installed
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, './node_modules')), null);
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, './package-lock.json')), null);
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, './yarn.lock')), null);
  });
});
