import type { OperationObject } from 'openapi3-ts/oas31';
import { createDecorator, type KnownAny } from 'vovk';
import { fromSchema } from './fromSchema';
import { error } from './error';

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

export const openapi = openapiDecorator as typeof openapiDecorator & {
  error: typeof error;
};

openapi.error = error;

export { fromSchema };
