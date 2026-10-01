import type { JSONSchema7 } from 'json-schema';

const VERSION = '3';

export default class V3SchemaService {
  static getSegmentDefinition(): JSONSchema7 {
    const validationAnyOf = [
      { $ref: 'https://json-schema.org/draft-07/schema' },
      { $ref: 'https://json-schema.org/draft/2020-12/schema' },
    ];
    return {
      $schema: 'https://json-schema.org/draft-07/schema',
      $id: `https://vovk.dev/api/spec/v${VERSION}/segment.json`,
      title: 'Vovk.ts segment definition',
      description: '',
      type: 'object',
      required: ['$schema', 'emitSchema', 'segmentName', 'segmentType', 'controllers'],
      properties: {
        $schema: {
          type: 'string',
          description: 'Schema URL',
          enum: [`https://vovk.dev/api/schema/v${VERSION}/segment.json`],
        },
        emitSchema: {
          type: 'boolean',
          description: 'Defines if the schema is going to be emitted for this segment',
        },
        segmentName: {
          type: 'string',
          description: "Segment name, for the root segment it's an empty string",
        },
        segmentType: {
          type: 'string',
          enum: ['segment', 'mixin'],
          description: 'Defines if the segment is a regular segment or an OpenAPI mixin',
        },
        forceApiRoot: {
          type: 'string',
          description: 'Force API root URL for this segment, overrides the global one',
        },
        controllers: {
          type: 'object',
          description: 'List of controllers as key-value pairs for fast access',
          additionalProperties: {
            type: 'object',
            required: ['rpcModuleName', 'originalControllerName', 'prefix', 'handlers'],
            properties: {
              rpcModuleName: {
                type: 'string',
                description: "RPC name that's going to be used in the client",
              },
              originalControllerName: {
                type: 'string',
                description: 'Original name of the controller class',
              },
              prefix: {
                type: 'string',
                description: 'An argument of @prefix class decorator',
              },
              forceApiRoot: {
                type: 'string',
                description: 'Force API root URL for this RPC module, overrides the global one',
              },
              handlers: {
                type: 'object',
                description: 'List of handlers as key-value pairs for fast access',
                additionalProperties: {
                  type: 'object',
                  required: ['path', 'httpMethod'],
                  properties: {
                    path: {
                      type: 'string',
                      description: "Endpoint that's concatenated with the prefix",
                    },
                    httpMethod: {
                      type: 'string',
                      description: 'HTTP method',
                      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
                    },
                    validation: {
                      type: 'object',
                      description: 'Validation for body, query, params, output and iteration',
                      properties: {
                        body: {
                          anyOf: validationAnyOf,
                          description: 'Validation for request body',
                        },
                        query: {
                          anyOf: validationAnyOf,
                          description: 'Validation for query parameters',
                        },
                        params: {
                          anyOf: validationAnyOf,
                          description: 'Validation for route parameters',
                        },
                        output: {
                          anyOf: validationAnyOf,
                          description: 'Validation for response',
                        },
                        iteration: {
                          anyOf: validationAnyOf,
                          description: 'Validation for JSONLines iteration',
                        },
                      },
                      additionalProperties: false,
                      required: [],
                    },
                    operationObject: {
                      $ref: 'https://spec.openapis.org/oas/3.1/schema/2021-05-20#/$defs/operation',
                    },
                    custom: {
                      type: 'object',
                      description: 'Custom data that can be defined by a custom decorator',
                      additionalProperties: true,
                    },
                  },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          description: 'Additional metadata for the segment',
          additionalProperties: true,
        },
      },
    };
  }

  static getConfigDefinition(): JSONSchema7 {
    return {
      $schema: 'https://json-schema.org/draft-07/schema',
      $id: `https://vovk.dev/api/spec/v${VERSION}/config.json`,
      title: 'Schema for Vovk config',
      description: '',
      type: 'object',
      additionalProperties: true,
      properties: {
        $schema: {
          type: 'string',
          description: 'Schema URL',
          enum: [`https://vovk.dev/api/schema/v${VERSION}/config.json`],
        },
      },
    };
  }

  static getMetaDefinition(): JSONSchema7 {
    return {
      $schema: 'https://json-schema.org/draft-07/schema',
      $id: `https://vovk.dev/api/spec/v${VERSION}/meta.json`,
      title: 'Schema for Vovk _meta.json file',
      description: 'Meta information',
      type: 'object',
      additionalProperties: true,
      properties: {
        $schema: {
          type: 'string',
          description: 'Schema URL',
          enum: [`https://vovk.dev/api/schema/v${VERSION}/meta.json`],
        },
        config: {
          $ref: `https://vovk.dev/api/schema/v${VERSION}/config.json`,
        },
      },
    };
  }

  static getFullDefinition(): JSONSchema7 {
    return {
      $schema: 'https://json-schema.org/draft-07/schema',
      $id: `https://vovk.dev/api/spec/v${VERSION}/schema.json`,
      title: 'Vovk full schema definition',
      description: 'Combined schema containing config and segments',
      type: 'object',
      required: ['config', 'segments'],
      properties: {
        config: {
          $ref: `https://vovk.dev/api/schema/v${VERSION}/config.json`,
        },
        segments: {
          type: 'object',
          description: 'Map of segment names to segment definitions',
          additionalProperties: {
            $ref: `https://vovk.dev/api/schema/v${VERSION}/segment.json`,
          },
        },
      },
    };
  }
}
