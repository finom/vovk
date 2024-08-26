import type { VovkEnv } from '../types';
import path from 'path';
import * as loglevel from 'loglevel';
import chalk from 'chalk';
import getConfig from './getConfig';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

// TODO: Rename all occurrences of metadata to schema
// TODO: Rename default API option "prefix" to "apiRoot" or just "root" (?)
// TODO: Load config dynamically to generate client and write schema
// TODO: Create VovkCLIError class
export default async function getProjectInfo({
  port: givenPort,
  clientOutDir,
}: { port?: number; clientOutDir?: string } = {}) {
  const env = process.env as VovkEnv;
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  // Make PORT available to the config file at getConfig
  process.env.PORT = port;

  const cwd = process.cwd();
  const { config, srcRoot } = await getConfig({ clientOutDir });
  const vovkPort = env.VOVK_PORT || (parseInt(port) + 6969).toString();
  const apiEntryPoint = `${config.origin}/${config.rootEntry}`; // ??? TODO
  const apiPrefix = `${config.origin}/${config.rootEntry}`; // ??? TODO
  const apiDir = path.join(srcRoot, 'app', config.rootEntry);

  const metadataOutFullPath = path.join(cwd, config.metadataOutDir);
  const metadataOutImportPath = path.relative(config.clientOutDir, metadataOutFullPath);
  const fetcherClientImportPath = config.fetcher.startsWith('.')
    ? path.relative(config.clientOutDir, config.fetcher)
    : config.fetcher;

  const clientOutFullPath = path.join(cwd, config.clientOutDir);

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
