import fs from 'node:fs/promises';
import path from 'node:path';
import getFileSystemEntryType from './utils/getFileSystemEntryType.mjs';


async function postinstall(): Promise<void> {
  // TODO: The function doesn't consider client templates, how to do that?
  const vovk = path.join(import.meta.dirname, '../../.vovk-client');
  const js = path.join(vovk, 'compiled.js');
  const ts = path.join(vovk, 'compiled.d.ts');
  const index = path.join(vovk, 'index.ts');
       
  await fs.mkdir(vovk, { recursive: true });
console.log('vovk', vovk);
  if(!(await getFileSystemEntryType(js))) {
    await fs.writeFile(js, '/* postinstall */');
  }

  if(!(await getFileSystemEntryType(ts))) {
    await fs.writeFile(ts, '/* postinstall */');
  }

  if(!(await getFileSystemEntryType(index))) {
    await fs.writeFile(index, '/* postinstall */');
  }
}

void postinstall();
