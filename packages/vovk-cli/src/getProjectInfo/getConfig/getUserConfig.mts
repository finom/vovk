import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
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

  const loaders: Array<() => Promise<VovkConfig>> = [
    () => loadConfigWithVm(configPath),
    () => importWithCacheBuster(configPath),
  ];

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

async function loadConfigWithVm(configPath: string): Promise<VovkConfig> {
  const source = await readFile(configPath, 'utf8');
  const moduleUrl = pathToFileURL(configPath).href;
  const cjsSource = transformDefaultExportToCjs(source);

  const moduleObj: { exports: unknown } = { exports: {} };
  const context = {
    module: moduleObj,
    exports: moduleObj.exports,
    require: createRequire(moduleUrl),
    __dirname: dirname(configPath),
    __filename: configPath,
    console,
    process,
    Buffer,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    URL,
  };

  runInNewContext(cjsSource, context, { filename: moduleUrl, displayErrors: true });

  const result = moduleObj.exports as { default?: VovkConfig };
  return result?.default ?? (result as VovkConfig);
}

function transformDefaultExportToCjs(source: string): string {
  return source.replace(/^\s*export\s+default\s+/m, 'module.exports = ');
}
