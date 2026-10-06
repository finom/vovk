import { createRequire } from 'node:module';
import path from 'node:path';
import { getPublicModuleNameFromPath } from './get-public-module-name-from-path.mjs';

// the root of the running vovk-cli package, this file sits in dist/utils/
const cliPackageRoot = path.resolve(import.meta.dirname, '../..');

export function getPathUpToModule(moduleName: string, fullPath: string) {
  const idx = fullPath.lastIndexOf(moduleName);
  if (idx === -1) return moduleName;
  return fullPath.slice(0, idx + moduleName.length);
}

export function resolveAbsoluteModulePath(modulePath: string, cwd: string) {
  if (path.isAbsolute(modulePath) || modulePath.startsWith('.')) {
    return path.resolve(cwd, modulePath);
  }

  const { moduleName, restPath } = getPublicModuleNameFromPath(modulePath);

  // the built-in templates match the running CLI, even when the project has another vovk-cli
  if (moduleName === 'vovk-cli') {
    return path.resolve(cliPackageRoot, restPath);
  }

  if (moduleName) {
    // the project first: npx, pnpm and Yarn PnP keep its packages out of the CLI's reach
    for (const resolveFrom of [path.join(cwd, 'package.json'), import.meta.url]) {
      try {
        const resolved = createRequire(resolveFrom).resolve(moduleName);
        return path.resolve(getPathUpToModule(moduleName, path.dirname(resolved)), restPath);
      } catch {
        // not resolvable from there
      }
    }
  }

  return path.resolve(cwd, './node_modules', modulePath);
}
