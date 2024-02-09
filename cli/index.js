#!/usr/bin/env node
// @ts-check
const generateClient = require('./generateClient');
const path = require('path');
const parallel = require('./lib/parallel');
const getAvailablePort = require('./lib/getAvailablePort');
const getVars = require('./getVars');
const parseCommandLineArgs = require('./lib/parseCommandLineArgs');

const { command, flags, restArgs } = parseCommandLineArgs();
const {
  config = path.join(process.cwd(), 'vovk.config.js'), // Path to vovk.config.js
  // TODO not documented
  project = process.cwd(), // Path to Next.js project
  clientOut = path.join(process.cwd(), './node_modules/.vovk'), // Path to output directory
  standalone = false, // Start Vovk Server without Next.js
} = flags;

if (command === 'dev') {
  const portAttempts = 30;
  void (async () => {
    let PORT = standalone
      ? process.env.PORT
      : process.env.PORT ||
        (await getAvailablePort(3000, portAttempts).catch(() => {
          throw new Error(` 🐺 ❌ Failed to find available Next port after ${portAttempts} attempts`);
        }));

    if (!PORT) {
      throw new Error(' 🐺 ❌ PORT env variable is required in standalone mode');
    }

    const env = getVars(config, { VOVK_CLIENT_OUT: clientOut, PORT });

    let VOVK_PORT = parseInt(env.VOVK_PORT);

    env.VOVK_PORT = await getAvailablePort(VOVK_PORT, portAttempts).catch(() => {
      throw new Error(` 🐺 ❌ Failed to find available Vovk port after ${portAttempts} attempts`);
    });

    const commands = [
      {
        command: `node ${__dirname}/server.js`,
        name: 'Vovk',
      },
    ];

    if (!standalone) {
      commands.push({
        command: `cd ${project} && npx next dev ${restArgs}`,
        name: 'Next',
      });
    }

    await parallel(commands, env).catch((e) => console.error(e));
    console.info(' 🐺 All processes have ended');
  })();
} else if (command === 'generate') {
  const env = getVars(config, { VOVK_CLIENT_OUT: clientOut });

  void generateClient(env).then(({ path }) => {
    console.info(` 🐺 Client generated in ${path}`);
  });
} else if (command === 'help') {
  console.info(` 🐺 Vovk CLI
  dev - Start development server
  generate - Generate client
  help - Show this help message`);
} else {
  console.error(' 🐺 ❌ Invalid command');
  process.exit(1);
}
