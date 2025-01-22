import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Checks if a file exists at the given path.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<boolean>} - A promise that resolves to true if the file exists, false otherwise.
 */
const getFileSystemEntryType = async (filePath: string): Promise<boolean> =>
  !!(await fs.stat(filePath).catch(() => false));

async function postinstall(): Promise<void> {
  const vovk = path.join(import.meta.dirname, '../../.vovk-client');
  const js = path.join(vovk, 'compiled.js');
  const ts = path.join(vovk, 'compiled.d.ts');
  const index = path.join(vovk, 'index.ts');

  if (
    (await getFileSystemEntryType(js)) ||
    (await getFileSystemEntryType(ts)) ||
    (await getFileSystemEntryType(index))
  ) {
    return;
  }

  await fs.mkdir(vovk, { recursive: true });
  await fs.writeFile(js, '/* postinstall */');
  await fs.writeFile(ts, '/* postinstall */');
  await fs.writeFile(index, '/* postinstall */');
}

void postinstall();
