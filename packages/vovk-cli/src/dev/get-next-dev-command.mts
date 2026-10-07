import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { quoteShellArgument } from '../utils/quote-shell-argument.mjs';

// the bin of the project's own next, which Node resolves under Yarn PnP too, where node_modules/.bin is missing
function getNextBinPath(cwd: string) {
  try {
    const packageJsonPath = createRequire(path.join(cwd, 'noop.js')).resolve('next/package.json');
    const { bin } = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { bin?: string | Record<string, string> };
    const binPath = typeof bin === 'string' ? bin : bin?.next;
    return binPath ? path.join(path.dirname(packageJsonPath), binPath) : null;
  } catch {
    return null;
  }
}

// npx runs a node_modules/.bin/next, and without one it would install the latest next: --no makes it fail instead
export function getNextDevCommand(nextArgs: string[], cwd = process.cwd()) {
  const binPath = getNextBinPath(cwd);
  const command = binPath ? ['node', binPath, 'dev', ...nextArgs] : ['npx', '--no', 'next', 'dev', ...nextArgs];
  return command.map((arg) => quoteShellArgument(arg)).join(' ');
}
