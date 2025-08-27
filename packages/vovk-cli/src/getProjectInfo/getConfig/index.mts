import path from 'node:path';
import { VovkSchemaIdEnum, type VovkStrictConfig } from 'vovk';
import getLogger from '../../utils/getLogger.mjs';
import getUserConfig from './getUserConfig.mjs';
import getRelativeSrcRoot from './getRelativeSrcRoot.mjs';
import type { VovkEnv } from '../../types.mjs';
import getTemplateDefs, { BuiltInTemplateName } from './getTemplateDefs.mjs';
import { normalizeOpenAPIMixin } from '../../utils/normalizeOpenAPIMixin.mjs';
import chalkHighlightThing from '../../utils/chalkHighlightThing.mjs';
import type { LogLevelNames } from 'loglevel';

export default async function getConfig({
  configPath,
  cwd,
  logLevel,
}: {
  configPath?: string;
  cwd: string;
  logLevel?: LogLevelNames;
}) {
  const { configAbsolutePaths, error, userConfig } = await getUserConfig({
    configPath,
    cwd,
  });

  const conf = userConfig ?? {};
  logLevel = logLevel ?? (conf.logLevel as LogLevelNames) ?? 'info';
  const log = getLogger(logLevel);

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
      prettifyClient: conf.composedClient?.prettifyClient ?? false,
    },
    segmentedClient: {
      ...conf.segmentedClient,
      enabled: conf.segmentedClient?.enabled ?? false,
      fromTemplates: conf.segmentedClient?.fromTemplates ?? ['ts'],
      outDir: conf.segmentedClient?.outDir ?? path.join(srcRoot ?? '.', 'client'),
      prettifyClient: conf.segmentedClient?.prettifyClient ?? true,
    },
    bundle: {
      prebundleOutDir: conf.bundle?.prebundleOutDir ?? 'tmp_prebundle',
      keepPrebundleDir: conf.bundle?.keepPrebundleDir ?? false,
      requires: {
        [BuiltInTemplateName.readme]: '.',
        [BuiltInTemplateName.packageJson]: '.',
        [BuiltInTemplateName.openapiJson]: '.',
      },
      generatorConfig: {},
      ...conf.bundle,
      tsdownBuildOptions: {
        outDir: conf.bundle?.tsdownBuildOptions?.outDir ?? 'dist',
        ...conf.bundle?.tsdownBuildOptions,
      },
    },
    modulesDir: conf.modulesDir ?? path.join(srcRoot ?? '.', 'modules'),
    schemaOutDir: env.VOVK_SCHEMA_OUT_DIR ?? conf.schemaOutDir ?? './.vovk-schema',
    rootEntry: env.VOVK_ROOT_ENTRY ?? conf.rootEntry ?? 'api',
    rootSegmentModulesDirName: conf.rootSegmentModulesDirName ?? '',
    logLevel,
    devHttps: conf.devHttps ?? false,
    moduleTemplates: {
      service: 'vovk-cli/module-templates/service.ts.ejs',
      controller: 'vovk-cli/module-templates/controller.ts.ejs',
      ...conf.moduleTemplates,
    },
    libs: conf.libs ?? {},
    generatorConfig: {
      ...conf.generatorConfig,
      origin: (env.VOVK_ORIGIN ?? conf?.generatorConfig?.origin ?? '').replace(/\/$/, ''), // Remove trailing slash
      segments: Object.fromEntries(
        await Promise.all(
          Object.entries(conf.generatorConfig?.segments ?? {}).map(async ([key, value]) => [
            key,
            {
              ...value,
              openAPIMixin: value.openAPIMixin
                ? await normalizeOpenAPIMixin({ mixinModule: value.openAPIMixin, log, cwd })
                : undefined,
            },
          ])
        )
      ),
    },
  };

  if (typeof conf.emitConfig === 'undefined') {
    config.emitConfig = ['libs', 'generatorConfig'] satisfies (keyof VovkStrictConfig)[];
  } else if (conf.emitConfig === true) {
    config.emitConfig = Object.keys(config) as (keyof VovkStrictConfig)[];
  } else if (Array.isArray(conf.emitConfig)) {
    config.emitConfig = conf.emitConfig;
  } // else it's false and emitConfig already is []

  if (!userConfig) {
    log.warn(`Unable to load config at ${chalkHighlightThing(cwd)}. Using default values. ${error ?? ''}`);
  }

  return { config, srcRoot, configAbsolutePaths, userConfig, log };
}
