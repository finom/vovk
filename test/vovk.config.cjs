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
    outDir: './other-compiled-test-sources/segment-client',
  },
  schemaOutDir: './.vovk-schema',
  origin: `http://localhost:${process.env.PORT}`,
  rootEntry: 'api',
  logLevel: 'debug',
  moduleTemplates: {
    service: 'none',
    controller: 'none',
  },
  bundle: {
    outDir: './other-compiled-test-sources/bundle',
  },
  clientTemplateDefs: {
    py: {
      extends: 'py',
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
      extends: 'rs',
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
