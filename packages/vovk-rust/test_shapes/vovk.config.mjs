// @ts-check
// schema shapes the generated crate must compile and read; run from packages/vovk-rust
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'warn',
  outputConfig: {
    // never called, except to check client-side validation, which fails before the request
    origin: 'http://localhost:1',
    segments: {
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
  },
  composedClient: {
    fromTemplates: ['rs'],
  },
};

export default vovkConfig;
