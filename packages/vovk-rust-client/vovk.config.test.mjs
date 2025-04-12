/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'debug',
  origin: `http://localhost:${process.env.PORT}`,
  generateFrom: (generateFrom) => [
    ...generateFrom,
    {
      outDir: '../packages/vovk-python-client/test_py/generated_test_python_client',
      templateGlob: '../packages/vovk-python-client/template/*',
      templateName: 'py',
      fullSchema: true,
    },
  ],
};

export default vovkConfig;
