import path from 'path';
import fs from 'fs/promises';
import getProjectInfo from '../getProjectInfo/index.mjs';
import fileExists from '../utils/fileExists.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import prettify from '../utils/prettify.mjs';

export default async function newSegment({ segmentName, dryRun }: { segmentName: string; dryRun: boolean }) {
  const { apiDir, cwd, log } = await getProjectInfo();

  const absoluteSegmentRoutePath = path.join(cwd, apiDir, segmentName, '[[...vovk]]/route.ts');

  if (await fileExists(absoluteSegmentRoutePath)) {
    return log.error(
      `Unable to create new segment. ${formatLoggedSegmentName(segmentName, { upperFirst: true })} already exists.`
    );
  }

  const code = await prettify(
    `import { initVovk } from 'vovk';

const controllers = {};
const workers = {};

export type Controllers = typeof controllers;
export type Workers = typeof workers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  emitSchema: true,
  workers,
  controllers,
});
`,
    absoluteSegmentRoutePath
  );

  if (!dryRun) {
    await fs.mkdir(path.dirname(absoluteSegmentRoutePath), { recursive: true });
    await fs.writeFile(absoluteSegmentRoutePath, code);
  }

  log.info(
    `${formatLoggedSegmentName(segmentName, { upperFirst: true })} created at ${absoluteSegmentRoutePath}. Run ${chalkHighlightThing(`vovk new controller ${segmentName}/someName`)} to create a controller or modify the segment file manually`
  );
}
