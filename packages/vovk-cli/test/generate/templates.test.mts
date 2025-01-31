import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../lib/getCLIAssertions.mjs';

const compiledClientFolderName = 'client-from-template';

await describe.only('Client templates', async () => {
  const { runAtProjectDir, createNextApp, vovkInit, assertFile, vovkDevAndKill, assertDirFileList } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir',
  });

  beforeEach(async () => {
    await runAtProjectDir(`rm -rf ${compiledClientFolderName}`);
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new controller user');
    await vovkDevAndKill();
  });

  const customTemplatesDir = path.join(import.meta.dirname, '../../../test_data/client-templates');

  await it.only('Basic check', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template ${customTemplatesDir}/hello-world.js --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/hello-world.js`, [`Hello, World!`]);
  });

  await it('Should generate client with full schema only with a custom file name', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --full-schema=my-full-schema.json --out ${compiledClientFolderName} --template=none`
    );

    await assertFile(`${compiledClientFolderName}/my-full-schema.json`, [`"emitSchema": true`]);
    await assertDirFileList(compiledClientFolderName, ['my-full-schema.json']);
  });

  await it('Should use default templates', async () => {
    await runAtProjectDir(`../dist/index.mjs generate --out ${compiledClientFolderName}`);

    await assertDirFileList(compiledClientFolderName, ['index.ts', 'compiled.js', 'compiled.d.ts']);
  });

  await it('Should use default templates explicitly', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template=compiled --template=ts --out ${compiledClientFolderName}`
    );

    await assertDirFileList(compiledClientFolderName, ['index.ts', 'compiled.js', 'compiled.d.ts']);
  });

  await it('Generates files from ts and python template with full schema', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --full-schema --template=ts --template=python --out ${compiledClientFolderName}`
    );

    await assertDirFileList(compiledClientFolderName, ['index.ts', '__init__.py', 'full-schema.json']);
  });

  await it('Generates file from ts template but defines path as custom template', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template=../client-templates/ts/index.ts.ejs --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/index.ts`, [
      'import type { Controllers as Controllers0} from "../src/app/api/[[...vovk]]/route.ts";',
      "schema[''].controllers.UserRPC",
    ]);
    await assertDirFileList(compiledClientFolderName, ['index.ts']);
  });

  await it('Generates file from compiled and custom template', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template=compiled --template=${customTemplatesDir}/custom.ts.ejs --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/compiled.js`, [
      `const { default: fetcher } = require('vovk/dist/client/defaultFetcher')`,
    ]);
    await assertFile(`${compiledClientFolderName}/compiled.d.ts`, [
      'import type { Controllers as Controllers0} from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0} from "../src/app/api/[[...vovk]]/route.ts";',
    ]);

    await assertDirFileList(compiledClientFolderName, ['compiled.js', 'compiled.d.ts', 'custom.ts']);
  });

  await it('Generates files from multiple custom templates', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template=compiled --template=${customTemplatesDir}/custom.ts.ejs --template ${customTemplatesDir}/hello-world.js --template=compiled --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/compiled.js`, [
      `const { default: fetcher } = require('vovk/dist/client/defaultFetcher')`,
    ]);
    await assertFile(`${compiledClientFolderName}/compiled.d.ts`, [
      'import type { Controllers as Controllers0} from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0} from "../src/app/api/[[...vovk]]/route.ts";',
      '// Hello from custom.js.ejs',
    ]);
    await assertDirFileList(compiledClientFolderName, ['compiled.js', 'compiled.d.ts', 'custom.ts', 'hello-world.js']);
  });
});
