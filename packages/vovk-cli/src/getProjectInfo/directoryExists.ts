import fs from 'fs/promises';
import path from 'path';

export default async function directoryExists(dir: string) {
  try {
    const dirPath = path.join(__dirname, dir);
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}
