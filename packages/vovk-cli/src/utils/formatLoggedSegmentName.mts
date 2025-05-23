import upperFirstLodash from 'lodash/upperFirst.js';
import chalkHighlightThing from './chalkHighlightThing.mjs';

export default function formatLoggedSegmentName(
  segmentName: string,
  {
    withChalk = true,
    upperFirst = false,
    isStatic = false,
  }: { withChalk?: boolean; upperFirst?: boolean; isStatic?: boolean } = {}
) {
  let text = segmentName ? `${isStatic ? 'static ' : ''}segment "${segmentName}"` : 'the root segment';
  text = upperFirst ? upperFirstLodash(text) : text;

  return withChalk ? chalkHighlightThing(text) : text;
}
