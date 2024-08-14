import { promises as fs } from 'fs';
import * as path from 'path';
import fileExists from './getProjectInfo/fileExists'; // TODO move to lib
import type { VovkMetadata } from 'vovk';

export type Segment = {
  routeFilePath: string;
  segmentName: string;
  metadata?: VovkMetadata;
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
        if (await fileExists(routeFilePath)) {
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
