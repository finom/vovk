import type { KnownAny } from 'vovk';

interface Context {
  typeMap: Map<KnownAny, string>; // Maps schema objects to Rust type names
  counter: number; // For generating unique type names
  definitions: string[]; // Collects type definitions
}

function generateRustTypes(schema: KnownAny): string {
  const ctx: Context = { typeMap: new Map(), counter: 0, definitions: [] };

  // Process definitions section if present
  if (schema.definitions) {
    for (const [defName, defSchema] of Object.entries(schema.definitions)) {
      const rustTypeName = pascalCase(defName);
      ctx.typeMap.set(defSchema, rustTypeName);
      const typeDef = convertSchemaToRustTypeDef(defSchema, ctx, rustTypeName);
      ctx.definitions.push(typeDef);
    }
  }

  // Generate the main type
  const mainType = convertJSONSchemaToRustType(schema, ctx);
  let output = ctx.definitions.join('\n\n');
  output += output ? `\n\ntype MainType = ${mainType};` : `type MainType = ${mainType};`;
  return output;
}

/** Converts a JSON schema to a Rust type string, handling all cases. */
function convertJSONSchemaToRustType(schema: KnownAny, ctx: Context): string {
  // Avoid reprocessing the same schema object
  if (ctx.typeMap.has(schema)) {
    return ctx.typeMap.get(schema)!;
  }

  let typeStr: string;

  // Handle schema reference
  if (schema.$ref) {
    const path = schema.$ref.split('/'); // e.g., "#/definitions/Address"
    let target = schema;
    for (const part of path.slice(1)) {
      // Skip the "#"
      target = target[part];
    }
    if (ctx.typeMap.has(target)) {
      return ctx.typeMap.get(target)!;
    }
    throw new Error(`Definition not found for $ref: ${schema.$ref}`);
  }

  // Normalize "type" array to "anyOf"
  if (Array.isArray(schema.type)) {
    const subSchemas = schema.type.map((t: string) => ({ type: t }));
    return convertJSONSchemaToRustType({ anyOf: subSchemas }, ctx);
  }

  // Handle "const" literals
  if ('const' in schema) {
    const value = schema.const;
    if (typeof value === 'string') typeStr = 'String';
    else if (typeof value === 'number') typeStr = Number.isInteger(value) ? 'i64' : 'f64';
    else if (typeof value === 'boolean') typeStr = 'bool';
    else typeStr = 'serde_json::Value'; // Fallback for complex literals
    return typeStr;
  }

  // Handle specific types
  if (schema.type) {
    switch (schema.type) {
      case 'string':
        typeStr = handleStringFormat(schema.format);
        break;
      case 'number':
        typeStr = 'f64'; // Default to f64, constraints handled at runtime
        break;
      case 'integer':
        typeStr = 'i64';
        break;
      case 'boolean':
        typeStr = 'bool';
        break;
      case 'array': {
        const itemType = schema.items ? convertJSONSchemaToRustType(schema.items, ctx) : 'serde_json::Value';
        typeStr = `Vec<${itemType}>`;
        break;
      }
      case 'object':
        typeStr = handleObject(schema, ctx);
        break;
      case 'null':
        typeStr = '()'; // Unit type for null, typically wrapped in Option elsewhere
        break;
      default:
        typeStr = 'serde_json::Value';
    }
  }
  // Handle enums
  else if (schema.enum) {
    typeStr = handleEnum(schema, ctx);
  }
  // Handle unions
  else if (schema.anyOf || schema.oneOf) {
    typeStr = handleUnion(schema.anyOf || schema.oneOf, ctx);
  }
  // Fallback for unspecified types
  else {
    typeStr = 'serde_json::Value';
  }

  return typeStr;
}

/** Generates a type definition for named types (structs, enums). */
function convertSchemaToRustTypeDef(schema: KnownAny, ctx: Context, typeName: string): string {
  if (schema.type === 'object') {
    const fields = Object.entries(schema.properties || {})
      .map(([key, propSchema]) => {
        const propType = convertJSONSchemaToRustType(propSchema, ctx);
        const isRequired = schema.required && schema.required.includes(key);
        return `${key}: ${isRequired ? propType : `Option<${propType}>`},`;
      })
      .join('\n');
    return `struct ${typeName} {\n${fields}\n}`;
  } else if (schema.enum) {
    const variants = schema.enum
      .map((val: KnownAny) => {
        const variantName = pascalCase(String(val));
        return `#[serde(rename = "${val}")]\n${variantName},`;
      })
      .join('\n');
    return `#[derive(Serialize, Deserialize)]\nenum ${typeName} {\n${variants}\n}`;
  } else if (schema.anyOf || schema.oneOf) {
    const subSchemas = schema.anyOf || schema.oneOf;
    const variants = subSchemas
      .map((subSchema: KnownAny, index: number) => {
        const subType = convertJSONSchemaToRustType(subSchema, ctx);
        return subSchema.type === 'null' ? 'Null,' : `Variant${index}(${subType}),`;
      })
      .join('\n');
    return `#[derive(Serialize, Deserialize)]\n#[serde(untagged)]\nenum ${typeName} {\n${variants}\n}`;
  } else {
    const typeStr = convertJSONSchemaToRustType(schema, ctx);
    return `type ${typeName} = ${typeStr};`;
  }
}

/** Handles string formats by mapping to appropriate Rust types. */
function handleStringFormat(format?: string): string {
  switch (format) {
    case 'date-time':
      return 'chrono::DateTime<chrono::Utc>'; // Requires chrono crate
    case 'email':
    case 'uri':
    case 'uuid':
      return 'String'; // Use String with runtime validation
    default:
      return 'String';
  }
}

/** Handles object schemas by generating a struct. */
function handleObject(schema: KnownAny, ctx: Context): string {
  const typeName = generateTypeName(ctx);
  ctx.typeMap.set(schema, typeName);
  const typeDef = convertSchemaToRustTypeDef(schema, ctx, typeName);
  ctx.definitions.push(typeDef);
  return typeName;
}

/** Handles enums by generating an enum with variants. */
function handleEnum(schema: KnownAny, ctx: Context): string {
  const typeName = generateTypeName(ctx);
  ctx.typeMap.set(schema, typeName);
  const typeDef = convertSchemaToRustTypeDef(schema, ctx, typeName);
  ctx.definitions.push(typeDef);
  return typeName;
}

/** Handles unions by generating an enum with variants. */
function handleUnion(subSchemas: KnownAny[], ctx: Context): string {
  const typeName = generateTypeName(ctx);
  ctx.typeMap.set(subSchemas, typeName); // Use subSchemas as key to avoid conflicts
  const typeDef = convertSchemaToRustTypeDef({ anyOf: subSchemas }, ctx, typeName);
  ctx.definitions.push(typeDef);
  return typeName;
}

/** Generates a unique type name. */
function generateTypeName(ctx: Context): string {
  ctx.counter += 1;
  return `Type${ctx.counter}`;
}

/** Converts a string to PascalCase. */
function pascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Example usage
const schema = {
  definitions: {
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
      },
    },
  },
  type: 'object',
  properties: {
    name: { type: ['string', 'null'] },
    age: { type: 'integer' },
    status: { enum: ['active', 'inactive'] },
    address: { $ref: '#/definitions/address' },
  },
  required: ['name'],
};

console.log(generateRustTypes(schema));
