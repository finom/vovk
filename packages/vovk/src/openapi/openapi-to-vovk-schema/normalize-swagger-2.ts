import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { mapSubschemas, mapValues } from './map-subschemas.js';

type Node = Record<string, unknown>;

const OPERATION_KEYS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch']);

const FORM_TYPES = ['multipart/form-data', 'application/x-www-form-urlencoded'];

// the fields of a parameter that aren't its schema
const PARAMETER_FIELDS = new Set(['name', 'in', 'description', 'required', 'allowEmptyValue', 'collectionFormat']);

// how a query array is written, as OpenAPI 3 says it with style and explode; csv is the default
const QUERY_STYLES: Record<string, { style: string; explode: boolean }> = {
  csv: { style: 'form', explode: false },
  ssv: { style: 'spaceDelimited', explode: false },
  pipes: { style: 'pipeDelimited', explode: false },
  multi: { style: 'form', explode: true },
};

const REF_PREFIXES: [string, string][] = [
  ['#/definitions/', '#/components/schemas/'],
  ['#/responses/', '#/components/responses/'],
];

const isObject = (value: unknown): value is Node => !!value && typeof value === 'object' && !Array.isArray(value);

// a Swagger 2.0 schema as OpenAPI 3.0 writes it: refs to components, a file as binary, x-nullable as nullable
function toSchema(schema: unknown): unknown {
  if (!isObject(schema)) return schema;
  const result = mapSubschemas(schema, toSchema) as Node;
  if (typeof result.$ref === 'string') {
    const ref = result.$ref;
    const [from, to] = REF_PREFIXES.find(([prefix]) => ref.startsWith(prefix)) ?? [];
    if (from && to) result.$ref = to + ref.slice(from.length);
  }
  if (result.type === 'file') Object.assign(result, { type: 'string', format: 'binary' });
  if ('x-nullable' in result) {
    const { 'x-nullable': nullable, ...rest } = result;
    return { ...rest, nullable };
  }
  return result;
}

// a parameter other than a body types itself, and its items have no collectionFormat
function parameterSchema(parameter: Node): unknown {
  const schema = Object.fromEntries(Object.entries(parameter).filter(([key]) => !PARAMETER_FIELDS.has(key)));
  const items = isObject(schema.items) ? (parameterSchema(schema.items) as Node) : undefined;
  return toSchema(items ? { ...schema, items } : schema);
}

function resolveParameter(parameter: unknown, swagger: Node): Node | null {
  if (!isObject(parameter)) return null;
  if (typeof parameter.$ref !== 'string' || !parameter.$ref.startsWith('#/parameters/')) return parameter;
  const parameters = isObject(swagger.parameters) ? swagger.parameters : {};
  const found = parameters[decodeURIComponent(parameter.$ref.slice('#/parameters/'.length))];
  return isObject(found) ? found : null;
}

function toResponse(response: unknown, produces: string[]): unknown {
  if (!isObject(response)) return response;
  if (typeof response.$ref === 'string') return toSchema(response);
  const { schema, examples: _examples, headers: _headers, ...rest } = response;
  if (schema === undefined) return rest;
  return { ...rest, content: Object.fromEntries(produces.map((type) => [type, { schema: toSchema(schema) }])) };
}

function toOperation(operation: Node, pathParameters: Node[], swagger: Node): Node {
  const {
    parameters: operationParameters,
    consumes: ownConsumes,
    produces: ownProduces,
    responses,
    schemes: _schemes,
    ...rest
  } = operation;
  const consumes = (ownConsumes ?? swagger.consumes ?? ['application/json']) as string[];
  const produces = (ownProduces ?? swagger.produces ?? ['application/json']) as string[];
  const own = (Array.isArray(operationParameters) ? operationParameters : [])
    .map((parameter) => resolveParameter(parameter, swagger))
    .filter((parameter) => parameter !== null);
  // a path parameter applies to each operation of the path unless the operation redefines it
  const parameters = [...pathParameters.filter((p) => !own.some((o) => o.name === p.name && o.in === p.in)), ...own];

  const body = parameters.find((parameter) => parameter.in === 'body');
  const fields = parameters.filter((parameter) => parameter.in === 'formData');
  let requestBody: Node | undefined;
  if (body) {
    const types = consumes.filter((type) => !FORM_TYPES.includes(type));
    requestBody = {
      ...(body.description !== undefined && { description: body.description }),
      required: body.required === true,
      content: Object.fromEntries(
        (types.length ? types : ['application/json']).map((type) => [type, { schema: toSchema(body.schema) }])
      ),
    };
  } else if (fields.length) {
    const required = fields.filter((field) => field.required === true).map((field) => field.name);
    const schema = {
      type: 'object',
      properties: Object.fromEntries(fields.map((field) => [field.name, parameterSchema(field)])),
      ...(required.length && { required }),
    };
    const hasFile = fields.some((field) => field.type === 'file');
    const types = consumes.filter((type) => FORM_TYPES.includes(type));
    requestBody = {
      required: required.length > 0,
      content: Object.fromEntries(
        (types.length ? types : [hasFile ? 'multipart/form-data' : 'application/x-www-form-urlencoded']).map((type) => [
          type,
          { schema },
        ])
      ),
    };
  }

  return {
    ...rest,
    parameters: parameters
      .filter((parameter) => parameter.in !== 'body' && parameter.in !== 'formData')
      .map((parameter) => {
        const style = parameter.in === 'query' && QUERY_STYLES[String(parameter.collectionFormat ?? 'csv')];
        return {
          name: parameter.name,
          in: parameter.in,
          ...(parameter.description !== undefined && { description: parameter.description }),
          ...(parameter.required !== undefined && { required: parameter.required }),
          schema: parameterSchema(parameter),
          ...(parameter.type === 'array' && style),
        };
      }),
    ...(requestBody && { requestBody }),
    ...(isObject(responses) && { responses: mapValues(responses, (response) => toResponse(response, produces)) }),
  };
}

function toServerURL(swagger: Node): string | undefined {
  if (typeof swagger.host !== 'string') return undefined;
  const schemes = Array.isArray(swagger.schemes) ? swagger.schemes : [];
  const scheme = schemes.includes('https') || !schemes.length ? 'https' : schemes[0];
  return `${scheme}://${swagger.host}${typeof swagger.basePath === 'string' ? swagger.basePath : ''}`;
}

// a Swagger 2.0 document as OpenAPI 3.0 writes it: the parameters, bodies and responses the importer reads
export function normalizeSwagger2(document: OpenAPIObject): OpenAPIObject {
  const swagger = document as unknown as Node;
  const {
    swagger: _version,
    host: _host,
    basePath: _basePath,
    schemes: _schemes,
    consumes: _consumes,
    produces: _produces,
    definitions,
    parameters: _parameters,
    responses,
    securityDefinitions: _securityDefinitions,
    paths,
    ...rest
  } = swagger;
  const url = toServerURL(swagger);
  const produces = (swagger.produces ?? ['application/json']) as string[];

  return {
    ...rest,
    openapi: '3.0.3',
    ...(url && { servers: [{ url }] }),
    paths: isObject(paths)
      ? mapValues(paths, (pathItem) => {
          if (!isObject(pathItem)) return pathItem;
          const pathParameters = (Array.isArray(pathItem.parameters) ? pathItem.parameters : [])
            .map((parameter) => resolveParameter(parameter, swagger))
            .filter((parameter) => parameter !== null);
          return Object.fromEntries(
            Object.entries(pathItem)
              .filter(([key]) => key !== 'parameters')
              .map(([key, item]) => [
                key,
                OPERATION_KEYS.has(key) && isObject(item) ? toOperation(item, pathParameters, swagger) : item,
              ])
          );
        })
      : {},
    components: {
      ...(isObject(definitions) && { schemas: mapValues(definitions, toSchema) }),
      ...(isObject(responses) && { responses: mapValues(responses, (response) => toResponse(response, produces)) }),
    },
  } as unknown as OpenAPIObject;
}
