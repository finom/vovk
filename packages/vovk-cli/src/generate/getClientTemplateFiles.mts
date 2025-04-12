import path from 'node:path';
import { glob } from 'glob';
import type { VovkStrictConfig } from 'vovk';
import resolveAbsoluteModulePath from '../utils/resolveAbsoluteModulePath.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import getFileSystemEntryType, { FileSystemEntryType } from '../utils/getFileSystemEntryType.mts';

export const DEFAULT_FULL_SCHEMA_FILE_NAME = 'full-schema.json';

export interface ClientTemplateFile {
  templateName: string;
  templatePath: string | null; // null is for full-schema.json only
  outDir: string;
  fullSchemaJSONFileName: string | null;
  origin?: string | null;
}

export default async function getClientTemplateFiles({
  config,
  cwd,
  generateFrom: givenGenerateFrom,
  fullSchemaJson,
  log,
}: {
  config: VovkStrictConfig;
  cwd: string;
  generateFrom?: VovkStrictConfig['generateFrom'];
  fullSchemaJson: string | boolean | undefined;
  log: ProjectInfo['log'];
}) {
  const usedTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {};
  const generateFrom = givenGenerateFrom ?? config.generateFrom;

  for (const templateName of generateFrom) {
    if (!(templateName in config.clientTemplateDefs)) {
      throw new Error(`Unknown template name: ${templateName}`);
    }

    usedTemplateDefs[templateName] = config.clientTemplateDefs[templateName];
  }

  const templateFiles: ClientTemplateFile[] = [];

  for (const [templateName, templateDef] of Object.entries(usedTemplateDefs)) {
    const fullSchemaJsonValue = fullSchemaJson ?? templateDef.fullSchemaJSON;
    const fullSchemaJSONFileName = fullSchemaJsonValue
      ? fullSchemaJsonValue === 'string'
        ? fullSchemaJsonValue
        : DEFAULT_FULL_SCHEMA_FILE_NAME
      : null;

    const outDirRoot = path.resolve(cwd, templateDef.clientOutDir ?? config.clientOutDir);
    // const outDir = TODO: concat outDirRoot with relative dir!, consider [PACKAGE_NAME] folder

    if (templateDef.templatePath) {
      const templateAbsolutePath = resolveAbsoluteModulePath(templateDef.templatePath, cwd);
      const entryType = await getFileSystemEntryType(templateDef.templatePath);
      if (!entryType) throw new Error(`Unable to locate template path ${templateDef.templatePath}`);

      let files: string[];

      if (entryType === FileSystemEntryType.FILE) {
        files = [templateAbsolutePath];
      } else {
        const globPath = path.join(templateAbsolutePath, '*');
        files = await glob(globPath);
      }

      if (files.length === 0) {
        log.error(`Template "${templateAbsolutePath}" not found`);
        continue;
      }

      for (const filePath of files) {
        templateFiles.push({
          templateName,
          templatePath: filePath,
          outDir: outDirRoot,
          fullSchemaJSONFileName,
          origin: templateDef.origin,
        });
      }
    } else {
      templateFiles.push({
        templateName,
        templatePath: null,
        outDir: outDirRoot,
        fullSchemaJSONFileName,
        origin: templateDef.origin,
      });
    }

    /* 


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
  } */
  }
  return templateFiles;
}
