// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
    openAPIObject: {
      info: {
        title: 'Tasks API',
        description: 'Each user has their own tasks. Send `Authorization: Bearer <token>` with every request.',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearer: { type: 'http', scheme: 'bearer' },
        },
      },
      security: [{ bearer: [] }],
    },
  },
  moduleTemplates: {
    controller: 'vovk-cli/module-templates/zod/controller.ts.ejs',
    service: 'vovk-cli/module-templates/type/service.ts.ejs',
  },
};

export default config;
