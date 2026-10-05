#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// pnpm dlx vovk and yarn dlx vovk run this bin, so the vovk-cli of the project goes first
function getProjectCliPath() {
  try {
    const packageJsonPath = createRequire(path.join(process.cwd(), 'package.json')).resolve('vovk-cli/package.json');
    const { bin } = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return path.join(path.dirname(packageJsonPath), typeof bin === 'string' ? bin : bin.vovk);
  } catch {
    return null;
  }
}

const projectCliPath = getProjectCliPath();

if (projectCliPath) {
  await import(pathToFileURL(projectCliPath).href);
} else {
  console.warn(
    `\x1b[33m🐺 Vovk CLI requires vovk-cli package. Running npx vovk-cli@latest ${process.argv.slice(2).join(' ')} instead.\x1b[0m`
  );

  spawn('npx', ['vovk-cli@latest', ...process.argv.slice(2)], { stdio: 'inherit' }).on('exit', (code) => {
    process.exit(code);
  });
}
