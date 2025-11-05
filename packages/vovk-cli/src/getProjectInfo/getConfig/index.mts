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

  const config: VovkStrictConfig = {
    $schema: VovkSchemaIdEnum.CONFIG,
    clientTemplateDefs,
    exposeConfigKeys: [],
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
      outDir: conf.bundle?.outDir ?? 'dist',
      requires: {
        [BuiltInTemplateName.readme]: '.',
        [BuiltInTemplateName.packageJson]: '.',
      },
      outputConfig: {},
      build:
        conf.bundle?.build ??
        (() => {
          throw new Error('No bundle.build function specified');
        }),
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
      origin: (env.VOVK_ORIGIN ?? conf?.outputConfig?.origin ?? '').replace(/\/$/, ''), // Remove trailing slash
      segments: Object.fromEntries(
        await Promise.all(
          Object.entries(conf.outputConfig?.segments ?? {}).map(async ([key, value]) => [
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

  if (typeof conf.exposeConfigKeys === 'undefined') {
    config.exposeConfigKeys = ['libs'] satisfies (keyof VovkStrictConfig)[];
  } else if (conf.exposeConfigKeys === true) {
    config.exposeConfigKeys = Object.keys(config) as (keyof VovkStrictConfig)[];
  } else if (Array.isArray(conf.exposeConfigKeys)) {
    config.exposeConfigKeys = conf.exposeConfigKeys;
  } // else it's false and exposeConfigKeys already is []

  if (!userConfig) {
    log.warn(`Unable to load config at ${chalkHighlightThing(cwd)}. Using default values. ${error ?? ''}`);
  }

  return { config, srcRoot, configAbsolutePaths, userConfig, log };
}
