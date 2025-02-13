import type { OperationObject } from 'openapi3-ts/oas31';
import { createDecorator } from 'vovk';
import { sample } from '@stoplight/json-schema-sampler';
import { fromSchema } from './fromSchema';
import type { KnownAny } from 'vovk/src/types';
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

const stringifySample = (data: KnownAny, pad = 4) =>
  JSON.stringify(data, null, 2)
    .replace(/"([A-Za-z_$][0-9A-Za-z_$]*)":/g, '$1:')
    .split('\n')
    .map((line, i, a) => (i === 0 ? line : i === a.length - 1 ? ' '.repeat(pad) + line : ' '.repeat(pad + 2) + line))
    .join('\n');

export const openapiDecorator = createDecorator(
  null,
  (openAPIOperationObject: OperationObjectWithCustomProperties = {}) => {
    return (handlerSchema, { handlerName }) => {
      const queryValidation = handlerSchema?.validation?.query as SimpleJsonSchema | undefined;
      const bodyValidation = handlerSchema?.validation?.body as SimpleJsonSchema | undefined;
      const paramsValidation = handlerSchema?.validation?.params as SimpleJsonSchema | undefined;
      const outputValidation = handlerSchema?.validation?.output as SimpleJsonSchema | undefined;
      const queryFake = queryValidation && sample(queryValidation);
      const bodyFake = bodyValidation && sample(bodyValidation);
      const paramsFake = paramsValidation && sample(paramsValidation);
      const outputFake = outputValidation && sample(outputValidation);
      const hasArg = !!queryFake || !!bodyFake || !!paramsFake;
      const codeSample = `import { MyRPC } from 'vovk-client';

const response = await MyRPC.${handlerName}(${
        hasArg
          ? `{
${paramsFake ? `    params: ${stringifySample(paramsFake)},\n` : ''}${bodyFake ? `    body: ${stringifySample(bodyFake)},\n` : ''}${queryFake ? `    query: ${stringifySample(queryFake)},\n` : ''}}`
          : ''
      });
    ${
      outputFake
        ? `
console.log(response);
/* 
${stringifySample(outputFake, 0)}
*/
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
          ...openAPIOperationObject,
          ...((queryParameters || pathParameters
            ? {
                parameters: openAPIOperationObject.parameters ?? [
                  ...(queryParameters || []),
                  ...(pathParameters || []),
                ],
              }
            : {}) as OperationObject['parameters']),
          'x-codeSamples': [
            ...((handlerSchema?.openapi?.['x-codeSamples'] as []) ?? []),
            ...((openAPIOperationObject['x-codeSamples'] as []) ?? []),
            {
              label: 'vovk-client',
              lang: 'typescript',
              source: codeSample,
            },
          ],
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
