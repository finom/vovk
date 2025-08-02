import type { VovkConfig } from 'vovk';
import prettify from '../../src/utils/prettify.mts';
import fs from 'node:fs/promises';

export default async function updateConfig(configAbsolutePath: string, update: (config: VovkConfig) => VovkConfig) {
  const configImport = await import(configAbsolutePath);
  const config = (configImport.default ?? configImport) as VovkConfig;

  const updatedConfig = update(config);

  const configStr = await prettify(
    `// @ts-check
  // UPDATED BY TESTS
  /** @type {import('vovk').VovkConfig} */
  const config = ${JSON.stringify(updatedConfig, null, 2)};
  ${configAbsolutePath.endsWith('.mjs') ? '\nexport default config;' : 'module.exports = config;'}`,
    configAbsolutePath
  );

  return fs.writeFile(configAbsolutePath, configStr, 'utf-8');
}
