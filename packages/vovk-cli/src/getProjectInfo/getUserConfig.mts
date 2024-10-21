import type { VovkConfig } from '../types.mjs';
import getConfigAbsolutePaths from './getConfigAbsolutePaths.mjs';
import importUncachedModule from './importUncachedModule.mjs';

async function getUserConfig({
  cwd,
}: {
  cwd: string;
}): Promise<{ userConfig: VovkConfig; configAbsolutePaths: string[] }> {
  const configAbsolutePaths = await getConfigAbsolutePaths({ cwd });
  let userConfig: VovkConfig = {};

  if (!configAbsolutePaths.length) {
    return { userConfig, configAbsolutePaths };
  }

  const configPath = configAbsolutePaths[0];
  // TODO explain
  try {
    userConfig = await importUncachedModule<VovkConfig>(configPath);
  } catch (e) {
    try {
      const cacheBuster = Date.now();
      ({ default: userConfig } = (await import(`${configPath}?cache=${cacheBuster}`)) as { default: VovkConfig });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('🐺 ❌ Error reading config file:', (e as Error).message);
    }
  }

  return { userConfig, configAbsolutePaths };
}

export default getUserConfig;
