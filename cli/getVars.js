// @ts-check
const path = require('path');

/** @type {(modulePath: string) => any} */
function requireFresh(modulePath) {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

/** @type {import('../src').VovkEnv} */
/** @type {(rcPath: string, options?: { VOVK_CLIENT_OUT?: string; }) => import('../src').VovkEnv} */
function getVars(configPath, options = {}) {
  /** @type {Required<import('../src').VovkConfig>} */
  const vovkConfig = {
    out: './node_modules/.vovk',
    route: './src/app/api/[[...vovk]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    prefix: '/api',
    validateOnClient: '',
  };

  try {
    Object.assign(vovkConfig, requireFresh(configPath));
  } catch {
    // noop
  }

  const vars = {
    PORT: process.env.PORT || '3000',
    VOVK_CLIENT_OUT:
      process.env.VOVK_CLIENT_OUT ||
      (options.VOVK_CLIENT_OUT?.startsWith('/')
        ? options.VOVK_CLIENT_OUT
        : options.VOVK_CLIENT_OUT
          ? path.join(process.cwd(), options.VOVK_CLIENT_OUT)
          : null) ||
      vovkConfig.out,
    VOVK_PORT: process.env.VOVK_PORT || '3690',
    VOVK_ROUTE: process.env.VOVK_ROUTE || vovkConfig.route,
    VOVK_FETCHER: process.env.VOVK_FETCHER || vovkConfig.fetcher,
    VOVK_PREFIX: process.env.VOVK_PREFIX || vovkConfig.prefix,
    VOVK_VALIDATE_ON_CLIENT: process.env.VOVK_VALIDATE_ON_CLIENT || vovkConfig.validateOnClient,
  };

  return vars;
}

module.exports = getVars;
