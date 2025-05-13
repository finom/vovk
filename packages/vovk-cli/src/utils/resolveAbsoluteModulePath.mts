import path from 'node:path';
import { createRequire } from 'node:module';

export default function resolveAbsoluteModulePath(modulePath: string, cwd: string) {
  // If it's an absolute path or starts with '.' (relative), resolve it directly
  if (modulePath.startsWith('/') || modulePath.startsWith('.')) {
    return path.resolve(cwd, modulePath);
  }

  // For npm package names, use Node's module resolution algorithm
  try {
    // Create a require function based on the cwd
    // We don't need an actual file, just a path within the directory to create the context
    const require = createRequire(path.join(cwd, 'package.json'));
    return require.resolve(modulePath);
  } catch {
    // If resolution fails, fall back to the original behavior
    return path.resolve(cwd, './node_modules', modulePath);
  }
}
