import { vovkSchemaToOpenAPI } from './vovkSchemaToOpenAPI';
import { openAPIToVovkSchema } from './openAPIToVovkSchema/index';
import { error } from './error';
import { createDecorator } from '../utils/createDecorator';
import type { VovkOperationObject } from '../types';
import { tool } from './tool';

export const openapiDecorator = createDecorator(null, (openAPIOperationObject: VovkOperationObject = {}) => {
  return (handlerSchema) => {
    return {
      ...handlerSchema,
      openapi: {
        ...handlerSchema?.openapi,
        ...openAPIOperationObject,
      },
    };
  };
});

export const openapi = Object.assign(openapiDecorator, { error, tool });

export { vovkSchemaToOpenAPI, openAPIToVovkSchema };
