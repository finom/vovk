import path from 'node:path';
import getConfig from './getConfig.mjs';
import getLogger from '../utils/getLogger.mjs';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

export default async function getProjectInfo({
  port: givenPort,
  clientOutDir,
  cwd = process.cwd(),
}: { port?: number; clientOutDir?: string; cwd?: string } = {}) {
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  // Make PORT available to the config file at getConfig
  process.env.PORT = port;

  const { config, srcRoot, configAbsolutePaths, userConfig, error } = await getConfig({ clientOutDir, cwd });
  const apiRoot = `${config.origin ?? ''}/${config.rootEntry}`;
  const apiDir = path.join(srcRoot, 'app', config.rootEntry);
  const schemaOutImportPath = path.relative(config.clientOutDir, config.schemaOutDir).replace(/\\/g, '/'); // windows fix
  const fetcherClientImportPath = config.fetcherPath.startsWith('.')
    ? path.relative(config.clientOutDir, config.fetcherPath)
    : config.fetcherPath;
  const createRPCImportPath = config.createRPCPath.startsWith('.')
    ? path.relative(config.clientOutDir, config.createRPCPath)
    : config.createRPCPath;
  const validateOnClientImportPath = config.validateOnClientPath?.startsWith('.')
    ? path.relative(config.clientOutDir, config.validateOnClientPath)
    : config.validateOnClientPath;

  const log = getLogger(config.logLevel);

  if (configAbsolutePaths.length > 1) {
    log.warn(`Multiple config files found. Using the first one: ${configAbsolutePaths[0]}`);
  }

  if (!userConfig && configAbsolutePaths.length > 0) {
    log.error(`Error reading config file at ${configAbsolutePaths[0]}: ${error?.message ?? 'Unknown Error'}`);
  }

  return {
    cwd,
    port,
    apiRoot,
    apiDir,
    srcRoot,
    schemaOutImportPath,
    fetcherClientImportPath,
    createRPCImportPath,
    validateOnClientImportPath,
    config,
    log,
  };
}
