import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { toTypeName } from 'vovk/internal';

interface CompileOptions {
  name: string;
  schema: (JSONSchema7 & { components?: OpenAPIObject['components'] }) | boolean;
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

  const { schema } = options;
  // Collect all definitions from the schema
  if (isSchema(schema)) collectDefinitions(schema, context.refs);

  // Ensure the main type name is valid
  const mainTypeName = sanitizeTypeName(options.name);
  const mainType = compileSchema(schema, mainTypeName, context);

  // Compile all referenced types, unless dontCreateRefTypes is set
  const compiledRefs = options.dontCreateRefTypes
    ? ''
    : Array.from(context.compiledRefs.entries())
        .map(([, typeDecl]) => typeDecl)
        .join('\n\n');

  const comment = isSchema(schema) && schema.description ? `/** ${escapeJSDocComment(schema.description)} */\n` : '';
  return compiledRefs
    ? `${compiledRefs}\n\n${comment}export type ${mainTypeName} = ${mainType};`
    : `${comment}export type ${mainTypeName} = ${mainType};`;
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

  schemasToProcess.forEach((s) => {
    collectDefinitions(s, refs);
  });
}

function isSchema(value: JSONSchema7Definition | boolean): value is JSONSchema7 {
  return typeof value === 'object' && !Array.isArray(value);
}

function compileSchema(schema: JSONSchema7Definition | boolean, name: string, context: CompileContext): string {
  // true allows any value, false none
  if (typeof schema === 'boolean') {
    return schema ? 'unknown' : 'never';
  }

  const type = compileSchemaType(schema, name, context);
  // OpenAPI 3.0 has no null type, a schema allows null with `nullable: true`
  const isNullable = (schema as { nullable?: unknown }).nullable === true;
  return isNullable && type !== 'any' && type !== 'null' ? `${type} | null` : type;
}

function compileSchemaType(schema: JSONSchema7, name: string, context: CompileContext): string {
  // Handle x-tsType extension
  if ('x-tsType' in schema && typeof schema['x-tsType'] === 'string') {
    return schema['x-tsType'];
  }

  // Handle $ref
  if (schema.$ref) {
    return handleRef(schema.$ref, context);
  }

  // Handle combinators, properties next to them apply as well
  const combined = [
    schema.allOf && handleAllOf(schema.allOf, name, context),
    schema.anyOf && handleAnyOf(schema.anyOf, name, context),
    schema.oneOf && handleOneOf(schema.oneOf, name, context),
  ].filter((type): type is string => typeof type === 'string');
  if (combined.length > 0) {
    const hasOwnMembers =
      !!schema.properties ||
      !!schema.patternProperties ||
      (schema.additionalProperties !== undefined && schema.additionalProperties !== false);
    return intersect(hasOwnMembers ? [...combined, handleObject(schema, name, context)] : combined);
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
  return intersect(schemas.map((s, i) => compileSchema(s, sanitizeTypeName(`${name}-all-of-${i}`), context)));
}

// `any` would swallow the other members, a member without a type adds no constraint
function intersect(types: string[]): string {
  const members = types.filter((type) => type !== 'any');
  if (members.length === 0) return 'any';
  return members.length === 1 ? members[0] : members.map(wrapUnionType).join(' & ');
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
  // a union or an intersection binds looser than []
  return /[|&]/.test(itemType) ? `(${itemType})[]` : `${itemType}[]`;
}

function handleObject(schema: JSONSchema7, name: string, context: CompileContext): string {
  const props: string[] = [];
  // TypeScript checks every declared property against the index signature
  const propTypes: string[] = [];

  // Handle known properties
  if (schema.properties) {
    const required = new Set(schema.required || []);

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (!isSchema(propSchema)) continue;

      const isRequired = required.has(propName);
      // Ensure the generated type name for nested properties is valid
      const nestedTypeName = sanitizeTypeName(`${name}-${propName}`);
      const propType = compileSchema(propSchema, nestedTypeName, context);
      const safePropName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(propName) ? propName : JSON.stringify(propName);
      // Add JSDoc comment if description is present
      const comment = propSchema.description ? `\n/** ${escapeJSDocComment(propSchema.description)} */\n` : '';
      props.push(`${comment}${safePropName}${isRequired ? '' : '?'}: ${propType}`);
      propTypes.push(propType, ...(isRequired ? [] : ['undefined']));
    }
  }

  // additional and pattern properties share one string index signature
  const indexTypes: string[] = [];
  if (schema.additionalProperties === true) {
    indexTypes.push('any');
  } else if (schema.additionalProperties && isSchema(schema.additionalProperties)) {
    const additionalTypeName = sanitizeTypeName(`${name}-additional`);
    indexTypes.push(compileSchema(schema.additionalProperties, additionalTypeName, context));
  }
  if (schema.patternProperties) {
    indexTypes.push(
      ...Object.values(schema.patternProperties)
        .filter(isSchema)
        .map((s, i) => compileSchema(s, sanitizeTypeName(`${name}-pattern-${i}`), context))
    );
  }
  if (indexTypes.length > 0) {
    const types = indexTypes.includes('any') ? ['any'] : [...new Set([...indexTypes, ...propTypes])];
    props.push(`[key: string]: ${types.join(' | ')}`);
  }

  return props.length > 0 ? `{ ${props.join('; ')} }` : '{}';
}

function refToTypeName(ref: string): string {
  // Extract the last part of the reference as the type name
  const parts = ref.split('/');
  return sanitizeTypeName(parts[parts.length - 1]);
}

function wrapUnionType(type: string): string {
  // Wrap union types in parentheses for array and intersection types
  return type.includes('|') ? `(${type})` : type;
}

// PascalCase, as vovk names the x-tsType of a mixin component ref;
// a name that already is one is kept, so a name the caller made unique stays unique
function sanitizeTypeName(name: string): string {
  return /^[\p{Lu}\p{Lt}\p{Lo}\p{Lm}\p{Nl}_]\p{ID_Continue}*$/u.test(name) ? name : toTypeName(name);
}

// Utility function to escape JSDoc comment terminators in descriptions
function escapeJSDocComment(description: string | undefined): string {
  if (!description) return '';
  return description.replace(/\*\//g, '*\\/');
}
