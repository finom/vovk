import type { OpenAPIObject, PathsObject } from 'openapi3-ts/oas31';
import { HttpStatus } from 'vovk';
import type { HttpMethod, KnownAny, VovkFullSchema } from 'vovk';
import { sample } from '@stoplight/json-schema-sampler';

type SimpleJsonSchema = {
  type: 'object';
  description?: string;
  properties: Record<string, KnownAny>;
  required?: string[];
};

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
export function fromSchema(
  apiRoot: string,
  fullSchema: VovkFullSchema,
  extendWith?: Partial<OpenAPIObject>
): OpenAPIObject {
  const paths: PathsObject = {};

  for (const [segmentName, segmentSchema] of Object.entries(fullSchema.segments)) {
    for (const [rpcName, c] of Object.entries(segmentSchema.controllers)) {
      for (const [handlerName, h] of Object.entries(c.handlers)) {
        if (h.openapi) {
          const queryValidation = h?.validation?.query as SimpleJsonSchema | undefined;
          const bodyValidation = h?.validation?.body as SimpleJsonSchema | undefined;
          const paramsValidation = h?.validation?.params as SimpleJsonSchema | undefined;
          const outputValidation = h?.validation?.output as SimpleJsonSchema | undefined;
          const queryFake = queryValidation && sample(queryValidation);
          const bodyFake = bodyValidation && sample(bodyValidation);
          const paramsFake = paramsValidation && sample(paramsValidation);
          const outputFake = outputValidation && sample(outputValidation);
          const hasArg = !!queryFake || !!bodyFake || !!paramsFake;
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
          const handlerNameSnake = handlerName
          .replace(/[A-Z]/g, (letter, index) => index === 0 ? letter.toLowerCase() : '_' + letter.toLowerCase())
          .toLowerCase();
          const pyCodeSample = `from vovk_client import ${rpcName}

response = ${rpcName}.${handlerNameSnake}(${hasArg ? `\n    params=${paramsFake ? stringifyPySample(paramsFake) : 'None'},\n` : ''}${bodyFake ? `    body=${stringifyPySample(bodyFake)},\n` : ''}${queryFake ? `    query=${stringifyPySample(queryFake)},\n` : ''})

${outputFake ? `print(response)\n${JSON.stringify(outputFake, null, 2).split('\n').map(s => `# ${s}`).join('\n')}` : ''}
`;

          const path =
            '/' +
            [apiRoot.replace(/^\/+|\/+$/g, ''), segmentName, c.prefix, h.path]
              .filter(Boolean)
              .join('/')
              .replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
          paths[path] = paths[path] ?? {};
          paths[path][h.httpMethod.toLowerCase() as Lowercase<HttpMethod>] = {
            ...h.openapi,
            'x-codeSamples': [
              ...(h.openapi['x-codeSamples'] ?? []),
              {
                label: 'Typescript client',
                lang: 'typescript',
                source: tsCodeSample,
              },
              {
                label: 'Python client',
                lang: 'python',
                source: pyCodeSample,
              },
            ],
          };
        }
      }
    }
  }

  return {
    ...extendWith,
    openapi: '3.1.0',
    info: extendWith?.info ?? {
      title: 'API',
      version: '1.0.0',
    },
    components: {
      ...extendWith?.components,
      schemas: {
        HttpStatus: {
          type: 'integer',
          description: 'HTTP status code',
          enum: Object.keys(HttpStatus)
            .map((k) => HttpStatus[k as unknown as HttpStatus])
            .filter(Boolean)
            .filter((v) => typeof v === 'number'),
        },
        VovkErrorResponse: {
          type: 'object',
          description: 'Vovk error response',
          properties: {
            cause: {
              description: 'Error cause of any shape',
            },
            statusCode: {
              $ref: '#/components/schemas/HttpStatus',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            isError: {
              type: 'boolean',
              const: true,
              description: 'Indicates that this object represents an error',
            },
          },
          required: ['statusCode', 'message', 'isError'],
          additionalProperties: false,
        },
        ...extendWith?.components?.schemas,
      },
    },
    paths,
  };
}
