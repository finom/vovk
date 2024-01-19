#!/usr/bin/env node
// @ts-check
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const generateClient = require('./generateClient');
const path = require('path');
const concurrent = require('./lib/concurrent');
const getAvailablePort = require('./lib/getAvailablePort');
const getVars = require('./getVars');

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

const env = getVars(argv.rc);

let VOVK_PORT = parseInt(env.VOVK_PORT);

// @ts-expect-error yargs
if (argv._.includes('dev')) {
  void (async () => {
    env.VOVK_PORT = await getAvailablePort(VOVK_PORT, 20).catch(() => {
      throw new Error(' 🐺 Failed to find available port');
    });
    await concurrent(
      [
        {
          command: `node ${__dirname}/server.js`,
          name: 'Vovk',
        },
        { command: `cd ${argv.project} && npx next dev ${nextArgs}`, name: 'Next' },
      ],
      env
    ).catch((e) => console.error(e));
    console.info(' 🐺 All processes have completed');
  })();
}

// @ts-expect-error yargs
if (argv._.includes('build')) {
  void (async () => {
    env.VOVK_PORT = await getAvailablePort(VOVK_PORT, 20).catch(() => {
      throw new Error(' 🐺 Failed to find available port');
    });
    await concurrent(
      [
        {
          command: `node ${__dirname}/server.js --once`,
          name: 'Vovk',
        },
        { command: `cd ${argv.project} && npx next build ${nextArgs}`, name: 'Next' },
      ],
      env
    ).catch((e) => console.error(e));
  })();
}

// @ts-expect-error yargs
if (argv._.includes('generate')) {
  void generateClient(env).then(() => {
    console.info(' 🐺 Client generated');
  });
}
