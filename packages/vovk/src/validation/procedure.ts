import type { CombinedSpec } from '../types/validation.js';
import { createStandardValidation } from './create-standard-validation.js';

// each library's option to emit {} (any value) for a type JSON Schema can't describe, such as a Date, where it would
// throw and fail the schema of the whole segment
const libraryOptions: Record<string, Record<string, unknown>> = {
  zod: { unrepresentable: 'any' },
  valibot: { errorMode: 'ignore' },
  arktype: { fallback: (context: { base: unknown }) => context.base },
};

/**
 * Procedure function for defining validation schemas for API procedures.
 * @see https://vovk.dev/procedure
 */
export const procedure = createStandardValidation({
  toJSONSchema: (schema: CombinedSpec, options) =>
    schema['~standard']?.jsonSchema?.input({
      target: options.target ?? 'draft-2020-12',
      libraryOptions: libraryOptions[schema['~standard'].vendor],
    }) ?? {},
});
