import type { VovkEnv, VovkStrictConfig } from 'vovk';
import getUserConfig from './getUserConfig.mjs';
import getRelativeSrcRoot from './getRelativeSrcRoot.mjs';

export default async function getConfig({
  clientOutDir,
  configPath,
  cwd,
}: {
  clientOutDir?: string;
  configPath?: string;
  cwd: string;
}) {
  const env = process.env as VovkEnv;
  const { configAbsolutePaths, error, userConfig } = await getUserConfig({ configPath, cwd });
  const conf = userConfig ?? {};
  const srcRoot = await getRelativeSrcRoot({ cwd });

  const validateOnClientImport = env.VOVK_VALIDATE_ON_CLIENT_PATH ?? conf.imports?.validateOnClient ?? null;
  const fetcherImport = env.VOVK_FETCHER_PATH ?? conf.imports?.fetcher ?? 'vovk';
  const createRPCImport = env.VOVK_CREATE_RPC_PATH ?? conf.imports?.createRPC ?? 'vovk';
  const defaultClientTemplates = ['module', 'main'];

  const config: VovkStrictConfig = {
    emitConfig: [],
    emitFullClient: 'VOVK_EMIT_FULL_CLIENT' in env ? !!env.VOVK_EMIT_FULL_CLIENT : (conf.emitFullClient ?? true),
    emitSegmentClient:
      'VOVK_EMIT_SEGMENT_CLIENT' in env ? !!env.VOVK_EMIT_SEGMENT_CLIENT : (conf.emitSegmentClient ?? false),
    modulesDir: env.VOVK_MODULES_DIR ?? conf.modulesDir ?? './' + [srcRoot, 'modules'].filter(Boolean).join('/'),
    imports: {
      fetcher: typeof fetcherImport === 'string' ? [fetcherImport] : fetcherImport,
      validateOnClient:
        typeof validateOnClientImport === 'string' ? [validateOnClientImport] : (validateOnClientImport ?? null),
      createRPC: typeof createRPCImport === 'string' ? [createRPCImport, 'vovk'] : createRPCImport,
    },
    schemaOutDir: env.VOVK_SCHEMA_OUT_DIR ?? conf.schemaOutDir ?? './.vovk-schema',
    clientOutDir: clientOutDir ?? env.VOVK_CLIENT_OUT_DIR ?? conf.clientOutDir ?? './node_modules/.vovk-client',
    origin: (env.VOVK_ORIGIN ?? conf.origin ?? '').replace(/\/$/, ''), // Remove trailing slash
    rootEntry: env.VOVK_ROOT_ENTRY ?? conf.rootEntry ?? 'api',
    rootSegmentModulesDirName: env.VOVK_ROOT_SEGMENT_MODULES_DIR_NAME ?? conf.rootSegmentModulesDirName ?? '',
    logLevel: env.VOVK_LOG_LEVEL ?? conf.logLevel ?? 'info',
    prettifyClient: (env.VOVK_PRETTIFY_CLIENT ? !!env.VOVK_PRETTIFY_CLIENT : null) ?? conf.prettifyClient ?? false,
    devHttps: (env.VOVK_DEV_HTTPS ? !!env.VOVK_DEV_HTTPS : null) ?? conf.devHttps ?? false,
    generateFrom:
      typeof conf.generateFrom === 'function'
        ? conf.generateFrom(defaultClientTemplates)
        : (conf.generateFrom ?? defaultClientTemplates),
    templates: {
      service: 'vovk-cli/templates/service.ejs',
      controller: 'vovk-cli/templates/controller.ejs',
      ...conf.templates,
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
