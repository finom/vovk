import type {
  ComponentsObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import {
  GetOpenAPINameFn,
  HttpMethod,
  SimpleJSONSchema,
  VovkConfig,
  type VovkSchema,
  VovkSchemaIdEnum,
  VovkStrictConfig,
} from '../../types';
import { generateFnName } from '../generateFnName';
import { camelCase } from '../../utils/camelCase';
import { applyComponentsSchemas } from './applyComponentsSchemas';
import { inlineRefs } from './inlineRefs';

const getNamesNestJS = (operationObject: OperationObject): [string, string] => {
  const operationId = operationObject.operationId;
  if (!operationId) {
    throw new Error('Operation ID is required for NestJS module name generation');
  }

  const controllerHandlerMatch = operationId?.match(/^([A-Z][a-zA-Z0-9]*)_([a-zA-Z0-9_]+)/);

  if (!controllerHandlerMatch) {
    throw new Error(`Invalid operationId format for NestJS: ${operationId}`);
  }
  const [controllerName, handlerName] = controllerHandlerMatch.slice(1, 3) as [string, string];
  return [controllerName.replace(/Controller$/, 'RPC'), handlerName];
};

const normalizeGetModuleName = (getModuleName: NonNullable<VovkConfig['openApiMixins']>[string]['getModuleName']) => {
  if (getModuleName === 'nestjs-operation-id') {
    getModuleName = ({ operationObject }: { operationObject: OperationObject }) => getNamesNestJS(operationObject)[0];
  } else if (typeof getModuleName === 'string') {
    const moduleName = getModuleName;
    getModuleName = () => moduleName;
  } else if (typeof getModuleName !== 'function') {
    throw new Error('getModuleName must be a function or one of the predefined strings');
  }

  return getModuleName;
};

const normalizeGetMethodName = (getMethodName: NonNullable<VovkConfig['openApiMixins']>[string]['getMethodName']) => {
  if (getMethodName === 'nestjs-operation-id') {
    getMethodName = ({ operationObject }: { operationObject: OperationObject }) => getNamesNestJS(operationObject)[1];
  } else if (getMethodName === 'camel-case-operation-id') {
    getMethodName = ({ operationObject }: Parameters<GetOpenAPINameFn>[0]) => {
      const operationId = operationObject.operationId;
      if (!operationId) {
        throw new Error('Operation ID is required for camel-case method name generation');
      }
      return camelCase(operationId);
    };
  } else if (getMethodName === 'auto') {
    getMethodName = ({ operationObject, method, path }: Parameters<GetOpenAPINameFn>[0]) => {
      const operationId = operationObject.operationId;
      const isCamelCase = operationId && /^[a-z][a-zA-Z0-9]*$/.test(operationId);
      const isSnakeCase = operationId && /^[a-z][a-z0-9_]+$/.test(operationId);

      return isCamelCase ? operationId : isSnakeCase ? camelCase(operationId) : generateFnName(method, path);
    };
  } else if (typeof getMethodName !== 'function') {
    throw new Error('getMethodName must be a function or one of the predefined strings');
  }

  return getMethodName;
};

export function openAPIToVovkSchema({
  apiRoot,
  source: { object: openAPIObject },
  getModuleName = 'api',
  getMethodName = 'auto',
  errorMessageKey,
  package: packageJson,
  mixinName,
}: VovkStrictConfig['openApiMixins'][string] & { mixinName: string }): VovkSchema {
  const forceApiRoot =
    apiRoot ??
    openAPIObject.servers?.[0]?.url ??
    ('host' in openAPIObject
      ? `https://${openAPIObject.host}${'basePath' in openAPIObject ? openAPIObject.basePath : ''}`
      : null);

  if (!forceApiRoot) {
    throw new Error('API root URL is required in OpenAPI configuration');
  }
  const schema: VovkSchema = {
    $schema: VovkSchemaIdEnum.SCHEMA,
    segments: {
      [mixinName]: {
        $schema: VovkSchemaIdEnum.SEGMENT,
        emitSchema: true,
        segmentName: mixinName,
        segmentType: 'mixin',
        controllers: {},
        meta: {
          components: openAPIObject.components,
          package: packageJson,
        },
      },
    },
  };
  const segment = schema.segments[mixinName];
  getModuleName = normalizeGetModuleName(getModuleName);
  getMethodName = normalizeGetMethodName(getMethodName);
  return Object.entries(openAPIObject.paths ?? {}).reduce((acc, [path, operations]) => {
    Object.entries(operations ?? {})
      .filter(([, operation]) => operation && typeof operation === 'object')
      .forEach(([method, operation]: [string, OperationObject]) => {
        const rpcModuleName = getModuleName({
          method: method.toUpperCase() as HttpMethod,
          path,
          openAPIObject,
          operationObject: operation,
        });

        const handlerName = getMethodName({
          method: method.toUpperCase() as HttpMethod,
          path,
          openAPIObject,
          operationObject: operation,
        });
        segment.controllers[rpcModuleName] ??= {
          forceApiRoot,
          rpcModuleName,
          handlers: {},
        };
        const parameters = inlineRefs<ParameterObject[]>(operation.parameters ?? [], openAPIObject);
        const queryProperties = parameters.filter((p) => p.in === 'query') ?? null;
        const pathProperties = parameters.filter((p) => p.in === 'path') ?? null;
        const query: SimpleJSONSchema | null = queryProperties?.length
          ? {
              type: 'object',
              properties: Object.fromEntries(queryProperties.map((p) => [p.name, p.schema as SimpleJSONSchema])),
              required: queryProperties.filter((p) => p.required).map((p) => p.name),
            }
          : null;
        const params: SimpleJSONSchema | null = pathProperties?.length
          ? {
              type: 'object',
              properties: Object.fromEntries(pathProperties.map((p) => [p.name, p.schema as SimpleJSONSchema])),
              required: pathProperties.filter((p) => p.required).map((p) => p.name),
            }
          : null;

        // TODO: how to utilize ReferenceObject?
        const requestBodyContent = inlineRefs<RequestBodyObject>(operation.requestBody, openAPIObject)?.content ?? {};
        const jsonBody = requestBodyContent['application/json']?.schema ?? null;
        const formDataBody = requestBodyContent['multipart/form-data']?.schema ?? null;
        let urlEncodedBody = requestBodyContent['application/x-www-form-urlencoded']?.schema ?? null;
        if (formDataBody && urlEncodedBody && JSON.stringify(formDataBody) === JSON.stringify(urlEncodedBody)) {
          urlEncodedBody = null; // Avoid duplication if both form-data and url-encoded bodies are the same
        }
        if (formDataBody) {
          Object.assign(formDataBody, {
            'x-formData': true,
            'x-tsType': 'FormData',
          });
        }
        if (urlEncodedBody) {
          Object.assign(urlEncodedBody, {
            'x-formData': true,
            'x-tsType': 'FormData',
          });
        }
        const bodySchemas = [jsonBody, formDataBody, urlEncodedBody].filter(Boolean) as SchemaObject[];
        const body: SimpleJSONSchema | null = !bodySchemas.length
          ? null
          : bodySchemas.length === 1
            ? (bodySchemas[0] as SimpleJSONSchema)
            : ({
                anyOf: bodySchemas,
              } as SimpleJSONSchema);
        const output =
          operation.responses?.['200']?.content?.['application/json']?.schema ??
          operation.responses?.['201']?.content?.['application/json']?.schema ??
          null;
        const iteration =
          operation.responses?.['200']?.content?.['application/jsonl']?.schema ??
          operation.responses?.['201']?.content?.['application/jsonl']?.schema ??
          operation.responses?.['200']?.content?.['application/jsonlines']?.schema ??
          operation.responses?.['201']?.content?.['application/jsonlines']?.schema ??
          null;

        if (errorMessageKey) {
          operation['x-errorMessageKey'] = errorMessageKey;
        }

        const componentsSchemas =
          openAPIObject.components?.schemas ??
          ('definitions' in openAPIObject ? (openAPIObject.definitions as ComponentsObject['schemas']) : {});

        segment.controllers[rpcModuleName].handlers[handlerName] = {
          httpMethod: method.toUpperCase(),
          path,
          openapi: operation,
          validation: {
            ...(query && {
              query: applyComponentsSchemas(query, componentsSchemas, mixinName),
            }),
            ...(params && {
              params: applyComponentsSchemas(params, componentsSchemas, mixinName),
            }),
            ...(body && {
              body: applyComponentsSchemas(body, componentsSchemas, mixinName),
            }),
            ...(output && {
              output: applyComponentsSchemas(output, componentsSchemas, mixinName),
            }),
            ...(iteration && {
              iteration: applyComponentsSchemas(iteration, componentsSchemas, mixinName),
            }),
          },
        };
      });
    return acc;
  }, schema);
}
