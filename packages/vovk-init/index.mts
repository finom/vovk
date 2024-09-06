#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { readFileSync } from 'fs';
import { Init } from 'vovk-cli/dist/init/index.mjs';
import type { InitOptions } from 'vovk-cli';

const program = new Command();

const packageJSON = JSON.parse(readFileSync(path.join(import.meta.dirname, '../package.json'), 'utf-8')) as {
  version: string;
};

program.name('vovk').description('Vovk Init CLI').version(packageJSON.version);

program
  .command('[prefix]')
  .description('Initialize Vovk project')
  .option('-Y, --yes', 'Skip all prompts and use default values')
  .option('--log-level <level>', 'Set log level', 'info')
  .action(async (prefix: string = '.', options: InitOptions) => {
    await Init.main(prefix, options);
  });

program
  .command('help')
  .description('Show help message')
  .action(() => program.help());
