import pick from 'lodash/pick.js';
import type { PackageJson } from 'type-fest';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';

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
  rootPackageJson,
  packages,
}: {
  rootPackageJson: PackageJson;
  packages: (PackageJson | undefined)[];
  log: ProjectInfo['log'];
}): Promise<PackageJson> {
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
  const pickedPackageJson: PackageJson = pick(rootPackageJson, [
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
