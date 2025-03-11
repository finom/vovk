/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  // relative to /test folder
  imports: {
    validateOnClient: '../packages/vovk-ajv/index.js',
    createRPC: ['../packages/vovk-react-query/index.cjs', '../packages/vovk-react-query/index.mjs'],
  },
  logLevel: 'debug',
  origin: `http://localhost:${process.env.PORT}`,
};

export default vovkConfig;
