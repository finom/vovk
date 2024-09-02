import isEmpty from 'lodash/isEmpty.js';
import type { VovkSchema } from 'vovk';

export default function isSchemaEmpty(schema: VovkSchema): boolean {
  return isEmpty(schema.controllers) && isEmpty(schema.workers);
}
