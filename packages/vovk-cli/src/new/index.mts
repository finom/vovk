import newModule from './newModule.mjs';
import newSegment from './newSegment.mjs';
import type { NewOptions } from '../types.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mts';

export async function newComponents(
  components: string[],
  projectInfo: ProjectInfo,
  { dryRun, dir, templates, overwrite, noSegmentUpdate, empty, static: isStaticSegment }: NewOptions
) {
  if (components[0] === 'segment' || components[0] === 'segments') {
    // vovk new segment [segmentName]
    let segmentNames = components
      .slice(1)
      .map((segmentName) => (segmentName === '""' || segmentName === "''" ? '' : segmentName));

    if (!segmentNames.length) {
      segmentNames = [''];
    }

    for (const segmentName of segmentNames) {
      await newSegment({ projectInfo, segmentName, isStaticSegment, overwrite, dryRun });
    }
  } else {
    // vovk new [what...] [moduleNameWithOptionalSegment]
    if (components.length < 2) {
      throw new Error('Invalid command invocation. Please provide at least two arguments.');
    }
    const what = components.slice(0, -1);
    const moduleNameWithOptionalSegment = components[components.length - 1];

    if (!moduleNameWithOptionalSegment) {
      throw new Error('A module name with an optional segment cannot be empty');
    }

    await newModule({
      projectInfo,
      what,
      moduleNameWithOptionalSegment,
      dir,
      templates,
      overwrite,
      noSegmentUpdate,
      dryRun,
      empty,
    });
  }
}
