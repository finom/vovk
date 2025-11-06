import fs from 'node:fs/promises';
import path from 'node:path';
import { PackageJson } from 'type-fest';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import chalkHighlightThing from './chalkHighlightThing.mjs';

let cachedPromise: Promise<PackageJson> | undefined;

export function getPackageJson(cwd: string, log: ProjectInfo['log']): Promise<PackageJson> {
  const pkgPath = path.join(cwd, 'package.json');

  // If we have a cached promise, return it
  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = fs
    .readFile(pkgPath, 'utf8')
    .then((content) => JSON.parse(content) as PackageJson)
    .catch(() => {
      cachedPromise = undefined;
      log.warn(`Unable to load package.json at ${chalkHighlightThing(pkgPath)}. Using an empty fallback.`);
      return {
        name: 'unknown',
      };
    });

  cachedPromise = promise;

  return promise;
}
