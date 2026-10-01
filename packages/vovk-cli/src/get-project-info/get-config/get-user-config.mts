import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import type { VovkConfig } from 'vovk';
import { getConfigAbsolutePaths } from './get-config-absolute-paths.mjs';

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

  const loaders = await getLoadersForExtension(configPath);

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

async function getLoadersForExtension(configPath: string): Promise<Array<() => Promise<VovkConfig>>> {
  const ext = extname(configPath).toLowerCase();
  const code = await readFile(configPath, 'utf-8');
  // vm.Script can't run import() without --experimental-vm-modules, so such a config is imported by Node,
  // which also resolves what it imports from the config file
  const hasDynamicImport = /\bimport\s*\(/.test(code);

  if (ext === '.mjs' || hasDynamicImport) {
    return [() => importWithCacheBuster(configPath)];
  }

  // a .js config may be CommonJS in an ES module package, the vm runs it as CommonJS anyway
  return [() => importWithVMCommonJS(configPath, code), () => importWithCacheBuster(configPath)];
}

// evaluates the file on every call, so vovk dev picks up an edited config
async function importWithVMCommonJS(configPath: string, code: string): Promise<VovkConfig> {
  const require = createRequire(configPath);
  const moduleObj = { exports: {} as VovkConfig };

  const contextObject = {
    module: moduleObj,
    exports: moduleObj.exports,
    require,
    __filename: configPath,
    __dirname: dirname(configPath),
    console,
    process,
    Buffer,
    URL,
    URLSearchParams,
    setTimeout,
    setInterval,
    setImmediate,
    clearTimeout,
    clearInterval,
    clearImmediate,
  };

  const context = vm.createContext(contextObject);

  const script = new vm.Script(code, {
    filename: configPath,
  });

  script.runInContext(context);

  return moduleObj.exports;
}

// unique per load: two loads in the same millisecond would share a timestamp and the cached module
let importCount = 0;

async function importWithCacheBuster(configPath: string): Promise<VovkConfig> {
  const cacheBuster = `${Date.now()}-${++importCount}`;
  const configPathUrl = pathToFileURL(configPath).href;
  // the query makes an ES module evaluate again, a CommonJS one comes from the require cache unless it's dropped
  delete createRequire(configPath).cache[configPath];
  const { default: userConfig } = (await import(`${configPathUrl}?cache=${cacheBuster}`)) as { default: VovkConfig };
  return userConfig;
}
