import path from 'node:path';
import { glob } from 'glob';
import type { VovkStrictConfig } from 'vovk';
import resolveAbsoluteModulePath from '../utils/resolveAbsoluteModulePath.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';

export const DEFAULT_FULL_SCHEMA_FILE_NAME = 'full-schema.json';

export interface ClientTemplate {
  templateName: string;
  templatePath: string | null; // null is for full-schema.json only
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
  log,
}: {
  config: VovkStrictConfig;
  cwd: string;
  generateFrom?: VovkStrictConfig['generateFrom'];
  log: ProjectInfo['log'];
}) {
  const templatesDir = path.join(import.meta.dirname, '../..', 'client-templates');
  const clientOutDirAbsolutePath = path.resolve(cwd, config.clientOutDir);

  type GenerateFromStrict = Required<Exclude<VovkStrictConfig['generateFrom'][number], string>>;

  const builtIn: Record<string, GenerateFromStrict> = {
    ts: {
      templateName: BuiltInTemplateName.ts,
      templateGlob: path.resolve(templatesDir, 'ts/*'),
      outDir: clientOutDirAbsolutePath,
      fullSchemaJSON: false,
      origin: null,
    },
    main: {
      templateName: BuiltInTemplateName.main,
      templateGlob: path.resolve(templatesDir, 'main/*'),
      outDir: clientOutDirAbsolutePath,
      fullSchemaJSON: false,
      origin: null,
    },
    module: {
      templateName: BuiltInTemplateName.module,
      templateGlob: path.resolve(templatesDir, 'module/*'),
      outDir: clientOutDirAbsolutePath,
      fullSchemaJSON: false,
      origin: null,
    },
    fullSchema: {
      templateName: BuiltInTemplateName.fullSchema,
      templateGlob: path.resolve(templatesDir, 'fullSchema/*'),
      outDir: clientOutDirAbsolutePath,
      fullSchemaJSON: false,
      origin: null,
    },
  };

  const generateFromStrict: GenerateFromStrict[] = generateFrom.map((template) => {
    if (template === 'none') {
      return {
        templateName: template,
        templateGlob: null,
        outDir: clientOutDirAbsolutePath,
        fullSchemaJSON: false,
        origin: null,
      };
    }
    if (typeof template === 'string') {
      if (template in builtIn) {
        return builtIn[template as 'ts'];
      }

      return {
        templateName: template,
        templateGlob: resolveAbsoluteModulePath(template, cwd),
        outDir: clientOutDirAbsolutePath,
        fullSchemaJSON: false,
        origin: null,
      };
    }

    return {
      templateName: template.templateName ?? template.templateGlob ?? 'none',
      templateGlob: template.templateGlob ? resolveAbsoluteModulePath(template.templateGlob, cwd) : null,
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
    let files: string[] = [];
    const fullSchemaJSONFileName = generateFromItem.fullSchemaJSON
      ? generateFromItem.fullSchemaJSON === 'string'
        ? generateFromItem.fullSchemaJSON
        : DEFAULT_FULL_SCHEMA_FILE_NAME
      : null;

    if (generateFromItem.templateGlob) {
      files = await glob(generateFromItem.templateGlob);
      if (files.length === 0) {
        log.error(`Template "${generateFromItem.templateGlob}" not found`);
        continue;
      }
    } else {
      templateFiles.push({
        templateName: generateFromItem.templateName,
        templatePath: null,
        outDir: generateFromItem.outDir,
        fullSchemaJSONFileName,
        origin: generateFromItem.origin,
      });
    }

    for await (const templatePath of files) {
      templateFiles.push({
        templateName: generateFromItem.templateName,
        templatePath,
        outDir: generateFromItem.outDir,
        fullSchemaJSONFileName,
        origin: generateFromItem.origin,
      });
    }
  }

  return { clientOutDirAbsolutePath, templateFiles };
}
