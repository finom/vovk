import type {
  ComponentsObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import {
  HttpMethod,
  VovkOpenAPIMixinNormalized,
  VovkJSONSchemaBase,
  type VovkSchema,
  VovkSchemaIdEnum,
} from '../../types.js';
import { applyComponentsSchemas } from './applyComponentsSchemas.js';
import { inlineRefs } from './inlineRefs.js';

export function openAPIToVovkSchema({
  apiRoot,
  source: { object: openAPIObject },
  getModuleName,
  getMethodName,
  errorMessageKey,
  segmentName,
}: VovkOpenAPIMixinNormalized & { segmentName?: string }): VovkSchema {
  segmentName = segmentName ?? '';
  const forceApiRoot =
    apiRoot ||
    (openAPIObject.servers?.[0]?.url ??
      ('host' in openAPIObject
        ? `https://${openAPIObject.host}${'basePath' in openAPIObject ? openAPIObject.basePath : ''}`
        : null));

  if (!forceApiRoot) {
    throw new Error('API root URL is required in OpenAPI configuration');
  }

  const { paths, ...noPathsOpenAPIObject } = openAPIObject;
  const schema: VovkSchema = {
    $schema: VovkSchemaIdEnum.SCHEMA,
    segments: {
      [segmentName]: {
        $schema: VovkSchemaIdEnum.SEGMENT,
        emitSchema: true,
        segmentName,
        segmentType: 'mixin',
        controllers: {},
        forceApiRoot,
        meta: {
          openAPIObject: noPathsOpenAPIObject,
        },
      },
    },
  };
  const segment = schema.segments[segmentName];

  return Object.entries(paths ?? {}).reduce((acc, [path, operations]) => {
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
          rpcModuleName,
          handlers: {},
        };
        const parameters = inlineRefs<ParameterObject[]>(operation.parameters ?? [], openAPIObject);
        const queryProperties = parameters?.filter((p) => p.in === 'query') ?? null;
        const pathProperties = parameters?.filter((p) => p.in === 'path') ?? null;
        const query: VovkJSONSchemaBase | null = queryProperties?.length
          ? {
              type: 'object',
              properties: Object.fromEntries(queryProperties.map((p) => [p.name, p.schema as VovkJSONSchemaBase])),
              required: queryProperties.filter((p) => p.required).map((p) => p.name),
            }
          : null;
        const params: VovkJSONSchemaBase | null = pathProperties?.length
          ? {
              type: 'object',
              properties: Object.fromEntries(pathProperties.map((p) => [p.name, p.schema as VovkJSONSchemaBase])),
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
            'x-isForm': true,
            'x-tsType': 'FormData',
          });
        }
        if (urlEncodedBody) {
          Object.assign(urlEncodedBody, {
            'x-isForm': true,
            'x-tsType': 'FormData',
          });
        }
        const bodySchemas = [jsonBody, formDataBody, urlEncodedBody].filter(Boolean) as SchemaObject[];
        const body: VovkJSONSchemaBase | null = !bodySchemas.length
          ? null
          : bodySchemas.length === 1
            ? (bodySchemas[0] as VovkJSONSchemaBase)
            : ({
                anyOf: bodySchemas,
              } as VovkJSONSchemaBase);
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
          operationObject: operation,
          misc: {
            isOpenAPIMixin: true,
            originalPath: path,
          },
          validation: {
            ...(query && {
              query: applyComponentsSchemas(query, componentsSchemas, segmentName),
            }),
            ...(params && {
              params: applyComponentsSchemas(params, componentsSchemas, segmentName),
            }),
            ...(body && {
              body: applyComponentsSchemas(body, componentsSchemas, segmentName),
            }),
            ...(output && {
              output: applyComponentsSchemas(output, componentsSchemas, segmentName),
            }),
            ...(iteration && {
              iteration: applyComponentsSchemas(iteration, componentsSchemas, segmentName),
            }),
          },
        };
      });
    return acc;
  }, schema);
}
