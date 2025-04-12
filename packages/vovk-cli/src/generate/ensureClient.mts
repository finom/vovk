import fs from 'node:fs/promises';
import path from 'node:path';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import getClientTemplates from './getClientTemplateFiles.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import { ROOT_SEGMENT_SCHEMA_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';
import { BuiltInTemplateName } from '../getProjectInfo/getConfig.mts';

// TODO: add hidden --test-placeholder flag to "generate"
async function writeOnePlaceholder({
  outPath,
  defaultText,
  templateName,
  usedTemplateNames,
}: {
  outPath: string;
  defaultText: string;
  templateName: string;
  usedTemplateNames: Set<string>;
}) {
  const existing = await fs.readFile(outPath, 'utf-8').catch(() => null);

  if (!existing) {
    let text = defaultText;
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    // a workaround that prevents compilation error when client is not yet generated but back-end imports fullSchema
    if (Object.keys(BuiltInTemplateName).includes(templateName)) {
      // TODO: consider other file types
      if (outPath.endsWith('.cjs')) {
        text += '\nmodule.exports.fullSchema = {};';
      } else {
        text += '\nexport const fullSchema = {};';
      }
    }
    await fs.writeFile(outPath, outPath.endsWith('.py') ? text.replace(/\/\//g, '#') : text);
    usedTemplateNames.add(templateName);
  }
}

export default async function ensureClient({ config, cwd, log, segments }: ProjectInfo) {
  const now = Date.now();

  const templateFiles = await getClientTemplates({
    config,
    cwd,
    generateFrom: config.generateFrom,
    fullSchemaJson: undefined,
    log,
  });

  const usedTemplateNames = new Set<string>();

  const defaultText = `// auto-generated ${new Date().toISOString()}
// This is a temporary placeholder to avoid compilation errors if client is imported before it's generated.
// If you still see this text, the client is not generated yet because of an unknown problem.
// Feel free to report an issue at https://github.com/finom/vovk/issues`;

  await Promise.all(
    templateFiles.map(async (clientTemplate) => {
      const { templatePath, templateName, outDir } = clientTemplate;
      if (!templatePath) return;
      const outPath = path.join(outDir, path.basename(templatePath).replace('.ejs', ''));
      if (config.generateFullClient) {
        await writeOnePlaceholder({
          outPath,
          defaultText,
          templateName,
          usedTemplateNames,
        });
      }

      if (config.generateSegmentClient) {
        // Generate client files for each segment
        await Promise.all(
          segments.map(async ({ segmentName }) => {
            const outPath = path.join(
              outDir,
              segmentName || ROOT_SEGMENT_SCHEMA_NAME,
              path.basename(templatePath).replace('.ejs', '')
            );

            return writeOnePlaceholder({
              outPath,
              defaultText,
              templateName,
              usedTemplateNames,
            });
          })
        );
      }
    })
  );

  if (usedTemplateNames.size) {
    log.info(
      `Placeholder client files from template${usedTemplateNames.size !== 1 ? 's' : ''} ${chalkHighlightThing(
        Array.from(usedTemplateNames)
          .map((s) => `"${s}"`)
          .join(', ')
      )} are generated in ${Date.now() - now}ms`
    );
  }

  return { written: !!usedTemplateNames.size };
}
