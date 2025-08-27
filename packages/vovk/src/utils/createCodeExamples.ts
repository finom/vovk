import type {
  VovkBasicJSONSchema,
  KnownAny,
  VovkControllerSchema,
  VovkHandlerSchema,
  VovkSnippetsConfig,
} from '../types';
import { getJSONSchemaExample, getSampleValue } from './getJSONSchemaExample';
import { getSampleFromObject } from './getSampleFromObject';

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
  [key: string]: KnownAny;
};

type CodeGenerationParams = {
  handlerName: string;
  rpcName: string;
  packageName: string;
  queryValidation?: VovkBasicJSONSchema;
  bodyValidation?: VovkBasicJSONSchema;
  paramsValidation?: VovkBasicJSONSchema;
  outputValidation?: VovkBasicJSONSchema;
  iterationValidation?: VovkBasicJSONSchema;
  hasArg: boolean;
  config: VovkSnippetsConfig;
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
  const getTsSample = (schema: VovkBasicJSONSchema, indent?: number) =>
    getJSONSchemaExample(schema, { stripQuotes: true, indent: indent ?? 4 });

  const getTsFormSample = (schema: VovkBasicJSONSchema) => {
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

  const getTsFormAppend = (schema: VovkBasicJSONSchema, key: string, description?: string) => {
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
      headers: ${getSampleFromObject(config.headers, { stripQuotes: true, indent: 6 })}
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
  const getPySample = (schema: VovkBasicJSONSchema, indent?: number) =>
    getJSONSchemaExample(schema, {
      stripQuotes: false,
      indent: indent ?? 4,
      comment: '#',
      ignoreBinary: true,
      nestingIndent: 4,
    });

  const handlerNameSnake = toSnakeCase(handlerName);

  const getFileTouple = (schema: VovkBasicJSONSchema) => {
    return `('name.ext', BytesIO(${isTextFormat(schema.contentMediaType) ? '"text_content".encode("utf-8")' : 'binary_data'})${schema.contentMediaType ? `, "${schema.contentMediaType}"` : ''})`;
  };
  const getPyFiles = (schema: VovkBasicJSONSchema) => {
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
            ? `    headers=${getSampleFromObject(config.headers, { stripQuotes: false, indent: 4, nestingIndent: 4 })},`
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
  const getRsJSONSample = (schema: VovkBasicJSONSchema, indent?: number) =>
    getJSONSchemaExample(schema, { stripQuotes: false, indent: indent ?? 4 });
  const getRsOutputSample = (schema: VovkBasicJSONSchema, indent?: number) =>
    getJSONSchemaExample(schema, { stripQuotes: true, indent: indent ?? 4 });
  /* const getRsFormSample = (schema: VovkBasicJSONSchema, indent?: number, nesting = 0) => {
    let formSample = 'let form = multipart::Form::new()';
    for (const [key, prop] of Object.entries(schema.properties || {})) {
      const target = prop.oneOf?.[0] || prop.anyOf?.[0] || prop.allOf?.[0] || prop;
      let sampleValue; // = value.type === 'object' ? 'object_unknown' : getSampleValue(value);
      if (target.type === 'string' && target.format === 'binary') {
        sampleValue = isTextFormat(target.contentMediaType)
          ? 'multipart::Part::text("text_content")'
          : 'multipart::Part::bytes(binary_data)';

        if (target.contentMediaType) {
          sampleValue += `.mime_str("${target.contentMediaType}").unwrap()`;
        }
      } else if (prop.type === 'array') {
        if (nesting === 0 && prop.items) {
          sampleValue =
            getRsFormSample(prop.items, indent, nesting + 1) + getRsFormSample(prop.items, indent, nesting + 1);
        } else {
          sampleValue = '"array_unknown"';
        }
      } else if (target.type === 'object') {
        sampleValue = '"object_unknown"';
      } else {
        sampleValue = `"${getSampleValue(target)}"`;
      }
      formSample += `\n${getIndentSpaces(4)}.part("${key}", ${sampleValue});`;
    }
    return formSample;
  }; */

  const getRsFormSample = (schema: VovkBasicJSONSchema) => {
    let formSample = 'let form = multipart::Form::new()';
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

  const getRsFormPart = (schema: VovkBasicJSONSchema, key: string, description?: string) => {
    let sampleValue: string;
    if (schema.type === 'string' && schema.format === 'binary') {
      sampleValue = isTextFormat(schema.contentMediaType)
        ? 'multipart::Part::text("text_content")'
        : 'multipart::Part::bytes(binary_data)';

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

  const getHashMapSample = (map: Record<string, KnownAny>, indent = 4) => {
    const entries = Object.entries(map)
      .map(([key, value]) => {
        return `${getIndentSpaces(indent + 2)}("${key}".to_string(), "${value}".to_string())`;
      })
      .join(',\n');
    return `HashMap::from([\n${entries}\n${getIndentSpaces(4)}])`;
  };

  const getBody = (schema: VovkBasicJSONSchema) => {
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
${bodyValidation?.['x-isForm'] ? `use multipart;` : ''}

pub fn main() {${bodyValidation?.['x-isForm'] ? '\n  ' + getRsFormSample(bodyValidation) + '\n' : ''}
  let response = ${rpcNameSnake}::${handlerNameSnake}(
    ${bodyValidation ? getBody(bodyValidation) : '()'}, /* body */ 
    ${queryValidation ? serdeUnwrap(getRsJSONSample(queryValidation)) : '()'}, /* query */ 
    ${paramsValidation ? serdeUnwrap(getRsJSONSample(paramsValidation)) : '()'}, /* params */ 
    ${config?.headers ? `${getHashMapSample(config.headers)}, /* headers */` : 'None, /* headers (HashMap) */ '}
    ${config?.apiRoot ? `"${config.apiRoot}".to_string(), /* api_root */` : 'None, /* api_root */'}
    false, /* disable_client_validation */
  );${
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
    Ok(stream) => {
      for (i, item) in stream.enumerate() {
        println!("#{}: {:?}", i, item);
        /*
        #0: iteration ${getRsOutputSample(iterationValidation, 8)}
        */
      }
    },
    Err(e) => println!("Error initiating stream: {:?}", e),
  }`
      : ''
  }
}`;

  return RS_CODE.trim();
}

export function createCodeExamples({
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
  config: VovkSnippetsConfig;
}) {
  const queryValidation = handlerSchema?.validation?.query as VovkBasicJSONSchema | undefined;
  const bodyValidation = handlerSchema?.validation?.body as VovkBasicJSONSchema | undefined;
  const paramsValidation = handlerSchema?.validation?.params as VovkBasicJSONSchema | undefined;
  const outputValidation = handlerSchema?.validation?.output as VovkBasicJSONSchema | undefined;
  const iterationValidation = handlerSchema?.validation?.iteration as VovkBasicJSONSchema | undefined;

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
