import fs from 'node:fs/promises';
import path from 'node:path';

export default async function getConfigAbsolutePaths({
  cwd,
  relativePath,
}: {
  cwd: string;
  relativePath?: string;
}): Promise<string[]> {
  const rootDir = path.resolve(cwd, relativePath || '');
  const baseName = 'vovk.config';
  const extensions = ['cjs', 'mjs', 'js'];
  const dirs = [path.join(rootDir, '.config'), rootDir];
  const configs = [];

  for (const ext of extensions) {
    for (const dir of dirs) {
      const filePath = path.join(dir, `${baseName}.${ext}`);
      try {
        await fs.stat(filePath);
        configs.push(filePath); // Return the path if the file exists
      } catch {
        // Empty
      }
    }
  }

  return configs;
}
