import type { OperationObject } from 'openapi3-ts/oas31';
import { createDecorator } from 'vovk';
import { sample } from '@stoplight/json-schema-sampler';
import { fromSchema } from './fromSchema';
import type { KnownAny } from 'vovk/src/types';

type OperationObjectWithCustomProperties = OperationObject & {
  [key in `${'x' | 'X'}-${string}`]: KnownAny;
};

type SimpleJsonSchema = {
  type: 'object';
  description?: string;
  properties: Record<string, KnownAny>;
  required?: string[];
};

export const openapi = createDecorator(null, (openAPIOperationObject: OperationObjectWithCustomProperties = {}) => {
  return (handlerSchema, { handlerName, controllerSchema }) => {
    const queryValidation = handlerSchema?.validation?.query as SimpleJsonSchema | undefined;
    const bodyValidation = handlerSchema?.validation?.body as SimpleJsonSchema | undefined;
    const paramsValidation = handlerSchema?.validation?.params as SimpleJsonSchema | undefined;
    const outputValidation = handlerSchema?.validation?.output as SimpleJsonSchema | undefined;
    const queryFake = queryValidation && sample(queryValidation);
    const bodyFake = bodyValidation && sample(bodyValidation);
    const paramsFake = paramsValidation && sample(paramsValidation);
    const outputFake = outputValidation && sample(outputValidation);
    const hasArg = !!queryFake || !!bodyFake || !!paramsFake;

    const codeSample = `import { ${controllerSchema.controllerName} } from 'vovk-client';
    const response = await ${controllerSchema.controllerName}.${handlerName}(${
      hasArg
        ? ` {
      ${queryFake ? `query: ${JSON.stringify(queryFake, null, 2)},` : ''}
      ${bodyFake ? `body: ${JSON.stringify(bodyFake, null, 2)},` : ''}
      ${paramsFake ? `params: ${JSON.stringify(paramsFake, null, 2)},` : ''}
    }`
        : ''
    });
    ${
      outputFake
        ? `
    /* 
    ${JSON.stringify(outputFake, null, 2)}
    */
    console.log(response);
    `
        : ''
    }
  `;

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
              },
            }
          : {}),
        ...(bodyValidation && 'type' in bodyValidation && 'properties' in bodyValidation
          ? {
              requestBody: {
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
        ...((queryParameters || pathParameters
          ? { parameters: [...(queryParameters || []), ...(pathParameters || [])] }
          : {}) as OperationObject['parameters']),
        'x-codeSamples': [{
          label: 'TypeScript',
          lang: 'typescript',
          source: codeSample,
        }],
        ...openAPIOperationObject,
      },
    };
  };
});

export { fromSchema };
