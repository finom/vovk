import { spawn } from 'child_process';
import { InitOptions } from '../index.mjs';
import getLogger from '../utils/getLogger.mjs';

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
type InstallType = 'dependencies' | 'devDependencies';

interface InstallCommand {
  command: PackageManager;
  args: string[];
}

type PackageManagerCommands = Record<
  PackageManager,
  Record<InstallType, (packages: string[], installDir: string) => InstallCommand>
>;

function getPackageManager(options: Pick<InitOptions, 'useNpm' | 'useYarn' | 'usePnpm' | 'useBun'>): PackageManager {
  if (options.useNpm) return 'npm';
  if (options.useYarn) return 'yarn';
  if (options.usePnpm) return 'pnpm';
  if (options.useBun) return 'bun';
  return 'npm'; // Default to npm if no options are true
}

const packageManagerCommands: PackageManagerCommands = {
  npm: {
    dependencies: (packages: string[], installDir: string): InstallCommand => ({
      command: 'npm',
      args: ['install', ...packages, '--prefix', installDir],
    }),
    devDependencies: (packages: string[], installDir: string): InstallCommand => ({
      command: 'npm',
      args: ['install', '--save-dev', ...packages, '--prefix', installDir],
    }),
  },
  yarn: {
    dependencies: (packages: string[], installDir: string): InstallCommand => ({
      command: 'yarn',
      args: ['add', ...packages, '--cwd', installDir],
    }),
    devDependencies: (packages: string[], installDir: string): InstallCommand => ({
      command: 'yarn',
      args: ['add', '--dev', ...packages, '--cwd', installDir],
    }),
  },
  pnpm: {
    dependencies: (packages: string[], installDir: string): InstallCommand => ({
      command: 'pnpm',
      args: ['install', ...packages, '--dir', installDir],
    }),
    devDependencies: (packages: string[], installDir: string): InstallCommand => ({
      command: 'pnpm',
      args: ['install', ...packages, '--save-dev', '--dir', installDir],
    }),
  },
  bun: {
    dependencies: (packages: string[], installDir: string): InstallCommand => ({
      command: 'bun',
      args: ['add', ...packages, '--cwd', installDir],
    }),
    devDependencies: (packages: string[], installDir: string): InstallCommand => ({
      command: 'bun',
      args: ['add', '-d', ...packages, '--cwd', installDir],
    }),
  },
};

export default async function installDependencies({
  log,
  installDir,
  dependencies,
  devDependencies,
  options,
}: {
  log: ReturnType<typeof getLogger>;
  installDir: string;
  dependencies: string[];
  devDependencies: string[];
  options: Pick<InitOptions, 'useNpm' | 'useYarn' | 'usePnpm' | 'useBun'>;
}): Promise<void> {
  const packageManager = getPackageManager(options);

  // Ensure commandName is typed as CommandName
  const installPackages = async (type: InstallType, packages: string[]): Promise<void> => {
    if (packages.length > 0) {
      const installCommand = packageManagerCommands[packageManager][type](packages, installDir);

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
  };

  if (dependencies.length === 0 && devDependencies.length === 0) {
    log.warn('No dependencies or devDependencies to install');
    return;
  }

  log.info(`Installing dependencies and devDependencies at ${installDir} using ${packageManager}...`);

  await installPackages('dependencies', dependencies);
  await installPackages('devDependencies', devDependencies);
}
