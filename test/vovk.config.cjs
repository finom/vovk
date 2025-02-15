// @ts-check
/** @type {import('vovk-cli').VovkConfig} */
const vovkConfig = {
  modulesDir: './src/modules',
  validateOnClientImport: '../packages/vovk-zod/validateOnClient.js',
  createRPCImport: ['../packages/vovk-react-query/index.cjs', '../packages/vovk-react-query/index.mjs'],
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
