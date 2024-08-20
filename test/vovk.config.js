// @ts-check
/** @type {import('vovk-cli').VovkConfig} */
const vovkConfig = {
  modulesDir: './src', // for watching and to create new files there
  validateOnClient: 'vovk-zod/validateOnClient',
  metadataOutDir: './.vovk-schema',
  clientOutDir: './.vovk-test',
  validationLibrary: 'vovk-zod',
  origin: `http://localhost:${process.env.PORT}`,
  // DOC: src/app or src/pages will be ignored if app or pages are present in the root directory.
  rootEntry: 'api',
  logLevel: 'debug',
};

// vovk create segment foo
// vovk create segment [root]
/*
export const { GET } = initVovk({
  controllers,
  segmentName: 'foo',
});
*/
// vovk create module foo/myModule
// - Create service/controller, add controller to segment

module.exports = vovkConfig;
