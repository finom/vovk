import path from 'node:path';
import { glob } from 'node:fs/promises';
import type { VovkStrictConfig } from 'vovk';
import resolveAbsoluteModulePath from '../utils/resolveAbsoluteModulePath.mjs';

interface ClientTemplate {
  templateName: string;
  templatePath: string;
  outPath: string;
  emitFullSchema?: string | boolean;
}

export default async function getClientTemplates({
  config,
  cwd,
  generateFrom = [],
}: {
  config: VovkStrictConfig;
  cwd: string;
  generateFrom?: VovkStrictConfig['generateFrom'];
}) {
  const templatesDir = path.join(import.meta.dirname, '../..', 'client-templates');
  const clientOutDirAbsolutePath = path.resolve(cwd, config.clientOutDir);

  type GenerateFromStrict = Required<Exclude<VovkStrictConfig['generateFrom'][number], string>>;

  const builtIn: Record<string, GenerateFromStrict> = {
    ts: {
      templateName: 'ts',
      templatePath: path.resolve(templatesDir, 'ts', '*'),
      outDir: clientOutDirAbsolutePath,
      fullSchema: false,
    },
    main: {
      templateName: 'main',
      templatePath: path.resolve(templatesDir, 'main', '*'),
      outDir: clientOutDirAbsolutePath,
      fullSchema: false,
    },
    module: {
      templateName: 'module',
      templatePath: path.resolve(templatesDir, 'module', '*'),
      outDir: clientOutDirAbsolutePath,
      fullSchema: false,
    },
  };

  const generateFromStrict: GenerateFromStrict[] = generateFrom.map((template) => {
    if (typeof template === 'string') {
      if (template in builtIn) {
        return builtIn[template as 'ts'];
      }
      return {
        templateName: template,
        templatePath: resolveAbsoluteModulePath(template, cwd),
        outDir: clientOutDirAbsolutePath,
        fullSchema: false,
      };
    }

    return {
      templateName: template.templateName ?? template.templatePath,
      templatePath: resolveAbsoluteModulePath(template.templatePath, cwd),
      outDir: template.outDir ? path.resolve(cwd, template.outDir) : clientOutDirAbsolutePath,
      fullSchema: template.fullSchema ?? false,
    };
  });

  const templateFiles: ClientTemplate[] = [];

  for (const generateFromItem of generateFromStrict) {
    const files = await glob(generateFromItem.templatePath);

    for await (const templatePath of files) {
      templateFiles.push({
        templateName: generateFromItem.templateName,
        templatePath,
        outPath: path.join(generateFromItem.outDir, path.basename(templatePath).replace('.ejs', '')),
        emitFullSchema: generateFromItem.fullSchema,
      });
    }
  }

  return { clientOutDirAbsolutePath, templateFiles };
}
