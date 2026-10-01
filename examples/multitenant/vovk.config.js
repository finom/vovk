// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
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
