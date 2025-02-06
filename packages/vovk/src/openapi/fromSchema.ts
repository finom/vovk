import type { OpenAPIObject, PathsObject } from 'openapi3-ts/oas31';
import type { HttpMethod, VovkSchema } from '../types';

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
            '/' + [apiRoot.replace(/^\/+|\/+$/g, ''), segmentName, c.prefix, h.path].filter(Boolean).join('/');
          paths[path] = paths[path] ?? {};
          paths[path][h.httpMethod.toLowerCase() as Lowercase<HttpMethod>] = { ...h.openapi };
        }
      }
    }
  }

  return {
    openapi: '3.1.0',
    paths,
    info: extendWith?.info ?? {
      title: 'API',
      version: '1.0.0',
    },
    ...extendWith,
  };
}
