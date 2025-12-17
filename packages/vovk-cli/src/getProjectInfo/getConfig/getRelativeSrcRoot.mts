import path from 'node:path';
import { getFileSystemEntryType, FileSystemEntryType } from '../../utils/getFileSystemEntryType.mjs';

export async function getRelativeSrcRoot({ cwd }: { cwd: string }) {
  // Next.js Docs: src/app or src/pages will be ignored if app or pages are present in the root directory.
  if ((await getFileSystemEntryType(path.join(cwd, 'app'))) === FileSystemEntryType.DIRECTORY) {
    return '.';
  } else if ((await getFileSystemEntryType(path.join(cwd, 'src/app'))) === FileSystemEntryType.DIRECTORY) {
    return './src';
  }

  return null;
}
