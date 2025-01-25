// @ts-check
/** @type {import('vovk-cli').VovkConfig} */
const vovkConfig = {
  modulesDir: './src', // for watching and to create new files there
  validateOnClient: 'vovk-zod/validateOnClient',
  schemaOutDir: './.vovk-schema',
  validationLibrary: 'vovk-zod',
  origin: `http://localhost:${process.env.PORT}`,
  // DOC: src/app or src/pages will be ignored if app or pages are present in the root directory.
  rootEntry: 'api',
  logLevel: 'debug',
  templates: {
    service: 'none',
    controller: 'none',
  },
};

module.exports = vovkConfig;
