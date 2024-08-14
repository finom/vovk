/** @type {import('vovk-cli').VovkConfig} */
const vovkConfig = {
  prefix: `http://localhost:${process.env.PORT}/api`, // del???
  modulesDir: './src', // for watching and to create new files there
  route: './src/app/api/[[...vovk]]/route.ts', // del
  clientOut: './.vovk', // rename
  metadataOut: './.vovk.json', // rename
  validateOnClient: 'vovk-zod/validateOnClient',
  
  // Thoughts:
  segments: [{ // automatic
    name: 'bar',
    route: './src/app/api/bar/[[...vovk]]/route.ts',
  }, {
    name: 'foo',
    route: './src/app/api/foo/[[...vovk]]/route.ts',
  }],
  metadataOutDir: './.vovk',
  clientOutDir: './.vovk',
  validationLibrary: 'vovk-zod',
  origin: `http://localhost:${process.env.PORT}`,
  segmentsDir: './src/app/api', // do we need dat if we know entryPoint?
  // DOC: src/app or src/pages will be ignored if app or pages are present in the root directory.
  entryPoint: 'api',
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
