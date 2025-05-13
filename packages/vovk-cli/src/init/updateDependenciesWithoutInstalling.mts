import fs from 'node:fs/promises';
import path from 'node:path';
import { PackageJson } from 'type-fest';
import chalk from 'chalk';
import type getLogger from '../utils/getLogger.mjs';
import getNPMPackageMetadata from '../utils/getNPMPackageMetadata.mjs';
import { InitOptions } from '../types.mjs';

async function updateDeps({
  packageJson,
  packageNames,
  channel,
  key,
  log,
}: {
  packageNames: string[];
  packageJson: PackageJson;
  channel: InitOptions['channel'];
  key: 'dependencies' | 'devDependencies';
  log: ReturnType<typeof getLogger>;
}) {
  return Promise.all(
    packageNames.map(async (packageName) => {
      let name: string;
      let version: string | undefined;

      if (packageName.startsWith('@')) {
        // Handle scoped packages (@org/name@version)
        const lastAtIndex = packageName.lastIndexOf('@');
        if (lastAtIndex > 0) {
          name = packageName.substring(0, lastAtIndex);
          version = packageName.substring(lastAtIndex + 1);
        } else {
          name = packageName;
          version = undefined;
        }
      } else {
        // Handle regular packages (name@version)
        const parts = packageName.split('@');
        name = parts[0];
        version = parts[1];
      }

      if (version) {
        packageJson[key] ??= {};
        packageJson[key][name] = version;
        return;
      }
      let metadata;

      try {
        metadata = await getNPMPackageMetadata(name);
      } catch (error) {
        log.error(`Failed to fetch metadata for package ${name}@${channel ?? 'latest'}: ${error}`);
        return;
      }
      const isVovk = name.startsWith('vovk') && name !== 'dto-mapped-types';

      const latestVersion = metadata['dist-tags'][isVovk ? (channel ?? 'latest') : 'latest'];
      packageJson[key] ??= {};
      packageJson[key][name] = `^${latestVersion}`;
    })
  );
}

export default async function updateDependenciesWithoutInstalling({
  log,
  dir,
  dependencyNames,
  devDependencyNames,
  channel,
}: {
  log: ReturnType<typeof getLogger>;
  dir: string;
  dependencyNames: string[];
  devDependencyNames: string[];
  channel: InitOptions['channel'];
}) {
  const packageJsonPath = path.join(dir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8')) as PackageJson;
  await updateDeps({ packageJson, packageNames: dependencyNames, channel, log, key: 'dependencies' });
  await updateDeps({ packageJson, packageNames: devDependencyNames, channel, log, key: 'devDependencies' });
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  log.info('Added dependencies to package.json:');
  for (const dependency of dependencyNames) {
    log.raw.info(` - ${chalk.cyan(dependency)}`);
  }
  log.info('Added devDependencies to package.json:');
  for (const dependency of devDependencyNames) {
    log.raw.info(` - ${chalk.cyan(dependency)}`);
  }
}
