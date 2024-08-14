import getConfig from '../lib/getConfig';
import { VovkConfigNew, VovkEnvNew } from '../types';
import getNextProjectInfo from './getNextProjectInfo';
import locateSegments from './locateSegments';
import getCwdPath from './getCwdPath';
import path from 'path';
import * as loglevel from 'loglevel';
import chalk from 'chalk';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

export default async function getProjectInfo({
  port: givenPort,
  clientOutDir,
}: { port?: number; clientOutDir?: string } = {}) {
  const env = process.env as VovkEnvNew;
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  const nextProjectInfo = await getNextProjectInfo();
  const config: Required<VovkConfigNew> = {
    modulesDir: getCwdPath(
      env.VOVK_MODULES_DIR ?? './' + [nextProjectInfo.projectRoot, 'modules'].filter(Boolean).join('/')
    ),
    validateOnClient: getCwdPath(env.VOVK_VALIDATE_ON_CLIENT ?? null),
    validationLibrary: getCwdPath(env.VOVK_VALIDATION_LIBRARY ?? null),
    fetcher: getCwdPath(env.VOVK_FETCHER ?? 'vovk/client/defaultFetcher'),
    metadataOutDir: env.VOVK_METADATA_OUT_DIR ?? './.vovk',
    clientOutDir: clientOutDir ?? env.VOVK_CLIENT_OUT_DIR ?? './node_modules/.vovk',
    origin: env.VOVK_ORIGIN ?? 'http://localhost:' + port,
    rootEntry: env.VOVK_ROOT_ENTRY ?? 'api',
    rootSegmentModulesDirName: env.VOVK_ROOT_SEGMENT_MODULES_DIR_NAME ?? '',
    logLevel: env.VOVK_LOG_LEVEL ?? 'debug', // TODO: change to 'warn' when v3 is ready
  };
  const vovkPort = env.VOVK_PORT || (parseInt(port) + 6969).toString();
  const segments = await locateSegments(nextProjectInfo.projectRoot);

  // Make PORT available to the config file
  process.env.PORT = port;
  // TODO env variables should override config file
  const userConfig = await getConfig();
  Object.assign(config, userConfig);

  config.origin = config.origin.replace(/\/$/, ''); // Remove trailing slash

  const apiEntryPoint = `${config.origin}/${config.rootEntry}`;
  const userConfigOrigin = env.VOVK_ORIGIN ?? userConfig.origin;
  const apiPrefix = userConfigOrigin ? `${userConfigOrigin.replace(/\/$/, '')}/${config.rootEntry}` : config.rootEntry;
  const apiDir = path.join(nextProjectInfo.projectRoot, config.rootEntry);

  const metadataOutFullPath = path.join(nextProjectInfo.projectRoot, config.metadataOutDir);
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
    nextProjectInfo,
    metadataOutFullPath,
    metadataOutImportPath,
    clientOutFullPath,
    fetcherClientImportPath,
    segments,
    config,
    log,
  };
}
