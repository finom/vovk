import { confirm, select, checkbox } from '@inquirer/prompts';
import path from 'node:path';
import fs from 'node:fs/promises';
import chalk from 'chalk';
import NPMCliPackageJson from '@npmcli/package-json';
import { getConfigAbsolutePaths } from '../getProjectInfo/getConfig/getConfigAbsolutePaths.mjs';
import { getFileSystemEntryType } from '../utils/getFileSystemEntryType.mjs';
import { installDependencies, getPackageManager } from './installDependencies.mjs';
import { getLogger } from '../utils/getLogger.mjs';
import { createConfig } from './createConfig.mjs';
import { updateNPMScripts, getDevScript } from './updateNPMScripts.mjs';
import { checkTSConfigForExperimentalDecorators } from './checkTSConfigForExperimentalDecorators.mjs';
import { updateTypeScriptConfig } from './updateTypeScriptConfig.mjs';
import { updateDependenciesWithoutInstalling } from './updateDependenciesWithoutInstalling.mjs';
import { logUpdateDependenciesError } from './logUpdateDependenciesError.mjs';
import { chalkHighlightThing } from '../utils/chalkHighlightThing.mjs';
import type { InitOptions } from '../types.mjs';

export class Init {
  root: string;
  log: ReturnType<typeof getLogger>;

  async #init(
    {
      configPaths,
      pkgJson,
    }: {
      configPaths: string[];
      pkgJson: NPMCliPackageJson | null;
      cwd: string;
    },
    {
      useNpm,
      useYarn,
      usePnpm,
      useBun,
      skipInstall,
      updateTsConfig,
      updateScripts,
      validationLibrary,
      bundle,
      lang,
      dryRun,
      channel,
    }: Omit<InitOptions, 'yes' | 'logLevel'>
  ) {
    const { log, root } = this;

    const dependencies: string[] = ['vovk', 'vovk-client', 'vovk-ajv'];
    const devDependencies: string[] = ['vovk-cli'];

    if (lang?.includes('py')) {
      devDependencies.push('vovk-python');
    }
    if (lang?.includes('rs')) {
      devDependencies.push('vovk-rust');
    }

    // delete older config files
    if (configPaths.length) {
      await Promise.all(configPaths.map((configPath) => fs.rm(configPath)));
      log.debug(`Deleted existing config file${configPaths.length > 1 ? 's' : ''} at ${configPaths.join(', ')}`);
    }

    if (validationLibrary) {
      dependencies.push(
        ...({
          zod: ['zod'],
          valibot: ['valibot', '@valibot/to-json-schema'],
          arktype: ['arktype'],
        }[validationLibrary] ?? [])
      );
    }

    if (bundle) {
      devDependencies.push('tsdown');
    }

    if (updateScripts) {
      try {
        if (!dryRun && pkgJson) await updateNPMScripts({ pkgJson, root, bundle, updateScriptsMode: updateScripts });
        log.info('Updated scripts at package.json');
      } catch (error) {
        log.error(`Failed to update scripts at package.json: ${(error as Error).message}`);
      }
      if (updateScripts === 'explicit') {
        devDependencies.push('concurrently');
      }
    }

    if (updateTsConfig) {
      try {
        const compilerOptions: Record<string, true> = {
          experimentalDecorators: true,
        };

        if (!dryRun) await updateTypeScriptConfig(root, compilerOptions);
        log.info(
          `Added ${Object.keys(compilerOptions)
            .map((k) => `"${k}"`)
            .join(' and ')} to tsconfig.json`
        );
      } catch (error) {
        log.error(`Failed to update tsconfig.json: ${(error as Error).message}`);
      }
    }

    if (!dryRun && pkgJson) {
      let depsUpdated = false;
      const packageManager = getPackageManager({ useNpm, useYarn, usePnpm, useBun, pkgJson });
      try {
        await updateDependenciesWithoutInstalling({
          log,
          dir: root,
          dependencyNames: dependencies,
          devDependencyNames: devDependencies,
          channel: channel ?? 'latest',
        });

        depsUpdated = true;
      } catch (e) {
        const error = e as Error;
        logUpdateDependenciesError({
          log,
          error,
          packageManager,
          dependencies,
          devDependencies,
          channel,
        });
      }

      if (depsUpdated) {
        if (skipInstall) {
          log.info(
            `Installation skipped. Please, install them manually with ${chalkHighlightThing(packageManager + ' install')}`
          );
        } else {
          try {
            await installDependencies({
              log,
              cwd: root,
              packageManager,
            });

            log.info('Dependencies installed successfully');
          } catch (error) {
            log.warn(
              `Failed to install dependencies. ${(error as Error).message}. Please, install them manually with ${chalkHighlightThing(packageManager + ' install')}`
            );
          }
        }
      }
    }

    try {
      const { configAbsolutePath } = await createConfig({
        root,
        log,
        options: { validationLibrary, channel, bundle, lang, dryRun },
      });

      log.info('Config created successfully at ' + chalkHighlightThing(configAbsolutePath));
      log.info(`You can now create a root segment with ${chalkHighlightThing('npx vovk new segment')} command`);
    } catch (error) {
      log.error(
        `Failed to create config: ${(error as Error).message}. Please, refer to the documentation at https://vovk.dev/config`
      );
    }
  }

  async main({
    prefix,
    yes,
    logLevel,
    useNpm,
    useYarn,
    usePnpm,
    useBun,
    skipInstall,
    updateTsConfig,
    updateScripts,
    validationLibrary,
    bundle,
    lang,
    dryRun,
    channel,
  }: InitOptions) {
    const cwd = process.cwd();
    const root = path.resolve(cwd, prefix ?? '.');
    const log = getLogger(logLevel ?? 'info');
    const pkgJson = await NPMCliPackageJson.load(root).catch(() => null);

    this.root = root;
    this.log = log;

    const configPaths = await getConfigAbsolutePaths({ cwd, relativePath: prefix });

    if (yes) {
      return this.#init({ configPaths, pkgJson, cwd }, {
        prefix: prefix ?? '.',
        useNpm: useNpm ?? false,
        useYarn: useYarn ?? false,
        usePnpm: usePnpm ?? false,
        useBun: useBun ?? false,
        skipInstall: skipInstall ?? false,
        updateTsConfig: updateTsConfig ?? true,
        updateScripts: updateScripts ?? 'implicit',
        validationLibrary: validationLibrary?.toLocaleLowerCase() === 'none' ? null : (validationLibrary ?? 'zod'),
        bundle: bundle ?? true,
        dryRun: dryRun ?? false,
        channel: channel ?? 'latest',
        lang: lang ?? [],
      } satisfies Required<Omit<InitOptions, 'yes' | 'logLevel'>>);
    }

    if (!(await getFileSystemEntryType(path.join(root, 'package.json')))) {
      log.warn(
        `${chalkHighlightThing('package.json')} not found at ${chalkHighlightThing(root)}. Run "npx create-next-app" to create a new Next.js project
        .`
      );
    } else if (pkgJson && !(await getFileSystemEntryType(path.join(root, 'tsconfig.json')))) {
      log.warn(
        `${chalkHighlightThing('tsconfig.json')} not found at ${chalkHighlightThing(root)}. Run "npx tsc --init" to create a new tsconfig.json file.`
      );
    }

    if (configPaths.length) {
      if (
        !(await confirm({
          message: `Found existing config file${configPaths.length > 1 ? 's' : ''} at ${configPaths.join(', ')}. Do you want to reinitialize the project?`,
        }))
      )
        return;
    }

    validationLibrary =
      validationLibrary?.toLowerCase() === 'none'
        ? null
        : (validationLibrary ??
          (await select({
            message: 'Choose validation library',
            default: 'zod',
            choices: [
              {
                name: 'Zod',
                value: 'zod',
                description: 'Use Zod for data validation',
              },
              {
                name: 'ArkType',
                value: 'arktype',
                description: 'Use ArkType for data validation.',
              },
              {
                name: 'Valibot',
                value: 'valibot',
                description: 'Use Valibot for data validation.',
              },
              { name: 'None', value: null, description: 'Install validation library later' },
            ],
          })));

    if (typeof updateTsConfig === 'undefined' && pkgJson) {
      let shouldAsk = false;

      try {
        shouldAsk = !(await checkTSConfigForExperimentalDecorators(root));
      } catch (error) {
        log.error(`Failed to check tsconfig.json for "experimentalDecorators": ${(error as Error).message}`);
      }

      if (shouldAsk) {
        const keys = ['experimentalDecorators'];
        updateTsConfig = await confirm({
          message: `Do you want to add ${keys.map((k) => `"${k}"`).join(' and ')} to tsconfig.json? (recommended)`,
        });
      }
    }

    bundle ??= await confirm({
      message: 'Do you want to set up "tsdown" to bundle TypeScript client?',
      default: true,
    });

    updateScripts ??= !pkgJson
      ? undefined
      : await select({
          message: `Do you want to update "dev" and add "prebuild"${bundle ? ' and "bundle"' : ''} NPM scripts at package.json (recommended)?`,
          default: 'implicit',
          choices: [
            {
              name: 'Yes, use "concurrently" implicitly',
              value: 'implicit' as const,
              description: `The ${chalk.cyanBright.bold(`"dev"`)} script will use concurrently API to run "next dev" and "vovk dev" commands at the same time. It will automatically find an available port, running ${chalk.cyanBright.bold(`"${getDevScript(pkgJson, 'implicit')}"`)}. The ${chalk.cyanBright.bold(`"prebuild"`)} script will be set to ${chalk.cyanBright.bold(`"vovk generate"`)}`,
            },
            {
              name: 'Yes, use "concurrently" explicitly',
              value: 'explicit' as const,
              description: `The ${chalk.cyanBright.bold(`"dev"`)} script will use pre-defined PORT variable to run "next dev" and "vovk dev" as "concurrently" CLI arguments ${chalk.cyanBright.bold(`"${getDevScript(pkgJson, 'explicit')}"`)}. The ${chalk.cyanBright.bold(`"prebuild"`)} script will be set to ${chalk.cyanBright.bold(`"vovk generate"`)}`,
            },
            {
              name: 'No',
              value: undefined,
              description: 'Add the NPM scripts manually',
            },
          ],
        });

    lang ??= await checkbox({
      message: 'Do you want to generate RPC client for other languages besides TypeScript (experimental)?',
      choices: [
        { name: 'Python', value: 'py' },
        { name: 'Rust', value: 'rs' },
      ],
    });

    await this.#init(
      { configPaths, pkgJson, cwd },
      {
        useNpm: useNpm ?? false,
        useYarn: useYarn ?? false,
        usePnpm: usePnpm ?? false,
        useBun: useBun ?? false,
        skipInstall: skipInstall ?? false,
        updateTsConfig,
        updateScripts,
        validationLibrary,
        bundle,
        lang,
        dryRun,
        channel,
      }
    );
  }
}
