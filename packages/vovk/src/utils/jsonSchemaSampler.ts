import { KnownAny } from '../types';

export function jsonSchemaSampler(schema: KnownAny, rootSchema?: KnownAny): KnownAny {
  if (!schema || typeof schema !== 'object') return null;
  // Use the input schema as the root if not provided
  rootSchema = rootSchema || schema;

  // If there's an example, use it
  if (schema.example !== undefined) {
    return schema.example;
  }

  // If there are examples, use one of them
  if (schema.examples && schema.examples.length > 0) {
    return schema.examples[0];
  }

  // Handle const if present
  if (schema.const !== undefined) {
    return schema.const;
  }

  // Handle $ref if present
  if (schema.$ref) {
    return handleRef(schema.$ref, rootSchema);
  }

  // Handle enum if present
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  // Handle oneOf, anyOf, allOf
  if (schema.oneOf && schema.oneOf.length > 0) {
    return jsonSchemaSampler(schema.oneOf[0], rootSchema);
  }

  if (schema.anyOf && schema.anyOf.length > 0) {
    return jsonSchemaSampler(schema.anyOf[0], rootSchema);
  }

  if (schema.allOf && schema.allOf.length > 0) {
    // Merge all schemas in allOf
    const mergedSchema = schema.allOf.reduce((acc: KnownAny, s: KnownAny) => ({ ...acc, ...s }), {});
    return jsonSchemaSampler(mergedSchema, rootSchema);
  }

  // Handle different types
  if (schema.type) {
    switch (schema.type) {
      case 'string':
        return handleString(schema);
      case 'number':
      case 'integer':
        return handleNumber(schema);
      case 'boolean':
        return handleBoolean();
      case 'object':
        return handleObject(schema, rootSchema);
      case 'array':
        return handleArray(schema, rootSchema);
      case 'null':
        return null;
      default:
        return null;
    }
  }

  // If type is not specified but properties are, treat it as an object
  if (schema.properties) {
    return handleObject(schema, rootSchema);
  }

  // Default fallback
  return null;
}

function handleRef(ref: string, rootSchema: KnownAny): KnownAny {
  // Parse the reference path
  const path = ref.split('/').slice(1); // Remove the initial '#'

  // Navigate through the schema to find the referenced definition
  let current = rootSchema;
  for (const segment of path) {
    current = current[segment];
    if (current === undefined) {
      return null; // Reference not found
    }
  }

  // Process the referenced schema
  return jsonSchemaSampler(current, rootSchema);
}

function handleString(schema: KnownAny): string {
  if (schema.format) {
    switch (schema.format) {
      case 'email':
      case 'idn-email':
        return 'user@example.com';
      case 'uri':
      case 'url':
      case 'iri':
        return 'https://example.com';
      case 'date':
        return '2023-01-01';
      case 'date-time':
        return '2023-01-01T00:00:00Z';
      case 'time':
        return '12:00:00Z';
      case 'duration':
        return 'PT1H';
      case 'uuid':
        return '00000000-0000-0000-0000-000000000000';
      case 'regex':
        return '^[a-zA-Z0-9]+$';
      case 'relative-json-pointer':
        return '/some/relative/path';
      case 'color':
        return '#000000';
      case 'hostname':
        return 'example.com';
      case 'zipcode':
        return '12345';
      case 'phone':
        return '+123-456-7890';
      case 'password':
        return '******';
      default:
        return 'string';
    }
  }

  if (schema.pattern) {
    // For simplicity, return a basic string for patterns
    return 'pattern-string';
  }

  return 'string';
}

function handleNumber(schema: KnownAny): number {
  if (schema.minimum !== undefined && schema.maximum !== undefined) {
    return schema.minimum;
  } else if (schema.minimum !== undefined) {
    return schema.minimum;
  } else if (schema.maximum !== undefined) {
    return schema.maximum;
  }
  return 0;
}

function handleBoolean(): boolean {
  return true;
}

function handleObject(schema: KnownAny, rootSchema: KnownAny): object {
  const result: Record<string, KnownAny> = {};

  if (schema.properties) {
    const required = schema.required || [];

    for (const [key, propSchema] of Object.entries<KnownAny>(schema.properties)) {
      // Only include required properties or as a basic example
      if (required.includes(key) || required.length === 0) {
        result[key] = jsonSchemaSampler(propSchema, rootSchema);
      }
    }
  }

  // Handle additionalProperties
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    result['additionalProp'] = jsonSchemaSampler(schema.additionalProperties, rootSchema);
  }

  return result;
}

function handleArray(schema: KnownAny, rootSchema: KnownAny) {
  if (schema.items) {
    const itemSchema = schema.items;
    const minItems = schema.minItems || 1;

    // Create minimum number of items (capped at a reasonable max for examples)
    const numItems = Math.min(minItems, 3);

    return Array.from({ length: numItems }, () => jsonSchemaSampler(itemSchema, rootSchema));
  }

  return [];
}
