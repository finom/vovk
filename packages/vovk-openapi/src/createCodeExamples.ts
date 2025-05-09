import type { KnownAny, VovkControllerSchema, VovkHandlerSchema } from 'vovk';
import type { SimpleJsonSchema } from './fromSchema';
import { sample } from '@stoplight/json-schema-sampler';
import type { PackageJson } from 'type-fest';

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
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // Add underscore between lowercase/digit and uppercase
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1_$2') // Add underscore between uppercase letters if the second one is followed by a lowercase
    .toLowerCase()
    .replace(/^_/, ''); // Remove leading underscore

export function createCodeExamples({
  handlerName,
  handlerSchema,
  controllerSchema,
  package: packageJson,
}: {
  handlerName: string;
  handlerSchema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  package?: PackageJson;
}) {
  const queryValidation = handlerSchema?.validation?.query as SimpleJsonSchema | undefined;
  const bodyValidation = handlerSchema?.validation?.body as SimpleJsonSchema | undefined;
  const paramsValidation = handlerSchema?.validation?.params as SimpleJsonSchema | undefined;
  const outputValidation = handlerSchema?.validation?.output as SimpleJsonSchema | undefined;
  const queryFake = queryValidation && sample(queryValidation);
  const bodyFake = bodyValidation && sample(bodyValidation);
  const paramsFake = paramsValidation && sample(paramsValidation);
  const outputFake = outputValidation && sample(outputValidation);
  const hasArg = !!queryFake || !!bodyFake || !!paramsFake;
  const rpcName = controllerSchema.rpcModuleName;
  const handlerNameSnake = toSnakeCase(handlerName);
  const rpcNameSnake = toSnakeCase(rpcName);
  const packageName = packageJson?.name || 'vovk-client';
  const packageNameSnake = toSnakeCase(packageName);
  const tsCodeSample = `import { ${rpcName} } from '${packageName}';

const response = await ${rpcName}.${handlerName}(${
    hasArg
      ? `{
${paramsFake ? `    params: ${stringifyTsSample(paramsFake)},\n` : ''}${bodyFake ? `    body: ${stringifyTsSample(bodyFake)},\n` : ''}${queryFake ? `    query: ${stringifyTsSample(queryFake)},\n` : ''}}`
      : ''
  });
    ${
      outputFake
        ? `
console.log(response);
/* 
${stringifyTsSample(outputFake, 0)}
*/
    `
        : ''
    }`;

  const pyCodeSample = `from ${packageNameSnake} import ${rpcName}

response = ${rpcName}.${handlerNameSnake}(${hasArg ? `\n    params=${paramsFake ? stringifyPySample(paramsFake) : 'None'},\n` : ''}${bodyFake ? `    body=${stringifyPySample(bodyFake)},\n` : ''}${queryFake ? `    query=${stringifyPySample(queryFake)},\n` : ''})

${
  outputFake
    ? `print(response)\n${JSON.stringify(outputFake, null, 2)
        .split('\n')
        .map((s) => `# ${s}`)
        .join('\n')}`
    : ''
}`;

  const serdeUnwrap = (fake: string) => `serde_json::from_value(serde_json::json!(${fake})).unwrap()`;

  const rsCodeSample = `use ${packageNameSnake}::${rpcNameSnake};

pub fn main() {
    let response = ${rpcNameSnake}::${handlerNameSnake}(
      /* body */ ${bodyFake ? serdeUnwrap(stringifyTsSample(bodyFake)) : '()'},
      /* query */ ${queryFake ? serdeUnwrap(stringifyTsSample(queryFake)) : '()'},
      /* params */ ${paramsFake ? serdeUnwrap(stringifyTsSample(paramsFake)) : '()'},
      /* headers */ None,
      /* api_root */ None,
      /* disable_client_validation */ false,
  );
}`;

  return { ts: tsCodeSample, py: pyCodeSample, rs: rsCodeSample };
}
