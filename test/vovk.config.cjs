// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  modulesDir: './src/modules',
  validateOnClientImport: '../packages/vovk-ajv/index.js',
  schemaOutDir: './.vovk-schema',
  origin: `http://localhost:${process.env.PORT}`,
  generateFrom: (generateFrom) => [
    ...generateFrom,
    {
      outDir: './python_lib',
      templatePath: '../packages/vovk-python-client/template/__init__.py.ejs',
      templateName: 'py',
      fullSchema: true,
    },
  ],
  rootEntry: 'api',
  logLevel: 'debug',
  templates: {
    service: 'none',
    controller: 'none',
  },
};

module.exports = vovkConfig;
