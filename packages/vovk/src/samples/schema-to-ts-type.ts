import type { VovkJSONSchemaBase } from 'vovk';

const PRIMITIVE_TYPES = new Set(['string', 'number', 'integer', 'boolean', 'null']);

const isObjectType = (schema: VovkJSONSchemaBase, type: unknown) =>
  type === 'object' || !!schema.properties || schema.additionalProperties !== undefined;

const isArrayType = (schema: VovkJSONSchemaBase, type: unknown) =>
  type === 'array' || !!schema.items || !!schema.prefixItems;

// a type list builds each type once: building the object or array type of the schema once per type that leads to it
// would double the work at every level of nesting
const typeListKey = (schema: VovkJSONSchemaBase, type: unknown): string => {
  if (PRIMITIVE_TYPES.has(type as string)) return type as string;
  if (isObjectType(schema, type)) return 'object';
  if (isArrayType(schema, type)) return 'array';
  return String(type);
};

export function schemaToTsType(jsonSchema: VovkJSONSchemaBase | boolean): string {
  if (jsonSchema === true) return 'unknown';
  if (jsonSchema === false) return 'never';
  if (jsonSchema === null || jsonSchema === undefined) return 'unknown';
  if (typeof jsonSchema !== 'object') return 'unknown';

  // a mixin component ref carries its Mixins type
  if (typeof jsonSchema['x-tsType'] === 'string') return jsonSchema['x-tsType'];

  // Handle const
  if ('const' in jsonSchema) {
    return JSON.stringify(jsonSchema.const);
  }

  // Handle enum
  if (jsonSchema.enum) {
    return jsonSchema.enum.map((v: VovkJSONSchemaBase) => JSON.stringify(v)).join(' | ') || 'never';
  }

  // Handle allOf (intersection)
  if (jsonSchema.allOf) {
    const parts = jsonSchema.allOf.map((s: VovkJSONSchemaBase) => schemaToTsType(s));
    return parts.length ? `(${parts.join(' & ')})` : 'unknown';
  }

  // Handle anyOf (union)
  if (jsonSchema.anyOf) {
    const parts = jsonSchema.anyOf.map((s: VovkJSONSchemaBase) => schemaToTsType(s));
    return parts.length ? `(${parts.join(' | ')})` : 'never';
  }

  // Handle oneOf (union)
  if (jsonSchema.oneOf) {
    const parts = jsonSchema.oneOf.map((s: VovkJSONSchemaBase) => schemaToTsType(s));
    return parts.length ? `(${parts.join(' | ')})` : 'never';
  }

  // Handle not (negate - approximate as unknown)
  if (jsonSchema.not) {
    return 'unknown';
  }

  // Handle type as array (union of types)
  if (Array.isArray(jsonSchema.type)) {
    const types = new Map<string, string>();
    for (const t of jsonSchema.type) {
      const key = typeListKey(jsonSchema, t);
      if (!types.has(key)) types.set(key, schemaToTsType({ ...jsonSchema, type: t }));
    }
    return types.size ? `(${[...types.values()].join(' | ')})` : 'unknown';
  }

  const type = jsonSchema.type;

  // Primitives; a binary string is a file, which the client sends as a Blob
  if (type === 'string') return jsonSchema.format === 'binary' ? 'Blob' : 'string';
  if (type === 'number' || type === 'integer') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'null') return 'null';

  // Object
  if (isObjectType(jsonSchema, type)) {
    const props = jsonSchema.properties || {};
    const required: string[] = jsonSchema.required || [];
    const propEntries = Object.entries(props);

    const propStrings = propEntries.map(([key, value]) => {
      const isRequired = required.includes(key);
      const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      return `${safeName}${isRequired ? '' : '?'}: ${schemaToTsType(value)}`;
    });

    // Handle additionalProperties
    let additionalType: string | null = null;
    if (jsonSchema.additionalProperties === true) {
      additionalType = 'unknown';
    } else if (jsonSchema.additionalProperties && typeof jsonSchema.additionalProperties === 'object') {
      additionalType = schemaToTsType(jsonSchema.additionalProperties);
    }

    if (propStrings.length === 0 && additionalType) {
      return `{ [key: string]: ${additionalType} }`;
    }

    if (propStrings.length === 0 && !additionalType) {
      return jsonSchema.additionalProperties === false ? '{}' : '{ [key: string]: unknown }';
    }

    let result = `{ ${propStrings.join('; ')} }`;
    if (additionalType) {
      result = `(${result} & { [key: string]: ${additionalType} })`;
    }
    return result;
  }

  // Array
  if (isArrayType(jsonSchema, type)) {
    // Tuple (prefixItems)
    if (jsonSchema.prefixItems) {
      const tupleTypes = jsonSchema.prefixItems.map((s: VovkJSONSchemaBase) => schemaToTsType(s));
      if (jsonSchema.items === false) {
        return `[${tupleTypes.join(', ')}]`;
      }
      const restType = jsonSchema.items ? schemaToTsType(jsonSchema.items) : 'unknown';
      return `[${tupleTypes.join(', ')}, ...${restType}[]]`;
    }

    // Regular array
    if (jsonSchema.items) {
      if (Array.isArray(jsonSchema.items)) {
        // Legacy tuple syntax
        const tupleTypes = jsonSchema.items.map((s: VovkJSONSchemaBase) => schemaToTsType(s));
        if (jsonSchema.additionalItems === false) {
          return `[${tupleTypes.join(', ')}]`;
        }
        const restType = jsonSchema.additionalItems ? schemaToTsType(jsonSchema.additionalItems) : 'unknown';
        return `[${tupleTypes.join(', ')}, ...${restType}[]]`;
      }
      return `${schemaToTsType(jsonSchema.items)}[]`;
    }

    return 'unknown[]';
  }

  // No type specified - try to infer from structure
  if (jsonSchema.properties) {
    return schemaToTsType({ ...jsonSchema, type: 'object' });
  }

  // Fallback for empty or unknown schema
  return 'unknown';
}
