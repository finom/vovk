import path from 'path';
import fs from 'fs/promises';
import getFileSystemEntryType, { FileSystemEntryType } from '../utils/getFileSystemEntryType.mjs';
import type { VovkConfig } from '../types.mjs';
import getTemplateFilesFromPackage from './getTemplateFilesFromPackage.mjs';
import type getLogger from '../utils/getLogger.mjs';
import prettify from '../utils/prettify.mjs';
import type { InitOptions } from '../types.mjs';

export default async function createConfig({
  root,
  log,
  dryRun,
  options: { validationLibrary, validateOnClient },
}: {
  root: string;
  log: ReturnType<typeof getLogger>;
  dryRun?: boolean;
  options: Pick<InitOptions, 'validationLibrary' | 'validateOnClient'>;
}) {
  const config: VovkConfig = {};
  const dotConfigPath = path.join(root, '.config');
  const dir = (await getFileSystemEntryType(dotConfigPath)) === FileSystemEntryType.DIRECTORY ? dotConfigPath : root;
  const isModule = await fs
    .readFile(path.join(root, 'package.json'), 'utf-8')
    .then((content) => (JSON.parse(content) as { type: 'module' }).type === 'module');
  const configAbsolutePath = path.join(dir, isModule ? 'vovk.config.mjs' : 'vovk.config.js');

  const templates: VovkConfig['templates'] = {
    controller: 'vovk-cli/templates/controller.ejs',
    service: 'vovk-cli/templates/service.ejs',
    worker: 'vovk-cli/templates/worker.ejs',
  };

  if (validationLibrary) {
    config.validationLibrary = validationLibrary;
    if (validateOnClient) {
      config.validateOnClient = `${validationLibrary}/validateOnClient`;
    }

    try {
      const validationTemplates = await getTemplateFilesFromPackage(validationLibrary);
      Object.assign(templates, validationTemplates);
    } catch (error) {
      log.warn(`Failed to fetch validation library templates: ${(error as Error).message}`);
    }
  }

  config.templates = templates;

  const configStr = await prettify(
    `/** @type {import('vovk-cli').VovkConfig} */
const config = ${JSON.stringify(config, null, 2)};
${isModule ? '\nexport default config;' : 'module.exports = config;'}`,
    configAbsolutePath
  );

  if (!dryRun) await fs.writeFile(configAbsolutePath, configStr, 'utf-8');

  return { configAbsolutePath };
}
