import type { VovkSamplesConfig } from '../types/config.js';
import type { VovkControllerSchema, VovkHandlerSchema } from '../types/core.js';
import type { VovkJSONSchemaBase } from '../types/json-schema.js';
import { toPythonPackageName, toUnderscoredPackageName } from '../utils/to-underscored-package-name.js';
import { getPythonClassName, getPythonMethodName, getRustFunctionName, getRustModuleName } from './client-names.js';
import { objectToCode } from './object-to-code.js';
import {
  getDescription,
  getSampleValue,
  LINE_BREAK,
  resolveRef,
  schemaToCode,
  toCodeString,
  toPythonString,
} from './schema-to-code.js';

const getIndentSpaces = (level: number): string => ' '.repeat(level);

// a handler as the generated TypeScript client has it: by its own name, in brackets when that isn't an identifier
const toTsMethod = (handlerName: string) =>
  /^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(handlerName) ? `.${handlerName}` : `[${toCodeString(handlerName)}]`;

// a third-party OpenAPI document may hold a media type that isn't a string, a sample leaves it out
const getContentMediaType = (schema: VovkJSONSchemaBase) =>
  typeof schema.contentMediaType === 'string' ? schema.contentMediaType : undefined;

// a description in a line comment: every line after a break starts the comment again
const commentText = (description: string, linePrefix: string) => description.split(LINE_BREAK).join(`\n${linePrefix}`);

// text in a /* */ comment: */ would end the comment, and in Rust /* would open a nested one
const inBlockComment = (text: string, nests = false) => {
  const unclosed = text.replace(/\*\//g, '*\\/');
  return nests ? unclosed.replace(/\/\*/g, '/\\*') : unclosed;
};

function isTextFormat(mimeType?: string): boolean {
  if (!mimeType) return false;
  return (
    mimeType.startsWith('text/') ||
    [
      'application/json',
      'application/ld+json',
      'application/xml',
      'application/xhtml+xml',
      'application/javascript',
      'application/typescript',
      'application/yaml',
      'application/x-yaml',
      'application/toml',
      'application/sql',
      'application/graphql',
      'application/x-www-form-urlencoded',
    ].includes(mimeType) ||
    mimeType.endsWith('+json') ||
    mimeType.endsWith('+xml')
  );
}

export type CodeSamplePackageJson = {
  name?: string;
  version?: string;
  description?: string;
  rs_name?: string;
  py_name?: string;
};

type CodeGenerationParams = {
  handlerName: string;
  // the handler's method in the client of the sample's language
  methodName: string;
  // the module in the client of the sample's language
  rpcName: string;
  packageName: string;
  queryValidation?: VovkJSONSchemaBase;
  bodyValidation?: VovkJSONSchemaBase;
  paramsValidation?: VovkJSONSchemaBase;
  outputValidation?: VovkJSONSchemaBase;
  iterationValidation?: VovkJSONSchemaBase;
  hasArg: boolean;
  config: VovkSamplesConfig;
};

const isForm = (schema: VovkJSONSchemaBase): boolean => {
  const contentTypes = schema['x-contentType'] ?? [];
  return contentTypes.some((ct) => ct === 'multipart/form-data' || ct === 'application/x-www-form-urlencoded') ?? false;
};

// the Python and Rust samples pass a body as the generated method takes it: vovk can't import vovk-python or
// vovk-rust, so the rules they type it by are copied here

const MAX_FILE_SEARCH_DEPTH = 16;

const isBinarySchema = (schema: VovkJSONSchemaBase) =>
  schema.format === 'binary' || schema.contentEncoding === 'binary';

// the file a field holds: itself, or one in a list, a tuple or a combination
function findFile(
  schema: VovkJSONSchemaBase | undefined,
  root: VovkJSONSchemaBase,
  depth = 0
): VovkJSONSchemaBase | null {
  if (!schema || typeof schema !== 'object' || depth > MAX_FILE_SEARCH_DEPTH) return null;
  if (schema.$ref) return findFile(resolveRef(schema.$ref, root), root, depth + 1);
  if (isBinarySchema(schema)) return schema;
  const items = schema.items && typeof schema.items === 'object' ? [schema.items].flat() : [];
  const parts = [...items, ...(schema.prefixItems ?? []), ...(schema.anyOf ?? []), ...(schema.oneOf ?? [])];
  for (const part of [...parts, ...(schema.allOf ?? [])]) {
    const file = findFile(part, root, depth + 1);
    if (file) return file;
  }
  return null;
}

// the objects a body may be: itself and every branch of its unions and intersections
function getBodyObjects(
  schema: VovkJSONSchemaBase | undefined,
  root: VovkJSONSchemaBase,
  depth = 0
): VovkJSONSchemaBase[] {
  if (!schema || typeof schema !== 'object' || depth > MAX_FILE_SEARCH_DEPTH) return [];
  if (schema.$ref) return getBodyObjects(resolveRef(schema.$ref, root), root, depth + 1);
  const branches = [...(schema.allOf ?? []), ...(schema.anyOf ?? []), ...(schema.oneOf ?? [])];
  return [schema, ...branches.flatMap((branch) => getBodyObjects(branch, root, depth + 1))];
}

// the fields of a body, or of a branch of it, that hold a file, each name once, with the file each holds
function getFileFields(schema: VovkJSONSchemaBase) {
  const fields = new Map<string, { prop: VovkJSONSchemaBase; file: VovkJSONSchemaBase }>();
  for (const object of getBodyObjects(schema, schema)) {
    for (const [key, prop] of Object.entries(object.properties ?? {})) {
      const file = fields.has(key) ? null : findFile(prop, schema);
      if (file) fields.set(key, { prop, file });
    }
  }
  return [...fields];
}

type BodyKind = 'form' | 'urlencoded' | 'binary' | 'text' | 'json';

// what the Python ('py') or Rust ('rs') client takes for a body
function getBodyKind(schema: VovkJSONSchemaBase, language: 'py' | 'rs'): BodyKind {
  const contentTypes = schema['x-contentType'] ?? [];
  const declaresForm =
    contentTypes.includes('multipart/form-data') || contentTypes.includes('application/x-www-form-urlencoded');
  if (declaresForm && language === 'py') return 'form';
  // the Rust client sends an object as a form only when JSON can't carry it: no JSON declared, or a file in it
  const declaresJSON = contentTypes.some((ct) => ct === 'application/json' || ct.endsWith('+json'));
  if (declaresForm && declaresJSON && !findFile(schema, schema) && !getFileFields(schema).length) return 'json';
  if (contentTypes.includes('multipart/form-data')) return 'form';
  if (contentTypes.includes('application/x-www-form-urlencoded')) return 'urlencoded';
  if (isBinarySchema(schema)) return 'binary';
  const isStructured = schema.type === 'object' || schema.type === 'array' || !!schema.properties;
  if (!isStructured && contentTypes.some((ct) => ct.startsWith('text/'))) return 'text';
  // a scalar body of a declared type that isn't JSON is raw bytes, e.g. application/octet-stream or image/png
  const isJSONContentType = (ct: string) => ct === '*/*' || ct === 'application/json' || ct.endsWith('+json');
  if (!isStructured && contentTypes.length && !contentTypes.some(isJSONContentType)) return 'binary';
  return 'json';
}

// a JSON body that may also be a file is shown by its first branch that isn't one
function withoutFileBranch(schema: VovkJSONSchemaBase): VovkJSONSchemaBase {
  const branches = schema.anyOf ?? schema.oneOf;
  const data = branches?.find((branch) => !findFile(branch, schema));
  return data && branches?.some((branch) => findFile(branch, schema))
    ? { $defs: schema.$defs, definitions: schema.definitions, ...data }
    : schema;
}

const getTextSample = (schema: VovkJSONSchemaBase) => {
  const value = getSampleValue(schema);
  return typeof value === 'string' ? value : 'text_content';
};

// a path with {name} placeholders takes params in the Python and Rust clients, with or without a params schema
function getPathParamsSchema(path: string): VovkJSONSchemaBase | undefined {
  const names = [...path.matchAll(/\{([^{}]+)\}/g)].map(([, name]) => name);
  return names.length
    ? {
        type: 'object',
        properties: Object.fromEntries(names.map((name) => [name, { type: 'string' }])),
        required: names,
      }
    : undefined;
}

function generateTypeScriptCode({
  handlerName,
  rpcName,
  packageName,
  queryValidation,
  bodyValidation,
  paramsValidation,
  outputValidation,
  iterationValidation,
  hasArg,
  config,
}: CodeGenerationParams): string {
  const getTsSample = (schema: VovkJSONSchemaBase, indent?: number) =>
    schemaToCode(schema, { stripQuotes: true, indent: indent ?? 4 });

  const getTsFormSample = (schema: VovkJSONSchemaBase) => {
    let formSample = '\nconst formData = new FormData();';
    for (const [key, prop] of Object.entries(schema.properties || {})) {
      const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
      const desc = getDescription(target) ?? getDescription(prop);
      if (target.type === 'array' && target.items && typeof target.items !== 'boolean') {
        formSample += getTsFormAppend(target.items, key, desc);
        formSample += getTsFormAppend(target.items, key, desc);
      } else {
        formSample += getTsFormAppend(target, key, desc);
      }
    }
    return formSample;
  };

  const getTsFormAppend = (schema: VovkJSONSchemaBase, key: string, description?: string) => {
    let sampleValue: string;
    if (schema.type === 'string' && schema.format === 'binary') {
      const mediaType = getContentMediaType(schema);
      sampleValue = `new Blob(${isTextFormat(mediaType) ? '["text_content"]' : '[binary_data]'}${
        mediaType ? `, { type: ${toCodeString(mediaType)} }` : ''
      })`;
    } else if (schema.type === 'object') {
      sampleValue = '"object_unknown"';
    } else {
      sampleValue = toCodeString(String(getSampleValue(schema)));
    }

    const desc = getDescription(schema) ?? description;

    return `\n${desc ? `// ${commentText(desc, '// ')}\n` : ''}formData.append(${toCodeString(key)}, ${sampleValue});`;
  };

  const tsArgs = hasArg
    ? `{
${[
  bodyValidation ? `    body: ${isForm(bodyValidation) ? 'formData' : getTsSample(bodyValidation)},` : null,
  queryValidation ? `    query: ${getTsSample(queryValidation)},` : null,
  paramsValidation ? `    params: ${getTsSample(paramsValidation)},` : null,
  config?.apiRoot ? `    apiRoot: ${toCodeString(config.apiRoot, "'")},` : null,
  config?.headers
    ? `    init: {
      headers: ${objectToCode(config.headers, { stripQuotes: true, indent: 6, nestingIndent: 4 })}
    },`
    : null,
]
  .filter(Boolean)
  .join('\n')}
}`
    : '';

  const TS_CODE = `import { ${rpcName} } from ${toCodeString(packageName, "'")};
${bodyValidation && isForm(bodyValidation) ? `${getTsFormSample(bodyValidation)}\n` : ''}
${iterationValidation ? 'using' : 'const'} response = await ${rpcName}${toTsMethod(handlerName)}(${tsArgs});
${
  outputValidation
    ? `
console.log(response); 
/* 
${inBlockComment(getTsSample(outputValidation, 0))}
*/`
    : ''
}${
  iterationValidation
    ? `
for await (const item of response) {
    console.log(item); 
    /*
    ${inBlockComment(getTsSample(iterationValidation))}
    */
}`
    : ''
}`;

  return TS_CODE.trim();
}

function generatePythonCode({
  methodName,
  rpcName,
  packageName,
  queryValidation,
  bodyValidation,
  paramsValidation,
  outputValidation,
  iterationValidation,
  config,
}: CodeGenerationParams): string {
  const getPySample = (schema: VovkJSONSchemaBase, indent?: number) =>
    schemaToCode(schema, {
      stripQuotes: false,
      indent: indent ?? 4,
      comment: '#',
      ignoreBinary: true,
      nestingIndent: 4,
      python: true,
    });
  // what comes back is described in a comment, as the TypeScript and Rust samples do
  const commentOut = (code: string, indent = '') =>
    code
      .split('\n')
      .map((line) => `${indent}# ${line}`.trimEnd())
      .join('\n');

  const getFileTouple = (schema: VovkJSONSchemaBase) => {
    const mediaType = getContentMediaType(schema);
    return `('name.ext', BytesIO(${isTextFormat(mediaType) ? '"text_content".encode("utf-8")' : 'binary_data'})${mediaType ? `, ${toPythonString(mediaType)}` : ''})`;
  };
  const fileFields = bodyValidation ? getFileFields(bodyValidation) : [];
  // one file field that isn't a list is a TypedDict of it in the Python client, other files a list of (name, file)
  const filesAsDict = fileFields.length === 1 && fileFields[0][1].prop.type !== 'array';
  const pyFiles = fileFields.flatMap(([key, { prop, file }]) => {
    const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
    const desc = getDescription(target) ?? getDescription(prop);
    const comment = desc ? `${getIndentSpaces(8)}# ${commentText(desc, `${getIndentSpaces(8)}# `)}\n` : '';
    if (filesAsDict) return [`${comment}${getIndentSpaces(8)}${toPythonString(key, "'")}: ${getFileTouple(file)}`];
    const pair = `${comment}${getIndentSpaces(8)}(${toPythonString(key, "'")}, ${getFileTouple(file)})`;
    return target.type === 'array' ? [pair, pair] : [pair];
  });
  const pyFilesArg = pyFiles.length
    ? `${getIndentSpaces(4)}files=${filesAsDict ? '{' : '['}\n${pyFiles.join(',\n')}\n${getIndentSpaces(4)}${filesAsDict ? '}' : ']'},`
    : null;

  const getPyBody = (schema: VovkJSONSchemaBase) => {
    const kind = getBodyKind(schema, 'py');
    if (kind === 'binary') return 'binary_data';
    if (kind === 'text') return toPythonString(getTextSample(schema));
    // a form whose listed fields all hold files is sent as files alone, the method takes no body
    const target = schema.$ref ? resolveRef(schema.$ref, schema) : schema;
    if (
      kind === 'form' &&
      target.properties &&
      Object.values(target.properties).every((prop) => findFile(prop, schema))
    ) {
      return null;
    }
    // a file ignored in the sample leaves nothing, bytes stand in for it
    return getPySample(withoutFileBranch(schema)) || 'binary_data';
  };
  const pyBody = bodyValidation ? getPyBody(bodyValidation) : null;

  const pyArgs = [
    pyBody ? `    body=${pyBody},` : null,
    pyFilesArg,
    queryValidation ? `    query=${getPySample(queryValidation)},` : null,
    paramsValidation ? `    params=${getPySample(paramsValidation)},` : null,
    config?.apiRoot ? `    api_root=${toPythonString(config.apiRoot)},` : null,
    config?.headers
      ? `    headers=${objectToCode(config.headers, { stripQuotes: false, indent: 4, nestingIndent: 4 })},`
      : null,
  ].filter(Boolean);

  const PY_CODE = `from ${packageName} import ${rpcName}
${pyFilesArg ? 'from io import BytesIO\n' : ''}
response = ${rpcName}.${methodName}(${pyArgs.length ? `\n${pyArgs.join('\n')}\n` : ''})

${outputValidation ? `print(response)\n${commentOut(getPySample(outputValidation, 0))}` : ''}${
  iterationValidation
    ? `for i, item in enumerate(response):
    print(f"iteration #{i}:\\n {item}")
    # iteration #0:
${commentOut(getPySample(iterationValidation, 0), '    ')}`
    : ''
}`;

  return PY_CODE.trim();
}

function generateRustCode({
  methodName,
  rpcName,
  packageName,
  queryValidation,
  bodyValidation,
  paramsValidation,
  outputValidation,
  iterationValidation,
  config,
}: CodeGenerationParams): string {
  const getRsJSONSample = (schema: VovkJSONSchemaBase, indent?: number) =>
    schemaToCode(schema, { stripQuotes: false, indent: indent ?? 4, rust: true });
  const getRsOutputSample = (schema: VovkJSONSchemaBase, indent?: number) =>
    schemaToCode(schema, { stripQuotes: true, indent: indent ?? 4 });

  const getRsFormSample = (schema: VovkJSONSchemaBase) => {
    let formSample = 'let form = reqwest::multipart::Form::new()';
    for (const [key, prop] of Object.entries(schema.properties || {})) {
      const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
      const desc = getDescription(target) ?? getDescription(prop);
      if (target.type === 'array' && target.items && typeof target.items !== 'boolean') {
        formSample += getRsFormPart(target.items, key, desc);
        formSample += getRsFormPart(target.items, key, desc);
      } else {
        formSample += getRsFormPart(target, key, desc);
      }
    }
    return `${formSample};`;
  };

  // a file is a Part with a file name, without one a server reads it as a text field; any other field is text
  const getRsFormPart = (schema: VovkJSONSchemaBase, key: string, description?: string) => {
    let call: string;
    if (schema.type === 'string' && schema.format === 'binary') {
      const mediaType = getContentMediaType(schema);
      call = `.part(${toCodeString(key)}, reqwest::multipart::Part::${
        isTextFormat(mediaType) ? 'text("text_content")' : 'bytes(binary_data)'
      }.file_name("name.ext")${mediaType ? `.mime_str(${toCodeString(mediaType)}).unwrap()` : ''})`;
    } else {
      call = `.text(${toCodeString(key)}, ${schema.type === 'object' ? '"object_unknown"' : toCodeString(String(getSampleValue(schema)))})`;
    }

    const desc = getDescription(schema) ?? description;

    return `\n${getIndentSpaces(4)}${desc ? `// ${commentText(desc, `${getIndentSpaces(4)}// `)}\n${getIndentSpaces(4)}` : ''}${call}`;
  };

  const getHashMapSample = (map: Record<string, unknown>, indent = 4) => {
    const entries = Object.entries(map)
      .map(([key, value]) => {
        return `${getIndentSpaces(indent + 2)}(${toCodeString(key)}.to_string(), ${toCodeString(String(value))}.to_string())`;
      })
      .join(',\n');
    return `Some(&HashMap::from([\n${entries}\n${getIndentSpaces(4)}]))`;
  };

  const serdeUnwrap = (fake: string) => `from_value(json!(${fake})).unwrap()`;

  const bodyKind = bodyValidation && getBodyKind(bodyValidation, 'rs');
  const getBody = (schema: VovkJSONSchemaBase) => {
    if (bodyKind === 'form') return 'form';
    if (bodyKind === 'binary') return 'binary_data.to_vec()';
    if (bodyKind === 'text') return `${toCodeString(getTextSample(schema))}.to_string()`;
    // an urlencoded body and a JSON one are the generated struct
    return serdeUnwrap(getRsJSONSample(withoutFileBranch(schema)));
  };

  const RS_CODE = `use ${packageName}::${rpcName};
${config?.headers ? 'use std::collections::HashMap;\n' : ''}use serde_json::{ 
  from_value, 
  json 
};
${iterationValidation ? 'use futures_util::StreamExt;\n' : ''}#[tokio::main]
async fn main() {${bodyValidation && bodyKind === 'form' ? `\n  ${getRsFormSample(bodyValidation)}\n` : ''}
  let response = ${rpcName}::${methodName}(
    ${bodyValidation ? getBody(bodyValidation) : '()'}, /* body */ 
    ${queryValidation ? serdeUnwrap(getRsJSONSample(queryValidation)) : '()'}, /* query */ 
    ${paramsValidation ? serdeUnwrap(getRsJSONSample(paramsValidation)) : '()'}, /* params */ 
    ${config?.headers ? `${getHashMapSample(config.headers)}, /* headers */` : 'None, /* headers (HashMap) */ '}
    ${config?.apiRoot ? `Some(${toCodeString(config.apiRoot)}), /* api_root */` : 'None, /* api_root */'}
    false, /* disable_client_validation */
  ).await;${
    outputValidation
      ? `\n\nmatch response {
    Ok(output) => println!("{:?}", output),
    /* 
    output ${inBlockComment(getRsOutputSample(outputValidation), true)} 
    */
    Err(e) => println!("error: {:?}", e),
  }`
      : ''
  }${
    iterationValidation
      ? `\n\nmatch response {
    Ok(mut stream) => {
      let mut i = 0;
      while let Some(item) = stream.next().await {
        match item {
          Ok(value) => {
            println!("#{}: {:?}", i, value);
            /*
            #0: iteration ${inBlockComment(getRsOutputSample(iterationValidation, 8), true)}
            */
            i += 1;
          }
          Err(e) => {
            eprintln!("stream error: {:?}", e);
            break;
          }
        }
      }
    },
    Err(e) => println!("Error initiating stream: {:?}", e),
  }`
      : ''
  }
}`;

  return RS_CODE.trim();
}

export function createCodeSamples({
  handlerName,
  handlerSchema,
  controllerSchema,
  package: packageJson,
  config,
}: {
  handlerName: string;
  handlerSchema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  package?: CodeSamplePackageJson;
  config: VovkSamplesConfig;
}) {
  const queryValidation = handlerSchema?.validation?.query as VovkJSONSchemaBase | undefined;
  const bodyValidation = handlerSchema?.validation?.body as VovkJSONSchemaBase | undefined;
  const paramsValidation = handlerSchema?.validation?.params as VovkJSONSchemaBase | undefined;
  const outputValidation = handlerSchema?.validation?.output as VovkJSONSchemaBase | undefined;
  const iterationValidation = handlerSchema?.validation?.iteration as VovkJSONSchemaBase | undefined;

  const hasArg = !!queryValidation || !!bodyValidation || !!paramsValidation || !!config?.apiRoot || !!config?.headers;
  const pathParamsValidation =
    paramsValidation ?? getPathParamsSchema(`${controllerSchema.prefix ?? ''}/${handlerSchema.path}`);
  const rpcName = controllerSchema.rpcModuleName;
  const packageName = packageJson?.name || '@/client';
  // the names the generated Python and Rust packages are imported by; Rust imports a crate with '-' as '_'
  const pyPackageName = packageJson?.py_name
    ? toPythonPackageName(packageJson.py_name)
    : toUnderscoredPackageName(packageJson?.name);
  const rsPackageName = (packageJson?.rs_name || toUnderscoredPackageName(packageJson?.name)).replace(/-/g, '_');
  const handlers = controllerSchema.handlers ?? {};

  const commonParams: CodeGenerationParams = {
    handlerName,
    methodName: handlerName,
    rpcName,
    packageName,
    queryValidation,
    bodyValidation,
    paramsValidation,
    outputValidation,
    iterationValidation,
    hasArg,
    config,
  };

  const ts = generateTypeScriptCode(commonParams);
  const py = generatePythonCode({
    ...commonParams,
    paramsValidation: pathParamsValidation,
    packageName: pyPackageName,
    rpcName: getPythonClassName(rpcName),
    methodName: getPythonMethodName(handlerName, handlers),
  });
  const rs = generateRustCode({
    ...commonParams,
    paramsValidation: pathParamsValidation,
    packageName: rsPackageName,
    rpcName: getRustModuleName(rpcName),
    methodName: getRustFunctionName(handlerName, handlers),
  });

  return { ts, py, rs };
}
