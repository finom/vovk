import { z } from 'zod/v4';
import { createStandardValidation } from 'vovk';

export const withZod = createStandardValidation({
  toJSONSchema: (model: z.core.$ZodType) => z.toJSONSchema(model),
});
