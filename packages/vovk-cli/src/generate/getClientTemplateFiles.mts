import path from 'node:path';
import { glob } from 'glob';
import type { VovkStrictConfig } from 'vovk';
import type { PackageJson } from 'type-fest';
import resolveAbsoluteModulePath from '../utils/resolveAbsoluteModulePath.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import getFileSystemEntryType, { FileSystemEntryType } from '../utils/getFileSystemEntryType.mjs';
import { BuiltInTemplateName } from '../getProjectInfo/getConfig.mjs';

const DEFAULT_FULL_SCHEMA_FILE_NAME = 'full-schema.json';

export interface ClientTemplateFile {
  templateName: string;
  templatePath: string | null; // null is for full schema JSON only
  outDir: string;
  fullSchemaJSONFileName: string | null;
  origin?: string | null;
  package: PackageJson;
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

  if (fullSchemaJson && !usedTemplateDefs[BuiltInTemplateName.none]) {
    usedTemplateDefs[BuiltInTemplateName.none] = {
      templatePath: null,
      clientOutDir: config.clientOutDir,
      fullSchemaJson,
    };
  }

  for (const [templateName, templateDef] of Object.entries(usedTemplateDefs)) {
    const fullSchemaJSONFileName = templateDef.fullSchemaJson
      ? templateDef.fullSchemaJson === 'string'
        ? templateDef.fullSchemaJson
        : DEFAULT_FULL_SCHEMA_FILE_NAME
      : null;
    const packageJson = Object.assign({}, config.package, templateDef.package);

    const outDir = path.resolve(cwd, templateDef.clientOutDir ?? config.clientOutDir);

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
          outDir: path
            .join(outDir, path.relative(templateAbsolutePath, filePath))
            .replace('[PACKAGE_NAME]', packageJson.name ?? 'my-package-name'),
          fullSchemaJSONFileName,
          origin: templateDef.origin,
          package: packageJson as PackageJson,
        });
      }
    } else {
      templateFiles.push({
        templateName,
        templatePath: null,
        outDir,
        fullSchemaJSONFileName,
        origin: templateDef.origin,
        package: packageJson as PackageJson,
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
