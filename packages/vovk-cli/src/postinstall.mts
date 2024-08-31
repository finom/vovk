import { promises as fs } from 'fs';
import path from 'path';

/**
 * Checks if a file exists at the given path.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<boolean>} - A promise that resolves to true if the file exists, false otherwise.
 */
const fileExists = async (filePath: string): Promise<boolean> => !!(await fs.stat(filePath).catch(() => false));

async function postinstall(): Promise<void> {
  const vovk = path.join(__dirname, '../../.vovk');
  const js = path.join(vovk, 'client.js');
  const ts = path.join(vovk, 'client.d.ts');
  const index = path.join(vovk, 'index.ts');

  if ((await fileExists(js)) || (await fileExists(ts)) || (await fileExists(index))) {
    return;
  }

  await fs.mkdir(vovk, { recursive: true });
  await fs.writeFile(js, '/* postinstall */');
  await fs.writeFile(ts, '/* postinstall */');
  await fs.writeFile(index, '/* postinstall */');
}

void postinstall();
