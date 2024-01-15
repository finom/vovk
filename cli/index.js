#!/usr/bin/env node
// @ts-check
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const generateClient = require('./generateClient');
const path = require('path');
const net = require('net');
const concurrent = require('./concurrent');

function checkPort(port, callback) {
  const server = net.createServer();

  server.listen(port, () => {
    server.close(() => {
      callback(true); // Port is available
    });
  });

  server.on('error', () => {
    callback(false);
  });
}

function getAvailablePort(startPort, maxAttempts, attempt = 1) {
  return new Promise((resolve, reject) => {
    checkPort(startPort, (isAvailable) => {
      if (isAvailable) {
        resolve(startPort); // Found an available port
      } else if (attempt < maxAttempts) {
        getAvailablePort(startPort + 1, maxAttempts, attempt + 1).then(resolve, reject);
      } else {
        reject(null);
      }
    });
  });
}

const builder = {
  rc: {
    type: 'string',
    default: path.join(process.cwd(), '.vovkrc.js'),
    describe: 'Path to .vovkrc.js',
  },

  project: {
    type: 'string',
    default: process.cwd(),
    describe: 'Path to Next.js project',
  },
};

/** @type {{ rc: string, project: string }} */
// @ts-expect-error yargs
const argv = yargs(hideBin(process.argv)) // @ts-expect-error yargs
  .command('dev', 'Run development server', builder) // @ts-expect-error yargs
  .command('build', 'Build the app', builder) // @ts-expect-error yargs
  .command('generate', 'Generate client', builder).argv;

const nextArgs = process.argv.join(' ').split(' -- ')[1] ?? '';

let VOVK_PORT = process.env.VOVK_PORT ? parseInt(process.env.VOVK_PORT) : 3420;

// @ts-expect-error yargs
if (argv._.includes('dev')) {
  void (async () => {
    const PORT = await getAvailablePort(VOVK_PORT, 20).catch(() => {
      throw new Error(' 🐺 Failed to find available port');
    });
    await concurrent([
      {
        command: `VOVK_PORT=${PORT} node ${__dirname}/server.js --rc ${argv.rc}`,
        name: 'Vovk',
      },
      { command: `cd ${argv.project} && VOVK_PORT=${PORT} npx next dev ${nextArgs}`, name: 'Next' },
    ]).catch((e) => console.error(e));
    console.info(' 🐺 All processes have completed');
  })();
}

// @ts-expect-error yargs
if (argv._.includes('build')) {
  void (async () => {
    const PORT = await getAvailablePort(VOVK_PORT, 20).catch(() => {
      throw new Error(' 🐺 Failed to find available port');
    });

    await concurrent([
      {
        command: `VOVK_PORT=${PORT} node ${__dirname}/server.js --once --rc ${argv.rc}`,
        name: 'Vovk',
      },
      { command: `cd ${argv.project} && VOVK_PORT=${PORT} npx next build ${nextArgs}`, name: 'Next' },
    ]).catch((e) => console.error(e));
  })();
}

// @ts-expect-error yargs
if (argv._.includes('generate')) {
  void generateClient(argv.rc).then(() => {
    console.info(' 🐺 Client generated');
  });
}
