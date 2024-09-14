import type { NewOptions } from '../index.mjs';
import newModule from './newModule.mjs';
import newSegment from './newSegment.mjs';

export default async function newComponents(components: string[], options: NewOptions) {
  if (components[0] === 'segment' || components[0] === 'segments') {
    let segmentNames = components.slice(1);

    if (!segmentNames.length) {
      segmentNames = [''];
    }

    for (const segmentName of segmentNames) {
      await newSegment({ segmentName, dryRun: options.dryRun });
    }
  } else {
    if (components.length < 2) {
      throw new Error('Invalid command invocation. Please provide at least two arguments.');
    }
    const what = components.slice(0, -1);
    const moduleNameWithOptionalSegment = components[components.length - 1];

    if (!moduleNameWithOptionalSegment) {
      throw new Error('A module name with an optional segment cannot be empty');
    }
    await newModule({ what, moduleNameWithOptionalSegment, dryRun: options.dryRun });
  }
}
