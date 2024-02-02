#!/usr/bin/env node
// @ts-check
const generateClient = require('./generateClient');
const path = require('path');
const parallel = require('./lib/parallel');
const getAvailablePort = require('./lib/getAvailablePort');
const getVars = require('./getVars');
const parseCommandLineArgs = require('./lib/parseCommandLineArgs');

const { command, flags, nextArgs } = parseCommandLineArgs();
const {
  config = path.join(process.cwd(), 'vovk.config.js'), // Path to vovk.config.js
  project = process.cwd(), // Path to Next.js project
  clientOut = path.join(process.cwd(), './node_modules/.vovk'), // Path to output directory
} = flags;

if (command === 'dev') {
  void (async () => {
    let PORT =
      process.env.PORT ||
      (await getAvailablePort(3000, 30).catch(() => {
        throw new Error(' 🐺 Failed to find available Next port');
      }));

    const env = getVars(config, { VOVK_CLIENT_OUT: clientOut, PORT });

    let VOVK_PORT = parseInt(env.VOVK_PORT);

    env.VOVK_PORT = await getAvailablePort(VOVK_PORT, 30).catch(() => {
      throw new Error(' 🐺 Failed to find available Vovk port');
    });

    await parallel(
      [
        {
          command: `node ${__dirname}/server.js`,
          name: 'Vovk',
        },
        { command: `cd ${project} && npx next dev ${nextArgs}`, name: 'Next' },
      ],
      env
    ).catch((e) => console.error(e));
    console.info(' 🐺 All processes have ended');
  })();
} else if (command === 'build') {
  void (async () => {
    const env = getVars(config, { VOVK_CLIENT_OUT: clientOut });

    let VOVK_PORT = parseInt(env.VOVK_PORT);

    env.VOVK_PORT = await getAvailablePort(VOVK_PORT, 30).catch(() => {
      throw new Error(' 🐺 Failed to find available port');
    });
    await parallel(
      [
        {
          command: `node ${__dirname}/server.js --once`,
          name: 'Vovk',
        },
        { command: `cd ${project} && npx next build ${nextArgs}`, name: 'Next' },
      ],
      env
    ).catch((e) => console.error(e));
  })();
} else if (command === 'generate') {
  const env = getVars(config, { VOVK_CLIENT_OUT: clientOut });

  void generateClient(env).then(({ path }) => {
    console.info(` 🐺 Client generated in ${path}`);
  });
} else if (command === 'help') {
  console.info(` 🐺 Vovk CLI
  dev - Start development server
  build - Build Next.js project
  generate - Generate client
  help - Show this help message`);
} else {
  console.error(' 🐺 ❌ Invalid command');
  process.exit(1);
}
