import type { ComponentsObject, OperationObject, ParameterObject, RequestBodyObject } from 'openapi3-ts/oas31';
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

const EXTENSIONS_SEGMENT_NAME = 'extensions';

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

function applyComponents(schema: SimpleJsonSchema, components: ComponentsObject['schemas']): SimpleJsonSchema {
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

    // Check for $ref
    if (newObj.$ref && typeof newObj.$ref === 'string' && newObj.$ref.startsWith('#/components/schemas/')) {
      const componentName = newObj.$ref.replace('#/components/schemas/', '');
      newObj.$ref = `#/$defs/${componentName}`;

      // Add the component to $defs if not already added
      if (!addedComponents.has(componentName) && components![componentName]) {
        addedComponents.add(componentName);
        // TODO: IMPORTANT! Deep copy to avoid mutation issues
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

const normalizeGetModuleName = (
  getModuleName: Exclude<VovkConfig['extendClientWithOpenAPI'], undefined>['extensionModules'][number]['getModuleName']
) => {
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

const normalizeGetMethodName = (
  getMethodName: Exclude<VovkConfig['extendClientWithOpenAPI'], undefined>['extensionModules'][number]['getMethodName']
) => {
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
      const isSnakeCase = operationId && /^[a-z][a-z0-9_]+$/.test(operationId);

      return isSnakeCase ? camelCase(operationId) : generateFnName(method, path);
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
}: VovkStrictConfig['extendClientWithOpenAPI']['extensionModules'][number]): VovkSchema {
  const forceApiRoot = apiRoot ?? openAPIObject.servers?.[0]?.url;

  if (!forceApiRoot) {
    throw new Error('API root URL is required in OpenAPI configuration');
  }
  const schema: VovkSchema = {
    $schema: VovkSchemaIdEnum.SCHEMA,
    segments: {
      [EXTENSIONS_SEGMENT_NAME]: {
        $schema: VovkSchemaIdEnum.SEGMENT,
        emitSchema: true,
        segmentName: EXTENSIONS_SEGMENT_NAME,
        controllers: {},
      },
    },
    meta: {
      $schema: VovkSchemaIdEnum.META,
      config: {
        $schema: VovkSchemaIdEnum.CONFIG,
      },
      openapi: openAPIObject,
    },
  };
  const segment = schema.segments[EXTENSIONS_SEGMENT_NAME];
  getModuleName = normalizeGetModuleName(getModuleName);
  getMethodName = normalizeGetMethodName(getMethodName);
  return Object.entries(openAPIObject.paths ?? {}).reduce((acc, [path, operations]) => {
    Object.entries(operations ?? {}).forEach(([method, operation]: [string, OperationObject]) => {
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
      const body = (operation.requestBody as RequestBodyObject)?.content['application/json']?.schema ?? null;
      const output =
        operation.responses?.['200']?.content?.['application/json']?.schema ??
        operation.responses?.['201']?.content?.['application/json']?.schema ??
        null;
      // TODO: "iteration" validation
      // TODO: FormData
      segment.controllers[rpcModuleName].handlers[handlerName] = {
        httpMethod: method.toUpperCase(),
        path,
        openapi: operation,
        validation: {
          ...(query && { query: applyComponents(query as SimpleJsonSchema, openAPIObject.components?.schemas) }),
          ...(params && { params: applyComponents(params as SimpleJsonSchema, openAPIObject.components?.schemas) }),
          ...(body && { body: applyComponents(body as SimpleJsonSchema, openAPIObject.components?.schemas) }),
          ...(output && { output: applyComponents(output as SimpleJsonSchema, openAPIObject.components?.schemas) }),
        },
      };
    });
    return acc;
  }, schema);
}
