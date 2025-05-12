import path from 'node:path';
import getConfig from './getConfig/index.mjs';
import locateSegments from '../locateSegments.mjs';
import type { BundleOptions, GenerateOptions } from '../types.mjs';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

export default async function getProjectInfo({
  port: givenPort,
  cwd = process.cwd(),
  cliGenerateOptions,
  cliBundleOptions,
}: { port?: number; cwd?: string; cliGenerateOptions?: GenerateOptions; cliBundleOptions?: BundleOptions } = {}) {
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  // Make PORT available to the config file at getConfig
  process.env.PORT = port;

  const { config, srcRoot, configAbsolutePaths, userConfig, error, log } = await getConfig({
    cliGenerateOptions,
    cliBundleOptions,
    cwd,
  });
  const apiRoot = `${config.origin ?? ''}/${config.rootEntry}`;
  const apiDir = path.join(srcRoot, 'app', config.rootEntry);

  if (configAbsolutePaths.length > 1) {
    log.warn(`Multiple config files found. Using the first one: ${configAbsolutePaths[0]}`);
  }

  if (!userConfig && configAbsolutePaths.length > 0) {
    log.error(`Error reading config file at ${configAbsolutePaths[0]}: ${error?.message ?? 'Unknown Error'}`);
  }

  const apiDirAbsolutePath = path.join(cwd, apiDir);
  const segments = await locateSegments({ dir: apiDirAbsolutePath, config, log });

  return {
    cwd,
    port,
    apiRoot,
    apiDir,
    srcRoot,
    config,
    log,
    segments,
  };
}
