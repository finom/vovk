import { createDecorator } from '../core/createDecorator.js';
import type { VovkToolOptions } from '../types/tools.js';

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
