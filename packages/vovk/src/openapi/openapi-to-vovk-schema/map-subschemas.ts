// keywords whose value is a schema or a list of them, and those whose value maps names to schemas
// biome-ignore format: a word list
const SUBSCHEMA_KEYWORDS = new Set([
  'items', 'prefixItems', 'additionalItems', 'contains', 'additionalProperties', 'unevaluatedItems',
  'unevaluatedProperties', 'propertyNames', 'not', 'if', 'then', 'else', 'allOf', 'anyOf', 'oneOf',
]);
export const SUBSCHEMA_MAP_KEYWORDS = new Set([
  'properties',
  'patternProperties',
  'dependentSchemas',
  '$defs',
  'definitions',
]);

export const mapValues = <T>(value: object, fn: (item: unknown) => T): Record<string, T> =>
  Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fn(item)]));

// a copy of a schema with fn applied to each subschema it holds; values such as examples and defaults stay as they are
export function mapSubschemas(schema: unknown, fn: (subschema: unknown) => unknown): unknown {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return schema;
  return Object.fromEntries(
    Object.entries(schema).map(([key, value]) => {
      if (SUBSCHEMA_KEYWORDS.has(key)) return [key, Array.isArray(value) ? value.map(fn) : fn(value)];
      if (SUBSCHEMA_MAP_KEYWORDS.has(key) && value && typeof value === 'object') return [key, mapValues(value, fn)];
      return [key, value];
    })
  );
}
