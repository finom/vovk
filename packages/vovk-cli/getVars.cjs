// @ts-check

const getConfig = require('./lib/getConfig.cjs');
const path = require('path');

/** @type {(options?: { VOVK_CLIENT_OUT?: string; PORT?: string; }) => Promise<Required<import('./types').VovkEnv>>} */
async function getVars(options = {}) {
  /** @type {Required<import('../vovk').VovkConfig>} */
  const vovkConfig = {
    clientOut: './node_modules/.vovk',
    route: './src/app/api/[[...vovk]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    prefix: '/api',
    validateOnClient: '',
    modulesDir: './src/modules',
  };

  // make PORT available to the config file
  process.env.PORT = options.PORT || process.env.PORT || '3000';
  Object.assign(vovkConfig, await getConfig());

  const OUT = process.env.VOVK_CLIENT_OUT || options.VOVK_CLIENT_OUT || vovkConfig.clientOut;
  const PORT = options.PORT || process.env.PORT || '3000';

  /** @type {Required<import('./types').VovkEnv>} */
  const vars = {
    PORT,
    VOVK_CLIENT_OUT: OUT.startsWith('/') ? OUT : path.join(process.cwd(), OUT),
    VOVK_PORT: process.env.VOVK_PORT || (parseInt(PORT) + 6969).toString(),
    VOVK_ROUTE: process.env.VOVK_ROUTE || vovkConfig.route,
    VOVK_FETCHER: process.env.VOVK_FETCHER || vovkConfig.fetcher,
    VOVK_PREFIX: process.env.VOVK_PREFIX || vovkConfig.prefix,
    VOVK_VALIDATE_ON_CLIENT: process.env.VOVK_VALIDATE_ON_CLIENT || vovkConfig.validateOnClient,
    VOVK_MODULES_DIR: process.env.VOVK_WATCH_DIR || vovkConfig.modulesDir,
    __VOVK_START_SERVER__: process.env.__VOVK_START_SERVER__ || '',
  };

  return vars;
}

module.exports = getVars;
