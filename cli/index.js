#!/usr/bin/env node
//// @ts-check
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { concurrently } = require('concurrently');
const generateClient = require('./generateClient');
const path = require('path');

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

if (argv._.includes('dev')) {
  const { result } = concurrently(
    [
      { command: `node ${__dirname}/server.js`, name: 'Vovk' },
      { command: `node ${__dirname}/watchMetadata.js --rc ${argv.rc} --output ${argv.output}`, name: 'Watch metadata' },
      { command: `cd ${argv.project} && npx next dev ${nextArgs}`, name: 'Next' },
    ],
    options
  );

  void result.then(() => {
    console.info(' 🐺 All processes have completed.');
  });
}

if (argv._.includes('build')) {
  const { result } = concurrently(
    [
      { command: `node ${__dirname}/server.js --once`, name: 'Vovk' },
      { command: `cd ${argv.project} && npx next build ${nextArgs}`, name: 'Next' },
    ],
    options
  );

  void result
    .catch((e) => console.error(e))
    .then(async () => {
      await generateClient(argv.rc, argv.output);
      console.info(' 🐺 Both processes have completed and the client is generated.');
    });
}

if (argv._.includes('generate')) {
  void generateClient(argv.rc, argv.output).then(() => {
    console.info(' 🐺 Client generated.');
  });
}
