// @ts-check
/** @type {import('vovk-cli').VovkConfig} */
const vovkConfig = {
  modulesDir: './src/modules',
  validateOnClientPath: 'vovk-zod/validateOnClient',
  createRPCPath: '../packages/vovk-react-query/index.cjs',
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
