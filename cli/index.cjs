#!/usr/bin/env node
// @ts-check
const generateClient = require('./generateClient.cjs');
const path = require('path');
const parallel = require('./lib/parallel.cjs');
const getAvailablePort = require('./lib/getAvailablePort.cjs');
const getVars = require('./getVars.cjs');
const parseCommandLineArgs = require('./lib/parseCommandLineArgs.cjs');
const { startVovkServer } = require('./server.cjs');

const { command, flags, restArgs } = parseCommandLineArgs();
const {
  // TODO not documented
  project = process.cwd(), // Path to Next.js project
  clientOut = path.join(process.cwd(), './node_modules/.vovk'), // Path to output directory
  nextDev = false, // Start Vovk Server without Next.js
} = flags;

if (command === 'dev') {
  const portAttempts = 30;
  void (async () => {
    let PORT = !nextDev
      ? process.env.PORT
      : process.env.PORT ||
        (await getAvailablePort(3000, portAttempts, 0, (failedPort, tryingPort) =>
          console.warn(` 🐺 🟡 Next.js Port ${failedPort} is in use, trying ${tryingPort} instead.`)
        ).catch(() => {
          throw new Error(` 🐺 ❌ Failed to find available Next port after ${portAttempts} attempts`);
        }));

    if (!PORT) {
      throw new Error(' 🐺 ❌ PORT env variable is required in --next-dev mode');
    }

    const serverEnv = { VOVK_CLIENT_OUT: clientOut, PORT, __VOVK_START_SERVER__: '' };

    const env = await getVars(serverEnv);

    if (nextDev) {
      serverEnv.__VOVK_START_SERVER__ = 'true';

      const commands = [
        {
          command: `node ${__dirname}/server.cjs`,
          name: 'Vovk.ts Metadata Server',
          env: { ...serverEnv, VOVK_PORT: env.VOVK_PORT }, // getVars is invoked synamically to receive rest of the env
        },
      ];

      commands.push({
        command: `cd ${project} && npx next dev ${restArgs}`,
        name: 'Next.js Development Server',
        env,
      });

      await parallel(commands).catch((e) => console.error(e));
      console.info(' 🐺 All processes have ended');
    } else {
      startVovkServer({ ...serverEnv, VOVK_PORT: env.VOVK_PORT });
    }
  })();
} else if (command === 'generate') {
  void (async () => {
    const env = await getVars({ VOVK_CLIENT_OUT: clientOut });

    await generateClient(env).then(({ path }) => {
      console.info(` 🐺 Client generated in ${path}`);
    });
  })();
} else if (command === 'help') {
  console.info(` 🐺 Vovk CLI
  dev - Start development server (optional flag --next-dev to start Vovk Server with Next.js)
  generate - Generate client
  help - Show this help message`);
} else {
  console.error(' 🐺 ❌ Invalid command');
  process.exit(1);
}
