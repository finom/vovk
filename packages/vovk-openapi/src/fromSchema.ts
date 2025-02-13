import type { OpenAPIObject, PathsObject } from 'openapi3-ts/oas31';
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
    components: extendWith?.components ?? {
      schemas: {
        VovkErrorResponse: {
          type: 'object',
          properties: {
            cause: {},
            statusCode: {
              type: 'integer',
            },
            message: {
              type: 'string',
            },
            isError: {
              type: 'boolean',
              const: true,
            },
          },
          required: ['statusCode', 'message', 'isError'],
          additionalProperties: false,
        },
      },
      ...extendWith?.components,
    },
    paths,
  };
}
