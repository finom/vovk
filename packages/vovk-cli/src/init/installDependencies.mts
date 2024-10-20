import { exec } from 'child_process';
import { InitOptions } from '../index.mjs';
import getLogger from '../utils/getLogger.mjs';

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

function getPackageManager(options: Pick<InitOptions, 'useNpm' | 'useYarn' | 'usePnpm' | 'useBun'>): PackageManager {
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

  log.info(`Installing dependencies at ${cwd} using ${packageManager}...`);

  await new Promise<void>((resolve, reject) => {
    exec(`${packageManager} install`, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr));
      } else {
        log.debug(stdout);
        resolve();
      }
    });
  });

  return Promise.resolve();
}
