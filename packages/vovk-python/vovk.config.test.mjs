// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'debug',
  origin: `http://localhost:${process.env.PORT}`,
  clientTemplateDefs: {
    py: {
      extends: 'py',
      composedClient: {
        outDir: '../packages/vovk-python/test_py/generated_python_client',
        package: {
          name: 'test_generated_python_client',
          version: '0.0.1',
          license: 'MIT',
          description: 'Vovk Python Client',
        },
      },
    },
  },
  composedClient: {
    fromTemplates: ['py'],
  },
};

export default vovkConfig;
