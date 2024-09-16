import readConfig from './readConfig.mjs';
import type { VovkConfig, VovkEnv } from '../types.mjs';
import getRelativeSrcRoot from './getRelativeSrcRoot.mjs';

export default async function getConfig({ clientOutDir }: { clientOutDir?: string }) {
  const env = process.env as VovkEnv;
  const userConfig = await readConfig();
  const srcRoot = await getRelativeSrcRoot();
  const config: Required<Omit<VovkConfig, '_devForceAppDir'>> = {
    modulesDir: env.VOVK_MODULES_DIR ?? userConfig.modulesDir ?? './' + [srcRoot, 'modules'].filter(Boolean).join('/'),
    validateOnClient: env.VOVK_VALIDATE_ON_CLIENT ?? userConfig.validateOnClient ?? null,
    validationLibrary: env.VOVK_VALIDATION_LIBRARY ?? userConfig.validationLibrary ?? null,
    fetcher: env.VOVK_FETCHER ?? userConfig.fetcher ?? 'vovk/client/defaultFetcher',
    schemaOutDir: env.VOVK_SCHEMA_OUT_DIR ?? userConfig.schemaOutDir ?? './.vovk-schema',
    clientOutDir: clientOutDir ?? env.VOVK_CLIENT_OUT_DIR ?? userConfig.clientOutDir ?? './node_modules/.vovk-client',
    origin: (env.VOVK_ORIGIN ?? userConfig.origin ?? '').replace(/\/$/, ''), // Remove trailing slash
    rootEntry: env.VOVK_ROOT_ENTRY ?? userConfig.rootEntry ?? 'api',
    rootSegmentModulesDirName: env.VOVK_ROOT_SEGMENT_MODULES_DIR_NAME ?? userConfig.rootSegmentModulesDirName ?? '',
    logLevel: env.VOVK_LOG_LEVEL ?? userConfig.logLevel ?? 'debug', // TODO: change to 'warn' when v3 is ready
    prettifyClient: userConfig.prettifyClient ?? false,
    templates: {
      service: 'vovk-cli/templates/service.ejs',
      controller: 'vovk-cli/templates/controller.ejs',
      worker: 'vovk-cli/templates/worker.ejs',
      ...userConfig.templates,
    },
  };

  // forceAppDir is used for testing purposes
  return { config, srcRoot };
}
