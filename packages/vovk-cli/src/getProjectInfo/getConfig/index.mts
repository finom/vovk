import path from 'node:path';
import { VovkSchemaIdEnum, type VovkStrictConfig } from 'vovk';
import getLogger from '../../utils/getLogger.mjs';
import getUserConfig from './getUserConfig.mjs';
import getRelativeSrcRoot from './getRelativeSrcRoot.mjs';
import type { VovkEnv } from '../../types.mjs';
import getTemplateDefs, { BuiltInTemplateName } from './getTemplateDefs.mjs';
import { normalizeOpenAPIMixins } from '../../utils/normalizeOpenAPIMixins.mjs';
import chalkHighlightThing from '../../utils/chalkHighlightThing.mjs';

export default async function getConfig({ configPath, cwd }: { configPath?: string; cwd: string }) {
  const { configAbsolutePaths, error, userConfig } = await getUserConfig({
    configPath,
    cwd,
  });

  const conf = userConfig ?? {};
  const env = process.env as VovkEnv;
  const clientTemplateDefs = getTemplateDefs(conf.clientTemplateDefs);

  const srcRoot = await getRelativeSrcRoot({ cwd });

  const validateOnClientImport = conf.imports?.validateOnClient ?? null;
  const fetcherImport = conf.imports?.fetcher ?? 'vovk';
  const createRPCImport = conf.imports?.createRPC ?? 'vovk';

  const imports = {
    fetcher: typeof fetcherImport === 'string' ? ([fetcherImport] as [string]) : fetcherImport,
    validateOnClient:
      typeof validateOnClientImport === 'string'
        ? ([validateOnClientImport] as [string])
        : (validateOnClientImport ?? null),
    createRPC: typeof createRPCImport === 'string' ? ([createRPCImport] as [string]) : createRPCImport,
  };

  const config: VovkStrictConfig = {
    $schema: VovkSchemaIdEnum.CONFIG,
    clientTemplateDefs,
    imports,
    emitConfig: [],
    composedClient: {
      ...conf.composedClient,
      enabled: conf.composedClient?.enabled ?? true,
      fromTemplates: conf.composedClient?.fromTemplates ?? ['mjs', 'cjs'],
      outDir: conf.composedClient?.outDir ?? './node_modules/.vovk-client',
    },
    segmentedClient: {
      ...conf.segmentedClient,
      enabled: conf.segmentedClient?.enabled ?? false,
      fromTemplates: conf.segmentedClient?.fromTemplates ?? ['ts'],
      outDir: conf.segmentedClient?.outDir ?? path.join(srcRoot ?? '.', 'client'),
    },
    bundle: {
      tsClientOutDir: conf.bundle?.tsClientOutDir ?? 'tmp_prebundle',
      dontDeleteTsClientOutDirAfter: conf.bundle?.dontDeleteTsClientOutDirAfter ?? false,
      requires: {
        [BuiltInTemplateName.readme]: '.',
        [BuiltInTemplateName.packageJson]: '.',
      },
      package: {},
      readme: {},
      ...conf.bundle,
      tsdownBuildOptions: {
        outDir: conf.bundle?.tsdownBuildOptions?.outDir ?? 'dist',
        ...conf.bundle?.tsdownBuildOptions,
      },
    },
    modulesDir: conf.modulesDir ?? path.join(srcRoot ?? '.', 'modules'),
    schemaOutDir: env.VOVK_SCHEMA_OUT_DIR ?? conf.schemaOutDir ?? './.vovk-schema',
    origin: (env.VOVK_ORIGIN ?? conf.origin ?? '').replace(/\/$/, ''), // Remove trailing slash
    rootEntry: env.VOVK_ROOT_ENTRY ?? conf.rootEntry ?? 'api',
    rootSegmentModulesDirName: conf.rootSegmentModulesDirName ?? '',
    logLevel: env.VOVK_LOG_LEVEL ?? conf.logLevel ?? 'info',
    prettifyClient: (env.VOVK_PRETTIFY_CLIENT ? !!env.VOVK_PRETTIFY_CLIENT : null) ?? conf.prettifyClient ?? false,
    devHttps: (env.VOVK_DEV_HTTPS ? !!env.VOVK_DEV_HTTPS : null) ?? conf.devHttps ?? false,
    moduleTemplates: {
      service: 'vovk-cli/module-templates/service.ts.ejs',
      controller: 'vovk-cli/module-templates/controller.ts.ejs',
      ...conf.moduleTemplates,
    },
    libs: conf.libs ?? {},
    segmentConfig: conf.segmentConfig ?? {},
    openApiMixins: {},
  };

  if (typeof conf.emitConfig === 'undefined') {
    config.emitConfig = ['libs'];
  } else if (conf.emitConfig === true) {
    config.emitConfig = Object.keys(config) as (keyof VovkStrictConfig)[];
  } else if (Array.isArray(conf.emitConfig)) {
    config.emitConfig = conf.emitConfig;
  } // else it's false and emitConfig already is []

  const log = getLogger(config.logLevel);

  config.openApiMixins = await normalizeOpenAPIMixins({
    mixinModules: conf.openApiMixins ?? {},
    cwd,
    log,
  });

  if (!userConfig) {
    log.warn(`Unable to load config at ${chalkHighlightThing(cwd)}. Using default values. ${error ?? ''}`);
  }

  return { config, srcRoot, configAbsolutePaths, userConfig, log };
}
