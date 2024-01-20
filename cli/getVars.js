// @ts-check

const path = require('path');

/** @type {import('../src').VovkEnv} */
let vars;
/** @type {(rcPath: string, options?: { warn?: boolean; VOVK_CLIENT_OUT?: string; }) => import('../src').VovkEnv} */
function getVars(rcPath, options = {}) {
  if (vars) return vars;
  /** @type {Required<import('../src').VovkRc>} */
  const vovkRc = {
    out: './node_modules/.vovk',
    route: './src/app/api/[[...slug]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    prefix: '/api',
    validateOnClient: '',
  };

  try {
    Object.assign(vovkRc, require(rcPath));
  } catch {
    if (options.warn) console.info(` 🐺 No .vovkrc.js file found in ${rcPath}`);
  }

  vars = {
    VOVK_CLIENT_OUT:
      process.env.VOVK_CLIENT_OUT ||
      (options.VOVK_CLIENT_OUT?.startsWith('/')
        ? options.VOVK_CLIENT_OUT
        : options.VOVK_CLIENT_OUT
          ? path.join(process.cwd(), options.VOVK_CLIENT_OUT)
          : null) ||
      vovkRc.out,
    VOVK_PORT: process.env.VOVK_PORT || '3420',
    VOVK_ROUTE: process.env.VOVK_ROUTE || vovkRc.route,
    VOVK_FETCHER: process.env.VOVK_FETCHER || vovkRc.fetcher,
    VOVK_PREFIX: process.env.VOVK_PREFIX || vovkRc.prefix,
    VOVK_VALIDATE_ON_CLIENT: process.env.VOVK_VALIDATE_ON_CLIENT || vovkRc.validateOnClient,
  };

  return vars;
}

module.exports = getVars;
