import { spawn } from 'child_process';
import { InitOptions } from '../index.mjs';
import getLogger from '../utils/getLogger.mjs';

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
type CommandName = 'install' | 'installDev';

interface InstallCommand {
  command: string;
  args: string[];
}

type PackageManagerCommands = Record<
  PackageManager,
  Record<CommandName, (packages: string[], installDir: string) => InstallCommand>
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
    install: (packages: string[], installDir: string): InstallCommand => ({
      command: 'npm',
      args: ['install', ...packages, '--prefix', installDir],
    }),
    installDev: (packages: string[], installDir: string): InstallCommand => ({
      command: 'npm',
      args: ['install', '--save-dev', ...packages, '--prefix', installDir],
    }),
  },
  yarn: {
    install: (packages: string[], installDir: string): InstallCommand => ({
      command: 'yarn',
      args: ['add', ...packages, '--cwd', installDir],
    }),
    installDev: (packages: string[], installDir: string): InstallCommand => ({
      command: 'yarn',
      args: ['add', '--dev', ...packages, '--cwd', installDir],
    }),
  },
  pnpm: {
    install: (packages: string[], installDir: string): InstallCommand => ({
      command: 'pnpm',
      args: ['install', ...packages, '--dir', installDir],
    }),
    installDev: (packages: string[], installDir: string): InstallCommand => ({
      command: 'pnpm',
      args: ['install', ...packages, '--save-dev', '--dir', installDir],
    }),
  },
  bun: {
    install: (packages: string[], installDir: string): InstallCommand => ({
      command: 'bun',
      args: ['add', ...packages, '--cwd', installDir],
    }),
    installDev: (packages: string[], installDir: string): InstallCommand => ({
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
  try {
    const packageManager = getPackageManager(options);

    // Ensure commandName is typed as CommandName
    const installPackages = async (type: string, packages: string[], commandName: CommandName): Promise<void> => {
      if (packages.length > 0) {
        log.info(`Installing ${type} in ${installDir} using ${packageManager}...`);
        const installCommand = packageManagerCommands[packageManager][commandName](packages, installDir);

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

    await installPackages('dependencies', dependencies, 'install');
    await installPackages('devDependencies', devDependencies, 'installDev');
  } catch (err) {
    log.error(`Error installing dependencies: ${(err as Error).message}`);
  }
}
