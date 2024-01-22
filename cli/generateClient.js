// @ts-check
const fs = require('fs/promises');
const path = require('path');
const getReturnPath = require('./lib/getReturnPath');

/** @type {(moduleName: string) => boolean} */
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
 * TODO: Check fetcher for existence
 * @type {(rcPath: import('../src').VovkEnv) => Promise<{ written: boolean; path: string }>}
 */
async function generateClient({ ...env }) {
  const outDir = env.VOVK_CLIENT_OUT;
  const returnDir = getReturnPath(outDir, process.cwd());
  const jsonPath = path.join(returnDir, '.vovk.json');
  const localJsonPath = path.join(process.cwd(), '.vovk.json');
  const fetcherPath = env.VOVK_FETCHER.startsWith('.') ? path.join(returnDir, env.VOVK_FETCHER) : env.VOVK_FETCHER;
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
  let ts = `// auto-generated
/* eslint-disable */
import type { Controllers, Workers } from "${controllersPath}";
import type { clientizeController } from 'vovk/client';
import type { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import type fetcher from '${fetcherPath}';

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
`;
  let js = `// auto-generated
/* eslint-disable */
const { clientizeController } = require('vovk/client');
const { promisifyWorker } = require('vovk/worker');
const metadata = require('${jsonPath}');
const { default: fetcher } = require('${fetcherPath}');
const prefix = '${env.VOVK_PREFIX ?? '/api'}';
const { default: validateOnClient = null } = ${
    env.VOVK_VALIDATE_ON_CLIENT ? `require('${env.VOVK_VALIDATE_ON_CLIENT}')` : '{}'
  };

`;
  const metadataJson = await fs.readFile(localJsonPath, 'utf-8').catch(() => null);

  if (!metadataJson) console.warn(` 🐺 No .vovk.json file found in ${localJsonPath}`);

  const metadata = JSON.parse(metadataJson || '{}');

  for (const key of Object.keys(metadata)) {
    if (key !== 'workers') {
      ts += `export const ${key}: ReturnType<typeof clientizeController<Controllers["${key}"], Options>>;\n`;
      js += `exports.${key} = clientizeController(metadata.${key}, { fetcher, validateOnClient, defaultOptions: { prefix } });\n`;
    }
  }

  for (const key of Object.keys(metadata.workers ?? {})) {
    ts += `export const ${key}: ReturnType<typeof promisifyWorker<Workers["${key}"]>>;\n`;
    js += `exports.${key} = promisifyWorker(null, metadata.workers.${key});\n`;
  }

  /* js += `
    if(typeof window !== 'undefined') fetch(prefix + '/__ping', { method: 'POST' });
  `; */

  const localJsPath = path.join(outDir, 'index.js');
  const localTsPath = path.join(outDir, 'index.d.ts');
  const localEntryPath = path.join(outDir, 'entry.ts');
  const existingJs = await fs.readFile(localJsPath, 'utf-8').catch(() => '');
  const existingTs = await fs.readFile(localTsPath, 'utf-8').catch(() => '');
  if (existingJs === js && existingTs === ts) return { written: false, path: outDir };

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(localJsPath, js);
  await fs.writeFile(localTsPath, ts);
  await fs.writeFile(localEntryPath, `export * from '.';`);

  return { written: true, path: outDir };
}

module.exports = generateClient;
