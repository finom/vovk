import upperFirstLodash from 'lodash/upperFirst.js';
import { chalkHighlightThing } from './chalkHighlightThing.mjs';

export function formatLoggedSegmentName(
  segmentName: string,
  {
    withChalk = true,
    upperFirst = false,
    isStatic = false,
    segmentType = 'segment', // TODO: Apply to all formatLoggedSegmentName invocations
  }: { withChalk?: boolean; upperFirst?: boolean; isStatic?: boolean; segmentType?: 'segment' | 'mixin' } = {}
) {
  let text = segmentName ? `${isStatic ? 'static ' : ''}${segmentType} "${segmentName}"` : 'the root segment';
  text = upperFirst ? upperFirstLodash(text) : text;

  return withChalk ? chalkHighlightThing(text) : text;
}
