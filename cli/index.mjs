#!/usr/bin/env node
// @ts-check
import path from 'path';
import generateClient from './generateClient.mjs';
import parallel from './lib/parallel.mjs';
import getAvailablePort from './lib/getAvailablePort.mjs';
import getVars from './getVars.mjs';
import parseCommandLineArgs from './lib/parseCommandLineArgs.mjs';
import { fileURLToPath } from 'url';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Ignore meta-property error
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { command, flags, restArgs } = parseCommandLineArgs();
const {
  config = path.join(process.cwd(), 'vovk.config.js'), // Path to vovk.config.js
  // TODO not documented
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

    const env = await getVars(config, { VOVK_CLIENT_OUT: clientOut, PORT });

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
        { command: `cd ${project} && npx next dev ${restArgs}`, name: 'Next' },
      ],
      env
    ).catch((e) => console.error(e));
    console.info(' 🐺 All processes have ended');
  })();
} else if (command === 'generate') {
  void (async () => {
    const env = await getVars(config, { VOVK_CLIENT_OUT: clientOut });

    void generateClient(env).then(({ path }) => {
      console.info(` 🐺 Client generated in ${path}`);
    });
  })();
} else if (command === 'help') {
  console.info(` 🐺 Vovk CLI
  dev - Start development server
  generate - Generate client
  help - Show this help message`);
} else {
  console.error(' 🐺 ❌ Invalid command');
  process.exit(1);
}
