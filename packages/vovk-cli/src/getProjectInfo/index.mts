import path from 'node:path';
import getConfig from './getConfig/index.mjs';
import { getPackageJson } from '../utils/getPackageJson.mjs';
import { readFile } from 'node:fs/promises';
import { LogLevelNames } from 'loglevel';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

export default async function getProjectInfo(
  {
    port: givenPort,
    cwd = process.cwd(),
    configPath,
    srcRootRequired = true,
    logLevel,
  }: { port?: number; cwd?: string; configPath?: string; srcRootRequired?: boolean; logLevel?: LogLevelNames } = {
    logLevel: 'info',
  }
) {
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  // Make PORT available to the config file at getConfig
  process.env.PORT = port;

  const { config, srcRoot, configAbsolutePaths, log } = await getConfig({
    configPath,
    cwd,
    logLevel,
  });

  const packageJson = await getPackageJson(cwd, log);
  const isNextInstalled = !!packageJson?.dependencies?.next || !!packageJson?.devDependencies?.next;

  if (srcRootRequired && !srcRoot) {
    throw new Error(`Could not find app router directory at ${cwd}. Check Next.js docs for more info.`);
  }

  const apiRoot = `${config.origin ?? ''}/${config.rootEntry}`;
  const apiDirAbsolutePath = srcRoot ? path.resolve(cwd, srcRoot, 'app', config.rootEntry) : null;

  if (configAbsolutePaths.length > 1) {
    log.warn(`Multiple config files found. Using the first one: ${configAbsolutePaths[0]}`);
  }

  const vovkCliPackage = JSON.parse(await readFile(path.join(import.meta.dirname, '../../package.json'), 'utf-8')) as {
    version: string;
  };

  return {
    cwd,
    port,
    apiRoot,
    apiDirAbsolutePath,
    srcRoot,
    vovkCliPackage,
    config,
    packageJson,
    isNextInstalled,
    log,
  };
}
