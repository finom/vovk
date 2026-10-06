import fs from 'node:fs/promises';
import path from 'node:path';
import type { VovkStrictConfig } from 'vovk/internal';
import { assertSegmentName } from '../dev/write-one-segment-schema-file.mjs';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import { getFileSystemEntryType } from './get-file-system-entry-type.mjs';

export type Segment = {
  routeFilePath: string;
  segmentName: string;
};

export async function locateSegments({
  dir,
  rootDir,
  config,
  log,
}: {
  dir: string | null;
  rootDir?: string;
  config: VovkStrictConfig | null; // null in tests
  log: ProjectInfo['log'];
}): Promise<Segment[]> {
  let results: Segment[] = [];

  if (!dir) return results; // not a Next.js app

  rootDir = rootDir ?? dir;
  let list: string[];

  try {
    list = (await fs.readdir(dir)).toSorted();
  } catch {
    return results;
  }

  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      if (file.startsWith('[[...') && file.endsWith(']]')) {
        const routeFilePath = path.join(filePath, 'route.ts');
        if (await getFileSystemEntryType(routeFilePath)) {
          const segmentName = path.relative(rootDir, dir).replace(/\\/g, '/'); // windows fix
          assertSegmentName(segmentName, dir);
          results.push({ routeFilePath, segmentName });
        }
      }

      const subDirResults = await locateSegments({ dir: filePath, rootDir, config, log });
      results = results.concat(subDirResults);
    }
  }

  return results;
}
