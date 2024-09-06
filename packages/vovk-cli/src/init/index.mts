#!/usr/bin/env node
/*
npx vovk-cli init
- Check if the project is already initialized
  - Do you want to reinitialize the project?
    - Yes
    - No (exit)
- Check for package.json, if not found, show error and exit
- Check for tsconfig.json, if not found, show error and exit
- Check Next.js installed
- Choose validation library: add to the installation list
    - vovk-zod
        - Further installation notes: install zod
    - vovk-yup
        - Further installation notes: install yup
    - vovk-dto
        - Further installation notes: install class-validator and class-transformer
    - None
- If validation library is not None,
    - Do you want to enable client validation?
        - Yes 
            - Add client validation to the config
        - No
- Do you want to update NPM scripts?
    - Yes
        - Update NPM scripts
    - No
- Do you want to use explicit concurrently?
    - Yes (recommended)
        - Add concurrently to the installation list
    - No
- if experimentalDecorators is not found in tsconfig.json,
    - Do you want to add experimentalDecorators to tsconfig.json?
        - Yes
            - Add experimentalDecorators to tsconfig.json
        - No
- Do you want to create route file with example service and controller? (NO NEED)
    - Yes
        - Create route file with example controller
    - No, I will create it myself
- End
    - If there are any packages to install, install them
    - Show installation notes
    - If there are any files to create, create
    - If there are any config files to update, update
    - If example route file is NOT created, show example route file and controller
    - Show how to run the project
        - If npm scripts are updated
            - npm run dev
        - If npm scripts are NOT updated
            - If concurrently is installed
                - concurrently "vovk dev" "next dev"
            - If concurrently is NOT installed
                - vovk dev --next-dev
        - Open http://localhost:3000/api/hello-world
        - Show how to make a request to the example route
    - Show success message
*/

import { confirm, select } from '@inquirer/prompts';
import NPMCliPackageJson from '@npmcli/package-json';
import type { TsConfigJson } from 'type-fest';
import path from 'path';
import fs from 'fs/promises';
import * as jsonc from 'jsonc-parser';
import type { VovkConfig } from '../types.mjs';
import getConfigPath from '../getProjectInfo/getConfigPath.mjs';
import type { InitOptions } from '../index.mjs';
import chalk from 'chalk';
import fileExists from '../utils/fileExists.mjs';
import installDependencies from './installDependencies.mjs';
import getLogger from '../utils/getLogger.mjs';

abstract class Action<T> {
  data: T;
  // public prevAction: Action | null = null;
  action: () => void;
  constructor(public context: Context) {}
  toJSON = () => this.data;
}

class InstallValidationLibraryAction extends Action<{
  validationLibrary: string | null;
  enableClientValidation?: boolean;
}> {
  constructor(context: Context, data: InstallValidationLibraryAction['data']) {
    super(context);

    this.data = data;
  }

  action = () => {
    this.context.vovkConfig.validationLibrary = this.data.validationLibrary;
    if (this.data.validationLibrary && this.data.enableClientValidation) {
      this.context.vovkConfig.validateOnClient = `${this.data.validationLibrary}/validateOnClient`;
    }
  };
}

class UpdateNpmScriptsAction extends Action<{ shouldUpdateNpmScripts: boolean; useConcurrently?: boolean }> {
  constructor(context: Context) {
    super(context);

    this.data = { shouldUpdateNpmScripts: true };
  }

  action = async () => {
    if (this.data.shouldUpdateNpmScripts && typeof this.data.useConcurrently === 'undefined') {
      throw new Error('useConcurrently must be defined');
    }

    const pkgJson = await NPMCliPackageJson.load(this.context.root);

    pkgJson.update({
      scripts: {
        generate: 'vovk generate',
        dev: this.data.useConcurrently
          ? 'PORT=3000 concurrently "vovk dev" "next dev" --kill-others'
          : 'vovk dev --next-dev',
      },
    });

    await pkgJson.save();
  };
}

class UpdateTsconfigAction extends Action<null> {
  constructor(context: Context) {
    super(context);
  }

  action = async () => {
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');

    try {
      // Read the content of tsconfig.json asynchronously
      const tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');

      // Use jsonc-parser to generate edits and modify the experimentalDecorators property
      const edits = jsonc.modify(tsconfigContent, ['compilerOptions', 'experimentalDecorators'], true, {
        formattingOptions: {},
      });

      // Apply the edits to the original content
      const updatedContent = jsonc.applyEdits(tsconfigContent, edits);

      // Write the updated content back to the file asynchronously
      await fs.writeFile(tsconfigPath, updatedContent, 'utf8');
    } catch (error) {
      throw new Error(`Failed to update tsconfig.json at ${tsconfigPath}. ${String(error)}`);
    }
  };

  static async checkTsconfigForExperimentalDecorators() {
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');
    let tsconfigContent: string;
    try {
      tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');
    } catch (error) {
      throw new Error(
        `Failed to read tsconfig.json at ${tsconfigPath}. You can run "npx tsc --init" to create it. ${String(error)}`
      );
    }

    const tsconfig = jsonc.parse(tsconfigContent) as TsConfigJson;

    return !!tsconfig?.compilerOptions?.experimentalDecorators;
  }
}

class Context {
  actions: Action<unknown>[] = [];
  vovkConfig: VovkConfig = {};
  root: string;
  log: ReturnType<typeof getLogger>;

  static async main(prefix: string, { yes, logLevel }: InitOptions) {
    // TODO handle yes option
    console.log('yes', yes);
    const context = new Context();
    const cwd = process.cwd();
    const configPath = await getConfigPath(prefix);
    const toBeInstalled: string[] = ['vovk'];
    const root = path.join(cwd, prefix);
    const log = getLogger(logLevel);

    context.root = root;
    context.log = log;

    if (!(await fileExists(path.join(root, 'package.json')))) {
      throw new Error(`package.json not found at ${root}. Run "npx create-next-app" to create a new Next.js project.`);
    }

    if (!(await fileExists(path.join(root, 'tsconfig.json')))) {
      throw new Error(`tsconfig.json not found at ${root}. Run "npx tsc --init" to create a new tsconfig.json file.`);
    }

    if (configPath) {
      if (
        !(await confirm({
          message: `Found existing config file at ${configPath}. Do you want to reinitialize the project?`,
        }))
      )
        return;
    }

    const validationLibrary = await select({
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
          description: 'Use class-validator and class-transformer for data validation',
        },
        { name: 'None', value: null, description: 'Install validation library later' },
      ],
    });

    if (validationLibrary) {
      toBeInstalled.push(validationLibrary);
      toBeInstalled.push(
        ...({
          'vovk-zod': ['zod'],
          'vovk-yup': ['yup'],
          'vovk-dto': ['class-validator', 'class-transformer'],
        }[validationLibrary] ?? [])
      );
      const installValidationLibraryAction = new InstallValidationLibraryAction(context, { validationLibrary });
      context.actions.push(installValidationLibraryAction);

      installValidationLibraryAction.data.enableClientValidation = await confirm({
        message: 'Do you want to enable client validation?',
      });
    }

    const devScriptType = await select({
      message: 'Do you want to update package.json by adding "generate" and "dev" scripts?',
      default: 'IMPLICIT',
      choices: [
        {
          name: 'Yes, with implicit concurrently',
          description: `The "dev" script will use concurrently API internally and automatically set a port ${chalk.whiteBright(`"vovk dev --next-dev"`)}`,
          value: 'IMPLICIT' as const,
        },
        {
          name: 'Yes, with explicit concurrently',
          value: 'EXPLICIT' as const,
          description: `The "dev" script will use pre-defined PORT variable ${chalk.whiteBright(`"PORT=3000 concurrently 'vovk dev' 'next dev' --kill-others"`)}`,
        },
        {
          name: 'No',
          value: null,
          description: 'Add the scripts manually',
        },
      ],
    });

    if (devScriptType) {
      const updateNpmScriptsAction = new UpdateNpmScriptsAction(context);
      context.actions.push(updateNpmScriptsAction);

      updateNpmScriptsAction.data.useConcurrently = devScriptType === 'EXPLICIT';
    }

    if (
      !(await UpdateTsconfigAction.checkTsconfigForExperimentalDecorators()) &&
      (await confirm({ message: 'Do you want to add experimentalDecorators to tsconfig.json?' }))
    ) {
      const updateTsconfigAction = new UpdateTsconfigAction(context);
      context.actions.push(updateTsconfigAction);
    }

    await installDependencies(root, toBeInstalled, ['concurrently', 'vovk-cli']);
  }
}

export const Init = Context;
