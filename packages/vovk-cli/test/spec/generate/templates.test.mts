import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import updateConfig from '../../lib/updateConfig.mts';

const compiledClientFolderName = 'client-from-template';

await describe('Client templates', async () => {
  const { projectDir, runAtProjectDir, createNextApp, vovkInit, assertFile, vovkDevAndKill, assertDirFileList } =
    getCLIAssertions({
      cwd: path.resolve(import.meta.dirname, '../../..'),
      dir: 'tmp_test_dir',
    });
  const customTemplatesDir = path.join(import.meta.dirname, '../../data/client-templates');

  beforeEach(async () => {
    try {
      await runAtProjectDir(`rm -rf ${compiledClientFolderName}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`Error removing ${compiledClientFolderName}: ${e}`);
    }
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new controller user');
    await vovkDevAndKill();
    await updateConfig(projectDir + '/vovk.config.js', (config) => ({
      ...config,
      clientTemplateDefs: {
        custom: {
          templatePath: path.join(customTemplatesDir, './custom'),
        },
        customAsFile: {
          templatePath: path.join(customTemplatesDir, './custom/custom.ts.ejs'),
        },
        helloWorld: {
          templatePath: path.join(customTemplatesDir, './hello-world'),
        },
      },
    }));
  });

  await it('Should use default templates', async () => {
    await runAtProjectDir(`../dist/index.mjs generate --out ${compiledClientFolderName}`);

    await assertDirFileList(compiledClientFolderName, [
      'index.cjs',
      'index.d.cts',
      'index.mjs',
      'index.d.mts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);
  });

  await it('Should use default templates explicitly', async () => {
    await runAtProjectDir(`../dist/index.mjs generate --from=mjs --from=ts --out ${compiledClientFolderName}`);

    await assertDirFileList(compiledClientFolderName, [
      'index.ts',
      'index.mjs',
      'index.d.mts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
      'fullSchema.ts',
    ]);
  });

  await it('Generates file from compiled and custom template', async () => {
    await runAtProjectDir(`../dist/index.mjs generate --from=cjs --from=custom --out ${compiledClientFolderName}`);

    await assertFile(`${compiledClientFolderName}/index.cjs`, [`const { fetcher } = require('vovk')`]);
    await assertFile(`${compiledClientFolderName}/index.d.cts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);

    await assertDirFileList(compiledClientFolderName, [
      'index.cjs',
      'index.d.cts',
      'custom.ts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);
  });

  await it('Generates file from compiled and custom template as file', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --from=cjs --from=customAsFile --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/index.cjs`, [`const { fetcher } = require('vovk')`]);
    await assertFile(`${compiledClientFolderName}/index.d.cts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);

    await assertDirFileList(compiledClientFolderName, [
      'index.cjs',
      'index.d.cts',
      'custom.ts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);
  });

  await it('Generates files from multiple custom templates', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --from=cjs --from=custom --from helloWorld --from=cjs --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/index.cjs`, [`const { fetcher } = require('vovk')`]);
    await assertFile(`${compiledClientFolderName}/index.d.cts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
      '// Hello from custom.js.ejs',
    ]);
    await assertDirFileList(compiledClientFolderName, [
      'index.cjs',
      'index.d.cts',
      'custom.ts',
      'hello-world.js',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);
  });
});
