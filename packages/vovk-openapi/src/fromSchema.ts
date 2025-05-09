import type { OpenAPIObject, OperationObject, PathsObject } from 'openapi3-ts/oas31';
import { HttpStatus } from 'vovk';
import type { HttpMethod, KnownAny, VovkFullSchema } from 'vovk';
import { createCodeExamples } from './createCodeExamples';

export type SimpleJsonSchema = {
  type: 'object';
  description?: string;
  properties: Record<string, KnownAny>;
  required?: string[];
};

export function fromSchema(
  apiRoot: string,
  fullSchema: VovkFullSchema,
  extendWith?: Partial<OpenAPIObject>
): OpenAPIObject {
  const paths: PathsObject = {};

  for (const [segmentName, segmentSchema] of Object.entries(fullSchema.segments)) {
    for (const c of Object.values(segmentSchema.controllers)) {
      for (const [handlerName, h] of Object.entries(c.handlers)) {
        if (h.openapi) {
          const queryValidation = h?.validation?.query as SimpleJsonSchema | undefined;
          const bodyValidation = h?.validation?.body as SimpleJsonSchema | undefined;
          const paramsValidation = h?.validation?.params as SimpleJsonSchema | undefined;
          const outputValidation = h?.validation?.output as SimpleJsonSchema | undefined;

          const { ts, rs, py } = createCodeExamples({
            handlerName,
            handlerSchema: h,
            controllerSchema: c,
          });
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

          const path =
            '/' +
            [apiRoot.replace(/^\/+|\/+$/g, ''), segmentName, c.prefix, h.path]
              .filter(Boolean)
              .join('/')
              .replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
          paths[path] = paths[path] ?? {};
          paths[path][h.httpMethod.toLowerCase() as Lowercase<HttpMethod>] = {
            ...h.openapi,
            'x-codeSamples': [
              ...(h.openapi['x-codeSamples'] ?? []),
              {
                label: 'Typescript client',
                lang: 'typescript',
                source: ts,
              },
              {
                label: 'Python client',
                lang: 'python',
                source: py,
              },
              {
                label: 'Rust client',
                lang: 'rust',
                source: rs,
              },
            ],
            ...((queryParameters || pathParameters
              ? {
                  parameters: h.openapi.parameters ?? [...(queryParameters || []), ...(pathParameters || [])],
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
                    ...h.openapi?.responses,
                  },
                }
              : {}),
            ...(bodyValidation && 'type' in bodyValidation && 'properties' in bodyValidation
              ? {
                  requestBody: h.openapi?.requestBody ?? {
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
          };
        }
      }
    }
  }

  return {
    ...extendWith,
    openapi: '3.1.0',
    info: extendWith?.info ?? {
      title: 'API',
      version: '1.0.0',
    },
    components: {
      ...extendWith?.components,
      schemas: {
        HttpStatus: {
          type: 'integer',
          description: 'HTTP status code',
          enum: Object.keys(HttpStatus)
            .map((k) => HttpStatus[k as unknown as HttpStatus])
            .filter(Boolean)
            .filter((v) => typeof v === 'number'),
        },
        VovkErrorResponse: {
          type: 'object',
          description: 'Vovk error response',
          properties: {
            cause: {
              description: 'Error cause of any shape',
            },
            statusCode: {
              $ref: '#/components/schemas/HttpStatus',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            isError: {
              type: 'boolean',
              const: true,
              description: 'Indicates that this object represents an error',
            },
          },
          required: ['statusCode', 'message', 'isError'],
          additionalProperties: false,
        },
        ...extendWith?.components?.schemas,
      },
    },
    paths,
  };
}
