// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  // nothing imports the composed client here, keep it out of the perf surface
  composedClient: {
    enabled: false,
  },
  outputConfig: {
    imports: {
      validateOnClient: "vovk-ajv",
    },
  },
  moduleTemplates: {
    controller: "./module-templates/controller.ts.ejs",
  },
};
export default config;
