import { createStandardValidation } from 'vovk';
import { type } from 'arktype';

const withArk = createStandardValidation({
  toJSONSchema: (model: type) => model.toJsonSchema(),
});

export default withArk;
