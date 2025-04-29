import path from 'node:path';
import { glob } from 'glob';
import type { VovkStrictConfig } from 'vovk';
import resolveAbsoluteModulePath from '../utils/resolveAbsoluteModulePath.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import getFileSystemEntryType, { FileSystemEntryType } from '../utils/getFileSystemEntryType.mjs';
import { type GenerateOptions } from '../types.mjs';

export interface ClientTemplateFile {
  templateName: string;
  templateFilePath: string;
  relativeDir: string; // may include patterns such as "[package_name]"
  outCwdRelativeDir: string;
  templateDef: VovkStrictConfig['clientTemplateDefs'][string];
}

export default async function getClientTemplateFiles({
  config,
  cwd,
  log,
  configKey,
  cliOptions,
}: {
  config: VovkStrictConfig;
  cwd: string;
  log: ProjectInfo['log'];
  configKey: 'fullClient' | 'segmentedClient';
  cliOptions?: GenerateOptions;
}) {
  const usedTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {};
  const fromTemplates =
    configKey === 'fullClient'
      ? (cliOptions?.fullClientFrom ?? config.fullClient.fromTemplates)
      : (cliOptions?.segmentedClientFrom ?? config.segmentedClient.fromTemplates);
  const outDir =
    configKey === 'fullClient'
      ? (cliOptions?.fullClientOut ?? config.fullClient.outDir)
      : (cliOptions?.segmentedClientOut ?? config.segmentedClient.outDir);

  for (const templateName of fromTemplates) {
    if (!(templateName in config.clientTemplateDefs)) {
      throw new Error(`Unknown template name: ${templateName}`);
    }

    usedTemplateDefs[templateName] = config.clientTemplateDefs[templateName];
  }

  const templateFiles: ClientTemplateFile[] = [];
  const entries = Object.entries(usedTemplateDefs) as [] as [
    string,
    VovkStrictConfig['clientTemplateDefs'][string],
    string | undefined,
  ][];
  for (let i = 0; i < entries.length; i++) {
    const [templateName, templateDef, forceOutCwdRelativeDir] = entries[i];
    const templateAbsolutePath = resolveAbsoluteModulePath(templateDef.templatePath, cwd);
    const entryType = await getFileSystemEntryType(templateDef.templatePath);
    if (!entryType) throw new Error(`Unable to locate template path ${templateDef.templatePath}`);
    const defOutDir = configKey === 'fullClient' ? templateDef.fullClient?.outDir : templateDef.segmentedClient?.outDir;

    let files: string[];

    if (entryType === FileSystemEntryType.FILE) {
      files = [templateAbsolutePath];
    } else {
      const globPath = path.join(templateAbsolutePath, '**/*.*');
      files = await glob(globPath);
    }

    if (files.length === 0) {
      log.error(`Template "${templateAbsolutePath}" not found`);
      continue;
    }

    const outCwdRelativeDir = forceOutCwdRelativeDir ?? defOutDir ?? outDir;

    for (const filePath of files) {
      templateFiles.push({
        templateName,
        templateFilePath: filePath,
        relativeDir: path.relative(templateAbsolutePath, path.dirname(filePath)),
        outCwdRelativeDir,
        templateDef,
      });
    }

    if (templateDef.requires) {
      for (const [tName, reqRelativeDir] of Object.entries(templateDef.requires)) {
        const def = config.clientTemplateDefs[tName];
        if (!def) {
          throw new Error(`Template "${tName}" required by "${templateName}" not found`);
        }

        entries.push([tName, def, path.join(outCwdRelativeDir, reqRelativeDir)]);
      }
    }
  }
  return templateFiles;
}
