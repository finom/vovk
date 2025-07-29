import type { OperationObject } from 'openapi3-ts/oas31';
import { vovkSchemaToOpenAPI } from './vovkSchemaToOpenAPI.js';
import { openAPIToVovkSchema } from './openAPIToVovkSchema/index.js';
import { error } from './error.js';
import { createDecorator } from '../utils/createDecorator.js';
import type { KnownAny } from '../types.js';

type OperationObjectWithCustomProperties = OperationObject & {
  [key in `${'x' | 'X'}-${string}`]: KnownAny;
};

export const openapiDecorator = createDecorator(
  null,
  (openAPIOperationObject: OperationObjectWithCustomProperties = {}) => {
    return (handlerSchema) => {
      return {
        ...handlerSchema,
        openapi: {
          ...handlerSchema?.openapi,
          ...openAPIOperationObject,
        },
      };
    };
  }
);

export const openapi = Object.assign(openapiDecorator, { error });

export { vovkSchemaToOpenAPI, openAPIToVovkSchema };
