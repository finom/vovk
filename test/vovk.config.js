/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  prefix: `http://localhost:${process.env.PORT}/api`,
  modulesDir: './src',
};

module.exports = vovkConfig;
