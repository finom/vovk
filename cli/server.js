// @ts-check
const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const generateClient = require('./generateClient');
const getVovkrc = require('./getVovkrc');

/** @type {{ once?: boolean; rc: string }} */
// @ts-expect-error yargs
const argv = yargs(hideBin(process.argv)).argv;

const once = argv.once ?? false;

const isEqual = (obj1, obj2) => {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

const writeMetadata = async (metadataPath, metadata) => {
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  const existingMetadata = await fs.readFile(metadataPath, 'utf-8').catch(() => '{}');
  if (isEqual(JSON.parse(existingMetadata), metadata)) return false;
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  return true;
};

let pingInterval;

const startPinging = (port) => {
  clearInterval(pingInterval);
  pingInterval = setInterval(() => {
    // eslint-disable-next-line no-console
    console.log('PING', `http://localhost:${port}/${getVovkrc(argv.rc).prefix}/__ping}`);
    http.get(`http://localhost:${port}/${getVovkrc(argv.rc).prefix}/__ping}`);
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
        const { metadata, PORT } = JSON.parse(body); // Parse the JSON data
        const filePath = path.join(__dirname, '../../../.vovk.json');
        const metadataWritten = await writeMetadata(filePath, metadata);
        const codeWritten = await generateClient(argv.rc);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('JSON data received and file created');
        if (metadataWritten || codeWritten) {
          console.info(' 🐺 JSON metadata received and the client is generated');
        } else if (once) {
          console.info(' 🐺 JSON metadata received and the client is not changed');
        }

        if (PORT && !once) {
          startPinging(PORT);
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
        console.error(' ❌ ' + err.message);
      }
      if (once) server.close();
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
