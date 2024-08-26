#!/usr/bin/env node
import { Command } from 'commander';
import concurrently from 'concurrently';
import getAvailablePort from './utils/getAvailablePort';
import { VovkCLIServer } from './server';
import getProjectInfo from './getProjectInfo';
import generateClient from './server/generateClient';
import locateSegments from './locateSegments';
import { VovkConfig, VovkEnv } from './types';

/*
TODO:
- Use ts-morph to update files
- Vovk create segment <segmentName>
- Vovk create module <segmentName>/module.ts
- Explicit concurrently, implicit concurrently instead of "standalone" mode
*/

export type { VovkConfig, VovkEnv };

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
          // eslint-disable-next-line no-console
          console.warn(`🐺 Next.js Port ${failedPort} is in use, trying ${tryingPort} instead.`)
        ).catch(() => {
          throw new Error(`🐺 ❌ Failed to find available Next port after ${portAttempts} attempts`);
        }));

    if (!PORT) {
      throw new Error('🐺 ❌ PORT env variable is required');
    }

    if (options.nextDev) {
      const { result } = concurrently(
        [
          {
            command: `node ${__dirname}/server/index.js`,
            name: 'Vovk.ts Metadata Server',
            env: Object.assign(
              { PORT, __VOVK_START_SERVER_IN_STANDALONE_MODE__: 'true' as const },
              options.clientOut ? { VOVK_CLIENT_OUT_DIR: options.clientOut } : {}
            ),
          },
          {
            command: `cd ${options.project} && npx next dev ${command.args.join(' ')}`,
            name: 'Next.js Development Server',
            env: { PORT },
          },
        ],
        {
          killOthers: ['failure', 'success'],
          prefix: 'none',
        }
      );
      try {
        await result;
      } finally {
        // eslint-disable-next-line no-console
        console.log('🐺 Exiting...');
      }
    } else {
      void new VovkCLIServer().startServer({ clientOutDir: options.clientOut });
    }
  });

program
  .command('generate')
  .description('Generate client')
  .option('--client-out <path>', 'Path to output directory')
  .action(async (options: GenerateOptions) => {
    const projectInfo = await getProjectInfo({ clientOutDir: options.clientOut });
    const segments = await locateSegments(projectInfo.apiDir);
    const metadata = await import(projectInfo.metadataOutFullPath);

    await generateClient(projectInfo, segments, metadata.default);
  });

program
  .command('help')
  .description('Show help message')
  .action(() => program.help());

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
