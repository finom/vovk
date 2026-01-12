import { it, describe } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import updateConfig from '../../lib/updateConfig.mts';

const compiledClientFolderName = 'client_from_template';

await describe('Client templates', async () => {
  const { runAtProjectDir, assertFile, vovkDevAndKill, assertDirFileList, createVovkApp } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir_client_templates',
  });
  const customTemplatesDir = path.join(import.meta.dirname, '../../data/client-templates');

  const createApp = async ({
    devAndKillFlags = '',
    cache = true,
  }: { devAndKillFlags?: string; cache?: boolean } = {}) => {
    await createVovkApp({
      vovkInitFlags: '--yes',
      cacheKey: 'templates-test',
      cache,
      runInCacheDir: async ({ cwd }) => {
        await runAtProjectDir('../dist/index.mjs new segment', { cwd });
        await runAtProjectDir('../dist/index.mjs new controller user', { cwd });
        await updateConfig(cwd + '/vovk.config.js', () => ({
          outputConfig: {
            package: {
              name: compiledClientFolderName,
            },
          },
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
        await vovkDevAndKill(devAndKillFlags, { cwd });
        await runAtProjectDir(`rm -rf ${compiledClientFolderName}`, { cwd });
      },
    });
  };

  await it('Generates composed client from custom schema dir using --schema-out for dev and --schema for generate', async () => {
    await createApp({ devAndKillFlags: '--schema-out ./custom-schema-dir', cache: false });
    await runAtProjectDir(`../dist/index.mjs generate --out ${compiledClientFolderName} --schema ./custom-schema-dir`);

    await assertDirFileList({
      dirPath: compiledClientFolderName,
      files: ['index.js', 'index.d.ts', 'schema.js', 'schema.d.ts', 'openapi.json', 'openapi.d.ts', 'openapi.js'],
    });

    assertFile(`${compiledClientFolderName}/schema.js`, [`require('./../custom-schema-dir/root.json')`]);
  });

  await it('Should use default templates', async () => {
    await createApp();
    await runAtProjectDir(`../dist/index.mjs generate --out ${compiledClientFolderName}`);

    await assertDirFileList({
      dirPath: compiledClientFolderName,
      files: ['index.js', 'index.d.ts', 'schema.js', 'schema.d.ts', 'openapi.json', 'openapi.d.ts', 'openapi.js'],
    });
  });

  await it('Should use default templates explicitly', async () => {
    await createApp();
    await runAtProjectDir(`../dist/index.mjs generate --from=js --from=ts --out ${compiledClientFolderName}`);

    await assertDirFileList({
      dirPath: compiledClientFolderName,
      files: [
        'index.ts',
        'index.js',
        'index.d.ts',
        'schema.js',
        'schema.d.ts',
        'schema.ts',
        'openapi.json',
        'openapi.d.ts',
        'openapi.js',
        'openapi.ts',
      ],
    });
  });

  await it('Generates file from compiled and custom template', async () => {
    await createApp();
    await runAtProjectDir(`../dist/index.mjs generate --from=js --from=custom --out ${compiledClientFolderName}`);

    await assertFile(`${compiledClientFolderName}/index.js`, [`import { createRPC } from 'vovk/createRPC';`]);
    await assertFile(`${compiledClientFolderName}/index.d.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);

    await assertDirFileList({
      dirPath: compiledClientFolderName,
      files: [
        'index.js',
        'index.d.ts',
        'custom.ts',
        'schema.js',
        'schema.d.ts',
        'openapi.json',
        'openapi.d.ts',
        'openapi.js',
      ],
    });
  });

  await it('Generates file from compiled and custom template as file', async () => {
    await createApp();
    await runAtProjectDir(`../dist/index.mjs generate --from=js --from=customAsFile --out ${compiledClientFolderName}`);

    await assertFile(`${compiledClientFolderName}/index.js`, [`import { createRPC } from 'vovk/createRPC';`]);
    await assertFile(`${compiledClientFolderName}/index.d.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);

    await assertDirFileList({
      dirPath: compiledClientFolderName,
      files: [
        'index.js',
        'index.d.ts',
        'custom.ts',
        'schema.js',
        'schema.d.ts',
        'openapi.json',
        'openapi.d.ts',
        'openapi.js',
      ],
    });
  });

  await it('Generates files from multiple custom templates', async () => {
    await createApp();
    await runAtProjectDir(
      `../dist/index.mjs generate --from=js --from=custom --from helloWorld --from=js --out ${compiledClientFolderName}`
    );

    await assertFile(`${compiledClientFolderName}/index.js`, [`import { createRPC } from 'vovk/createRPC';`]);
    await assertFile(`${compiledClientFolderName}/index.d.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
    ]);
    await assertFile(`${compiledClientFolderName}/custom.ts`, [
      'import type { Controllers as Controllers0 } from "../src/app/api/[[...vovk]]/route.ts";',
      '// Hello from custom.js.ejs',
    ]);
    await assertDirFileList({
      dirPath: compiledClientFolderName,
      files: [
        'index.js',
        'index.d.ts',
        'custom.ts',
        'hello-world.js',
        'schema.js',
        'schema.d.ts',
        'openapi.json',
        'openapi.d.ts',
        'openapi.js',
      ],
    });
  });

  await it('Generates README.md and package.json', async () => {
    await createApp();
    await runAtProjectDir(
      `../dist/index.mjs generate --from=readme --from=packageJson --out ${compiledClientFolderName}`
    );
    await assertFile(`${compiledClientFolderName}/README.md`, ['client_from_template']);
    await assertFile(`${compiledClientFolderName}/package.json`, ['"name": "client_from_template"']);
  });

  await it('Generates Python client', async () => {
    await createApp();
    await runAtProjectDir(`../dist/index.mjs generate --from=py --out ${compiledClientFolderName}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await assertDirFileList({
      dirPath: compiledClientFolderName,
      files: ['src', 'README.md', 'setup.cfg', 'pyproject.toml'],
    });
    await assertDirFileList({ dirPath: `${compiledClientFolderName}/src`, files: [compiledClientFolderName] });
    await assertDirFileList({
      dirPath: `${compiledClientFolderName}/src/${compiledClientFolderName}`,
      files: ['__init__.py', 'api_client.py', 'py.typed', 'schema.json'],
    });
  });

  await it('Generates Rust client', async () => {
    await createApp();
    await runAtProjectDir(`../dist/index.mjs generate --from=rs --out ${compiledClientFolderName}`);
    await assertDirFileList({ dirPath: compiledClientFolderName, files: ['Cargo.toml', 'src', 'README.md'] });
    await assertDirFileList({
      dirPath: `${compiledClientFolderName}/src`,
      files: ['lib.rs', 'http_request.rs', 'read_full_schema.rs', 'schema.json'],
    });
  });
});
