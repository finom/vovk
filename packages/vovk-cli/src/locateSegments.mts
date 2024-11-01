import fs from 'node:fs/promises';
import path from 'node:path';
import getFileSystemEntryType from './utils/getFileSystemEntryType.mjs';

export type Segment = {
  routeFilePath: string;
  segmentName: string;
};

export default async function locateSegments(dir: string, rootDir = dir): Promise<Segment[]> {
  let results: Segment[] = [];

  // Read the contents of the directory
  const list = await fs.readdir(dir);

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
          const segmentName = path.relative(rootDir, dir);
          results.push({ routeFilePath, segmentName });
        }
      }

      // Recursively search inside subdirectories
      const subDirResults = await locateSegments(filePath, rootDir);
      results = results.concat(subDirResults);
    }
  }

  return results;
}
