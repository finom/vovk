import fs from 'fs/promises';

/** @type {(moduleName: string) => Promise<boolean>} */
export default async function fileExists(filePath) {
  try {
    await fs.stat(filePath);
    return true; // The file exists
  } catch (e) {
    return false; // The file does not exist
  }
}
