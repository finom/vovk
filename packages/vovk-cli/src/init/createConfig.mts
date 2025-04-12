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
  options: { validationLibrary, reactQuery, channel, dryRun },
}: {
  root: string;
  log: ReturnType<typeof getLogger>;
  options: Pick<InitOptions, 'validationLibrary' | 'reactQuery' | 'channel' | 'dryRun'>;
}) {
  const config: VovkConfig = {};
  const dotConfigPath = path.join(root, '.config');
  const dir = (await getFileSystemEntryType(dotConfigPath)) === FileSystemEntryType.DIRECTORY ? dotConfigPath : root;
  const isModule = await fs
    .readFile(path.join(root, 'package.json'), 'utf-8')
    .then((content) => (JSON.parse(content) as { type: 'module' }).type === 'module');
  const configAbsolutePath = path.join(dir, isModule ? 'vovk.config.mjs' : 'vovk.config.js');

  const templates: VovkConfig['moduleTemplates'] = {
    controller: 'vovk-cli/module-templates/controller.ts.ejs',
    service: 'vovk-cli/module-templates/service.ts.ejs',
  };

  if (validationLibrary) {
    config.imports ??= {};
    config.imports.validateOnClient =
      {
        'vovk-dto': `vovk-dto/validateOnClient.js`,
      }[validationLibrary] ?? 'vovk-ajv';

    try {
      const validationTemplates = await getTemplateFilesFromPackage(validationLibrary, channel);
      Object.assign(templates, validationTemplates);
    } catch (error) {
      log.warn(`Failed to fetch validation library templates: ${(error as Error).message}`);
    }
  }

  if (reactQuery) {
    config.imports ??= {};
    config.imports.createRPC = 'vovk-react-query';
  }

  config.moduleTemplates = templates;

  const configStr = await prettify(
    `/** @type {import('vovk-cli').VovkConfig} */
const config = ${JSON.stringify(config, null, 2)};
${isModule ? '\nexport default config;' : 'module.exports = config;'}`,
    configAbsolutePath
  );

  if (!dryRun) await fs.writeFile(configAbsolutePath, configStr, 'utf-8');

  return { configAbsolutePath };
}
