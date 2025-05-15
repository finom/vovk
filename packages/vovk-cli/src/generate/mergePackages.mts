import pick from 'lodash/pick.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { VovkStrictConfig } from 'vovk';

let cachedPromise: Promise<PackageJson> | undefined;

function getPackageJson(cwd: string): Promise<PackageJson> {
  const pkgPath = path.join(cwd, 'package.json'); // Hard-coded path

  // If we have a cached promise, return it
  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = fs
    .readFile(pkgPath, 'utf8')
    .then((content) => JSON.parse(content) as PackageJson)
    .catch((error) => {
      // Clear cache on error to allow retry
      cachedPromise = undefined;
      throw error;
    });

  cachedPromise = promise;

  return promise;
}

function mergeTwoPackageJsons(base: PackageJson, additional: PackageJson): PackageJson {
  const merged = { ...base, ...additional };
  // TODO: Add deep merge for all properties
  merged.dependencies = { ...base.dependencies, ...additional.dependencies };
  return merged;
}

export default async function mergePackages({
  cwd,
  packages,
}: {
  cwd: string;
  config: VovkStrictConfig;
  packages: (PackageJson | undefined)[];
}): Promise<PackageJson> {
  const fullPackageJson = await getPackageJson(cwd);
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

  return {
    ...result,
    dependencies: {
      ...result.dependencies,
    },
  } as PackageJson;
}
