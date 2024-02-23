// @ts-check

const getConfig = require('./lib/getConfig.cjs');
const path = require('path');

/** @type {(options?: { VOVK_CLIENT_OUT?: string; PORT?: string; }) => Promise<import('../src').VovkEnv>} */
async function getVars(options = {}) {
  /** @type {Required<import('../src').VovkConfig>} */
  const vovkConfig = {
    clientOut: './node_modules/.vovk',
    route: './src/app/api/[[...vovk]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    prefix: '/api',
    validateOnClient: '',
  };

  // make PORT available to the config file
  process.env.PORT = options.PORT || process.env.PORT || '3000';
  Object.assign(vovkConfig, await getConfig());

  const OUT = process.env.VOVK_CLIENT_OUT || options.VOVK_CLIENT_OUT || vovkConfig.clientOut;

  /** @type {import('../src').VovkEnv} */
  const vars = {
    PORT: options.PORT || process.env.PORT || '3000',
    VOVK_CLIENT_OUT: OUT.startsWith('/') ? OUT : path.join(process.cwd(), OUT),
    VOVK_PORT: process.env.VOVK_PORT || '3690',
    VOVK_ROUTE: process.env.VOVK_ROUTE || vovkConfig.route,
    VOVK_FETCHER: process.env.VOVK_FETCHER || vovkConfig.fetcher,
    VOVK_PREFIX: process.env.VOVK_PREFIX || vovkConfig.prefix,
    VOVK_VALIDATE_ON_CLIENT: process.env.VOVK_VALIDATE_ON_CLIENT || vovkConfig.validateOnClient,
  };

  return vars;
}

module.exports = getVars;
