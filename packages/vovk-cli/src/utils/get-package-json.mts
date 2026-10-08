import fs from 'node:fs/promises';
import path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import { chalkHighlightThing } from './chalk-highlight-thing.mjs';

export async function getPackageJson(cwd: string, log: ProjectInfo['log']): Promise<PackageJson> {
  const pkgPath = path.join(cwd, 'package.json');

  try {
    return JSON.parse(await fs.readFile(pkgPath, 'utf8')) as PackageJson;
  } catch {
    log.warn(`Unable to load package.json at ${chalkHighlightThing(pkgPath)}. Using an empty fallback.`);
    return {
      name: 'unknown',
    };
  }
}
