import type { OpenAPIObject, OperationObject, PathsObject, SchemaObject } from 'openapi3-ts/oas31';
import { resolveGeneratorConfigValues } from '../core/resolve-generator-config-values.js';
import { createCodeSamples } from '../samples/create-code-samples.js';
import { schemaToObject } from '../samples/schema-to-object.js';
import type {
  VovkOutputConfig,
  VovkPackageJson,
  VovkReadmeConfig,
  VovkSamplesConfig,
  VovkStrictConfig,
} from '../types/config.js';
import type { VovkSchema } from '../types/core.js';
import { type HttpMethod, HttpStatus } from '../types/enums.js';
import type { VovkJSONSchemaBase } from '../types/json-schema.js';
import { camelCase } from '../utils/camel-case.js';
import {
  decodeJSONPointerToken,
  encodeJSONPointerToken,
  isJSONObject,
  isLocalJSONSchemaRef,
  mapJSONSchemaRefs,
  parseDefinitionRef,
} from '../utils/map-json-schema-refs.js';
import { upperFirst } from '../utils/upper-first.js';

// Zod names the schemas it extracts for recursion `__schema0`, `__schema1`, ... in every slot
const isNumberedDefinitionName = (name: string) => /^__schema\d+$/.test(name);

// OpenAPI allows letters, digits, ".", "-" and "_" in a component name
const toComponentName = (name: string) => name.replace(/[^A-Za-z0-9._-]/g, '_');

/**
 * Moves a slot's `$defs` (or `definitions`) to `components` and returns the slot with its refs rewritten to them.
 * A numbered definition, or one whose name another slot took for a different schema, gets the slot's name in front;
 * a slot that refers to its own root is added to the components as well.
 */
function extractComponents(
  schema: VovkJSONSchemaBase | undefined,
  slotName: string,
  components: Record<string, VovkJSONSchemaBase>
): VovkJSONSchemaBase | undefined {
  if (!schema) return undefined;

  const { $defs, definitions, ...root } = schema;
  const defs: Record<string, VovkJSONSchemaBase> = { ...definitions, ...$defs };
  // a definition that keeps its name takes it, a renamed one finds its name taken already
  const taken = new Set([...Object.keys(components), ...Object.keys(defs).map(toComponentName)]);
  const reserve = (name: string) => {
    let unique = toComponentName(name);
    for (let i = 2; taken.has(unique); i++) unique = `${toComponentName(name)}_${i}`;
    taken.add(unique);
    return unique;
  };
  const newNames = new Map<string, string>();
  const kept = new Set<string>();
  for (const name of Object.keys(defs)) {
    if (isNumberedDefinitionName(name)) newNames.set(name, reserve(`${slotName}${upperFirst(camelCase(name))}`));
    // two names that differ only in characters a component name can't hold
    else if (kept.has(toComponentName(name))) newNames.set(name, reserve(name));
    else kept.add(toComponentName(name));
  }
  const componentNameOf = (name: string) => newNames.get(name) ?? toComponentName(name);

  let refersToRoot = false;
  let rootName = slotName;
  const rewrite = (ref: string): string => {
    // outside the document: the component named after the last segment
    if (!ref.startsWith('#')) return `#/components/schemas/${ref.split('/').pop()}`;
    if (!isLocalJSONSchemaRef(ref) || ref.startsWith('#/components/')) return ref;
    const def = parseDefinitionRef(ref);
    if (def) return `#/components/schemas/${encodeJSONPointerToken(componentNameOf(def.name))}${def.rest}`;
    refersToRoot = true;
    return `#/components/schemas/${encodeJSONPointerToken(rootName)}${ref.slice(1)}`;
  };

  mapJSONSchemaRefs(schema, rewrite);
  if (refersToRoot) rootName = reserve(slotName);

  // renaming a definition changes the ones that refer to it, so compare again until no name changes
  for (let renamed = true; renamed; ) {
    renamed = false;
    for (const [name, def] of Object.entries(defs)) {
      if (newNames.has(name) || !Object.hasOwn(components, toComponentName(name))) continue;
      if (JSON.stringify(components[toComponentName(name)]) !== JSON.stringify(mapJSONSchemaRefs(def, rewrite))) {
        newNames.set(name, reserve(`${slotName}${upperFirst(camelCase(name))}`));
        renamed = true;
      }
    }
  }

  for (const [name, def] of Object.entries(defs)) {
    components[componentNameOf(name)] = mapJSONSchemaRefs(def, rewrite);
  }
  const result = mapJSONSchemaRefs(root as VovkJSONSchemaBase, rewrite);
  if (refersToRoot) components[rootName] = result;
  return result;
}

// a schema that is only a $ref to a component, as a library writes a schema with an id, reads as the component
function resolveComponentRef(schema: unknown, components: Record<string, VovkJSONSchemaBase>): unknown {
  const seen = new Set<string>();
  let resolved = schema;
  while (
    isJSONObject(resolved) &&
    typeof resolved.$ref === 'string' &&
    resolved.$ref.startsWith('#/components/schemas/')
  ) {
    if (seen.has(resolved.$ref)) return undefined;
    seen.add(resolved.$ref);
    const name = decodeJSONPointerToken(resolved.$ref.slice('#/components/schemas/'.length));
    resolved = name === null ? undefined : components[name];
  }
  return resolved;
}

// an object, or a union with one, in the query
function isObjectSchema(schema: unknown, components: Record<string, VovkJSONSchemaBase>, seen = new Set()): boolean {
  const resolved = resolveComponentRef(schema, components);
  if (!isJSONObject(resolved) || seen.has(resolved)) return false;
  seen.add(resolved);
  if (resolved.type !== undefined) return [resolved.type].flat().includes('object');
  if (resolved.properties || resolved.additionalProperties || resolved.patternProperties) return true;
  return ['anyOf', 'oneOf', 'allOf'].some(
    (key) => Array.isArray(resolved[key]) && resolved[key].some((member) => isObjectSchema(member, components, seen))
  );
}

// returns OpenAPIObject along with resolved configs
// TODO: Refactor and decompose
export function vovkSchemaToOpenAPI({
  config,
  rootEntry = 'api',
  schema: fullSchema,
  outputConfigs,
  forceOutputConfigs,
  isBundle,
  segmentName: givenSegmentName,
  projectPackageJson,
}: {
  config: VovkStrictConfig | undefined;
  rootEntry?: string;
  schema: VovkSchema;
  outputConfigs: VovkOutputConfig[];
  forceOutputConfigs?: VovkOutputConfig[];
  isBundle: boolean;
  segmentName: string | null;
  projectPackageJson: VovkPackageJson | undefined;
}): {
  readme: VovkReadmeConfig;
  openAPIObject: OpenAPIObject;
  samples: VovkSamplesConfig;
  origin: string;
  package: VovkPackageJson;
  imports: VovkOutputConfig['imports'];
  reExports: VovkOutputConfig['reExports'];
} {
  const paths: PathsObject = {};
  const {
    openAPIObject,
    samples: samplesConfig,
    package: packageJson,
    readme: readmeConfig,
    origin,
    imports,
    reExports,
  } = resolveGeneratorConfigValues({
    config,
    outputConfigs,
    forceOutputConfigs,
    isBundle,
    segmentName: givenSegmentName ?? null,
    projectPackageJson,
  });
  // the config's schemas win over the built-in ones, and a derived schema never takes a declared name
  const declaredSchemas: { [key: string]: VovkJSONSchemaBase } = {
    ...openAPIObject?.components?.schemas,
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
    ...openAPIObject?.components?.schemas,
  } as { [key: string]: VovkJSONSchemaBase };
  const components: { [key: string]: VovkJSONSchemaBase } = { ...declaredSchemas };
  for (const [segmentName, segmentSchema] of givenSegmentName
    ? ([[givenSegmentName, fullSchema.segments[givenSegmentName]]] as const)
    : Object.entries(fullSchema.segments ?? {})) {
    // the generated client calls a segment under these names, see the multitenancy docs
    const segmentConfig = config?.outputConfig?.segments?.[segmentName];
    const segmentRootEntry = segmentConfig?.rootEntry ?? rootEntry;
    const segmentPathName = segmentConfig?.segmentNameOverride ?? segmentName;
    for (const c of Object.values(segmentSchema.controllers)) {
      for (const [handlerName, h] of Object.entries(c.handlers ?? {})) {
        if (h.operationObject && !h.misc?.isOpenAPIMixin) {
          const slotName = (slot: string) =>
            `${c.rpcModuleName}${upperFirst(handlerName)}${upperFirst(slot)}`.replace(/[^A-Za-z0-9._-]/g, '_');
          const queryValidation = extractComponents(h.validation?.query, slotName('query'), components);
          const bodyValidation = extractComponents(h.validation?.body, slotName('body'), components);
          const paramsValidation = extractComponents(h.validation?.params, slotName('params'), components);
          const outputValidation = extractComponents(h.validation?.output, slotName('output'), components);
          const iterationValidation = extractComponents(h.validation?.iteration, slotName('iteration'), components);

          const { ts, rs, py } = createCodeSamples({
            package: packageJson,
            handlerName,
            handlerSchema: h,
            controllerSchema: c,
            config: samplesConfig,
          });
          const queryObject = resolveComponentRef(queryValidation, components) as VovkJSONSchemaBase | undefined;
          const queryParameters = isJSONObject(queryObject?.properties)
            ? Object.entries(queryObject.properties).map(([propName, propSchema]) => ({
                name: propName,
                in: 'query',
                required: queryObject.required ? queryObject.required.includes(propName) : false,
                // the server reads an object from brackets, filter[status]=sold
                ...(isObjectSchema(propSchema, components) && { style: 'deepObject', explode: true }),
                schema: propSchema,
              }))
            : null;

          const paramsObject = resolveComponentRef(paramsValidation, components) as VovkJSONSchemaBase | undefined;
          const pathParameters = isJSONObject(paramsObject?.properties)
            ? Object.entries(paramsObject.properties).map(([propName, propSchema]) => ({
                name: propName,
                in: 'path',
                required: true,
                schema: propSchema,
              }))
            : null;

          const path =
            (h.misc?.originalPath as string) ??
            `/${[segmentRootEntry.replace(/^\/+|\/+$/g, ''), segmentPathName, c.prefix, h.path].filter(Boolean).join('/')}`;
          // every {name} of the path is a parameter, a string when no params schema describes it
          const templateParameters = Array.from(path.matchAll(/\{([^}]+)\}/g), ([, name]) => name)
            .filter((name) => !pathParameters?.some((parameter) => parameter.name === name))
            .map((name) => ({ name, in: 'path', required: true, schema: { type: 'string' } }));
          paths[path] = paths[path] ?? {};
          const httpMethod = h.httpMethod.toLowerCase() as Lowercase<HttpMethod>;
          paths[path][httpMethod] ??= {};
          paths[path][httpMethod] = {
            ...h.operationObject,
            ...paths[path][httpMethod],
            'x-codeSamples': [
              ...(paths[path][httpMethod]['x-codeSamples'] ?? []),
              ...(h.operationObject?.['x-codeSamples'] ?? []),
              {
                label: 'TypeScript RPC',
                lang: 'typescript',
                source: ts,
              },
              {
                label: 'Python RPC',
                lang: 'python',
                source: py,
              },
              {
                label: 'Rust RPC',
                lang: 'rust',
                source: rs,
              },
            ],
            ...((queryParameters || pathParameters || templateParameters.length
              ? {
                  // merge derived path/query parameters with user-declared ones, user wins on (name, in) collision
                  parameters: [
                    ...[...(queryParameters || []), ...(pathParameters || []), ...templateParameters].filter(
                      (p) =>
                        !h.operationObject?.parameters?.some(
                          (up) => 'name' in up && up.name === p.name && up.in === p.in
                        )
                    ),
                    ...(h.operationObject?.parameters ?? []),
                  ],
                }
              : {}) as OperationObject['parameters']),
            ...(paths[path][httpMethod].parameters
              ? {
                  parameters: paths[path][httpMethod].parameters,
                }
              : {}),
            ...(outputValidation
              ? {
                  responses: {
                    200: {
                      description: 'description' in outputValidation ? outputValidation.description : 'Success',
                      content: {
                        'application/json': {
                          schema: outputValidation,
                        },
                      },
                    },
                    ...h.operationObject?.responses,
                  },
                }
              : {}),
            ...(iterationValidation
              ? {
                  responses: {
                    200: {
                      description:
                        'description' in iterationValidation
                          ? iterationValidation.description
                          : 'JSON Lines response, sent as text/plain unless Accept includes application/jsonl',
                      content: {
                        'application/jsonl': {
                          schema: iterationValidation,
                          // the body is lines of items, an example of the schema is one item; its refs point at the components
                          example: Array(3)
                            .fill(
                              JSON.stringify(
                                schemaToObject(iterationValidation, {
                                  components: { schemas: components },
                                } as VovkJSONSchemaBase)
                              )
                            )
                            .join('\n'),
                        },
                      },
                    },
                    ...h.operationObject?.responses,
                  },
                }
              : {}),
            ...(paths[path][httpMethod].responses
              ? {
                  responses: paths[path][httpMethod].responses,
                }
              : {}),
            ...(bodyValidation
              ? {
                  requestBody: h.operationObject?.requestBody ?? {
                    description: 'description' in bodyValidation ? bodyValidation.description : 'Request body',
                    required: true,
                    content: bodyValidation['x-contentType']?.length
                      ? Object.fromEntries(
                          bodyValidation['x-contentType'].map((ct) => [ct, { schema: bodyValidation as SchemaObject }])
                        )
                      : {
                          'application/json': {
                            schema: bodyValidation as SchemaObject,
                          },
                        },
                  },
                }
              : {}),
            ...(paths[path][httpMethod].requestBody
              ? {
                  requestBody: paths[path][httpMethod].requestBody,
                }
              : {}),
            tags: paths[path][httpMethod].tags ?? h.operationObject?.tags,
          };
        }
      }
    }
  }

  return {
    readme: readmeConfig,
    samples: samplesConfig,
    package: packageJson,
    imports,
    reExports,
    origin,
    openAPIObject: {
      ...openAPIObject,
      components: {
        ...openAPIObject?.components,
        schemas: {
          ...Object.fromEntries(Object.entries(components).filter(([name]) => !Object.hasOwn(declaredSchemas, name))),
          ...declaredSchemas,
        } as Record<string, SchemaObject>,
      },
      paths,
    },
  };
}
