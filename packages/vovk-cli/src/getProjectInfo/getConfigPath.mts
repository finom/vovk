import fs from 'fs/promises';
import path from 'path';

export default async function getConfigPath(relativePath = ''): Promise<string | null> {
  const rootDir = path.resolve(process.cwd(), relativePath || '');
  const baseName = 'vovk.config';
  const extensions = ['cjs', 'mjs', 'js'];

  for (const ext of extensions) {
    const filePath = path.join(rootDir, `${baseName}.${ext}`);
    try {
      await fs.stat(filePath);
      return filePath; // Return the path if the file exists
    } catch {
      // Empty
    }
  }

  return null; // Return null if no config file was found
}
