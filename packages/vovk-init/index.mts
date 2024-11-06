#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { readFileSync } from 'fs';
import initProgram from 'vovk-cli/dist/initProgram.mjs';

const program = new Command();

const packageJSON = JSON.parse(readFileSync(path.join(import.meta.dirname, '../package.json'), 'utf-8')) as {
  version: string;
};

program.name('vovk').description('Vovk Init CLI').version(packageJSON.version);

initProgram(program, '');

program
  .command('help')
  .description('Show help message')
  .action(() => program.help());
