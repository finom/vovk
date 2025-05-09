// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  modulesDir: './src/modules',
  // createRPCImport: ['../packages/vovk-react-query/index.cjs', '../packages/vovk-react-query/index.mjs'],
  imports: {
    validateOnClient: '../packages/vovk-ajv/index.js',
  },
  segmentedClient: {
    enabled: true,
    outDir: './src/generated-segment-client',
  },
  schemaOutDir: './.vovk-schema',
  origin: `http://localhost:${process.env.PORT}`,
  rootEntry: 'api',
  logLevel: 'debug',
  moduleTemplates: {
    service: 'none',
    controller: 'none',
  },
  clientTemplateDefs: {
    py: {
      templatePath: '../packages/vovk-python-client/template/',
      requires: {
        fullSchemaJson: './data',
      },
      fullClient: {
        outDir: './tmp/py',
        package: {
          name: 'test_generated_python_client',
          version: '0.0.1',
          license: 'MIT',
          description: 'Vovk Python Client',
        },
      },
    },
    rs: {
      templatePath: '../packages/vovk-rust-client/template/',
      requires: {
        fullSchemaJson: './data',
      },
      fullClient: {
        outDir: './tmp/rs',
        package: {
          name: 'test_generated_rust_client',
          version: '0.0.1',
          license: 'MIT',
          description: 'Vovk Rust Client',
        },
      },
    },
  },
};

module.exports = vovkConfig;
