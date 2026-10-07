import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { getSegmentNameFromRouteFile, SEGMENT_ROUTE_FILE_REGEX } from '../../../dist/dev/index.mjs';
import { getClientTemplateFiles } from '../../../dist/generate/get-client-template-files.mjs';
import { getProjectFullSchema } from '../../../dist/generate/get-project-full-schema.mjs';
import { getLogger } from '../../../dist/utils/get-logger.mjs';
import { toImportPath, toPosixPath } from '../../../dist/utils/to-import-path.mjs';

// brackets and parentheses are pattern syntax for glob, a project path may still hold them
const tmpDir = path.join(process.cwd(), 'tmp_paths_[client] (app)');
const log = getLogger('warn');

after(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

await describe('Paths in generated code and file lookups', async () => {
  await it('Turns a Windows relative path into an import path', () => {
    const fromClient = (to: string) => path.win32.relative('C:\\proj\\src\\client', to);

    assert.strictEqual(
      toImportPath(fromClient('C:\\proj\\src\\app\\api\\[[...vovk]]\\route.ts')),
      '../app/api/[[...vovk]]/route.ts'
    );
    assert.strictEqual(toImportPath(fromClient('C:\\proj\\src\\client\\lib\\fetcher')), './lib/fetcher');
    assert.strictEqual(toPosixPath(path.win32.relative('src\\client\\root', '.vovk-schema')), '../../../.vovk-schema');
  });

  await it('Prefixes a relative import path that would read as a package name', () => {
    assert.strictEqual(toImportPath('fetcher'), './fetcher');
    assert.strictEqual(toImportPath('.vovk-schema/root.json'), './.vovk-schema/root.json');
    assert.strictEqual(toImportPath('./fetcher'), './fetcher');
    assert.strictEqual(toImportPath('../lib/fetcher'), '../lib/fetcher');
    assert.strictEqual(toImportPath('..'), '..');
  });

  await it('Reads segment names from Windows route file paths', () => {
    const apiDir = 'C:\\proj\\src\\app\\api';
    const nestedRouteFile = `${apiDir}\\foo\\bar\\[[...vovk]]\\route.ts`;

    assert.ok(SEGMENT_ROUTE_FILE_REGEX.test(nestedRouteFile));
    assert.ok(!SEGMENT_ROUTE_FILE_REGEX.test(`${apiDir}\\foo\\page.ts`));
    assert.strictEqual(getSegmentNameFromRouteFile(path.win32.relative(apiDir, nestedRouteFile)), 'foo/bar');
    assert.strictEqual(
      getSegmentNameFromRouteFile(path.win32.relative(apiDir, `${apiDir}\\[[...vovk]]\\route.ts`)),
      ''
    );
    assert.strictEqual(getSegmentNameFromRouteFile('foo/[[...vovk]]/route.ts'), 'foo');
  });

  await it('Finds template files when the template path holds pattern syntax', async () => {
    const templatePath = path.join(tmpDir, 'template');
    await fs.mkdir(path.join(templatePath, 'sub'), { recursive: true });
    await fs.writeFile(path.join(templatePath, 'index.ts.ejs'), '');
    await fs.writeFile(path.join(templatePath, 'sub', 'helper.ts.ejs'), '');

    const config = {
      clientTemplateDefs: { custom: { templatePath } },
      composedClient: { fromTemplates: ['custom'], outDir: 'out' },
      segmentedClient: { fromTemplates: [], outDir: 'out' },
    } as unknown as Parameters<typeof getClientTemplateFiles>[0]['config'];

    const { templateFiles } = await getClientTemplateFiles({ config, cwd: tmpDir, log, configKey: 'composedClient' });

    assert.deepStrictEqual(templateFiles.map(({ templateFilePath }) => templateFilePath).sort(), [
      path.join(templatePath, 'index.ts.ejs'),
      path.join(templatePath, 'sub', 'helper.ts.ejs'),
    ]);
  });

  await it('Reads schema files when the schema path holds pattern syntax', async () => {
    const schemaOutAbsolutePath = path.join(tmpDir, '.vovk-schema');
    await fs.mkdir(path.join(schemaOutAbsolutePath, 'bar'), { recursive: true });
    for (const segmentName of ['', 'foo', 'bar/baz']) {
      await fs.writeFile(
        path.join(schemaOutAbsolutePath, `${segmentName || 'root'}.json`),
        JSON.stringify({ segmentName, controllers: {} })
      );
    }

    const fullSchema = await getProjectFullSchema({
      schemaOutAbsolutePath,
      isOwnSchemaFolder: false,
      isNextInstalled: false,
      log,
      config: { exposeConfigKeys: [] } as unknown as Parameters<typeof getProjectFullSchema>[0]['config'],
    });

    assert.deepStrictEqual(Object.keys(fullSchema.segments).sort(), ['', 'bar/baz', 'foo']);
  });
});
