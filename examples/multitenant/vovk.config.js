// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    enabled: false,
  },
  segmentedClient: {
    enabled: true,
  },
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
    segments: {
      admin: {
        segmentNameOverride: '',
      },
      customer: {
        segmentNameOverride: '',
      },
      'customer/pro': {
        segmentNameOverride: '',
      },
    },
  },
};
module.exports = config;
