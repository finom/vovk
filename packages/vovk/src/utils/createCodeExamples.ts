import type { SimpleJsonSchema, KnownAny, VovkControllerSchema, VovkHandlerSchema } from '../types';
import { jsonSchemaSampler } from './jsonSchemaSampler';

const stringifyTsSample = (data: KnownAny, pad = 4) =>
  JSON.stringify(data, null, 2)
    .replace(/"([A-Za-z_$][0-9A-Za-z_$]*)":/g, '$1:')
    .split('\n')
    .map((line, i, a) => (i === 0 ? line : i === a.length - 1 ? ' '.repeat(pad) + line : ' '.repeat(pad + 2) + line))
    .join('\n');
const stringifyPySample = (data: KnownAny, pad = 4) =>
  JSON.stringify(data, null, 2)
    .split('\n')
    .map((line, i, a) => (i === 0 ? line : i === a.length - 1 ? ' '.repeat(pad) + line : ' '.repeat(pad + 2) + line))
    .join('\n');

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
  sampler = jsonSchemaSampler,
}: {
  handlerName: string;
  handlerSchema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  package?: CodeSamplePackageJson;
  sampler?: (schema: KnownAny) => KnownAny; // e. g. @stoplight/json-schema-sampler
}) {
  const queryValidation = handlerSchema?.validation?.query as SimpleJsonSchema | undefined;
  const bodyValidation = handlerSchema?.validation?.body as SimpleJsonSchema | undefined;
  const paramsValidation = handlerSchema?.validation?.params as SimpleJsonSchema | undefined;
  const outputValidation = handlerSchema?.validation?.output as SimpleJsonSchema | undefined;
  const iterationValidation = handlerSchema?.validation?.iteration as SimpleJsonSchema | undefined;
  const queryFake = queryValidation && sampler(queryValidation);
  const bodyFake = bodyValidation && sampler(bodyValidation);
  const paramsFake = paramsValidation && sampler(paramsValidation);
  const outputFake = outputValidation && sampler(outputValidation);
  const iterationFake = iterationValidation && sampler(iterationValidation);
  const hasArg = !!queryFake || !!bodyFake || !!paramsFake;
  const rpcName = controllerSchema.rpcModuleName;
  const handlerNameSnake = toSnakeCase(handlerName);
  const rpcNameSnake = toSnakeCase(rpcName);
  const packageName = packageJson?.name || 'vovk-client';
  const packageNameSnake = toSnakeCase(packageName);

  const tsArgs = hasArg
    ? `{
${paramsFake ? `    params: ${stringifyTsSample(paramsFake)},\n` : ''}${bodyFake ? `    body: ${stringifyTsSample(bodyFake)},\n` : ''}${queryFake ? `    query: ${stringifyTsSample(queryFake)},\n` : ''}}`
    : '';
  const TS_CODE = `import { ${rpcName} } from '${packageName}';

${iterationFake ? 'using' : 'const'} response = await ${rpcName}.${handlerName}(${tsArgs});
${
  outputFake
    ? `
console.log(response); 
/* 
${stringifyTsSample(outputFake, 0)}
*/`
    : ''
}${
    iterationFake
      ? `
for await (const item of response) {
    console.log(item); 
    /*
    ${stringifyTsSample(iterationFake, 4)}
    */
}`
      : ''
  }`;

  const PY_CODE = `from ${packageJson?.py_name ?? packageNameSnake} import ${rpcName}

response = ${rpcName}.${handlerNameSnake}(${hasArg ? `\n    params=${paramsFake ? stringifyPySample(paramsFake) : 'None'},\n` : ''}${bodyFake ? `    body=${stringifyPySample(bodyFake)},\n` : ''}${queryFake ? `    query=${stringifyPySample(queryFake)},\n` : ''})

${
  outputFake
    ? `print(response)\n${JSON.stringify(outputFake, null, 2)
        .split('\n')
        .map((s) => `# ${s}`)
        .join('\n')}`
    : ''
}${
    iterationFake
      ? `for i, item in enumerate(response):
    print(f"iteration #{i}:\\n {item}") 
    # iteration #0: 
${JSON.stringify(iterationFake, null, 2)
  .split('\n')
  .map((s) => `    # ${s}`)
  .join('\n')}`
      : ''
  }`;

  const serdeUnwrap = (fake: string) => `from_value(json!(${fake})).unwrap()`;

  const RS_CODE = `use ${packageJson?.rs_name ?? packageNameSnake}::${rpcNameSnake};
use serde_json::{ from_value, json };

pub fn main() {
  let response = ${rpcNameSnake}::${handlerNameSnake}(
    ${bodyFake ? serdeUnwrap(stringifyPySample(bodyFake)) : '()'}, /* body */ 
    ${queryFake ? serdeUnwrap(stringifyPySample(queryFake)) : '()'}, /* query */ 
    ${paramsFake ? serdeUnwrap(stringifyPySample(paramsFake)) : '()'}, /* params */ 
    None, /* headers (HashMap) */ 
    None, /* api_root */ 
    false, /* disable_client_validation */
  );

  ${
    outputFake
      ? `match response {
    Ok(output) => println!("{:?}", output),
    /* 
    output ${stringifyPySample(outputFake, 4)} 
    */
    Err(e) => println!("error: {:?}", e),
  }`
      : ''
  }${
    iterationFake
      ? `match response {
      Ok(stream) => {
        for (i, item) in stream.enumerate() {
          println!("#{}: {:?}", i, item);
          /*
          #0: iteration ${stringifyTsSample(iterationFake, 10)}
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
