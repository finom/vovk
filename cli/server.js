// @ts-check
const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const parseCommandLineArgs = require('./lib/parseCommandLineArgs');
const generateClient = require('./generateClient');
const getVars = require('./getVars');
const isEqual = require('./lib/isEqual');

const { flags } = parseCommandLineArgs();

const { config } = /** @type {{ config: string }} */ (flags);

const metadataPath = path.join(__dirname, '../../../.vovk.json');

/** @type {(metadata: object) => Promise<{ written: boolean; path: string }>} */
const writeMetadata = async (metadata) => {
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  const existingMetadata = await fs.readFile(metadataPath, 'utf-8').catch(() => 'null');
  if (isEqual(JSON.parse(existingMetadata), metadata)) return { written: false, path: metadataPath };
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  return { written: true, path: metadataPath };
};

const writeEmptyMetadata = async () => {
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  const existingMetadata = await fs.readFile(metadataPath, 'utf-8').catch(() => null);
  if (!existingMetadata) await fs.writeFile(metadataPath, '{}');
};

void writeEmptyMetadata();

/** @type {NodeJS.Timeout} */
let pingInterval;

/** @type {import('../src').VovkEnv} */
let vars;

/** @type {() => void} */
const ping = () => {
  vars = vars ?? getVars(config);
  let prefix = vars.VOVK_PREFIX;
  prefix = prefix.startsWith('http://')
    ? prefix
    : `http://localhost:${process.env.PORT}/${prefix.startsWith('/') ? prefix.slice(1) : prefix}`;
  const endpoint = `${prefix.endsWith('/') ? prefix.slice(0, -1) : prefix}/__ping`;
  // Create the HTTP GET request
  const req = http.get(endpoint, () => {
    // noop
  });

  // Error handling for the request
  req.on('error', (err) => {
    console.error(`🐺 ❌ Error during HTTP request made to ${endpoint}:`, err.message);
  });
};

// make initial ping
setTimeout(ping, 1000 * 3);

/** @type {() => void} */
const constantlyPing = () => {
  clearInterval(pingInterval);
  pingInterval = setInterval(ping, 1000 * 3);
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
        /** @type {{ metadata?: import('../src') }} */
        const { metadata } = JSON.parse(body); // Parse the JSON data
        const metadataWritten = metadata ? await writeMetadata(metadata) : { written: false, path: metadataPath };
        vars = vars ?? getVars(config);
        const codeWritten = await generateClient(vars);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('JSON data received and file created');
        if (metadataWritten.written) {
          console.info(` 🐺 JSON metadata updated in ${metadataWritten.path}`);
        }

        if (codeWritten.written) {
          console.info(` 🐺 Client generated in ${codeWritten.path}`);
        }

        constantlyPing();
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

const VOVK_PORT = process.env.VOVK_PORT;
if (!VOVK_PORT) {
  console.error(' 🐺 Unable to run Vovk Metadata Server: no port specified');
  process.exit(1);
}
server.listen(VOVK_PORT, () => {
  console.info(` 🐺 Vovk Metadata Server is running on port ${VOVK_PORT}`);
});
