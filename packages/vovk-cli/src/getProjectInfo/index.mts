import path from 'path';
import loglevel from 'loglevel';
import chalk from 'chalk';
import getConfig from './getConfig.mjs';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

export default async function getProjectInfo({
  port: givenPort,
  clientOutDir,
}: { port?: number; clientOutDir?: string } = {}) {
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  // Make PORT available to the config file at getConfig
  process.env.PORT = port;

  const cwd = process.cwd();
  const { config, srcRoot } = await getConfig({ clientOutDir });
  const apiEntryPoint = `${config.origin ?? ''}/${config.rootEntry}`;
  const apiDir = path.join(srcRoot, 'app', config.rootEntry);

  const schemaOutImportPath = path.relative(config.clientOutDir, config.schemaOutDir);
  const fetcherClientImportPath = config.fetcher.startsWith('.')
    ? path.relative(config.clientOutDir, config.fetcher)
    : config.fetcher;

  const log = {
    info: (msg: string) => loglevel.info(chalk.blueBright(`🐺 ${msg}`)),
    warn: (msg: string) => loglevel.warn(chalk.yellowBright(`🐺 ${msg}`)),
    error: (msg: string) => loglevel.error(chalk.redBright(`🐺 ${msg}`)),
    debug: (msg: string) => loglevel.debug(chalk.gray(`🐺 ${msg}`)),
    raw: loglevel,
  };

  loglevel.setLevel(config.logLevel);

  return {
    cwd,
    port,
    apiEntryPoint,
    apiDir,
    srcRoot,
    schemaOutImportPath,
    fetcherClientImportPath,
    config,
    log,
  };
}
