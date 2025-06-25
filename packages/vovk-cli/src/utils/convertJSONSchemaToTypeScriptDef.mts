import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import type { KnownAny } from 'vovk';

export function convertJSONSchemaToTypeScriptDef(schema: JSONSchema7): string | null {
  if (!schema) return null;

  // Helper function to escape single quotes in string literals
  const escapeStringLiteral = (str: string): string => {
    return str.replace(/'/g, "\\'");
  };

  // Helper function to escape JSDoc comment closing sequences
  const escapeJSDocComment = (str: string): string => {
    return str.replace(/\*\//g, '*\\/');
  };

  // Helper function to check if a property name is a valid JavaScript identifier
  const isValidIdentifier = (name: string): boolean => {
    // Check if it matches valid JavaScript identifier pattern and is not a reserved word
    return (
      /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) &&
      ![
        'break',
        'case',
        'catch',
        'class',
        'const',
        'continue',
        'debugger',
        'default',
        'delete',
        'do',
        'else',
        'export',
        'extends',
        'false',
        'finally',
        'for',
        'function',
        'if',
        'import',
        'in',
        'instanceof',
        'new',
        'null',
        'return',
        'super',
        'switch',
        'this',
        'throw',
        'true',
        'try',
        'typeof',
        'var',
        'void',
        'while',
        'with',
        'let',
        'static',
        'yield',
        'enum',
        'await',
        'implements',
        'interface',
        'package',
        'private',
        'protected',
        'public',
      ].includes(name)
    );
  };

  // Helper function to format property name (with quotes if needed)
  const formatPropertyName = (name: string): string => {
    if (isValidIdentifier(name)) {
      return name;
    } else {
      return `'${escapeStringLiteral(name)}'`;
    }
  };

  // Helper function to resolve $ref references
  const resolveRef = (ref: string): JSONSchema7Definition | null => {
    if (!ref.startsWith('#/')) return null;

    const path = ref.substring(2).split('/');
    let currentSchema: KnownAny = schema;

    for (const segment of path) {
      if (!currentSchema || typeof currentSchema !== 'object') {
        return null;
      }
      currentSchema = currentSchema[segment];
    }

    return currentSchema || null;
  };

  // Helper function to get JSDoc from schema
  const getJSDoc = (schema: JSONSchema7 | boolean, indentation = ''): string => {
    if (typeof schema === 'boolean') {
      return '';
    }
    const description = schema.description || schema.title;
    if (!description) {
      return '';
    }
    const safeDescription = escapeJSDocComment(description);
    return `${indentation}/**\n${indentation} * ${safeDescription}\n${indentation} */`;
  };

  // Helper function to convert schema to TypeScript type
  const schemaToType = (schema: JSONSchema7 | JSONSchema7Definition, indentation = '  '): string => {
    if (typeof schema === 'boolean') {
      return schema ? 'KnownAny' : 'never';
    }

    // Handle $ref references - check this first before other properties
    if (schema.$ref) {
      const resolvedSchema = resolveRef(schema.$ref);
      if (resolvedSchema) {
        return schemaToType(resolvedSchema, indentation);
      } else {
        // If we can't resolve the reference, use the reference name as type
        const refName = schema.$ref.split('/').pop();
        // eslint-disable-next-line no-console
        console.warn(`Warning: Could not resolve reference ${schema.$ref}`);
        return refName || 'KnownAny';
      }
    }

    if (schema.enum) {
      return schema.enum
        .map((value) => {
          if (typeof value === 'string') {
            return `'${escapeStringLiteral(value)}'`;
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
        return `'${escapeStringLiteral(schema.const)}'`;
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
            return `${jsDoc}\n${indentation}${formatPropertyName(propName)}${isOptional ? '?' : ''}: ${type};`;
          }

          const isOptional = !required.includes(propName);
          const defaultValue =
            propSchema.default !== undefined ? ` // default: ${JSON.stringify(propSchema.default)}` : '';
          const jsDoc = getJSDoc(propSchema, indentation);
          const propType = schemaToType(propSchema, indentation + '  ');

          return [
            `${jsDoc}`,
            `${indentation}${formatPropertyName(propName)}${isOptional ? '?' : ''}: ${propType};${defaultValue}`,
          ]
            .filter(Boolean)
            .join('\n');
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
        return 'undefined';
    }
  };

  // Generate the interface
  const jsDoc = getJSDoc(schema);
  const interfaceBody = schemaToType(schema);

  return `${jsDoc}\n${interfaceBody}`;
}
