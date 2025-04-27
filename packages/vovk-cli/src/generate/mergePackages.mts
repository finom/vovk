import pick from 'lodash/pick.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { VovkStrictConfig } from 'vovk';

let cachedPromise: Promise<PackageJson> | undefined;

const getDependenciesFromImports = (imports: VovkStrictConfig['imports']) => {
  const getDependency = (importName: string) => {
    const importParts = importName.split('/');
    const importPath = importParts[0];
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return importPath;
    }
    return null;
  };
  const dependencies = new Set<string>();
  for (const imp of Object.values(imports)) {
    for (const importName of imp ?? []) {
      const dependency = getDependency(importName);
      if (dependency) {
        dependencies.add(dependency);
      }
    }
  }
  return Array.from(dependencies);
};

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
  merged.dependencies = { ...base.dependencies, ...additional.dependencies };
  return merged;
}

export default async function mergePackages({
  cwd,
  config,
  packages,
}: {
  cwd: string;
  config: VovkStrictConfig;
  packages: (PackageJson | undefined)[];
}): Promise<PackageJson> {
  const fullPackageJson = await getPackageJson(cwd);
  const pickedPackageJson = pick(fullPackageJson, [
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

  let result: PackageJson = { ...pickedPackageJson };

  for (const pkg of packages) {
    if (pkg) {
      result = mergeTwoPackageJsons(result, pkg);
    }
  }

  return {
    ...result,
    dependencies: {
      ...result.dependencies,
      ...Object.fromEntries(
        getDependenciesFromImports(config.imports).map((dep) => [dep, fullPackageJson.dependencies?.[dep] ?? 'latest'])
      ),
    },
  } as PackageJson;
}
