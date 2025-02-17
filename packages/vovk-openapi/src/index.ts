import type { OperationObject } from 'openapi3-ts/oas31';
import { createDecorator, type KnownAny } from 'vovk';
import { fromSchema } from './fromSchema';
import { error } from './error';

type OperationObjectWithCustomProperties = OperationObject & {
  [key in `${'x' | 'X'}-${string}`]: KnownAny;
};

type SimpleJsonSchema = {
  type: 'object';
  description?: string;
  properties: Record<string, KnownAny>;
  required?: string[];
};

export const openapiDecorator = createDecorator(
  null,
  (openAPIOperationObject: OperationObjectWithCustomProperties = {}) => {
    return (handlerSchema) => {
      const queryValidation = handlerSchema?.validation?.query as SimpleJsonSchema | undefined;
      const bodyValidation = handlerSchema?.validation?.body as SimpleJsonSchema | undefined;
      const paramsValidation = handlerSchema?.validation?.params as SimpleJsonSchema | undefined;
      const outputValidation = handlerSchema?.validation?.output as SimpleJsonSchema | undefined;

      const queryParameters =
        queryValidation && 'type' in queryValidation && 'properties' in queryValidation
          ? Object.entries(queryValidation.properties).map(([propName, propSchema]) => ({
              name: propName,
              in: 'query',
              required: queryValidation.required ? queryValidation.required.includes(propName) : false,
              schema: propSchema,
            }))
          : null;

      const pathParameters =
        paramsValidation && 'type' in paramsValidation && 'properties' in paramsValidation
          ? Object.entries(paramsValidation.properties).map(([propName, propSchema]) => ({
              name: propName,
              in: 'path',
              required: paramsValidation.required ? paramsValidation.required.includes(propName) : false,
              schema: propSchema,
            }))
          : null;
      return {
        ...handlerSchema,
        openapi: {
          ...handlerSchema?.openapi,
          ...openAPIOperationObject,
          ...((queryParameters || pathParameters
            ? {
                parameters: openAPIOperationObject.parameters ?? [
                  ...(queryParameters || []),
                  ...(pathParameters || []),
                ],
              }
            : {}) as OperationObject['parameters']),
          ...(outputValidation && 'type' in outputValidation && 'properties' in outputValidation
            ? {
                responses: {
                  200: {
                    description: 'description' in outputValidation ? outputValidation.description : 'Success',
                    content: {
                      'application/json': {
                        schema: outputValidation,
                      },
                    },
                  },
                  ...handlerSchema?.openapi?.responses,
                  ...openAPIOperationObject.responses,
                },
              }
            : {}),
          ...(bodyValidation && 'type' in bodyValidation && 'properties' in bodyValidation
            ? {
                requestBody: openAPIOperationObject.requestBody ?? {
                  description: 'description' in bodyValidation ? bodyValidation.description : 'Request body',
                  required: true,
                  content: {
                    'application/json': {
                      schema: bodyValidation,
                    },
                  },
                },
              }
            : {}),
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
