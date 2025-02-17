import type { VovkSegmentSchema } from 'vovk';
import isEmpty from 'lodash/isEmpty.js';

export default function isSegmentSchemaEmpty(segmentSchema: VovkSegmentSchema) {
  return isEmpty(segmentSchema.controllers);
}
