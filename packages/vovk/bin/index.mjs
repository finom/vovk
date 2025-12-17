#!/usr/bin/env node
import { spawn } from 'child_process';

console.warn(
  `\x1b[33m🐺 Vovk CLI requires vovk-cli package. Running npx vovk-cli@latest ${process.argv.slice(2).join(' ')} instead.\x1b[0m`
);

spawn('npx', ['vovk-cli@latest', ...process.argv.slice(2)], { stdio: 'inherit' }).on('exit', (code) => {
  process.exit(code);
});
