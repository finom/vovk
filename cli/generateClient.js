// @ts-check
const fs = require('fs/promises');
const path = require('path');
const canRequire = require('./lib/canRequire');
const getReturnPath = require('./lib/getReturnPath');

/**
 * Generates client code with string concatenation so it should be much faster than using AST
 * TODO: Check fetcher and streamFetcher for existence
 * @type {(rcPath: import('../src').VovkEnv) => Promise<boolean>}
 */
async function generateClient({ ...env }) {
  const outDir = path.join(__dirname, '../..', env.VOVK_CLIENT_OUT);
  const returnDir = getReturnPath(outDir, path.join(__dirname, '../..'));
  const jsonPath = path.join(returnDir, '.vovk.json');
  const localJsonPath = path.join('..', jsonPath);
  const fetcherPath = env.VOVK_FETCHER.startsWith('.') ? path.join(returnDir, env.VOVK_FETCHER) : env.VOVK_FETCHER;

  const streamFetcherPath = env.VOVK_STREAM_FETCHER.startsWith('.')
    ? path.join(returnDir, env.VOVK_STREAM_FETCHER)
    : env.VOVK_STREAM_FETCHER;
  const validatePath = env.VOVK_VALIDATE_ON_CLIENT.startsWith('.')
    ? path.join(returnDir, env.VOVK_VALIDATE_ON_CLIENT)
    : env.VOVK_VALIDATE_ON_CLIENT;
  const localValidatePath = env.VOVK_VALIDATE_ON_CLIENT.startsWith('.') ? path.join('..', validatePath) : validatePath;

  if (!env.VOVK_VALIDATE_ON_CLIENT) {
    env.VOVK_VALIDATE_ON_CLIENT = canRequire('vovk-zod/zodValidateOnClient') ? 'vovk-zod/zodValidateOnClient' : '';
  } else if (env.VOVK_VALIDATE_ON_CLIENT && !canRequire(localValidatePath)) {
    throw new Error(
      `Unble to generate Vovk Client: cannot find "validateOnClient" module '${env.VOVK_VALIDATE_ON_CLIENT}'. Check your .vovkrc.js file`
    );
  }

  if (!canRequire(localJsonPath)) {
    throw new Error(`Unble to generate Vovk Client: cannot find ".vovk.json" file '${jsonPath}'.`);
  }

  const controllersPath = path.join(returnDir, env.VOVK_ROUTE).replace(/\.ts$/, '');
  let ts = `/* auto-generated */
import type { Controllers, Workers } from "${controllersPath}";
import type { clientizeController } from 'vovk/client';
import type { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import type fetcher from '${fetcherPath}';

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
`;
  let js = `/* auto-generated */
const { clientizeController } = require('vovk/client');
const { promisifyWorker } = require('vovk/worker');
const metadata = require('${jsonPath}');
const { default: fetcher } = require('${fetcherPath}');
const { default: streamFetcher } = require('${streamFetcherPath}');
const prefix = '${env.VOVK_PREFIX ?? '/api'}';
const { default: validateOnClient = null } = ${
    env.VOVK_VALIDATE_ON_CLIENT ? `require('${env.VOVK_VALIDATE_ON_CLIENT}')` : '{}'
  };

`;
  const metadataJson = await fs.readFile(path.join(__dirname, localJsonPath), 'utf-8').catch(() => null);
  const metadata = JSON.parse(metadataJson || '{}');

  for (const key of Object.keys(metadata)) {
    if (key !== 'workers') {
      ts += `export const ${key}: ReturnType<typeof clientizeController<Controllers["${key}"], Options>>;\n`;
      js += `exports.${key} = clientizeController(metadata.${key}, { fetcher, streamFetcher, validateOnClient, defaultOptions: { prefix } });\n`;
    }
  }

  for (const key of Object.keys(metadata.workers ?? {})) {
    ts += `export const ${key}: ReturnType<typeof promisifyWorker<Workers["${key}"]>>;\n`;
    js += `exports.${key} = promisifyWorker(null, metadata.workers.${key});\n`;
  }

  /* js += `
    if(typeof window !== 'undefined') fetch(prefix + '/__ping', { method: 'POST' });
  `; */

  const jsPath = path.join(__dirname, returnDir, env.VOVK_CLIENT_OUT, 'index.js');
  const tsPath = path.join(__dirname, returnDir, env.VOVK_CLIENT_OUT, 'index.d.ts');
  const existingJs = await fs.readFile(jsPath, 'utf-8').catch(() => '');
  const existingTs = await fs.readFile(tsPath, 'utf-8').catch(() => '');
  if (existingJs === js && existingTs === ts) return false;
  await fs.mkdir(path.join(__dirname, returnDir, env.VOVK_CLIENT_OUT), { recursive: true });
  await fs.writeFile(tsPath, ts);
  await fs.writeFile(jsPath, js);

  return true;
}

module.exports = generateClient;
