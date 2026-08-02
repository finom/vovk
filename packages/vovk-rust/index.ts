import type { VovkJSONSchemaBase } from 'vovk';

// Rust reserved keywords that cannot be used as identifiers
const RUST_KEYWORDS = new Set([
  'as',
  'break',
  'const',
  'continue',
  'crate',
  'else',
  'enum',
  'extern',
  'false',
  'fn',
  'for',
  'if',
  'impl',
  'in',
  'let',
  'loop',
  'match',
  'mod',
  'move',
  'mut',
  'pub',
  'ref',
  'return',
  'self',
  'Self',
  'static',
  'struct',
  'super',
  'trait',
  'true',
  'type',
  'unsafe',
  'use',
  'where',
  'while',
  'async',
  'await',
  'dyn',
  'abstract',
  'become',
  'box',
  'do',
  'final',
  'macro',
  'override',
  'priv',
  'typeof',
  'unsized',
  'virtual',
  'yield',
  'try',
  'union',
]);

/**
 * Determine the body kind from the schema's x-contentType and format fields.
 * Returns 'none', 'form', 'binary', 'text', or 'json'.
 */
export function getBodyKind(schema: VovkJSONSchemaBase | undefined): 'none' | 'form' | 'binary' | 'text' | 'json' {
  if (!schema) return 'none';
  const ct = schema['x-contentType'] as string[] | undefined;
  if (ct?.includes('multipart/form-data') || ct?.includes('application/x-www-form-urlencoded')) return 'form';
  if (schema.format === 'binary' || schema.contentEncoding === 'binary') return 'binary';
  if (ct?.some((c: string) => c.startsWith('text/'))) return 'text';
  // a declared non JSON content type on a scalar body means raw bytes, e.g. application/octet-stream or image/png
  const isStructured = schema.type === 'object' || schema.type === 'array' || !!schema.properties;
  const isJSONContentType = (c: string) => c === '*/*' || c === 'application/json' || c.endsWith('+json');
  if (!isStructured && ct?.length && !ct.some(isJSONContentType)) return 'binary';
  return 'json';
}

// Helper function for indentation
export function indent(level: number, pad: number = 0): string {
  return ' '.repeat(pad + level * 2);
}

// Generate documentation comments from title and description
export function generateDocComment(schema: VovkJSONSchemaBase, level: number, pad: number = 0): string {
  if (!schema?.title && !schema?.description) return '';

  let comment = '';

  if (schema.title) {
    comment += `${indent(level, pad)}/// ${schema.title}\n`;
    if (schema.description) {
      comment += `${indent(level, pad)}///\n`;
    }
  }

  if (schema.description) {
    // Split description into lines and add /// to each line
    const lines = schema.description.split('\n');
    for (const line of lines) {
      comment += `${indent(level, pad)}/// ${line}\n`;
    }
  }

  return comment;
}

// Resolve $ref paths in the schema, "seen" guards $ref chains that point back at themselves
export function resolveRef(
  ref: string,
  rootSchema: VovkJSONSchemaBase,
  seen: Set<string> = new Set()
): VovkJSONSchemaBase | undefined {
  if (seen.has(ref)) return undefined;
  seen.add(ref);

  // Format: #/$defs/TypeName or #/components/schemas/TypeName or #/definitions/TypeName etc.
  const parts = ref.split('/').filter((part) => part && part !== '#');

  // Standard path traversal
  let current = rootSchema;
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      // If standard traversal fails and the path might be a definition reference
      if (parts.includes('definitions') && rootSchema.definitions) {
        // Try to access the definition directly using the last part as the key
        const definitionKey = parts[parts.length - 1];
        return rootSchema.definitions[definitionKey];
      }
      return undefined;
    }
    current = current[part as keyof VovkJSONSchemaBase];
  }

  // If the resolved schema also has a $ref, resolve it recursively
  if (current?.$ref) {
    return resolveRef(current.$ref, rootSchema, seen);
  }

  return current;
}

// $defs, definitions and components/schemas entries all become top level named types
const namedSchemasCache = new WeakMap<VovkJSONSchemaBase, Record<string, VovkJSONSchemaBase>>();

export function getNamedSchemas(rootSchema: VovkJSONSchemaBase | undefined): Record<string, VovkJSONSchemaBase> {
  if (!rootSchema || typeof rootSchema !== 'object') return {};
  const cached = namedSchemasCache.get(rootSchema);
  if (cached) return cached;

  const components = (rootSchema as { components?: { schemas?: Record<string, VovkJSONSchemaBase> } }).components
    ?.schemas;
  const raw: Record<string, VovkJSONSchemaBase> = {
    ...components,
    ...rootSchema.definitions,
    ...rootSchema.$defs,
  };
  // a spec may name a schema "google.protobuf.Timestamp", keyed by the Rust name so
  // emission and references agree, serde keeps the original name on the wire
  const named = Object.fromEntries(Object.entries(raw).map(([name, schema]) => [toRustIdent(name), schema]));

  namedSchemasCache.set(rootSchema, named);
  return named;
}

// "#/$defs/User" => "User", null when the target is not a named type
export function refToName(ref: string | undefined, rootSchema: VovkJSONSchemaBase): string | null {
  if (!ref?.startsWith('#/')) return null;
  const name = ref.split('/').pop();
  const ident = name ? toRustIdent(name) : null;
  return ident && getNamedSchemas(rootSchema)[ident] ? ident : null;
}

// references that are not behind a Vec, a cycle among them means an infinitely sized Rust type
const directEdgesCache = new WeakMap<VovkJSONSchemaBase, Map<string, Set<string>>>();

function getDirectEdges(rootSchema: VovkJSONSchemaBase): Map<string, Set<string>> {
  const cached = directEdgesCache.get(rootSchema);
  if (cached) return cached;

  const edges = new Map<string, Set<string>>();

  const walk = (schema: VovkJSONSchemaBase | undefined, from: string, seen: Set<VovkJSONSchemaBase>) => {
    if (!schema || typeof schema !== 'object' || seen.has(schema)) return;
    seen.add(schema);

    const name = refToName(schema.$ref, rootSchema);
    if (name) {
      const targets = edges.get(from) ?? new Set<string>();
      targets.add(name);
      edges.set(from, targets);
      return;
    }

    // items sit behind a Vec, which already breaks the cycle
    for (const sub of [
      ...Object.values(schema.properties ?? {}),
      ...(schema.allOf ?? []),
      ...(schema.anyOf ?? []),
      ...(schema.oneOf ?? []),
    ]) {
      walk(sub, from, seen);
    }
  };

  for (const [name, schema] of Object.entries(getNamedSchemas(rootSchema))) {
    walk(schema, name, new Set());
  }

  directEdgesCache.set(rootSchema, edges);
  return edges;
}

// a field needs a Box when its target can reach back to the type that holds it
export function refNeedsBox(from: string | null, to: string, rootSchema: VovkJSONSchemaBase): boolean {
  if (!from) return false;

  const edges = getDirectEdges(rootSchema);
  const stack = [to];
  const visited = new Set<string>();

  while (stack.length) {
    const current = stack.pop() as string;
    if (current === from) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const next of edges.get(current) ?? []) stack.push(next);
  }

  return false;
}

// named types live at the top of the handler module, nested structs reach them through super::
function superPrefix(path: string[]): string {
  return 'super::'.repeat(Math.max(0, path.length - 1));
}

// turn any string into a valid Rust identifier, serde keeps the original name on the wire
export function toRustIdent(value: unknown, used?: Set<string>): string {
  let ident = String(value ?? '').replace(/[^a-zA-Z0-9_]/g, '_');
  // "_" alone is reserved, and "" has nothing left to name
  if (!ident || /^_+$/.test(ident)) ident = `Empty${ident}`;
  if (/^[0-9]/.test(ident)) ident = `_${ident}`;
  if (RUST_KEYWORDS.has(ident)) ident = `${ident}_`;

  if (used) {
    let candidate = ident;
    let i = 2;
    while (used.has(candidate)) {
      candidate = `${ident}_${i++}`;
    }
    used.add(candidate);
    return candidate;
  }

  return ident;
}

// Generate module path for nested types
export function getModulePath(path: string[]): string {
  if (path.length <= 1) return path[0];

  let result = '';
  for (let i = 0; i < path.length - 1; i++) {
    result += `${path[i]}_::`;
  }
  result += path[path.length - 1];
  return result;
}

// Convert JSON Schema type to Rust type
export function toRustType(
  schema: VovkJSONSchemaBase,
  path: string[],
  rootSchema: VovkJSONSchemaBase = schema
): string {
  if (!schema) return 'String';

  // Handle $ref first
  if (schema.$ref) {
    const resolvedSchema = resolveRef(schema.$ref, rootSchema);
    if (resolvedSchema) {
      // Extract type name from ref path for better type naming
      const refName = schema.$ref.split('/').pop();
      // Use the ref name directly if it's a definition reference
      if (schema.$ref.includes('definitions/') || schema.$ref.includes('$defs/')) {
        return refName || 'String';
      }
      return toRustType(resolvedSchema, refName ? [...path.slice(0, -1), refName] : path, rootSchema);
    }
    return 'serde_json::Value'; // Fallback for unresolved $ref
  }

  // Check for enum without type (assume string)
  if (schema.enum) {
    if (schema.type === 'string' || !schema.type) {
      return `${getModulePath(path)}`;
    }
  }

  if (schema.type === 'string') {
    // Binary format or a non text content type maps to Vec<u8>
    if (getBodyKind(schema) === 'binary') {
      return 'Vec<u8>';
    }
    return 'String';
  } else if (schema.type === 'number' || schema.type === 'integer') {
    // Handle numeric types with constraints
    if (schema.type === 'integer') {
      // Determine integer type based on min/max constraints
      const min =
        typeof schema.minimum === 'number'
          ? schema.minimum
          : typeof schema.exclusiveMinimum === 'number'
            ? schema.exclusiveMinimum + 1
            : undefined;
      const max =
        typeof schema.maximum === 'number'
          ? schema.maximum
          : typeof schema.exclusiveMaximum === 'number'
            ? schema.exclusiveMaximum - 1
            : undefined;

      // Check if we need unsigned (no negative values)
      if (min !== undefined && min >= 0) {
        // Choose appropriate unsigned int size
        if (max !== undefined) {
          if (max <= 255) return 'u8';
          if (max <= 65535) return 'u16';
          if (max <= 4294967295) return 'u32';
        }
        return 'u64'; // Default unsigned
      } else {
        // Choose appropriate signed int size
        if (min !== undefined && max !== undefined) {
          const absMin = Math.abs(min);
          const absMax = Math.abs(max);
          const maxVal = Math.max(absMin - 1, absMax);

          if (maxVal <= 127) return 'i8';
          if (maxVal <= 32767) return 'i16';
          if (maxVal <= 2147483647) return 'i32';
        }
        return 'i64'; // Default signed
      }
    } else {
      // Floating point
      const hasLowRange =
        (schema.minimum !== undefined &&
          schema.maximum !== undefined &&
          Math.abs(schema.maximum - schema.minimum) <= 3.4e38) ||
        (schema.exclusiveMinimum !== undefined &&
          schema.exclusiveMaximum !== undefined &&
          Math.abs(schema.exclusiveMaximum - schema.exclusiveMinimum) <= 3.4e38);

      return hasLowRange ? 'f32' : 'f64';
    }
  } else if (schema.type === 'boolean') {
    return 'bool';
  } else if (schema.type === 'null') {
    return '()';
  } else if (schema.type === 'array') {
    if (schema.items && typeof schema.items !== 'boolean') {
      // Check if array items are objects that need special handling
      if (schema.items.type === 'object' || schema.items.properties || schema.items.$ref) {
        // For array of objects, reference the item type with proper module path
        // Find the parent module name to reference the item
        const parentName = path[path.length - 2] || path[0];
        return `Vec<${parentName}_::${path[path.length - 1]}Item>`;
      }
      const itemType = toRustType(schema.items, [...path, '_item'], rootSchema);
      return `Vec<${itemType}>`;
    }
    return 'Vec<String>';
  } else if (schema.type === 'object' || schema.properties) {
    // Handle empty objects
    if (schema.type === 'object' && (!schema.properties || Object.keys(schema.properties).length === 0)) {
      return 'serde_json::Value';
    }
    return path[path.length - 1];
  } else if (schema.anyOf || schema.oneOf || schema.allOf) {
    return `${getModulePath(path)}`;
  }

  return 'String'; // Default fallback
}

// Generate enum for string with enum values
export function generateEnum(schema: VovkJSONSchemaBase, name: string, level: number, pad: number = 0): string {
  const indentFn = (level: number) => ' '.repeat(pad + level * 2);
  let code = '';

  // Add documentation comments for the enum
  code += generateDocComment(schema, level, pad);

  code += `${indentFn(level)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
  code += `${indentFn(level)}#[allow(non_camel_case_types)]\n`;
  code += `${indentFn(level)}pub enum ${name} {\n`;

  const usedVariants = new Set<string>();

  schema.enum?.forEach((value: string) => {
    // enum values are free form, so the variant is sanitized and serde keeps the original name
    const variant = toRustIdent(value, usedVariants);

    code += `${indentFn(level + 1)}#[serde(rename = "${String(value ?? '').replace(/(["\\])/g, '\\$1')}")]\n`;
    code += `${indentFn(level + 1)}${variant},\n`;
  });

  code += `${indentFn(level)}}\n\n`;
  return code;
}

// Generate enum for anyOf/oneOf/allOf schemas
export function generateVariantEnum(
  schema: VovkJSONSchemaBase,
  name: string,
  path: string[],
  level: number,
  rootSchema: VovkJSONSchemaBase,
  pad: number = 0
): string {
  const indentFn = (level: number) => ' '.repeat(pad + level * 2);

  // Handle allOf separately - it should combine schemas rather than create variants
  if (schema.allOf) {
    return generateAllOfType(schema.allOf, name, path, level, rootSchema, pad);
  }

  const variants = schema.anyOf || schema.oneOf || [];
  let code = '';
  let nestedTypes = '';

  // Add documentation comments for the enum
  code += generateDocComment(schema, level, pad);

  code += `${indentFn(level)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
  code += `${indentFn(level)}#[allow(non_camel_case_types)]\n`;
  code += `${indentFn(level)}#[serde(untagged)]\n`;
  code += `${indentFn(level)}pub enum ${name} {\n`;

  variants.forEach((variant: VovkJSONSchemaBase, index: number) => {
    // Resolve $ref if present
    if (variant.$ref) {
      const resolved = resolveRef(variant.$ref, rootSchema);
      if (resolved) {
        variant = resolved;
      }
    }

    const variantName = `Variant${index}`;
    const variantPath = [...path, name, variantName];

    // If it's an object type, we need to create a separate struct
    if (variant.type === 'object' || variant.properties) {
      code += `${indentFn(level + 1)}${variantName}(${name}_::${variantName}),\n`;
      // Create a nested type definition to be added inside a sub-module
      nestedTypes += processObject(variant, variantPath, level + 1, rootSchema, pad);
    } else {
      // For simple types, we can include them directly in the enum
      const variantType = toRustType(variant, variantPath, rootSchema);
      code += `${indentFn(level + 1)}${variantName}(${variantType}),\n`;
    }
  });

  code += `${indentFn(level)}}\n\n`;

  // Add nested type definitions wrapped in a sub-module
  if (nestedTypes) {
    code += `${indentFn(level)}#[allow(non_snake_case)]\n`;
    code += `${indentFn(level)}pub mod ${name}_ {\n`;
    code += `${indentFn(level + 1)}use serde::{Serialize, Deserialize};\n\n`;
    code += nestedTypes;
    code += `${indentFn(level)}}\n`;
  }

  return code;
}

// Handle allOf schema by merging properties
export function generateAllOfType(
  schemas: VovkJSONSchemaBase[],
  name: string,
  path: string[],
  level: number,
  rootSchema: VovkJSONSchemaBase,
  pad: number = 0
): string {
  const mergedSchema: VovkJSONSchemaBase = {
    type: 'object',
    properties: {},
    required: [],
  };

  // Merge all schemas in allOf
  schemas.forEach((schema: VovkJSONSchemaBase) => {
    // Resolve $ref if present
    if (schema.$ref) {
      const resolved = resolveRef(schema.$ref, rootSchema);
      if (resolved) {
        schema = resolved;
      }
    }

    if (schema.properties) {
      mergedSchema.properties = {
        ...mergedSchema.properties,
        ...schema.properties,
      };
    }

    if (schema.required) {
      mergedSchema.required = [...(mergedSchema.required ?? []), ...schema.required];
    }
  });

  // Process the merged schema as a regular object
  return processObject(mergedSchema, [...path, name], level, rootSchema, pad);
}

// Process schema objects and generate Rust code
export function processObject(
  schema: VovkJSONSchemaBase,
  path: string[],
  level: number,
  rootSchema: VovkJSONSchemaBase = schema,
  pad: number = 0
): string {
  const indentFn = (level: number) => ' '.repeat(pad + level * 2);

  if (!schema) {
    return '';
  }

  // Handle empty objects
  if (schema.type === 'object' && (!schema.properties || Object.keys(schema.properties).length === 0)) {
    // Empty object is handled as serde_json::Value at the field level
    return '';
  }

  if (!schema.properties) {
    return '';
  }

  const currentName = path[path.length - 1];
  let code = '';

  // Add documentation comments for the struct
  code += generateDocComment(schema, level, pad);

  if (
    schema.type === 'object' &&
    (schema['x-contentType']?.includes('multipart/form-data') ||
      schema['x-contentType']?.includes('application/x-www-form-urlencoded'))
  ) {
    code += `${indentFn(level)}pub use reqwest::multipart::Form as ${currentName};\n`;
    return code;
  }
  // Generate struct
  code += `${indentFn(level)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
  code += `${indentFn(level)}#[allow(non_snake_case, non_camel_case_types)]\n`;
  code += `${indentFn(level)}pub struct ${currentName} {\n`;
  // the type that holds these fields, when it is a named type its own refs may cycle back to it
  const enclosingNamed = getNamedSchemas(rootSchema)[path[0]] ? path[0] : null;

  // property names are free form and two of them may sanitize alike, e.g. "foo-bar" and "foo.bar",
  // so each gets one ident that fields, nested types and their references all share
  const usedIdents = new Set<string>();
  const identOf = new Map(
    Object.keys(schema.properties ?? {}).map((propName) => [propName, toRustIdent(propName, usedIdents)])
  );
  const identFor = (propName: string) => identOf.get(propName) ?? toRustIdent(propName);

  const pushField = (propName: string, propType: string) => {
    // r#self and r#crate are forbidden, so keywords go through toRustIdent too
    const ident = identFor(propName);
    if (ident !== propName) {
      code += `${indentFn(level + 1)}#[serde(rename = "${propName.replace(/(["\\])/g, '\\$1')}")]\n`;
    }
    code += `${indentFn(level + 1)}pub ${ident}: ${propType},\n`;
  };

  // Generate struct fields
  Object.entries(schema.properties).forEach(([propName, propSchema]: [string, VovkJSONSchemaBase]) => {
    const isRequired = schema.required?.includes(propName);

    // named refs point at the top level type instead of being inlined, which is what makes cycles terminate
    const namedRef = refToName(propSchema.$ref, rootSchema);
    const namedItemRef =
      !namedRef && propSchema.type === 'array' && propSchema.items && typeof propSchema.items !== 'boolean'
        ? refToName(propSchema.items.$ref, rootSchema)
        : null;

    if (namedRef || namedItemRef) {
      const target = (namedRef ?? namedItemRef) as string;
      code += generateDocComment(getNamedSchemas(rootSchema)[target], level + 1, pad);

      let propType = `${superPrefix(path)}${target}`;
      if (namedItemRef) {
        propType = `Vec<${propType}>`;
      } else if (refNeedsBox(enclosingNamed, target, rootSchema)) {
        propType = `Box<${propType}>`;
      }
      if (!isRequired) propType = `Option<${propType}>`;

      pushField(propName, propType);
      return;
    }

    // Handle $ref in property
    if (propSchema.$ref) {
      const resolvedSchema = resolveRef(propSchema.$ref, rootSchema);
      if (resolvedSchema) {
        propSchema = resolvedSchema;
      }
    }

    // Add documentation comments for the field
    code += generateDocComment(propSchema, level + 1, pad);

    // Determine if this property is a nested type that should be accessed via module path
    const isNestedObject = propSchema.type === 'object' || propSchema.properties;
    const isGenericObject = propSchema.type === 'object' && !propSchema.properties;
    // Define nested enum types
    const isNestedEnum =
      ((propSchema.type === 'string' || !propSchema.type) && propSchema.enum) ||
      propSchema.anyOf ||
      propSchema.oneOf ||
      propSchema.allOf;

    const propPath = [...path, propName];
    let propType: string;

    if (isGenericObject) {
      // For generic objects, we can use serde_json::Value
      propType = 'serde_json::Value';
    } else if (isNestedObject || isNestedEnum) {
      // For nested objects and enums, we need to reference them via their module path
      propType = `${currentName}_::${identFor(propName)}`;

      // Special case for enums which have a different naming convention
      if (isNestedEnum) {
        propType += ''; // 'Enum';
      }
    } else {
      // For other types, use the standard type resolution
      propType = toRustType(propSchema, propPath, rootSchema);
    }

    if (!isRequired) {
      propType = `Option<${propType}>`;
    }

    pushField(propName, propType);
  });

  code += `${indentFn(level)}}\n\n`;

  // named refs already resolve to top level types, so they never need a nested definition
  const isNamedRefProp = (propSchema: VovkJSONSchemaBase) =>
    !!refToName(propSchema.$ref, rootSchema) ||
    (propSchema.type === 'array' &&
      !!propSchema.items &&
      typeof propSchema.items !== 'boolean' &&
      !!refToName(propSchema.items.$ref, rootSchema));

  // Check if any properties require nested types before generating the sub-module
  const hasNestedTypes = Object.entries(schema.properties).some(([, propSchema]: [string, VovkJSONSchemaBase]) => {
    if (isNamedRefProp(propSchema)) return false;

    // Resolve $ref if present
    if (propSchema.$ref) {
      const resolved = resolveRef(propSchema.$ref, rootSchema);
      propSchema = resolved || propSchema;
    }

    return (
      propSchema.type === 'object' ||
      propSchema.properties ||
      ((propSchema.type === 'string' || !propSchema.type) && propSchema.enum) ||
      (propSchema.type === 'array' &&
        propSchema.items &&
        typeof propSchema.items !== 'boolean' &&
        (propSchema.items.type === 'object' || propSchema.items.properties || propSchema.items.$ref)) ||
      propSchema.anyOf ||
      propSchema.oneOf ||
      propSchema.allOf
    );
  });

  // Only generate sub-modules if there are nested types
  if (hasNestedTypes && Object.keys(schema.properties).length > 0) {
    code += `${indentFn(level)}#[allow(non_snake_case)]\n`;
    code += `${indentFn(level)}pub mod ${currentName}_ {\n`;
    code += `${indentFn(level + 1)}use serde::{Serialize, Deserialize};\n\n`;

    Object.entries(schema.properties).forEach(([propName, propSchema]: [string, VovkJSONSchemaBase]) => {
      if (isNamedRefProp(propSchema)) return;

      // Resolve $ref if present
      if (propSchema.$ref) {
        const resolved = resolveRef(propSchema.$ref, rootSchema);
        if (resolved) {
          propSchema = resolved;
        }
      }

      const propIdent = identFor(propName);

      // Generate nested object types
      if (propSchema.type === 'object' || propSchema.properties) {
        code += processObject(propSchema, [...path, propIdent], level + 1, rootSchema, pad);
      }
      // Generate enum types for string enums (also when type is missing but enum exists)
      else if ((propSchema.type === 'string' || !propSchema.type) && propSchema.enum) {
        code += generateEnum(propSchema, propIdent, level + 1, pad);
      }
      // Generate types for array items if they're objects
      else if (propSchema.type === 'array' && propSchema.items && typeof propSchema.items !== 'boolean') {
        // Check if items has a $ref
        if (propSchema.items.$ref) {
          const resolved = resolveRef(propSchema.items.$ref, rootSchema);
          if (resolved && (resolved.type === 'object' || resolved.properties)) {
            code += processObject(resolved, [...path, `${propIdent}Item`], level + 1, rootSchema, pad);
          }
        } else if (propSchema.items.type === 'object' || propSchema.items.properties) {
          code += processObject(propSchema.items, [...path, `${propIdent}Item`], level + 1, rootSchema, pad);
        }
      }
      // Handle anyOf/oneOf/allOf schemas
      else if (propSchema.anyOf || propSchema.oneOf || propSchema.allOf) {
        code += generateVariantEnum(propSchema, propIdent, path, level + 1, rootSchema, pad);
      }
    });

    code += `${indentFn(level)}}\n`;
  }

  return code;
}

// Generate code for primitive types
export function processPrimitive(schema: VovkJSONSchemaBase, name: string, level: number, pad: number = 0): string {
  const indentFn = (level: number) => ' '.repeat(pad + level * 2);

  let code = '';

  // Add documentation comments
  code += generateDocComment(schema, level, pad);

  // For primitive types, create a type alias
  code += `${indentFn(level)}pub type ${name} = `;

  if (schema.type === 'string') {
    // Binary format or a non text content type maps to Vec<u8>
    if (getBodyKind(schema) === 'binary') {
      code += 'Vec<u8>';
    } else {
      code += 'String';
    }
  } else if (schema.type === 'number') {
    code += 'f64';
  } else if (schema.type === 'integer') {
    code += 'i64';
  } else if (schema.type === 'boolean') {
    code += 'bool';
  } else if (schema.type === 'null') {
    code += '()';
  } else if (schema.enum) {
    // If it has enum values, we'll generate an actual enum instead of a type alias
    return generateEnum(schema, name, level, pad);
  } else {
    code += 'String'; // Default fallback
  }

  code += ';\n\n';
  return code;
}

export function convertJSONSchemasToRustTypes({
  schemas,
  pad = 0,
  rootName,
}: {
  schemas: Record<string, VovkJSONSchemaBase | undefined>;
  pad?: number;
  rootName: string;
}): string {
  // Check if all schemas are undefined
  const hasDefinedSchemas = Object.values(schemas).some((schema) => schema !== undefined);
  if (!hasDefinedSchemas) {
    return '';
  }

  const indentFn = (level: number) => ' '.repeat(pad + level * 2);

  // Start code generation
  let result = `${indentFn(0)}#[allow(non_camel_case_types)]\n`;
  result += `${indentFn(0)}pub mod ${rootName}_ {\n`;
  result += `${indentFn(1)}#[allow(unused_imports)]\n`;
  result += `${indentFn(1)}use serde::{Serialize, Deserialize};\n`;

  // named types are shared by every slot of the handler, so they are emitted once
  const emittedNamed = new Set<string>();

  // Process each schema in the schemas object
  Object.entries(schemas).forEach(([schemaName, schemaObj]) => {
    // Skip undefined schemas
    if (!schemaObj) return;
    Object.entries(getNamedSchemas(schemaObj)).forEach(([defName, defSchema]: [string, VovkJSONSchemaBase]) => {
      // Create a root object for each definition
      if (defSchema && !emittedNamed.has(defName)) {
        emittedNamed.add(defName);
        if (defSchema.type === 'object' || defSchema.properties) {
          const rootDefObject = {
            type: 'object',
            properties: defSchema.properties || {},
            required: defSchema.required || [],
            title: defSchema.title,
            description: defSchema.description,
            'x-contentType': defSchema['x-contentType'],
          } as const;
          result += processObject(rootDefObject, [defName], 1, schemaObj, pad);
        } else if (defSchema.type === 'string' && defSchema.enum) {
          result += generateEnum(defSchema, defName, 1, pad);
        } else if (defSchema.anyOf || defSchema.oneOf || defSchema.allOf) {
          result += generateVariantEnum(defSchema, defName, [defName], 1, schemaObj, pad);
        } else if (
          typeof defSchema.type === 'string' &&
          ['string', 'number', 'integer', 'boolean', 'null'].includes(defSchema.type)
        ) {
          // Handle primitive types in $defs
          result += processPrimitive(defSchema, defName, 1, pad);
        }
      }
    });

    // Handle the schema based on its type
    if (schemaObj.type === 'object' || schemaObj.properties) {
      // Create a root object for object schema
      const rootObject = {
        type: 'object',
        properties: schemaObj.properties || {},
        required: schemaObj.required || [],
        title: schemaObj.title,
        description: schemaObj.description,
        'x-contentType': schemaObj['x-contentType'],
      } as const;

      result += processObject(rootObject, [schemaName], 1, schemaObj, pad);
    } else if (
      typeof schemaObj.type === 'string' &&
      ['string', 'number', 'integer', 'boolean', 'null'].includes(schemaObj.type)
    ) {
      // Handle primitive schema
      result += processPrimitive(schemaObj, schemaName, 1, pad);
    } else if (schemaObj.enum) {
      // Handle enum schema
      result += generateEnum(schemaObj, schemaName, 1, pad);
    } else if (schemaObj.anyOf || schemaObj.oneOf || schemaObj.allOf) {
      // Handle variant schema
      result += generateVariantEnum(schemaObj, schemaName, [schemaName], 1, schemaObj, pad);
    } else if (schemaObj.type === 'array') {
      // For array as root type, create a type alias to Vec<ItemType>
      let itemType = 'String'; // Default if no items specified

      if (schemaObj.items && typeof schemaObj.items !== 'boolean') {
        if (schemaObj.items.type === 'object' || schemaObj.items.properties) {
          // Create the item type
          const itemSchema = {
            ...schemaObj.items,
            title: schemaObj.items.title || `${schemaName}Item`,
            description: schemaObj.items.description || `Item of ${schemaName} array`,
          };

          result += processObject(itemSchema, [`${schemaName}Item`], 1, schemaObj, pad);
          itemType = `${schemaName}Item`;
        } else {
          // For primitive array items
          itemType = toRustType(schemaObj.items, [`${schemaName}Item`], schemaObj);
        }
      }

      result += `${indentFn(1)}pub type ${schemaName} = Vec<${itemType}>;\n\n`;
    }
  });

  result += `${indentFn(0)}}\n`;

  return result;
}
