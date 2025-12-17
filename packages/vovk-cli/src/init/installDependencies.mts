import { spawn } from 'node:child_process';
import NPMCliPackageJson from '@npmcli/package-json';
import { getLogger } from '../utils/getLogger.mjs';
import type { InitOptions } from '../types.mjs';
import { chalkHighlightThing } from '../utils/chalkHighlightThing.mjs';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export function getPackageManager(
  options: Pick<InitOptions, 'useNpm' | 'useYarn' | 'usePnpm' | 'useBun'> & { pkgJson: NPMCliPackageJson }
): PackageManager {
  if (options.useNpm) return 'npm';
  if (options.useYarn) return 'yarn';
  if (options.usePnpm) return 'pnpm';
  if (options.useBun) return 'bun';
  const packageManager = options.pkgJson.content?.['packageManager'];
  return packageManager ? (packageManager.split('@')[0] as PackageManager) : 'npm'; // Default to npm if no options are true
}

export async function installDependencies({
  log,
  cwd,
  packageManager,
}: {
  log: ReturnType<typeof getLogger>;
  cwd: string;
  packageManager: PackageManager;
}): Promise<void> {
  log.info(`Installing dependencies at ${chalkHighlightThing(cwd)} using ${chalkHighlightThing(packageManager)}...`);

  await new Promise<void>((resolve, reject) => {
    const args = ['install'];
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
