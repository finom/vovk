import fs from 'fs/promises';
import getLogger from '../utils/getLogger.mjs';
import getNPMPackageMetadata from '../utils/getNPMPackageMetadata.mjs';
import { PackageJson } from 'type-fest';
import path from 'path';

async function updateDeps({
  packageJson,
  packageNames,
  channel,
  key,
}: {
  packageNames: string[];
  packageJson: PackageJson;
  channel: 'latest' | 'beta' | 'dev';
  key: 'dependencies' | 'devDependencies';
}) {
  return Promise.all(
    packageNames.map(async (packageName) => {
      if (packageJson[key]?.[packageName]) return; // Skip if already present
      const metadata = await getNPMPackageMetadata(packageName);
      const isVovk = packageName.startsWith('vovk');

      const latestVersion = metadata['dist-tags'][isVovk ? channel : 'latest'];
      if (!packageJson[key]) {
        packageJson[key] = {};
      }
      console.log(packageName, latestVersion);
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
  channel: 'latest' | 'beta' | 'dev';
}) {
  const packageJsonPath = path.join(dir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8')) as PackageJson;
  await updateDeps({ packageJson, packageNames: dependencyNames, channel, key: 'dependencies' });
  log.debug('Updated dependencies in package.json');
  await updateDeps({ packageJson, packageNames: devDependencyNames, channel, key: 'devDependencies' });
  log.debug('Updated devDependencies in package.json');
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
