import path from 'node:path';
import type { KnownAny, VovkStrictConfig } from 'vovk';
import camelCase from 'lodash/camelCase.js';
import getLogger from '../../utils/getLogger.mjs';
import getUserConfig from '../getUserConfig.mjs';
import getRelativeSrcRoot from '../getRelativeSrcRoot.mjs';
import type { BundleOptions, GenerateOptions, VovkEnv } from '../../types.mjs';
import getTemplateDefs, { BuiltInTemplateName } from './getTemplateDefs.mjs';
import { SchemaIdEnum } from '../../enums.mjs';

export default async function getConfig({
  cliGenerateOptions,
  cliBundleOptions,
  cwd,
}: {
  cliGenerateOptions?: GenerateOptions;
  cliBundleOptions?: BundleOptions;
  cwd: string;
}) {
  const { configAbsolutePaths, error, userConfig } = await getUserConfig({
    configPath: cliGenerateOptions?.config,
    cwd,
  });

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
    createRPC: typeof createRPCImport === 'string' ? ([createRPCImport, createRPCImport] as [string, string]) : createRPCImport,
  };

  const config: VovkStrictConfig = {
    $schema: SchemaIdEnum.CONFIG,
    clientTemplateDefs,
    imports,
    emitConfig: [],
    fullClient: {
      enabled: !cliGenerateOptions?.segmentedOnly || !!cliGenerateOptions?.fullFrom || !!cliGenerateOptions?.fullOut,
      ...conf.fullClient,
      fromTemplates: cliGenerateOptions?.fullFrom ?? conf.fullClient?.fromTemplates ?? ['mjs', 'cjs'],
      outDir: cliGenerateOptions?.fullOut ?? conf.fullClient?.outDir ?? './node_modules/.vovk-client',
    },
    segmentedClient: {
      enabled:
        !!cliGenerateOptions?.segmentedOnly ||
        !!cliGenerateOptions?.segmentedFrom ||
        !!cliGenerateOptions?.segmentedOut,
      ...conf.segmentedClient,
      fromTemplates: cliGenerateOptions?.segmentedFrom ?? conf.segmentedClient?.fromTemplates ?? ['ts'],
      outDir: cliGenerateOptions?.segmentedOut ?? conf.segmentedClient?.outDir ?? path.join(srcRoot, 'client'),
    },
    bundle: {
      outDir: cliBundleOptions?.outDir ?? conf.bundle?.outDir ?? 'dist',
      tsClientOutDir: cliBundleOptions?.tsClientOutDir ?? conf.bundle?.tsClientOutDir ?? '.tmp-ts-rpc',
      dontDeleteTsClientOutDirAfter:
        cliBundleOptions?.dontDeleteTsClientOutDirAfter ?? conf.bundle?.dontDeleteTsClientOutDirAfter ?? false,
      sourcemap: cliBundleOptions?.sourcemap ?? conf.bundle?.sourcemap ?? false,
      requires: {
        [BuiltInTemplateName.readme]: '.',
        [BuiltInTemplateName.packageJson]: '.',
      },
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
    segmentConfig: {},
  };

  if (typeof conf.emitConfig === 'undefined') {
    config.emitConfig = ['libs', '$schema'];
  } else if (conf.emitConfig === true) {
    config.emitConfig = Object.keys(config) as (keyof VovkStrictConfig)[];
  } else if (Array.isArray(conf.emitConfig)) {
    config.emitConfig = conf.emitConfig;
  } // else it's false and emitConfig already is []

  const log = getLogger(config.logLevel);

  for (const [envKey, envValue] of Object.entries(env)) {
    if (envKey.startsWith('VOVK_')) {
      const pathArr = envKey
        .replace(/^VOVK_/, '')
        .split('__')
        .map(camelCase);

      // Parse value
      let value: unknown = envValue;
      if (envValue === 'null') {
        value = null;
      } else if (envValue === 'true') {
        value = true;
      } else if (envValue === 'false') {
        value = false;
      } else if (typeof envValue === 'string' && envValue.startsWith('[') && envValue.endsWith(']')) {
        value = envValue
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      // Set value in config at the given path
      let target: KnownAny = config;
      for (let i = 0; i < pathArr.length - 1; i++) {
        const key = pathArr[i];
        if (typeof target[key] !== 'object' || target[key] === null) {
          target[key] = {};
        }
        target = target[key];
      }
      target[pathArr[pathArr.length - 1]] = value;
      log.debug(`Set config.${pathArr.join('.')} from env ${envKey}=${envValue}`);
    }
  }

  return { config, srcRoot, configAbsolutePaths, userConfig, error, log };
}
