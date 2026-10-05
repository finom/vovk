import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { mapSubschemas, mapValues } from './map-subschemas.js';

type Node = Record<string, unknown>;

const OPERATION_KEYS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);

const isObject = (value: unknown): value is Node => !!value && typeof value === 'object' && !Array.isArray(value);

// OpenAPI 3.0 marks an exclusive bound with a flag next to minimum or maximum and allows null with `nullable`;
// JSON Schema 2020-12, which the Python and Rust clients validate with, has neither
function toJSONSchema2020(schema: unknown): unknown {
  if (!isObject(schema)) return schema;
  const result = mapSubschemas(schema, toJSONSchema2020) as Node;
  for (const [exclusive, bound] of [
    ['exclusiveMinimum', 'minimum'],
    ['exclusiveMaximum', 'maximum'],
  ] as const) {
    if (typeof result[exclusive] !== 'boolean') continue;
    if (result[exclusive] && typeof result[bound] === 'number') {
      result[exclusive] = result[bound];
      delete result[bound];
    } else {
      delete result[exclusive];
    }
  }
  const { nullable, ...rest } = result;
  if (typeof nullable !== 'boolean') return result;
  if (!nullable) return rest;
  if (Array.isArray(rest.enum) && !rest.enum.includes(null)) rest.enum = [...rest.enum, null];
  if (typeof rest.type === 'string') return { ...rest, type: [rest.type, 'null'] };
  if (Array.isArray(rest.type)) return rest.type.includes('null') ? rest : { ...rest, type: [...rest.type, 'null'] };
  // with no type, as next to a $ref or an allOf, null is one more option
  return rest.enum ? rest : { anyOf: [rest, { type: 'null' }] };
}

// a parameter and a media type hold a schema; a parameter, a request body and a response hold media types
function withSchemas(value: unknown): unknown {
  if (!isObject(value)) return value;
  return {
    ...value,
    ...('schema' in value && { schema: toJSONSchema2020(value.schema) }),
    ...(isObject(value.content) && { content: mapValues(value.content, withSchemas) }),
  };
}

function toOperation(value: unknown): unknown {
  if (!isObject(value)) return value;
  return {
    ...value,
    ...(Array.isArray(value.parameters) && { parameters: value.parameters.map(withSchemas) }),
    ...('requestBody' in value && { requestBody: withSchemas(value.requestBody) }),
    ...(isObject(value.responses) && { responses: mapValues(value.responses, withSchemas) }),
  };
}

function toPathItem(value: unknown): unknown {
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (key === 'parameters' && Array.isArray(item)) return [key, item.map(withSchemas)];
      return [key, OPERATION_KEYS.has(key) ? toOperation(item) : item];
    })
  );
}

// the schemas of an OpenAPI 3.0 document the importer reads, written as JSON Schema 2020-12
export function normalizeOpenAPI30(document: OpenAPIObject): OpenAPIObject {
  const { paths, components } = document;
  return {
    ...document,
    ...(paths && { paths: mapValues(paths, toPathItem) }),
    ...(components && {
      components: {
        ...components,
        ...(components.schemas && { schemas: mapValues(components.schemas, toJSONSchema2020) }),
        ...(components.parameters && { parameters: mapValues(components.parameters, withSchemas) }),
        ...(components.requestBodies && { requestBodies: mapValues(components.requestBodies, withSchemas) }),
        ...(components.responses && { responses: mapValues(components.responses, withSchemas) }),
      },
    }),
  } as OpenAPIObject;
}
