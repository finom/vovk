// @ts-check

import path from 'path';

/** @type {import('../src').VovkEnv} */
let vars;
/** @type {(rcPath: string, options?: { VOVK_CLIENT_OUT?: string; PORT?: string; }) => Promise<import('../src').VovkEnv>} */
export default async function getVars(configPath, options = {}) {
  if (vars) return vars;
  /** @type {Required<import('../src').VovkConfig>} */
  const vovkConfig = {
    out: './node_modules/.vovk',
    route: './src/app/api/[[...vovk]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    prefix: '/api',
    validateOnClient: '',
  };

  try {
    // make PORT available to the config file
    process.env.PORT = options.PORT || process.env.PORT || '3000';
    Object.assign(vovkConfig, await import(configPath));
    console.info('🐺 Vovk config loaded from', configPath);
  } catch {
    console.info(`🐺 No vovk.config.js found at path '${configPath}', using defaults`);
  }

  vars = {
    PORT: options.PORT || process.env.PORT || '3000',
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
