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
    npm: {
      extends: 'npm',
      fullClient: {
        outDir: './generated/npm',
        package: {
          name: 'test_generated_client',
          version: '0.0.1',
          license: 'MIT',
          description: 'Vovk Client',
        },
      },
    },
  },
};

module.exports = vovkConfig;
