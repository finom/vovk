import { confirm, select, checkbox } from '@inquirer/prompts';
import path from 'node:path';
import fs from 'node:fs/promises';
import chalk from 'chalk';
import NPMCliPackageJson from '@npmcli/package-json';
import getConfigPaths from '../getProjectInfo/getConfig/getConfigAbsolutePaths.mjs';
import getFileSystemEntryType from '../utils/getFileSystemEntryType.mjs';
import installDependencies, { getPackageManager } from './installDependencies.mjs';
import getLogger from '../utils/getLogger.mjs';
import createConfig from './createConfig.mjs';
import updateNPMScripts, { getDevScript } from './updateNPMScripts.mjs';
import checkTSConfigForExperimentalDecorators from './checkTSConfigForExperimentalDecorators.mjs';
import updateTypeScriptConfig from './updateTypeScriptConfig.mjs';
import updateDependenciesWithoutInstalling from './updateDependenciesWithoutInstalling.mjs';
import logUpdateDependenciesError from './logUpdateDependenciesError.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
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
      pkgJson: NPMCliPackageJson;
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
      reactQuery,
      lang,
      dryRun,
      channel,
    }: Omit<InitOptions, 'yes' | 'logLevel'>
  ) {
    const { log, root } = this;
    const dependencies: string[] = ['vovk', 'vovk-client', 'vovk-openapi'];
    const devDependencies: string[] = ['vovk-cli'];

    if (lang?.includes('py')) {
      dependencies.push('vovk-python-client');
    }
    if (lang?.includes('rs')) {
      dependencies.push('vovk-rust-client');
    }

    // delete older config files
    if (configPaths.length) {
      await Promise.all(configPaths.map((configPath) => fs.rm(configPath)));
      log.debug(`Deleted existing config file${configPaths.length > 1 ? 's' : ''} at ${configPaths.join(', ')}`);
    }

    if (validationLibrary) {
      dependencies.push(
        validationLibrary,
        'vovk-ajv',
        ...({
          'vovk-zod': ['zod'],
          'vovk-yup': ['yup'],
          'vovk-dto': ['class-validator', 'class-transformer', 'dto-mapped-types', 'reflect-metadata'],
        }[validationLibrary] ?? [])
      );
    }

    if (reactQuery) {
      dependencies.push('vovk-react-query', '@tanstack/react-query');
    }

    if (updateScripts) {
      try {
        if (!dryRun) await updateNPMScripts(pkgJson, root, updateScripts);
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

        if (validationLibrary === 'vovk-dto') {
          compilerOptions.emitDecoratorMetadata = true;
        }
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

    if (!dryRun) {
      let depsUpdated = false;
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
          useNpm,
          useYarn,
          usePnpm,
          useBun,
          dependencies,
          devDependencies,
          channel,
        });
      }

      if (depsUpdated) {
        const packageManager = getPackageManager({ useNpm, useYarn, usePnpm, useBun });
        if (skipInstall) {
          log.info(
            `Installation skipped. Please, install them manually with ${chalkHighlightThing(packageManager + ' install')}`
          );
        } else {
          try {
            await installDependencies({
              log,
              cwd: root,
              options: {
                useNpm,
                useYarn,
                usePnpm,
                useBun,
              },
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
        options: { validationLibrary, reactQuery, channel, lang, dryRun },
      });

      log.info('Config created successfully at ' + configAbsolutePath);
    } catch (error) {
      log.error(`Failed to create config: ${(error as Error).message}`);
    }
  }

  async main(
    prefix: string,
    {
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
      reactQuery,
      lang,
      dryRun,
      channel,
    }: InitOptions
  ) {
    const cwd = process.cwd();
    const root = path.resolve(cwd, prefix);
    const log = getLogger(logLevel);
    const pkgJson = await NPMCliPackageJson.load(root);

    this.root = root;
    this.log = log;

    const configPaths = await getConfigPaths({ cwd, relativePath: prefix });

    if (yes) {
      return this.#init({ configPaths, pkgJson }, {
        useNpm: useNpm ?? (!useYarn && !usePnpm && !useBun),
        useYarn: useYarn ?? false,
        usePnpm: usePnpm ?? false,
        useBun: useBun ?? false,
        skipInstall: skipInstall ?? false,
        updateTsConfig: updateTsConfig ?? true,
        updateScripts: updateScripts ?? 'implicit',
        validationLibrary: validationLibrary?.toLocaleLowerCase() === 'none' ? null : (validationLibrary ?? 'vovk-zod'),
        reactQuery: reactQuery ?? true,
        dryRun: dryRun ?? false,
        channel: channel ?? 'latest',
        lang: lang ?? [],
      } satisfies Required<Omit<InitOptions, 'yes' | 'logLevel'>>);
    }

    if (!(await getFileSystemEntryType(path.join(root, 'package.json')))) {
      throw new Error(`package.json not found at ${root}. Run "npx create-next-app" to create a new Next.js project.`);
    }

    if (!(await getFileSystemEntryType(path.join(root, 'tsconfig.json')))) {
      throw new Error(`tsconfig.json not found at ${root}. Run "npx tsc --init" to create a new tsconfig.json file.`);
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
            default: 'vovk-zod',
            choices: [
              {
                name: 'vovk-zod',
                value: 'vovk-zod',
                description: 'Use Zod for data validation',
              },
              {
                name: 'vovk-yup',
                value: 'vovk-yup',
                description: 'Use Yup for data validation',
              },
              {
                name: 'vovk-dto',
                value: 'vovk-dto',
                description:
                  'Use class-validator for data validation. Also installs class-transformer, dto-mapped-types and reflect-metadata',
              },
              { name: 'None', value: null, description: 'Install validation library later' },
            ],
          })));

    updateScripts ??= await select({
      message: 'Do you want to update "dev" NPM script at package.json?',
      default: 'implicit',
      choices: [
        {
          name: 'Yes, use "concurrently" implicitly',
          value: 'implicit' as const,
          description: `The script will use "concurrently" API to run "next dev" and "vovk dev" commands together and automatically find an available port ${chalk.whiteBright.bold(`"${getDevScript(pkgJson, 'implicit')}"`)}`,
        },
        {
          name: 'Yes, use "concurrently" explicitly',
          value: 'explicit' as const,
          description: `The script will use pre-defined PORT variable and run "next dev" and "vovk dev" as "concurrently" CLI arguments ${chalk.whiteBright.bold(`"${getDevScript(pkgJson, 'explicit')}"`)}`,
        },
        {
          name: 'No',
          value: undefined,
          description: 'Add the NPM scripts manually',
        },
      ],
    });

    reactQuery ??= await confirm({
      default: false,
      message: 'Do you want to use @tanstack/react-query for data fetching at React components?',
    });

    if (typeof updateTsConfig === 'undefined') {
      let shouldAsk = false;

      try {
        shouldAsk = !(await checkTSConfigForExperimentalDecorators(root)); // TODO also check for emitDecoratorMetadata when vovk-dto is used
      } catch (error) {
        log.error(`Failed to check tsconfig.json for "experimentalDecorators": ${(error as Error).message}`);
      }

      if (shouldAsk) {
        const keys = ['experimentalDecorators'];
        if (validationLibrary === 'vovk-dto') {
          keys.push('emitDecoratorMetadata');
        }
        updateTsConfig = await confirm({
          message: `Do you want to add ${keys.map((k) => `"${k}"`).join(' and ')} to tsconfig.json?`,
        });
      }
    }

    lang ??= await checkbox({
      message: 'Do you want to generate RPC client for other languages besides TypeScript?',
      choices: [
        { name: 'Python', value: 'py' },
        { name: 'Rust', value: 'rs' },
      ],
    });

    await this.#init(
      { configPaths, pkgJson },
      {
        useNpm: useNpm ?? (!useYarn && !usePnpm && !useBun),
        useYarn: useYarn ?? false,
        usePnpm: usePnpm ?? false,
        useBun: useBun ?? false,
        skipInstall: skipInstall ?? false,
        updateTsConfig,
        updateScripts,
        validationLibrary,
        reactQuery,
        lang,
        dryRun,
        channel,
      }
    );
  }
}
