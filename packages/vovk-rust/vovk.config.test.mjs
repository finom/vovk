// @ts-check
const origin = `http://localhost:${process.env.PORT}`;

// an OpenAPI mixin over endpoints of the test app: paths start with a slash and controllers have no prefix
/** @type {import('openapi3-ts/oas31').OpenAPIObject} */
const mixinSpec = {
  openapi: '3.0.3',
  info: { title: 'Mixin', version: '1.0.0' },
  paths: {
    '/with-zod/x/{foo}/{bar}/y': {
      put: {
        operationId: 'handleParams',
        parameters: [
          { name: 'foo', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'bar', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'ok',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Params' } } },
          },
        },
      },
    },
    '/with-zod/handle-query': {
      get: {
        operationId: 'handleQuery',
        parameters: [{ name: 'search', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'ok',
            content: {
              'application/json': { schema: { type: 'object', properties: { search: { type: 'string' } } } },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Params: {
        type: 'object',
        properties: { foo: { type: 'string' }, bar: { type: 'string' } },
        required: ['foo', 'bar'],
      },
    },
  },
};

/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'debug',
  outputConfig: {
    // unreachable: every segment the tests call sets its own root, so a client that ignores it fails
    origin: 'http://localhost:1',
    segments: {
      // /api/foo/client again, from a root entry and a segment name override
      'foo/client': { origin, rootEntry: 'api/foo', segmentNameOverride: 'client' },
      'rust-sweep': { origin },
      mixin: {
        openAPIMixin: {
          source: { object: mixinSpec },
          apiRoot: `${origin}/api/foo/client`,
          getModuleName: 'MixinRPC',
          getMethodName: 'camel-case-operation-id',
        },
      },
    },
  },
  clientTemplateDefs: {
    rs: {
      extends: 'rs',
      composedClient: {
        outDir: '../packages/vovk-rust/generated_rust_client',
      },
      outputConfig: {
        package: {
          name: 'generated_rust_client',
          version: '0.1.0',
          license: 'MIT',
          description: 'Vovk Rust Client',
        },
      },
    },
  },
  composedClient: {
    fromTemplates: ['rs'],
  },
};

export default vovkConfig;
