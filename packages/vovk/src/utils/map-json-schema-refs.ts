// keywords that hold a subschema or a list of them
const SUBSCHEMA_KEYWORDS = new Set([
  'additionalItems',
  'additionalProperties',
  'allOf',
  'anyOf',
  'contains',
  'contentSchema',
  'else',
  'if',
  'items',
  'not',
  'oneOf',
  'prefixItems',
  'propertyNames',
  'then',
  'unevaluatedItems',
  'unevaluatedProperties',
]);

// keywords that map names to subschemas
const SUBSCHEMA_MAP_KEYWORDS = new Set([
  '$defs',
  'definitions',
  'dependencies',
  'dependentSchemas',
  'patternProperties',
  'properties',
]);

export function isJSONObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// copies a schema with every `$ref` passed through `rewrite`; data keywords such as `const` or `default` stay as they are
export function mapJSONSchemaRefs<T>(schema: T, rewrite: (ref: string) => string): T {
  if (Array.isArray(schema)) return schema.map((item) => mapJSONSchemaRefs(item, rewrite)) as T;
  if (!isJSONObject(schema)) return schema;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === '$ref' && typeof value === 'string') {
      result[key] = rewrite(value);
    } else if (SUBSCHEMA_KEYWORDS.has(key)) {
      result[key] = mapJSONSchemaRefs(value, rewrite);
    } else if (SUBSCHEMA_MAP_KEYWORDS.has(key) && isJSONObject(value)) {
      result[key] = Object.fromEntries(
        Object.entries(value).map(([name, sub]) => [name, mapJSONSchemaRefs(sub, rewrite)])
      );
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

export function decodeJSONPointerToken(token: string): string | null {
  try {
    return decodeURIComponent(token).replace(/~1/g, '/').replace(/~0/g, '~');
  } catch {
    return null;
  }
}

export function encodeJSONPointerToken(name: string): string {
  return encodeURIComponent(name.replace(/~/g, '~0').replace(/\//g, '~1'));
}
