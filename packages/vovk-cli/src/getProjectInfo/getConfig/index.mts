import path from 'node:path';
import type { VovkEnv, VovkStrictConfig } from 'vovk';
import getUserConfig from '../getUserConfig.mjs';
import getRelativeSrcRoot from '../getRelativeSrcRoot.mjs';
import type { GenerateOptions } from '../../types.mjs';
import getTemplateDefs from './getTemplateDefs.mjs';

export default async function getConfig({ cliOptions, cwd }: { cliOptions?: GenerateOptions; cwd: string }) {
  const { configAbsolutePaths, error, userConfig } = await getUserConfig({ configPath: cliOptions?.config, cwd });

  const conf = userConfig ?? {};
  const env = process.env as VovkEnv;
  const clientTemplateDefs = getTemplateDefs(conf.clientTemplateDefs);

  const srcRoot = await getRelativeSrcRoot({ cwd });

  const validateOnClientImport = env.VOVK_IMPORTS_VALIDATE_ON_CLIENT ?? conf.imports?.validateOnClient ?? null;
  const fetcherImport = env.VOVK_IMPORTS_FETCHER ?? conf.imports?.fetcher ?? 'vovk';
  const createRPCImport = env.VOVK_IMPORTS_CREATE_RPC ?? conf.imports?.createRPC ?? 'vovk';

  const imports = {
    fetcher: typeof fetcherImport === 'string' ? ([fetcherImport] as [string]) : fetcherImport,
    validateOnClient:
      typeof validateOnClientImport === 'string'
        ? ([validateOnClientImport] as [string])
        : (validateOnClientImport ?? null),
    createRPC: typeof createRPCImport === 'string' ? ([createRPCImport, 'vovk'] as [string, string]) : createRPCImport,
  };

  const config: VovkStrictConfig = {
    clientTemplateDefs,
    imports,
    emitConfig: [],
    fullClient: {
      enabled: true,
      ...conf.fullClient,
      fromTemplates: cliOptions?.fullClientFrom ?? conf.fullClient?.fromTemplates ?? ['module', 'main'],
      outDir: cliOptions?.fullClientOut ?? conf.fullClient?.outDir ?? './node_modules/.vovk-client',
    },
    segmentedClient: {
      enabled: false,
      ...conf.segmentedClient,
      fromTemplates: cliOptions?.segmentedClientFrom ?? conf.segmentedClient?.fromTemplates ?? ['ts'],
      outDir: cliOptions?.segmentedClientOut ?? conf.segmentedClient?.outDir ?? path.join(srcRoot, 'client'),
    },
    modulesDir: env.VOVK_MODULES_DIR ?? conf.modulesDir ?? './' + [srcRoot, 'modules'].filter(Boolean).join('/'),
    schemaOutDir: env.VOVK_SCHEMA_OUT_DIR ?? conf.schemaOutDir ?? './.vovk-schema',
    origin: (env.VOVK_ORIGIN ?? conf.origin ?? '').replace(/\/$/, ''), // Remove trailing slash
    rootEntry: env.VOVK_ROOT_ENTRY ?? conf.rootEntry ?? 'api',
    rootSegmentModulesDirName: env.VOVK_ROOT_SEGMENT_MODULES_DIR_NAME ?? conf.rootSegmentModulesDirName ?? '',
    logLevel: env.VOVK_LOG_LEVEL ?? conf.logLevel ?? 'info',
    prettifyClient: (env.VOVK_PRETTIFY_CLIENT ? !!env.VOVK_PRETTIFY_CLIENT : null) ?? conf.prettifyClient ?? false,
    devHttps: (env.VOVK_DEV_HTTPS ? !!env.VOVK_DEV_HTTPS : null) ?? conf.devHttps ?? false,
    moduleTemplates: {
      service: 'vovk-cli/templates/service.ts.ejs',
      controller: 'vovk-cli/templates/controller.ts.ejs',
      ...conf.moduleTemplates,
    },
    libs: conf.libs ?? {},
  };

  if (typeof conf.emitConfig === 'undefined') {
    config.emitConfig = ['libs'];
  } else if (conf.emitConfig === true) {
    config.emitConfig = Object.keys(config) as (keyof VovkStrictConfig)[];
  } else if (Array.isArray(conf.emitConfig)) {
    config.emitConfig = conf.emitConfig;
  } // else it's false and emitConfig already is []

  return { config, srcRoot, configAbsolutePaths, userConfig, error };
}
