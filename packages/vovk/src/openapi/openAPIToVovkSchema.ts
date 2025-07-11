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
  KnownAny,
  SimpleJsonSchema,
  VovkConfig,
  type VovkSchema,
  VovkSchemaIdEnum,
  VovkStrictConfig,
} from '../types';
import { generateFnName } from './generateFnName';
import { camelCase } from '../utils/camelCase';
import { upperFirst } from '../utils/upperFirst';

// fast clone JSON object while ignoring Date, RegExp, and Function types
function cloneJSON(obj: KnownAny): KnownAny {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cloneJSON);
  const result: Record<string, KnownAny> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date || value instanceof RegExp || typeof value === 'function') continue;
    result[key] = cloneJSON(value);
  }
  return result;
}

function applyComponents(
  schema: SimpleJsonSchema,
  components: ComponentsObject['schemas'],
  mixinName: string
): SimpleJsonSchema {
  const key = 'components/schemas';
  if (!components || !Object.keys(components).length) return schema;

  // Create a deep copy of the schema
  const result = cloneJSON(schema);

  // Initialize $defs if it doesn't exist
  result.$defs = result.$defs || {};

  // Set to track components we've added to $defs
  const addedComponents = new Set<string>();

  // Process a schema object and replace $refs
  function processSchema(obj: KnownAny): KnownAny {
    if (!obj || typeof obj !== 'object') return obj;

    // Create a new object/array to avoid modifying the input
    const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
    const $ref = newObj.$ref;

    if ($ref && typeof $ref === 'string' && $ref.startsWith(`#/${key}/`)) {
      const componentName = $ref.replace(`#/${key}/`, '');
      if (components![componentName]) {
        newObj.$ref = `#/$defs/${componentName}`;
        newObj['x-tsType'] ??= `Mixins.${upperFirst(camelCase(mixinName))}.${upperFirst(camelCase(componentName))}`;
      } else {
        delete newObj.$ref; // Remove $ref if component not found (Telegram API has Type $refs that is not defined in components)
      }

      // Add the component to $defs if not already added
      if (!addedComponents.has(componentName) && components![componentName]) {
        addedComponents.add(componentName);
        // TODO: Optimize
        result.$defs[componentName] = processSchema(cloneJSON(components![componentName]));
      }
    }

    // Process properties/items recursively
    if (Array.isArray(newObj)) {
      for (let i = 0; i < newObj.length; i++) {
        newObj[i] = processSchema(newObj[i]);
      }
    } else {
      for (const key in newObj) {
        if (Object.prototype.hasOwnProperty.call(newObj, key)) {
          newObj[key] = processSchema(newObj[key]);
        }
      }
    }

    return newObj;
  }

  // Process the main schema
  return processSchema(result);
}

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
        // TODO: how to utilize ReferenceObject?
        const queryProperties = (operation.parameters as ParameterObject[])?.filter((p) => p.in === 'query') ?? null;
        const pathProperties = (operation.parameters as ParameterObject[])?.filter((p) => p.in === 'path') ?? null;
        const query = queryProperties?.length
          ? {
              type: 'object',
              properties: Object.fromEntries(queryProperties.map((p) => [p.name, p.schema])),
              required: queryProperties.filter((p) => p.required).map((p) => p.name),
            }
          : null;
        const params = pathProperties?.length
          ? {
              type: 'object',
              properties: Object.fromEntries(pathProperties.map((p) => [p.name, p.schema])),
              required: pathProperties.filter((p) => p.required).map((p) => p.name),
            }
          : null;

        // TODO: how to utilize ReferenceObject?
        const requestBodyContent = (operation.requestBody as RequestBodyObject)?.content ?? {};
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
        const body = !bodySchemas.length
          ? null
          : bodySchemas.length === 1
            ? bodySchemas[0]
            : {
                anyOf: bodySchemas,
              };
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

        const components =
          openAPIObject.components?.schemas ??
          ('definitions' in openAPIObject ? (openAPIObject.definitions as ComponentsObject['schemas']) : {});

        segment.controllers[rpcModuleName].handlers[handlerName] = {
          httpMethod: method.toUpperCase(),
          path,
          openapi: operation,
          validation: {
            ...(query && {
              query: applyComponents(query as SimpleJsonSchema, components, mixinName),
            }),
            ...(params && {
              params: applyComponents(params as SimpleJsonSchema, components, mixinName),
            }),
            ...(body && {
              body: applyComponents(body as SimpleJsonSchema, components, mixinName),
            }),
            ...(output && {
              output: applyComponents(output as SimpleJsonSchema, components, mixinName),
            }),
            ...(iteration && {
              iteration: applyComponents(iteration as SimpleJsonSchema, components, mixinName),
            }),
          },
        };
      });
    return acc;
  }, schema);
}
