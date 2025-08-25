import { VovkToolInfo, type VovkHandlerSchema } from '../types';
import { createDecorator } from '../utils/createDecorator';

export const tool = createDecorator(null, (toolInfo: VovkToolInfo) => {
  return (handlerSchema: VovkHandlerSchema | null) => {
    return {
      ...handlerSchema,
      openapi: {
        ...handlerSchema?.openapi,
        ...Object.fromEntries(Object.entries(toolInfo).map(([key, value]) => ['x-tool-' + key, value])),
      },
    };
  };
});
