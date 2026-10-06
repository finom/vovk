import type { VovkJSONSchemaBase } from '../types/json-schema.js';
import { createSampleBudget, type SampleBudget, spend } from './sample-budget.js';

export function schemaToObject(
  schema: VovkJSONSchemaBase,
  rootSchema?: VovkJSONSchemaBase,
  seen: Set<string> = new Set(),
  budget: SampleBudget = createSampleBudget()
): unknown {
  if (!schema || typeof schema !== 'object') return null;
  rootSchema = rootSchema || schema;

  if (schema.example !== undefined) {
    return schema.example;
  }

  if (schema.examples && schema.examples.length > 0) {
    return schema.examples[0];
  }

  if (schema.const !== undefined) {
    return schema.const;
  }

  if (schema.$ref) {
    return handleRef(schema.$ref, rootSchema, seen, budget);
  }

  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  if (schema.oneOf && schema.oneOf.length > 0) {
    return schemaToObject(schema.oneOf[0], rootSchema, seen, budget);
  }

  if (schema.anyOf && schema.anyOf.length > 0) {
    return schemaToObject(schema.anyOf[0], rootSchema, seen, budget);
  }

  if (schema.allOf && schema.allOf.length > 0) {
    const mergedSchema = schema.allOf.reduce(
      (acc: VovkJSONSchemaBase, s: VovkJSONSchemaBase) => Object.assign(acc, s),
      {}
    );
    return schemaToObject(mergedSchema, rootSchema, seen, budget);
  }

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
        return handleObject(schema, rootSchema, seen, budget);
      case 'array':
        return handleArray(schema, rootSchema, seen, budget);
      case 'null':
        return null;
      default:
        return null;
    }
  }

  if (schema.properties) {
    return handleObject(schema, rootSchema, seen, budget);
  }

  return null;
}

function handleRef(ref: string, rootSchema: VovkJSONSchemaBase, seen: Set<string>, budget: SampleBudget): unknown {
  // a ref already being expanded means the schema is circular, stop instead of recursing forever
  if (seen.has(ref) || !spend(budget)) return null;

  const path = ref.split('/').slice(1) as (keyof VovkJSONSchemaBase)[];
  let current = rootSchema;
  for (const segment of path) {
    current = current[segment];
    if (current === undefined) {
      return null;
    }
  }

  return schemaToObject(current, rootSchema, new Set(seen).add(ref), budget);
}

function handleString(schema: VovkJSONSchemaBase): string {
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

function handleNumber(schema: VovkJSONSchemaBase): number {
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

function handleObject(
  schema: VovkJSONSchemaBase,
  rootSchema: VovkJSONSchemaBase,
  seen: Set<string>,
  budget: SampleBudget
): object {
  const result: Record<string, unknown> = {};

  if (schema.properties) {
    const required = schema.required || [];

    for (const [key, propSchema] of Object.entries<VovkJSONSchemaBase>(schema.properties)) {
      // the required properties, or all of them when none is
      if (required.includes(key) || required.length === 0) {
        result[key] = schemaToObject(propSchema, rootSchema, seen, budget);
      }
    }
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    result.additionalProp = schemaToObject(schema.additionalProperties, rootSchema, seen, budget);
  }

  return result;
}

function handleArray(
  schema: VovkJSONSchemaBase,
  rootSchema: VovkJSONSchemaBase,
  seen: Set<string>,
  budget: SampleBudget
) {
  if (schema.items && typeof schema.items === 'object') {
    const itemSchema = schema.items;
    const minItems = schema.minItems || 1;

    const numItems = Math.min(minItems, 3);

    const items: unknown[] = [];
    for (let i = 0; i < numItems && spend(budget); i++) {
      items.push(schemaToObject(itemSchema, rootSchema, seen, budget));
    }
    return items;
  }

  return [];
}
