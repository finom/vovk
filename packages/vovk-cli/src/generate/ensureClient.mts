import fs from 'node:fs/promises';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import getClientTemplates from './getClientTemplates.mjs';
import uniq from 'lodash/uniq.js';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import path from 'node:path';

export default async function ensureClient({ config, cwd, log }: ProjectInfo) {
  const now = Date.now();

  const { clientOutDirAbsolutePath, templateFiles } = await getClientTemplates({
    config,
    cwd,
    generateFrom: config.generateFrom,
  });

  let usedTemplateNames: string[] = [];

  const text = `// auto-generated ${new Date().toISOString()}
// This is a temporary placeholder to avoid compilation errors if client is imported before it's generated.
// If you still see this text, the client is not generated yet because of an unknown problem.
// Feel free to report an issue at https://github.com/finom/vovk/issues`;

  for (const { outPath, templateName } of templateFiles) {
    const existing = await fs.readFile(outPath, 'utf-8').catch(() => null);

    if (!existing) {
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, outPath.endsWith('.py') ? text.replace(/\/\//g, '#') : text);
      usedTemplateNames.push(templateName);
    }
  }

  usedTemplateNames = uniq(usedTemplateNames);

  if (usedTemplateNames.length) {
    log.info(
      `Placeholder client files from template${usedTemplateNames.length !== 1 ? 's' : ''} ${chalkHighlightThing(usedTemplateNames.map((s) => `"${s}"`).join(', '))} are generated at ${clientOutDirAbsolutePath} in ${Date.now() - now}ms`
    );
  }

  return { written: !!usedTemplateNames.length };
}
