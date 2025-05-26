import path from 'node:path';
import { createRequire } from 'node:module';
import getPublicModuleNameFromPath from './getPublicModuleNameFromPath.mjs';

// Returns the path up to and including the last occurrence of the given module name
export function getPathUpToModule(moduleName: string, fullPath: string) {
  const idx = fullPath.lastIndexOf(moduleName);
  if (idx === -1) return moduleName;
  return fullPath.slice(0, idx + moduleName.length);
}

export default function resolveAbsoluteModulePath(modulePath: string, cwd: string) {
  // If it's an absolute path or starts with '.' (relative), resolve it directly
  if (modulePath.startsWith('/') || modulePath.startsWith('.')) {
    return path.resolve(cwd, modulePath);
  }

  // For npm package names, use Node's module resolution algorithm
  try {
    const { moduleName, restPath } = getPublicModuleNameFromPath(modulePath);

    if (!moduleName) {
      throw new Error(`Invalid module path: ${modulePath}`);
    }

    const require = createRequire(import.meta.url);
    const resolved = require.resolve(moduleName);

    return path.resolve(getPathUpToModule(moduleName, path.dirname(resolved)), restPath);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Error resolving module path: ${modulePath}`, e);
    // If resolution fails, fall back to the original behavior
    return path.resolve(cwd, './node_modules', modulePath);
  }
}
