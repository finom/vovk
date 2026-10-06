import path from 'node:path';
import { glob } from 'glob';
import merge from 'lodash/merge.js';
import omit from 'lodash/omit.js';
import type { VovkStrictConfig } from 'vovk/internal';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import type { GenerateOptions } from '../types.mjs';
import { FileSystemEntryType, getFileSystemEntryType } from '../utils/get-file-system-entry-type.mjs';
import { getPublicModuleNameFromPath } from '../utils/get-public-module-name-from-path.mjs';
import { resolveAbsoluteModulePath } from '../utils/resolve-absolute-module-path.mjs';

export interface ClientTemplateFile {
  templateName: string;
  templateFilePath: string;
  // where the file goes inside the client, the path a "requires" entry gives included; may hold "[package_name]"
  relativeDir: string;
  // the client's output directory, a segmented client puts a folder per segment into it
  outCwdRelativeDir: string;
  templateDef: VovkStrictConfig['clientTemplateDefs'][string];
  // the package name a Python or Rust template, or a template one requires, uses
  packageNameKey?: 'py_name' | 'rs_name';
}

const getPackageNameKey = (templatePath: string | null | undefined) =>
  templatePath?.startsWith('vovk-python/') ? 'py_name' : templatePath?.startsWith('vovk-rust/') ? 'rs_name' : undefined;

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
      if (['js', 'jsBase', 'schemaJs', 'openapiJs'].includes(templateName)) {
        throw new Error(`The "${templateName}" template was removed in v4. Use "ts" instead.`);
      }
      throw new Error(`Unknown template name: ${templateName}`);
    }

    usedTemplateDefs[templateName] = config.clientTemplateDefs[templateName];
  }

  const templateFiles: ClientTemplateFile[] = [];
  // the third item places a required template inside its parent's client,
  // the last one lists the templates whose "requires" led here
  const entries = Object.entries(usedTemplateDefs) as [] as [
    string,
    VovkStrictConfig['clientTemplateDefs'][string],
    Pick<ClientTemplateFile, 'outCwdRelativeDir' | 'relativeDir' | 'packageNameKey'> | undefined,
    string[] | undefined,
  ][];

  for (let i = 0; i < entries.length; i++) {
    const [templateName, templateDef, requiredAt, requiredBy = []] = entries[i];
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

    let files: { filePath: string; isSingleFileTemplate: boolean }[];

    const outCwdRelativeDir = requiredAt?.outCwdRelativeDir ?? cliOutDir ?? defOutDir ?? configOutDir;
    const templateRelativeDir = requiredAt?.relativeDir ?? '';
    const packageNameKey = getPackageNameKey(templateDef.templatePath) ?? requiredAt?.packageNameKey;

    if (templateAbsolutePath) {
      if (entryType === FileSystemEntryType.FILE) {
        files = [{ filePath: templateAbsolutePath, isSingleFileTemplate: true }];
      } else {
        // the pattern stays relative: glob reads "\" and brackets in a path as pattern syntax
        const filePaths = await glob('**/*', {
          cwd: templateAbsolutePath,
          absolute: true,
          nodir: true,
          dot: true,
          ignore: '**/.DS_Store',
        });
        files = filePaths.map((filePath) => ({ filePath, isSingleFileTemplate: false }));
      }

      if (files.length === 0) {
        log.error(`Template "${templateAbsolutePath}" not found`);
        continue;
      }

      for (const { filePath, isSingleFileTemplate } of files) {
        templateFiles.push({
          templateName,
          templateFilePath: filePath,
          relativeDir: path.join(
            templateRelativeDir,
            path.relative(
              isSingleFileTemplate ? path.dirname(templateAbsolutePath) : templateAbsolutePath,
              `${path.dirname(filePath)}/`
            )
          ),
          outCwdRelativeDir,
          templateDef,
          packageNameKey,
        });
      }
    }

    if (templateDef.requires) {
      const chain = [...requiredBy, templateName];
      for (const [tName, reqRelativeDir] of Object.entries(templateDef.requires)) {
        if (chain.includes(tName)) {
          throw new Error(
            `Client templates require each other in a loop: ${[...chain, tName].map((name) => `"${name}"`).join(' → ')}`
          );
        }

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

        entries.push([
          tName,
          def,
          { outCwdRelativeDir, relativeDir: path.join(templateRelativeDir, reqRelativeDir), packageNameKey },
          chain,
        ]);
      }
    }
  }

  return { fromTemplates, templateFiles };
}
