import { vovkSchemaToOpenAPI } from './vovkSchemaToOpenAPI';
import { openAPIToVovkSchema } from './openAPIToVovkSchema/index';
import { error } from './error';
import { createDecorator } from '../utils/createDecorator';
import type { VovkOperationObject } from '../types';

export const describeDecorator = createDecorator(null, (openAPIOperationObject: VovkOperationObject = {}) => {
  return (handlerSchema) => {
    return {
      ...handlerSchema,
      operationObject: {
        ...handlerSchema?.operationObject,
        ...openAPIOperationObject,
      },
    };
  };
});

export const describe = Object.assign(describeDecorator, { error });

export { vovkSchemaToOpenAPI, openAPIToVovkSchema };
