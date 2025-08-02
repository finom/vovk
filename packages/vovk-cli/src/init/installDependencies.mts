import { spawn } from 'node:child_process';
import getLogger from '../utils/getLogger.mjs';
import type { InitOptions } from '../types.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export function getPackageManager(
  options: Pick<InitOptions, 'useNpm' | 'useYarn' | 'usePnpm' | 'useBun'>
): PackageManager {
  if (options.useNpm) return 'npm';
  if (options.useYarn) return 'yarn';
  if (options.usePnpm) return 'pnpm';
  if (options.useBun) return 'bun';
  return 'npm'; // Default to npm if no options are true
}

export default async function installDependencies({
  log,
  cwd,
  options,
}: {
  log: ReturnType<typeof getLogger>;
  cwd: string;
  options: Pick<InitOptions, 'useNpm' | 'useYarn' | 'usePnpm' | 'useBun'>;
}): Promise<void> {
  const packageManager = getPackageManager(options);

  log.info(`Installing dependencies at ${chalkHighlightThing(cwd)} using ${chalkHighlightThing(packageManager)}...`);

  await new Promise<void>((resolve, reject) => {
    const args = packageManager === 'yarn' ? ['install', '--non-interactive'] : ['install'];
    const child = spawn(packageManager, args, { cwd, stdio: 'inherit' });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${packageManager} install process exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}
