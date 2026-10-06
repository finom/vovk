import path from 'node:path';
import type { LogLevelNames } from 'loglevel';
import type { VovkConfig } from 'vovk';
import { type VovkOpenAPIMixin, VovkSchemaIdEnum, type VovkStrictConfig } from 'vovk/internal';
import type { VovkEnv } from '../../types.mjs';
import { chalkHighlightThing } from '../../utils/chalk-highlight-thing.mjs';
import { getLogger } from '../../utils/get-logger.mjs';
import { getRelativeSrcRoot } from './get-relative-src-root.mjs';
import { BuiltInTemplateName, getTemplateDefs } from './get-template-defs.mjs';
import { getUserConfig } from './get-user-config.mjs';

export async function getConfig({
  configPath,
  cwd,
  logLevel,
}: {
  configPath?: string;
  cwd: string;
  logLevel?: LogLevelNames;
}): Promise<{
  config: VovkStrictConfig;
  srcRoot: string | null;
  configAbsolutePaths: string[];
  userConfig: VovkConfig | null;
  log: ReturnType<typeof getLogger>;
  openAPIMixins: Record<string, VovkOpenAPIMixin>;
}> {
  const { configAbsolutePaths, error, userConfig } = await getUserConfig({
    configPath,
    cwd,
  });

  // a config that exists but fails to load must not be silently replaced by defaults
  if (!userConfig && configAbsolutePaths.length) {
    throw new Error(
      `Failed to load config file at ${chalkHighlightThing(configAbsolutePaths[0])}. ${error?.message ?? 'Unknown error'}`
    );
  }

  const conf = userConfig ?? {};
  logLevel = logLevel ?? (conf.logLevel as LogLevelNames) ?? 'info';
  const log = getLogger(logLevel);

  const env = process.env as VovkEnv;
  const clientTemplateDefs = getTemplateDefs(conf.clientTemplateDefs);

  const srcRoot = await getRelativeSrcRoot({ cwd });
  const segmentConfigs = conf.outputConfig?.segments ?? {};

  const config: VovkStrictConfig = {
    $schema: VovkSchemaIdEnum.CONFIG,
    clientTemplateDefs,
    exposeConfigKeys: [],
    composedClient: {
      ...conf.composedClient,
      enabled: conf.composedClient?.enabled ?? true,
      fromTemplates: conf.composedClient?.fromTemplates ?? [BuiltInTemplateName.ts],
      outDir: conf.composedClient?.outDir ?? path.join(srcRoot ?? '.', 'client'),
      prettifyClient: conf.composedClient?.prettifyClient ?? true,
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
      outDir: conf.bundle?.outDir ?? 'dist',
      requires: {
        [BuiltInTemplateName.readme]: '.',
        [BuiltInTemplateName.packageJson]: '.',
      },
      outputConfig: {},
      build:
        conf.bundle?.build ??
        // isMissingBuild lets the bundle command fail fast before doing any work
        Object.assign(
          () => {
            throw new Error('No bundle.build function specified');
          },
          { isMissingBuild: true }
        ),
      ...conf.bundle,
    },
    modulesDir: conf.modulesDir ?? path.join(srcRoot ?? '.', 'modules'),
    schemaOutDir: env.VOVK_SCHEMA_OUT_DIR ?? conf.schemaOutDir ?? './.vovk-schema',
    rootEntry: env.VOVK_ROOT_ENTRY ?? conf.rootEntry ?? 'api',
    rootSegmentModulesDirName: conf.rootSegmentModulesDirName ?? '',
    logLevel,
    devHttps: conf.devHttps ?? false,
    moduleTemplates: {
      service: 'vovk-cli/module-templates/type/service.ts.ejs',
      controller: 'vovk-cli/module-templates/type/controller.ts.ejs',
      ...conf.moduleTemplates,
    },
    libs: conf.libs ?? {},
    outputConfig: {
      ...conf.outputConfig,
      origin: (env.VOVK_ORIGIN ?? conf?.outputConfig?.origin ?? '').replace(/\/$/, ''),
      // the mixins come back with loadOpenAPIMixins, which fetches their specs for client generation only
      segments: Object.fromEntries(
        Object.entries(segmentConfigs).map(([segmentName, { openAPIMixin: _openAPIMixin, ...segmentConfig }]) => [
          segmentName,
          segmentConfig,
        ])
      ),
    },
  };

  if (typeof conf.exposeConfigKeys === 'undefined') {
    config.exposeConfigKeys = ['libs', 'rootEntry'] satisfies (keyof VovkStrictConfig)[];
  } else if (conf.exposeConfigKeys === true) {
    config.exposeConfigKeys = Object.keys(config) as (keyof VovkStrictConfig)[];
  } else if (Array.isArray(conf.exposeConfigKeys)) {
    config.exposeConfigKeys = conf.exposeConfigKeys;
  } // else it's false and exposeConfigKeys already is []

  if (!userConfig) {
    log.warn(`No config file found at ${chalkHighlightThing(`${cwd}/`)}. Using default values.`);
  }

  const openAPIMixins = Object.fromEntries(
    Object.entries(segmentConfigs).flatMap(([segmentName, { openAPIMixin }]) =>
      openAPIMixin ? [[segmentName, openAPIMixin]] : []
    )
  );

  return { config, srcRoot, configAbsolutePaths, userConfig, log, openAPIMixins };
}
