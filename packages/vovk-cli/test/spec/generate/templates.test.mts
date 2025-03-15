import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';

const compiledClientFolderName = 'client-from-template';

await describe('Client templates', async () => {
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

  const customTemplatesDir = path.join(import.meta.dirname, '../../data/client-templates');

  await it('Basic check', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template ${customTemplatesDir}/hello-world.js --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/hello-world.js`, [`Hello, World!`]);
  });

  await it('Should generate client with full schema only', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --full-schema-json --out ${compiledClientFolderName} --template=none`
    );

    await assertFile(`${compiledClientFolderName}/full-schema.json`, [`"emitSchema": true`]);
    await assertDirFileList(compiledClientFolderName, ['full-schema.json']);
  });

  await it('Should generate client with full schema only with a custom file name', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --full-schema-json=my-full-schema.json --out ${compiledClientFolderName} --template=none`
    );

    await assertFile(`${compiledClientFolderName}/my-full-schema.json`, [`"emitSchema": true`]);
    await assertDirFileList(compiledClientFolderName, ['my-full-schema.json']);
  });

  await it('Should use default templates', async () => {
    await runAtProjectDir(`../dist/index.mjs generate --out ${compiledClientFolderName}`);

    await assertDirFileList(compiledClientFolderName, [
      'main.cjs',
      'main.d.cts',
      'module.mjs',
      'module.d.mts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);
  });

  await it('Should use default templates explicitly', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template=module --template=ts --out ${compiledClientFolderName}`
    );

    await assertDirFileList(compiledClientFolderName, [
      'index.ts',
      'module.mjs',
      'module.d.mts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);
  });

  await it('Generates file from ts template but defines path as custom template', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template=../client-templates/ts/* --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/index.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
      'export const UserRPC = createRPC<Controllers0["UserRPC"], Options>(',
    ]);
    await assertDirFileList(compiledClientFolderName, ['index.ts']);
  });

  await it('Generates file from compiled and custom template', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template=main --template=${customTemplatesDir}/custom.ts.ejs --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/main.cjs`, [`const { fetcher } = require('vovk')`]);
    await assertFile(`${compiledClientFolderName}/main.d.cts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);

    await assertDirFileList(compiledClientFolderName, [
      'main.cjs',
      'main.d.cts',
      'custom.ts',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);
  });

  await it('Generates files from multiple custom templates', async () => {
    await runAtProjectDir(
      `../dist/index.mjs generate --template=main --template=${customTemplatesDir}/custom.ts.ejs --template ${customTemplatesDir}/hello-world.js --template=main --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/main.cjs`, [`const { fetcher } = require('vovk')`]);
    await assertFile(`${compiledClientFolderName}/main.d.cts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
      '// Hello from custom.js.ejs',
    ]);
    await assertDirFileList(compiledClientFolderName, [
      'main.cjs',
      'main.d.cts',
      'custom.ts',
      'hello-world.js',
      'fullSchema.cjs',
      'fullSchema.d.cts',
    ]);
  });
});
