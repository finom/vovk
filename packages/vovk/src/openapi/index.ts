import type { OperationObject } from 'openapi3-ts/oas31';
import { vovkSchemaToOpenAPI } from './vovkSchemaToOpenAPI';
import { openAPIToVovkSchema } from './openAPIToVovkSchema/index';
import { error } from './error';
import { createDecorator } from '../utils/createDecorator';
import type { KnownAny } from '../types';

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
