import type { SimpleJSONSchema, KnownAny, VovkControllerSchema, VovkHandlerSchema } from '../types';
import { getJSONSchemaExample } from './getJSONSchemaExample';

const toSnakeCase = (str: string) =>
  str
    .replace(/-/g, '_') // Replace hyphens with underscores
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // Add underscore between lowercase/digit and uppercase
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1_$2') // Add underscore between uppercase letters if the second one is followed by a lowercase
    .toLowerCase()
    .replace(/^_/, ''); // Remove leading underscore

export type CodeSamplePackageJson = {
  name?: string;
  version?: string;
  description?: string;
  rs_name?: string;
  py_name?: string;
  [key: string]: KnownAny;
};

export function createCodeExamples({
  handlerName,
  handlerSchema,
  controllerSchema,
  package: packageJson,
}: {
  handlerName: string;
  handlerSchema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  package?: CodeSamplePackageJson;
}) {
  const queryValidation = handlerSchema?.validation?.query as SimpleJSONSchema | undefined;
  const bodyValidation = handlerSchema?.validation?.body as SimpleJSONSchema | undefined;
  const paramsValidation = handlerSchema?.validation?.params as SimpleJSONSchema | undefined;
  const outputValidation = handlerSchema?.validation?.output as SimpleJSONSchema | undefined;
  const iterationValidation = handlerSchema?.validation?.iteration as SimpleJSONSchema | undefined;
  const getTsSample = (schema: SimpleJSONSchema, indent?: number) =>
    getJSONSchemaExample(schema, { stripQuotes: true, indent: indent ?? 4 });
  const getPySample = (schema: SimpleJSONSchema, indent?: number) =>
    getJSONSchemaExample(schema, { stripQuotes: false, indent: indent ?? 4, comment: '#' });
  const getRsSample = (schema: SimpleJSONSchema, indent?: number) =>
    getJSONSchemaExample(schema, { stripQuotes: false, indent: indent ?? 4 });
  const hasArg = !!queryValidation || !!bodyValidation || !!paramsValidation;
  const rpcName = controllerSchema.rpcModuleName;
  const handlerNameSnake = toSnakeCase(handlerName);
  const rpcNameSnake = toSnakeCase(rpcName);
  const packageName = packageJson?.name || 'vovk-client';
  const packageNameSnake = toSnakeCase(packageName);

  const tsArgs = hasArg
    ? `{
${[
  bodyValidation ? `    body: ${getTsSample(bodyValidation)},` : null,
  queryValidation ? `    query: ${getTsSample(queryValidation)},` : null,
  paramsValidation ? `    params: ${getTsSample(paramsValidation)},` : null,
]
  .filter(Boolean)
  .join('\n')}
}`
    : '';
  const TS_CODE = `import { ${rpcName} } from '${packageName}';

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

  const PY_CODE = `from ${packageJson?.py_name ?? packageNameSnake} import ${rpcName}

response = ${rpcName}.${handlerNameSnake}(${
    hasArg
      ? '\n' +
        [
          bodyValidation ? `    body=${getPySample(bodyValidation)},` : null,
          queryValidation ? `    query=${getPySample(queryValidation)},` : null,
          paramsValidation ? `    params=${getPySample(paramsValidation)},` : null,
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

  const serdeUnwrap = (fake: string) => `from_value(json!(${fake})).unwrap()`;

  const RS_CODE = `use ${packageJson?.rs_name ?? packageNameSnake}::${rpcNameSnake};
use serde_json::{ from_value, json };

pub fn main() {
  let response = ${rpcNameSnake}::${handlerNameSnake}(
    ${bodyValidation ? serdeUnwrap(getRsSample(bodyValidation)) : '()'}, /* body */ 
    ${queryValidation ? serdeUnwrap(getRsSample(queryValidation)) : '()'}, /* query */ 
    ${paramsValidation ? serdeUnwrap(getRsSample(paramsValidation)) : '()'}, /* params */ 
    None, /* headers (HashMap) */ 
    None, /* api_root */ 
    false, /* disable_client_validation */
  );${
    outputValidation
      ? `\n\nmatch response {
    Ok(output) => println!("{:?}", output),
    /* 
    output ${getTsSample(outputValidation)} 
    */
    Err(e) => println!("error: {:?}", e),
  }`
      : ''
  }${
    iterationValidation
      ? `match response {
    Ok(stream) => {
      for (i, item) in stream.enumerate() {
        println!("#{}: {:?}", i, item);
        /*
        #0: iteration ${getTsSample(iterationValidation, 8)}
        */
      }
    },
    Err(e) => println!("Error initiating stream: {:?}", e),
  }`
      : ''
  }
}`;

  return { ts: TS_CODE.trim(), py: PY_CODE.trim(), rs: RS_CODE.trim() };
}
