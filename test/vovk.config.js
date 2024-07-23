/** @type {import('vovk-cli').VovkConfig} */
const vovkConfig = {
  prefix: `http://localhost:${process.env.PORT}/api`,
  modulesDir: './src',
  route: './src/app/api/[[...vovk]]/route.ts',
  clientOut: './.vovk',
  metadataOut: './.vovk.json',
  validateOnClient: 'vovk-zod/validateOnClient',
};

module.exports = vovkConfig;
