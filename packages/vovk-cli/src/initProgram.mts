import { Command } from 'commander';
import { InitOptions } from './types.mjs';
import { Init } from './init/index.mjs';

// reused at vovk-init
export default function initProgram(program: Command) {
  return program
    .argument('[prefix]', 'Directory to initialize project in', '.')
    .description('Initialize Vovk project')
    .option('-y, --yes', 'Skip all prompts and use default values')
    .option('--log-level <level>', 'Set log level', 'info')
    .option('--use-npm', 'Use npm as package manager')
    .option('--use-yarn', 'Use yarn as package manager')
    .option('--use-pnpm', 'Use pnpm as package manager')
    .option('--use-bun', 'Use bun as package manager')
    .option('--skip-install', 'Skip installing dependencies')
    .option('--update-ts-config', 'Update tsconfig.json')
    .option('--update-scripts <mode>', 'Update package.json scripts ("implicit" or "explicit")')
    .option(
      '--validation-library <library>',
      'Validation library to use ("vovk-zod", "vovk-yup", "vovk-dto" or another). Set to "none" to skip validation'
    )
    .option('--validate-on-client', 'Path to validateOnClient file')
    .option('--channel <channel>', 'Channel to use for fetching packages', 'latest')
    .option('--dry-run', 'Do not write files to disk')
    .action((prefix: string = '.', options: InitOptions) => new Init().main(prefix, options));
}
