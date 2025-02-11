import type { OperationObject } from 'openapi3-ts/oas31';
import { createDecorator } from '../createDecorator';
import { fromSchema } from './fromSchema';
import type { KnownAny } from '../types';

type OperationObjectWithCustomProperties = OperationObject & {
  [key in `${'x' | 'X'}-${string}`]: KnownAny;
};

type SimpleJsonSchema = {
  type: 'object';
  properties: Record<string, KnownAny>;
  required?: string[];
};

const openapiDecorator = createDecorator(null, (openAPIOperationObject: OperationObjectWithCustomProperties = {}) => {
  return (handlerSchema) => {
    const queryParameters =
      handlerSchema?.validation?.query &&
      'type' in handlerSchema.validation.query &&
      'properties' in handlerSchema.validation.query
        ? Object.entries((handlerSchema.validation.query as SimpleJsonSchema).properties).map(
            ([propName, propSchema]) => ({
              name: propName,
              in: 'query',
              description: propSchema.description || '',
              required: handlerSchema.validation?.query.required
                ? handlerSchema.validation.query.required.includes(propName)
                : false,
              schema: {
                type: 'string',
              },
            })
          )
        : null;

    const pathParameters =
      handlerSchema?.validation?.params &&
      'type' in handlerSchema.validation.params &&
      'properties' in handlerSchema.validation.params
        ? Object.entries((handlerSchema.validation.params as SimpleJsonSchema).properties).map(
            ([propName, propSchema]) => ({
              name: propName,
              in: 'path',
              description: propSchema.description || '',
              required: handlerSchema.validation?.params.required
                ? handlerSchema.validation.params.required.includes(propName)
                : false,
              schema: {
                type: 'string',
              },
            })
          )
        : null;
    return {
      ...handlerSchema,
      openapi: {
        ...handlerSchema?.openapi,
        ...(handlerSchema?.validation?.output &&
        'type' in handlerSchema.validation.output &&
        'properties' in handlerSchema.validation.output
          ? {
              responses: {
                200: {
                  description:
                    'description' in handlerSchema.validation.output
                      ? handlerSchema.validation.output.description
                      : 'Success',
                  content: {
                    'application/json': {
                      schema: handlerSchema.validation.output,
                    },
                  },
                },
              },
            }
          : {}),
        ...(handlerSchema?.validation?.body &&
        'type' in handlerSchema.validation.body &&
        'properties' in handlerSchema.validation.body
          ? {
              requestBody: {
                description:
                  'description' in handlerSchema.validation.body
                    ? handlerSchema.validation.body.description
                    : 'Request body',
                required: true,
                content: {
                  'application/json': {
                    schema: handlerSchema.validation.body,
                  },
                },
              },
            }
          : {}),
        ...((queryParameters || pathParameters
          ? { parameters: [...(queryParameters || []), ...(pathParameters || [])] }
          : {}) as OperationObject['parameters']),
        ...openAPIOperationObject,
      },
    };
  };
});

export const openapi = openapiDecorator as typeof openapiDecorator & {
  fromSchema: typeof fromSchema;
};

openapi.fromSchema = fromSchema;
