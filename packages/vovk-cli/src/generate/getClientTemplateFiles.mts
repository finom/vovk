import path from 'node:path';
import { glob } from 'glob';
import type { VovkStrictConfig } from 'vovk';
import { resolveAbsoluteModulePath } from '../utils/resolveAbsoluteModulePath.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import { getFileSystemEntryType, FileSystemEntryType } from '../utils/getFileSystemEntryType.mjs';
import type { GenerateOptions } from '../types.mjs';
import { getPublicModuleNameFromPath } from '../utils/getPublicModuleNameFromPath.mjs';
import omit from 'lodash/omit.js';
import merge from 'lodash/merge.js';

export interface ClientTemplateFile {
  templateName: string;
  templateFilePath: string;
  relativeDir: string; // may include patterns such as "[package_name]"
  outCwdRelativeDir: string;
  templateDef: VovkStrictConfig['clientTemplateDefs'][string];
}

export async function getClientTemplateFiles({
  config,
  cwd,
  log,
  configKey,
  cliGenerateOptions,
}: {
  config: VovkStrictConfig;
  cwd: string;
  log: ProjectInfo['log'];
  configKey: 'composedClient' | 'segmentedClient';
  cliGenerateOptions?: GenerateOptions;
}) {
  const usedTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {};
  const fromTemplates =
    configKey === 'composedClient'
      ? cliGenerateOptions?.composedFrom || cliGenerateOptions?.segmentedFrom
        ? (cliGenerateOptions?.composedFrom ?? [])
        : config.composedClient.fromTemplates
      : cliGenerateOptions?.composedFrom || cliGenerateOptions?.segmentedFrom
        ? (cliGenerateOptions?.segmentedFrom ?? [])
        : config.segmentedClient.fromTemplates;

  const cliOutDir = configKey === 'composedClient' ? cliGenerateOptions?.composedOut : cliGenerateOptions?.segmentedOut;
  const configOutDir = config[configKey].outDir;

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
    const templateAbsolutePath = templateDef.templatePath
      ? resolveAbsoluteModulePath(templateDef.templatePath, cwd)
      : null;
    const entryType = templateAbsolutePath ? await getFileSystemEntryType(templateAbsolutePath) : null;
    if (templateAbsolutePath && !entryType) {
      const { moduleName } = templateDef.templatePath ? getPublicModuleNameFromPath(templateDef.templatePath) : {};
      if (moduleName) {
        throw new Error(
          `Unable to locate template path "${templateDef.templatePath}" resolved as "${templateAbsolutePath}". You may need to install the package "${moduleName}" first.`
        );
      }
      throw new Error(
        `Unable to locate template path "${templateDef.templatePath}" resolved as "${templateAbsolutePath}"`
      );
    }
    const defOutDir =
      configKey === 'composedClient' ? templateDef.composedClient?.outDir : templateDef.segmentedClient?.outDir;

    let files: { filePath: string; isSingleFileTemplate: boolean }[] = [];

    const outCwdRelativeDir = forceOutCwdRelativeDir ?? cliOutDir ?? defOutDir ?? configOutDir;

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
    }

    if (templateDef.requires) {
      for (const [tName, reqRelativeDir] of Object.entries(templateDef.requires)) {
        let def = config.clientTemplateDefs[tName];
        if (!def) {
          throw new Error(`Template "${tName}" required by "${templateName}" not found`);
        }

        def = {
          ...def,
          outputConfig: merge({}, templateDef?.outputConfig, def.outputConfig),
          composedClient: merge(omit(templateDef?.composedClient ?? {}, ['outDir']), def.composedClient),
          segmentedClient: merge(omit(templateDef?.segmentedClient ?? {}, ['outDir']), def.segmentedClient),
        };

        entries.push([tName, def, path.join(outCwdRelativeDir, reqRelativeDir)]);
      }
    }
  }

  return { fromTemplates, templateFiles };
}
