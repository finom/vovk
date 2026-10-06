import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { getClientTemplateFiles } from '../../../dist/generate/get-client-template-files.mjs';
import { getTemplateDefs } from '../../../dist/get-project-info/get-config/get-template-defs.mjs';
import { getLogger } from '../../../dist/utils/get-logger.mjs';

type Config = Parameters<typeof getClientTemplateFiles>[0]['config'];

const getTemplateFiles = (clientTemplateDefs: Config['clientTemplateDefs'], fromTemplates: string[]) =>
  getClientTemplateFiles({
    config: {
      clientTemplateDefs: getTemplateDefs(clientTemplateDefs),
      composedClient: { fromTemplates, outDir: 'out' },
      segmentedClient: { fromTemplates: [], outDir: 'out' },
    } as unknown as Config,
    cwd: process.cwd(),
    log: getLogger('warn'),
    configKey: 'composedClient',
  });

await describe('getClientTemplateFiles', async () => {
  await it('Rejects templates that require each other in a loop', async () => {
    await assert.rejects(getTemplateFiles({ a: { requires: { b: './' } }, b: { requires: { a: './' } } }, ['a']), {
      message: 'Client templates require each other in a loop: "a" → "b" → "a"',
    });
  });

  await it('Rejects a template that extends one requiring it back', async () => {
    // "ts" requires "tsBase", so "tsBase" extending "ts" requires itself
    await assert.rejects(getTemplateFiles({ tsBase: { extends: 'ts' } }, ['ts']), {
      message: 'Client templates require each other in a loop: "ts" → "tsBase" → "tsBase"',
    });
  });

  await it('Accepts a template required twice through different templates', async () => {
    const { templateFiles } = await getTemplateFiles(
      {
        a: { requires: { b: './b/', c: './c/' } },
        b: { requires: { schemaJson: './' } },
        c: { requires: { schemaJson: './' } },
      },
      ['a']
    );

    assert.deepStrictEqual(
      templateFiles.map(({ outCwdRelativeDir, relativeDir }) => path.join(outCwdRelativeDir, relativeDir)).sort(),
      [path.join('out', 'b', './'), path.join('out', 'c', './')]
    );
  });

  await it('Takes every file of a template folder, dotfiles and files without an extension included', async () => {
    const templateDir = path.join(process.cwd(), 'tmp_template_files');
    const files = ['.gitignore', 'LICENSE', 'index.ts.ejs', path.join('bin', 'run')];
    await fs.rm(templateDir, { recursive: true, force: true });
    for (const file of files) {
      await fs.mkdir(path.dirname(path.join(templateDir, file)), { recursive: true });
      await fs.writeFile(path.join(templateDir, file), '');
    }

    try {
      const { templateFiles } = await getTemplateFiles({ custom: { templatePath: templateDir } }, ['custom']);

      assert.deepStrictEqual(
        templateFiles.map(({ templateFilePath }) => path.relative(templateDir, templateFilePath)).sort(),
        files.sort()
      );
    } finally {
      await fs.rm(templateDir, { recursive: true, force: true });
    }
  });
});
