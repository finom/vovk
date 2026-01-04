import { pathToFileURL } from 'node:url';
import type { VovkConfig } from 'vovk';
import { getConfigAbsolutePaths } from './getConfigAbsolutePaths.mjs';

export async function getUserConfig({
  configPath: givenConfigPath,
  cwd,
}: {
  configPath?: string;
  cwd: string;
}): Promise<{ userConfig: VovkConfig | null; configAbsolutePaths: string[]; error?: Error }> {
  const configAbsolutePaths = await getConfigAbsolutePaths({ configPath: givenConfigPath, cwd });
  if (!configAbsolutePaths.length) {
    return { userConfig: null, configAbsolutePaths };
  }

  const configPath = configAbsolutePaths[0];
  let userConfig: VovkConfig;
  let lastError: unknown;

  const loaders: Array<() => Promise<VovkConfig>> = [() => importWithCacheBuster(configPath)];

  for (const loader of loaders) {
    try {
      userConfig = await loader();
      return { userConfig, configAbsolutePaths };
    } catch (e) {
      lastError = e;
    }
  }

  return { userConfig: null, configAbsolutePaths, error: lastError as Error };
}

async function importWithCacheBuster(configPath: string): Promise<VovkConfig> {
  const cacheBuster = Date.now();
  const configPathUrl = pathToFileURL(configPath).href;
  const { default: userConfig } = (await import(`${configPathUrl}?cache=${cacheBuster}`)) as { default: VovkConfig };
  return userConfig;
}
