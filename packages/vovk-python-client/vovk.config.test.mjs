// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'debug',
  origin: `http://localhost:${process.env.PORT}`,
  clientTemplateDefs: {
    py: {
      clientOutDir: '../packages/vovk-python-client/test_py/generated_test_python_client',
      templatePath: '../packages/vovk-python-client/template/',
      fullSchemaJson: './data/full-schema.json',
      package: {
        name: 'generated_python_client',
        version: '0.0.1',
        description: 'Test Python client', 
      }
    },
  },
  generateFrom: ['py'],
};

export default vovkConfig;
