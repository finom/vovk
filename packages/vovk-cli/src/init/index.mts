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
import { createStandardSchemaValidatorFile } from './createStandardSchemaValidatorFile.mjs';

export class Init {
  root: string;
  log: ReturnType<typeof getLogger>;

  async #init(
    {
      configPaths,
      pkgJson,
      cwd = process.cwd(),
    }: {
      configPaths: string[];
      pkgJson: NPMCliPackageJson;
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
      lang,
      dryRun,
      channel,
    }: Omit<InitOptions, 'yes' | 'logLevel'>
  ) {
    const { log, root } = this;
    const dependencies: string[] = ['vovk', 'vovk-client', 'openapi3-ts', 'vovk-ajv', 'ajv'];
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
          zod: ['zod', 'vovk-zod'],
          'class-validator': [
            'class-validator',
            'class-transformer',
            'dto-mapped-types',
            'reflect-metadata',
            'vovk-dto',
          ],
          yup: ['yup', 'vovk-yup'],
          valibot: ['valibot', '@valibot/to-json-schema'],
          arktype: ['arktype'],
        }[validationLibrary] ?? [])
      );
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

        if (validationLibrary === 'class-validator') {
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

    if (validationLibrary === 'valibot' || validationLibrary === 'arktype') {
      createStandardSchemaValidatorFile({
        cwd,
        validationLibrary,
      });
    }

    try {
      const { configAbsolutePath } = await createConfig({
        root,
        log,
        options: { validationLibrary, channel, lang, dryRun },
      });

      log.info('Config created successfully at ' + chalkHighlightThing(configAbsolutePath));
    } catch (error) {
      log.error(`Failed to create config: ${(error as Error).message}`);
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
    lang,
    dryRun,
    channel,
  }: InitOptions) {
    const cwd = process.cwd();
    const root = path.resolve(cwd, prefix ?? '.');
    const log = getLogger(logLevel ?? 'info');
    const pkgJson = await NPMCliPackageJson.load(root);

    this.root = root;
    this.log = log;

    const configPaths = await getConfigPaths({ cwd, relativePath: prefix });

    if (yes) {
      return this.#init({ configPaths, pkgJson, cwd }, {
        prefix: prefix ?? '.',
        useNpm: useNpm ?? (!useYarn && !usePnpm && !useBun),
        useYarn: useYarn ?? false,
        usePnpm: usePnpm ?? false,
        useBun: useBun ?? false,
        skipInstall: skipInstall ?? false,
        updateTsConfig: updateTsConfig ?? true,
        updateScripts: updateScripts ?? 'implicit',
        validationLibrary: validationLibrary?.toLocaleLowerCase() === 'none' ? null : (validationLibrary ?? 'zod'),
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
            default: 'zod',
            choices: [
              {
                name: 'Zod',
                value: 'zod',
                description: 'Use Zod for data validation',
              },
              {
                name: 'class-validator',
                value: 'class-validator',
                description: 'Use class-validator for data validation',
              },
              {
                name: 'Valibot',
                value: 'valibot',
                description: 'Use valibot for data validation.',
              },
              {
                name: 'ArkType',
                value: 'arktype',
                description: 'Use arktype for data validation.',
              },
              { name: 'None', value: null, description: 'Install validation library later' },
            ],
          })));

    updateScripts ??= await select({
      message: 'Do you want to update "dev" and "build" NPM scripts at package.json?',
      default: 'implicit',
      choices: [
        {
          name: 'Yes, use "concurrently" implicitly',
          value: 'implicit' as const,
          description: `The "dev" script will use "concurrently" API to run "next dev" and "vovk dev" commands together and automatically find an available port ${chalk.whiteBright.bold(`"${getDevScript(pkgJson, 'implicit')}"`)} and the "prebuild" script will run "vovk generate"`,
        },
        {
          name: 'Yes, use "concurrently" explicitly',
          value: 'explicit' as const,
          description: `The "dev" script will use pre-defined PORT variable and run "next dev" and "vovk dev" as "concurrently" CLI arguments ${chalk.whiteBright.bold(`"${getDevScript(pkgJson, 'explicit')}"`)} and the "prebuild" script will run "vovk generate"`,
        },
        {
          name: 'No',
          value: undefined,
          description: 'Add the NPM scripts manually',
        },
      ],
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
        if (validationLibrary === 'class-validator') {
          keys.push('emitDecoratorMetadata');
        }
        updateTsConfig = await confirm({
          message: `Do you want to add ${keys.map((k) => `"${k}"`).join(' and ')} to tsconfig.json? (recommended)`,
        });
      }
    }

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
        useNpm: useNpm ?? (!useYarn && !usePnpm && !useBun),
        useYarn: useYarn ?? false,
        usePnpm: usePnpm ?? false,
        useBun: useBun ?? false,
        skipInstall: skipInstall ?? false,
        updateTsConfig,
        updateScripts,
        validationLibrary,
        lang,
        dryRun,
        channel,
      }
    );
  }
}
