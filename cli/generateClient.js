const fs = require('fs/promises');
const path = require('path');
const getVovkrc = require('./getVovkrc');
/**
 * Generates client code with string concatenation so it should be super fast
 * @type {(rcPath: string) => Promise<void>}
 */
async function generateClient(rcPath) {
  const vovkrc = getVovkrc(rcPath);

  const fetcherPath = vovkrc.fetcher.startsWith('.') ? path.join(process.cwd(), vovkrc.fetcher) : vovkrc.fetcher;
  const streamFetcherPath = vovkrc.streamFetcher.startsWith('.')
    ? path.join(process.cwd(), vovkrc.streamFetcher)
    : vovkrc.streamFetcher;

  const controllersPath = path.join('..', vovkrc.route).replace(/\.ts$/, '');
  let ts = `import type { Controllers } from "${controllersPath}";
import type { clientizeController } from 'vovk/client';
import type { promisifyWorker } from 'vovk/worker';
import type { VovkFetcherOptions } from 'vovk/client';
import type fetcher from '${fetcherPath}';

type Options = typeof fetcher extends VovkFetcherOptions<infer U> ? U : never;
`;
  let js = `const { clientizeController } = require('vovk/client');
const { promisifyWorker } = require('vovk/worker');
const metadata = require('./vovk-metadata.json');
const fetcher = require('${fetcherPath}');
const streamFetcher = require('${streamFetcherPath}');
const prefix = '${vovkrc.prefix ?? '/api'}';
const validateOnClient = ${vovkrc.validateOnClient ? `require('${vovkrc.validateOnClient}')` : 'null'};

`;
  const metadataJson = await fs
    .readFile(path.join(__dirname, '../../.vovk/vovk-metadata.json'), 'utf-8')
    .catch(() => null);
  const metadata = JSON.parse(metadataJson || '{}');

  for (const key of Object.keys(metadata)) {
    if (key !== 'workers') {
      ts += `export type ${key} = ReturnType<typeof clientizeController<Controllers["${key}"], Options>>;\n`;
      js += `exports.${key} = clientizeController(metadata.${key}, { fetcher, streamFetcher, validateOnClient, defaultOptions: { prefix } });\n`;
    }
  }

  /* for(const key of Object.keys(metadata.workers ?? {})) {
    code += `export const ${key} = promisifyWorker<${key}>(metadata.workers.${key});\n`;
} */
  await fs.mkdir('../../.vovk');
  await fs.writeFile(path.join(__dirname, '../../.vovk/index.d.ts'), ts);
  await fs.writeFile(path.join(__dirname, '../../.vovk/index.js'), js);
}

module.exports = generateClient;
