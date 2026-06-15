import { createDecorator } from '../core/create-decorator.js';
import type { VovkOperationObject } from '../types/operation.js';
import { error } from './error.js';
import { tool } from './tool.js';

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
