import chalkHighlightThing from './chalkHighlightThing.mjs';

export default function formatLoggedSegmentName(segmentName: string, withChalk = false) {
  const text = segmentName ? `segment "${segmentName}"` : 'the root segment';

  return withChalk ? chalkHighlightThing(text) : text;
}
