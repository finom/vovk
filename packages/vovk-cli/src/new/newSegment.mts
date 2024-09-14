import path from 'path';
import fs from 'fs/promises';
import getProjectInfo from '../getProjectInfo/index.mjs';
import fileExists from '../utils/fileExists.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';

export default async function newSegment({ segmentName, dryRun }: { segmentName: string; dryRun: boolean }) {
  const { apiDir, cwd, log } = await getProjectInfo();

  const fullSegmentRoutePath = path.join(cwd, apiDir, segmentName, '[[...vovk]]/route.ts');

  if (await fileExists(fullSegmentRoutePath)) {
    return log.error(`Segment ${segmentName} already exists`);
  }

  const code = `
import { createSegment } from 'vovk';

const controllers = {};
const workers = {};

export type Controllers = typeof controllers;
export type Workers = typeof workers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
    emitSchema: true,
    workers,
    controllers,    
});
`;

  if (!dryRun) {
    await fs.mkdir(path.dirname(fullSegmentRoutePath), { recursive: true });
    await fs.writeFile(fullSegmentRoutePath, code);
  }

  log.info(
    `Segment ${segmentName} created at ${fullSegmentRoutePath}. Run ${chalkHighlightThing(`vovk new controller ${segmentName}/someName`)} to create a controller or modify the segment file manually`
  );
}
