import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { LogLevelNames } from 'loglevel';
import { getPackageJson } from '../utils/get-package-json.mjs';
import { normalizeOpenAPIMixin } from '../utils/normalize-openapi-mixin.mjs';
import { getConfig } from './get-config/index.mjs';

export type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>;

export async function getProjectInfo(
  {
    port: givenPort,
    cwd = process.cwd(),
    configPath,
    srcRootRequired = true,
    logLevel,
  }: {
    port?: number;
    cwd?: string;
    configPath?: string;
    srcRootRequired?: boolean;
    logLevel?: LogLevelNames;
  } = {
    logLevel: 'info',
  }
) {
  const port = givenPort?.toString() ?? process.env.PORT ?? '3000';

  // Make PORT available to the config file at getConfig
  process.env.PORT = port;

  const { config, srcRoot, configAbsolutePaths, log, openAPIMixins } = await getConfig({
    configPath,
    cwd,
    logLevel,
  });

  const packageJson = await getPackageJson(cwd, log);
  const isNextInstalled = !!packageJson?.dependencies?.next || !!packageJson?.devDependencies?.next;

  if (srcRootRequired && !srcRoot) {
    throw new Error(`Could not find app router directory at ${cwd}. Check Next.js docs for more info.`);
  }

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
    apiDirAbsolutePath,
    srcRoot,
    vovkCliPackage,
    config,
    packageJson,
    isNextInstalled,
    log,
    openAPIMixins,
  };
}

const withOpenAPIMixins = new WeakMap<ProjectInfo, Promise<ProjectInfo>>();

// adds the OpenAPI mixins to the config, fetching a remote spec once per loaded config;
// only client generation needs them, so the other commands work offline
export function loadOpenAPIMixins(projectInfo: ProjectInfo): Promise<ProjectInfo> {
  let loaded = withOpenAPIMixins.get(projectInfo);
  if (!loaded) {
    loaded = normalizeOpenAPIMixins(projectInfo);
    withOpenAPIMixins.set(projectInfo, loaded);
    // the next generation tries a failed fetch again
    loaded.catch(() => withOpenAPIMixins.delete(projectInfo));
  }
  return loaded;
}

async function normalizeOpenAPIMixins(projectInfo: ProjectInfo): Promise<ProjectInfo> {
  const { config, openAPIMixins, log, cwd } = projectInfo;
  if (!Object.keys(openAPIMixins).length) return projectInfo;

  const segments = { ...config.outputConfig.segments };
  await Promise.all(
    Object.entries(openAPIMixins).map(async ([segmentName, mixinModule]) => {
      segments[segmentName] = {
        ...segments[segmentName],
        openAPIMixin: await normalizeOpenAPIMixin({ mixinModule, log, cwd }),
      };
    })
  );

  return { ...projectInfo, config: { ...config, outputConfig: { ...config.outputConfig, segments } } };
}
