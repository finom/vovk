import path from 'node:path';

export default function resolveAbsoluteModulePath(modulePath: string, cwd: string) {
  return modulePath.startsWith('/') || modulePath.startsWith('.')
    ? path.resolve(cwd, modulePath)
    : path.resolve(cwd, './node_modules', modulePath);
}
