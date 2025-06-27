import type { OpenAPIObject, OperationObject, PathsObject } from 'openapi3-ts/oas31';
import { type CodeSamplePackageJson, createCodeExamples } from '../utils/createCodeExamples';
import { jsonSchemaSampler } from '../utils/jsonSchemaSampler';
import { HttpStatus, type SimpleJsonSchema, type HttpMethod, type VovkSchema, KnownAny } from '../types';

function extractComponents(
  schema: SimpleJsonSchema | undefined
): [SimpleJsonSchema | undefined, Record<string, SimpleJsonSchema>] {
  if (!schema) return [undefined, {}];

  const components: Record<string, SimpleJsonSchema> = {};

  // Function to collect components and replace $refs recursively
  const process = (obj: SimpleJsonSchema, path: string[] = []): SimpleJsonSchema | SimpleJsonSchema[] => {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle arrays
    if (Array.isArray(obj)) {
      return (obj as SimpleJsonSchema[]).map((item) => process(item, path) as SimpleJsonSchema);
    }

    // Create a copy to modify
    const result: Record<string, KnownAny> = {};

    Object.entries({ ...obj.definitions, ...obj.$defs }).forEach(([key, value]) => {
      components[key] = process(value, [...path, key]) as SimpleJsonSchema;
    });

    // Process all properties
    for (const [key, value] of Object.entries(obj ?? {})) {
      // Skip already processed special properties
      if (key === '$defs' || key === 'definitions') continue;

      if (key === '$ref' && typeof value === 'string') {
        // Extract the component name from the reference
        const refParts = value.split('/');
        const refName = refParts[refParts.length - 1];
        // Replace with component reference
        result[key] = `#/components/schemas/${refName}`;
      } else {
        // Recursively process other properties
        result[key] = process(value as SimpleJsonSchema, [...path, key]);
      }
    }

    return result as SimpleJsonSchema;
  };

  const processedSchema = process(schema) as SimpleJsonSchema;

  return [processedSchema, components];
}

export function vovkSchemaToOpenAPI({
  rootEntry,
  schema: fullSchema,
  openAPIObject = {},
  package: packageJson = { name: 'vovk-client' },
  sampler = jsonSchemaSampler,
}: {
  rootEntry: string;
  schema: VovkSchema;
  openAPIObject?: Partial<OpenAPIObject>;
  package?: CodeSamplePackageJson;
  sampler?: (schema: KnownAny) => KnownAny; // e. g. @stoplight/json-schema-sampler
}): OpenAPIObject {
  const paths: PathsObject = {};
  const components: Record<string, SimpleJsonSchema> = {};

  for (const [segmentName, segmentSchema] of Object.entries(fullSchema.segments ?? {})) {
    for (const c of Object.values(segmentSchema.controllers)) {
      for (const [handlerName, h] of Object.entries(c.handlers ?? {})) {
        if (h.openapi) {
          const [queryValidation, queryComponents] = extractComponents(h?.validation?.query);
          const [bodyValidation, bodyComponents] = extractComponents(h?.validation?.body);
          const [paramsValidation, paramsComponents] = extractComponents(h?.validation?.params);
          const [outputValidation, outputComponents] = extractComponents(h?.validation?.output);
          const [iterationValidation, iterationComponents] = extractComponents(h?.validation?.iteration);

          // TODO: Handle name conflicts?
          Object.assign(
            components,
            queryComponents,
            bodyComponents,
            paramsComponents,
            outputComponents,
            iterationComponents
          );

          const { ts, rs, py } = createCodeExamples({
            package: packageJson,
            handlerName,
            handlerSchema: h,
            controllerSchema: c,
          });
          const queryParameters =
            queryValidation && 'type' in queryValidation && 'properties' in queryValidation
              ? Object.entries(queryValidation.properties ?? {}).map(([propName, propSchema]) => ({
                  name: propName,
                  in: 'query',
                  required: queryValidation.required ? queryValidation.required.includes(propName) : false,
                  schema: propSchema,
                }))
              : null;

          const pathParameters =
            paramsValidation && 'type' in paramsValidation && 'properties' in paramsValidation
              ? Object.entries(paramsValidation.properties ?? {}).map(([propName, propSchema]) => ({
                  name: propName,
                  in: 'path',
                  required: paramsValidation.required ? paramsValidation.required.includes(propName) : false,
                  schema: propSchema,
                }))
              : null;

          const path =
            '/' + [rootEntry.replace(/^\/+|\/+$/g, ''), segmentName, c.prefix, h.path].filter(Boolean).join('/');
          paths[path] = paths[path] ?? {};
          const httpMethod = h.httpMethod.toLowerCase() as Lowercase<HttpMethod>;
          paths[path][httpMethod] ??= {};
          paths[path][httpMethod] = {
            ...h.openapi,
            ...paths[path][httpMethod],
            'x-codeSamples': [
              ...(paths[path][httpMethod]['x-codeSamples'] ?? []),
              ...(h.openapi['x-codeSamples'] ?? []),
              {
                label: 'TypeScript RPC',
                lang: 'typescript',
                source: ts,
              },
              {
                label: 'Python RPC',
                lang: 'python',
                source: py,
              },
              {
                label: 'Rust RPC',
                lang: 'rust',
                source: rs,
              },
            ],
            ...((queryParameters || pathParameters
              ? {
                  parameters: h.openapi.parameters ?? [...(queryParameters || []), ...(pathParameters || [])],
                }
              : {}) as OperationObject['parameters']),
            ...(paths[path][httpMethod].parameters
              ? {
                  parameters: paths[path][httpMethod].parameters,
                }
              : {}),
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
            ...(iterationValidation && 'type' in iterationValidation && 'properties' in iterationValidation
              ? {
                  responses: {
                    200: {
                      description:
                        'description' in iterationValidation ? iterationValidation.description : 'JSON Lines response',
                      content: {
                        'application/jsonl': {
                          schema: {
                            ...iterationValidation,
                            examples: iterationValidation.examples ?? [
                              [
                                JSON.stringify(sampler(iterationValidation)),
                                JSON.stringify(sampler(iterationValidation)),
                                JSON.stringify(sampler(iterationValidation)),
                              ].join('\n'),
                            ],
                          },
                        },
                      },
                    },
                    ...h.openapi?.responses,
                  },
                }
              : {}),
            ...(paths[path][httpMethod].responses
              ? {
                  responses: paths[path][httpMethod].responses,
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
            ...(paths[path][httpMethod].requestBody
              ? {
                  requestBody: paths[path][httpMethod].requestBody,
                }
              : {}),
            tags: paths[path][httpMethod].tags ?? h.openapi?.tags,
          };
        }
      }
    }
  }

  return {
    ...openAPIObject,
    openapi: '3.1.0',
    info: {
      title: packageJson?.description ?? 'API',
      version: packageJson?.version ?? '0.0.1',
      ...openAPIObject?.info,
    },
    components: {
      schemas: {
        ...(openAPIObject?.components?.schemas ?? components),
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
        ...openAPIObject?.components?.schemas,
      },
    },
    paths,
  };
}
