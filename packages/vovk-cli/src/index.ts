#!/usr/bin/env node
import { Command } from 'commander';
import generateClient from './_tmp_ArchiveOfOldModules/generateClient';
import parallel from './utils/parallel';
import getAvailablePort from './utils/getAvailablePort';
import getVars from './_tmp_ArchiveOfOldModules/getVars';
import { startVovkServer } from './server';
import { VovkEnv } from './types';

interface DevOptions {
  project: string;
  clientOut?: string;
  nextDev: boolean;
}

interface GenerateOptions {
  clientOut?: string;
}

const program = new Command();

program.name('vovk').description('Vovk CLI tool').version('1.0.0');

program
  .command('dev')
  .description('Start development server (optional flag --next-dev to start Vovk Server with Next.js)')
  .option('--project <path>', 'Path to Next.js project', process.cwd())
  .option('--client-out <path>', 'Path to client output directory')
  .option('--next-dev', 'Start Vovk Server and Next.js with automatic port allocation', false)
  .allowUnknownOption(true)
  .action(async (options: DevOptions, command: Command) => {
    const portAttempts = 30;
    const PORT = !options.nextDev
      ? process.env.PORT
      : process.env.PORT ||
        (await getAvailablePort(3000, portAttempts, 0, (failedPort, tryingPort) =>
          console.warn(` 🐺 🟡 Next.js Port ${failedPort} is in use, trying ${tryingPort} instead.`)
        ).catch(() => {
          throw new Error(` 🐺 ❌ Failed to find available Next port after ${portAttempts} attempts`);
        }));

    if (!PORT) {
      throw new Error(' 🐺 ❌ PORT env variable is required');
    }

    const serverEnv: VovkEnv = options.clientOut ? { VOVK_CLIENT_OUT: options.clientOut, PORT } : { PORT };

    const env = await getVars(serverEnv);

    if (options.nextDev) {
      serverEnv.__VOVK_START_SERVER__ = 'true';

      const commands = [
        {
          command: `node ${__dirname}/server.js`,
          name: 'Vovk.ts Metadata Server',
          env: { ...serverEnv, VOVK_PORT: env.VOVK_PORT },
        },
      ];

      commands.push({
        command: `cd ${options.project} && npx next dev ${command.args.join(' ')}`,
        name: 'Next.js Development Server',
        env,
      });

      await parallel(commands).catch((e) => console.error(e));
      console.info(' 🐺 All processes have ended');
    } else {
      startVovkServer({ ...env, ...serverEnv });
    }
  });

program
  .command('generate')
  .description('Generate client')
  .option('--client-out <path>', 'Path to output directory')
  .action(async (options: GenerateOptions) => {
    const env = await getVars({ VOVK_CLIENT_OUT: options.clientOut });

    await generateClient(env).then(({ path }) => {
      console.info(` 🐺 Client generated in ${path}`);
    });
  });

program
  .command('help')
  .description('Show help message')
  .action(() => {
    program.help();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
