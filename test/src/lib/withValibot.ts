import { createStandardValidation, KnownAny } from 'vovk';
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const withValibot = createStandardValidation({
  toJSONSchema: (model: v.BaseSchema<KnownAny, KnownAny, KnownAny>) => toJsonSchema(model),
});

export default withValibot;
