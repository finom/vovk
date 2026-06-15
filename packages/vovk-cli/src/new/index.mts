import type { ProjectInfo } from '../get-project-info/index.mts';
import type { NewOptions } from '../types.mjs';
import { newModule } from './new-module.mjs';
import { newSegment } from './new-segment.mjs';

export async function newComponents(
  components: string[],
  projectInfo: ProjectInfo,
  { dryRun, outDir, templates, overwrite, noSegmentUpdate, empty, static: isStaticSegment }: NewOptions
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
      outDir,
      templates,
      overwrite,
      noSegmentUpdate,
      dryRun,
      empty,
    });
  }
}
