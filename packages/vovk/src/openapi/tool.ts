import type { VovkLLMToolOptions } from '../types';
import { createDecorator } from '../utils/createDecorator';

export const tool = createDecorator(null, (toolOptions: VovkLLMToolOptions) => {
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
