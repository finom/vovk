import { StandardJSONSchemaV1 } from '@standard-schema/spec';
import { createStandardValidation } from './createStandardValidation';

export const procedure = createStandardValidation({
  toJSONSchema: (schema: StandardJSONSchemaV1, options) =>
    schema['~standard']?.jsonSchema?.input({ target: options.target ?? 'draft-2020-12' }) ?? {},
});
