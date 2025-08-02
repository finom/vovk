#!/usr/bin/env node
import { spawn } from 'child_process';

console.warn(`Vovk CLI requires vovk-cli package. Running "npx vovk-cli ${process.argv.slice(2).join(' ')}" instead.`);

spawn('npx', ['vovk-cli', ...process.argv.slice(2)], { stdio: 'inherit' }).on('exit', (code) => {
  process.exit(code);
});
