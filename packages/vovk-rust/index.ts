import type { VovkJSONSchemaBase } from 'vovk';

// Rust reserved keywords that cannot be used as identifiers
const RUST_KEYWORDS = new Set([
  'as',
  'break',
  'const',
  'continue',
  'crate',
  'else',
  'enum',
  'extern',
  'false',
  'fn',
  'for',
  'if',
  'impl',
  'in',
  'let',
  'loop',
  'match',
  'mod',
  'move',
  'mut',
  'pub',
  'ref',
  'return',
  'self',
  'Self',
  'static',
  'struct',
  'super',
  'trait',
  'true',
  'type',
  'unsafe',
  'use',
  'where',
  'while',
  'async',
  'await',
  'dyn',
  'abstract',
  'become',
  'box',
  'do',
  'final',
  'macro',
  'override',
  'priv',
  'typeof',
  'unsized',
  'virtual',
  'yield',
  'try',
  'union',
]);

// names the generated code writes unqualified, a type of the same name would shadow them
const RESERVED_TYPE_NAMES = new Set([
  'String',
  'Option',
  'Vec',
  'Box',
  'Serialize',
  'Deserialize',
  'serde',
  'serde_json',
  'std',
  'core',
  'alloc',
  'bool',
  'char',
  'str',
  'f32',
  'f64',
  'i8',
  'i16',
  'i32',
  'i64',
  'i128',
  'isize',
  'u8',
  'u16',
  'u32',
  'u64',
  'u128',
  'usize',
]);

// the template refers to the slot types by these names
const SLOT_NAMES = ['body', 'query', 'params', 'output', 'iteration'];

const VALUE = 'serde_json::Value';

// std implements Debug and Clone for tuples of up to 12 items
const MAX_TUPLE_LENGTH = 12;

type Schema = VovkJSONSchemaBase;

type BodyKind = 'none' | 'form' | 'urlencoded' | 'binary' | 'text' | 'json';

/**
 * Determine the body kind from the schema's x-contentType and format fields.
 */
export function getBodyKind(schema: VovkJSONSchemaBase | undefined): BodyKind {
  if (!schema) return 'none';
  const ct = schema['x-contentType'] as string[] | undefined;
  // an object goes out as a form only when JSON can't carry it: no JSON declared, or a field that holds a file
  const declaresForm = ct?.includes('multipart/form-data') || ct?.includes('application/x-www-form-urlencoded');
  const declaresJSON = ct?.some((c: string) => c === 'application/json' || c.endsWith('+json'));
  if (declaresForm && declaresJSON && !isFileSchema(schema, schema) && !holdsFile(schema, schema)) return 'json';
  if (ct?.includes('multipart/form-data')) return 'form';
  // a form without multipart holds no files, so the generated struct is sent urlencoded
  if (ct?.includes('application/x-www-form-urlencoded')) return 'urlencoded';
  if (schema.format === 'binary' || schema.contentEncoding === 'binary') return 'binary';
  // an object or an array goes out as JSON, whatever else the procedure declares
  const isStructured = schema.type === 'object' || schema.type === 'array' || !!schema.properties;
  if (!isStructured && ct?.some((c: string) => c.startsWith('text/'))) return 'text';
  // a declared non JSON content type on a scalar body means raw bytes, e.g. application/octet-stream or image/png
  const isJSONContentType = (c: string) => c === '*/*' || c === 'application/json' || c.endsWith('+json');
  if (!isStructured && ct?.length && !ct.some(isJSONContentType)) return 'binary';
  return 'json';
}

const MAX_FILE_SEARCH_DEPTH = 16;

// a file, or a list or a union that may be one
function isFileSchema(schema: Schema | undefined, root: Schema, depth = 0): boolean {
  if (!schema || typeof schema !== 'object' || depth > MAX_FILE_SEARCH_DEPTH) return false;
  if (schema.$ref) return isFileSchema(resolvePointer(schema.$ref, root), root, depth + 1);
  if (schema.format === 'binary' || schema.contentEncoding === 'binary') return true;
  const items =
    schema.items && typeof schema.items === 'object' && !Array.isArray(schema.items) ? schema.items : undefined;
  return [items, ...(schema.anyOf ?? []), ...(schema.oneOf ?? [])].some((s) => isFileSchema(s, root, depth + 1));
}

// a field of the body, or of any branch of it, holds a file
function holdsFile(schema: Schema | undefined, root: Schema, depth = 0): boolean {
  if (!schema || typeof schema !== 'object' || depth > MAX_FILE_SEARCH_DEPTH) return false;
  if (schema.$ref) return holdsFile(resolvePointer(schema.$ref, root), root, depth + 1);
  return (
    Object.values(schema.properties ?? {}).some((prop) => isFileSchema(prop, root)) ||
    [...(schema.allOf ?? []), ...(schema.anyOf ?? []), ...(schema.oneOf ?? [])].some((branch) =>
      holdsFile(branch, root, depth + 1)
    )
  );
}

// a text body goes out as the type the procedure declares, as the TypeScript client sends it
export function getTextContentType(schema: VovkJSONSchemaBase | undefined): string {
  const isTextLike = (type: string) =>
    !type.includes('*') &&
    !['multipart/form-data', 'application/x-www-form-urlencoded', 'application/json'].includes(type) &&
    !type.endsWith('+json');
  return (schema?.['x-contentType'] as string[] | undefined)?.find(isTextLike) ?? 'text/plain';
}

// bytes go out as the first type the procedure declares that isn't JSON or a form, such as image/png
export function getBinaryContentType(schema: VovkJSONSchemaBase | undefined): string {
  const declared = (schema?.['x-contentType'] as string[] | undefined) ?? [];
  const isForm = (type: string) => type === 'multipart/form-data' || type === 'application/x-www-form-urlencoded';
  const isJSON = (type: string) => type === 'application/json' || type.endsWith('+json');
  return (
    declared.find((type) => !type.includes('*') && !isForm(type) && !isJSON(type)) ??
    declared.find((type) => type !== '*/*' && type.endsWith('/*')) ??
    'application/octet-stream'
  );
}

// the variants of a union body that hold a file: they go out as bytes, the others as JSON
export function getBinaryBodyVariants(schema: VovkJSONSchemaBase | undefined): string[] {
  if (!schema || getBodyKind(schema) !== 'json') return [];
  const ctx: Context = { root: schema, defNames: new Map(), defSchemas: new Map(), pad: 0, enclosing: null, refs: [] };
  const target = effectiveSchema(schema, ctx);
  if (nominalKind(target, ctx) !== 'union') return [];
  return (target.anyOf ?? target.oneOf ?? []).flatMap((variant, index) => {
    const branch = variant?.$ref ? resolvePointer(variant.$ref, schema) : variant;
    return branch?.type === 'string' && getBodyKind(branch) === 'binary' ? [`Variant${index}`] : [];
  });
}

// Helper function for indentation
function indent(level: number, pad: number = 0): string {
  return ' '.repeat(pad + level * 2);
}

// Generate documentation comments from title and description
function generateDocComment(schema: VovkJSONSchemaBase, level: number, pad: number = 0): string {
  if (!schema?.title && !schema?.description) return '';

  const lines = [
    ...(schema.title ? toRustDocLines(schema.title) : []),
    ...(schema.title && schema.description ? [''] : []),
    ...(schema.description ? toRustDocLines(schema.description) : []),
  ];

  return lines.map((line) => `${indent(level, pad)}///${line ? ` ${line}` : ''}\n`).join('');
}

// rustc denies bidirectional control characters in comments and literals, they make code read differently
const BIDI_CONTROLS = /[\u202A-\u202E\u2066-\u2069]/gu;

// Schema text may come from a third-party OpenAPI document: a line break would end a comment and start code,
// and rustc rejects a bare carriage return inside a doc comment; a number or any other JSON there is written as text
export function toRustDocLines(text: unknown): string[] {
  return String(text)
    .split(/\r\n|\r|\n/)
    .map((line) => line.replace(/\p{Cc}/gu, ' ').replace(BIDI_CONTROLS, ' '));
}

export function toRustCommentText(text: string): string {
  return text.replace(/\p{Cc}+/gu, ' ').replace(BIDI_CONTROLS, ' ');
}

export function toRustString(value: string): string {
  const escaped = value
    .replace(/[\\"]/g, '\\$&')
    .replace(/[\p{Cc}\u202A-\u202E\u2066-\u2069]/gu, (char) => `\\u{${char.charCodeAt(0).toString(16)}}`);
  return `"${escaped}"`;
}

// turn any string into a valid Rust identifier, serde keeps the original name on the wire
export function toRustIdent(value: unknown, used?: Set<string>): string {
  let ident = String(value ?? '').replace(/[^a-zA-Z0-9_]/g, '_');
  // "_" alone is reserved, and "" has nothing left to name
  if (!ident || /^_+$/.test(ident)) ident = `Empty${ident}`;
  if (/^[0-9]/.test(ident)) ident = `_${ident}`;
  if (RUST_KEYWORDS.has(ident)) ident = `${ident}_`;

  if (used) {
    let candidate = ident;
    let i = 2;
    while (used.has(candidate)) {
      candidate = `${ident}_${i++}`;
    }
    used.add(candidate);
    return candidate;
  }

  return ident;
}

// the function of each handler of a module, by handler name: in schema order, a name already taken gets the first
// free suffix, so getUserByID and getUserById become get_user_by_id and get_user_by_id_2; the module imports
// http_request and http_request_stream, so those names are taken
export function getFunctionNames(handlerNames: string[], toSnakeCase: (name: string) => string): Map<string, string> {
  const used = new Set(['http_request', 'http_request_stream']);
  return new Map(handlerNames.map((name) => [name, toRustIdent(toSnakeCase(name), used)]));
}

function decodePointerSegment(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // a malformed escape is kept as written
  }
  return decoded.replace(/~1/g, '/').replace(/~0/g, '~');
}

// the schema a local $ref points at, one step only: a target that is a $ref itself is returned as is
function resolvePointer(ref: string, rootSchema: Schema): Schema | undefined {
  if (!ref.startsWith('#')) return undefined;
  let current: unknown = rootSchema;
  for (const part of ref.slice(1).split('/').filter(Boolean).map(decodePointerSegment)) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current && typeof current === 'object' ? (current as Schema) : undefined;
}

// $defs, definitions and components/schemas entries all become top level named types
function getNamedSchemas(rootSchema: VovkJSONSchemaBase | undefined): Record<string, VovkJSONSchemaBase> {
  if (!rootSchema || typeof rootSchema !== 'object') return {};
  const components = (rootSchema as { components?: { schemas?: Record<string, Schema> } }).components?.schemas;
  return { ...components, ...rootSchema.definitions, ...rootSchema.$defs };
}

const NAMED_POINTERS = ['#/$defs/', '#/definitions/', '#/components/schemas/'];

// "#/$defs/User" => "User", null when the $ref doesn't point at a whole named schema
function refKey(ref: string | undefined): string | null {
  const prefix = ref ? NAMED_POINTERS.find((pointer) => ref.startsWith(pointer)) : undefined;
  if (!ref || !prefix || ref.slice(prefix.length).includes('/')) return null;
  return decodePointerSegment(ref.slice(prefix.length));
}

// references that are not behind a Vec or a map, a cycle among them means an infinitely sized Rust type
const directEdgesCache = new WeakMap<Schema, Map<string, Set<string>>>();

function getDirectEdges(rootSchema: Schema): Map<string, Set<string>> {
  const cached = directEdgesCache.get(rootSchema);
  if (cached) return cached;

  const edges = new Map<string, Set<string>>();
  const named = getNamedSchemas(rootSchema);

  const walk = (schema: Schema | undefined, from: string, seen: Set<Schema>) => {
    if (!schema || typeof schema !== 'object' || seen.has(schema)) return;
    seen.add(schema);

    const key = refKey(schema.$ref);
    if (key !== null && named[key]) {
      const targets = edges.get(from) ?? new Set<string>();
      targets.add(key);
      edges.set(from, targets);
      return;
    }
    if (schema.$ref) walk(resolvePointer(schema.$ref, rootSchema), from, seen);

    // items and map values sit behind a Vec or a HashMap, which already breaks the cycle
    for (const sub of [
      ...Object.values(schema.properties ?? {}),
      ...(schema.allOf ?? []),
      ...(schema.anyOf ?? []),
      ...(schema.oneOf ?? []),
      ...(schema.prefixItems ?? []),
    ]) {
      walk(sub, from, seen);
    }
  };

  for (const [key, schema] of Object.entries(named)) {
    walk(schema, key, new Set());
  }

  directEdgesCache.set(rootSchema, edges);
  return edges;
}

// a reference needs a Box when its target can reach back to the named type that holds it
function refNeedsBox(from: string | null, to: string, rootSchema: VovkJSONSchemaBase): boolean {
  if (from === null) return false;

  const edges = getDirectEdges(rootSchema);
  const stack = [to];
  const visited = new Set<string>();

  while (stack.length) {
    const current = stack.pop() as string;
    if (current === from) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const next of edges.get(current) ?? []) stack.push(next);
  }

  return false;
}

// generated items of one Rust module
type Module = {
  level: number;
  // modules between this one and the handler module, named types are reached through as many super::
  depth: number;
  names: Set<string>;
  code: string;
};

type Context = {
  // the slot schema, $refs resolve against it
  root: Schema;
  // named schema key => Rust name, shared by the slots of a handler
  defNames: Map<string, string>;
  defSchemas: Map<string, Schema>;
  pad: number;
  // the named type being emitted, its cyclic references get boxed
  enclosing: string | null;
  // unnamed $refs being followed, one that comes back is left untyped
  refs: string[];
};

// where a type expression is written, and the module that receives the types it defines
type Scope = {
  depth: number;
  helpers: () => { mod: Module; path: string };
};

type NominalKind = 'struct' | 'allOf' | 'stringEnum' | 'mixedEnum' | 'union';

const newModule = (level: number, depth: number): Module => ({ level, depth, names: new Set(), code: '' });

// a type name not yet taken in the module, its "_" module name is kept free too
function allocateName(mod: Module, value: string): string {
  let base = toRustIdent(value);
  if (RESERVED_TYPE_NAMES.has(base)) base = `${base}_`;
  let name = base;
  for (let i = 2; mod.names.has(name) || mod.names.has(`${name}_`); i++) name = `${base}_${i}`;
  mod.names.add(name);
  mod.names.add(`${name}_`);
  return name;
}

const hasProperties = (schema: Schema) => !!schema.properties && Object.keys(schema.properties).length > 0;

const isObjectLike = (schema: Schema) => schema.type === 'object' || hasProperties(schema);

const isNullSchema = (schema: Schema) =>
  !!schema &&
  typeof schema === 'object' &&
  (schema.type === 'null' ||
    schema.const === null ||
    (Array.isArray(schema.enum) && schema.enum.length > 0 && schema.enum.every((value) => value === null)));

// the schema without its null option: undefined when null is not an option, null when it is the only one
function splitNullable(schema: Schema): Schema | null | undefined {
  // OpenAPI 3.0
  if ((schema as { nullable?: boolean }).nullable === true) {
    const { nullable: _, ...rest } = schema as Schema & { nullable?: boolean };
    return rest;
  }
  if (schema.type === 'null') return null;
  if (Array.isArray(schema.type) && schema.type.includes('null')) {
    const types = schema.type.filter((type) => type !== 'null');
    if (!types.length) return null;
    return {
      ...schema,
      type: types.length === 1 ? types[0] : types,
      ...(schema.enum ? { enum: schema.enum.filter((value) => value !== null) } : {}),
    };
  }
  if (Array.isArray(schema.enum) && schema.enum.includes(null)) {
    const values = schema.enum.filter((value) => value !== null);
    return values.length ? { ...schema, enum: values } : null;
  }
  const key = schema.anyOf ? 'anyOf' : schema.oneOf ? 'oneOf' : null;
  const branches = key ? schema[key] : undefined;
  if (key && branches?.some(isNullSchema)) {
    const rest = branches.filter((branch) => !isNullSchema(branch));
    if (!rest.length) return null;
    return rest.length === 1 && !hasProperties(schema) ? rest[0] : { ...schema, [key]: rest };
  }
  return undefined;
}

// the parts of an allOf that combine into one struct, or null when one of them isn't an object
function allOfObjectParts(schema: Schema, ctx: Context): Schema[] | null {
  const parts = (schema.allOf ?? []).map((part) => (part?.$ref ? resolvePointer(part.$ref, ctx.root) : part));
  return parts.every((part) => !!part && isObjectLike(part)) ? (parts as Schema[]) : null;
}

// a schema that becomes its own struct or enum
function nominalKind(schema: Schema, ctx: Context): NominalKind | null {
  if (schema.$ref || splitNullable(schema) !== undefined) return null;
  const branches = schema.anyOf ?? schema.oneOf;
  if (branches && branches.length > 1 && !hasProperties(schema)) return 'union';
  if (schema.allOf && (schema.allOf.length > 1 || hasProperties(schema))) {
    return allOfObjectParts(schema, ctx) ? 'allOf' : null;
  }
  if (hasProperties(schema) && (schema.type === undefined || schema.type === 'object')) return 'struct';
  const values = schema.enum;
  if (Array.isArray(values) && values.length) {
    if (values.every((value) => typeof value === 'string')) return 'stringEnum';
    const isNumbers = values.every((value) => typeof value === 'number');
    const isBooleans = values.every((value) => typeof value === 'boolean');
    if (!isNumbers && !isBooleans) return 'mixedEnum';
  }
  return null;
}

// follows unnamed $refs and single-branch wrappers to the schema that decides the type
function effectiveSchema(schema: Schema, ctx: Context): Schema {
  const seen = new Set<string>();
  let current = schema;
  while (true) {
    if (current.$ref && refKey(current.$ref) === null) {
      if (seen.has(current.$ref)) return {};
      seen.add(current.$ref);
      const target = resolvePointer(current.$ref, ctx.root);
      if (!target) return {};
      current = target;
      continue;
    }
    const single = current.allOf ?? current.anyOf ?? current.oneOf;
    if (single?.length === 1 && !hasProperties(current) && !current.$ref) {
      current = single[0];
      continue;
    }
    return current;
  }
}

function integerType(schema: Schema): string {
  const min =
    typeof schema.minimum === 'number'
      ? schema.minimum
      : typeof schema.exclusiveMinimum === 'number'
        ? schema.exclusiveMinimum + 1
        : undefined;
  const max =
    typeof schema.maximum === 'number'
      ? schema.maximum
      : typeof schema.exclusiveMaximum === 'number'
        ? schema.exclusiveMaximum - 1
        : undefined;

  // Check if we need unsigned (no negative values)
  if (min !== undefined && min >= 0) {
    // Choose appropriate unsigned int size
    if (max !== undefined) {
      if (max <= 255) return 'u8';
      if (max <= 65535) return 'u16';
      if (max <= 4294967295) return 'u32';
    }
    return 'u64'; // Default unsigned
  }
  // Choose appropriate signed int size
  if (min !== undefined && max !== undefined) {
    const maxVal = Math.max(Math.abs(min) - 1, Math.abs(max));
    if (maxVal <= 127) return 'i8';
    if (maxVal <= 32767) return 'i16';
    if (maxVal <= 2147483647) return 'i32';
  }
  return 'i64'; // Default signed
}

const ANNOTATION_KEYS = new Set(['title', 'description', '$comment', 'examples', 'example', 'default', 'deprecated']);

// {} and its annotated forms accept any value
const isAnything = (schema: Schema) => Object.keys(schema).every((key) => ANNOTATION_KEYS.has(key));

// the Rust type of a schema; structs and enums it needs are defined in the scope's helper module
function typeExpr(
  schema: Schema | boolean | undefined,
  baseName: string,
  scope: Scope,
  ctx: Context,
  direct: boolean
): string {
  // true, false and a missing schema say nothing about the value
  if (!schema || typeof schema !== 'object') return VALUE;

  const nonNull = splitNullable(schema);
  if (nonNull !== undefined) {
    if (nonNull === null) return '()';
    const inner = typeExpr(nonNull, baseName, scope, ctx, direct);
    return inner === VALUE || inner === '()' || inner.startsWith('Option<') ? inner : `Option<${inner}>`;
  }

  if (schema.$ref) {
    const key = refKey(schema.$ref);
    if (key !== null && ctx.defNames.has(key)) {
      const name = `${'super::'.repeat(scope.depth)}${ctx.defNames.get(key)}`;
      return direct && refNeedsBox(ctx.enclosing, key, ctx.root) ? `Box<${name}>` : name;
    }
    const target = resolvePointer(schema.$ref, ctx.root);
    if (!target || ctx.refs.includes(schema.$ref)) return VALUE;
    ctx.refs.push(schema.$ref);
    try {
      return typeExpr(target, baseName, scope, ctx, direct);
    } finally {
      ctx.refs.pop();
    }
  }

  const kind = nominalKind(schema, ctx);
  if (kind) {
    const { mod, path } = scope.helpers();
    const name = allocateName(mod, baseName);
    emitNominal(kind, schema, name, mod, ctx);
    return `${path}${name}`;
  }

  const branches = schema.anyOf ?? schema.oneOf ?? schema.allOf;
  if (branches?.length === 1 && !hasProperties(schema)) return typeExpr(branches[0], baseName, scope, ctx, direct);
  if (schema.allOf?.length) {
    // checks of one primitive type, such as two string constraints, are that type
    const types = new Set(
      schema.allOf.map((part) => (part?.$ref ? resolvePointer(part.$ref, ctx.root) : part)?.type ?? 'unknown')
    );
    const [type] = types;
    return types.size === 1 && typeof type === 'string' && ['string', 'integer', 'number', 'boolean'].includes(type)
      ? typeExpr({ type } as Schema, baseName, scope, ctx, direct)
      : VALUE;
  }

  if (Array.isArray(schema.enum)) {
    const values = schema.enum;
    if (!values.length) return VALUE;
    if (values.every((value) => typeof value === 'boolean')) return 'bool';
    // numeric values keep the declared type, as a number with no enum would have
    const type = schema.type ?? (values.every((value) => Number.isInteger(value)) ? 'integer' : 'number');
    return typeExpr({ ...schema, enum: undefined, type }, baseName, scope, ctx, direct);
  }

  if (schema.const !== undefined && schema.type === undefined) {
    const value = schema.const;
    if (typeof value === 'string') return 'String';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') return Number.isInteger(value) ? 'i64' : 'f64';
    return VALUE;
  }

  if (Array.isArray(schema.type)) {
    // several types and no struct to hold them
    if (schema.type.length !== 1) return VALUE;
    return typeExpr({ ...schema, type: schema.type[0] }, baseName, scope, ctx, direct);
  }

  switch (schema.type) {
    case 'string':
      // Binary format or a non text content type maps to Vec<u8>
      return getBodyKind(schema) === 'binary' ? 'Vec<u8>' : 'String';
    case 'integer':
      return integerType(schema);
    case 'number':
      // f32 would round any value past 7 digits
      return 'f64';
    case 'boolean':
      return 'bool';
    case 'null':
      return '()';
  }

  if (schema.type === 'array' || (!schema.type && (schema.items !== undefined || schema.prefixItems))) {
    return arrayType(schema, baseName, scope, ctx, direct);
  }

  if (schema.type === 'object' || (!schema.type && schema.additionalProperties !== undefined)) {
    const values = schema.additionalProperties;
    if (values && typeof values === 'object' && !isAnything(values)) {
      return `std::collections::HashMap<String, ${typeExpr(values, `${baseName}Value`, scope, ctx, false)}>`;
    }
  }

  return VALUE;
}

function arrayType(schema: Schema, baseName: string, scope: Scope, ctx: Context, direct: boolean): string {
  const items = schema.items as unknown;
  // 2020-12 tuples use prefixItems, draft 7 tuples use an items array
  const prefix = schema.prefixItems ?? (Array.isArray(items) ? (items as Schema[]) : undefined);
  if (prefix) {
    const rest = schema.prefixItems ? items : schema.additionalItems;
    // a closed tuple of fixed length is a Rust tuple, serde reads and writes it as an array
    if (
      rest === false &&
      prefix.length > 0 &&
      prefix.length <= MAX_TUPLE_LENGTH &&
      (schema.minItems ?? 0) >= prefix.length
    ) {
      const types = prefix.map((item, i) => typeExpr(item, `${baseName}Item${i}`, scope, ctx, direct));
      return `(${types.join(', ')}${types.length === 1 ? ',' : ''})`;
    }
    return `Vec<${VALUE}>`;
  }
  return items && typeof items === 'object'
    ? `Vec<${typeExpr(items as Schema, `${baseName}Item`, scope, ctx, false)}>`
    : `Vec<${VALUE}>`;
}

function emitNominal(kind: NominalKind, schema: Schema, name: string, mod: Module, ctx: Context): void {
  switch (kind) {
    case 'struct':
      emitStruct(schema, name, mod, ctx);
      break;
    case 'allOf':
      emitStruct(mergeAllOf(schema, ctx), name, mod, ctx);
      break;
    case 'stringEnum':
      emitStringEnum(schema, name, mod, ctx);
      break;
    case 'mixedEnum':
      emitMixedEnum(schema, name, mod, ctx);
      break;
    case 'union':
      emitUnion(schema, name, mod, ctx);
      break;
  }
}

function mergeAllOf(schema: Schema, ctx: Context): Schema {
  const parts = [schema, ...(allOfObjectParts(schema, ctx) ?? [])];
  return {
    type: 'object',
    title: schema.title,
    description: schema.description,
    properties: Object.assign({}, ...parts.map((part) => part.properties ?? {})),
    required: parts.flatMap((part) => part.required ?? []),
  };
}

// a module that takes the types a struct or an enum needs
function helperScope(name: string, mod: Module): { scope: Scope; getModule: () => Module | undefined } {
  let helperMod: Module | undefined;
  const scope: Scope = {
    depth: mod.depth,
    helpers: () => {
      helperMod ??= newModule(mod.level + 1, mod.depth + 1);
      return { mod: helperMod, path: `${name}_::` };
    },
  };
  return { scope, getModule: () => helperMod };
}

function emitHelperModule(name: string, helperMod: Module | undefined, mod: Module, ctx: Context): void {
  if (!helperMod?.code) return;
  const ind = indent(mod.level, ctx.pad);
  mod.code += `${ind}#[allow(non_snake_case)]\n`;
  mod.code += `${ind}pub mod ${name}_ {\n`;
  mod.code += `${indent(mod.level + 1, ctx.pad)}use serde::{Serialize, Deserialize};\n\n`;
  mod.code += helperMod.code;
  mod.code += `${ind}}\n`;
}

// a field's doc: a named type documents itself, otherwise the property schema does
function fieldDocSchema(propSchema: Schema, ctx: Context): Schema {
  const items = propSchema.type === 'array' && propSchema.items && typeof propSchema.items === 'object';
  const key = refKey(propSchema.$ref) ?? (items ? refKey((propSchema.items as Schema).$ref) : null);
  const named = key !== null ? ctx.defSchemas.get(key) : undefined;
  if (named) return named;
  return (propSchema.$ref && resolvePointer(propSchema.$ref, ctx.root)) || propSchema;
}

function emitStruct(schema: Schema, name: string, mod: Module, ctx: Context): void {
  const level = mod.level;
  const { scope, getModule } = helperScope(name, mod);
  const required = new Set(schema.required ?? []);
  // property names are free form and two of them may sanitize alike, e.g. "foo-bar" and "foo.bar"
  const fieldNames = new Set<string>();
  let fields = '';

  for (const [propName, propSchema] of Object.entries(schema.properties ?? {})) {
    const ident = toRustIdent(propName, fieldNames);
    const isOptional = !required.has(propName);
    let type = typeExpr(propSchema, ident, scope, ctx, true);
    if (isOptional && !type.startsWith('Option<')) type = `Option<${type}>`;

    const ind = indent(level + 1, ctx.pad);
    fields += generateDocComment(fieldDocSchema(propSchema, ctx), level + 1, ctx.pad);
    // an unset optional field is left out, null fails a schema that doesn't allow it
    if (isOptional) fields += `${ind}#[serde(default, skip_serializing_if = "Option::is_none")]\n`;
    // r#self and r#crate are forbidden, so keywords go through toRustIdent too
    if (ident !== propName) fields += `${ind}#[serde(rename = ${toRustString(propName)})]\n`;
    fields += `${ind}pub ${ident}: ${type},\n`;
  }

  mod.code += generateDocComment(schema, level, ctx.pad);
  mod.code += `${indent(level, ctx.pad)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
  mod.code += `${indent(level, ctx.pad)}#[allow(non_snake_case, non_camel_case_types)]\n`;
  mod.code += `${indent(level, ctx.pad)}pub struct ${name} {\n${fields}${indent(level, ctx.pad)}}\n\n`;
  emitHelperModule(name, getModule(), mod, ctx);
}

function emitStringEnum(schema: Schema, name: string, mod: Module, ctx: Context): void {
  const level = mod.level;
  const usedVariants = new Set<string>();
  let variants = '';

  for (const value of schema.enum ?? []) {
    // enum values are free form, so the variant is sanitized and serde keeps the original name
    variants += `${indent(level + 1, ctx.pad)}#[serde(rename = ${toRustString(String(value))})]\n`;
    variants += `${indent(level + 1, ctx.pad)}${toRustIdent(value, usedVariants)},\n`;
  }

  mod.code += generateDocComment(schema, level, ctx.pad);
  mod.code += `${indent(level, ctx.pad)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
  mod.code += `${indent(level, ctx.pad)}#[allow(non_camel_case_types)]\n`;
  mod.code += `${indent(level, ctx.pad)}pub enum ${name} {\n${variants}${indent(level, ctx.pad)}}\n\n`;
}

// string values are named variants, any other value is matched by its type after them
function emitMixedEnum(schema: Schema, name: string, mod: Module, ctx: Context): void {
  const level = mod.level;
  const values = schema.enum ?? [];
  const usedVariants = new Set<string>();
  let variants = '';

  for (const value of values.filter((value) => typeof value === 'string')) {
    variants += `${indent(level + 1, ctx.pad)}#[serde(rename = ${toRustString(value)})]\n`;
    variants += `${indent(level + 1, ctx.pad)}${toRustIdent(value, usedVariants)},\n`;
  }

  const kinds = new Set(
    values
      .filter((value) => typeof value !== 'string')
      .map((value) => (typeof value === 'object' ? 'object' : typeof value))
  );
  const variantTypes: Record<string, [string, string]> = {
    number: ['Number', 'serde_json::Number'],
    boolean: ['Boolean', 'bool'],
    object: ['Other', VALUE],
  };
  for (const kind of kinds) {
    const [variant, type] = variantTypes[kind] ?? variantTypes.object;
    variants += `${indent(level + 1, ctx.pad)}#[serde(untagged)]\n`;
    variants += `${indent(level + 1, ctx.pad)}${toRustIdent(variant, usedVariants)}(${type}),\n`;
  }

  mod.code += generateDocComment(schema, level, ctx.pad);
  mod.code += `${indent(level, ctx.pad)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
  mod.code += `${indent(level, ctx.pad)}#[allow(non_camel_case_types)]\n`;
  mod.code += `${indent(level, ctx.pad)}pub enum ${name} {\n${variants}${indent(level, ctx.pad)}}\n\n`;
}

// anyOf and oneOf become an untagged enum, serde takes the first variant that reads the value
function emitUnion(schema: Schema, name: string, mod: Module, ctx: Context): void {
  const level = mod.level;
  const { scope, getModule } = helperScope(name, mod);
  const variants = (schema.anyOf ?? schema.oneOf ?? [])
    .map(
      (variant, index) =>
        `${indent(level + 1, ctx.pad)}Variant${index}(${typeExpr(variant, `Variant${index}`, scope, ctx, true)}),\n`
    )
    .join('');

  mod.code += generateDocComment(schema, level, ctx.pad);
  mod.code += `${indent(level, ctx.pad)}#[derive(Debug, Serialize, Deserialize, Clone)]\n`;
  mod.code += `${indent(level, ctx.pad)}#[allow(non_camel_case_types)]\n`;
  mod.code += `${indent(level, ctx.pad)}#[serde(untagged)]\n`;
  mod.code += `${indent(level, ctx.pad)}pub enum ${name} {\n${variants}${indent(level, ctx.pad)}}\n\n`;
  emitHelperModule(name, getModule(), mod, ctx);
}

// a type of exactly this name: a struct or an enum, or an alias of any other type
function emitNamed(schema: Schema, name: string, mod: Module, ctx: Context): void {
  const target = effectiveSchema(schema, ctx);
  const kind = nominalKind(target, ctx);
  if (kind) {
    emitNominal(kind, target, name, mod, ctx);
    return;
  }

  // the types an alias needs are defined next to it, named after it
  const scope: Scope = { depth: mod.depth, helpers: () => ({ mod, path: '' }) };
  const nonNull = splitNullable(target);
  const innerKind = nonNull ? nominalKind(effectiveSchema(nonNull, ctx), ctx) : null;
  let type: string;
  if (nonNull && innerKind) {
    const inner = allocateName(mod, `${name}Inner`);
    emitNominal(innerKind, effectiveSchema(nonNull, ctx), inner, mod, ctx);
    type = `Option<${inner}>`;
  } else {
    type = typeExpr(target, name, scope, ctx, false);
  }

  mod.code += generateDocComment(schema, mod.level, ctx.pad);
  mod.code += `${indent(mod.level, ctx.pad)}pub type ${name} = ${type};\n\n`;
}

export function convertJSONSchemasToRustTypes({
  schemas,
  pad = 0,
  rootName,
}: {
  schemas: Record<string, VovkJSONSchemaBase | undefined>;
  pad?: number;
  rootName: string;
}): string {
  const slots = Object.entries(schemas).filter((entry): entry is [string, Schema] => !!entry[1]);
  if (!slots.length) return '';

  const handlerMod = newModule(1, 0);
  for (const name of new Set([...SLOT_NAMES, ...Object.keys(schemas)])) {
    handlerMod.names.add(name);
    handlerMod.names.add(`${name}_`);
  }

  // named types are shared by every slot of the handler, so they are emitted once, named before any is emitted
  const defNames = new Map<string, string>();
  const defSchemas = new Map<string, Schema>();
  for (const [, schema] of slots) {
    for (const [key, defSchema] of Object.entries(getNamedSchemas(schema))) {
      if (defNames.has(key) || !defSchema || typeof defSchema !== 'object') continue;
      defNames.set(key, allocateName(handlerMod, key));
      defSchemas.set(key, defSchema);
    }
  }

  const emitted = new Set<string>();
  for (const [slotName, schema] of slots) {
    const ctx: Context = { root: schema, defNames, defSchemas, pad, enclosing: null, refs: [] };

    for (const [key, defSchema] of Object.entries(getNamedSchemas(schema))) {
      const defName = defNames.get(key);
      if (!defName || emitted.has(key) || defSchemas.get(key) !== defSchema) continue;
      emitted.add(key);
      emitNamed(defSchema, defName, handlerMod, { ...ctx, enclosing: key });
    }

    const bodyKind = slotName === 'body' ? getBodyKind(schema) : null;
    if (bodyKind === 'form') {
      handlerMod.code += generateDocComment(schema, 1, pad);
      handlerMod.code += `${indent(1, pad)}pub use reqwest::multipart::Form as body;\n`;
    } else if (bodyKind === 'text' || bodyKind === 'binary') {
      // sent as is, so a schema without a type, as when only the content type is declared, still takes text or bytes
      handlerMod.code += generateDocComment(schema, 1, pad);
      handlerMod.code += `${indent(1, pad)}pub type body = ${bodyKind === 'text' ? 'String' : 'Vec<u8>'};\n`;
    } else {
      emitNamed(schema, slotName, handlerMod, ctx);
    }
  }

  let result = `${indent(0, pad)}#[allow(non_camel_case_types)]\n`;
  result += `${indent(0, pad)}pub mod ${rootName}_ {\n`;
  result += `${indent(1, pad)}#[allow(unused_imports)]\n`;
  result += `${indent(1, pad)}use serde::{Serialize, Deserialize};\n`;
  result += handlerMod.code;
  result += `${indent(0, pad)}}\n`;

  return result;
}
