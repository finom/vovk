import type { OperationObject } from 'openapi3-ts/oas31';
import { createDecorator } from '../createDecorator';
import { fromSchema } from './fromSchema';

type OperationObjectWithCustomProperties = OperationObject & {
  [key in `${'x' | 'X'}-${string}`]: any;
};

type SimpleJsonSchema = {
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
};

const openapiDecorator = createDecorator(null, (openAPIOperationObject: OperationObjectWithCustomProperties = {}) => {
  return (handlerSchema) => ({
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
      ...(handlerSchema?.validation?.query &&
      'type' in handlerSchema.validation.query &&
      'properties' in handlerSchema.validation.query
        ? {
            parameters: Object.entries((handlerSchema.validation.query as SimpleJsonSchema).properties)
              .filter(([, propSchema]) => propSchema.type === 'string')
              .map(([propName, propSchema]) => ({
                name: propName,
                in: 'query',
                description: propSchema.description || '',
                required: handlerSchema.validation?.query.required ? handlerSchema.validation.query.required.includes(propName) : false,
                schema: {
                  type: 'string',
                },
              })),
          }
        : {}),
      ...openAPIOperationObject,
    },
  });
});

export const openapi = openapiDecorator as typeof openapiDecorator & {
  fromSchema: typeof fromSchema;
};

openapi.fromSchema = fromSchema;
