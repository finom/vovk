import fs from 'fs/promises';
import path from 'path';

export default async function getConfigPaths(relativePath = ''): Promise<string[]> {
  const rootDir = path.resolve(process.cwd(), relativePath || '');
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
