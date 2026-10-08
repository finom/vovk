// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  moduleTemplates: {
    controller: 'vovk-cli/module-templates/zod/controller.ts.ejs',
    service: 'vovk-cli/module-templates/type/service.ts.ejs',
  },
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
