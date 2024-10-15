import { spawn } from 'child_process';
import { InitOptions } from '../index.mjs';
import getLogger from '../utils/getLogger.mjs';

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

interface InstallCommand {
  command: PackageManager;
  args: string[];
}

function getPackageManager(options: Pick<InitOptions, 'useNpm' | 'useYarn' | 'usePnpm' | 'useBun'>): PackageManager {
  if (options.useNpm) return 'npm';
  if (options.useYarn) return 'yarn';
  if (options.usePnpm) return 'pnpm';
  if (options.useBun) return 'bun';
  return 'npm'; // Default to npm if no options are true
}

const packageManagerInstallCommands: Record<PackageManager, (installDir: string) => InstallCommand> = {
  npm: (installDir) => ({
    command: 'npm',
    args: ['install', '--prefix', installDir],
  }),
  yarn: (installDir) => ({
    command: 'yarn',
    args: ['install', '--cwd', installDir],
  }),
  pnpm: (installDir) => ({
    command: 'pnpm',
    args: ['install', '--dir', installDir],
  }),
  bun: (installDir) => ({
    command: 'bun',
    args: ['install', '--cwd', installDir],
  }),
};

export default async function installDependencies({
  log,
  installDir,
  options,
}: {
  log: ReturnType<typeof getLogger>;
  installDir: string;
  options: Pick<InitOptions, 'useNpm' | 'useYarn' | 'usePnpm' | 'useBun'>;
}): Promise<void> {
  const packageManager = getPackageManager(options);

  log.info(`Installing dependencies at ${installDir} using ${packageManager}...`);

  const installCommand = packageManagerInstallCommands[packageManager](installDir);
  const { command, args } = installCommand;

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}
