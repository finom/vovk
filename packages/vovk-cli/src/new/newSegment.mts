import path from 'node:path';
import fs from 'node:fs/promises';
import getProjectInfo from '../getProjectInfo/index.mjs';
import getFileSystemEntryType from '../utils/getFileSystemEntryType.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import prettify from '../utils/prettify.mjs';

export default async function newSegment({
  segmentName,
  overwrite,
  dryRun,
}: {
  segmentName: string;
  overwrite?: boolean;
  dryRun?: boolean;
}) {
  const { apiDir, cwd, log } = await getProjectInfo();

  const absoluteSegmentRoutePath = path.join(cwd, apiDir, segmentName, '[[...vovk]]/route.ts');

  if (!overwrite && (await getFileSystemEntryType(absoluteSegmentRoutePath))) {
    throw new Error(
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
${segmentName ? `  segmentName: '${segmentName}',\n` : ''}  emitSchema: true,
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
    `${formatLoggedSegmentName(segmentName, { upperFirst: true })} created at ${absoluteSegmentRoutePath}. Run ${chalkHighlightThing(`vovk new controller ${[segmentName, 'someName'].filter(Boolean).join('/')}`)} to create a new controller`
  );
}
