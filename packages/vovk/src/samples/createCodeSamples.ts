import type { VovkJSONSchemaBase, VovkControllerSchema, VovkHandlerSchema, VovkSamplesConfig } from '../types.js';
import { JSONSchemaToCode, getSampleValue } from './JSONSchemaToCode.js';
import { objectToCode } from './objectToCode.js';

const toSnakeCase = (str: string) =>
  str
    .replace(/-/g, '_') // Replace hyphens with underscores
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // Add underscore between lowercase/digit and uppercase
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1_$2') // Add underscore between uppercase letters if the second one is followed by a lowercase
    .toLowerCase()
    .replace(/^_/, ''); // Remove leading underscore

const getIndentSpaces = (level: number): string => ' '.repeat(level);

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
    JSONSchemaToCode(schema, { stripQuotes: true, indent: indent ?? 4 });

  const getTsFormSample = (schema: VovkJSONSchemaBase) => {
    let formSample = '\nconst formData = new FormData();';
    for (const [key, prop] of Object.entries(schema.properties || {})) {
      const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
      const desc = target.description ?? prop.description ?? undefined;
      if (target.type === 'array' && target.items) {
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
      sampleValue = `new Blob(${isTextFormat(schema.contentMediaType) ? '["text_content"]' : '[binary_data]'}${
        schema.contentMediaType ? `, { type: "${schema.contentMediaType}" }` : ''
      })`;
    } else if (schema.type === 'object') {
      sampleValue = '"object_unknown"';
    } else {
      sampleValue = `"${getSampleValue(schema)}"`;
    }

    const desc = schema.description ?? description;

    return `\n${desc ? `// ${desc}\n` : ''}formData.append("${key}", ${sampleValue});`;
  };

  const tsArgs = hasArg
    ? `{
${[
  bodyValidation ? `    body: ${bodyValidation['x-isForm'] ? 'formData' : getTsSample(bodyValidation)},` : null,
  queryValidation ? `    query: ${getTsSample(queryValidation)},` : null,
  paramsValidation ? `    params: ${getTsSample(paramsValidation)},` : null,
  config?.apiRoot ? `    apiRoot: '${config.apiRoot}',` : null,
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

  const TS_CODE = `import { ${rpcName} } from '${packageName}';
${bodyValidation?.['x-isForm'] ? getTsFormSample(bodyValidation) + '\n' : ''}
${iterationValidation ? 'using' : 'const'} response = await ${rpcName}.${handlerName}(${tsArgs});
${
  outputValidation
    ? `
console.log(response); 
/* 
${getTsSample(outputValidation, 0)}
*/`
    : ''
}${
    iterationValidation
      ? `
for await (const item of response) {
    console.log(item); 
    /*
    ${getTsSample(iterationValidation)}
    */
}`
      : ''
  }`;

  return TS_CODE.trim();
}

function generatePythonCode({
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
  const getPySample = (schema: VovkJSONSchemaBase, indent?: number) =>
    JSONSchemaToCode(schema, {
      stripQuotes: false,
      indent: indent ?? 4,
      comment: '#',
      ignoreBinary: true,
      nestingIndent: 4,
    });

  const handlerNameSnake = toSnakeCase(handlerName);

  const getFileTouple = (schema: VovkJSONSchemaBase) => {
    return `('name.ext', BytesIO(${isTextFormat(schema.contentMediaType) ? '"text_content".encode("utf-8")' : 'binary_data'})${schema.contentMediaType ? `, "${schema.contentMediaType}"` : ''})`;
  };
  const getPyFiles = (schema: VovkJSONSchemaBase) => {
    return Object.entries(schema.properties ?? {}).reduce((acc, [key, prop]) => {
      const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
      const desc = target.description ?? prop.description ?? undefined;

      if (target.type === 'string' && target.format === 'binary') {
        acc.push(
          `${desc ? `${getIndentSpaces(8)}# ${desc}\n` : ''}${getIndentSpaces(8)}('${key}', ${getFileTouple(target)})`
        );
      } else if (target.type === 'array' && target.items?.format === 'binary') {
        const val = `${desc ? `${getIndentSpaces(8)}# ${desc}\n` : ''}${getIndentSpaces(8)}('${key}', ${getFileTouple(target.items)})`;
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
${bodyValidation?.['x-isForm'] ? 'from io import BytesIO\n' : ''}
response = ${rpcName}.${handlerNameSnake}(${
    hasArg
      ? '\n' +
        [
          bodyValidation ? `    body=${getPySample(bodyValidation)},` : null,
          pyFilesArg,
          queryValidation ? `    query=${getPySample(queryValidation)},` : null,
          paramsValidation ? `    params=${getPySample(paramsValidation)},` : null,
          config?.apiRoot ? `    api_root="${config.apiRoot}",` : null,
          config?.headers
            ? `    headers=${objectToCode(config.headers, { stripQuotes: false, indent: 4, nestingIndent: 4 })},`
            : null,
        ]
          .filter(Boolean)
          .join('\n') +
        '\n'
      : ''
  })

${outputValidation ? `print(response)\n${getPySample(outputValidation, 0)}` : ''}${
    iterationValidation
      ? `for i, item in enumerate(response):
    print(f"iteration #{i}:\\n {item}")
    # iteration #0:
    ${getPySample(iterationValidation)}`
      : ''
  }`;

  return PY_CODE.trim();
}

function generateRustCode({
  handlerName,
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
    JSONSchemaToCode(schema, { stripQuotes: false, indent: indent ?? 4 });
  const getRsOutputSample = (schema: VovkJSONSchemaBase, indent?: number) =>
    JSONSchemaToCode(schema, { stripQuotes: true, indent: indent ?? 4 });

  const getRsFormSample = (schema: VovkJSONSchemaBase) => {
    let formSample = 'let form = reqwest::multipart::Form::new()';
    for (const [key, prop] of Object.entries(schema.properties || {})) {
      const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
      const desc = target.description ?? prop.description ?? undefined;
      if (target.type === 'array' && target.items) {
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
      sampleValue = isTextFormat(schema.contentMediaType)
        ? 'reqwest::multipart::Part::text("text_content")'
        : 'reqwest::multipart::Part::bytes(binary_data)';

      if (schema.contentMediaType) {
        sampleValue += `.mime_str("${schema.contentMediaType}").unwrap()`;
      }
    } else if (schema.type === 'object') {
      sampleValue = '"object_unknown"';
    } else {
      sampleValue = `"${getSampleValue(schema)}"`;
    }

    const desc = schema.description ?? description;

    return `\n${getIndentSpaces(4)}${desc ? `// ${desc}\n` : ''}${getIndentSpaces(4)}.part("${key}", ${sampleValue});`;
  };

  const getHashMapSample = (map: Record<string, unknown>, indent = 4) => {
    const entries = Object.entries(map)
      .map(([key, value]) => {
        return `${getIndentSpaces(indent + 2)}("${key}".to_string(), "${value}".to_string())`;
      })
      .join(',\n');
    return `Some(&HashMap::from([\n${entries}\n${getIndentSpaces(4)}]))`;
  };

  const getBody = (schema: VovkJSONSchemaBase) => {
    if (schema['x-isForm']) {
      return 'form';
    }
    return serdeUnwrap(getRsJSONSample(schema));
  };

  const handlerNameSnake = toSnakeCase(handlerName);
  const rpcNameSnake = toSnakeCase(rpcName);

  const serdeUnwrap = (fake: string) => `from_value(json!(${fake})).unwrap()`;

  const RS_CODE = `use ${packageName}::${rpcNameSnake};
use serde_json::{ 
  from_value, 
  json 
};
${iterationValidation ? 'use futures_util::StreamExt;\n' : ''}${bodyValidation?.['x-isForm'] ? `use reqwest::multipart;\n` : ''}#[tokio::main]
async fn main() {${bodyValidation?.['x-isForm'] ? '\n  ' + getRsFormSample(bodyValidation) + '\n' : ''}
  let response = ${rpcNameSnake}::${handlerNameSnake}(
    ${bodyValidation ? getBody(bodyValidation) : '()'}, /* body */ 
    ${queryValidation ? serdeUnwrap(getRsJSONSample(queryValidation)) : '()'}, /* query */ 
    ${paramsValidation ? serdeUnwrap(getRsJSONSample(paramsValidation)) : '()'}, /* params */ 
    ${config?.headers ? `${getHashMapSample(config.headers)}, /* headers */` : 'None, /* headers (HashMap) */ '}
    ${config?.apiRoot ? `Some("${config.apiRoot}"), /* api_root */` : 'None, /* api_root */'}
    false, /* disable_client_validation */
  ).await;${
    outputValidation
      ? `\n\nmatch response {
    Ok(output) => println!("{:?}", output),
    /* 
    output ${getRsOutputSample(outputValidation)} 
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
            #0: iteration ${getRsOutputSample(iterationValidation, 8)}
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
  const packageName = packageJson?.name || 'vovk-client';
  const packageNameSnake = toSnakeCase(packageName);
  const pyPackageName = packageJson?.py_name ?? packageNameSnake;
  const rsPackageName = packageJson?.rs_name ?? packageNameSnake;

  const commonParams: CodeGenerationParams = {
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
  };

  const ts = generateTypeScriptCode(commonParams);
  const py = generatePythonCode({ ...commonParams, packageName: pyPackageName });
  const rs = generateRustCode({ ...commonParams, packageName: rsPackageName });

  return { ts, py, rs };
}
