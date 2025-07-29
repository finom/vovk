import { KnownAny, SimpleJSONSchema } from '../types.js';

interface SamplerOptions {
  comment?: '//' | '#';
  stripQuotes?: boolean;
  indent?: number;
}

export function getJSONSchemaExample(schema: KnownAny, options: SamplerOptions, rootSchema?: KnownAny): string {
  const { comment = '//', stripQuotes = false, indent = 0 } = options;

  if (!schema || typeof schema !== 'object') return 'null';

  // Use the input schema as the root if not provided
  rootSchema = rootSchema || schema;

  // Get the sample value
  const sampleValue = getSampleValue(schema, rootSchema);

  // Format the output with descriptions
  return formatWithDescriptions(sampleValue, schema, rootSchema, comment, stripQuotes, indent);
}

function getSampleValue(schema: KnownAny, rootSchema: KnownAny): KnownAny {
  if (!schema || typeof schema !== 'object') return null;

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
    return getSampleValue(schema.oneOf[0], rootSchema);
  }

  if (schema.anyOf && schema.anyOf.length > 0) {
    return getSampleValue(schema.anyOf[0], rootSchema);
  }

  if (schema.allOf && schema.allOf.length > 0) {
    // Merge all schemas in allOf
    const mergedSchema = schema.allOf.reduce((acc: KnownAny, s: KnownAny) => ({ ...acc, ...s }), {});
    return getSampleValue(mergedSchema, rootSchema);
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

function formatWithDescriptions(
  value: KnownAny,
  schema: SimpleJSONSchema,
  rootSchema: KnownAny,
  comment: string,
  stripQuotes: boolean,
  indent: number
): string {
  const indentStr = ' '.repeat(indent);

  // Handle null
  if (value === null) {
    return 'null';
  }

  // Handle primitives
  if (typeof value !== 'object' || value instanceof Date) {
    return JSON.stringify(value);
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';

    const items = value.map((item) => {
      const itemSchema = schema.items || ({} as SimpleJSONSchema);
      const formattedItem = formatWithDescriptions(item, itemSchema, rootSchema, comment, stripQuotes, indent + 2);
      return `${indentStr}  ${formattedItem}`;
    });

    return `[\n${items.join(',\n')}\n${indentStr}]`;
  }

  // Handle objects
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';

    const formattedEntries: string[] = [];
    const isTopLevel = indent === 0;

    // Add top-level description for objects
    if (isTopLevel && schema.type === 'object' && schema.description) {
      const descLines = schema.description.split('\n');
      formattedEntries.push(`${indentStr}  ${comment} -----`);
      descLines.forEach((line) => {
        formattedEntries.push(`${indentStr}  ${comment} ${line.trim()}`);
      });
      formattedEntries.push(`${indentStr}  ${comment} -----`);
    }

    entries.forEach(([key, val], index) => {
      const propSchema = schema.properties?.[key] || {};

      // Handle $ref in property schema
      let resolvedPropSchema = propSchema;
      if (propSchema.$ref) {
        resolvedPropSchema = resolveRef(propSchema.$ref, rootSchema);
      }

      // Add property description if it exists
      if (resolvedPropSchema.description) {
        const descLines = resolvedPropSchema.description.split('\n');
        descLines.forEach((line) => {
          formattedEntries.push(`${indentStr}  ${comment} ${line.trim()}`);
        });
      }

      // Format the key
      const formattedKey = stripQuotes && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(key) ? key : JSON.stringify(key);

      // Format the value
      const formattedValue = formatWithDescriptions(
        val,
        resolvedPropSchema,
        rootSchema,
        comment,
        stripQuotes,
        indent + 2
      );

      formattedEntries.push(`${indentStr}  ${formattedKey}: ${formattedValue}${index < entries.length - 1 ? ',' : ''}`);
    });

    return `{\n${formattedEntries.join('\n')}\n${indentStr}}`;
  }

  return JSON.stringify(value);
}

function resolveRef(ref: string, rootSchema: KnownAny): KnownAny {
  const path = ref.split('/').slice(1);
  let current = rootSchema;
  for (const segment of path) {
    current = current[segment];
    if (current === undefined) {
      return {};
    }
  }
  return current;
}

function handleRef(ref: string, rootSchema: KnownAny): KnownAny {
  const resolved = resolveRef(ref, rootSchema);
  return getSampleValue(resolved, rootSchema);
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
      if (required.includes(key) || required.length === 0) {
        result[key] = getSampleValue(propSchema, rootSchema);
      }
    }
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    result['additionalProp'] = getSampleValue(schema.additionalProperties, rootSchema);
  }

  return result;
}

function handleArray(schema: KnownAny, rootSchema: KnownAny) {
  if (schema.items) {
    const itemSchema = schema.items;
    const minItems = schema.minItems || 1;
    const numItems = Math.min(minItems, 3);

    return Array.from({ length: numItems }, () => getSampleValue(itemSchema, rootSchema));
  }

  return [];
}
