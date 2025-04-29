import type { KnownAny } from 'vovk';

export function convertJSONSchemasToRustTypes({
  schemas,
  pad = 0,
  rootName,
}: {
  schemas: Record<string, KnownAny | undefined>;
  pad?: number;
  rootName: string;
}): string {
  // Check if all schemas are undefined
  const hasDefinedSchemas = Object.values(schemas).some((schema) => schema !== undefined);
  if (!hasDefinedSchemas) {
    return '';
  }

  const indent = (level: number) => ' '.repeat(pad + level * 2);

  // Track processed $refs to avoid circular references
  const processedRefs = new Set<string>();

  // Resolve $ref paths in the schema
  function resolveRef(ref: string, rootSchema: KnownAny): KnownAny | undefined {
    if (processedRefs.has(ref)) {
      // Circular reference detected, return a placeholder
      return { type: 'string' };
    }

    processedRefs.add(ref);

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
      current = current[part];
    }

    // If the resolved schema also has a $ref, resolve it recursively
    if (current && current.$ref) {
      return resolveRef(current.$ref, rootSchema);
    }

    processedRefs.delete(ref);
    return current;
  }

  // Convert JSON Schema type to Rust type
  function toRustType(schema: KnownAny, path: string[], rootSchema: KnownAny = schema): string {
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
      return 'String'; // Fallback if ref can't be resolved
    }

    if (schema.type === 'string') {
      if (schema.enum) {
        return `${getModulePath(path)}Enum`;
      }
      return 'String';
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return schema.type === 'integer' ? 'i64' : 'f64';
    } else if (schema.type === 'boolean') {
      return 'bool';
    } else if (schema.type === 'null') {
      return '()';
    } else if (schema.type === 'array') {
      if (schema.items) {
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
      return path[path.length - 1];
    } else if (schema.anyOf || schema.oneOf || schema.allOf) {
      return `${getModulePath(path)}Enum`;
    }

    return 'String'; // Default fallback
  }

  // Generate module path for nested types
  function getModulePath(path: string[]): string {
    if (path.length <= 1) return path[0];

    let result = '';
    for (let i = 0; i < path.length - 1; i++) {
      result += path[i] + '_::';
    }
    result += path[path.length - 1];
    return result;
  }

  // Process schema objects and generate Rust code
  function processObject(schema: KnownAny, path: string[], level: number, rootSchema: KnownAny = schema): string {
    if (!schema || !schema.properties) {
      return '';
    }

    const currentName = path[path.length - 1];
    let code = '';

    // Generate struct
    code += `${indent(level)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
    code += `${indent(level)}#[allow(non_snake_case, non_camel_case_types)]\n`;
    code += `${indent(level)}pub struct ${currentName} {\n`;

    // Generate struct fields
    Object.entries(schema.properties).forEach(([propName, propSchema]: [string, KnownAny]) => {
      const isRequired = schema.required && schema.required.includes(propName);

      // Handle $ref in property
      if (propSchema.$ref) {
        const resolvedSchema = resolveRef(propSchema.$ref, rootSchema);
        if (resolvedSchema) {
          propSchema = resolvedSchema;
        }
      }

      // Determine if this property is a nested type that should be accessed via module path
      const isNestedObject = propSchema.type === 'object' || propSchema.properties;
      // Define nested enum types
      const isNestedEnum =
        (propSchema.type === 'string' && propSchema.enum) || propSchema.anyOf || propSchema.oneOf || propSchema.allOf;

      const propPath = [...path, propName];
      let propType: string;

      if (isNestedObject || isNestedEnum) {
        // For nested objects and enums, we need to reference them via their module path
        propType = `${currentName}_::${propName}`;

        // Special case for enums which have a different naming convention
        if (isNestedEnum) {
          propType += 'Enum';
        }
      } else {
        // For other types, use the standard type resolution
        propType = toRustType(propSchema, propPath, rootSchema);
      }

      if (!isRequired) {
        propType = `Option<${propType}>`;
      }

      code += `${indent(level + 1)}pub ${propName}: ${propType},\n`;
    });

    code += `${indent(level)}}\n\n`;

    // Check if any properties require nested types before generating the sub-module
    const hasNestedTypes = Object.entries(schema.properties).some(([, propSchema]: [string, KnownAny]) => {
      // Resolve $ref if present
      if (propSchema.$ref) {
        const resolved = resolveRef(propSchema.$ref, rootSchema);
        propSchema = resolved || propSchema;
      }

      return (
        propSchema.type === 'object' ||
        propSchema.properties ||
        (propSchema.type === 'string' && propSchema.enum) ||
        (propSchema.type === 'array' &&
          propSchema.items &&
          (propSchema.items.type === 'object' || propSchema.items.properties || propSchema.items.$ref)) ||
        propSchema.anyOf ||
        propSchema.oneOf ||
        propSchema.allOf
      );
    });

    // Only generate sub-modules if there are nested types
    if (hasNestedTypes && Object.keys(schema.properties).length > 0) {
      code += `${indent(level)}#[allow(non_snake_case)]\n`;
      code += `${indent(level)}pub mod ${currentName}_ {\n`;
      code += `${indent(level + 1)}use serde::{Serialize, Deserialize};\n\n`;

      Object.entries(schema.properties).forEach(([propName, propSchema]: [string, KnownAny]) => {
        // Resolve $ref if present
        if (propSchema.$ref) {
          const resolved = resolveRef(propSchema.$ref, rootSchema);
          if (resolved) {
            propSchema = resolved;
          }
        }

        // Generate nested object types
        if (propSchema.type === 'object' || propSchema.properties) {
          code += processObject(propSchema, [...path, propName], level + 1, rootSchema);
        }
        // Generate enum types for string enums
        else if (propSchema.type === 'string' && propSchema.enum) {
          code += generateEnum(propSchema, propName, level + 1);
        }
        // Generate types for array items if they're objects
        else if (propSchema.type === 'array' && propSchema.items) {
          // Check if items has a $ref
          if (propSchema.items.$ref) {
            const resolved = resolveRef(propSchema.items.$ref, rootSchema);
            if (resolved && (resolved.type === 'object' || resolved.properties)) {
              code += processObject(resolved, [...path, propName + 'Item'], level + 1, rootSchema);
            }
          } else if (propSchema.items.type === 'object' || propSchema.items.properties) {
            code += processObject(propSchema.items, [...path, propName + 'Item'], level + 1, rootSchema);
          }
        }
        // Handle anyOf/oneOf/allOf schemas
        else if (propSchema.anyOf || propSchema.oneOf || propSchema.allOf) {
          code += generateVariantEnum(propSchema, propName, path, level + 1, rootSchema);
        }
      });

      code += `${indent(level)}}\n`;
    }

    return code;
  }

  // Generate enum for string with enum values
  function generateEnum(schema: KnownAny, name: string, level: number): string {
    let code = '';
    code += `${indent(level)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
    code += `${indent(level)}#[allow(non_camel_case_types)]\n`;
    code += `${indent(level)}pub enum ${name}Enum {\n`;

    schema.enum.forEach((value: string) => {
      // Create valid Rust enum variant
      const variant = value.replace(/[^a-zA-Z0-9_]/g, '_');
      code += `${indent(level + 1)}#[serde(rename = "${value}")]\n`;
      code += `${indent(level + 1)}${variant},\n`;
    });

    code += `${indent(level)}}\n\n`;
    return code;
  }

  // Generate enum for anyOf/oneOf/allOf schemas
  function generateVariantEnum(
    schema: KnownAny,
    name: string,
    path: string[],
    level: number,
    rootSchema: KnownAny
  ): string {
    const variants = schema.anyOf || schema.oneOf || schema.allOf;
    let code = '';

    code += `${indent(level)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
    code += `${indent(level)}#[serde(untagged)]\n`;
    code += `${indent(level)}pub enum ${name}Enum {\n`;

    variants.forEach((variant: KnownAny, index: number) => {
      // Resolve $ref if present
      if (variant.$ref) {
        const resolved = resolveRef(variant.$ref, rootSchema);
        if (resolved) {
          variant = resolved;
        }
      }

      const variantPath = [...path, name, `Variant${index}`];
      const variantType = toRustType(variant, variantPath, rootSchema);
      code += `${indent(level + 1)}Variant${index}(${variantType}),\n`;

      // Process variant if it's an object
      if (variant.type === 'object' || variant.properties) {
        code += processObject(variant, variantPath, level + 1, rootSchema);
      }
    });

    code += `${indent(level)}}\n\n`;
    return code;
  }

  // Start code generation
  let result = `${indent(0)}pub mod ${rootName}_ {\n`;
  result += `${indent(1)}use serde::{Serialize, Deserialize};\n\n`;

  // Process each schema in the schemas object
  Object.entries(schemas).forEach(([schemaName, schemaObj]) => {
    // Skip undefined schemas
    if (!schemaObj) return;

    // Extract and process types from $defs if present
    if (schemaObj.$defs) {
      Object.entries(schemaObj.$defs).forEach(([defName, defSchema]: [string, KnownAny]) => {
        // Create a root object for each definition
        if (defSchema) {
          if (defSchema.type === 'object' || defSchema.properties) {
            const rootDefObject = {
              type: 'object',
              properties: defSchema.properties || {},
              required: defSchema.required || [],
            };
            result += processObject(rootDefObject, [defName], 1, schemaObj);
          } else if (defSchema.type === 'string' && defSchema.enum) {
            result += generateEnum(defSchema, defName, 1);
          } else if (defSchema.anyOf || defSchema.oneOf || defSchema.allOf) {
            result += generateVariantEnum(defSchema, defName, [defName], 1, schemaObj);
          }
        }
      });
    }

    // Create a root object for each schema
    const rootObject = {
      type: 'object',
      properties: schemaObj.properties || {},
      required: schemaObj.required || [],
    };

    result += processObject(rootObject, [schemaName], 1, schemaObj);
  });

  result += `${indent(0)}}\n`;

  return result;
}
