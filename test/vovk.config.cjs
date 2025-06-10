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
    outDir: './other-compiled-test-sources/segmented-client',
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
      composedClient: {
        outDir: './tmp/py',
        package: {
          name: 'test_generated_python_client',
          version: '0.0.1',
          license: 'MIT',
          description: 'Vovk.ts Python Client',
        },
      },
    },
    rs: {
      extends: 'rs',
      composedClient: {
        outDir: './tmp/rs',
        package: {
          name: 'test_generated_rust_client',
          version: '0.0.1',
          license: 'MIT',
          description: 'Vovk.ts Rust Client',
        },
      },
    },
  },
  extendClientWithOpenAPI: {
    rootModules: [
      {
        source: {
          file: 'http://localhost:3000/api/openapi.json',
          url: 'http://localhost:3000/api',
          object: {},
        },
        apiRoot: 'http://localhost:3000/api',
        // vovk g --openapi ShopifyRPC:http://localhost:3000/api/openapi.json --openapi-nestjs http://localhost:3000/api/openapi.json
        getModuleName: 'nestjs-operation-id',
        getMethodName: 'nestjs-operation-id', // fn or 'nestjs'
      },
    ],
  },
};

module.exports = vovkConfig;
