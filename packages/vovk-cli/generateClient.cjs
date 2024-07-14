// @ts-check
const fs = require('fs/promises');
const path = require('path');
const getReturnPath = require('./lib/getReturnPath.cjs');

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
 * @type {(env: Required<import('.').VovkEnv>) => Promise<{ written: boolean; path: string }>}
 */
async function generateClient({ ...env }) {
  const cwd = process.cwd() + path.sep;
  const outDir = env.VOVK_CLIENT_OUT;
  const returnDir = getReturnPath(outDir, cwd);
  const jsonPath = env.VOVK_METADATA_OUT;
  const localJsonPath = path.join(returnDir, jsonPath.replace(cwd, ''));
  const fetcherPath = env.VOVK_FETCHER.startsWith('.') ? path.join(returnDir, env.VOVK_FETCHER) : env.VOVK_FETCHER;
  const routFile = env.VOVK_ROUTE.replace(cwd, '');
  const controllersPath = path.join(returnDir, routFile).replace(/\.ts$/, '');

  if (!env.VOVK_VALIDATE_ON_CLIENT) {
    env.VOVK_VALIDATE_ON_CLIENT = canRequire('vovk-client-validate-ajv') ? 'vovk-client-validate-ajv' : '';
  }
  const validatePath = env.VOVK_VALIDATE_ON_CLIENT.startsWith('.')
    ? path.join(returnDir, env.VOVK_VALIDATE_ON_CLIENT)
    : env.VOVK_VALIDATE_ON_CLIENT;

  const localValidatePath = validatePath;

  if (env.VOVK_VALIDATE_ON_CLIENT && !canRequire(localValidatePath)) {
    throw new Error(
      `Unble to generate Vovk Client: cannot find "validateOnClient" module '${env.VOVK_VALIDATE_ON_CLIENT}'. Check your vovk.config.js file`
    );
  }

  if (!canRequire(path.join(outDir, localJsonPath))) {
    throw new Error(
      `Unble to generate Vovk Client: cannot find metadata file '${jsonPath}'. Local path: ${localJsonPath}.`
    );
  }

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
const metadata = require('${localJsonPath}');
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
import metadata from '${localJsonPath}';
${validatePath ? `import validateOnClient from '${validatePath}';\n` : '\nconst validateOnClient = undefined;'}
const prefix = '${env.VOVK_PREFIX ?? '/api'}';
type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
`;
  const metadataJson = await fs.readFile(path.join(outDir, localJsonPath), 'utf-8').catch(() => null);

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

module.exports = generateClient;
