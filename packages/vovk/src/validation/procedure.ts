import { StandardJSONSchemaV1 } from '@standard-schema/spec';
import { createStandardValidation } from './createStandardValidation';

/**
 * Procedure function for defining validation schemas for API procedures.
 * @see https://vovk.dev/procedure
 */
export const procedure = createStandardValidation({
  toJSONSchema: (schema: StandardJSONSchemaV1, options) =>
    schema['~standard']?.jsonSchema?.input({ target: options.target ?? 'draft-2020-12' }) ?? {},
});
