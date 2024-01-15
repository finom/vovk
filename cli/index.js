#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { concurrently } = require('concurrently');
const generateClient = require('./generateClient');
const path = require('path');
const net = require('net');

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

  output: {
    type: 'string',
    default: path.join(__dirname, '../.vovk/index.d.ts'),
    describe: 'Path to the wildcard route file',
  },
};

const options = {
  outputStream: process.stdout,
  raw: true,
  killOthers: ['failure', 'success'],
};
/** @type {{ rc: string, project: string, output: string }} */
const argv = yargs(hideBin(process.argv))
  .command('dev', 'Run development server', builder)
  .command('build', 'Build the app', builder)
  .command('generate', 'Generate client', builder).argv;

const nextArgs = process.argv.join(' ').split(' -- ')[1] ?? '';

let VOVK_PORT = process.env.VOVK_PORT ? parseInt(process.env.VOVK_PORT) : 3420;

if (argv._.includes('dev')) {
  void getAvailablePort(VOVK_PORT, 20)
    .then((PORT) => {
      const { result } = concurrently(
        [
          {
            command: `VOVK_PORT=${PORT} node ${__dirname}/server.js --rc ${argv.rc} --output ${argv.output}`,
            name: 'Vovk',
          },
          { command: `cd ${argv.project} && VOVK_PORT=${PORT} npx next dev ${nextArgs}`, name: 'Next' },
        ],
        options
      );

      void result.then(() => {
        console.info(' 🐺 All processes have completed.');
      });
    })
    .catch(() => {
      console.error(' 🐺 Failed to find available port.');
    });
}

if (argv._.includes('build')) {
  void getAvailablePort(VOVK_PORT, 20)
    .then((PORT) => {
      const { result } = concurrently(
        [
          {
            command: `VOVK_PORT=${PORT} node ${__dirname}/server.js --once --rc ${argv.rc} --output ${argv.output}`,
            name: 'Vovk',
          },
          { command: `cd ${argv.project} && VOVK_PORT=${PORT} npx next build ${nextArgs}`, name: 'Next' },
        ],
        options
      );

      void result.catch((e) => console.error(e));
    })
    .catch(() => {
      console.error(' 🐺 Failed to find available port.');
    });
}

if (argv._.includes('generate')) {
  void generateClient(argv.rc, argv.output).then(() => {
    console.info(' 🐺 Client generated.');
  });
}
