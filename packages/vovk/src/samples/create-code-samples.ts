import type { VovkSamplesConfig } from '../types/config.js';
import type { VovkControllerSchema, VovkHandlerSchema } from '../types/core.js';
import type { VovkJSONSchemaBase } from '../types/json-schema.js';
import { getPythonClassName, getPythonMethodName, getRustFunctionName, getRustModuleName } from './client-names.js';
import { objectToCode } from './object-to-code.js';
import {
  getDescription,
  getSampleValue,
  LINE_BREAK,
  schemaToCode,
  toCodeString,
  toPythonString,
} from './schema-to-code.js';

// "myHTTPServer-v2" is "my_http_server_v2"
const toSnakeCase = (str: string) =>
  str
    .replace(/-/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1_$2')
    .toLowerCase()
    .replace(/^_/, '');

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
  hasArg,
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
  const getPyFiles = (schema: VovkJSONSchemaBase) => {
    return Object.entries(schema.properties ?? {}).reduce((acc, [key, prop]) => {
      const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
      const desc = getDescription(target) ?? getDescription(prop);

      if (target.type === 'string' && target.format === 'binary') {
        acc.push(
          `${desc ? `${getIndentSpaces(8)}# ${commentText(desc, `${getIndentSpaces(8)}# `)}\n` : ''}${getIndentSpaces(8)}(${toPythonString(key, "'")}, ${getFileTouple(target)})`
        );
      } else if (
        target.type === 'array' &&
        target.items &&
        typeof target.items !== 'boolean' &&
        target.items.format === 'binary'
      ) {
        const val = `${desc ? `${getIndentSpaces(8)}# ${commentText(desc, `${getIndentSpaces(8)}# `)}\n` : ''}${getIndentSpaces(8)}(${toPythonString(key, "'")}, ${getFileTouple(target.items)})`;
        acc.push(val, val);
      }

      return acc;
    }, [] as string[]);
  };

  const pyFiles = bodyValidation ? getPyFiles(bodyValidation) : null;
  const pyFilesArg = pyFiles?.length
    ? `${getIndentSpaces(4)}files=[\n${pyFiles.join(',\n')}\n${getIndentSpaces(4)}],`
    : null;

  const PY_CODE = `from ${packageName} import ${rpcName}
${bodyValidation && isForm(bodyValidation) ? 'from io import BytesIO\n' : ''}
response = ${rpcName}.${methodName}(${
    hasArg
      ? '\n' +
        [
          bodyValidation ? `    body=${getPySample(bodyValidation)},` : null,
          pyFilesArg,
          queryValidation ? `    query=${getPySample(queryValidation)},` : null,
          paramsValidation ? `    params=${getPySample(paramsValidation)},` : null,
          config?.apiRoot ? `    api_root=${toPythonString(config.apiRoot)},` : null,
          config?.headers
            ? `    headers=${objectToCode(config.headers, { stripQuotes: false, indent: 4, nestingIndent: 4 })},`
            : null,
        ]
          .filter(Boolean)
          .join('\n') +
        '\n'
      : ''
  })

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
    schemaToCode(schema, { stripQuotes: false, indent: indent ?? 4 });
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
    return formSample;
  };

  const getRsFormPart = (schema: VovkJSONSchemaBase, key: string, description?: string) => {
    let sampleValue: string;
    if (schema.type === 'string' && schema.format === 'binary') {
      const mediaType = getContentMediaType(schema);
      sampleValue = isTextFormat(mediaType)
        ? 'reqwest::multipart::Part::text("text_content")'
        : 'reqwest::multipart::Part::bytes(binary_data)';

      if (mediaType) {
        sampleValue += `.mime_str(${toCodeString(mediaType)}).unwrap()`;
      }
    } else if (schema.type === 'object') {
      sampleValue = '"object_unknown"';
    } else {
      sampleValue = toCodeString(String(getSampleValue(schema)));
    }

    const desc = getDescription(schema) ?? description;

    return `\n${getIndentSpaces(4)}${desc ? `// ${commentText(desc, `${getIndentSpaces(4)}// `)}\n` : ''}${getIndentSpaces(4)}.part(${toCodeString(key)}, ${sampleValue});`;
  };

  const getHashMapSample = (map: Record<string, unknown>, indent = 4) => {
    const entries = Object.entries(map)
      .map(([key, value]) => {
        return `${getIndentSpaces(indent + 2)}(${toCodeString(key)}.to_string(), ${toCodeString(String(value))}.to_string())`;
      })
      .join(',\n');
    return `Some(&HashMap::from([\n${entries}\n${getIndentSpaces(4)}]))`;
  };

  const getBody = (schema: VovkJSONSchemaBase) => {
    if (isForm(schema)) {
      return 'form';
    }
    return serdeUnwrap(getRsJSONSample(schema));
  };

  const serdeUnwrap = (fake: string) => `from_value(json!(${fake})).unwrap()`;

  const RS_CODE = `use ${packageName}::${rpcName};
use serde_json::{ 
  from_value, 
  json 
};
${iterationValidation ? 'use futures_util::StreamExt;\n' : ''}${bodyValidation && isForm(bodyValidation) ? `use reqwest::multipart;\n` : ''}#[tokio::main]
async fn main() {${bodyValidation && isForm(bodyValidation) ? `\n  ${getRsFormSample(bodyValidation)}\n` : ''}
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
  const rpcName = controllerSchema.rpcModuleName;
  const packageName = packageJson?.name || '@/client';
  // "@/client" isn't a valid Python or Rust import
  const packageNameSnake = toSnakeCase(packageJson?.name || 'client');
  const pyPackageName = packageJson?.py_name ?? packageNameSnake;
  const rsPackageName = packageJson?.rs_name ?? packageNameSnake;
  const handlerNames = Object.keys(controllerSchema.handlers ?? {});

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
    packageName: pyPackageName,
    rpcName: getPythonClassName(rpcName),
    methodName: getPythonMethodName(handlerName, handlerNames),
  });
  const rs = generateRustCode({
    ...commonParams,
    packageName: rsPackageName,
    rpcName: getRustModuleName(rpcName),
    methodName: getRustFunctionName(handlerName, handlerNames),
  });

  return { ts, py, rs };
}
