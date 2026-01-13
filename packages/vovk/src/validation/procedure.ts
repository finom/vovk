import { createStandardValidation } from './createStandardValidation.js';
import type { CombinedSpec } from '../types/validation.js';

/**
 * Procedure function for defining validation schemas for API procedures.
 * @see https://vovk.dev/procedure
 */
export const procedure = createStandardValidation({
  toJSONSchema: (schema: CombinedSpec, options) =>
    schema['~standard']?.jsonSchema?.input({ target: options.target ?? 'draft-2020-12' }) ?? {},
});
