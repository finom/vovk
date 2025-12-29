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

export const operation = Object.assign(operationDecorator, { error, tool });
