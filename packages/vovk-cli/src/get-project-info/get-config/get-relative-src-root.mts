import path from 'node:path';
import { FileSystemEntryType, getFileSystemEntryType } from '../../utils/get-file-system-entry-type.mjs';

export async function getRelativeSrcRoot({ cwd }: { cwd: string }) {
  // Next.js ignores src/app when the root has an app folder
  if ((await getFileSystemEntryType(path.join(cwd, 'app'))) === FileSystemEntryType.DIRECTORY) {
    return '.';
  } else if ((await getFileSystemEntryType(path.join(cwd, 'src/app'))) === FileSystemEntryType.DIRECTORY) {
    return './src';
  }

  return null;
}
