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
  encodeJSONPointerToken,
  isLocalJSONSchemaRef,
  mapJSONSchemaRefs,
  parseDefinitionRef,
} from '../utils/map-json-schema-refs.js';
import { upperFirst } from '../utils/upper-first.js';

// Zod names the schemas it extracts for recursion `__schema0`, `__schema1`, ... in every slot
const isNumberedDefinitionName = (name: string) => /^__schema\d+$/.test(name);

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
  const taken = new Set([...Object.keys(components), ...Object.keys(defs)]);
  const reserve = (name: string) => {
    let unique = name;
    for (let i = 2; taken.has(unique); i++) unique = `${name}_${i}`;
    taken.add(unique);
    return unique;
  };
  const newNames = new Map<string, string>();
  for (const name of Object.keys(defs)) {
    if (isNumberedDefinitionName(name)) newNames.set(name, reserve(`${slotName}${upperFirst(camelCase(name))}`));
  }

  let refersToRoot = false;
  let rootName = slotName;
  const rewrite = (ref: string): string => {
    // outside the document: the component named after the last segment
    if (!ref.startsWith('#')) return `#/components/schemas/${ref.split('/').pop()}`;
    if (!isLocalJSONSchemaRef(ref) || ref.startsWith('#/components/')) return ref;
    const def = parseDefinitionRef(ref);
    if (def) {
      const newName = Object.hasOwn(defs, def.name) ? (newNames.get(def.name) ?? def.name) : def.name;
      return `#/components/schemas/${newName === def.name ? def.token : encodeJSONPointerToken(newName)}${def.rest}`;
    }
    refersToRoot = true;
    return `#/components/schemas/${encodeJSONPointerToken(rootName)}${ref.slice(1)}`;
  };

  mapJSONSchemaRefs(schema, rewrite);
  if (refersToRoot) rootName = reserve(slotName);

  // renaming a definition changes the ones that refer to it, so compare again until no name changes
  for (let renamed = true; renamed; ) {
    renamed = false;
    for (const [name, def] of Object.entries(defs)) {
      if (newNames.has(name) || !Object.hasOwn(components, name)) continue;
      if (JSON.stringify(components[name]) !== JSON.stringify(mapJSONSchemaRefs(def, rewrite))) {
        newNames.set(name, reserve(`${slotName}${upperFirst(camelCase(name))}`));
        renamed = true;
      }
    }
  }

  for (const [name, def] of Object.entries(defs)) {
    components[newNames.get(name) ?? name] = mapJSONSchemaRefs(def, rewrite);
  }
  const result = mapJSONSchemaRefs(root as VovkJSONSchemaBase, rewrite);
  if (refersToRoot) components[rootName] = result;
  return result;
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
  const components: { [key: string]: VovkJSONSchemaBase } = {};
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
          const queryParameters =
            queryValidation && 'type' in queryValidation && 'properties' in queryValidation
              ? Object.entries(queryValidation.properties ?? {}).map(([propName, propSchema]) => ({
                  name: propName,
                  in: 'query',
                  required: queryValidation.required ? queryValidation.required.includes(propName) : false,
                  schema: propSchema,
                }))
              : null;

          const pathParameters =
            paramsValidation && 'type' in paramsValidation && 'properties' in paramsValidation
              ? Object.entries(paramsValidation.properties ?? {}).map(([propName, propSchema]) => ({
                  name: propName,
                  in: 'path',
                  required: paramsValidation.required ? paramsValidation.required.includes(propName) : false,
                  schema: propSchema,
                }))
              : null;

          const path =
            (h.misc?.originalPath as string) ??
            `/${[segmentRootEntry.replace(/^\/+|\/+$/g, ''), segmentPathName, c.prefix, h.path].filter(Boolean).join('/')}`;
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
            ...((queryParameters || pathParameters
              ? {
                  // merge derived path/query parameters with user-declared ones, user wins on (name, in) collision
                  parameters: [
                    ...[...(queryParameters || []), ...(pathParameters || [])].filter(
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
                        'description' in iterationValidation ? iterationValidation.description : 'JSON Lines response',
                      content: {
                        'application/jsonl': {
                          schema: {
                            ...iterationValidation,
                            examples: iterationValidation.examples ?? [
                              [
                                JSON.stringify(schemaToObject(iterationValidation)),
                                JSON.stringify(schemaToObject(iterationValidation)),
                                JSON.stringify(schemaToObject(iterationValidation)),
                              ].join('\n'),
                            ],
                          },
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
          // merge so user-declared schemas extend the derived ones instead of replacing them
          ...components,
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
        },
      },
      paths,
    },
  };
}
