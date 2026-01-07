import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname } from 'node:path';
import vm from 'node:vm';
import type { VovkConfig } from 'vovk';
import { getConfigAbsolutePaths } from './getConfigAbsolutePaths.mjs';

const isVMModulesEnabled = typeof vm.SourceTextModule !== 'undefined';

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
  const hasDynamicImport = /\bimport\s*\(/.test(code);

  // If config has dynamic imports and flag is not enabled, skip VM loaders entirely
  const canUseVM = isVMModulesEnabled || !hasDynamicImport;

  switch (ext) {
    case '.mjs':
      return canUseVM
        ? [() => importWithVMModule(configPath, code), () => importWithCacheBuster(configPath)]
        : [() => importWithCacheBuster(configPath)];
    case '.cjs':
      return canUseVM
        ? [() => importWithVMCommonJS(configPath, code), () => importWithCacheBuster(configPath)]
        : [() => importWithCacheBuster(configPath)];
    case '.js':
    default:
      return canUseVM
        ? [
            () => importWithVMCommonJS(configPath, code),
            () => importWithVMModule(configPath, code),
            () => importWithCacheBuster(configPath),
          ]
        : [() => importWithCacheBuster(configPath)];
  }
}

function createDynamicImportHandler(context: vm.Context) {
  return async (specifier: string) => {
    const imported = await import(specifier);

    const exportNames = Object.keys(imported);
    const syntheticModule = new vm.SyntheticModule(
      exportNames,
      function () {
        for (const name of exportNames) {
          this.setExport(name, imported[name]);
        }
      },
      { context, identifier: specifier }
    );

    await syntheticModule.link(() => {
      throw new Error('Nested linking not supported');
    });
    await syntheticModule.evaluate();

    return syntheticModule;
  };
}

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
    importModuleDynamically: createDynamicImportHandler(context),
  });

  script.runInContext(context);

  return moduleObj.exports;
}

async function importWithVMModule(configPath: string, code: string): Promise<VovkConfig> {
  if (!isVMModulesEnabled) {
    throw new Error('vm.SourceTextModule not available');
  }

  const configUrl = pathToFileURL(configPath).href;

  const context = vm.createContext({
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
  });

  const module = new vm.SourceTextModule(code, {
    context,
    identifier: configUrl,
    initializeImportMeta(meta) {
      meta.url = configUrl;
    },
    importModuleDynamically: createDynamicImportHandler(context),
  });

  await module.link(async (specifier) => {
    const imported = await import(specifier);

    const exportNames = Object.keys(imported);
    const syntheticModule = new vm.SyntheticModule(
      exportNames,
      function () {
        for (const name of exportNames) {
          this.setExport(name, imported[name]);
        }
      },
      { context, identifier: specifier }
    );

    return syntheticModule;
  });

  await module.evaluate();

  return (module.namespace as { default: VovkConfig }).default;
}

async function importWithCacheBuster(configPath: string): Promise<VovkConfig> {
  const cacheBuster = Date.now();
  const configPathUrl = pathToFileURL(configPath).href;
  const { default: userConfig } = (await import(`${configPathUrl}?cache=${cacheBuster}`)) as { default: VovkConfig };
  return userConfig;
}
