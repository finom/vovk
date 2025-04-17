import type { KnownAny } from 'vovk';

interface JSONSchema {
  type?: string | string[];
  enum?: KnownAny[];
  items?: JSONSchema;
  properties?: { [key: string]: JSONSchema };
  required?: string[];
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
  format?: string;
}

// Interface for conversion options
interface ConvertOptions {
  schema: JSONSchema;
  structName: string;
  pad: number; // Number of spaces for indentation
}

// Result type for the conversion function
interface ConversionResult {
  typeExpr: string; // Rust type expression (e.g., "String", "Vec<i64>")
  definitions: string[]; // List of type definitions (structs, enums)
}

// Helper function to convert snake_case to CamelCase
function toCamelCase(str: string): string {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Recursive function to convert schema to Rust types
function convertSchema(schema: JSONSchema, prefix: string): ConversionResult {
  // Handle null or undefined schema
  if (!schema || !schema.type) {
    return { typeExpr: '()', definitions: [] }; // Unit type as fallback
  }

  const indent = ' '.repeat(4);

  // Primitive types
  if (schema.type === 'string') {
    return { typeExpr: 'String', definitions: [] };
  } else if (schema.type === 'number') {
    return { typeExpr: 'f64', definitions: [] };
  } else if (schema.type === 'integer') {
    return { typeExpr: 'i64', definitions: [] };
  } else if (schema.type === 'boolean') {
    return { typeExpr: 'bool', definitions: [] };
  }
  // Array type
  else if (schema.type === 'array') {
    if (!schema.items) {
      throw new Error("Array schema must specify 'items'");
    }
    const itemResult = convertSchema(schema.items, prefix);
    return {
      typeExpr: `Vec<${itemResult.typeExpr}>`,
      definitions: itemResult.definitions,
    };
  }
  // Object type (convert to Rust struct)
  else if (schema.type === 'object') {
    const structName = prefix;
    const fields: string[] = [];
    let allDefinitions: string[] = [];

    const required = schema.required || [];

    for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
      const fieldPrefix = prefix + toCamelCase(propName);
      const fieldResult = convertSchema(propSchema, fieldPrefix);
      const fieldType = fieldResult.typeExpr;
      const isRequired = required.includes(propName);
      const rustFieldType = isRequired ? fieldType : `Option<${fieldType}>`;
      fields.push(`${indent}pub ${propName}: ${rustFieldType},`);
      allDefinitions = allDefinitions.concat(fieldResult.definitions);
    }

    const structDef = `
#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct ${structName} {
${fields.join('\n')}
}`.trim();

    return {
      typeExpr: structName,
      definitions: [structDef, ...allDefinitions],
    };
  }
  // Enum type
  else if (schema.enum) {
    const enumName = prefix;
    const variants = schema.enum.map((value) => {
      // Use the value directly as a string, assuming it's a valid identifier
      // In a production scenario, sanitize if necessary
      return `${indent}${value.toString()},`;
    });

    const enumDef = `
#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(non_camel_case_types)]
pub enum ${enumName} {
${variants.join('\n')}
}`.trim();

    return {
      typeExpr: enumName,
      definitions: [enumDef],
    };
  }
  // Unsupported type
  else {
    throw new Error(`Unsupported schema type: ${schema.type}`);
  }
}

// Main function to convert JSON schema to Rust type definition
export function convertJSONSchemaToRustType(options: ConvertOptions): string {
  const { schema, structName, pad } = options;

  if (!schema) {
    return '';
  }

  const result = convertSchema(schema, structName);
  return result.definitions
    .map((definition) =>
      definition
        .split('\n')
        .map((line) => `${' '.repeat(pad)}${line}`)
        .join('\n')
    )
    .join('\n\n');
}
