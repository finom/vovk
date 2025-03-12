import path from 'node:path';
import { glob } from 'glob';
import type { VovkStrictConfig } from 'vovk';
import resolveAbsoluteModulePath from '../utils/resolveAbsoluteModulePath.mjs';

export const DEFAULT_FULL_SCHEMA_FILE_NAME = 'full-schema.json';

export interface ClientTemplate {
  templateName: string;
  templatePath: string;
  outDir: string;
  fullSchemaJSONFileName: string | null;
  origin?: string | null;
}

export enum BuiltInTemplateName {
  ts = 'ts',
  main = 'main',
  module = 'module',
  fullSchema = 'fullSchema',
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
      templateName: BuiltInTemplateName.ts,
      templatePath: path.resolve(templatesDir, 'ts/*'),
      outDir: clientOutDirAbsolutePath,
      fullSchemaJSON: false,
      origin: null,
    },
    main: {
      templateName: BuiltInTemplateName.main,
      templatePath: path.resolve(templatesDir, 'main/*'),
      outDir: clientOutDirAbsolutePath,
      fullSchemaJSON: false,
      origin: null,
    },
    module: {
      templateName: BuiltInTemplateName.module,
      templatePath: path.resolve(templatesDir, 'module/*'),
      outDir: clientOutDirAbsolutePath,
      fullSchemaJSON: false,
      origin: null,
    },
    fullSchema: {
      templateName: BuiltInTemplateName.fullSchema,
      templatePath: path.resolve(templatesDir, 'fullSchema/*'),
      outDir: clientOutDirAbsolutePath,
      fullSchemaJSON: false,
      origin: null,
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
        fullSchemaJSON: false,
        origin: null,
      };
    }

    return {
      templateName: template.templateName ?? template.templatePath,
      templatePath: resolveAbsoluteModulePath(template.templatePath, cwd),
      outDir: template.outDir ? path.resolve(cwd, template.outDir) : clientOutDirAbsolutePath,
      fullSchemaJSON: template.fullSchemaJSON ?? false,
      origin: template.origin ?? null,
    };
  });

  if (['ts', 'main', 'module'].some((template) => generateFromStrict.some((item) => item.templateName === template))) {
    generateFromStrict.unshift(builtIn.fullSchema);
  }

  const templateFiles: ClientTemplate[] = [];

  for (const generateFromItem of generateFromStrict) {
    const files = await glob(generateFromItem.templatePath);

    for await (const templatePath of files) {
      templateFiles.push({
        templateName: generateFromItem.templateName,
        templatePath,
        outDir: generateFromItem.outDir,
        fullSchemaJSONFileName: generateFromItem.fullSchemaJSON
          ? generateFromItem.fullSchemaJSON === 'string'
            ? generateFromItem.fullSchemaJSON
            : DEFAULT_FULL_SCHEMA_FILE_NAME
          : null,
        origin: generateFromItem.origin,
      });
    }
  }

  return { clientOutDirAbsolutePath, templateFiles };
}
