import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkConfig } from 'vovk';
import getTemplateFilesFromPackage from './getTemplateFilesFromPackage.mjs';
import type getLogger from '../utils/getLogger.mjs';
import prettify from '../utils/prettify.mjs';
import getFileSystemEntryType, { FileSystemEntryType } from '../utils/getFileSystemEntryType.mjs';
import type { InitOptions } from '../types.mjs';

export default async function createConfig({
  root,
  log,
  options: { validationLibrary, lang, channel, dryRun },
}: {
  root: string;
  log: ReturnType<typeof getLogger>;
  options: Pick<InitOptions, 'validationLibrary' | 'lang' | 'channel' | 'dryRun'>;
}) {
  const config: VovkConfig = {};
  const dotConfigPath = path.join(root, '.config');
  const dir = (await getFileSystemEntryType(dotConfigPath)) === FileSystemEntryType.DIRECTORY ? dotConfigPath : root;
  const isModule = await fs
    .readFile(path.join(root, 'package.json'), 'utf-8')
    .then((content) => (JSON.parse(content) as { type: 'module' }).type === 'module');
  const configAbsolutePath = path.join(dir, isModule ? 'vovk.config.mjs' : 'vovk.config.js');

  const typeTemplates = {
    controller: 'vovk-cli/type/module-templates/controller.ts.ejs',
    service: 'vovk-cli/type/module-templates/service.ts.ejs',
  };

  const moduleTemplates: VovkConfig['moduleTemplates'] = {
    ...typeTemplates,
    ...{
      type: typeTemplates,
      zod: {
        controller: 'vovk-zod/module-templates/controller.ts.ejs',
        service: 'vovk-zod/module-templates/service.ts.ejs',
      },
      'class-validator': {
        controller: 'vovk-dto/module-templates/controller.ts.ejs',
        service: 'vovk-dto/module-templates/service.ts.ejs',
      },
      valibot: {
        controller: 'vovk-cli/valibot/module-templates/controller.ts.ejs',
      },
      arktype: {
        controller: 'vovk-cli/arktype/module-templates/controller.ts.ejs',
      },
    }[validationLibrary ?? 'type'],
  };

  config.imports ??= {};
  config.imports.validateOnClient = validationLibrary === 'class-validator' ? 'vovk-dto/validateOnClient' : 'vovk-ajv';

  if (validationLibrary && !moduleTemplates) {
    try {
      // TODO: Legacy, is it useful to keep it?
      const validationTemplates = await getTemplateFilesFromPackage(validationLibrary, channel);
      Object.assign(moduleTemplates, validationTemplates);
    } catch (error) {
      log.warn(`Failed to fetch validation library templates: ${(error as Error).message}`);
    }
  }

  if (lang?.length) {
    config.composedClient ??= {};
    config.composedClient.fromTemplates = ['mjs', 'cjs', ...lang];
  }

  config.moduleTemplates = moduleTemplates;

  const configStr = await prettify(
    `// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = ${JSON.stringify(config, null, 2)};
${isModule ? '\nexport default config;' : 'module.exports = config;'}`,
    configAbsolutePath
  );

  if (!dryRun) await fs.writeFile(configAbsolutePath, configStr, 'utf-8');

  return { configAbsolutePath };
}
