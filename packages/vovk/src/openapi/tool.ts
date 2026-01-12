import type { VovkToolOptions } from '../tools/types.js';
import { createDecorator } from '../core/createDecorator.js';

export const tool = createDecorator(null, (toolOptions: VovkToolOptions) => {
  return (handlerSchema) => {
    return {
      ...handlerSchema,
      operationObject: {
        ...handlerSchema?.operationObject,
        'x-tool': toolOptions,
      },
    };
  };
});
