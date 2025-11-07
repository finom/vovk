import type { OpenAPIObject, OperationObject, PathsObject, SchemaObject } from 'openapi3-ts/oas31';
import { createCodeSamples } from '../utils/createCodeSamples';
import {
  HttpStatus,
  type VovkBasicJSONSchema,
  type HttpMethod,
  type VovkSchema,
  type KnownAny,
  type VovkOutputConfig,
  VovkStrictConfig,
  VovkReadmeConfig,
  VovkSamplesConfig,
  VovkPackageJson,
} from '../types';
import { getJSONSchemaSample } from '../utils/getJSONSchemaSample';
import { resolveGeneratorConfigValues } from '../utils/resolveGeneratorConfigValues';

function extractComponents(
  schema: VovkBasicJSONSchema | undefined
): [VovkBasicJSONSchema | undefined, { [key: string]: VovkBasicJSONSchema }] {
  if (!schema) return [undefined, {}];

  const components: { [key: string]: VovkBasicJSONSchema } = {};

  // Function to collect components and replace $refs recursively
  const process = (obj: VovkBasicJSONSchema, path: string[] = []): VovkBasicJSONSchema | VovkBasicJSONSchema[] => {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle arrays
    if (Array.isArray(obj)) {
      return (obj as VovkBasicJSONSchema[]).map((item) => process(item, path) as VovkBasicJSONSchema);
    }

    // Create a copy to modify
    const result: Record<string, KnownAny> = {};

    Object.entries({ ...obj.definitions, ...obj.$defs }).forEach(([key, value]) => {
      components[key] = process(value, [...path, key]) as VovkBasicJSONSchema;
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
        result[key] = process(value as VovkBasicJSONSchema, [...path, key]);
      }
    }

    return result as VovkBasicJSONSchema;
  };

  const processedSchema = process(schema) as VovkBasicJSONSchema;

  return [processedSchema, components];
}

// returns OpenAPIObject along with resolved configs
export function vovkSchemaToOpenAPI({
  config,
  rootEntry = 'api',
  schema: fullSchema,
  outputConfigs,
  forceOutputConfigs,
  isBundle,
  segmentName: givenSegmentName,
  projectPackageJson,
}: {
  config: VovkStrictConfig | undefined;
  rootEntry?: string;
  schema: VovkSchema;
  outputConfigs: VovkOutputConfig[];
  forceOutputConfigs?: VovkOutputConfig[];
  isBundle: boolean;
  segmentName: string | null;
  projectPackageJson: VovkPackageJson | undefined;
}): {
  readme: VovkReadmeConfig;
  openAPIObject: OpenAPIObject;
  samples: VovkSamplesConfig;
  origin: string;
  package: VovkPackageJson;
  imports: VovkOutputConfig['imports'];
  reExports: VovkOutputConfig['reExports'];
} {
  const paths: PathsObject = {};
  const components: { [key: string]: VovkBasicJSONSchema } = {};
  const {
    openAPIObject,
    samples: samplesConfig,
    package: packageJson,
    readme: readmeConfig,
    origin,
    imports,
    reExports,
  } = resolveGeneratorConfigValues({
    config,
    outputConfigs,
    forceOutputConfigs,
    isBundle,
    segmentName: givenSegmentName ?? null,
    projectPackageJson,
  });
  for (const [segmentName, segmentSchema] of givenSegmentName
    ? ([[givenSegmentName, fullSchema.segments[givenSegmentName]]] as const)
    : Object.entries(fullSchema.segments ?? {})) {
    for (const c of Object.values(segmentSchema.controllers)) {
      for (const [handlerName, h] of Object.entries(c.handlers ?? {})) {
        if (h.operationObject) {
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

          const { ts, rs, py } = createCodeSamples({
            package: packageJson,
            handlerName,
            handlerSchema: h,
            controllerSchema: c,
            config: samplesConfig,
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
            h.misc?.originalPath ??
            '/' + [rootEntry.replace(/^\/+|\/+$/g, ''), segmentName, c.prefix, h.path].filter(Boolean).join('/');
          paths[path] = paths[path] ?? {};
          const httpMethod = h.httpMethod.toLowerCase() as Lowercase<HttpMethod>;
          paths[path][httpMethod] ??= {};
          paths[path][httpMethod] = {
            ...h.operationObject,
            ...paths[path][httpMethod],
            'x-codeSamples': [
              ...(paths[path][httpMethod]['x-codeSamples'] ?? []),
              ...(h.operationObject?.['x-codeSamples'] ?? []),
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
                  parameters: h.operationObject?.parameters ?? [...(queryParameters || []), ...(pathParameters || [])],
                }
              : {}) as OperationObject['parameters']),
            ...(paths[path][httpMethod].parameters
              ? {
                  parameters: paths[path][httpMethod].parameters,
                }
              : {}),
            ...(outputValidation && 'type' in outputValidation
              ? {
                  responses: {
                    200: {
                      description: 'description' in outputValidation ? outputValidation.description : 'Success',
                      content: {
                        [outputValidation['x-isForm'] ? 'multipart/form-data' : 'application/json']: {
                          schema: outputValidation,
                        },
                      },
                    },
                    ...h.operationObject?.responses,
                  },
                }
              : {}),
            ...(iterationValidation && 'type' in iterationValidation
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
                                JSON.stringify(getJSONSchemaSample(iterationValidation)),
                                JSON.stringify(getJSONSchemaSample(iterationValidation)),
                                JSON.stringify(getJSONSchemaSample(iterationValidation)),
                              ].join('\n'),
                            ],
                          },
                        },
                      },
                    },
                    ...h.operationObject?.responses,
                  },
                }
              : {}),
            ...(paths[path][httpMethod].responses
              ? {
                  responses: paths[path][httpMethod].responses,
                }
              : {}),
            ...(bodyValidation && 'type' in bodyValidation
              ? {
                  requestBody: h.operationObject?.requestBody ?? {
                    description: 'description' in bodyValidation ? bodyValidation.description : 'Request body',
                    required: true,
                    content: {
                      'application/json': {
                        schema: bodyValidation as SchemaObject,
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
            tags: paths[path][httpMethod].tags ?? h.operationObject?.tags,
          };
        }
      }
    }
  }

  return {
    readme: readmeConfig,
    samples: samplesConfig,
    package: packageJson,
    imports,
    reExports,
    origin,
    openAPIObject: {
      ...openAPIObject,
      components: {
        ...openAPIObject?.components,
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
    },
  };
}
