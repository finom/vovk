import path from 'node:path';
import fs from 'node:fs/promises';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import getFileSystemEntryType from '../utils/getFileSystemEntryType.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import prettify from '../utils/prettify.mjs';
import chalk from 'chalk';

export default async function newSegment({
  projectInfo,
  segmentName,
  isStaticSegment,
  overwrite,
  dryRun,
}: {
  projectInfo: ProjectInfo;
  segmentName: string;
  isStaticSegment?: boolean;
  overwrite?: boolean;
  dryRun?: boolean;
}) {
  const { apiDirAbsolutePath, log, config } = projectInfo;
  if (!apiDirAbsolutePath) {
    throw new Error('No API directory found. Please ensure you are in a Next.js project.');
  }

  const absoluteSegmentRoutePath = path.join(apiDirAbsolutePath, segmentName, '[[...vovk]]/route.ts');

  if (!overwrite && (await getFileSystemEntryType(absoluteSegmentRoutePath))) {
    log.error(
      `Unable to create new segment. ${formatLoggedSegmentName(segmentName, { upperFirst: true })} already exists. You can use --overwrite flag to overwrite it.`
    );

    return process.exit(1);
  }

  const code = await prettify(
    `import { initSegment${isStaticSegment ? ', generateStaticAPI' : ''} } from 'vovk';

const controllers = {};

export type Controllers = typeof controllers;
${
  isStaticSegment
    ? `
export function generateStaticParams() {
  return generateStaticAPI(controllers);
}
`
    : ''
}
export const { GET${isStaticSegment ? '' : ', POST, PATCH, PUT, HEAD, OPTIONS, DELETE'} } = initSegment({
${segmentName ? `  segmentName: '${segmentName}',\n` : ''}  emitSchema: true,
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
    `${chalk.green('Created')} ${formatLoggedSegmentName(segmentName, { isStatic: isStaticSegment })} at ${absoluteSegmentRoutePath}.`
  );

  const dir = chalk.cyanBright([segmentName, 'thing'].filter(Boolean).join('/'));
  log.info(
    `Run ${chalkHighlightThing(`npx vovk new service controller ${dir}`)} to create a new controller with a service at ./${path.join(config.modulesDir, dir)}/ directory for this segment`
  );
}
