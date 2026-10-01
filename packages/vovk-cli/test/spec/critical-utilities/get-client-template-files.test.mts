import assert from 'node:assert';
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

    assert.deepStrictEqual(templateFiles.map(({ outCwdRelativeDir }) => outCwdRelativeDir).sort(), [
      path.join('out', 'b', './'),
      path.join('out', 'c', './'),
    ]);
  });
});
