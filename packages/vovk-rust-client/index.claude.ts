import type { KnownAny } from 'vovk';

/**
 * Converts a JSON Schema to a Rust type
 * @param schema The JSON Schema to convert
 * @returns A string representation of the corresponding Rust type
 */
function convertJSONSchemaToRustType(schema: KnownAny): string {
  // Handle null or undefined schema
  if (!schema) {
    return '()';
  }

  // Handle $ref references
  if (schema.$ref) {
    // Extract type name from reference
    const refPath = schema.$ref.split('/');
    const typeName = refPath[refPath.length - 1];
    return formatRustTypeName(typeName);
  }

  // Handle oneOf, anyOf, allOf
  if (schema.oneOf || schema.anyOf) {
    return handleUnionType(schema.oneOf || schema.anyOf);
  }

  if (schema.allOf) {
    return handleAllOfType(schema.allOf);
  }

  // Handle enum values
  if (schema.enum) {
    return handleEnumType(schema);
  }

  // Handle type or types array
  if (schema.type) {
    if (Array.isArray(schema.type)) {
      // Handle multiple types (union types)
      return handleMultipleTypes(schema);
    }

    switch (schema.type) {
      case 'string':
        return handleStringType(schema);
      case 'number':
        return handleNumberType(schema);
      case 'integer':
        return handleIntegerType(schema);
      case 'boolean':
        return 'bool';
      case 'null':
        return '()';
      case 'array':
        return handleArrayType(schema);
      case 'object':
        return handleObjectType(schema);
      default:
        return '// Unknown type: ' + schema.type;
    }
  }

  // If no type is specified but properties exist, treat as object
  if (schema.properties) {
    return handleObjectType(schema);
  }

  // Default fallback
  return 'serde_json::Value';
}

/**
 * Formats a type name to be valid in Rust
 */
function formatRustTypeName(name: string): string {
  // Capitalize first letter and ensure valid Rust identifier
  if (!name) return 'UnknownType';
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Handles string type conversion with formats
 */
function handleStringType(schema: KnownAny): string {
  if (schema.format) {
    switch (schema.format) {
      case 'date-time':
        return 'chrono::DateTime<chrono::Utc>';
      case 'date':
        return 'chrono::NaiveDate';
      case 'time':
        return 'chrono::NaiveTime';
      case 'uuid':
        return 'uuid::Uuid';
      case 'email':
      case 'uri':
      case 'hostname':
      case 'ipv4':
      case 'ipv6':
        return 'String'; // Add comment about validation if needed
      default:
        return 'String';
    }
  }

  if (schema.pattern) {
    return `String /* with pattern: ${schema.pattern} */`;
  }

  if (schema.enum) {
    return handleEnumType(schema);
  }

  return 'String';
}

/**
 * Handles number type conversion
 */
function handleNumberType(schema: KnownAny): string {
  if (schema.format === 'float') {
    return 'f32';
  }
  return 'f64';
}

/**
 * Handles integer type conversion
 */
function handleIntegerType(schema: KnownAny): string {
  if (schema.format === 'int32') {
    return 'i32';
  } else if (schema.format === 'int64') {
    return 'i64';
  }

  // Check for minimum and maximum to determine appropriate integer size
  if (schema.minimum !== undefined || schema.maximum !== undefined) {
    const min = schema.minimum !== undefined ? schema.minimum : Number.MIN_SAFE_INTEGER;
    const max = schema.maximum !== undefined ? schema.maximum : Number.MAX_SAFE_INTEGER;

    if (min >= 0) {
      if (max <= 255) return 'u8';
      if (max <= 65535) return 'u16';
      if (max <= 4294967295) return 'u32';
      return 'u64';
    } else {
      if (min >= -128 && max <= 127) return 'i8';
      if (min >= -32768 && max <= 32767) return 'i16';
      if (min >= -2147483648 && max <= 2147483647) return 'i32';
      return 'i64';
    }
  }

  return 'i64'; // Default to i64 for integers without constraints
}

/**
 * Handles array type conversion
 */
function handleArrayType(schema: KnownAny): string {
  if (!schema.items) {
    return 'Vec<serde_json::Value>';
  }

  const itemType = convertJSONSchemaToRustType(schema.items);

  // Handle tuple validation if additionalItems is false and items is an array
  if (Array.isArray(schema.items) && schema.additionalItems === false) {
    const tupleTypes = schema.items.map((item: KnownAny) => convertJSONSchemaToRustType(item));
    return `(${tupleTypes.join(', ')})`;
  }

  // Handle minItems and maxItems if they're the same
  if (schema.minItems !== undefined && schema.maxItems !== undefined && schema.minItems === schema.maxItems) {
    return `[${itemType}; ${schema.minItems}]`;
  }

  return `Vec<${itemType}>`;
}

/**
 * Handles object type conversion
 */
function handleObjectType(schema: KnownAny): string {
  // Handle empty objects or "any" objects
  if (!schema.properties && !schema.additionalProperties) {
    return 'std::collections::HashMap<String, serde_json::Value>';
  }

  // Handle map types (objects with additionalProperties)
  if (!schema.properties && schema.additionalProperties) {
    if (typeof schema.additionalProperties === 'object') {
      const valueType = convertJSONSchemaToRustType(schema.additionalProperties);
      return `std::collections::HashMap<String, ${valueType}>`;
    }
    return 'std::collections::HashMap<String, serde_json::Value>';
  }

  // Handle regular objects with properties
  const properties = schema.properties || {};
  const required = schema.required || [];

  const fields = Object.entries(properties).map(([name, propSchema]: [string, KnownAny]) => {
    const fieldType = convertJSONSchemaToRustType(propSchema);
    const isRequired = required.includes(name);
    const rustName = escapeRustKeyword(name);

    // Convert snake_case to camel_case in comments to show original JSON field
    const originalNameComment = name !== rustName ? ` /* JSON: "${name}" */` : '';

    // Add Option<T> wrapper for optional fields
    const typeWithOption = isRequired ? fieldType : `Option<${fieldType}>`;

    // Add #[serde] annotation if the field name isn't valid Rust
    let serdeAttr = '';
    if (name.includes('-') || /^\d/.test(name) || isRustKeyword(name)) {
      serdeAttr = `    #[serde(rename = "${name}")]\n`;
    }

    return `${serdeAttr}    pub ${rustName}: ${typeWithOption},${originalNameComment}`;
  });

  if (fields.length === 0) {
    return '()';
  }

  return `struct {\n${fields.join('\n')}\n}`;
}

/**
 * Handles multiple types (union types)
 */
function handleMultipleTypes(schema: KnownAny): string {
  const types = Array.isArray(schema.type) ? (schema.type as string[]) : [];

  // Handle Option<T> for nullable types
  if (types.length === 2 && types.includes('null')) {
    const nonNullType = types.find((t) => t !== 'null');
    if (nonNullType) {
      const typeSchema = { ...schema, type: nonNullType };
      const rustType = convertJSONSchemaToRustType(typeSchema);
      return `Option<${rustType}>`;
    }
  }

  // For other union types, create an enum representation
  const typeSchemas = types.map((type) => ({ ...schema, type }));
  return handleUnionType(typeSchemas);
}

/**
 * Handles union types (oneOf, anyOf)
 */
function handleUnionType(schemas: KnownAny[]): string {
  // Check for null option to use Option<T>
  const nullIndex = schemas.findIndex(
    (s) => s.type === 'null' || (s.enum && s.enum.length === 1 && s.enum[0] === null)
  );

  if (nullIndex !== -1 && schemas.length === 2) {
    const nonNullSchema = schemas[1 - nullIndex];
    return `Option<${convertJSONSchemaToRustType(nonNullSchema)}>`;
  }

  // Otherwise, represent as enum
  const variants = schemas.map((schema, index) => {
    const typeName = `Variant${index + 1}`;
    const rustType = convertJSONSchemaToRustType(schema);
    return `    ${typeName}(${rustType})`;
  });

  return `enum {\n${variants.join(',\n')}\n}`;
}

/**
 * Handles allOf type (intersection/composition)
 */
function handleAllOfType(schemas: KnownAny[]): string {
  // For simplicity in this implementation, we'll just create a struct
  // with all properties from all schemas

  // Merge properties from all schemas
  const mergedSchema: KnownAny = { properties: {}, required: [] };

  schemas.forEach((schema) => {
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([name, propSchema]) => {
        mergedSchema.properties[name] = propSchema;
      });
    }

    if (schema.required) {
      mergedSchema.required = [...mergedSchema.required, ...schema.required];
    }
  });

  return handleObjectType(mergedSchema);
}

/**
 * Handles enum type conversion
 */
function handleEnumType(schema: KnownAny): string {
  if (!schema.enum || schema.enum.length === 0) {
    return 'String';
  }

  const isStringEnum = schema.enum.every((val: KnownAny) => typeof val === 'string');

  if (isStringEnum) {
    const variants = schema.enum.map((val: string) => {
      // Create valid Rust enum variant name
      let variantName = val.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[0-9]/, '_$&');

      // Capitalize first letter
      variantName = variantName.charAt(0).toUpperCase() + variantName.slice(1);

      return `    #[serde(rename = "${val}")]\n    ${variantName}`;
    });

    return `enum {\n${variants.join(',\n')}\n}`;
  } else {
    // For mixed-type enums, use serde_json::Value
    return 'serde_json::Value /* enum with mixed types */';
  }
}

const rustKeywords = [
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
];

/**
 * Escapes Rust keywords
 */
function escapeRustKeyword(name: string): string {
  // Convert camelCase or kebab-case to snake_case for Rust convention
  const snakeCase = name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();

  return rustKeywords.includes(snakeCase) ? `r#${snakeCase}` : snakeCase;
}

/**
 * Checks if a string is a Rust keyword
 */
function isRustKeyword(name: string): boolean {
  return rustKeywords.includes(name);
}
