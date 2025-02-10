import type { VovkSchema } from 'vovk';
import isEmpty from 'lodash/isEmpty.js';

export default function isSchemaEmpty(schema: VovkSchema): boolean {
  return isEmpty(schema.controllers);
}
