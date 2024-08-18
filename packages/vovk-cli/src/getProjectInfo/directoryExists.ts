import fs from 'fs/promises';

export default async function directoryExists(dir: string) {
  try {
    const stats = await fs.stat(dir);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}
