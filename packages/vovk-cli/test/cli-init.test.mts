// 1. Test with --yes
// 2. Test with --use-npm and other options
// 4. Test with --skip-install
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

const dir = 'tmp_test_dir';
const cwd = path.resolve(import.meta.dirname, '..');
const projectDir = path.join(cwd, dir);

beforeEach(async () => {
  await runScript(`rm -rf ${projectDir}`);
  await runScript(
    `npx create-next-app ${dir} --ts --app --src-dir --no-eslint --no-tailwind --no-import-alias --skip-install`,
    {
      cwd,
    }
  );
  await runScript(`npm --prefix ${dir} i`, { cwd });
});

afterEach(async () => {
  // await runScript(`rm -rf ${projectDir}`);
});

void describe.only('New project', async () => {
  await it('Works with --yes', async () => {
    await runScript(`./dist/index.mjs init ${dir} --yes`, { cwd });
    const { userConfig, configAbsolutePaths } = await getUserConfig({ cwd: projectDir });

    assert.deepStrictEqual(userConfig, {
      validationLibrary: 'vovk-zod',
      validateOnClient: 'vovk-zod/validateOnClient',
      templates: {
        controller: 'vovk-zod/templates/controller.ejs',
        service: 'vovk-zod/templates/service.ejs',
        worker: 'vovk-cli/templates/worker.ejs',
      },
    });

    assert.deepStrictEqual(configAbsolutePaths, [path.join(projectDir, 'vovk.config.js')]);
    assert.strictEqual(1, 1);
  });
});
