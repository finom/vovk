import path from 'node:path';
import * as chokidar from 'chokidar';
import { toPosixPath } from './to-import-path.mjs';

// chokidar stops reporting a watched folder once it is removed, even when it comes back,
// so the parent is watched with only the folder let through
export function watchFolder(folderPath: string, options: chokidar.ChokidarOptions) {
  const parentPath = path.dirname(folderPath);
  const parent = toPosixPath(parentPath);
  const folder = toPosixPath(folderPath);

  return chokidar.watch(parentPath, {
    ...options,
    ignored: (filePath: string) => {
      const entry = toPosixPath(filePath);
      return entry !== parent && entry !== folder && !entry.startsWith(`${folder}/`);
    },
  });
}
