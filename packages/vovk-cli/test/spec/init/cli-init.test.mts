import { it, describe } from 'node:test';
import path from 'node:path';
import fs from 'node:fs/promises';
import omit from 'lodash/omit.js';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import { DOWN, ENTER, SPACE } from '../../lib/runScript.mts';
import type { PackageJson } from 'type-fest';
import NPMCliPackageJson from '@npmcli/package-json';
import { deepStrictEqual } from 'node:assert';
import { runScript } from '../../lib/runScript.mts';

const combos = {
  /*
    Answers sequence for prompts:
    - validationLibrary
    - updateTsConfig
    - bundle
    - updateScripts
    - langs
  */
  NO_VALIDATION: [
    // Validation library: None
    'N',
    ENTER,
    // Update tsconfig.json: Yes
    ENTER,
    // Bundle setup: Yes
    ENTER,
    // Update scripts: Yes
    ENTER,
    // Languages: None
    ENTER,
  ],
  NO_TS_CONFIG_UPDATE: [
    // Validation library: Zod
    ENTER,
    // Update tsconfig.json: No
    'N',
    ENTER,
    // Bundle setup: Yes
    ENTER,
    // Update scripts: Yes
    ENTER,
    // Languages: None
    ENTER,
  ],
  ONE_FLAG_PASSED: [ENTER, ENTER, ENTER, ENTER],
  YES: [ENTER, ENTER, ENTER, ENTER, ENTER],
  RUST: [
    // Validation library: Zod
    ENTER,
    // Update tsconfig.json: Yes
    ENTER,
    // Bundle setup: Yes
    ENTER,
    // Update scripts: Yes
    ENTER,
    // Languages: Rust
    DOWN,
    SPACE,
    ENTER,
  ],
  PYTHON_AND_RUST: [
    // Validation library: Zod
    ENTER,
    // Update tsconfig.json: Yes
    ENTER,
    // Bundle setup: Yes
    ENTER,
    // Update scripts: Yes
    ENTER,
    // Languages: Python, Rust
    SPACE,
    DOWN,
    SPACE,
    ENTER,
  ],
  NO_BUNDLE: [
    // Validation library: Zod
    ENTER,
    // Update tsconfig.json: Yes
    ENTER,
    // Bundle setup: No
    'N',
    ENTER,
    // Update scripts: Yes
    ENTER,
    // Languages: None
    ENTER,
  ],
  VALIBOT: [
    // Validation library: Valibot
    DOWN,
    DOWN,
    SPACE,
    ENTER,
    // Update tsconfig.json: Yes
    ENTER,
    // Bundle setup: Yes
    ENTER,
    // Update scripts: Yes
    ENTER,
    // Languages: None
    ENTER,
  ],
  ARKTYPE: [
    // Validation library: Arktype
    DOWN,
    SPACE,
    ENTER,
    // Update tsconfig.json: Yes
    ENTER,
    // Bundle setup: Yes
    ENTER,
    // Update scripts: Yes
    ENTER,
    // Languages: None
    ENTER,
  ],
};

await describe('CLI init', async () => {
  const dir = 'tmp_test_dir_init';
  const cwd = path.resolve(import.meta.dirname, '../../..');

  const {
    projectDir,
    runAtProjectDir,
    assertConfig,
    assertScripts,
    assertDirExists,
    assertDeps,
    assertFileExists,
    assertNotExists,
    assertTsConfig,
    createNextApp,
  } = getCLIAssertions({ cwd, dir });

  async function vovkInit(flags?: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) {
    // Use --channel=draft for draft features
    const script = `./dist/index.mjs init --prefix ${dir} --log-level=debug ${flags}`;
    return runScript(script, {
      ...options,
      cwd,
    });
  }

  await it('Works with --yes and does not change other scripts', async () => {
    await createNextApp();

    const packageJSON = JSON.parse(await fs.readFile(path.join(cwd, dir, 'package.json'), 'utf-8')) as PackageJson;
    packageJSON.scripts!.test = 'jest';
    await fs.writeFile(path.join(cwd, dir, 'package.json'), JSON.stringify(packageJSON, null, 2));

    await vovkInit('--yes --skip-install');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      test: 'jest',
      build: 'next build',
      prebuild: 'vovk generate',
      bundle: 'vovk bundle',
    });

    await assertTsConfig();

    // check if packages are NOT installed because of --skip-install
    await assertNotExists('./node_modules/vovk');
    await assertNotExists('./node_modules/vovk-cli');
    await assertFileExists('./package-lock.json');
    // check if yarn.lock does not exist
    await assertNotExists('./yarn.lock');
  });

  await it('Works with --yes and --dry-run', async () => {
    await createNextApp();
    await vovkInit('--yes --dry-run');
    await assertConfig([], null);

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod'],
      devDependencies: ['vovk-cli', 'tsdown'],
      opposite: true,
    });

    await assertScripts({
      dev: 'next dev',
    });

    await assertTsConfig(true);

    // check if packages are OK
    await assertNotExists('./node_modules/vovk');
    await assertNotExists('./node_modules/vovk-cli');
    await assertFileExists('./package-lock.json');
  });

  await it('Works with --yes and --update-scripts=implicit --skip-install', async () => {
    await createNextApp();
    await vovkInit('--yes --update-scripts=implicit');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --update-scripts=explicit', async () => {
    await createNextApp();
    await vovkInit('--yes --update-scripts=explicit');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: "PORT=3000 concurrently 'next dev' 'vovk dev' --kill-others",
      build: 'next build',
      prebuild: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Preserves next dev flags with --update-scripts=implicit', async () => {
    await createNextApp();
    await vovkInit('--yes --update-scripts=implicit --skip-install');

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });
  });

  await it('Preserves next dev flags with --update-scripts=explicit', async () => {
    await createNextApp();
    await vovkInit('--yes --update-scripts=explicit');

    await assertScripts({
      dev: "PORT=3000 concurrently 'next dev' 'vovk dev' --kill-others",
    });
  });

  await it('Works with --yes and NO --skip-install', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();

    await assertDirExists('./node_modules/vovk');
    await assertDirExists('./node_modules/vovk-cli');
  });

  await it('Works with --yes and --validation-library=none', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none --skip-install');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig(null));

    await assertDeps({
      dependencies: ['vovk', 'vovk-client'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library=zod', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=zod --skip-install');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Utilizes .config folder', async () => {
    await createNextApp();
    await runAtProjectDir('mkdir .config');
    await vovkInit('--yes --skip-install');
    await assertConfig(['.config/vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with prompting', async () => {
    await createNextApp();
    await vovkInit('--skip-install', { combo: combos.YES });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      build: 'next build',
      prebuild: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and no TSConfig update', async () => {
    await createNextApp();
    await vovkInit('--skip-install', { combo: combos.NO_TS_CONFIG_UPDATE });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      build: 'next build',
      prebuild: 'vovk generate',
    });

    await assertTsConfig(true);
  });

  await it('Works with prompting and --update-ts-config', async () => {
    await createNextApp();
    await vovkInit('--update-ts-config --skip-install', { combo: combos.ONE_FLAG_PASSED });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      build: 'next build',
      prebuild: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and --validation-library=none', async () => {
    await createNextApp();
    await vovkInit('--validation-library=none --skip-install', { combo: combos.ONE_FLAG_PASSED });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig(null));

    await assertDeps({
      dependencies: ['vovk', 'vovk-client'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertDeps({
      dependencies: ['zod'],
      opposite: true,
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      build: 'next build',
      prebuild: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and no validation', async () => {
    await createNextApp();
    await vovkInit('--skip-install', { combo: combos.NO_VALIDATION });
    await assertConfig(['vovk.config.js'], omit(assertConfig.makeConfig(null)));

    await assertDeps({
      dependencies: ['vovk', 'vovk-client', 'vovk-ajv'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertDeps({
      dependencies: ['zod'],
      opposite: true,
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      build: 'next build',
      prebuild: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and down arrow selection for Zod', async () => {
    await createNextApp();
    await vovkInit('--skip-install', { combo: combos.YES });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-client', 'zod'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      build: 'next build',
      prebuild: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and down arrow selection for Arktype', async () => {
    await createNextApp();
    await vovkInit('--skip-install', { combo: combos.ARKTYPE });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('arktype'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-client', 'arktype'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      build: 'next build',
      prebuild: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and down arrow selection for Valibot', async () => {
    await createNextApp();
    await vovkInit('--skip-install', { combo: combos.VALIBOT });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('valibot'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-client', 'valibot', '@valibot/to-json-schema'],
      devDependencies: ['vovk-cli', 'tsdown'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      build: 'next build',
      prebuild: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Uses Rust template', async () => {
    await createNextApp();
    await vovkInit('--skip-install', { combo: combos.RUST });
    await assertConfig(
      ['vovk.config.js'],
      assertConfig.makeConfig('zod', {
        composedClient: {
          fromTemplates: ['js', 'rs'],
        },
      })
    );

    const { config } = await assertConfig.getStrictConfig();

    deepStrictEqual(JSON.parse(JSON.stringify(config.composedClient)), {
      enabled: true,
      fromTemplates: ['js', 'rs'],
      outDir: './node_modules/.vovk-client',
      prettifyClient: false,
    });

    await assertDeps({
      dependencies: ['vovk'],
      devDependencies: ['vovk-cli', 'vovk-rust'],
    });

    await assertDeps({
      dependencies: ['vovk-python'],
      opposite: true,
    });

    await assertTsConfig();
  });

  await it('Uses Python and Rust template', async () => {
    await createNextApp();
    await vovkInit('--skip-install', { combo: combos.PYTHON_AND_RUST });
    await assertConfig(
      ['vovk.config.js'],
      assertConfig.makeConfig('zod', {
        composedClient: {
          fromTemplates: ['js', 'py', 'rs'],
        },
      })
    );

    const { config } = await assertConfig.getStrictConfig();

    deepStrictEqual(JSON.parse(JSON.stringify(config.composedClient)), {
      enabled: true,
      fromTemplates: ['js', 'py', 'rs'],
      outDir: './node_modules/.vovk-client',
      prettifyClient: false,
    });

    await assertDeps({
      dependencies: ['vovk'],
      devDependencies: ['vovk-cli', 'vovk-rust'],
    });

    await assertDeps({
      dependencies: ['vovk-python'],
      opposite: true,
    });

    await assertTsConfig();
  });

  await describe('Yarn-specific tests (NO --skip-install)', async () => {
    await it('Works with prompting and --use-yarn', async () => {
      await createNextApp('--use-yarn');
      // Add packageManager: yarn to package.json
      const pkgJson = await NPMCliPackageJson.load(projectDir);
      pkgJson.update({
        packageManager: 'yarn@1.22.22',
      });
      await pkgJson.save();
      await vovkInit('--use-yarn', { combo: combos.YES });
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-ajv', 'zod', 'vovk-client'],
        devDependencies: ['vovk-cli', 'tsdown'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
        build: 'next build',
        prebuild: 'vovk generate',
      });

      await assertTsConfig();

      await assertDirExists('./node_modules/vovk');
      await assertDirExists('./node_modules/vovk-cli');

      await assertNotExists('./package-lock.json');
      await assertFileExists('./yarn.lock');
    });

    await it('Works with --yes and --use-yarn', async () => {
      await createNextApp('--use-yarn');
      // Add packageManager: yarn to package.json
      const pkgJson = await NPMCliPackageJson.load(projectDir);
      pkgJson.update({
        packageManager: 'yarn@1.22.22',
      });
      await pkgJson.save();
      await vovkInit('--yes --use-yarn');
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-ajv', 'zod'],
        devDependencies: ['vovk-cli', 'tsdown'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
        build: 'next build',
        prebuild: 'vovk generate',
      });

      await assertTsConfig();

      // check if packages are installed
      await assertDirExists('./node_modules/vovk');
      await assertDirExists('./node_modules/vovk-cli');

      await assertNotExists('./package-lock.json');

      await assertFileExists('./yarn.lock');
    });
  });

  await describe('Bun-specific tests (NO --skip-install)', async () => {
    await it('Works with prompting and --use-bun', async () => {
      await createNextApp('--use-bun');
      // Add packageManager: bun to package.json
      const pkgJson = await NPMCliPackageJson.load(projectDir);
      pkgJson.update({
        packageManager: 'bun@1.2.13',
      });
      await pkgJson.save();
      await vovkInit('--use-bun', { combo: combos.YES });
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-ajv', 'zod', 'vovk-client'],
        devDependencies: ['vovk-cli', 'tsdown'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
        build: 'next build',
        prebuild: 'vovk generate',
      });

      await assertTsConfig();

      await assertDirExists('./node_modules/vovk');
      await assertDirExists('./node_modules/vovk-cli');

      await assertNotExists('./package-lock.json');
      await assertFileExists('./bun.lock');
    });

    await it('Works with --yes and --use-bun', async () => {
      await createNextApp('--use-bun');
      // Add packageManager: bun to package.json
      const pkgJson = await NPMCliPackageJson.load(projectDir);
      pkgJson.update({
        packageManager: 'bun@1.2.13',
      });
      await pkgJson.save();
      await vovkInit('--yes --use-bun');
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-ajv', 'zod'],
        devDependencies: ['vovk-cli', 'tsdown'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
        build: 'next build',
        prebuild: 'vovk generate',
      });

      await assertTsConfig();

      // check if packages are installed
      await assertDirExists('./node_modules/vovk');
      await assertDirExists('./node_modules/vovk-cli');

      await assertNotExists('./package-lock.json');
      await assertFileExists('./bun.lock');
    });
  });

  await describe('pnpm-specific tests (NO --skip-install)', async () => {
    await it('Works with prompting and --use-pnpm', async () => {
      await createNextApp('--use-pnpm');
      // Add packageManager: pnpm to package.json
      const pkgJson = await NPMCliPackageJson.load(projectDir);
      pkgJson.update({
        packageManager: 'pnpm@8.6.0',
      });
      await pkgJson.save();
      // The last ENTER is made to confim pnpm prompt "✔ The modules directory at "/Users/finom/Work/vovk/packages/vovk-cli/tmp_test_dir/node_modules" will be removed and reinstalled from scratch. Proceed? (Y/n)"
      await vovkInit('--use-pnpm --log-level debug', { combo: [...combos.YES, ENTER] });
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-ajv', 'zod', 'vovk-client'],
        devDependencies: ['vovk-cli', 'tsdown'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
        build: 'next build',
        prebuild: 'vovk generate',
      });

      await assertTsConfig();

      await assertDirExists('./node_modules/vovk');
      await assertDirExists('./node_modules/vovk-cli');

      await assertNotExists('./package-lock.json');
      await assertFileExists('./pnpm-lock.yaml');
    });

    await it('Works with --yes and --use-pnpm', async () => {
      await createNextApp('--use-pnpm');
      // Add packageManager: pnpm to package.json
      const pkgJson = await NPMCliPackageJson.load(projectDir);
      pkgJson.update({
        packageManager: 'pnpm@8.6.0',
      });
      await pkgJson.save();
      await vovkInit('--yes --use-pnpm', { combo: [ENTER, ENTER] });
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-ajv', 'zod'],
        devDependencies: ['vovk-cli', 'tsdown'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
        build: 'next build',
        prebuild: 'vovk generate',
      });

      await assertTsConfig();

      // check if packages are installed
      await assertDirExists('./node_modules/vovk');
      await assertDirExists('./node_modules/vovk-cli');

      // check if packages are not installed
      await assertNotExists('./package-lock.json');
      await assertFileExists('./pnpm-lock.yaml');
    });
  });
});
