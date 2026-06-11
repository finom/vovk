import type {
  ComponentsObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { applyComponentsSchemas } from './apply-components-schemas.js';
import { inlineRefs } from './inline-refs.js';
import { pruneComponentsSchemas } from './prune-components-schemas.js';
import { type HttpMethod, VovkSchemaIdEnum } from '../../types/enums.js';
import type { VovkSchema } from '../../types/core.js';
import type { VovkJSONSchemaBase } from '../../types/json-schema.js';
import type { VovkOpenAPIMixinNormalized } from '../../types/config.js';
import type { ContentType } from '../../types/validation.js';
import { schemaToTsType } from '../../samples/schema-to-ts-type.js';

function getTsTypeString(contentType: ContentType[], schema: VovkJSONSchemaBase): string {
  const tsTypes = new Set(
    contentType.flatMap((ct) => {
      switch (ct) {
        case 'application/json':
          return [schemaToTsType(schema)];
        case 'multipart/form-data':
          return ['FormData', schemaToTsType(schema)];
        case 'application/x-www-form-urlencoded':
          return ['FormData', 'URLSearchParams', schemaToTsType(schema)];
        case 'text/plain':
          return ['string'];
        default:
          return ['Blob', 'ArrayBuffer', 'Uint8Array'];
      }
    })
  );
  return [...tsTypes].join(' | ') || schemaToTsType(schema);
}

export function openAPIToVovkSchema({
  apiRoot,
  source: { object: openAPIObject },
  getModuleName,
  getMethodName,
  filterOperations,
  pruneComponents,
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

  Object.entries(paths ?? {}).forEach(([path, operations]) => {
    Object.entries(operations ?? {})
      .filter(([, operation]) => operation && typeof operation === 'object')
      .forEach(([method, operation]: [string, OperationObject]) => {
        if (
          filterOperations &&
          !filterOperations({
            method: method.toUpperCase() as HttpMethod,
            path,
            openAPIObject,
            operationObject: operation,
          })
        ) {
          return;
        }

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

        const requestBodyContent = inlineRefs<RequestBodyObject>(operation.requestBody, openAPIObject)?.content ?? {};
        const contentTypes: ContentType[] = [
          'application/json',
          'multipart/form-data',
          'application/x-www-form-urlencoded',
          'text/plain',
          'application/octet-stream',
        ];

        const bodySchemas = contentTypes
          .map((contentType) =>
            requestBodyContent[contentType]?.schema
              ? { ...requestBodyContent[contentType].schema, 'x-contentType': [contentType] }
              : null
          )
          .filter(Boolean) as SchemaObject[];
        const body: VovkJSONSchemaBase | null = !bodySchemas.length
          ? null
          : bodySchemas.length === 1
            ? ({
                ...bodySchemas[0],
                'x-tsType': getTsTypeString(bodySchemas[0]['x-contentType'] ?? [], bodySchemas[0]),
              } as VovkJSONSchemaBase)
            : {
                anyOf: bodySchemas,
                'x-tsType': getTsTypeString(
                  bodySchemas.flatMap((s) => s['x-contentType'] ?? []),
                  { anyOf: bodySchemas } as VovkJSONSchemaBase
                ),
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
              // Response slot: not validated + typed via x-tsType → skip $defs (dedup).
              output: applyComponentsSchemas(output, componentsSchemas, segmentName, false),
            }),
            ...(iteration && {
              iteration: applyComponentsSchemas(iteration, componentsSchemas, segmentName, false),
            }),
          },
        };
      });
  });

  if (pruneComponents && noPathsOpenAPIObject.components?.schemas) {
    // Reassign with fresh objects only — `noPathsOpenAPIObject` shares references with the
    // caller's spec, so the original `components.schemas` must stay untouched. Walking the
    // whole controllers tree (validation slots + raw operation objects) keeps every `$ref`
    // a kept handler carries resolvable against the pruned meta.
    segment.meta = {
      openAPIObject: {
        ...noPathsOpenAPIObject,
        components: {
          ...noPathsOpenAPIObject.components,
          schemas: pruneComponentsSchemas(segment.controllers, noPathsOpenAPIObject.components.schemas),
        },
      },
    };
  }

  return schema;
}
