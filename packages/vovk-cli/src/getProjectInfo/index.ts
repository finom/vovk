import readConfig from '../lib/readConfig';
import { VovkConfigNew, VovkEnvNew } from '../types';
import getNextProjectInfo from './getNextProjectInfo';
import getCwdPath from './getCwdPath';
import path from 'path';
import * as loglevel from 'loglevel';
import chalk from 'chalk';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

// TODO make config file dynamic
export default async function getProjectInfo({
  port: givenPort,
  clientOutDir,
}: { port?: number; clientOutDir?: string } = {}) {
  const env = process.env as VovkEnvNew;
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  const { projectRoot } = await getNextProjectInfo();
  // Make PORT available to the config file
  process.env.PORT = port;

  const userConfig = await readConfig();

  const config: Required<VovkConfigNew> = {
    modulesDir: getCwdPath(
      env.VOVK_MODULES_DIR ?? userConfig.modulesDir ?? './' + [projectRoot, 'modules'].filter(Boolean).join('/')
    ),
    validateOnClient: getCwdPath(env.VOVK_VALIDATE_ON_CLIENT ?? userConfig.validateOnClient ?? null),
    validationLibrary: getCwdPath(env.VOVK_VALIDATION_LIBRARY ?? userConfig.validationLibrary ?? null),
    fetcher: getCwdPath(env.VOVK_FETCHER ?? userConfig.fetcher ?? 'vovk/client/defaultFetcher'),
    metadataOutDir: env.VOVK_METADATA_OUT_DIR ?? userConfig.metadataOutDir ?? './.vovk',
    clientOutDir: clientOutDir ?? env.VOVK_CLIENT_OUT_DIR ?? userConfig.clientOutDir ?? './node_modules/.vovk',
    origin: (env.VOVK_ORIGIN ?? userConfig.origin ?? 'http://localhost:' + port).replace(/\/$/, ''), // Remove trailing slash
    rootEntry: env.VOVK_ROOT_ENTRY ?? userConfig.rootEntry ?? 'api',
    rootSegmentModulesDirName: env.VOVK_ROOT_SEGMENT_MODULES_DIR_NAME ?? userConfig.rootSegmentModulesDirName ?? '',
    logLevel: env.VOVK_LOG_LEVEL ?? userConfig.logLevel ?? 'debug', // TODO: change to 'warn' when v3 is ready
  };
  const vovkPort = env.VOVK_PORT || (parseInt(port) + 6969).toString();
  const apiEntryPoint = `${config.origin}/${config.rootEntry}`;
  const userConfigOrigin = env.VOVK_ORIGIN ?? userConfig.origin;
  const apiPrefix = userConfigOrigin ? `${userConfigOrigin.replace(/\/$/, '')}/${config.rootEntry}` : config.rootEntry;
  const apiDir = path.join(projectRoot, config.rootEntry);

  const metadataOutFullPath = path.join(projectRoot, config.metadataOutDir);
  const metadataOutImportPath = path.relative(config.clientOutDir, metadataOutFullPath);
  const fetcherClientImportPath = config.fetcher.startsWith('.')
    ? path.relative(config.clientOutDir, config.fetcher)
    : config.fetcher;

  const clientOutFullPath = getCwdPath(config.clientOutDir);

  const log = {
    info: (msg: string) => loglevel.info(chalk.blueBright(`🐺 ${msg}`)),
    warn: (msg: string) => loglevel.warn(chalk.yellowBright(`🐺 ${msg}`)),
    error: (msg: string) => loglevel.error(chalk.redBright(`🐺 ${msg}`)),
    debug: (msg: string) => loglevel.debug(chalk.gray(`🐺 ${msg}`)),
    raw: loglevel,
  };

  loglevel.setLevel(config.logLevel);

  return {
    port,
    vovkPort,
    apiEntryPoint,
    apiPrefix,
    apiDir,
    projectRoot,
    metadataOutFullPath,
    metadataOutImportPath,
    clientOutFullPath,
    fetcherClientImportPath,
    config,
    log,
  };
}
