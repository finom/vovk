// @ts-check

let vars;
/** @type {(rcPath: string) => import('../src').VovkEnv} */
function getVars(rcPath) {
  if (vars) return vars;
  /** @type {Required<import('../src').VovkRc>} */
  const vovkRc = {
    route: 'src/app/api/[[...]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    streamFetcher: 'vovk/client/defaultStreamFetcher',
    prefix: '/api',
    validateOnClient: '',
  };

  try {
    Object.assign(vovkRc, require(rcPath));
  } catch {
    console.info(` 🐺 No .vovkrc.js file found in ${rcPath}`);
  }

  vars = {
    VOVK_PORT: process.env.VOVK_PORT || '3420',
    VOVK_ROUTE: process.env.VOVK_ROUTE || vovkRc.route,
    VOVK_FETCHER: process.env.VOVK_FETCHER || vovkRc.fetcher,
    VOVK_STREAM_FETCHER: process.env.VOVK_STREAM_FETCHER || vovkRc.streamFetcher,
    VOVK_PREFIX: process.env.VOVK_PREFIX || vovkRc.prefix,
    VOVK_VALIDATE_ON_CLIENT: process.env.VOVK_VALIDATE_ON_CLIENT || vovkRc.validateOnClient,
  };

  return vars;
}

module.exports = getVars;
