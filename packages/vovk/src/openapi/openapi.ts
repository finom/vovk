import type { OperationObject } from 'openapi3-ts/oas31';
import { createDecorator } from '../createDecorator';
import { fromSchema } from './fromSchema';

type OperationObjectWithCustomProperties = OperationObject & {
  [key in `${'x' | 'X'}-${string}`]: any;
}

const openapiDecorator = createDecorator(null, (openAPIOperationObject: OperationObjectWithCustomProperties = {}) => {
  return (handlerSchema) => ({
    ...handlerSchema,
    openapi: {
      ...handlerSchema?.openapi,
      ...openAPIOperationObject,
    },
  });
});

export const openapi = openapiDecorator as typeof openapiDecorator & {
  fromSchema: typeof fromSchema;
};

openapi.fromSchema = fromSchema;
