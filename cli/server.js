// @ts-check
const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const generateClient = require('./generateClient');
const getVars = require('./getVars');
const isEqual = require('./lib/isEqual');

/** @type {{ once?: boolean; config: string }} */
// @ts-expect-error yargs
const argv = yargs(hideBin(process.argv)).argv;

const once = argv.once ?? false;

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

let vars;

/** @type {(port: string) => void} */
const startPinging = (PORT) => {
  clearInterval(pingInterval);
  pingInterval = setInterval(() => {
    process.env.PORT = PORT;
    vars = vars ?? getVars(argv.config);
    let prefix = vars.VOVK_PREFIX;
    prefix = prefix.startsWith('http://')
      ? prefix
      : `http://localhost:${PORT}/${prefix.startsWith('/') ? prefix.slice(1) : prefix}`;
    const endpoint = `${prefix.endsWith('/') ? prefix.slice(0, -1) : prefix}/__ping`;
    // Create the HTTP GET request
    const req = http.get(endpoint, () => {
      // noop
    });

    // Error handling for the request
    req.on('error', (err) => {
      console.error(`🐺 ❌ Error during HTTP request made to ${endpoint}:`, err.message);
    });
  }, 1000 * 3);
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
        /** @type {{ metadata: object; PORT: string }} */
        const { metadata, PORT } = JSON.parse(body); // Parse the JSON data
        const metadataWritten = metadata ? await writeMetadata(metadata) : { written: false, path: metadataPath };
        process.env.PORT = PORT;
        vars = vars ?? getVars(argv.config);
        const codeWritten = await generateClient(vars);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('JSON data received and file created');
        if (metadataWritten.written) {
          console.info(` 🐺 JSON metadata updated in ${metadataWritten.path}`);
        }

        if (codeWritten.written) {
          console.info(` 🐺 Client generated in ${codeWritten.path}`);
        }

        if (PORT && !once) {
          startPinging(PORT);
        }

        if (once && metadata) server.close();
      } catch (e) {
        const err = /** @type {Error} */ (e);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(err?.message ?? 'Error');
        console.error(' 🐺 ❌ ' + err?.message);

        if (once) server.close();
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
