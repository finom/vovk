// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  modulesDir: './src/modules',
  createRPCImport: ['../packages/vovk-react-query/index.cjs', '../packages/vovk-react-query/index.mjs'],
  validateOnClientImport: '../packages/vovk-ajv/index.js',
  schemaOutDir: './.vovk-schema',
  origin: `http://localhost:${process.env.PORT}`,
  rootEntry: 'api',
  logLevel: 'debug',
  templates: {
    service: 'none',
    controller: 'none',
  },
};

module.exports = vovkConfig;
