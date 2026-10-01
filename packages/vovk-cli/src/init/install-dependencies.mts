import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type NPMCliPackageJson from '@npmcli/package-json';
import type { InitOptions } from '../types.mjs';
import { chalkHighlightThing } from '../utils/chalk-highlight-thing.mjs';
import type { getLogger } from '../utils/get-logger.mjs';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

const KNOWN_PACKAGE_MANAGERS: PackageManager[] = ['npm', 'yarn', 'pnpm', 'bun'];

const LOCKFILES: [string, PackageManager][] = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
  ['package-lock.json', 'npm'],
];

// the project's lockfile, then the package manager that runs vovk init
function getPackageManagerInUse({ root, userAgent }: { root?: string; userAgent?: string }): PackageManager {
  const lockfile = root ? LOCKFILES.find(([fileName]) => fs.existsSync(path.join(root, fileName))) : undefined;
  if (lockfile) return lockfile[1];
  // npm_config_user_agent looks like "pnpm/10.4.1 npm/? node/v24.1.0 darwin arm64"
  const runner = userAgent?.split('/')[0];
  return KNOWN_PACKAGE_MANAGERS.find((name) => name === runner) ?? 'npm';
}

export function getPackageManager(
  options: Pick<InitOptions, 'useNpm' | 'useYarn' | 'usePnpm' | 'useBun'> & {
    pkgJson: NPMCliPackageJson;
    log?: ReturnType<typeof getLogger>;
    root?: string;
    userAgent?: string;
  }
): PackageManager {
  if (options.useNpm) return 'npm';
  if (options.useYarn) return 'yarn';
  if (options.usePnpm) return 'pnpm';
  if (options.useBun) return 'bun';
  const packageManager = options.pkgJson.content?.packageManager?.split('@')[0];
  if (!packageManager) return getPackageManagerInUse(options);
  // this name gets spawned, so an unknown one from package.json is not executed
  if (!KNOWN_PACKAGE_MANAGERS.includes(packageManager as PackageManager)) {
    options.log?.warn(
      `Unknown "packageManager" ${JSON.stringify(packageManager)} in package.json, using ${chalkHighlightThing('npm')} instead`
    );
    return 'npm';
  }
  return packageManager as PackageManager;
}

// npm, yarn and pnpm are .cmd shims on Windows, and spawn runs those only through a shell.
// the shell gets one command string: the package manager comes from a fixed list, so there is nothing to escape
export function getInstallCommand(packageManager: PackageManager, platform: NodeJS.Platform = process.platform) {
  return platform === 'win32'
    ? { command: `${packageManager} install`, args: [], shell: true }
    : { command: packageManager, args: ['install'], shell: false };
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
    const { command, args, shell } = getInstallCommand(packageManager);
    const child = spawn(command, args, { cwd, stdio: 'inherit', shell });

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
