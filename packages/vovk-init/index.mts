#!/usr/bin/env node
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import initProgram from 'vovk-cli/dist/initProgram.mjs';

const program = new Command();

const packageJSON = JSON.parse(readFileSync(path.join(import.meta.dirname, './package.json'), 'utf-8')) as {
  version: string;
};

program.name('vovk init').description('Vovk Init CLI').version(packageJSON.version);

initProgram(program, '', true);

program
  .command('help')
  .description('Show help message')
  .action(() => program.help());
