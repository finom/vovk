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
  definitions?: Record<string, JSONSchema>;
  $ref?: string; // Added support for $ref
}

// Interface for conversion options
interface ConvertOptions {
  schema: JSONSchema;
  structName: string;
  pad: number; // Number of spaces for indentation
  definitions?: Record<string, JSONSchema>; // Added for storing schema definitions
  processedDefs?: Set<string>; // Track processed definitions to avoid duplicates
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

// Helper to extract name from reference
function getRefName(ref: string): string {
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

// Get the Rust type name for a ref
function getRefTypeName(ref: string): string {
  return `${toCamelCase(getRefName(ref))}`;
}

// Recursive function to convert schema to Rust types
function convertSchema(schema: JSONSchema, prefix: string, options: ConvertOptions): ConversionResult {
  // Handle reference before checking for null/undefined
  if (schema.$ref) {
    const refName = getRefName(schema.$ref);
    const refTypeName = getRefTypeName(schema.$ref);

    // If definitions are provided and the ref exists in definitions
    if (options.definitions && options.definitions[refName]) {
      // Check if we need to process this definition
      if (options.processedDefs && !options.processedDefs.has(refName)) {
        // Process the definition and mark it as processed
        const refSchema = options.definitions[refName];
        const result = convertSchema(refSchema, refTypeName, options);
        options.processedDefs.add(refName);

        return {
          typeExpr: refTypeName,
          definitions: result.definitions,
        };
      }

      // Definition already processed, just reference it
      return {
        typeExpr: refTypeName,
        definitions: [],
      };
    }

    // If we couldn't resolve the ref, use serde_json::Value instead
    return {
      typeExpr: 'serde_json::Value',
      definitions: [],
    };
  }

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
    const itemResult = convertSchema(schema.items, prefix, options);
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
      const fieldResult = convertSchema(propSchema, fieldPrefix, options);
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

  // Extract definitions from the schema if present
  if (schema.definitions && !options.definitions) {
    options.definitions = schema.definitions as Record<string, JSONSchema>;
  }

  // Initialize set to track processed definitions
  const processedDefs = new Set<string>();
  options.processedDefs = processedDefs;

  // Process all definitions first to create Ref types
  const definitionTypes: string[] = [];
  if (options.definitions) {
    for (const [defName, defSchema] of Object.entries(options.definitions)) {
      if (!processedDefs.has(defName)) {
        const refTypeName = `${toCamelCase(defName)}`;
        const result = convertSchema(defSchema, refTypeName, options);
        definitionTypes.push(...result.definitions);
        processedDefs.add(defName);
      }
    }
  }

  // Then process the main schema
  const result = convertSchema(schema, structName, options);

  // Combine all definitions
  const allDefinitions = [...definitionTypes, ...result.definitions];

  return allDefinitions
    .map((definition) =>
      definition
        .split('\n')
        .map((line) => `${' '.repeat(pad)}${line}`)
        .join('\n')
    )
    .join('\n\n');
}
