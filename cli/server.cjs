// @ts-check
const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const generateClient = require('./generateClient.cjs');
const getVars = require('./getVars.cjs');
const isEqual = require('./lib/isEqual.cjs');
const compareKeys = require('./lib/compareKeys.cjs');

const metadataPath = path.join(__dirname, '../../../.vovk.json');

/** @type {(metadata: import('../src').VovkMetadata) => Promise<{ written: boolean; path: string; diff?:  { controllers: { addedKeys: string[]; removedKeys: string[]; }; workers: { addedKeys: string[]; removedKeys: string[]; }; }; }>} */
const writeMetadata = async (metadata) => {
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  const existingMetadataStr = await fs.readFile(metadataPath, 'utf-8').catch(() => 'null');
  /** @type {import('../src').VovkMetadata} */
  const existingMetadata = JSON.parse(existingMetadataStr);
  if (isEqual(existingMetadata, metadata)) {
    return { written: false, path: metadataPath };
  }
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  return {
    written: true,
    path: metadataPath,
    diff: {
      controllers: compareKeys(existingMetadata, metadata),
      workers: compareKeys(existingMetadata.workers ?? {}, metadata.workers ?? {}),
    },
  };
};

const writeEmptyMetadata = async () => {
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  const existingMetadata = await fs.readFile(metadataPath, 'utf-8').catch(() => null);
  if (!existingMetadata) await fs.writeFile(metadataPath, '{}');
};

/** @type {(diff: { addedKeys: string[]; removedKeys: string[]; constantName: string; }) => void} */
const showDiff = ({ addedKeys, removedKeys, constantName }) => {
  if (!addedKeys.length && !removedKeys.length) return;
  const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    reset: '\x1b[0m',
  };

  console.info(` const ${constantName} = {`);
  console.info('   // ...');
  // Print added keys in green
  addedKeys.forEach((key) => {
    console.info(`   ${colors.green}+ ${key},${colors.reset}`);
  });

  // Print removed keys in red
  removedKeys.forEach((key) => {
    console.info(`   ${colors.red}- ${key},${colors.reset}`);
  });

  console.info(' };');
};

let is404Reported = false;

/** @type {() => Promise<void>} */
const pingNoDebounce = async () => {
  const env = await getVars();
  let prefix = env.VOVK_PREFIX;
  prefix = prefix.startsWith('http://')
    ? prefix
    : `http://localhost:${env.PORT}/${prefix.startsWith('/') ? prefix.slice(1) : prefix}`;
  const endpoint = `${prefix.endsWith('/') ? prefix.slice(0, -1) : prefix}/__ping`;
  const req = http.get(endpoint, (resp) => {
    if (!is404Reported && resp.statusCode === 404) {
      console.info(
        ` 🐺 🟡 Vovk Metadata Server is running fine but it seems like the wildcard route file is not created yet. See https://docs.vovk.dev/docs/intro for more information.`
      );
      is404Reported = true;
    }
  });

  req.on('error', (err) => {
    console.error(`🐺 ❌ Error during HTTP request made to ${endpoint}:`, err.message);
  });
};

/** @type {NodeJS.Timeout} */
let timer;
/** @type {() => void} */
const ping = () => {
  clearTimeout(timer);
  timer = setTimeout(() => void pingNoDebounce(), 1000);
};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/__metadata') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    req.on('end', async () => {
      try {
        /** @type {{ metadata: import('../src').VovkMetadata }} */
        const { metadata } = JSON.parse(body);
        const metadataWritten = metadata ? await writeMetadata(metadata) : { written: false, path: metadataPath };
        const env = await getVars();
        const codeWritten = await generateClient(env);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('JSON data received and file created');
        if (metadataWritten.written) {
          console.info(` 🐺 JSON metadata updated in ${metadataWritten.path}`);
        }

        if (codeWritten.written) {
          const { diff } = metadataWritten;

          if (diff) {
            showDiff({
              addedKeys: diff.controllers.addedKeys,
              removedKeys: diff.controllers.removedKeys,
              constantName: 'controllers',
            });
            showDiff({
              addedKeys: diff.workers.addedKeys,
              removedKeys: diff.workers.removedKeys,
              constantName: 'workers',
            });
            console.info(
              ` 🐺 Client generated in ${codeWritten.path}. Don't forget to restart TypeScript server in your code editor if needed.`
            );
          } else {
            console.info(` 🐺 Client generated in ${codeWritten.path}.`);
          }
        }
      } catch (e) {
        const err = /** @type {Error} */ (e);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(err?.message ?? 'Error');
        console.error(' 🐺 ❌ ' + err?.message);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

/** @type {(env: import('../src').VovkEnv) => Promise<void>} */
async function startVovkServer({ VOVK_PORT, VOVK_WATCH_DIR }) {
  if (!VOVK_PORT) {
    console.error(' 🐺 Unable to run Vovk Metadata Server: no port specified');
    process.exit(1);
  }
  server.listen(VOVK_PORT, () => {
    console.info(` 🐺 Vovk Metadata Server is running on port ${VOVK_PORT} watching directory ${VOVK_WATCH_DIR}`);
  });

  void writeEmptyMetadata();

  // due to changes at Next.js 14.2.0 we get too many logs, therefore the interval should be changed to fs.watch
  // Old approach: setInterval(() => void ping(), 1000 * 3);

  const srcRoot = path.join(__dirname, '../../..', VOVK_WATCH_DIR ?? './src');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const info of fs.watch(srcRoot, { recursive: true })) {
    if (info.filename) {
      const filename = path.join(srcRoot, info.filename);
      try {
        const stats = await fs.lstat(filename);
        if (stats.isFile()) {
          const fileContent = await fs.readFile(filename, 'utf-8');
          const importRegex = /import\s*{[^}]*\b(get|post|put|del|head|options)\b[^}]*}\s*from\s*['"]vovk['"]/;
          if (importRegex.test(fileContent)) void ping();
        }
      } catch (error) {
        console.error(' 🐺 Error reading file:', error);
      }
    }
  }
}

if (process.env.__VOVK_START_SERVER__) {
  void getVars().then(startVovkServer);
}

module.exports = { startVovkServer };
