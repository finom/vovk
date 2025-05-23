import fs from 'node:fs/promises';
import path from 'node:path';
import type { VovkStrictConfig } from 'vovk';
import getFileSystemEntryType from './utils/getFileSystemEntryType.mjs';
import type { ProjectInfo } from './getProjectInfo/index.mjs';

export type Segment = {
  routeFilePath: string;
  segmentName: string;
};

export default async function locateSegments({
  dir,
  rootDir,
  config,
  log,
}: {
  dir: string;
  rootDir?: string;
  config: VovkStrictConfig | null; // config: null is used for testing
  log: ProjectInfo['log'];
}): Promise<Segment[]> {
  let results: Segment[] = [];

  rootDir = rootDir ?? dir;
  let list: string[] = [];

  // Read the contents of the directory
  try {
    list = (await fs.readdir(dir)).sort();
  } catch {
    // do nothing
    return results;
  }

  // Iterate through each item in the directory
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      // Check if the directory name matches the pattern [[...something]]
      if (file.startsWith('[[...') && file.endsWith(']]')) {
        // Check if there's a route.ts file inside this directory
        const routeFilePath = path.join(filePath, 'route.ts');
        if (await getFileSystemEntryType(routeFilePath)) {
          // Calculate the basePath relative to the root directory
          const segmentName = path.relative(rootDir, dir).replace(/\\/g, '/'); // windows fix
          results.push({ routeFilePath, segmentName });
        }
      }

      // Recursively search inside subdirectories
      const subDirResults = await locateSegments({ dir: filePath, rootDir, config, log });
      results = results.concat(subDirResults);
    }
  }

  return results;
}
