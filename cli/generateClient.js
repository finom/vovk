const fs = require('fs/promises');
const path = require('path');
const getVovkrc = require('./getVovkrc');

function canRequire(moduleName) {
  try {
    require.resolve(moduleName);
    return true; // The module exists and can be required
  } catch (e) {
    return false; // The module does not exist
  }
}

/**
 * Generates client code with string concatenation so it should be much faster than using AST
 * TODO: Check fetcher and streamFetcher for existence
 * @type {(rcPath: string) => Promise<boolean>}
 */
async function generateClient(rcPath) {
  const vovkrc = getVovkrc(rcPath);
  const jsonPath = '../../.vovk.json';
  const localJsonPath = path.join('..', jsonPath);
  const fetcherPath = vovkrc.fetcher.startsWith('.') ? path.join('../..', vovkrc.fetcher) : vovkrc.fetcher;

  const streamFetcherPath = vovkrc.streamFetcher.startsWith('.')
    ? path.join('../..', vovkrc.streamFetcher)
    : vovkrc.streamFetcher;
  const validatePath = vovkrc.validateOnClient?.startsWith('.')
    ? path.join(__dirname, '../..', vovkrc.validateOnClient)
    : vovkrc.validateOnClient;
  const localValidatePath = vovkrc.validateOnClient?.startsWith('.') ? path.join('..', validatePath) : validatePath;

  if (typeof vovkrc.validateOnClient === 'undefined') {
    vovkrc.validateOnClient = canRequire('vovk-zod/zodValidateOnClient') ? 'vovk-zod/zodValidateOnClient' : null;
  } else if (vovkrc.validateOnClient && !canRequire(localValidatePath)) {
    throw new Error(
      `Unble to generate Vovk Client: cannot find "validateOnClient" module '${vovkrc.validateOnClient}'. Check your .vovkrc.js file`
    );
  }

  if (!canRequire(localJsonPath)) {
    throw new Error(`Unble to generate Vovk Client: cannot find ".vovk.json" file '${jsonPath}'.`);
  }

  const controllersPath = path.join('../..', vovkrc.route).replace(/\.ts$/, '');
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
const prefix = '${vovkrc.prefix ?? '/api'}';
const { default: validateOnClient = null } = ${
    vovkrc.validateOnClient ? `require('${vovkrc.validateOnClient}')` : '{}'
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

  js += `
if(typeof window !== 'undefined') fetch(prefix + '/__ping', { method: 'POST' });
  `;

  const jsPath = path.join(__dirname, '../../.vovk/index.js');
  const tsPath = path.join(__dirname, '../../.vovk/index.d.ts');
  await fs.mkdir('../../.vovk', { recursive: true });
  const existingJs = await fs.readFile(jsPath, 'utf-8').catch(() => '');
  const existingTs = await fs.readFile(tsPath, 'utf-8').catch(() => '');
  if (existingJs === js && existingTs === ts) return false;
  await fs.writeFile(tsPath, ts);
  await fs.writeFile(jsPath, js);

  return true;
}

module.exports = generateClient;
