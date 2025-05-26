import pick from 'lodash/pick.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { VovkStrictConfig } from 'vovk';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';

let cachedPromise: Promise<PackageJson> | undefined;

function getPackageJson(cwd: string, log: ProjectInfo['log']): Promise<PackageJson> {
  const pkgPath = path.join(cwd, 'package.json');

  // If we have a cached promise, return it
  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = fs
    .readFile(pkgPath, 'utf8')
    .then((content) => JSON.parse(content) as PackageJson)
    .catch(() => {
      cachedPromise = undefined;
      log.warn(`Failed to read package.json at ${pkgPath}. Using a fallback.`);
      return {
        name: 'unknown',
      };
    });

  cachedPromise = promise;

  return promise;
}

function mergeTwoPackageJsons(base: PackageJson, additional: PackageJson): PackageJson {
  const merged = { ...base, ...additional };
  // TODO: Add deep merge for all properties
  if (base.scripts || additional.scripts) {
    merged.scripts = { ...base.scripts, ...additional.scripts };
  }
  if (base.dependencies || additional.dependencies) {
    merged.dependencies = { ...base.dependencies, ...additional.dependencies };
  }
  if (base.devDependencies || additional.devDependencies) {
    merged.devDependencies = { ...base.devDependencies, ...additional.devDependencies };
  }
  if (base.peerDependencies || additional.peerDependencies) {
    merged.peerDependencies = { ...base.peerDependencies, ...additional.peerDependencies };
  }
  return merged;
}

export default async function mergePackages({
  cwd,
  packages,
  log,
}: {
  cwd: string;
  config: VovkStrictConfig;
  log: ProjectInfo['log'];
  packages: (PackageJson | undefined)[];
}): Promise<PackageJson> {
  const fullPackageJson = await getPackageJson(cwd, log);
  const defaultPackageJson: PackageJson = {
    main: './index.cjs',
    module: './index.mjs',
    types: './index.d.mts',
    exports: {
      '.': {
        import: './index.mjs',
        require: './index.cjs',
      },
      './schema': {
        import: './schema.cjs',
        require: './schema.cjs',
        types: './schema.d.cts',
      },
    },
  };
  const pickedPackageJson: PackageJson = pick(fullPackageJson, [
    'name',
    'version',
    'description',
    'author',
    'contributors',
    'license',
    'repository',
    'homepage',
    'bugs',
    'keywords',
  ]);

  let result: PackageJson = { ...pickedPackageJson, ...defaultPackageJson };

  for (const pkg of packages) {
    if (pkg) {
      result = mergeTwoPackageJsons(result, pkg);
    }
  }

  return result;
}
