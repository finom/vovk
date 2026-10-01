import fs from 'node:fs/promises';
import path from 'node:path';

// relative to the project root, in lookup order: the first one that exists is used
export const CONFIG_FILE_PATHS = ['cjs', 'mjs', 'js'].flatMap((ext) => [
  path.join('.config', `vovk.config.${ext}`),
  `vovk.config.${ext}`,
]);

export async function getConfigAbsolutePaths({
  cwd,
  configPath,
  relativePath,
}: {
  cwd: string;
  configPath?: string;
  relativePath?: string;
}): Promise<string[]> {
  if (configPath) {
    return [path.resolve(cwd, configPath)];
  }
  const rootDir = path.resolve(cwd, relativePath || '');
  const configs = [];

  for (const configFilePath of CONFIG_FILE_PATHS) {
    const filePath = path.join(rootDir, configFilePath);
    try {
      await fs.stat(filePath);
      configs.push(filePath);
    } catch {
      // Empty
    }
  }

  return configs;
}
