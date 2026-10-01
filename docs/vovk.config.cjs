// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  // the site consumes no client of its own, skip the composed output
  composedClient: {
    enabled: false,
  },
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
  },
};
module.exports = config;
