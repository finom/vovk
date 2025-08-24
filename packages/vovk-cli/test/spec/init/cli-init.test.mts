import { it, describe } from 'node:test';
import path from 'node:path';
import fs from 'node:fs/promises';
import omit from 'lodash/omit.js';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import { DOWN, ENTER, SPACE } from '../../lib/runScript.mts';
import type { PackageJson } from 'type-fest';
import NPMCliPackageJson from '@npmcli/package-json';
import { deepStrictEqual } from 'node:assert';

const combos = {
  NO_VALIDATION: ['N', ENTER, ENTER, 'Y', ENTER, ENTER, ENTER],
  NO_TS_CONFIG_UPDATE: [ENTER, ENTER, 'N', ENTER, ENTER],
  ONE_FLAG_PASSED: [ENTER, ENTER, ENTER],
  YUP_VALIDATION_ARROW: [DOWN, ENTER, ENTER, ENTER, ENTER],
  YES: [ENTER, ENTER, ENTER, ENTER, ENTER],
  RUST: [ENTER, ENTER, ENTER, ENTER, DOWN, DOWN, SPACE, ENTER],
};

await describe('CLI init', async () => {
  const dir = 'tmp_test_dir';
  const cwd = path.resolve(import.meta.dirname, '../../..');

  const {
    projectDir,
    runAtProjectDir,
    createNextApp,
    vovkInit,
    assertConfig,
    assertScripts,
    assertDirExists,
    assertDeps,
    assertFileExists,
    assertNotExists,
    assertTsConfig,
  } = getCLIAssertions({ cwd, dir });

  await it('Works with --yes and does not change other scripts', async () => {
    await createNextApp();

    const packageJSON = JSON.parse(await fs.readFile(path.join(cwd, dir, 'package.json'), 'utf-8')) as PackageJson;
    packageJSON.scripts!.test = 'jest';
    await fs.writeFile(path.join(cwd, dir, 'package.json'), JSON.stringify(packageJSON, null, 2));

    await vovkInit('--yes');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      test: 'jest',
      build: 'next build',
    });

    await assertTsConfig();

    // check if packages are installed
    await assertDirExists('./node_modules/vovk');
    await assertDirExists('./node_modules/vovk-cli');
    await assertFileExists('./package-lock.json');
    // check if yarn.lock does not exist
    await assertNotExists('./yarn.lock');
  });

  await it('Works with --yes and --dry-run', async () => {
    await createNextApp('--turbopack');
    await vovkInit('--yes --dry-run');
    await assertConfig([], null);

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod'],
      devDependencies: ['vovk-cli'],
      opposite: true,
    });

    await assertScripts({
      dev: 'next dev --turbopack',
    });

    await assertTsConfig(true);

    // check if packages are OK
    await assertNotExists('./node_modules/vovk');
    await assertNotExists('./node_modules/vovk-cli');
    await assertFileExists('./package-lock.json');
  });

  await it('Works with --yes and --update-scripts=implicit', async () => {
    await createNextApp();
    await vovkInit('--yes --update-scripts=implicit');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --update-scripts=explicit', async () => {
    await createNextApp();
    await vovkInit('--yes --update-scripts=explicit');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: "PORT=3000 concurrently 'next dev' 'vovk dev' --kill-others",
    });

    await assertTsConfig();
  });

  await it('Preserves next dev flags with --update-scripts=implicit', async () => {
    await createNextApp('--turbopack');
    await vovkInit('--yes --update-scripts=implicit');

    await assertScripts({
      dev: 'vovk dev --next-dev -- --turbopack',
    });
  });

  await it('Preserves next dev flags with --update-scripts=explicit', async () => {
    await createNextApp('--turbopack');
    await vovkInit('--yes --update-scripts=explicit');

    await assertScripts({
      dev: "PORT=3000 concurrently 'next dev --turbopack' 'vovk dev' --kill-others",
    });
  });

  await it('Works with --yes and --skip-install', async () => {
    await createNextApp('--skip-install');
    await vovkInit('--yes --skip-install');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();

    await assertNotExists('./node_modules/vovk');
    await assertNotExists('./node_modules/vovk-cli');
  });

  await it('Works with --yes and --validation-library=none', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig(null));

    await assertDeps({
      dependencies: ['vovk', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library=vovk-zod', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=vovk-zod');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library=vovk-yup', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=vovk-yup');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-yup'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-yup', 'yup', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library=vovk-dto', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=vovk-dto');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-dto'));

    await assertDeps({
      dependencies: [
        'vovk',
        'vovk-dto',
        'class-validator',
        'class-transformer',
        'dto-mapped-types',
        'reflect-metadata',
        'vovk-client',
        'vovk-openapi',
      ],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Utilizes .config folder', async () => {
    await createNextApp();
    await runAtProjectDir('mkdir .config');
    await vovkInit('--yes');
    await assertConfig(['.config/vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('If type of package is "module", creates an .mjs file', async () => {
    await createNextApp();
    // set package.json type to module
    const pkgPath = path.join(cwd, dir, 'package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8')) as { type?: string };
    pkg.type = 'module';
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    await vovkInit('--yes');
    await assertConfig(['vovk.config.mjs'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with prompting', async () => {
    await createNextApp();
    await vovkInit('', { combo: combos.YES });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and no TSConfig update', async () => {
    await createNextApp();
    await vovkInit('', { combo: combos.NO_TS_CONFIG_UPDATE });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig(true);
  });

  await it('Works with prompting and --update-ts-config', async () => {
    await createNextApp();
    await vovkInit('--update-ts-config', { combo: combos.ONE_FLAG_PASSED });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and --validation-library', async () => {
    await createNextApp();
    await vovkInit('--validation-library=vovk-dto', { combo: combos.ONE_FLAG_PASSED });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-dto'));

    await assertDeps({
      dependencies: [
        'vovk',
        'vovk-dto',
        'class-validator',
        'class-transformer',
        'dto-mapped-types',
        'reflect-metadata',
        'vovk-client',
        'vovk-openapi',
      ],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and --validation-library=none', async () => {
    await createNextApp();
    await vovkInit('--validation-library=none', { combo: combos.ONE_FLAG_PASSED });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig(null));

    await assertDeps({
      dependencies: ['vovk', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertDeps({
      dependencies: ['vovk-dto', 'vovk-zod', 'vovk-yup', 'zod', 'class-validator', 'class-transformer'],
      opposite: true,
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and no validation', async () => {
    await createNextApp();
    await vovkInit('', { combo: combos.NO_VALIDATION });
    await assertConfig(['vovk.config.js'], omit(assertConfig.makeConfig(null)));

    await assertDeps({
      dependencies: ['vovk', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertDeps({
      dependencies: ['vovk-zod', 'vovk-ajv', 'zod', 'vovk-ajv'],
      opposite: true,
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and down arrow selection', async () => {
    await createNextApp();
    await vovkInit('', { combo: combos.YUP_VALIDATION_ARROW });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-yup'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-yup', 'yup', 'vovk-client'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
    });

    await assertTsConfig();
  });

  await it('Uses Rust template', async () => {
    await createNextApp();
    await vovkInit('', { combo: combos.RUST });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-yup'));

    const { config } = await assertConfig.getStrictConfig();

    deepStrictEqual(config.composedClient, {
      fromTemplates: ['mjs', 'cjs', 'rs'],
    });

    await assertDeps({
      dependencies: ['vovk', 'vovk-rust'],
      devDependencies: ['vovk-cli'],
    });

    await assertDeps({
      dependencies: ['vovk-python'],
      opposite: true,
    });

    await assertTsConfig();
  });

  await describe('Yarn-specific tests', async () => {
    await it('Works with prompting and --use-yarn', async () => {
      await createNextApp('--use-yarn');
      // Add packageManager: yarn to package.json
      const pkgJson = await NPMCliPackageJson.load(projectDir);
      pkgJson.update({
        packageManager: 'yarn@1.22.22',
      });
      await pkgJson.save();
      await vovkInit('--use-yarn', { combo: combos.YES });
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod', 'vovk-client'],
        devDependencies: ['vovk-cli'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
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
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod'],
        devDependencies: ['vovk-cli'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
      });

      await assertTsConfig();

      // check if packages are installed
      await assertDirExists('./node_modules/vovk');
      await assertDirExists('./node_modules/vovk-cli');

      await assertNotExists('./package-lock.json');

      await assertFileExists('./yarn.lock');
    });
  });

  await describe('Bun-specific tests', async () => {
    await it('Works with prompting and --use-bun', async () => {
      await createNextApp('--use-bun');
      // Add packageManager: bun to package.json
      const pkgJson = await NPMCliPackageJson.load(projectDir);
      pkgJson.update({
        packageManager: 'bun@1.2.13',
      });
      await pkgJson.save();
      await vovkInit('--use-bun', { combo: combos.YES });
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod', 'vovk-client'],
        devDependencies: ['vovk-cli'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
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
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod'],
        devDependencies: ['vovk-cli'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
      });

      await assertTsConfig();

      // check if packages are installed
      await assertDirExists('./node_modules/vovk');
      await assertDirExists('./node_modules/vovk-cli');

      await assertNotExists('./package-lock.json');
      await assertFileExists('./bun.lock');
    });
  });

  await describe('pnpm-specific tests', async () => {
    await it('Works with prompting and --use-pnpm', async () => {
      await createNextApp('--use-pnpm');
      // Add packageManager: pnpm to package.json
      const pkgJson = await NPMCliPackageJson.load(projectDir);
      pkgJson.update({
        packageManager: 'pnpm@8.6.0',
      });
      await pkgJson.save();
      await vovkInit('--use-pnpm', { combo: combos.YES });
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod', 'vovk-client'],
        devDependencies: ['vovk-cli'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
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
      await vovkInit('--yes --use-pnpm');
      await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

      await assertDeps({
        dependencies: ['vovk', 'vovk-zod', 'vovk-ajv', 'zod'],
        devDependencies: ['vovk-cli'],
      });

      await assertScripts({
        dev: 'vovk dev --next-dev',
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
