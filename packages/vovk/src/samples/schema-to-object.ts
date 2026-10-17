import type { VovkJSONSchemaBase } from '../types/json-schema.js';
import { createSampleBudget, type SampleBudget, spend } from './sample-budget.js';

// what a $ref gives where the schema repeats itself or the budget is spent: an object leaves the property out and an
// array the item, so the sample still fits the type
const NO_VALUE = Symbol('no value');

export function schemaToObject(schema: VovkJSONSchemaBase, rootSchema?: VovkJSONSchemaBase): unknown {
  const value = toValue(schema, rootSchema, new Set(), createSampleBudget());
  return value === NO_VALUE ? null : value;
}

function toValue(
  schema: VovkJSONSchemaBase,
  rootSchema: VovkJSONSchemaBase | undefined,
  seen: Set<string>,
  budget: SampleBudget
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
    return firstValue(schema.oneOf, rootSchema, seen, budget);
  }

  if (schema.anyOf && schema.anyOf.length > 0) {
    return firstValue(schema.anyOf, rootSchema, seen, budget);
  }

  if (schema.allOf && schema.allOf.length > 0) {
    const mergedSchema = schema.allOf.reduce(
      (acc: VovkJSONSchemaBase, s: VovkJSONSchemaBase) => Object.assign(acc, s),
      {}
    );
    return toValue(mergedSchema, rootSchema, seen, budget);
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

// the first branch that has a value: a branch that only repeats the schema has none
function firstValue(
  branches: VovkJSONSchemaBase[],
  rootSchema: VovkJSONSchemaBase,
  seen: Set<string>,
  budget: SampleBudget
): unknown {
  for (const branch of branches) {
    const value = toValue(branch, rootSchema, seen, budget);
    if (value !== NO_VALUE) return value;
  }
  return NO_VALUE;
}

function handleRef(ref: string, rootSchema: VovkJSONSchemaBase, seen: Set<string>, budget: SampleBudget): unknown {
  // a ref already being expanded means the schema is circular, stop instead of recursing forever
  if (seen.has(ref) || !spend(budget)) return NO_VALUE;

  const path = ref.split('/').slice(1) as (keyof VovkJSONSchemaBase)[];
  let current = rootSchema;
  for (const segment of path) {
    current = current[segment];
    if (current === undefined) {
      return null;
    }
  }

  return toValue(current, rootSchema, new Set(seen).add(ref), budget);
}

// a sample string the length limits allow
function handleString(schema: VovkJSONSchemaBase): string {
  const value = stringSample(schema);
  const { minLength = 0, maxLength = Infinity } = schema;
  return value.padEnd(minLength, value).slice(0, Math.max(maxLength, 1));
}

function stringSample(schema: VovkJSONSchemaBase): string {
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
        const value = toValue(propSchema, rootSchema, seen, budget);
        if (value !== NO_VALUE) result[key] = value;
      }
    }
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    const value = toValue(schema.additionalProperties, rootSchema, seen, budget);
    if (value !== NO_VALUE) result.additionalProp = value;
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
      const item = toValue(itemSchema, rootSchema, seen, budget);
      if (item === NO_VALUE) break;
      items.push(item);
    }
    return items;
  }

  return [];
}
