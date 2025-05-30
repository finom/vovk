import { JSONSchema7, JSONSchema7Definition } from 'json-schema';

export function convertJSONSchemaToTypeScriptDef(schema: JSONSchema7): string | null {
  if (!schema) return null;
  // Helper function to get JSDoc from schema
  const getJSDoc = (schema: JSONSchema7 | boolean, indentation = ''): string => {
    if (typeof schema === 'boolean') {
      return '';
    }
    const description = schema.description || schema.title;
    if (!description) {
      return '';
    }
    return `${indentation}/**\n${indentation} * ${description}\n${indentation} */`;
  };

  // Helper function to convert schema to TypeScript type
  const schemaToType = (schema: JSONSchema7 | JSONSchema7Definition, indentation = '  '): string => {
    if (typeof schema === 'boolean') {
      return schema ? 'KnownAny' : 'never';
    }

    if (schema.enum) {
      return schema.enum
        .map((value) => {
          if (typeof value === 'string') {
            return `'${value}'`;
          } else if (value === null) {
            return 'null';
          } else {
            return String(value);
          }
        })
        .join(' | ');
    }

    if (schema.const !== undefined) {
      if (typeof schema.const === 'string') {
        return `'${schema.const}'`;
      } else if (schema.const === null) {
        return 'null';
      } else {
        return String(schema.const);
      }
    }

    if (schema.oneOf) {
      return schema.oneOf.map((s) => schemaToType(s, indentation)).join(' | ');
    }

    if (schema.anyOf) {
      return schema.anyOf.map((s) => schemaToType(s, indentation)).join(' | ');
    }

    if (schema.allOf) {
      return schema.allOf.map((s) => schemaToType(s, indentation)).join(' & ');
    }

    if (schema.type === 'object' || schema.properties) {
      const properties = schema.properties || {};
      const required = schema.required || [];
      const propertyEntries = Object.entries(properties);

      if (propertyEntries.length === 0) {
        // Handle additional properties
        if (schema.additionalProperties) {
          if (typeof schema.additionalProperties === 'boolean') {
            return schema.additionalProperties ? 'Record<string, KnownAny>' : '{}';
          } else {
            const valueType = schemaToType(schema.additionalProperties, indentation);
            return `Record<string, ${valueType}>`;
          }
        }
        return '{}';
      }

      const props = propertyEntries
        .map(([propName, propSchema]) => {
          if (typeof propSchema === 'boolean') {
            const type = propSchema ? 'KnownAny' : 'never';
            const isOptional = !required.includes(propName);
            const jsDoc = getJSDoc(propSchema, indentation);
            return `${jsDoc}\n${indentation}${propName}${isOptional ? '?' : ''}: ${type};`;
          }

          const isOptional = !required.includes(propName);
          const defaultValue =
            propSchema.default !== undefined ? ` // default: ${JSON.stringify(propSchema.default)}` : '';
          const jsDoc = getJSDoc(propSchema, indentation);
          const propType = schemaToType(propSchema, indentation + '  ');

          return `${jsDoc}\n${indentation}${propName}${isOptional ? '?' : ''}: ${propType};${defaultValue}`;
        })
        .join('\n');

      // Handle additional properties
      let additionalPropsType = '';
      if (schema.additionalProperties) {
        if (typeof schema.additionalProperties === 'boolean') {
          if (schema.additionalProperties) {
            additionalPropsType = `\n${indentation}[key: string]: KnownAny;`;
          }
        } else {
          const valueType = schemaToType(schema.additionalProperties, indentation + '  ');
          additionalPropsType = `\n${indentation}[key: string]: ${valueType};`;
        }
      }

      return `{\n${props}${additionalPropsType}\n${indentation.slice(2)}}`;
    }

    if (schema.type === 'array' && schema.items) {
      if (Array.isArray(schema.items)) {
        // Tuple
        const tupleTypes = schema.items.map((item) => schemaToType(item, indentation));
        let tupleType = `[${tupleTypes.join(', ')}]`;

        // Handle additional items
        if (schema.additionalItems === true) {
          tupleType += ' & KnownAny[]';
        } else if (typeof schema.additionalItems === 'object') {
          const additionalType = schemaToType(schema.additionalItems, indentation);
          tupleType += ` & ${additionalType}[]`;
        }

        return tupleType;
      } else {
        // Array
        return `${schemaToType(schema.items, indentation)}[]`;
      }
    }

    // Handle multiple types
    if (Array.isArray(schema.type)) {
      return schema.type
        .map((t) => {
          const singleTypeSchema = { ...schema, type: t };
          singleTypeSchema.type = t;
          return schemaToType(singleTypeSchema, indentation);
        })
        .join(' | ');
    }

    // Handle primitive types
    switch (schema.type) {
      case 'string':
        return 'string';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'null':
        return 'null';
      case 'array':
        return 'KnownAny[]'; // For arrays with no items defined
      default:
        return 'KnownAny';
    }
  };

  // Generate the interface
  const jsDoc = getJSDoc(schema);
  const interfaceBody = schemaToType(schema);

  return `${jsDoc}\n${interfaceBody}`;
}
