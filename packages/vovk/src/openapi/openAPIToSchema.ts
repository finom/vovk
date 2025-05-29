import type { OpenAPIObject, OperationObject, ParameterObject, RequestBodyObject } from 'openapi3-ts/oas31';
import { HttpMethod, type VovkSchema, VovkSchemaIdEnum } from '../types';
import { generateFnName } from './generateFnName';

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
          ...(query && { query }),
          ...(params && { params }),
          ...(body && { body }),
          ...(output && { output }),
        },
      };
    });
    return acc;
  }, schema);
}
