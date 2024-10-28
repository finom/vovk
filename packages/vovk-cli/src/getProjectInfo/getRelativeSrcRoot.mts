import path from 'path';
import getFileSystemEntryType, { FileSystemEntryType } from '../utils/getFileSystemEntryType.mjs';

export default async function getRelativeSrcRoot({ cwd }: { cwd: string }) {
  // Next.js Docs: src/app or src/pages will be ignored if app or pages are present in the root directory.
  if ((await getFileSystemEntryType(path.join(cwd, 'app'))) === FileSystemEntryType.DIRECTORY) {
    return '.';
  } else if ((await getFileSystemEntryType(path.join(cwd, 'src/app'))) === FileSystemEntryType.DIRECTORY) {
    return './src';
  }

  throw new Error(`${cwd} Could not find app router directory. Check Next.js docs for more info.`);
}
