import type { VovkSimpleJSONSchema } from 'vovk';

interface ConvertOptions {
  schema: VovkSimpleJSONSchema;
  namespace: string;
  className: string;
  pad: number;
}

/**
 * Check if a schema represents a file upload field (format: binary)
 */
function isFileUploadSchema(s: VovkSimpleJSONSchema): boolean {
  // Check if it's a string with format: binary
  if (s.type === 'string' && s.format === 'binary') {
    return true;
  }

  // Check if it's an array of type with string included and format: binary
  if (Array.isArray(s.type) && s.type.includes('string') && s.format === 'binary') {
    return true;
  }

  // Check if it's an array of files
  if (s.type === 'array' && s.items) {
    if (Array.isArray(s.items)) {
      // For tuple-style items, check if any is a file
      return s.items.some((item) => isFileUploadSchema(item));
    } else {
      return isFileUploadSchema(s.items);
    }
  }

  return false;
}

export function hasFiles(schema: VovkSimpleJSONSchema): boolean {
  return Object.values(schema.properties ?? {}).some((prop) => isFileUploadSchema(prop));
}

export function hasNormalData(schema: VovkSimpleJSONSchema): boolean {
  return Object.values(schema.properties ?? {}).some((prop) => !isFileUploadSchema(prop));
}

/**
 * Convert a JSON schema to Python type definitions (TypedDict and others).
 * Returns a string containing Python code with all needed classes and the top-level type.
 * This version EXCLUDES file upload properties (format: binary).
 */
export function convertJSONSchemaToPythonDataType(options: ConvertOptions): string {
  const { schema, namespace, className, pad } = options;

  if (!schema) return '';

  // A buffer to collect the generated class definitions, in order of creation.
  const classDefinitions: string[] = [];

  // To avoid re-generating the same schema multiple times
  const seenObjects = new Map<VovkSimpleJSONSchema, string>();

  /**
   * Turn a schema into a Python type expression
   */
  function buildType(s: VovkSimpleJSONSchema, propNameForParent: string): string {
    // Skip file upload schemas at the type level
    if (isFileUploadSchema(s)) {
      return 'Any'; // This will be filtered out at property level
    }

    // For convenience, handle arrays of type or single type
    const allTypes = Array.isArray(s.type) ? s.type : s.type ? [s.type] : [];

    // 1. Enums
    if (s.enum && s.enum.length > 0) {
      const literalValues = s.enum.map((val) => (typeof val === 'string' ? `"${val}"` : val));
      return `Literal[${literalValues.join(', ')}]`;
    }

    // 2. allOf
    if (s.allOf && s.allOf.length > 0) {
      const merged: VovkSimpleJSONSchema = {
        type: 'object',
        properties: {},
        required: [],
      };
      for (const sub of s.allOf) {
        const subType = sub.type;
        if (!subType || subType === 'object') {
          merged.properties = {
            ...merged.properties,
            ...sub.properties,
          };
          if (sub.required) {
            merged.required = Array.from(new Set([...merged.required!, ...sub.required]));
          }
        }
      }
      return buildType(merged, propNameForParent);
    }

    // 3. anyOf / oneOf => Union
    if (s.anyOf && s.anyOf.length > 0) {
      const subTypes = s.anyOf.map((sub, i) => buildType(sub, propNameForParent + `_anyOf_${i}`));
      return `Union[${subTypes.join(', ')}]`;
    }
    if (s.oneOf && s.oneOf.length > 0) {
      const subTypes = s.oneOf.map((sub, i) => buildType(sub, propNameForParent + `_oneOf_${i}`));
      return `Union[${subTypes.join(', ')}]`;
    }

    // 4. If we can detect multiple types, produce a Union
    if (allTypes.length > 1) {
      const subTypes = allTypes.map((t) => buildType({ ...s, type: t }, propNameForParent));
      return `Union[${subTypes.join(', ')}]`;
    }

    // 5. If there's exactly one type
    if (allTypes.length === 1) {
      switch (allTypes[0]) {
        case 'string':
          return 'str';
        case 'boolean':
          return 'bool';
        case 'integer':
          return 'int';
        case 'number':
          return 'float';
        case 'null':
          return 'None';
        case 'array':
          if (Array.isArray(s.items)) {
            const tupleTypes = s.items.map((sub, i) => buildType(sub, propNameForParent + `_items_${i}`));
            return `Tuple[${tupleTypes.join(', ')}]`;
          } else if (s.items) {
            const itemType = buildType(s.items, propNameForParent + `_items`);
            return `List[${itemType}]`;
          } else {
            return `List[Any]`;
          }

        case 'object': {
          if (seenObjects.has(s)) {
            return seenObjects.get(s)!;
          }

          const isTopLevel = propNameForParent === className;
          const newClassName = isTopLevel ? className : `__${propNameForParent}`;
          const fullyQualifiedName = `${namespace}.${newClassName}`;

          seenObjects.set(s, fullyQualifiedName);

          const lines: string[] = [];
          lines.push(`class ${newClassName}(TypedDict):`);

          if (s.title || s.description) {
            lines.push(`    """`);
            if (s.title) {
              lines.push(`    ${s.title}`);
            }
            if (s.title && s.description) {
              lines.push(``);
            }
            if (s.description) {
              const descLines = s.description.split('\n');
              for (const descLine of descLines) {
                lines.push(`    ${descLine}`);
              }
            }
            lines.push(`    """`);
          }

          const props = s.properties || {};
          const required = new Set(s.required || []);

          // Filter out file upload properties
          const nonFileProps = Object.entries(props).filter(([, propSchema]) => !isFileUploadSchema(propSchema));

          if (nonFileProps.length === 0) {
            lines.push(`    pass`);
          } else {
            for (const [propName, propSchema] of nonFileProps) {
              const isRequired = required.has(propName);
              const childPropPath = `${propNameForParent}_${propName}`;
              const childPropType = buildType(propSchema, childPropPath);
              const finalType = isRequired ? childPropType : `Optional[${childPropType}]`;
              lines.push(`    ${propName}: ${finalType}`);
            }
          }

          classDefinitions.push(lines.join('\n'));
          return fullyQualifiedName;
        }
        default:
          return 'Any';
      }
    }

    return 'Any';
  }

  const topLevelTypeName = buildType(schema, className);

  const isTypedDictTop =
    topLevelTypeName === `${namespace}.${className}` &&
    classDefinitions.some((def) => def.startsWith(`class ${className}(`));

  if (!isTypedDictTop) {
    classDefinitions.push(`${className} = ${topLevelTypeName}`);
  }

  // If there are no non-file properties, return an empty TypedDict
  if (classDefinitions.length === 0) {
    classDefinitions.push(`class ${className}(TypedDict):\n    pass`);
  }

  return classDefinitions
    .join('\n')
    .split('\n')
    .map((line) => `${' '.repeat(pad)}${line}`)
    .join('\n');
}

export function convertJSONSchemaToPythonFilesType(options: ConvertOptions): string {
  const { schema, className, pad } = options;

  if (!schema || schema.type !== 'object') {
    // Files must be in an object schema
    return '';
  }

  const lines: string[] = [];
  const props = schema.properties || {};
  const required = new Set(schema.required || []);

  // Filter to only file upload properties
  const fileProps = Object.entries(props).filter(([, propSchema]) => isFileUploadSchema(propSchema));

  if (fileProps.length === 0) {
    return '';
  }

  // Check if any property is an array (multiple files)
  const hasArrayFields = fileProps.some(([, propSchema]) => propSchema.type === 'array');

  // If there are array fields or multiple fields, use List[Tuple[...]] format
  // Otherwise, use TypedDict for single fields
  if (hasArrayFields || fileProps.length > 1) {
    // Generate as a type alias for list of tuples
    lines.push(`# File upload type for requests library`);
    lines.push(`# Use as: files=${className}Value where ${className}Value is a list of tuples`);

    // Add docstring if exists
    if (schema.title || schema.description) {
      lines.push(`"""`);
      if (schema.title) {
        lines.push(`${schema.title} - File Uploads`);
      }
      if (schema.title && schema.description) {
        lines.push(``);
      }
      if (schema.description) {
        const descLines = schema.description.split('\n');
        for (const descLine of descLines) {
          lines.push(`${descLine}`);
        }
      }
      lines.push(`"""`);
    }

    // Define the file tuple type
    const fileTupleType =
      'Union[Tuple[str, BinaryIO], Tuple[str, BinaryIO, str], Tuple[str, BinaryIO, str, Dict[str, str]]]';

    // Generate the type alias
    lines.push(`${className} = List[Tuple[str, ${fileTupleType}]]`);
    lines.push(``);

    // Add example usage
    lines.push(`# Example usage:`);
    lines.push(`# ${className.toLowerCase()}: ${className} = [`);

    for (const [propName, propSchema] of fileProps) {
      if (propSchema.type === 'array') {
        lines.push(`#     ('${propName}', ('file1.pdf', open('file1.pdf', 'rb'), 'application/pdf')),`);
        lines.push(`#     ('${propName}', ('file2.pdf', open('file2.pdf', 'rb'), 'application/pdf')),`);
      } else {
        lines.push(`#     ('${propName}', ('file.jpg', open('file.jpg', 'rb'), 'image/jpeg')),`);
      }
    }
    lines.push(`# ]`);
    lines.push(`# response = requests.post(url, files=${className.toLowerCase()})`);
  } else {
    const [propName] = fileProps[0];
    const isRequired = required.has(propName);

    lines.push(`class ${className}(TypedDict):`);

    // Add docstring if exists
    if (schema.title || schema.description) {
      lines.push(`    """`);
      if (schema.title) {
        lines.push(`    ${schema.title} - File Upload`);
      }
      if (schema.title && schema.description) {
        lines.push(``);
      }
      if (schema.description) {
        const descLines = schema.description.split('\n');
        for (const descLine of descLines) {
          lines.push(`    ${descLine}`);
        }
      }
      lines.push(`    """`);
    }

    // Single file type
    const fileType =
      'Union[BinaryIO, Tuple[str, BinaryIO], Tuple[str, BinaryIO, str], Tuple[str, BinaryIO, str, Dict[str, str]]]';
    const finalType = isRequired ? fileType : `Optional[${fileType}]`;

    lines.push(`    ${propName}: ${finalType}`);
    lines.push(`    # Example: open('file.jpg', 'rb') or ('filename.jpg', open('file.jpg', 'rb'), 'image/jpeg')`);
  }

  return lines.map((line) => `${' '.repeat(pad)}${line}`).join('\n');
}
