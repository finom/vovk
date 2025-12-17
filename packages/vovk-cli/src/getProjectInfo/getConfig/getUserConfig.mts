import { pathToFileURL } from 'node:url';
import type { VovkConfig } from 'vovk';
import { getConfigAbsolutePaths } from './getConfigAbsolutePaths.mjs';
import { importUncachedModule } from './importUncachedModule.mjs';

export async function getUserConfig({
  configPath: givenConfigPath,
  cwd,
}: {
  configPath?: string;
  cwd: string;
}): Promise<{ userConfig: VovkConfig | null; configAbsolutePaths: string[]; error?: Error }> {
  const configAbsolutePaths = await getConfigAbsolutePaths({ configPath: givenConfigPath, cwd });
  let userConfig: VovkConfig;

  if (!configAbsolutePaths.length) {
    return { userConfig: null, configAbsolutePaths };
  }

  const configPath = configAbsolutePaths[0];
  // TODO explain
  try {
    userConfig = await importUncachedModule<VovkConfig>(configPath);
  } catch {
    try {
      const cacheBuster = Date.now();
      const configPathUrl = pathToFileURL(configPath).href;
      ({ default: userConfig } = (await import(`${configPathUrl}?cache=${cacheBuster}`)) as { default: VovkConfig });
    } catch (e) {
      return { userConfig: null, configAbsolutePaths, error: e as Error };
    }
  }

  return { userConfig, configAbsolutePaths };
}
