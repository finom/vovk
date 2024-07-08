// @ts-check
const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const generateClient = require('./generateClient.cjs');
const getVars = require('./getVars.cjs');
const isEqual = require('./lib/isEqual.cjs');
const compareKeys = require('./lib/compareKeys.cjs');

/** @type {(metadata: import('../vovk').VovkMetadata) => Promise<{ written: boolean; path: string; diff?:  { controllers: { addedKeys: string[]; removedKeys: string[]; }; workers: { addedKeys: string[]; removedKeys: string[]; }; }; }>} */
const writeMetadata = async (metadata) => {
  const { VOVK_METADATA_OUT } = await getVars();
  await fs.mkdir(path.dirname(VOVK_METADATA_OUT), { recursive: true });
  const existingMetadataStr = await fs.readFile(VOVK_METADATA_OUT, 'utf-8').catch(() => 'null');
  /** @type {import('../vovk').VovkMetadata} */
  const existingMetadata = JSON.parse(existingMetadataStr);
  if (isEqual(existingMetadata, metadata)) {
    return { written: false, path: VOVK_METADATA_OUT };
  }
  await fs.writeFile(VOVK_METADATA_OUT, JSON.stringify(metadata, null, 2));

  return {
    written: true,
    path: VOVK_METADATA_OUT,
    diff: {
      controllers: compareKeys(existingMetadata, metadata),
      workers: compareKeys(existingMetadata.workers ?? {}, metadata.workers ?? {}),
    },
  };
};

const writeEmptyMetadata = async () => {
  const { VOVK_METADATA_OUT } = await getVars();
  await fs.mkdir(path.dirname(VOVK_METADATA_OUT), { recursive: true });
  const existingMetadata = await fs.readFile(VOVK_METADATA_OUT, 'utf-8').catch(() => null);
  if (!existingMetadata) await fs.writeFile(VOVK_METADATA_OUT, '{}');
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
  const endpoint = `${prefix.endsWith('/') ? prefix.slice(0, -1) : prefix}/_vovk-ping_`;
  const req = http.get(endpoint, (resp) => {
    if (!is404Reported && resp.statusCode === 404) {
      console.info(
        ` 🐺 🟡 Vovk Metadata Server is running fine but it seems like the wildcard route file is not created yet. See https://vovk.dev/getting-started for more information.`
      );
      is404Reported = true;
    }
  });

  req.on('error', (err) => {
    console.error(` 🐺 ❌ Error during HTTP request made to ${endpoint}:`, err.message);
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
        /** @type {{ metadata: import('../vovk').VovkMetadata }} */
        const { metadata } = JSON.parse(body);
        const env = await getVars();
        const metadataWritten = metadata
          ? await writeMetadata(metadata)
          : { written: false, path: env.VOVK_METADATA_OUT };
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

/** @type {(filename: string) => Promise<void>} */
async function handleFileChange(filename) {
  try {
    const stats = await fs.lstat(filename);
    if (stats.isFile()) {
      const fileContent = await fs.readFile(filename, 'utf-8');
      const importRegex =
        /import\s*{[^}]*\b(initVovk|get|post|put|del|head|options|worker)\b[^}]*}\s*from\s*['"]vovk['"]/;
      if (importRegex.test(fileContent)) ping();
    }
  } catch {
    // ignore
  }
}

/** @type {(srcRoot: string) => Promise<void>} */
async function watchControllers(srcRoot) {
  for await (const info of fs.watch(srcRoot, { recursive: true })) {
    if (info.filename && (info.filename.endsWith('.ts') || info.filename.endsWith('.tsx'))) {
      const filename = path.join(srcRoot, info.filename);
      await handleFileChange(filename);
    }
  }
}

/** @type {(routePath: string) => Promise<void>} */
async function watchRouteFile(routePath) {
  for await (const info of fs.watch(routePath)) {
    if (info.filename) {
      await handleFileChange(routePath);
    }
  }
}

/** @type {(env: Required<import('.').VovkEnv>) => void} */
function startVovkServer({ VOVK_PORT, VOVK_MODULES_DIR, VOVK_ROUTE }) {
  if (!VOVK_PORT) {
    console.error(' 🐺 Unable to run Vovk Metadata Server: no port specified');
    process.exit(1);
  }
  server.listen(VOVK_PORT, () => {
    console.info(
      ` 🐺 Vovk Metadata Server is running on port ${VOVK_PORT}. Watching modules directory at ${VOVK_MODULES_DIR} and route file at ${VOVK_ROUTE}. Happy coding!`
    );
  });

  void writeEmptyMetadata();

  // due to changes at Next.js 14.2.0 we get too many logs, therefore the interval should be changed to fs.watch
  // Old approach: setInterval(() => void ping(), 1000 * 3);

  // initial ping
  setTimeout(ping, 3000);
  void watchControllers(VOVK_MODULES_DIR);
  void watchRouteFile(VOVK_ROUTE);
}

if (process.env.__VOVK_START_SERVER__) {
  void getVars().then(startVovkServer);
}

module.exports = { startVovkServer };
