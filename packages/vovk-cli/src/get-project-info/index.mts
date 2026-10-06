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

// a remote spec is fetched once per loaded config, a local file is read again for every generation
const remoteMixins = new WeakMap<ProjectInfo, Map<string, ReturnType<typeof normalizeOpenAPIMixin>>>();

// adds the OpenAPI mixins to the config; only client generation needs them, so the other commands work offline
export async function loadOpenAPIMixins(projectInfo: ProjectInfo): Promise<ProjectInfo> {
  const { config, openAPIMixins, log, cwd } = projectInfo;
  if (!Object.keys(openAPIMixins).length) return projectInfo;

  let remote = remoteMixins.get(projectInfo);
  if (!remote) {
    remote = new Map();
    remoteMixins.set(projectInfo, remote);
  }
  const segments = { ...config.outputConfig.segments };
  await Promise.all(
    Object.entries(openAPIMixins).map(async ([segmentName, mixinModule]) => {
      let openAPIMixin = remote.get(segmentName);
      if (!openAPIMixin) {
        const isRemote = 'url' in mixinModule.source;
        openAPIMixin = normalizeOpenAPIMixin({ mixinModule, log, cwd });
        if (isRemote) {
          remote.set(segmentName, openAPIMixin);
          // the next generation tries a failed fetch again
          openAPIMixin.catch(() => remote.delete(segmentName));
        }
      }
      segments[segmentName] = { ...segments[segmentName], openAPIMixin: await openAPIMixin };
    })
  );

  return { ...projectInfo, config: { ...config, outputConfig: { ...config.outputConfig, segments } } };
}
