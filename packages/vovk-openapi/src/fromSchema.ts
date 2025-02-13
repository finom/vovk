import type { OpenAPIObject, PathsObject } from 'openapi3-ts/oas31';
import { HttpStatus } from 'vovk';
import type { HttpMethod, VovkSchema } from 'vovk/src/types';

export function fromSchema(
  apiRoot: string,
  vovkSchema: Record<string, VovkSchema>,
  extendWith?: Partial<OpenAPIObject>
): OpenAPIObject {
  const paths: PathsObject = {};

  for (const [segmentName, schema] of Object.entries(vovkSchema)) {
    for (const c of Object.values(schema.controllers)) {
      for (const h of Object.values(c.handlers)) {
        if (h.openapi) {
          const path =
            '/' +
            [apiRoot.replace(/^\/+|\/+$/g, ''), segmentName, c.prefix, h.path]
              .filter(Boolean)
              .join('/')
              .replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
          paths[path] = paths[path] ?? {};
          paths[path][h.httpMethod.toLowerCase() as Lowercase<HttpMethod>] = { ...h.openapi };
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
          enum: Object.keys(HttpStatus).map((k) => HttpStatus[k as unknown as HttpStatus]).filter(Boolean).filter((v) => typeof v === 'number'),
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
