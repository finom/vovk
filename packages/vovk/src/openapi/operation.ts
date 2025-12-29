import { createDecorator } from '../core/createDecorator';
import { error } from './error';
import { tool } from './tool';
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

/**
 * OpenAPI operation decorator to add metadata to API operations. Also includes `error` and `tool` utilities.
 * @see https://vovk.dev/openapi
 */
export const operation = Object.assign(operationDecorator, { error, tool });
