import getConfig from './lib/getConfig';
import path from 'path';
import { VovkEnv, VovkConfig } from './types';

/**
 * Get environment variables for Vovk
 * @deprecated
 * @param { { VOVK_CLIENT_OUT?: string; PORT?: string; } } options
 * @returns { Promise<Required<VovkEnv>> }
 */
async function getVars(options: { VOVK_CLIENT_OUT?: string; PORT?: string } = {}): Promise<Required<VovkEnv>> {
  const vovkConfig: Required<VovkConfig> = {
    clientOut: './node_modules/.vovk',
    metadataOut: './.vovk.json',
    route: './src/app/api/[[...vovk]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    prefix: '/api',
    validateOnClient: '',
    modulesDir: './src/modules',
  };

  // Make PORT available to the config file
  process.env.PORT = options.PORT || process.env.PORT || '3000';
  Object.assign(vovkConfig, await getConfig());

  const OUT = process.env.VOVK_CLIENT_OUT || options.VOVK_CLIENT_OUT || vovkConfig.clientOut;
  const METADATA_OUT = process.env.VOVK_METADATA_OUT || vovkConfig.metadataOut;
  const PORT = options.PORT || process.env.PORT || '3000';
  const VOVK_ROUTE = process.env.VOVK_ROUTE || vovkConfig.route;
  const VOVK_MODULES_DIR = process.env.VOVK_MODULES_DIR || vovkConfig.modulesDir;
  const VALIDATE_ON_CLIENT = process.env.VOVK_VALIDATE_ON_CLIENT || vovkConfig.validateOnClient || '';

  const vars: Required<VovkEnv> = {
    PORT,
    VOVK_CLIENT_OUT: OUT.startsWith('/') ? OUT : path.join(process.cwd(), OUT),
    VOVK_METADATA_OUT: METADATA_OUT.startsWith('/') ? METADATA_OUT : path.join(process.cwd(), METADATA_OUT),
    VOVK_PORT: process.env.VOVK_PORT || (parseInt(PORT) + 6969).toString(),
    VOVK_ROUTE: VOVK_ROUTE.startsWith('/') ? VOVK_ROUTE : path.join(process.cwd(), VOVK_ROUTE),
    VOVK_FETCHER: process.env.VOVK_FETCHER || vovkConfig.fetcher,
    VOVK_PREFIX: process.env.VOVK_PREFIX || vovkConfig.prefix,
    VOVK_VALIDATE_ON_CLIENT: VALIDATE_ON_CLIENT.startsWith('/')
      ? VALIDATE_ON_CLIENT
      : VALIDATE_ON_CLIENT.startsWith('./')
        ? path.join(process.cwd(), VALIDATE_ON_CLIENT)
        : VALIDATE_ON_CLIENT,
    VOVK_MODULES_DIR: VOVK_MODULES_DIR.startsWith('/') ? VOVK_MODULES_DIR : path.join(process.cwd(), VOVK_MODULES_DIR),
    __VOVK_START_SERVER__: process.env.__VOVK_START_SERVER__ || '',
  };

  return vars;
}

export default getVars;
