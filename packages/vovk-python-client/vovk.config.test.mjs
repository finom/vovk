// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'debug',
  origin: `http://localhost:${process.env.PORT}`,
  clientTemplateDefs: {
    py: {
      clientOutDir: '../packages/vovk-python-client/test_py/generated_test_python_client',
      templatePath: '../packages/vovk-python-client/template/',
      fullSchemaJson: true,
    },
  },
  generateFrom: ['py'],
};

export default vovkConfig;
