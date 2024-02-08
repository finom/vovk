// @ts-check
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck Ignore meta-property error
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {(path: string) => Promise<boolean>} */
const fileExists = async (path) => !!(await fs.stat(path).catch(() => false));

async function postinstall() {
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
