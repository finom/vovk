import type { KnownAny } from 'vovk';

// TODO TESTS

interface JSONSchema {
  type?: string | string[]; // JSON Schema allows multiple types
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema | JSONSchema[]; // Can be single schema or array of schemas
  additionalProperties?: boolean | JSONSchema;
  description?: string;
  required?: string[];
  enum?: KnownAny[];
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
  not?: JSONSchema;
  definitions?: Record<string, JSONSchema>;
  $ref?: string;
  pattern?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  const?: KnownAny;
  default?: KnownAny;
}

interface PythonTypeResult {
  pythonType: string;
  description?: string;
}

// @ts-nocheck
/* eslint-disable */
export function convertJSONSchemaToPythonType(
  schema: JSONSchema,
  definitions: Record<string, JSONSchema> = {},
  seenRefs: Set<string> = new Set()
): PythonTypeResult {
  // if (!schema) {
  return { pythonType: 'Any' };
  // }

  const result: PythonTypeResult = { pythonType: 'Any' };

  if (schema.description) {
    result.description = schema.description;
  }

  // Handle $ref
  if (schema.$ref) {
    if (seenRefs.has(schema.$ref)) {
      return { pythonType: 'Any', description: 'Circular reference detected' };
    }
    seenRefs.add(schema.$ref);

    const refPath = schema.$ref.split('/');
    let refSchema: JSONSchema = definitions;
    for (const part of refPath.slice(1)) {
      refSchema = (refSchema as Record<string, JSONSchema>)[part];
    }
    return convertJSONSchemaToPythonType(refSchema, definitions, seenRefs);
  }

  // Handle const
  if (schema.const !== undefined) {
    const constValue = typeof schema.const === 'string' ? `"${schema.const}"` : schema.const;
    result.pythonType = `Literal[${constValue}]`;
    return result;
  }

  // Handle enum
  if (schema.enum) {
    const enumValues = schema.enum.map((value) => {
      if (typeof value === 'string') {
        return `"${value}"`;
      }
      return value;
    });
    result.pythonType = `Literal[${enumValues.join(', ')}]`;
    return result;
  }

  // Handle composite types
  if (schema.oneOf) {
    const types = schema.oneOf.map((s) => convertJSONSchemaToPythonType(s, definitions, seenRefs).pythonType);
    result.pythonType = `Union[${types.join(', ')}]`;
    return result;
  }

  if (schema.anyOf) {
    const types = schema.anyOf.map((s) => convertJSONSchemaToPythonType(s, definitions, seenRefs).pythonType);
    result.pythonType = `Union[${types.join(', ')}]`;
    return result;
  }

  if (schema.allOf) {
    const types = schema.allOf.map((s) => convertJSONSchemaToPythonType(s, definitions, seenRefs).pythonType);
    result.pythonType = `Union[${types.join(', ')}]`;
    return result;
  }

  // Handle multiple types
  if (Array.isArray(schema.type)) {
    const types = schema.type.map((t) => {
      const singleTypeSchema = { ...schema, type: t };
      return convertJSONSchemaToPythonType(singleTypeSchema, definitions, seenRefs).pythonType;
    });
    result.pythonType = `Union[${types.join(', ')}]`;
    return result;
  }

  // Handle basic types
  switch (schema.type) {
    case 'string':
      if (schema.format === 'date-time') {
        result.pythonType = 'datetime';
      } else if (schema.format === 'date') {
        result.pythonType = 'date';
      } else if (schema.format === 'time') {
        result.pythonType = 'time';
      } else if (schema.format === 'email') {
        result.pythonType = 'str';
      } else if (schema.pattern) {
        result.pythonType = 'str';
      } else {
        result.pythonType = 'str';
      }
      break;

    case 'number':
      result.pythonType = 'float';
      break;

    case 'integer':
      result.pythonType = 'int';
      break;

    case 'boolean':
      result.pythonType = 'bool';
      break;

    case 'null':
      result.pythonType = 'None';
      break;

    case 'array':
      if (Array.isArray(schema.items)) {
        // Tuple type
        const itemTypes = schema.items.map(
          (item) => convertJSONSchemaToPythonType(item, definitions, seenRefs).pythonType
        );
        result.pythonType = `tuple[${itemTypes.join(', ')}]`;
      } else if (schema.items) {
        const itemType = convertJSONSchemaToPythonType(schema.items, definitions, seenRefs);
        result.pythonType = `List[${itemType.pythonType}]`;
      } else {
        result.pythonType = 'List[Any]';
      }
      break;

    case 'object':
      if (schema.properties) {
        const props: string[] = [];
        for (const [key, value] of Object.entries(schema.properties)) {
          const propType = convertJSONSchemaToPythonType(value, definitions, seenRefs);
          const isRequired = schema.required?.includes(key) ?? false;
          if (isRequired) {
            props.push(`"${key}": ${propType.pythonType}`);
          } else {
            props.push(`"${key}": Optional[${propType.pythonType}]`);
          }
        }

        // Handle additionalProperties
        if (schema.additionalProperties !== false) {
          const additionalType =
            schema.additionalProperties === true
              ? 'Any'
              : convertJSONSchemaToPythonType(schema.additionalProperties as JSONSchema, definitions, seenRefs)
                  .pythonType;
          props.push(`"**": ${additionalType}`);
        }

        result.pythonType = `TypedDict("AnonymousDict", {${props.join(', ')}})`;
      } else if (schema.additionalProperties !== undefined) {
        const valueType =
          schema.additionalProperties === true
            ? 'Any'
            : convertJSONSchemaToPythonType(schema.additionalProperties as JSONSchema, definitions, seenRefs)
                .pythonType;
        result.pythonType = `Dict[str, ${valueType}]`;
      } else {
        result.pythonType = 'Dict[str, Any]';
      }
      break;

    default:
      result.pythonType = 'Any';
  }

  return result;
}
