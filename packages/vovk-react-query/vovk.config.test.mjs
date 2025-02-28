/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  // relative to /test folder
  validateOnClientImport: '../packages/vovk-ajv/index.js',
  createRPCImport: ['../packages/vovk-react-query/index.cjs', '../packages/vovk-react-query/index.mjs'],
  logLevel: 'debug',
  origin: `http://localhost:${process.env.PORT}`,
};

console.log(process.cwd());

export default vovkConfig;
