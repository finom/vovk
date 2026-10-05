// @ts-check
// schema shapes the generated crate must compile and read; run from packages/vovk-rust

// a crate whose procedures send no body: it builds without warnings all the same
/** @type {import('openapi3-ts/oas31').OpenAPIObject} */
const readonlySpec = {
  openapi: '3.1.0',
  info: { title: 'Read only', version: '1.0.0' },
  // never called
  servers: [{ url: 'http://localhost:1' }],
  paths: {
    '/things': {
      get: {
        operationId: 'listThings',
        responses: {
          200: {
            description: 'ok',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } },
          },
        },
      },
    },
  },
};

/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'warn',
  outputConfig: {
    // never called, except to check client-side validation, which fails before the request
    origin: 'http://localhost:1',
    segments: {
      readonly: {
        openAPIMixin: { source: { object: readonlySpec }, getModuleName: 'ReadonlyAPI', getMethodName: 'auto' },
      },
      petstore: {
        openAPIMixin: {
          source: { file: './test_shapes/petstore.json' },
          getModuleName: 'PetstoreAPI',
          getMethodName: 'auto',
        },
      },
    },
  },
  clientTemplateDefs: {
    rs: {
      extends: 'rs',
      composedClient: {
        outDir: './generated_shapes_client',
      },
      outputConfig: {
        package: {
          name: 'generated_shapes_client',
          version: '0.1.0',
          license: 'MIT',
          description: 'Vovk Rust Client for the schema shapes',
        },
      },
    },
    // generated with --from rsReadonly --include readonly
    rsReadonly: {
      extends: 'rs',
      composedClient: {
        outDir: './generated_readonly_client',
      },
      outputConfig: {
        package: { name: 'generated_readonly_client', version: '0.1.0', license: 'MIT' },
      },
    },
  },
  composedClient: {
    fromTemplates: ['rs'],
    excludeSegments: ['readonly'],
  },
};

export default vovkConfig;
