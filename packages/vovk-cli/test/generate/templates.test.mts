import { it, describe, beforeEach } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../lib/getCLIAssertions.mjs';

/*
 .option('--out, --client-out-dir <path>', 'Path to output directory')
  .option('--template, --templates <templates...>', 'Client code templates ("ts", "compiled", "python", "none", a custom path)')
  .option('--full-schema [fileName]', 'Generate client with full schema')
  .option('--prettify', 'Prettify output files')
*/

// TODO add more tests
const compiledClientFolderName = 'client-from-template';
await describe('Custom client templates', async () => {
  beforeEach(() => runAtProjectDir(`rm -rf ${compiledClientFolderName}`));

  const { runAtProjectDir, createNextApp, vovkInit, assertFile, vovkDevAndKill } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir',
  });

  const templatesDir = path.join(import.meta.dirname, '../../../test_data/client-templates');

  await it('Basic check', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment');
    await vovkDevAndKill();
    await runAtProjectDir(
      `../dist/index.mjs generate --full-schema --template ${templatesDir}/hello-world.js --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/hello-world.js`, [`Hello, World!`]);
  });

  await it('Should generate client with custom templates', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment');
    await vovkDevAndKill();
    await runAtProjectDir(`../dist/index.mjs generate --template ${templatesDir}/custom.js.ejs`);

    await assertFile('client-from-template/foo.js', [`Hello, World!`]);
  });

  await it.skip('Should generate standard client', async () => {
    // TODO provide ejs variables to the template
  });

  await it.skip('Should generate full schema only', async () => {});

  await it.skip('Should generate compiled client only', async () => {});

  await it.skip('Should generate TS client only', async () => {});

  await it.skip('Should generate Python client', async () => {});

  await it.skip('Should use multiple templates', async () => {});
});
