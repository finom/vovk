import type { VovkToolOptions } from '../types';
import { createDecorator } from '../utils/createDecorator';

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
