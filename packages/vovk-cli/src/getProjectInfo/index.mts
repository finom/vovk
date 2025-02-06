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
  const schemaOutImportPath =
    path.relative(config.clientOutDir, config.schemaOutDir).replace(/\\/g, '/') + // windows fix
    '/main.cjs';

  const log = getLogger(config.logLevel);

  if (configAbsolutePaths.length > 1) {
    log.warn(`Multiple config files found. Using the first one: ${configAbsolutePaths[0]}`);
  }

  if (!userConfig && configAbsolutePaths.length > 0) {
    log.error(`Error reading config file at ${configAbsolutePaths[0]}: ${error?.message ?? 'Unknown Error'}`);
  }

  const getImportPath = (p: string) => (p.startsWith('.') ? path.relative(config.clientOutDir, p) : p);
  const clientImports = {
    schema: schemaOutImportPath,
    fetcher: getImportPath(config.fetcherImport[0]),
    createRPC: getImportPath(config.createRPCImport[0]),
    validateOnClient: config.validateOnClientImport ? getImportPath(config.validateOnClientImport[0]) : null,
    module: {
      schema: schemaOutImportPath,
      fetcher: getImportPath(config.fetcherImport[1] ?? config.fetcherImport[0]),
      createRPC: getImportPath(config.createRPCImport[1] ?? config.createRPCImport[0]),
      validateOnClient: config.validateOnClientImport
        ? getImportPath(config.validateOnClientImport[1] ?? config.validateOnClientImport[0])
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
