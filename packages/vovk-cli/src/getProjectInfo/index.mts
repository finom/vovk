import path from 'node:path';
import getConfig from './getConfig.mjs';
import getLogger from '../utils/getLogger.mjs';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

export default async function getProjectInfo({
  port: givenPort,
  clientOutDir,
  configPath,
  cwd = process.cwd(),
}: { port?: number; clientOutDir?: string; configPath?: string; cwd?: string } = {}) {
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  // Make PORT available to the config file at getConfig
  process.env.PORT = port;

  const { config, srcRoot, configAbsolutePaths, userConfig, error } = await getConfig({
    clientOutDir,
    configPath,
    cwd,
  });
  const apiRoot = `${config.origin ?? ''}/${config.rootEntry}`;
  const apiDir = path.join(srcRoot, 'app', config.rootEntry);

  const log = getLogger(config.logLevel);

  if (configAbsolutePaths.length > 1) {
    log.warn(`Multiple config files found. Using the first one: ${configAbsolutePaths[0]}`);
  }

  if (!userConfig && configAbsolutePaths.length > 0) {
    log.error(`Error reading config file at ${configAbsolutePaths[0]}: ${error?.message ?? 'Unknown Error'}`);
  }

  const getImportPath = (p: string) => (p.startsWith('.') ? path.relative(config.clientOutDir, p) : p);
  const clientImports = {
    fetcher: getImportPath(config.imports.fetcher[0]),
    createRPC: getImportPath(config.imports.createRPC[0]),
    validateOnClient: config.imports.validateOnClient ? getImportPath(config.imports.validateOnClient[0]) : null,
    module: {
      fetcher: getImportPath(config.imports.fetcher[1] ?? config.imports.fetcher[0]),
      createRPC: getImportPath(config.imports.createRPC[1] ?? config.imports.createRPC[0]),
      validateOnClient: config.imports.validateOnClient
        ? getImportPath(config.imports.validateOnClient[1] ?? config.imports.validateOnClient[0])
        : null,
    },
  };

  return {
    cwd,
    port,
    apiRoot,
    apiDir,
    srcRoot,
    config,
    clientImports,
    log,
  };
}
