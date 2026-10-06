import type { VovkJSONSchemaBase } from '../types/json-schema.js';
import { createSampleBudget, type SampleBudget, spend } from './sample-budget.js';

interface SamplerOptions {
  comment?: '//' | '#';
  stripQuotes?: boolean;
  indent?: number;
  nestingIndent?: number;
  ignoreBinary?: boolean;
  // Python spells true, false and null as True, False and None
  python?: boolean;
}

// a line comment in a TypeScript, Python or Rust sample ends at one of these
export const LINE_BREAK = /\r\n|[\n\r\u2028\u2029]/;

// what toCodeString looks at in JSON: a \u escape, any other escape, and a raw control or bidirectional character
const CODE_STRING_ESCAPE = /\\u([0-9a-f]{4})|\\.|[\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g;

// a TypeScript and Rust string literal: JSON's escapes, with \u{...} for \b, \f, \u00XX (Rust has none of them) and
// a control or bidirectional character; a lone surrogate, which no Rust string holds, becomes U+FFFD
export function toCodeString(value: string, quote: '"' | "'" = '"'): string {
  const escaped = JSON.stringify(value)
    .slice(1, -1)
    .replace(CODE_STRING_ESCAPE, (sequence, hex: string | undefined) => {
      if (hex) return /^d[89a-f]/.test(hex) ? '\\u{fffd}' : `\\u{${hex}}`;
      if (sequence === '\\b') return '\\u{8}';
      if (sequence === '\\f') return '\\u{c}';
      return sequence.length === 1 ? `\\u{${sequence.charCodeAt(0).toString(16)}}` : sequence;
    });
  return quote === '"' ? `"${escaped}"` : `'${escaped.replace(/\\"/g, '"').replace(/'/g, "\\'")}'`;
}

// a string literal in Python: JSON's escapes are Python's; in single quotes a ' is escaped instead of a "
export function toPythonString(value: string, quote: '"' | "'" = '"'): string {
  const json = JSON.stringify(value);
  return quote === '"' ? json : `'${json.slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'")}'`;
}

// a third-party OpenAPI document may hold a description that isn't a string, a sample leaves it out
export const getDescription = (schema: VovkJSONSchemaBase | undefined): string | undefined =>
  typeof schema?.description === 'string' ? schema.description : undefined;

export function schemaToCode(
  schema: VovkJSONSchemaBase,
  options: SamplerOptions,
  rootSchema?: VovkJSONSchemaBase
): string {
  const {
    comment = '//',
    stripQuotes = false,
    indent = 0,
    nestingIndent = 4,
    ignoreBinary = false,
    python = false,
  } = options;

  if (!schema || typeof schema !== 'object') return python ? 'None' : 'null';

  rootSchema = rootSchema || schema;

  const sampleValue = getSampleValue(schema, rootSchema, ignoreBinary);

  return formatWithDescriptions(
    sampleValue,
    schema,
    rootSchema,
    comment,
    stripQuotes,
    indent,
    nestingIndent,
    ignoreBinary,
    true, // isTopLevel
    python
  );
}

export function getSampleValue(
  schema: VovkJSONSchemaBase,
  rootSchema?: VovkJSONSchemaBase,
  ignoreBinary?: boolean,
  seen: Set<string> = new Set(),
  budget: SampleBudget = createSampleBudget()
): unknown {
  if (!schema || typeof schema !== 'object') return null;
  rootSchema = rootSchema || schema;

  if (ignoreBinary && schema.type === 'string' && schema.format === 'binary') {
    return undefined;
  }

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
    return handleRef(schema.$ref, rootSchema, ignoreBinary, seen, budget);
  }

  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  if (schema.oneOf && schema.oneOf.length > 0) {
    return getSampleValue(schema.oneOf[0], rootSchema, ignoreBinary, seen, budget);
  }

  if (schema.anyOf && schema.anyOf.length > 0) {
    return getSampleValue(schema.anyOf[0], rootSchema, ignoreBinary, seen, budget);
  }

  if (schema.allOf && schema.allOf.length > 0) {
    const mergedSchema = schema.allOf.reduce(
      (acc: VovkJSONSchemaBase, s: VovkJSONSchemaBase) => Object.assign(acc, s),
      {}
    );
    return getSampleValue(mergedSchema, rootSchema, ignoreBinary, seen, budget);
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
        return handleObject(schema, rootSchema, ignoreBinary, seen, budget);
      case 'array':
        return handleArray(schema, rootSchema, ignoreBinary, seen, budget);
      case 'null':
        return null;
      default:
        return null;
    }
  }

  if (schema.properties) {
    return handleObject(schema, rootSchema, ignoreBinary, seen, budget);
  }

  return null;
}

function formatWithDescriptions(
  value: unknown,
  schema: VovkJSONSchemaBase,
  rootSchema: VovkJSONSchemaBase,
  comment: string,
  stripQuotes: boolean,
  indent: number,
  nestingIndent: number,
  ignoreBinary: boolean,
  isTopLevel: boolean,
  python: boolean
): string {
  const indentStr = ' '.repeat(indent);
  const nestIndentStr = ' '.repeat(nestingIndent);

  // an ignored binary field
  if (value === undefined) {
    return '';
  }

  if (value === null) {
    return python ? 'None' : 'null';
  }

  if (python && typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }

  if (typeof value === 'string') return python ? toPythonString(value) : toCodeString(value);

  if (typeof value !== 'object' || value instanceof Date) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';

    const items = value.map((item) => {
      const itemSchema = schema.items && typeof schema.items === 'object' ? schema.items : ({} as VovkJSONSchemaBase);
      const formattedItem = formatWithDescriptions(
        item,
        itemSchema,
        rootSchema,
        comment,
        stripQuotes,
        indent + nestingIndent,
        nestingIndent,
        ignoreBinary,
        false,
        python
      );
      return `${indentStr}${nestIndentStr}${formattedItem}`;
    });

    return `[\n${items.join(',\n')}\n${indentStr}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';

    const formattedEntries: string[] = [];

    const description = getDescription(schema);
    if (isTopLevel && schema.type === 'object' && description) {
      const descLines = description.split(LINE_BREAK);
      formattedEntries.push(`${indentStr}${nestIndentStr}${comment} -----`);
      descLines.forEach((line) => {
        formattedEntries.push(`${indentStr}${nestIndentStr}${comment} ${line.trim()}`);
      });
      formattedEntries.push(`${indentStr}${nestIndentStr}${comment} -----`);
    }

    entries.forEach(([key, val], index) => {
      const propSchema = schema.properties?.[key] ?? ({} as VovkJSONSchemaBase);

      let resolvedPropSchema = propSchema;
      if (propSchema.$ref) {
        resolvedPropSchema = resolveRef(propSchema.$ref, rootSchema);
      }

      const propDescription = getDescription(resolvedPropSchema);
      if (propDescription) {
        const descLines = propDescription.split(LINE_BREAK);
        descLines.forEach((line) => {
          formattedEntries.push(`${indentStr}${nestIndentStr}${comment} ${line.trim()}`);
        });
      }

      const quotedKey = python ? toPythonString(key) : toCodeString(key);
      const formattedKey = stripQuotes && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(key) ? key : quotedKey;

      const formattedValue = formatWithDescriptions(
        val,
        resolvedPropSchema,
        rootSchema,
        comment,
        stripQuotes,
        indent + nestingIndent,
        nestingIndent,
        ignoreBinary,
        false,
        python
      );

      formattedEntries.push(
        `${indentStr}${nestIndentStr}${formattedKey}: ${formattedValue}${index < entries.length - 1 ? ',' : ''}`
      );
    });

    return `{\n${formattedEntries.join('\n')}\n${indentStr}}`;
  }

  return JSON.stringify(value);
}

function resolveRef(ref: string, rootSchema: VovkJSONSchemaBase): VovkJSONSchemaBase {
  const path = ref.split('/').slice(1) as (keyof VovkJSONSchemaBase)[];
  let current = rootSchema;
  for (const segment of path) {
    current = current[segment];
    if (current === undefined) {
      return {};
    }
  }
  return current;
}

function handleRef(
  ref: string,
  rootSchema: VovkJSONSchemaBase,
  ignoreBinary: boolean | undefined,
  seen: Set<string>,
  budget: SampleBudget
): unknown {
  // a ref already being expanded means the schema is circular, stop instead of recursing forever
  if (seen.has(ref) || !spend(budget)) return null;
  const resolved = resolveRef(ref, rootSchema);
  return getSampleValue(resolved, rootSchema, ignoreBinary, new Set(seen).add(ref), budget);
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
      case 'binary':
        return 'binary-data';
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
  ignoreBinary: boolean | undefined,
  seen: Set<string>,
  budget: SampleBudget
): object {
  const result: Record<string, unknown> = {};

  if (schema.properties) {
    const required = schema.required || [];

    for (const [key, propSchema] of Object.entries<VovkJSONSchemaBase>(schema.properties)) {
      if (required.includes(key) || required.length === 0) {
        const value = getSampleValue(propSchema, rootSchema, ignoreBinary, seen, budget);
        // undefined is an ignored binary field
        if (value !== undefined) {
          result[key] = value;
        }
      }
    }
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    const value = getSampleValue(schema.additionalProperties, rootSchema, ignoreBinary, seen, budget);
    if (value !== undefined) {
      result.additionalProp = value;
    }
  }

  return result;
}

function handleArray(
  schema: VovkJSONSchemaBase,
  rootSchema: VovkJSONSchemaBase,
  ignoreBinary: boolean | undefined,
  seen: Set<string>,
  budget: SampleBudget
) {
  if (schema.items) {
    // true allows any item, false none
    if (typeof schema.items === 'boolean') {
      return schema.items ? [null] : [];
    }

    const itemSchema = schema.items;

    if (ignoreBinary && itemSchema.type === 'string' && itemSchema.format === 'binary') {
      return undefined;
    }

    const minItems = schema.minItems || 1;
    const numItems = Math.min(minItems, 3);

    const items: unknown[] = [];
    let ignoredItems = 0;
    for (let i = 0; i < numItems && spend(budget); i++) {
      const item = getSampleValue(itemSchema, rootSchema, ignoreBinary, seen, budget);
      // an ignored binary item
      if (item === undefined) ignoredItems++;
      else items.push(item);
    }

    // a list of only ignored binary items is left out too
    if (items.length === 0 && ignoredItems > 0) {
      return undefined;
    }

    return items;
  }

  return [];
}
