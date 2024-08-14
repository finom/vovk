import type { VovkEnvNew } from '../types';
import getCwdPath from './getCwdPath';
import path from 'path';
import * as loglevel from 'loglevel';
import chalk from 'chalk';
import getConfig from './getConfig';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

export default async function getProjectInfo({
  port: givenPort,
  clientOutDir,
}: { port?: number; clientOutDir?: string } = {}) {
  const env = process.env as VovkEnvNew;
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  // Make PORT available to the config file
  process.env.PORT = port;

  const { config, srcRoot } = await getConfig({ clientOutDir });
  const vovkPort = env.VOVK_PORT || (parseInt(port) + 6969).toString();
  const apiEntryPoint = `${config.origin}/${config.rootEntry}`;
  const apiPrefix = `${config.origin}/${config.rootEntry}`;
  const apiDir = path.join(srcRoot, config.rootEntry);

  const metadataOutFullPath = path.join(srcRoot, config.metadataOutDir);
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
    srcRoot,
    metadataOutFullPath,
    metadataOutImportPath,
    clientOutFullPath,
    fetcherClientImportPath,
    config,
    log,
  };
}
