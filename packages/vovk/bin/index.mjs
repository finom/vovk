#!/usr/bin/env node
import { spawn } from 'child_process';

spawn('npx', ['vovk-cli', ...process.argv.slice(2)], { stdio: 'inherit' }).on('exit', (code) => {
  process.exit(code);
});
