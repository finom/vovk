import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import upperFirst from 'lodash/upperFirst.js';
import camelCase from 'lodash/camelCase.js';

interface CompileOptions {
  name: string;
  schema: JSONSchema7 & { components?: OpenAPIObject['components'] };
  refs?: Map<string, JSONSchema7>;
  dontCreateRefTypes?: boolean; // New option
}

interface CompileContext {
  refs: Map<string, JSONSchema7>;
  compiledRefs: Map<string, string>;
  refsInProgress: Set<string>;
}

export function compileTs(options: CompileOptions): string {
  const context: CompileContext = {
    refs: options.refs || new Map(),
    compiledRefs: new Map(),
    refsInProgress: new Set(),
  };

  // Collect all definitions from the schema
  collectDefinitions(options.schema, context.refs);

  // Ensure the main type name is valid
  const mainTypeName = sanitizeTypeName(options.name);
  const mainType = compileSchema(options.schema, mainTypeName, context);

  // Compile all referenced types, unless dontCreateRefTypes is set
  const compiledRefs = options.dontCreateRefTypes
    ? ''
    : Array.from(context.compiledRefs.entries())
        .map(([, typeDecl]) => typeDecl)
        .join('\n\n');

  return compiledRefs
    ? `${compiledRefs}\n\n${options.schema.description ? `/** ${escapeJSDocComment(options.schema.description)} */\n` : ''}export type ${mainTypeName} = ${mainType};`
    : `${options.schema.description ? `/** ${escapeJSDocComment(options.schema.description)} */\n` : ''}export type ${mainTypeName} = ${mainType};`;
}

function collectDefinitions(schema: JSONSchema7, refs: Map<string, JSONSchema7>) {
  // Collect from $defs
  if (schema.$defs) {
    Object.entries(schema.$defs).forEach(([key, def]) => {
      if (typeof def === 'object') {
        refs.set(`#/$defs/${key}`, def);
      }
    });
  }

  // Collect from definitions (older spec)
  if (schema.definitions) {
    Object.entries(schema.definitions).forEach(([key, def]) => {
      if (typeof def === 'object') {
        refs.set(`#/definitions/${key}`, def);
      }
    });
  }

  // Collect from components/schemas (OpenAPI spec)
  if ((schema as { components: OpenAPIObject['components'] })?.components?.schemas) {
    Object.entries((schema as { components: OpenAPIObject['components'] })?.components?.schemas ?? {}).forEach(
      ([key, def]) => {
        if (typeof def === 'object') {
          refs.set(`#/components/schemas/${key}`, def);
        }
      }
    );
  }

  // Recursively collect from nested schemas
  const schemasToProcess: JSONSchema7[] = [];

  if (schema.properties) {
    schemasToProcess.push(...Object.values(schema.properties).filter(isSchema));
  }
  if (schema.items) {
    if (Array.isArray(schema.items)) {
      schemasToProcess.push(...schema.items.filter(isSchema));
    } else if (isSchema(schema.items)) {
      schemasToProcess.push(schema.items);
    }
  }
  if (schema.additionalProperties && isSchema(schema.additionalProperties)) {
    schemasToProcess.push(schema.additionalProperties);
  }
  if (schema.allOf) schemasToProcess.push(...schema.allOf.filter(isSchema));
  if (schema.anyOf) schemasToProcess.push(...schema.anyOf.filter(isSchema));
  if (schema.oneOf) schemasToProcess.push(...schema.oneOf.filter(isSchema));

  schemasToProcess.forEach((s) => collectDefinitions(s, refs));
}

function isSchema(value: JSONSchema7Definition | boolean): value is JSONSchema7 {
  return typeof value === 'object' && !Array.isArray(value);
}

function compileSchema(schema: JSONSchema7Definition | boolean, name: string, context: CompileContext): string {
  if (typeof schema === 'boolean') {
    return schema ? 'any' : 'never';
  }

  // Handle x-tsType extension
  if ('x-tsType' in schema && typeof schema['x-tsType'] === 'string') {
    return schema['x-tsType'];
  }

  // Handle $ref
  if (schema.$ref) {
    return handleRef(schema.$ref, context);
  }

  // Handle combinators
  if (schema.allOf) {
    return handleAllOf(schema.allOf, name, context);
  }
  if (schema.anyOf) {
    return handleAnyOf(schema.anyOf, name, context);
  }
  if (schema.oneOf) {
    return handleOneOf(schema.oneOf, name, context);
  }

  // Handle type-specific compilation
  if (schema.enum) {
    return handleEnum(schema.enum);
  }

  if (schema.const !== undefined) {
    return handleConst(schema.const);
  }

  if (!schema.type) {
    // No type specified, could be object
    if (schema.properties || schema.additionalProperties) {
      return handleObject(schema, name, context);
    }
    return 'any';
  }

  if (Array.isArray(schema.type)) {
    return schema.type.map((t) => compileSchemaWithType({ ...schema, type: t }, name, context)).join(' | ');
  }

  return compileSchemaWithType(schema, name, context);
}

function compileSchemaWithType(schema: JSONSchema7, name: string, context: CompileContext): string {
  switch (schema.type) {
    case 'null':
      return 'null';
    case 'boolean':
      return 'boolean';
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'integer':
      return 'number';
    case 'array':
      return handleArray(schema, name, context);
    case 'object':
      return handleObject(schema, name, context);
    default:
      return 'any';
  }
}

function handleRef(ref: string, context: CompileContext): string {
  const typeName = refToTypeName(ref);

  // Check if we're already compiling this ref (circular reference)
  if (context.refsInProgress.has(ref)) {
    return typeName;
  }

  // Check if already compiled
  if (context.compiledRefs.has(ref)) {
    return typeName;
  }

  // Find the referenced schema
  const referencedSchema = context.refs.get(ref);
  if (!referencedSchema) {
    return 'any'; // Reference not found
  }

  // Mark as in progress
  context.refsInProgress.add(ref);

  // Compile the referenced schema
  const compiledType = compileSchema(referencedSchema, typeName, context);
  const description = referencedSchema.description
    ? `/** ${escapeJSDocComment(referencedSchema.description)} */\n`
    : '';
  context.compiledRefs.set(ref, `${description}export type ${typeName} = ${compiledType};`);

  // Mark as completed
  context.refsInProgress.delete(ref);

  return typeName;
}

function handleAllOf(schemas: JSONSchema7Definition[], name: string, context: CompileContext): string {
  const types = schemas.map((s, i) => compileSchema(s, sanitizeTypeName(`${name}-all-of-${i}`), context));

  // For allOf, we need to intersect types
  // If they're all objects, we can merge them properly
  const objectTypes = types.filter((t) => t.startsWith('{') && t.endsWith('}'));
  if (objectTypes.length === types.length) {
    // Merge object types
    const merged = objectTypes.map((t) => t.slice(1, -1).trim()).filter((t) => t.length > 0);
    return merged.length > 0 ? `{ ${merged.join('; ')} }` : '{}';
  }

  return types.join(' & ');
}

function handleAnyOf(schemas: JSONSchema7Definition[], name: string, context: CompileContext): string {
  const types = schemas.map((s, i) => compileSchema(s, sanitizeTypeName(`${name}-any-of-${i}`), context));
  return types.join(' | ');
}

function handleOneOf(schemas: JSONSchema7Definition[], name: string, context: CompileContext): string {
  // For TypeScript, oneOf behaves like anyOf
  const types = schemas.map((s, i) => compileSchema(s, sanitizeTypeName(`${name}-one-of-${i}`), context));
  return types.join(' | ');
}

function handleEnum(enumValues: unknown[]): string {
  return enumValues.map((v) => JSON.stringify(v)).join(' | ');
}

function handleConst(value: unknown): string {
  return JSON.stringify(value);
}

function handleArray(schema: JSONSchema7, name: string, context: CompileContext): string {
  if (!schema.items) {
    return 'any[]';
  }

  if (Array.isArray(schema.items)) {
    // Tuple (ignoring min/max as requested)
    const types = schema.items.map((item, i) => compileSchema(item, `${name}Item${i}`, context));
    return `[${types.join(', ')}]`;
  }

  const itemType = compileSchema(schema.items, `${name}Item`, context);
  return `${wrapUnionType(itemType)}[]`;
}

function handleObject(schema: JSONSchema7, name: string, context: CompileContext): string {
  const props: string[] = [];

  // Handle known properties
  if (schema.properties) {
    const required = new Set(schema.required || []);

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (!isSchema(propSchema)) continue;

      const isRequired = required.has(propName);
      // Ensure the generated type name for nested properties is valid
      const nestedTypeName = sanitizeTypeName(`${name}-${propName}`);
      const propType = compileSchema(propSchema, nestedTypeName, context);
      const safePropName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(propName) ? propName : `"${propName}"`;
      // Add JSDoc comment if description is present
      const comment = propSchema.description ? `\n/** ${escapeJSDocComment(propSchema.description)} */\n` : '';
      props.push(`${comment}${safePropName}${isRequired ? '' : '?'}: ${propType}`);
    }
  }

  // Handle additional properties
  if (schema.additionalProperties === true) {
    props.push('[key: string]: any');
  } else if (schema.additionalProperties && isSchema(schema.additionalProperties)) {
    const additionalTypeName = sanitizeTypeName(`${name}-additional`);
    const additionalType = compileSchema(schema.additionalProperties, additionalTypeName, context);
    props.push(`[key: string]: ${additionalType}`);
  }

  // Handle pattern properties
  if (schema.patternProperties) {
    // For simplicity, treat pattern properties as string index signature
    const patternTypes = Object.values(schema.patternProperties)
      .filter(isSchema)
      .map((s, i) => compileSchema(s, sanitizeTypeName(`${name}-pattern-${i}`), context));

    if (patternTypes.length > 0) {
      props.push(`[key: string]: ${patternTypes.join(' | ')}`);
    }
  }

  return props.length > 0 ? `{ ${props.join('; ')} }` : '{}';
}

function refToTypeName(ref: string): string {
  // Extract the last part of the reference as the type name
  const parts = ref.split('/');
  const name = parts[parts.length - 1];
  // Convert kebab-case to PascalCase
  return upperFirst(camelCase(name));
}

function wrapUnionType(type: string): string {
  // Wrap union types in parentheses for array types
  return type.includes('|') ? `(${type})` : type;
}

function sanitizeTypeName(name: string): string {
  return upperFirst(camelCase(name));
}

// Utility function to escape JSDoc comment terminators in descriptions
function escapeJSDocComment(description: string | undefined): string {
  if (!description) return '';
  return description.replace(/\*\//g, '*\\/');
}
