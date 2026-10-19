import type { VovkJSONSchemaBase } from 'vovk';

interface ConvertOptions {
  schema: VovkJSONSchemaBase;
  namespace: string;
  className: string;
  pad: number;
  // a response never holds a write-only property, so it may be missing there
  direction?: 'request' | 'response';
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

// the class of each RPC module of a package, in schema order: of the modules with one identifier (User$RPC and
// User_RPC are User_RPC) the last keeps it, as a later class of a name replaced an earlier one, and the others get the
// first free suffix; "client" is the ApiClient every method calls
export function getClassNames(rpcModuleNames: string[]): string[] {
  const identifiers = rpcModuleNames.map((name) => toPythonIdentifier(name));
  const used = new Set(['client', ...identifiers]);
  return identifiers.map((identifier, i) =>
    identifier !== 'client' && identifiers.lastIndexOf(identifier) === i
      ? identifier
      : toPythonIdentifier(identifier, used)
  );
}

// the method of each handler of a class, by handler name: in schema order, a name already taken gets the first free
// suffix, so getUserByID and getUserById become get_user_by_id and get_user_by_id_2
export function getMethodNames(handlerNames: string[], toSnakeCase: (name: string) => string): Map<string, string> {
  const used = new Set<string>();
  return new Map(handlerNames.map((name) => [name, toPythonIdentifier(toSnakeCase(name), used)]));
}

// lines for a """ docstring: a quote or a backslash would end the string or start an escape; a third-party OpenAPI
// document may hold a number or any other JSON as a title or a description, which is written as text
export function toPythonDocstringLines(text: unknown): string[] {
  return String(text)
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

// Literal holds a str, an int, a bool or None (PEP 586), not a float: String(1e21) is 1e+21
function toPythonLiteral(value: unknown): string | null {
  if (typeof value === 'string') return toPythonString(value);
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number' && /^-?\d+$/.test(String(value))) return String(value);
  if (value === null) return 'None';
  return null;
}

// the type of an enum value Literal can't hold
function toPythonValueType(value: unknown): string | null {
  if (typeof value === 'number') return 'float';
  if (Array.isArray(value)) return 'List[Any]';
  if (value && typeof value === 'object') return 'Dict[str, Any]';
  return null;
}

// a mixin body may be a bare $ref into its own $defs
function resolveTopLevelRef(schema: VovkJSONSchemaBase): VovkJSONSchemaBase {
  const name = schema.$ref?.startsWith('#/') ? schema.$ref.split('/').pop() : undefined;
  return (name && (schema.$defs?.[name] ?? schema.definitions?.[name])) || schema;
}

const MAX_FILE_SEARCH_DEPTH = 16;

function resolveLocalRef(ref: string, root: VovkJSONSchemaBase): VovkJSONSchemaBase | undefined {
  if (!ref.startsWith('#')) return undefined;
  let current: unknown = root;
  for (const part of ref.slice(1).split('/').filter(Boolean)) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part.replace(/~1/g, '/').replace(/~0/g, '~')];
  }
  return current && typeof current === 'object' ? (current as VovkJSONSchemaBase) : undefined;
}

const isBinary = (s: VovkJSONSchemaBase) => s.format === 'binary' || s.contentEncoding === 'binary';

// a field that goes in files: a file, or a list, a tuple or a combination that may hold one; vovk-rust uses this rule too
function isFileField(s: VovkJSONSchemaBase | undefined, root: VovkJSONSchemaBase, depth = 0): boolean {
  if (!s || typeof s !== 'object' || depth > MAX_FILE_SEARCH_DEPTH) return false;
  if (s.$ref) return isFileField(resolveLocalRef(s.$ref, root), root, depth + 1);
  if (isBinary(s)) return true;
  const items = s.items && typeof s.items === 'object' ? [s.items].flat() : [];
  return [...items, ...(s.prefixItems ?? []), ...(s.anyOf ?? []), ...(s.oneOf ?? []), ...(s.allOf ?? [])].some(
    (branch) => typeof branch === 'object' && isFileField(branch, root, depth + 1)
  );
}

// the objects a body may be: itself and every branch of its unions and intersections
function bodyObjects(s: VovkJSONSchemaBase | undefined, root: VovkJSONSchemaBase, depth = 0): VovkJSONSchemaBase[] {
  if (!s || typeof s !== 'object' || depth > MAX_FILE_SEARCH_DEPTH) return [];
  if (s.$ref) return bodyObjects(resolveLocalRef(s.$ref, root), root, depth + 1);
  const branches = [...(s.allOf ?? []), ...(s.anyOf ?? []), ...(s.oneOf ?? [])];
  return [s, ...branches.flatMap((branch) => bodyObjects(branch, root, depth + 1))];
}

function fileFieldsOf(s: VovkJSONSchemaBase | undefined, root: VovkJSONSchemaBase) {
  return bodyObjects(s, root).flatMap((object) =>
    Object.entries(object.properties ?? {}).filter(([, prop]) => isFileField(prop, root))
  );
}

export function hasFiles(schema: VovkJSONSchemaBase): boolean {
  return fileFieldsOf(schema, schema).length > 0;
}

// a call may send no files when a branch of the body holds none, as a JSON-or-file union
export function areFilesOptional(schema: VovkJSONSchemaBase): boolean {
  const [target] = bodyObjects(schema, schema);
  const branches = target?.anyOf ?? target?.oneOf;
  return !!branches?.some((branch) => !fileFieldsOf(branch, schema).length);
}

export function hasNormalData(schema: VovkJSONSchemaBase): boolean {
  const { properties } = resolveTopLevelRef(schema);
  // without listed properties, as in an array, a union or a record, any of it may be data
  return !properties || Object.values(properties).some((prop) => !isFileField(prop, schema));
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

// the application types the server reads as text, as packages/vovk/src/req/parse-body.ts lists them
// biome-ignore format: a list
const TEXT_APPLICATION_TYPES = [
  'application/xml', 'application/xhtml+xml', 'application/javascript', 'application/x-javascript',
  'application/ecmascript', 'application/yaml', 'application/x-yaml', 'application/graphql', 'application/sql',
  'application/toml', 'application/x-ndjson', 'application/ndjson', 'application/jsonl', 'application/jsonlines',
  'application/x-jsonlines',
];

// a binary body the server reads as text, as application/xml or JSON Lines, also takes a str, as the TypeScript
// client takes a string
export function takesTextBody(schema: VovkJSONSchemaBase | undefined): boolean {
  if (!schema || isBinary(schema) || getBodyKind(schema) !== 'binary') return false;
  const isText = (c: string) =>
    c.startsWith('text/') || TEXT_APPLICATION_TYPES.includes(c) || /\+(xml|text|yaml|json-seq)$/.test(c);
  return (schema['x-contentType'] as string[] | undefined)?.every(isText) ?? false;
}

// a text body goes out as the type the procedure declares, as the TypeScript client sends it
export function getTextContentType(schema: VovkJSONSchemaBase | undefined): string {
  const isTextLike = (type: string) =>
    !type.includes('*') &&
    !['multipart/form-data', 'application/x-www-form-urlencoded', 'application/json'].includes(type) &&
    !type.endsWith('+json');
  return (schema?.['x-contentType'] as string[] | undefined)?.find(isTextLike) ?? 'text/plain';
}

// a mixin body that takes JSON or a form with one schema is an anyOf of that schema once per content type: it is the
// schema itself
function withoutContentTypeAlternatives(schema: VovkJSONSchemaBase): VovkJSONSchemaBase {
  const branches = schema.anyOf;
  if (!branches || branches.length < 2) return schema;
  const [first, ...rest] = branches.map((branch) => {
    const { 'x-contentType': _contentType, 'x-tsType': _tsType, ...shape } = branch as Record<string, unknown>;
    return JSON.stringify(shape);
  });
  if (rest.some((shape) => shape !== first)) return schema;
  const { anyOf: _, ...body } = schema;
  return { ...body, ...JSON.parse(first) };
}

/**
 * Convert a JSON schema to Python type definitions (TypedDict and others).
 * Returns a string containing Python code with all needed classes and the top-level type.
 * This version EXCLUDES file upload properties (format: binary).
 */
export function convertJSONSchemaToPythonDataType(options: ConvertOptions): string {
  const { namespace, className, pad } = options;

  if (!options.schema) return '';
  const schema = withoutContentTypeAlternatives(options.schema);

  const classDefinitions: string[] = [];

  const seenObjects = new Map<VovkJSONSchemaBase, string>();

  // $defs, definitions and components/schemas become one class each, referenced by name
  const namedSchemas: Record<string, VovkJSONSchemaBase> = {
    ...(schema as { components?: { schemas?: Record<string, VovkJSONSchemaBase> } }).components?.schemas,
    ...schema.definitions,
    ...schema.$defs,
  };
  const namedTypeNames = new Map<string, string>();

  // one call's classes and aliases share the namespace's class body, so their names are unique together;
  // one leading underscore, as Python mangles __names inside a class body, also for a type named _x
  const usedNames = new Set<string>([className]);
  function uniqueName(base: string): string {
    const ident = base.replace(/[^A-Za-z0-9_]/g, '_').replace(/^_+/, '_');
    let name = ident;
    let i = 2;
    while (usedNames.has(name)) name = `${ident}_${i++}`;
    usedNames.add(name);
    return name;
  }

  function refNameOf(ref: string): string | undefined {
    return ref.startsWith('#/') ? ref.split('/').pop() : undefined;
  }

  const resolve = (s: VovkJSONSchemaBase): VovkJSONSchemaBase | undefined =>
    s.$ref ? namedSchemas[refNameOf(s.$ref) ?? ''] : s;

  const isWriteOnly = (s: VovkJSONSchemaBase) =>
    [s, resolve(s)].some((target) => (target as { writeOnly?: boolean } | undefined)?.writeOnly === true);

  // the unions an allOf is being distributed over, so a union that holds itself is distributed once
  const distributing = new Set<VovkJSONSchemaBase>();

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

  // the Python type expression of a schema
  function buildType(s: VovkJSONSchemaBase, propNameForParent: string, forcedClassName?: string): string {
    // a file property is left out of its object before it gets here; a file anywhere else is Any
    if (isBinary(s)) {
      return 'Any';
    }

    // a named $ref points at one shared class, registered before it is built so a cycle ends
    if (s.$ref) {
      const refName = refNameOf(s.$ref);
      if (!refName || !namedSchemas[refName]) return 'Any';

      const known = namedTypeNames.get(refName);
      if (known) return reference(known);

      const localName = uniqueName(`_${className}_${refName}`);
      namedTypeNames.set(refName, localName);

      unfinished.add(localName);
      const built = buildType(namedSchemas[refName], localName.slice(1), localName);
      // non-object definitions (enums, primitives) need an alias to keep the reference valid; in a class body mypy
      // takes `Name = str` for a variable, `Name: TypeAlias = str` for a type
      if (built !== reference(localName)) {
        classDefinitions.push(`${localName}: TypeAlias = ${settle(built, true)}`);
      }
      unfinished.delete(localName);

      return reference(localName);
    }

    const allTypes = Array.isArray(s.type) ? s.type : s.type ? [s.type] : [];

    if (s.enum && s.enum.length > 0) {
      const literalValues = s.enum.map(toPythonLiteral).filter((literal) => literal !== null);
      const otherTypes = new Set(
        s.enum.flatMap((value) => (toPythonLiteral(value) === null ? (toPythonValueType(value) ?? []) : []))
      );
      const parts = [...(literalValues.length ? [`Literal[${literalValues.join(', ')}]`] : []), ...otherTypes];
      return parts.length > 1 ? `Union[${parts.join(', ')}]` : (parts[0] ?? 'Any');
    }

    // an object, or an object that may be null, as OpenAPI 3.0's nullable becomes
    const takesObject = (target: VovkJSONSchemaBase) => !target.type || [target.type].flat().includes('object');

    if (s.allOf && s.allOf.length > 0) {
      // checks on a scalar, as zod writes startsWith().endsWith() or two regex(): the scalar, unless a member names
      // its values
      if (!takesObject(s) && !s.allOf.some((member) => resolve(member)?.enum)) {
        const { allOf: _, ...own } = s;
        return buildType(own, propNameForParent, forcedClassName);
      }
      // a lone member that isn't an object with keys, as an enum OpenAPI 3.0 wraps to describe it, is that member
      const lone = s.allOf.length === 1 && !s.properties ? resolve(s.allOf[0]) : undefined;
      if (lone && !lone.properties && !lone.allOf) return buildType(s.allOf[0], propNameForParent);
      // a member with branches: an object for each branch with the other members
      const branching = s.allOf.find((member) => {
        const resolved = resolve(member);
        return resolved && !distributing.has(resolved) && (resolved.anyOf?.length || resolved.oneOf?.length);
      });
      const union = branching && resolve(branching);
      if (union) {
        distributing.add(union);
        const { anyOf, oneOf, ...unionOwn } = union;
        const branches = (anyOf?.length ? anyOf : oneOf) ?? [];
        const others = [...s.allOf.filter((member) => member !== branching), unionOwn];
        const types = branches.map((branch, i) =>
          buildType({ ...s, allOf: [...others, branch] }, `${propNameForParent}_${i}`)
        );
        distributing.delete(union);
        return `Union[${types.join(', ')}]`;
      }

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
        const resolved = resolve(member);
        if (!resolved || seen.has(resolved)) return;
        seen.add(resolved);
        resolved.allOf?.forEach(mergeMember);
        if (!takesObject(resolved)) return;
        merged.properties = { ...merged.properties, ...resolved.properties };
        merged.required = Array.from(new Set([...(merged.required ?? []), ...(resolved.required ?? [])]));
      };
      s.allOf.forEach(mergeMember);
      mergeMember({ type: s.type, properties: s.properties, required: s.required });
      return buildType(merged, propNameForParent);
    }

    for (const keyword of ['anyOf', 'oneOf'] as const) {
      const branches = s[keyword];
      if (!branches?.length) continue;
      // properties next to the branches go in each branch that is an object
      const hasOwnProperties = !!s.properties && Object.keys(s.properties).length > 0;
      const own: VovkJSONSchemaBase = { type: 'object', properties: s.properties, required: s.required };
      const subTypes = branches.map((sub, i) => {
        const resolved = resolve(sub);
        const branch = hasOwnProperties && resolved && takesObject(resolved) ? { allOf: [own, sub] } : sub;
        return buildType(branch, `${propNameForParent}_${keyword}_${i}`);
      });
      return `Union[${subTypes.join(', ')}]`;
    }

    if (allTypes.length > 1) {
      // at the top level the type's own name is the union's alias, so an object member gets a class of its own
      const subTypes = allTypes.map((t) =>
        buildType(
          { ...s, type: t },
          propNameForParent,
          propNameForParent === className && t === 'object' ? uniqueName(`_${className}_object`) : undefined
        )
      );
      return `Union[${subTypes.join(', ')}]`;
    }

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
        case 'array': {
          // 2020-12 tuples use prefixItems, draft 7 tuples use an items array
          const prefix: unknown = s.prefixItems ?? (Array.isArray(s.items) ? s.items : undefined);
          if (Array.isArray(prefix) && prefix.length) {
            const tupleTypes = prefix.map((sub, i) =>
              typeof sub === 'object' ? buildType(sub, `${propNameForParent}_items_${i}`) : 'Any'
            );
            const rest: unknown = s.prefixItems ? s.items : (s as { additionalItems?: unknown }).additionalItems;
            if (!rest || typeof rest !== 'object') return `Tuple[${tupleTypes.join(', ')}]`;
            // items after the tuple's own: a list of any of the types
            const itemTypes = new Set([...tupleTypes, buildType(rest, `${propNameForParent}_items`)]);
            return `List[${itemTypes.size === 1 ? [...itemTypes][0] : `Union[${[...itemTypes].join(', ')}]`}]`;
          }
          if (s.items && typeof s.items === 'object' && !Array.isArray(s.items)) {
            const itemType = buildType(s.items, `${propNameForParent}_items`);
            return `List[${itemType}]`;
          }
          return `List[Any]`;
        }

        case 'object': {
          // a record: no listed keys and other keys allowed, which an object without properties or additionalProperties
          // allows too
          const values = s.additionalProperties;
          const patterns = Object.values(
            (s as { patternProperties?: Record<string, VovkJSONSchemaBase> }).patternProperties ?? {}
          );
          const listsNoKeys = !s.properties || Object.keys(s.properties).length === 0;
          const allowsOtherKeys =
            (values === undefined && !s.properties) ||
            (values !== undefined && values !== false) ||
            patterns.length > 0 ||
            'propertyNames' in s;
          if (listsNoKeys && allowsOtherKeys) {
            const valueTypes = new Set([
              ...(typeof values === 'object'
                ? [buildType(values, `${propNameForParent}_values`)]
                : values === true || !patterns.length
                  ? ['Any']
                  : []),
              ...patterns.map((pattern, i) => buildType(pattern, `${propNameForParent}_pattern_${i}`)),
            ]);
            const valueType = valueTypes.has('Any')
              ? 'Any'
              : valueTypes.size === 1
                ? [...valueTypes][0]
                : `Union[${[...valueTypes].join(', ')}]`;
            return `Dict[str, ${valueType}]`;
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
            .filter(([, propSchema]) => !isFileField(propSchema, schema))
            .map(([propName, propSchema]) => {
              const childType = buildType(propSchema, `${propNameForParent}_${propName}`);
              const isRequired =
                required.has(propName) && !(options.direction === 'response' && isWriteOnly(propSchema));
              // a key that may be missing, not one that may be None
              return [propName, isRequired ? childType : `NotRequired[${childType}]`] as const;
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
    classDefinitions.push(`${className}: TypeAlias = ${settle(topLevelTypeName, true)}`);
  }

  if (classDefinitions.length === 0) {
    classDefinitions.push(`class ${className}(TypedDict):\n    pass`);
  }

  return classDefinitions
    .join('\n')
    .split('\n')
    .map((line) => `${' '.repeat(pad)}${line}`)
    .join('\n');
}

// the file fields of the body and of each branch of it, each name once
function uniqueFileFields(schema: VovkJSONSchemaBase): [string, VovkJSONSchemaBase][] {
  const fileProps: [string, VovkJSONSchemaBase][] = [];
  for (const [name, prop] of fileFieldsOf(schema, schema)) {
    if (!fileProps.some(([seen]) => seen === name)) fileProps.push([name, prop]);
  }
  return fileProps;
}

const isFileList = ([, propSchema]: [string, VovkJSONSchemaBase]) => propSchema.type === 'array';

// a list of (field name, file) pairs, not a TypedDict: a field takes several files, or there are several fields
const takesFilePairs = (fileProps: [string, VovkJSONSchemaBase][]) =>
  fileProps.length > 1 || fileProps.some(isFileList);

const FILE_VALUE =
  'Union[BinaryIO, Tuple[str, BinaryIO], Tuple[str, BinaryIO, str], Tuple[str, BinaryIO, str, Dict[str, str]]]';

// the files argument of a call: the type, and for pairs also a dict and pairs that hold a bare file, as requests
// takes them; the type itself stays a list, so a list annotated with it still takes append
export function getPythonFilesParamType({ schema, className }: { schema: VovkJSONSchemaBase; className: string }) {
  const fileProps = uniqueFileFields(schema);
  if (!takesFilePairs(fileProps)) return className;
  // a dict holds one file for a field, and a field of several files needs a pair for each
  const dict = fileProps.some(isFileList) ? [] : [`Dict[str, ${FILE_VALUE}]`];
  return `Union[${[className, ...dict, `Sequence[Tuple[str, ${FILE_VALUE}]]`].join(', ')}]`;
}

export function convertJSONSchemaToPythonFilesType(options: ConvertOptions): string {
  const { className, pad } = options;
  if (!options.schema) return '';
  const schema = resolveTopLevelRef(options.schema);

  const lines: string[] = [];
  // the file fields of the body and of each branch of it; one is required when every branch with it requires it
  const objects = bodyObjects(options.schema, options.schema);
  const fileProps = uniqueFileFields(options.schema);
  const required = new Set(
    fileProps
      .map(([name]) => name)
      .filter((name) =>
        objects.every((object) => !object.properties || !(name in object.properties) || object.required?.includes(name))
      )
  );

  if (fileProps.length === 0) {
    return '';
  }

  const fileDocLines = (suffix: string) => [
    ...(schema.title ? toPythonDocstringLines(`${schema.title} - ${suffix}`) : []),
    ...(schema.title && schema.description ? [''] : []),
    ...(schema.description ? toPythonDocstringLines(schema.description) : []),
  ];

  if (takesFilePairs(fileProps)) {
    lines.push(
      `# a (field name, file) pair per file, as in files=[(${toPythonString(fileProps[0][0])}, ('a.pdf', open('a.pdf', 'rb')))]`
    );

    if (schema.title || schema.description) {
      lines.push(`"""`, ...fileDocLines('File Uploads'), `"""`);
    }

    const fileTupleType =
      'Union[Tuple[str, BinaryIO], Tuple[str, BinaryIO, str], Tuple[str, BinaryIO, str, Dict[str, str]]]';

    lines.push(`${className} = List[Tuple[str, ${fileTupleType}]]`);
  } else {
    const [propName] = fileProps[0];
    const isRequired = required.has(propName);

    const finalType = isRequired ? FILE_VALUE : `Optional[${FILE_VALUE}]`;

    if (!isPlainPythonName(propName)) {
      lines.push(
        `${className} = TypedDict(${toPythonString(className)}, {${toPythonString(propName)}: ${toPythonString(finalType)}})`
      );
      return lines.map((line) => `${' '.repeat(pad)}${line}`).join('\n');
    }

    lines.push(`class ${className}(TypedDict):`);

    if (schema.title || schema.description) {
      lines.push(`    """`, ...fileDocLines('File Upload').map((line) => `    ${line}`), `    """`);
    }

    lines.push(`    ${propName}: ${finalType}`);
    lines.push(`    # Example: open('file.jpg', 'rb') or ('filename.jpg', open('file.jpg', 'rb'), 'image/jpeg')`);
  }

  return lines.map((line) => `${' '.repeat(pad)}${line}`).join('\n');
}
