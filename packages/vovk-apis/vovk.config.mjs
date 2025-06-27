// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  imports: {
    validateOnClient: 'vovk-ajv',
  },
  segmentedClient: {
    enabled: true,
    fromTemplates: ['cjs', 'mjs', 'readme'],
    outDir: './dist',
  },
  composedClient: {
    enabled: false,
  },
  logLevel: 'debug',
  openApiMixins: {
    petstore: {
      source: {
        url: 'https://petstore3.swagger.io/api/v3/openapi.json',
      },
      getModuleName: 'PetstoreRPC',
      getMethodName: 'auto',
    },
  },
};

export default config;
