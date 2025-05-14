import path from 'node:path';
import { glob } from 'glob';
import type { VovkStrictConfig } from 'vovk';
import resolveAbsoluteModulePath from '../utils/resolveAbsoluteModulePath.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import getFileSystemEntryType, { FileSystemEntryType } from '../utils/getFileSystemEntryType.mjs';
import type { GenerateOptions } from '../types.mjs';
import { checkIfInstalled } from '../utils/checkIfInstalled.mjs';

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
  cliGenerateOptions,
}: {
  config: VovkStrictConfig;
  cwd: string;
  log: ProjectInfo['log'];
  configKey: 'fullClient' | 'segmentedClient';
  cliGenerateOptions?: GenerateOptions;
}) {
  const usedTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {};
  const fromTemplates =
    configKey === 'fullClient'
      ? cliGenerateOptions?.fullFrom || cliGenerateOptions?.segmentedFrom
        ? (cliGenerateOptions?.fullFrom ?? [])
        : config.fullClient.fromTemplates
      : cliGenerateOptions?.fullFrom || cliGenerateOptions?.segmentedFrom
        ? (cliGenerateOptions?.segmentedFrom ?? [])
        : config.segmentedClient.fromTemplates;

  const outDir =
    configKey === 'fullClient'
      ? (cliGenerateOptions?.fullOut ?? config.fullClient.outDir)
      : (cliGenerateOptions?.segmentedOut ?? config.segmentedClient.outDir);

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

  for (const [templateName, templateDef] of entries) {
    if (
      templateDef.templatePath &&
      !templateDef.templatePath.startsWith('.') &&
      !templateDef.templatePath.startsWith('/')
    ) {
      const pathParts = templateDef.templatePath.split('/');
      const npmModuleName = pathParts[0].startsWith('@') ? `${pathParts[0]}/${pathParts[1]}` : pathParts[0];
      const isInstalled = checkIfInstalled(npmModuleName);

      if (!isInstalled) {
        log.error(`Template "${templateName}" requires the package "${npmModuleName}" to be installed.`);

        return {
          fromTemplates: [],
          templateFiles: [],
        };
      }
    }
  }

  for (let i = 0; i < entries.length; i++) {
    const [templateName, templateDef, forceOutCwdRelativeDir] = entries[i];
    const templateAbsolutePath = templateDef.templatePath
      ? resolveAbsoluteModulePath(templateDef.templatePath, cwd)
      : null;
    const entryType = templateDef.templatePath ? await getFileSystemEntryType(templateDef.templatePath) : null;
    if (templateAbsolutePath && !entryType)
      throw new Error(`Unable to locate template path ${templateDef.templatePath}`);
    const defOutDir = configKey === 'fullClient' ? templateDef.fullClient?.outDir : templateDef.segmentedClient?.outDir;

    let files: { filePath: string; isSingleFileTemplate: boolean }[] = [];

    if (templateAbsolutePath) {
      if (entryType === FileSystemEntryType.FILE) {
        files = [{ filePath: templateAbsolutePath, isSingleFileTemplate: true }];
      } else {
        const globPath = path.join(templateAbsolutePath, '**/*.*');
        files = (await glob(globPath)).map((filePath) => ({
          filePath,
          isSingleFileTemplate: false,
        }));
      }

      if (files.length === 0) {
        log.error(`Template "${templateAbsolutePath}" not found`);
        continue;
      }

      const outCwdRelativeDir = forceOutCwdRelativeDir ?? defOutDir ?? outDir;

      for (const { filePath, isSingleFileTemplate } of files) {
        templateFiles.push({
          templateName,
          templateFilePath: filePath,
          relativeDir: path.relative(
            isSingleFileTemplate ? path.dirname(templateAbsolutePath) : templateAbsolutePath,
            path.dirname(filePath) + '/'
          ),
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
  }

  return { fromTemplates, templateFiles };
}
