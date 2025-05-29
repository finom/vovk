import type {
  ComponentsObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
} from 'openapi3-ts/oas31';
import { HttpMethod, KnownAny, SimpleJsonSchema, type VovkSchema, VovkSchemaIdEnum } from '../types';
import { generateFnName } from './generateFnName';

function applyComponents(schema: SimpleJsonSchema, components: ComponentsObject['schemas']): SimpleJsonSchema {
  if (!components || !Object.keys(components).length) return schema;

  // Create a deep copy of the schema
  const result = JSON.parse(JSON.stringify(schema));

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
        result.$defs[componentName] = processSchema(JSON.parse(JSON.stringify(components![componentName])));
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

const defaultGetHandlerInfo = ({
  method,
  path,
  operation,
  defaultModuleName,
}: {
  method: HttpMethod;
  path: string;
  operation: OperationObject;
  openAPIObject: OpenAPIObject;
  defaultModuleName: string;
}): [string, string] => {
  const operationId = operation.operationId?.replace(/[^a-zA-Z0-9_]/g, '_') ?? null;
  const match = operationId?.match(/^([A-Z][a-zA-Z0-9]*)_([a-zA-Z0-9_]+)/);
  const [handlerName, controllerName] = match?.slice(1, 3) ?? [
    operationId?.match(/^[a-zA-Z][a-zA-Z0-9_]+$/) ? operationId : generateFnName(method, path),
    defaultModuleName,
  ];

  const rpcModuleName = controllerName.endsWith('Controller')
    ? controllerName.replace(/Controller$/, 'RPC')
    : controllerName;
  return [rpcModuleName, handlerName];
};

export function openAPIToSchema({
  openAPIObject,
  getHandlerInfo = defaultGetHandlerInfo,
  defaultModuleName = 'api',
}: {
  openAPIObject: OpenAPIObject;
  getHandlerInfo?: typeof defaultGetHandlerInfo;
  defaultModuleName?: string;
}): VovkSchema {
  const schema: VovkSchema = {
    $schema: VovkSchemaIdEnum.SCHEMA,
    segments: {
      '': {
        $schema: VovkSchemaIdEnum.SEGMENT,
        emitSchema: true,
        segmentName: '',
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
  const segment = schema.segments[''];
  return Object.entries(openAPIObject.paths ?? {}).reduce((acc, [path, operations]) => {
    Object.entries(operations).forEach(([method, operation]: [string, OperationObject]) => {
      const [rpcModuleName, handlerName] = getHandlerInfo({
        method: method.toUpperCase() as HttpMethod,
        path,
        operation,
        openAPIObject,
        defaultModuleName,
      });
      segment.controllers[rpcModuleName] ??= {
        rpcModuleName,
        handlers: {},
      };
      // TODO how to utilize ReferenceObject?
      const queryProperties = (operation.parameters as ParameterObject[])?.filter((p) => p.in === 'query') || [];
      const pathProperties = (operation.parameters as ParameterObject[])?.filter((p) => p.in === 'path') || [];
      const query = Array.isArray(operation.parameters)
        ? {
            type: 'object',
            properties: Object.fromEntries(queryProperties.map((p) => [p.name, p.schema])),
            required: queryProperties.filter((p) => p.required).map((p) => p.name),
          }
        : null;
      const params = Array.isArray(pathProperties)
        ? {
            type: 'object',
            properties: Object.fromEntries(pathProperties.map((p) => [p.name, p.schema])),
            required: pathProperties.filter((p) => p.required).map((p) => p.name),
          }
        : null;

      // TODO how to utilize ReferenceObject?
      const body = (operation.requestBody as RequestBodyObject)?.content['application/json']?.schema ?? null;
      const output = operation.responses?.['200']?.content['application/json']?.schema ?? null;
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
