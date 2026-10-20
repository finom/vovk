#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getFallbackCommand } from './fallback.mjs';

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

const args = process.argv.slice(2);
const projectCliPath = getProjectCliPath();

if (projectCliPath) {
  await import(pathToFileURL(projectCliPath).href);
} else {
  const [command, commandArgs] = getFallbackCommand(args);
  const shown = [path.basename(command), ...commandArgs].join(' ');
  console.warn(`\x1b[33m[[v]] Vovk CLI requires vovk-cli package. Running ${shown} instead.\x1b[0m`);

  spawn(command, commandArgs, { stdio: 'inherit' })
    .on('error', (error) => {
      console.error(`[[v]] ❌ Could not run ${shown}: ${error.message}. Install vovk-cli in the project instead.`);
      process.exit(1);
    })
    .on('exit', (code) => {
      process.exit(code);
    });
}
