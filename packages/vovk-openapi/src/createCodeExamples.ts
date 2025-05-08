import type { KnownAny, VovkControllerSchema, VovkHandlerSchema } from 'vovk';
import type { SimpleJsonSchema } from './fromSchema';
import { sample } from '@stoplight/json-schema-sampler';

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

export function createCodeExamples({
  handlerName,
  handlerSchema,
  controllerSchema,
}: {
  handlerName: string;
  handlerSchema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
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
  const handlerNameSnake = handlerName
    .replace(/[A-Z]/g, (letter, index) => (index === 0 ? letter.toLowerCase() : '_' + letter.toLowerCase()))
    .toLowerCase();
  const tsCodeSample = `import { ${rpcName} } from 'vovk-client';

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
    }
  `;

  const pyCodeSample = `from vovk_client import ${rpcName}

response = ${rpcName}.${handlerNameSnake}(${hasArg ? `\n    params=${paramsFake ? stringifyPySample(paramsFake) : 'None'},\n` : ''}${bodyFake ? `    body=${stringifyPySample(bodyFake)},\n` : ''}${queryFake ? `    query=${stringifyPySample(queryFake)},\n` : ''})

${
  outputFake
    ? `print(response)\n${JSON.stringify(outputFake, null, 2)
        .split('\n')
        .map((s) => `# ${s}`)
        .join('\n')}`
    : ''
}
`;

  const rsCodeSample = `// TODO: Coming soon';`;

  return { ts: tsCodeSample, py: pyCodeSample, rs: rsCodeSample };
}
