import getUserConfig from './getUserConfig.mjs';
import type { VovkConfig, VovkEnv } from '../types.mjs';
import getRelativeSrcRoot from './getRelativeSrcRoot.mjs';

export default async function getConfig({ clientOutDir, cwd }: { clientOutDir?: string; cwd: string }) {
  const env = process.env as VovkEnv;
  const { configAbsolutePaths, error, userConfig } = await getUserConfig({ cwd });
  const conf = userConfig ?? {};
  const srcRoot = await getRelativeSrcRoot({ cwd });
  const config: Required<VovkConfig> = {
    modulesDir: env.VOVK_MODULES_DIR ?? conf.modulesDir ?? './' + [srcRoot, 'modules'].filter(Boolean).join('/'),
    validateOnClientPath: env.VOVK_VALIDATE_ON_CLIENT_PATH ?? conf.validateOnClientPath ?? null,
    fetcherPath: env.VOVK_FETCHER_PATH ?? conf.fetcherPath ?? 'vovk/dist/client/defaultFetcher',
    schemaOutDir: env.VOVK_SCHEMA_OUT_DIR ?? conf.schemaOutDir ?? './.vovk-schema',
    clientOutDir: clientOutDir ?? env.VOVK_CLIENT_OUT_DIR ?? conf.clientOutDir ?? './node_modules/.vovk-client',
    origin: (env.VOVK_ORIGIN ?? conf.origin ?? '').replace(/\/$/, ''), // Remove trailing slash
    rootEntry: env.VOVK_ROOT_ENTRY ?? conf.rootEntry ?? 'api',
    rootSegmentModulesDirName: env.VOVK_ROOT_SEGMENT_MODULES_DIR_NAME ?? conf.rootSegmentModulesDirName ?? '',
    logLevel: env.VOVK_LOG_LEVEL ?? conf.logLevel ?? 'info',
    prettifyClient: (env.VOVK_PRETTIFY_CLIENT ? !!env.VOVK_PRETTIFY_CLIENT : null) ?? conf.prettifyClient ?? false,
    devHttps: (env.VOVK_DEV_HTTPS ? !!env.VOVK_DEV_HTTPS : null) ?? conf.devHttps ?? false,
    experimental_clientGenerateTemplateNames: conf.experimental_clientGenerateTemplateNames ?? ['ts', 'compiled'],
    templates: {
      service: 'vovk-cli/templates/service.ejs',
      controller: 'vovk-cli/templates/controller.ejs',
      ...conf.templates,
    },
  };

  return { config, srcRoot, configAbsolutePaths, userConfig, error };
}
