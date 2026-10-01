import type {
  ComponentsObject,
  ContentObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  RequestBodyObject,
  ServerObject,
} from 'openapi3-ts/oas31';
import { schemaToTsType } from '../../samples/schema-to-ts-type.js';
import type { VovkOpenAPIMixinNormalized } from '../../types/config.js';
import type { VovkSchema } from '../../types/core.js';
import { type HttpMethod, VovkSchemaIdEnum } from '../../types/enums.js';
import type { VovkJSONSchemaBase } from '../../types/json-schema.js';
import type { ContentType } from '../../types/validation.js';
import { applyComponentsSchemas } from './apply-components-schemas.js';
import { inlineRefs } from './inline-refs.js';
import { pruneComponentsSchemas } from './prune-components-schemas.js';

// the Path Item fields that hold an operation; fetch refuses TRACE, so it has no client method
const OPERATION_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch']);

const BODY_CONTENT_TYPES: ContentType[] = [
  'application/json',
  'multipart/form-data',
  'application/x-www-form-urlencoded',
  'text/plain',
  'application/octet-stream',
];

const mediaTypeEssence = (mediaType: string) => mediaType.split(';')[0].trim().toLowerCase();

// success body: 200/201, then other 2xx, then the 2XX wildcard
// exact media type first, then +json suffix; `default` is the error shape, skip it
function makeResponseSchemaPicker(operation: OperationObject) {
  const responses = operation.responses ?? {};
  const codes = Object.keys(responses);
  const successCodes = [
    ...['200', '201'].filter((code) => code in responses),
    ...codes.filter((code) => /^2\d\d$/.test(code) && code !== '200' && code !== '201'),
    ...codes.filter((code) => /^2xx$/i.test(code)),
  ];

  return (exact: string[], suffix?: string): VovkJSONSchemaBase | null => {
    for (const code of successCodes) {
      // ResponsesObject indexes to `any`, annotate to get typed media objects
      const content: ContentObject | undefined = responses[code]?.content;
      if (!content) continue;
      for (const [mediaType, media] of Object.entries(content)) {
        if (exact.includes(mediaTypeEssence(mediaType)) && media?.schema) return media.schema as VovkJSONSchemaBase;
      }
      if (suffix) {
        for (const [mediaType, media] of Object.entries(content)) {
          if (mediaTypeEssence(mediaType).endsWith(suffix) && media?.schema) return media.schema as VovkJSONSchemaBase;
        }
      }
    }
    return null;
  };
}

// one schema per body content type; media type parameters are ignored and a `+json` media type is sent as JSON
function pickBodySchemas(content: ContentObject): VovkJSONSchemaBase[] {
  const media = Object.entries(content).flatMap(([mediaType, mediaTypeObject]) =>
    mediaTypeObject?.schema ? [{ essence: mediaTypeEssence(mediaType), schema: mediaTypeObject.schema }] : []
  );
  return BODY_CONTENT_TYPES.flatMap((contentType) => {
    const match =
      media.find(({ essence }) => essence === contentType) ??
      (contentType === 'application/json' ? media.find(({ essence }) => essence.endsWith('+json')) : undefined);
    return match ? [{ ...(match.schema as VovkJSONSchemaBase), 'x-contentType': [contentType] }] : [];
  });
}

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

// a JSON body is typed from its schema like any other slot; a form, text or binary body also accepts the JS types the client sends
function withBodyTsType(body: VovkJSONSchemaBase, contentTypes: ContentType[]): VovkJSONSchemaBase {
  if (contentTypes.every((contentType) => contentType === 'application/json')) return body;
  return { ...body, 'x-tsType': getTsTypeString(contentTypes, body) };
}

// a server URL may hold `{name}` variables, each declares a default
function resolveServerURL(server: ServerObject | undefined): string | undefined {
  return server?.url?.replace(/\{([^}]+)\}/g, (variable, name: string) => {
    const value = server.variables?.[name]?.default;
    return value === undefined ? variable : String(value);
  });
}

// a spec is third party input, its x-tsType would land in the generated client as raw TS
function stripXTsType<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripXTsType) as T;
  if (!value || typeof value !== 'object') return value;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    if (key === 'x-tsType') continue;
    result[key] = stripXTsType(val);
  }
  return result as T;
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
  // x-tsType is emitted verbatim into the generated client, only ours may reach it
  openAPIObject = stripXTsType(openAPIObject);
  const forceApiRoot =
    apiRoot ||
    (resolveServerURL(openAPIObject.servers?.[0]) ??
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
  const componentsSchemas =
    openAPIObject.components?.schemas ??
    ('definitions' in openAPIObject ? (openAPIObject.definitions as ComponentsObject['schemas']) : {});

  for (const [path, pathItemOrRef] of Object.entries(paths ?? {})) {
    const pathItem = inlineRefs<PathItemObject>(pathItemOrRef, openAPIObject) ?? {};
    const pathParameters = inlineRefs<ParameterObject[]>(pathItem.parameters ?? [], openAPIObject) ?? [];

    for (const [methodKey, operation] of Object.entries(pathItem) as [string, OperationObject][]) {
      if (!OPERATION_METHODS.has(methodKey.toLowerCase()) || !operation || typeof operation !== 'object') continue;
      const method = methodKey.toUpperCase() as HttpMethod;
      const nameInput = { method, path, openAPIObject, operationObject: operation };

      if (filterOperations && !filterOperations(nameInput)) continue;

      const rpcModuleName = getModuleName(nameInput);
      const methodName = getMethodName(nameInput);
      segment.controllers[rpcModuleName] ??= {
        rpcModuleName,
        handlers: {},
      };
      const { handlers } = segment.controllers[rpcModuleName];
      // two operations with one name would overwrite each other, the later one gets a numbered name
      let handlerName = methodName;
      for (let i = 2; Object.hasOwn(handlers, handlerName); i++) handlerName = `${methodName}_${i}`;
      if (handlerName !== methodName) {
        const taken = handlers[methodName];
        console.warn(
          `🐺 ${rpcModuleName}.${methodName} already calls ${taken.httpMethod} ${taken.path}, so ${method} ${path} is named ${handlerName}`
        );
      }

      const operationParameters = inlineRefs<ParameterObject[]>(operation.parameters ?? [], openAPIObject) ?? [];
      const isRedefined = (p: ParameterObject) => operationParameters.some((o) => o.name === p.name && o.in === p.in);
      // a path-level parameter applies to every operation of the path unless the operation redefines it
      const parameters = [...pathParameters.filter((p) => !isRedefined(p)), ...operationParameters];
      const queryProperties = parameters.filter((p) => p.in === 'query');
      const pathProperties = parameters.filter((p) => p.in === 'path');
      const query: VovkJSONSchemaBase | null = queryProperties.length
        ? {
            type: 'object',
            properties: Object.fromEntries(queryProperties.map((p) => [p.name, p.schema as VovkJSONSchemaBase])),
            required: queryProperties.filter((p) => p.required).map((p) => p.name),
          }
        : null;
      const params: VovkJSONSchemaBase | null = pathProperties.length
        ? {
            type: 'object',
            properties: Object.fromEntries(pathProperties.map((p) => [p.name, p.schema as VovkJSONSchemaBase])),
            required: pathProperties.filter((p) => p.required).map((p) => p.name),
          }
        : null;

      const requestBodyContent = inlineRefs<RequestBodyObject>(operation.requestBody, openAPIObject)?.content ?? {};
      const bodySchemas = pickBodySchemas(requestBodyContent);
      const body: VovkJSONSchemaBase | null =
        bodySchemas.length > 1 ? { anyOf: bodySchemas } : (bodySchemas[0] ?? null);
      const bodyContentTypes = bodySchemas.flatMap((s) => s['x-contentType'] ?? []);
      const pickResponseSchema = makeResponseSchemaPicker(operation);
      const output = pickResponseSchema(['application/json'], '+json');
      const iteration = pickResponseSchema(['application/jsonl', 'application/jsonlines']);

      if (errorMessageKey) {
        operation['x-errorMessageKey'] = errorMessageKey;
      }

      handlers[handlerName] = {
        httpMethod: method,
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
            // after applyComponentsSchemas, so component refs carry their Mixins type
            body: withBodyTsType(applyComponentsSchemas(body, componentsSchemas, segmentName), bodyContentTypes),
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
    }
  }

  if (pruneComponents && noPathsOpenAPIObject.components?.schemas) {
    // reassign with fresh objects only, the caller's spec shares references so its
    // components.schemas must stay untouched; walking the whole controllers tree keeps every kept $ref resolvable
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
