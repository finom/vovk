import { Command } from 'commander';
import { InitOptions } from './types.mjs';
import { Init } from './init/index.mjs';

// reused at vovk-init
export function initProgram(program: Command) {
  return program
    .description('Initialize Vovk.ts at existing Next.js project')
    .option('--prefix <prefix>', 'directory to initialize project in')
    .option('-y, --yes', 'skip all prompts and use default values')
    .option('--log-level <level>', 'set log level', 'info')
    .option('--use-npm', 'use npm as package manager')
    .option('--use-yarn', 'use yarn as package manager')
    .option('--use-pnpm', 'use pnpm as package manager')
    .option('--use-bun', 'use bun as package manager')
    .option('--skip-install', 'skip installing dependencies')
    .option('--update-ts-config', 'update tsconfig.json')
    .option('--update-scripts <mode>', 'update package.json scripts ("implicit" or "explicit")')
    .option(
      '--lang <languages...>',
      'generate client for other programming languages by default ("py" for Python and "rs" for Rust are supported)'
    )
    .option(
      '--validation-library <library>',
      'validation library to use ("zod", "class-validator", "valibot", "arktype" or another); set to "none" to skip'
    )
    .option('--channel <channel>', 'channel to use for fetching packages', 'latest')
    .option('--dry-run', 'do not write files to disk')
    .action((options: InitOptions) => new Init().main(options));
}
