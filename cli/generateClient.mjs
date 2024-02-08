// @ts-check
import fs from 'fs/promises';
import path from 'path';
import getReturnPath from './lib/getReturnPath.mjs';

/** @type {(moduleName: string) => Promise<boolean>} */
async function fileExists(filePath) {
  try {
    await fs.stat(filePath);
    return true; // The file exists
  } catch (e) {
    return false; // The file does not exist
  }
}

/**
 * Generates client code with string concatenation so it should be much faster than using AST
 * TODO: Check fetcher for existence
 * @type {(rcPath: import('../src').VovkEnv) => Promise<{ written: boolean; path: string }>}
 */
export default async function generateClient({ ...env }) {
  const outDir = env.VOVK_CLIENT_OUT;
  const returnDir = getReturnPath(outDir, process.cwd());
  const jsonPath = path.join(returnDir, '.vovk.json');
  const localJsonPath = path.join(process.cwd(), '.vovk.json');
  const fetcherPath = env.VOVK_FETCHER.startsWith('.') ? path.join(returnDir, env.VOVK_FETCHER) : env.VOVK_FETCHER;

  if (!env.VOVK_VALIDATE_ON_CLIENT) {
    env.VOVK_VALIDATE_ON_CLIENT = (await fileExists('vovk-zod/zodValidateOnClient'))
      ? 'vovk-zod/zodValidateOnClient'
      : '';
  }
  const validatePath = env.VOVK_VALIDATE_ON_CLIENT.startsWith('.')
    ? path.join(returnDir, env.VOVK_VALIDATE_ON_CLIENT)
    : env.VOVK_VALIDATE_ON_CLIENT;
  const localValidatePath = env.VOVK_VALIDATE_ON_CLIENT.startsWith('.') ? path.join('..', validatePath) : validatePath;

  if (env.VOVK_VALIDATE_ON_CLIENT && !(await fileExists(localValidatePath))) {
    throw new Error(
      `Unble to generate Vovk Client: cannot find "validateOnClient" module '${env.VOVK_VALIDATE_ON_CLIENT}'. Check your vovk.config.js file`
    );
  }

  if (!(await fileExists(localJsonPath))) {
    throw new Error(
      `Unble to generate Vovk Client: cannot find ".vovk.json" file '${localJsonPath}' (original value '${jsonPath}').`
    );
  }

  const controllersPath = path.join(returnDir, env.VOVK_ROUTE).replace(/\.ts$/, '');
  let dts = `// auto-generated
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
const { default: validateOnClient = null } = ${validatePath ? `require('${validatePath}')` : '{}'};

`;
  let ts = `// auto-generated
/* eslint-disable */
import type { Controllers, Workers } from "${controllersPath}";
import { clientizeController } from 'vovk/client';
import { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import fetcher from '${fetcherPath}';
import metadata from '${jsonPath}';
${validatePath ? `import validateOnClient from '${validatePath}';\n` : '\nconst validateOnClient = undefined;'}
const prefix = '${env.VOVK_PREFIX ?? '/api'}';
type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
`;
  const metadataJson = await fs.readFile(localJsonPath, 'utf-8').catch(() => null);

  if (!metadataJson) console.warn(` 🐺 No .vovk.json file found in ${localJsonPath}`);

  const metadata = JSON.parse(metadataJson || '{}');

  for (const key of Object.keys(metadata)) {
    if (key !== 'workers') {
      dts += `export const ${key}: ReturnType<typeof clientizeController<Controllers["${key}"], Options>>;\n`;
      js += `exports.${key} = clientizeController(metadata.${key}, { fetcher, validateOnClient, defaultOptions: { prefix } });\n`;
      ts += `export const ${key} = clientizeController<Controllers["${key}"], Options>(metadata.${key}, { fetcher, validateOnClient, defaultOptions: { prefix } });\n`;
    }
  }

  for (const key of Object.keys(metadata.workers ?? {})) {
    dts += `export const ${key}: ReturnType<typeof promisifyWorker<Workers["${key}"]>>;\n`;
    js += `exports.${key} = promisifyWorker(null, metadata.workers.${key});\n`;
    ts += `export const ${key} = promisifyWorker<Workers["${key}"]>(null, metadata.workers.${key});\n`;
  }

  /* js += `
    if(typeof window !== 'undefined') fetch(prefix + '/__ping', { method: 'POST' });
  `; */

  const localJsPath = path.join(outDir, 'client.js');
  const localDtsPath = path.join(outDir, 'client.d.ts');
  const localTsPath = path.join(outDir, 'index.ts');
  const existingJs = await fs.readFile(localJsPath, 'utf-8').catch(() => '');
  const existingDts = await fs.readFile(localDtsPath, 'utf-8').catch(() => '');
  const existingTs = await fs.readFile(localTsPath, 'utf-8').catch(() => '');

  if (existingJs === js && existingDts === dts && existingTs === ts) return { written: false, path: outDir };

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(localJsPath, js);
  await fs.writeFile(localDtsPath, dts);
  await fs.writeFile(localTsPath, ts);

  return { written: true, path: outDir };
}
