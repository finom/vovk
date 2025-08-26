import { vovkSchemaToOpenAPI } from './vovkSchemaToOpenAPI';
import { openAPIToVovkSchema } from './openAPIToVovkSchema/index';
import { error } from './error';
import { createDecorator } from '../utils/createDecorator';
import type { VovkOperationObject } from '../types';

export const operationDecorator = createDecorator(null, (openAPIOperationObject: VovkOperationObject = {}) => {
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

export const operation = Object.assign(operationDecorator, { error });

export { vovkSchemaToOpenAPI, openAPIToVovkSchema };
