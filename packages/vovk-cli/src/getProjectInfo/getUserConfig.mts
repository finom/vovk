import type { VovkConfig } from '../types.mjs';
import getConfigAbsolutePaths from './getConfigAbsolutePaths.mjs';
import importUncachedModule from './importUncachedModule.mjs';

async function getUserConfig({
  cwd,
}: {
  cwd: string;
}): Promise<{ userConfig: VovkConfig | null; configAbsolutePaths: string[]; error?: Error }> {
  const configAbsolutePaths = await getConfigAbsolutePaths({ cwd });
  let userConfig: VovkConfig;

  if (!configAbsolutePaths.length) {
    return { userConfig: null, configAbsolutePaths, error: new Error('No config file found') };
  }

  const configPath = configAbsolutePaths[0];
  // TODO explain
  try {
    userConfig = await importUncachedModule<VovkConfig>(configPath);
  } catch {
    try {
      const cacheBuster = Date.now();
      ({ default: userConfig } = (await import(`${configPath}?cache=${cacheBuster}`)) as { default: VovkConfig });
    } catch (e) {
      return { userConfig: null, configAbsolutePaths, error: e as Error };
    }
  }

  return { userConfig, configAbsolutePaths };
}

export default getUserConfig;
