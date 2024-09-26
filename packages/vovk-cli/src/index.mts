#!/usr/bin/env node
import path from 'path';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import concurrently from 'concurrently';
import getAvailablePort from './utils/getAvailablePort.mjs';
import getProjectInfo from './getProjectInfo/index.mjs';
import generateClient from './generateClient.mjs';
import locateSegments from './locateSegments.mjs';
import { VovkCLIWatcher } from './watcher/index.mjs';
import { Init } from './init/index.mjs';
import type { LogLevelNames } from 'loglevel';
import type { VovkConfig, VovkEnv } from './types.mjs';
import type { VovkSchema } from 'vovk';
import newComponents from './new/index.mjs';

export type { VovkConfig, VovkEnv };

interface DevOptions {
  project: string;
  clientOut?: string;
  nextDev: boolean;
}

interface GenerateOptions {
  clientOut?: string;
}

export interface InitOptions {
  yes?: boolean;
  logLevel: LogLevelNames;
  useNpm?: boolean;
  useYarn?: boolean;
  usePnpm?: boolean;
  useBun?: boolean;
  skipInstall?: boolean;
  updateTsConfig?: boolean;
  updateScripts?: 'implicit' | 'explicit';
  validationLibrary?: string;
  validateOnClient?: boolean;
}

export interface NewOptions {
  dryRun: boolean;
}

const program = new Command();

const packageJSON = JSON.parse(readFileSync(path.join(import.meta.dirname, '../package.json'), 'utf-8')) as {
  version: string;
};

program.name('vovk').description('Vovk CLI').version(packageJSON.version);

program
  .command('dev')
  .description('Start schema watcher (optional flag --next-dev to start it with Next.js)')
  .option('--client-out <path>', 'Path to client output directory')
  .option('--next-dev', 'Start schema watcher and Next.js with automatic port allocation', false)
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
            command: `node ${import.meta.dirname}/watcher/index.mjs`,
            name: 'Vovk.ts Schema Watcher',
            env: Object.assign(
              { PORT, __VOVK_START_WATCHER_IN_STANDALONE_MODE__: 'true' as const },
              options.clientOut ? { VOVK_CLIENT_OUT_DIR: options.clientOut } : {}
            ),
          },
          {
            command: `npx next dev ${command.args.join(' ')}`,
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
        // do nothing, all processes are killed
      }
    } else {
      void new VovkCLIWatcher().start({ clientOutDir: options.clientOut });
    }
  });

program
  .command('generate')
  .description('Generate client')
  .option('--client-out <path>', 'Path to output directory')
  .action(async (options: GenerateOptions) => {
    const projectInfo = await getProjectInfo({ clientOutDir: options.clientOut });
    const { cwd, config, apiDir } = projectInfo;
    const segments = await locateSegments(apiDir);
    const schemaOutAbsolutePath = path.join(cwd, config.schemaOutDir);
    const schema = (await import(path.join(schemaOutAbsolutePath, 'index.js'))) as {
      default: Record<string, VovkSchema>;
    };

    await generateClient(projectInfo, segments, schema.default);
  });

program
  .command('init [prefix]')
  .description('Initialize Vovk project')
  .option('-Y, --yes', 'Skip all prompts and use default values')
  .option('--log-level <level>', 'Set log level', 'debug') // TODO change to 'info'
  .option('--use-npm', 'Use npm as package manager')
  .option('--use-yarn', 'Use yarn as package manager')
  .option('--use-pnpm', 'Use pnpm as package manager')
  .option('--use-bun', 'Use bun as package manager')
  .option('--skip-install', 'Skip installing dependencies')
  .option('--update-ts-config', 'Update tsconfig.json')
  .option('--update-scripts <mode>', 'Update package.json scripts (implicit or explicit)')
  .option('--validation-library <library>', 'Validation library to use')
  .option('--validate-on-client', 'Validate on client')
  .action((prefix: string = '.', options: InitOptions) => new Init().main(prefix, options));

program
  .command('new [components...]')
  .alias('n')
  .description(
    'Create new components. "vovk new [...components] [segmentName/]moduleName" to create a new module or "vovk new segment [segmentName]" to create a new segment'
  )
  .option('--dry-run', 'Do not write files to disk')
  .action((components: string[], options: NewOptions) => newComponents(components, options));

program
  .command('help')
  .description('Show help message')
  .action(() => program.help());

/*
vovk new segment [segmentName]
vovk new controller service [segmentName/]moduleName
vovk new c s w [segmentName/]moduleName

vovk c s w userApi/user
vovk new c s w user
*/

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
