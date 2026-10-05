import type { VovkJSONSchemaBase } from 'vovk';

interface ConvertOptions {
  schema: VovkJSONSchemaBase;
  namespace: string;
  className: string;
  pad: number;
}

// biome-ignore format: a word list
const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
  'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or',
  'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

// Schema text comes from the project or from a third-party OpenAPI document, so it never reaches the generated code
// unescaped: these helpers turn it into Python literals, identifiers, docstrings and comments

// JSON string escapes are valid Python string escapes
export function toPythonString(value: string): string {
  return JSON.stringify(value);
}

// with a set of the names a scope already has, a taken name gets the first free suffix: name_2, name_3, …
export function toPythonIdentifier(name: string, used?: Set<string>): string {
  const base = name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^(?=[0-9])/, '_') || '_';
  const ident = PYTHON_KEYWORDS.has(base) ? `${base}_` : base;
  if (!used) return ident;
  let candidate = ident;
  for (let i = 2; used.has(candidate); i++) candidate = `${ident}_${i}`;
  used.add(candidate);
  return candidate;
}

// lines for a """ docstring: a quote or a backslash would end the string or start an escape
export function toPythonDocstringLines(text: string): string[] {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .split(/\r\n|\r|\n/)
    .map((line) => line.replace(/\p{Cc}/gu, (char) => `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`));
}

// one comment line: a line break would end the comment
export function toPythonCommentText(text: string): string {
  return text.replace(/\p{Cc}+/gu, ' ');
}

// a key a TypedDict class body can declare: Python mangles __private names, and keywords or dashes don't parse
function isPlainPythonName(name: string): boolean {
  return (
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) &&
    !PYTHON_KEYWORDS.has(name) &&
    !(name.startsWith('__') && !name.endsWith('__'))
  );
}

function toPythonLiteral(value: unknown): string | null {
  if (typeof value === 'string') return toPythonString(value);
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (value === null) return 'None';
  return null;
}

/**
 * Check if a schema represents a file upload field (format: binary)
 */
function isFileUploadSchema(s: VovkJSONSchemaBase): boolean {
  // Check if it's a string with format: binary
  if (s.type === 'string' && s.format === 'binary') {
    return true;
  }

  // Check if it's an array of type with string included and format: binary
  if (Array.isArray(s.type) && s.type.includes('string') && s.format === 'binary') {
    return true;
  }

  // Check if it's an array of files
  if (s.type === 'array' && s.items && typeof s.items !== 'boolean') {
    if (Array.isArray(s.items)) {
      // For tuple-style items, check if any is a file
      return s.items.some((item) => typeof item !== 'boolean' && isFileUploadSchema(item));
    } else {
      return isFileUploadSchema(s.items);
    }
  }

  return false;
}

// a mixin body may be a bare $ref into its own $defs
function resolveTopLevelRef(schema: VovkJSONSchemaBase): VovkJSONSchemaBase {
  const name = schema.$ref?.startsWith('#/') ? schema.$ref.split('/').pop() : undefined;
  return (name && (schema.$defs?.[name] ?? schema.definitions?.[name])) || schema;
}

export function hasFiles(schema: VovkJSONSchemaBase): boolean {
  return Object.values(resolveTopLevelRef(schema).properties ?? {}).some((prop) => isFileUploadSchema(prop));
}

export function hasNormalData(schema: VovkJSONSchemaBase): boolean {
  const { properties } = resolveTopLevelRef(schema);
  // without listed properties, as in an array, a union or a record, any of it may be data
  return !properties || Object.values(properties).some((prop) => !isFileUploadSchema(prop));
}

/**
 * Determine the body kind from the schema's x-contentType and format fields.
 * Returns 'none', 'form', 'binary', 'text', or 'json'.
 */
export function getBodyKind(schema: VovkJSONSchemaBase | undefined): 'none' | 'form' | 'binary' | 'text' | 'json' {
  if (!schema) return 'none';
  const ct = schema['x-contentType'] as string[] | undefined;
  if (ct?.includes('multipart/form-data') || ct?.includes('application/x-www-form-urlencoded')) return 'form';
  if (schema.format === 'binary' || schema.contentEncoding === 'binary') return 'binary';
  // an object or an array goes out as JSON, whatever else the procedure declares
  const isStructured = schema.type === 'object' || schema.type === 'array' || !!schema.properties;
  if (!isStructured && ct?.some((c: string) => c.startsWith('text/'))) return 'text';
  // a declared non JSON content type on a scalar body means raw bytes, e.g. application/octet-stream or image/png
  const isJSONContentType = (c: string) => c === '*/*' || c === 'application/json' || c.endsWith('+json');
  if (!isStructured && ct?.length && !ct.some(isJSONContentType)) return 'binary';
  return 'json';
}

// a text body goes out as the type the procedure declares, as the TypeScript client sends it
export function getTextContentType(schema: VovkJSONSchemaBase | undefined): string {
  const isTextLike = (type: string) =>
    !type.includes('*') &&
    !['multipart/form-data', 'application/x-www-form-urlencoded', 'application/json'].includes(type) &&
    !type.endsWith('+json');
  return (schema?.['x-contentType'] as string[] | undefined)?.find(isTextLike) ?? 'text/plain';
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
  const seenObjects = new Map<VovkJSONSchemaBase, string>();

  // $defs, definitions and components/schemas become one class each, referenced by name
  const namedSchemas: Record<string, VovkJSONSchemaBase> = {
    ...(schema as { components?: { schemas?: Record<string, VovkJSONSchemaBase> } }).components?.schemas,
    ...schema.definitions,
    ...schema.$defs,
  };
  const namedTypeNames = new Map<string, string>();

  // one call's classes and aliases share the namespace's class body, so their names are unique together;
  // one leading underscore, as Python mangles __names inside a class body
  const usedNames = new Set<string>([className]);
  function uniqueName(base: string): string {
    const ident = base.replace(/[^A-Za-z0-9_]/g, '_');
    let name = ident;
    let i = 2;
    while (usedNames.has(name)) name = `${ident}_${i++}`;
    usedNames.add(name);
    return name;
  }

  function refNameOf(ref: string): string | undefined {
    return ref.startsWith('#/') ? ref.split('/').pop() : undefined;
  }

  // buildType marks the names it writes: a TypedDict annotation is evaluated later and takes the full name,
  // an alias is evaluated at once in the class body and takes the local one, or Any while it is still being built
  const unfinished = new Set<string>();
  // a NUL never reaches a type expression: identifiers are sanitized and literals are JSON-escaped
  const MARK = '\u0000';
  const reference = (name: string) => `${MARK}${name}${MARK}`;
  const settle = (code: string, isEager: boolean) =>
    code
      .split(MARK)
      .map((part, i) => {
        if (i % 2 === 0) return part;
        if (!isEager) return `${namespace}.${part}`;
        return unfinished.has(part) ? 'Any' : part;
      })
      .join('');

  /**
   * Turn a schema into a Python type expression
   */
  function buildType(s: VovkJSONSchemaBase, propNameForParent: string, forcedClassName?: string): string {
    // Skip file upload schemas at the type level
    if (isFileUploadSchema(s)) {
      return 'Any'; // This will be filtered out at property level
    }

    // 0. Named $ref: point at the shared class, registering it first so cycles terminate
    if (s.$ref) {
      const refName = refNameOf(s.$ref);
      if (!refName || !namedSchemas[refName]) return 'Any';

      const known = namedTypeNames.get(refName);
      if (known) return reference(known);

      const localName = uniqueName(`_${className}_${refName}`);
      namedTypeNames.set(refName, localName);

      unfinished.add(localName);
      const built = buildType(namedSchemas[refName], localName.slice(1), localName);
      // non-object definitions (enums, primitives) need an alias to keep the reference valid
      if (built !== reference(localName)) {
        classDefinitions.push(`${localName} = ${settle(built, true)}`);
      }
      unfinished.delete(localName);

      return reference(localName);
    }

    // For convenience, handle arrays of type or single type
    const allTypes = Array.isArray(s.type) ? s.type : s.type ? [s.type] : [];

    // 1. Enums
    if (s.enum && s.enum.length > 0) {
      const literalValues = s.enum.map(toPythonLiteral).filter((literal) => literal !== null);
      return literalValues.length ? `Literal[${literalValues.join(', ')}]` : 'Any';
    }

    // 2. allOf
    if (s.allOf && s.allOf.length > 0) {
      const merged: VovkJSONSchemaBase = {
        type: 'object',
        title: s.title,
        description: s.description,
        properties: {},
        required: [],
      };
      // a member may be a $ref or an allOf itself, and the schema may list its own properties next to allOf
      const seen = new Set<VovkJSONSchemaBase>();
      const mergeMember = (member: VovkJSONSchemaBase) => {
        const resolved = member.$ref ? namedSchemas[refNameOf(member.$ref) ?? ''] : member;
        if (!resolved || seen.has(resolved)) return;
        seen.add(resolved);
        resolved.allOf?.forEach(mergeMember);
        if (resolved.type && resolved.type !== 'object') return;
        merged.properties = { ...merged.properties, ...resolved.properties };
        merged.required = Array.from(new Set([...(merged.required ?? []), ...(resolved.required ?? [])]));
      };
      s.allOf.forEach(mergeMember);
      mergeMember({ type: s.type, properties: s.properties, required: s.required });
      return buildType(merged, propNameForParent);
    }

    // 3. anyOf / oneOf => Union
    if (s.anyOf && s.anyOf.length > 0) {
      const subTypes = s.anyOf.map((sub, i) => buildType(sub, `${propNameForParent}_anyOf_${i}`));
      return `Union[${subTypes.join(', ')}]`;
    }
    if (s.oneOf && s.oneOf.length > 0) {
      const subTypes = s.oneOf.map((sub, i) => buildType(sub, `${propNameForParent}_oneOf_${i}`));
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
            const tupleTypes = s.items
              .filter((sub): sub is VovkJSONSchemaBase => typeof sub !== 'boolean')
              .map((sub, i) => buildType(sub, `${propNameForParent}_items_${i}`));
            return `Tuple[${tupleTypes.join(', ')}]`;
          } else if (s.items && typeof s.items !== 'boolean') {
            const itemType = buildType(s.items, `${propNameForParent}_items`);
            return `List[${itemType}]`;
          } else {
            return `List[Any]`;
          }

        case 'object': {
          // a record: no listed keys, every value matches one schema
          const values = s.additionalProperties;
          if (!s.properties && ('propertyNames' in s || (values !== undefined && values !== false))) {
            return `Dict[str, ${typeof values === 'object' ? buildType(values, `${propNameForParent}_values`) : 'Any'}]`;
          }

          if (seenObjects.has(s)) {
            // biome-ignore lint/style/noNonNullAssertion: TODO
            return seenObjects.get(s)!;
          }

          const isTopLevel = propNameForParent === className;
          const newClassName = forcedClassName ?? (isTopLevel ? className : uniqueName(`_${propNameForParent}`));

          seenObjects.set(s, reference(newClassName));

          const required = new Set(s.required || []);
          // file upload properties go to the Files type
          const fields = Object.entries(s.properties || {})
            .filter(([, propSchema]) => !isFileUploadSchema(propSchema))
            .map(([propName, propSchema]) => {
              const childType = buildType(propSchema, `${propNameForParent}_${propName}`);
              // a key that may be missing, not one that may be None
              return [propName, required.has(propName) ? childType : `NotRequired[${childType}]`] as const;
            });
          const docLines = [
            ...(s.title ? toPythonDocstringLines(s.title) : []),
            ...(s.title && s.description ? [''] : []),
            ...(s.description ? toPythonDocstringLines(s.description) : []),
          ];

          const lines: string[] = [];
          if (fields.every(([propName]) => isPlainPythonName(propName))) {
            lines.push(`class ${newClassName}(TypedDict):`);
            if (docLines.length) lines.push('    """', ...docLines.map((line) => `    ${line}`), '    """');
            if (!fields.length) lines.push('    pass');
            for (const [propName, propType] of fields) lines.push(`    ${propName}: ${settle(propType, false)}`);
          } else {
            // keys such as "content-type" or "from" only fit the functional syntax, its types stay lazy as strings
            const entries = fields.map(
              ([propName, propType]) => `${toPythonString(propName)}: ${toPythonString(settle(propType, false))}`
            );
            lines.push(`${newClassName} = TypedDict(${toPythonString(newClassName)}, {${entries.join(', ')}})`);
          }

          classDefinitions.push(lines.join('\n'));
          return reference(newClassName);
        }
        default:
          return 'Any';
      }
    }

    return 'Any';
  }

  const topLevelTypeName = buildType(schema, className);

  const isTypedDictTop =
    topLevelTypeName === reference(className) &&
    classDefinitions.some(
      (def) => def.startsWith(`class ${className}(`) || def.startsWith(`${className} = TypedDict(`)
    );

  if (!isTypedDictTop) {
    classDefinitions.push(`${className} = ${settle(topLevelTypeName, true)}`);
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
  const { className, pad } = options;
  const schema = options.schema && resolveTopLevelRef(options.schema);

  if (schema?.type !== 'object') {
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

  const fileDocLines = (suffix: string) => [
    ...(schema.title ? toPythonDocstringLines(`${schema.title} - ${suffix}`) : []),
    ...(schema.title && schema.description ? [''] : []),
    ...(schema.description ? toPythonDocstringLines(schema.description) : []),
  ];

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
      lines.push(`"""`, ...fileDocLines('File Uploads'), `"""`);
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
        lines.push(`#     (${toPythonString(propName)}, ('file1.pdf', open('file1.pdf', 'rb'), 'application/pdf')),`);
        lines.push(`#     (${toPythonString(propName)}, ('file2.pdf', open('file2.pdf', 'rb'), 'application/pdf')),`);
      } else {
        lines.push(`#     (${toPythonString(propName)}, ('file.jpg', open('file.jpg', 'rb'), 'image/jpeg')),`);
      }
    }
    lines.push(`# ]`);
    lines.push(`# response = requests.post(url, files=${className.toLowerCase()})`);
  } else {
    const [propName] = fileProps[0];
    const isRequired = required.has(propName);

    // Single file type
    const fileType =
      'Union[BinaryIO, Tuple[str, BinaryIO], Tuple[str, BinaryIO, str], Tuple[str, BinaryIO, str, Dict[str, str]]]';
    const finalType = isRequired ? fileType : `Optional[${fileType}]`;

    if (!isPlainPythonName(propName)) {
      lines.push(
        `${className} = TypedDict(${toPythonString(className)}, {${toPythonString(propName)}: ${toPythonString(finalType)}})`
      );
      return lines.map((line) => `${' '.repeat(pad)}${line}`).join('\n');
    }

    lines.push(`class ${className}(TypedDict):`);

    // Add docstring if exists
    if (schema.title || schema.description) {
      lines.push(`    """`, ...fileDocLines('File Upload').map((line) => `    ${line}`), `    """`);
    }

    lines.push(`    ${propName}: ${finalType}`);
    lines.push(`    # Example: open('file.jpg', 'rb') or ('filename.jpg', open('file.jpg', 'rb'), 'image/jpeg')`);
  }

  return lines.map((line) => `${' '.repeat(pad)}${line}`).join('\n');
}
