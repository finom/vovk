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
}: {
  packageNames: string[];
  packageJson: PackageJson;
  channel: InitOptions['channel'];
  key: 'dependencies' | 'devDependencies';
}) {
  return Promise.all(
    packageNames.map(async (packageName) => {
      const metadata = await getNPMPackageMetadata(packageName);
      const isVovk = packageName.startsWith('vovk');

      const latestVersion = metadata['dist-tags'][isVovk ? (channel ?? 'latest') : 'latest'];
      if (!packageJson[key]) {
        packageJson[key] = {};
      }
      packageJson[key][packageName] = `^${latestVersion}`;
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
  await updateDeps({ packageJson, packageNames: dependencyNames, channel, key: 'dependencies' });
  await updateDeps({ packageJson, packageNames: devDependencyNames, channel, key: 'devDependencies' });
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  log.info('Added dependencies to package.json:' + dependencyNames.join(', '));
  for (const dependency of dependencyNames) {
    log.raw.log(` - ${chalk.cyan(dependency)}`);
  }
  log.info('Added devDependencies to package.json:' + devDependencyNames.join(', '));
  for (const dependency of devDependencyNames) {
    log.raw.log(` - ${chalk.cyan(dependency)}`);
  }
}
