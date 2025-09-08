#!/usr/bin/env node
import path from 'node:path';
import { readFileSync } from 'node:fs';
import 'dotenv/config';
import { Command } from 'commander';
import concurrently from 'concurrently';
import getAvailablePort from './utils/getAvailablePort.mjs';
import getProjectInfo from './getProjectInfo/index.mjs';
import { VovkGenerate } from './generate/index.mjs';
import { bundle } from './bundle/index.mjs';
import { VovkDev } from './dev/index.mjs';
import { newComponents } from './new/index.mjs';
import type { BundleOptions, DevOptions, GenerateOptions, NewOptions } from './types.mjs';
import { initProgram } from './initProgram.mjs';
import { getProjectFullSchema } from './generate/getProjectFullSchema.mjs';
import type { VovkEnv } from './types.mjs';
export type { VovkEnv };

const program = new Command();

const vovkCliPackage = JSON.parse(readFileSync(path.join(import.meta.dirname, '../package.json'), 'utf-8')) as {
  version: string;
};

program.name('vovk').description('Vovk CLI').version(vovkCliPackage.version);

initProgram(program.command('init'));

program
  .command('dev')
  .alias('d')
  .description('Start schema watcher (optional flag --next-dev to start it with Next.js)')
  .argument('[nextArgs...]', 'extra arguments for the dev command')
  .option('--next-dev', 'start schema watcher and Next.js with automatic port allocation')
  .option('--exit', 'kill the processes when schema and client is generated')
  .option('--schema-out <path>', 'path to schema output directory (default: .vovk-schema)')
  .option('--https, --dev-https', 'use HTTPS for the dev server (default: false)')
  .option('--log-level <level>', 'set the log level')
  .action(async (nextArgs: string[], options: DevOptions) => {
    const { nextDev, exit = false, schemaOut, devHttps, logLevel } = options;
    const portAttempts = 30;
    const PORT = !nextDev
      ? process.env.PORT
      : process.env.PORT ||
        (await getAvailablePort(3000, portAttempts, 0, (failedPort, tryingPort) =>
          // eslint-disable-next-line no-console
          console.warn(`🐺 Port ${failedPort} is in use, trying ${tryingPort} instead.`)
        ).catch(() => {
          throw new Error(`🐺 ❌ Failed to find an available port after ${portAttempts} attempts`);
        }));

    if (!PORT) {
      throw new Error('🐺 ❌ PORT env variable is required');
    }

    if (nextDev) {
      const { result } = concurrently(
        [
          {
            command: `npx next dev ${nextArgs.join(' ')}`,
            name: 'Next.js Development Server',
            env: { PORT } satisfies VovkEnv,
          },
          {
            command: `node ${import.meta.dirname}/dev/index.mjs`,
            name: 'Vovk Dev Watcher',
            env: {
              PORT,
              __VOVK_START_WATCHER_IN_STANDALONE_MODE__: 'true' as const,
              // TODO: Pass these as flags
              __VOVK_SCHEMA_OUT_FLAG__: schemaOut ?? '',
              __VOVK_DEV_HTTPS_FLAG__: devHttps ? 'true' : 'false',
              __VOVK_EXIT__: exit ? 'true' : 'false',
              __VOVK_LOG_LEVEL__: logLevel ?? undefined,
            } satisfies VovkEnv,
          },
        ],
        {
          killOthersOn: ['failure', 'success'],
          prefix: 'none',
          successCondition: 'first',
        }
      );
      try {
        await result;
      } finally {
        // do nothing, all processes are killed
      }
    } else {
      void new VovkDev({ schemaOut, devHttps, logLevel }).start({ exit });
    }
  });

program
  .command('generate')
  .alias('g')
  .description('Generate RPC client from schema')
  .option('--composed-only', 'generate only composed client even if segmented client is enabled')
  .option('--out, --composed-out <path>', 'path to output directory for composed client')
  .option('--from, --composed-from <templates...>', 'client template names for composed client')
  .option('--include, --composed-include-segments <segments...>', 'include segments in composed client')
  .option('--exclude, --composed-exclude-segments <segments...>', 'exclude segments in composed client')
  .option('--segmented-only', 'generate only segmented client even if composed client is enabled')
  .option('--segmented-out <path>', 'path to output directory for segmented client')
  .option('--segmented-from <templates...>', 'client template names for segmented client')
  .option('--segmented-include-segments <segments...>', 'include segments in segmented client')
  .option('--segmented-exclude-segments <segments...>', 'exclude segments in segmented client')
  .option('--prettify', 'prettify output files')
  .option('--schema, --schema-path <path>', 'path to schema folder (default: ./.vovk-schema)')
  .option('--config, --config-path <config>', 'path to config file')
  .option('--origin <url>', 'set the origin URL for the generated client')
  .option(
    '--watch <s>',
    'watch for changes in schema or openapi spec and regenerate client; accepts a number in seconds to throttle the watcher or make an HTTP request to the OpenAPI spec URL'
  )
  .option('--openapi, --openapi-spec <openapi_path_or_urls...>', 'use OpenAPI schema for client generation')
  .option(
    '--openapi-module-name, --openapi-get-module-name <names...>',
    'module names corresponding to the index of --openapi option'
  )
  .option(
    '--openapi-method-name, --openapi-get-method-name <names...>',
    'method names corresponding to the index of --openapi option'
  )
  .option('--openapi-root-url <urls...>', 'root URLs corresponding to the index of --openapi option')
  .option('--openapi-mixin-name <names...>', 'mixin names corresponding to the index of --openapi option')
  .option('--openapi-fallback <paths...>', 'save OpenAPI spec and use it as a fallback if URL is not available')
  .option('--log-level <level>', 'set the log level')
  .action(async (cliGenerateOptions: GenerateOptions) => {
    const projectInfo = await getProjectInfo({
      configPath: cliGenerateOptions.configPath,
      srcRootRequired: false,
      logLevel: cliGenerateOptions.logLevel,
    });
    await new VovkGenerate({
      projectInfo,
      forceNothingWrittenLog: true,
      cliGenerateOptions,
    }).start();
  });

program
  .command('bundle')
  .alias('b')
  .description('Generate TypeScript RPC and bundle it')
  .option('--out, --out-dir <path>', 'path to output directory for bundle')
  .option('--include, --include-segments <segments...>', 'include segments')
  .option('--exclude, --exclude-segments <segments...>', 'exclude segments')
  .option('--prebundle-out-dir, --prebundle-out <path>', 'path to output directory for prebundle')
  .option('--keep-prebundle-dir', 'do not delete prebundle directory after bundling')
  .option('--schema, --schema-path <path>', 'path to schema folder (default: .vovk-schema)')
  .option('--config, --config-path <config>', 'path to config file')
  .option('--origin <url>', 'set the origin URL for the generated client')
  .option('--tsconfig <path>', 'path to tsconfig.json for bundling by tsdown')
  .option('--openapi, --openapi-spec <openapi_path_or_urls...>', 'use OpenAPI schema instead of Vovk schema')
  .option('--openapi-get-module-name <names...>', 'module names corresponding to the index of --openapi option')
  .option('--openapi-get-method-name <names...>', 'method names corresponding to the index of --openapi option')
  .option('--openapi-root-url <urls...>', 'root URLs corresponding to the index of --openapi option')
  .option('--log-level <level>', 'set the log level')
  .action(async (cliBundleOptions: BundleOptions) => {
    const projectInfo = await getProjectInfo({
      configPath: cliBundleOptions.configPath,
      srcRootRequired: false,
      logLevel: cliBundleOptions.logLevel,
    });
    const { cwd, config, log, isNextInstalled } = projectInfo;
    const fullSchema = await getProjectFullSchema({
      schemaOutAbsolutePath: path.resolve(cwd, cliBundleOptions?.schema ?? config.schemaOutDir),
      log,
      isNextInstalled,
      config,
    });

    await bundle({
      projectInfo,
      fullSchema,
      cliBundleOptions,
    });
  });

program
  .command('new [components...]')
  .alias('n')
  .description(
    'Create new components. "vovk new [...components] [segmentName/]moduleName" to create a new module or "vovk new segment [segmentName]" to create a new segment'
  )
  .option('-o, --overwrite', 'overwrite existing files')
  .option(
    '--template, --templates <templates...>',
    'override config template; accepts an array of strings that correspond the order of the components'
  )
  .option('--dir <dirname>', 'override dirName in template file; relative to the root of the project')
  .option('--empty', 'create an empty module')
  .option('--no-segment-update', 'do not update segment files when creating a new module')
  .option('--dry-run', 'do not write files to disk')
  .option('--static', 'if the segment is static')
  .option('--log-level <level>', 'set the log level')
  .action(async (components: string[], newOptions: NewOptions) =>
    newComponents(
      components,
      await getProjectInfo({
        logLevel: newOptions.logLevel,
      }),
      newOptions
    )
  );

program
  .command('help')
  .description('Show help message')
  .action(() => program.help());

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
