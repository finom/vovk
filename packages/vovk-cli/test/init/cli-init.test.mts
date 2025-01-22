import { it, describe } from 'node:test';
import path from 'node:path';
import fs from 'node:fs/promises';
import omit from 'lodash/omit.js';
import getCLIAssertions from '../lib/getCLIAssertions.mjs';
import { DOWN, ENTER } from '../lib/runScript.mjs';
import { PackageJson } from 'type-fest';

await describe('CLI init', async () => {
  const dir = 'tmp_test_dir';
  const cwd = path.resolve(import.meta.dirname, '../../..');

  const {
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
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
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
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
      opposite: true,
    });

    await assertScripts({
      dev: 'next dev --turbopack',
      generate: undefined,
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
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --update-scripts=explicit', async () => {
    await createNextApp();
    await vovkInit('--yes --update-scripts=explicit');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: "PORT=3000 concurrently 'next dev' 'vovk dev' --kill-others",
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Preserves next dev flags with --update-scripts=implicit', async () => {
    await createNextApp('--turbopack');
    await vovkInit('--yes --update-scripts=implicit');

    await assertScripts({
      dev: 'vovk dev --next-dev -- --turbopack',
      generate: 'vovk generate',
    });
  });

  await it('Preserves next dev flags with --update-scripts=explicit', async () => {
    await createNextApp('--turbopack');
    await vovkInit('--yes --update-scripts=explicit');

    await assertScripts({
      dev: "PORT=3000 concurrently 'next dev --turbopack' 'vovk dev' --kill-others",
      generate: 'vovk generate',
    });
  });

  await it('Works with --yes and --skip-install', async () => {
    await createNextApp('--skip-install');
    await vovkInit('--yes --skip-install');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();

    await assertNotExists('./node_modules/vovk');
    await assertNotExists('./node_modules/vovk-cli');
  });

  await it('Works with --yes and --use-yarn', async () => {
    await createNextApp('--use-yarn');
    await vovkInit('--yes --use-yarn');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();

    // check if packages are installed
    await assertDirExists('./node_modules/vovk');
    await assertDirExists('./node_modules/vovk-cli');
    await assertFileExists('./yarn.lock');

    // check if yarn.lock does not exist
    await assertNotExists('./package-lock.json');
  });

  await it('Works with --yes and --validation-library="none"', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig(null));

    await assertDeps({
      dependencies: ['vovk'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library="vovk-zod"', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=vovk-zod');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library="vovk-yup"', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=vovk-yup');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-yup'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-yup', 'yup'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with --yes and --validation-library="vovk-dto"', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=vovk-dto');
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-dto'));

    await assertDeps({
      dependencies: [
        'vovk',
        'vovk-dto',
        'class-validator',
        'class-transformer',
        'vovk-mapped-types',
        'reflect-metadata',
      ],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Utilizes .config folder', async () => {
    await createNextApp();
    await runAtProjectDir('mkdir .config');
    await vovkInit('--yes');
    await assertConfig(['.config/vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
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
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting', async () => {
    await createNextApp();
    await vovkInit('', { combo: [ENTER, ENTER, ENTER, ENTER] });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and --use-yarn', async () => {
    await createNextApp('--use-yarn');
    await vovkInit('--use-yarn', { combo: [ENTER, ENTER, ENTER, ENTER] });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();

    await assertDirExists('./node_modules/vovk');
    await assertDirExists('./node_modules/vovk-cli');

    await assertNotExists('./package-lock.json');
    await assertFileExists('./yarn.lock');
  });

  await it('Works with prompting and no TSConfig update', async () => {
    await createNextApp();
    await vovkInit('', { combo: [ENTER, ENTER, ENTER, 'N', ENTER] });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig(true);
  });

  await it('Works with prompting and --update-ts-config', async () => {
    await createNextApp();
    await vovkInit('--update-ts-config', { combo: [ENTER, ENTER, ENTER] });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-zod'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and --validation-library', async () => {
    await createNextApp();
    await vovkInit('--validation-library=vovk-dto', { combo: [ENTER, ENTER, ENTER] });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-dto'));

    await assertDeps({
      dependencies: [
        'vovk',
        'vovk-dto',
        'class-validator',
        'class-transformer',
        'vovk-mapped-types',
        'reflect-metadata',
      ],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and --validation-library=none', async () => {
    await createNextApp();
    await vovkInit('--validation-library=none', { combo: [ENTER, ENTER, ENTER] });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig(null));

    await assertDeps({
      dependencies: ['vovk'],
      devDependencies: ['vovk-cli'],
    });

    await assertDeps({
      dependencies: ['vovk-dto', 'vovk-zod'],
      opposite: true,
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and no "validate on client" selection', async () => {
    await createNextApp();
    await vovkInit('', { combo: [ENTER, 'N', ENTER, ENTER, ENTER] });
    await assertConfig(['vovk.config.js'], omit(assertConfig.makeConfig('vovk-zod'), 'validateOnClient'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-zod', 'zod'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });

  await it('Works with prompting and down arrow selection', async () => {
    await createNextApp();
    await vovkInit('', { combo: [DOWN, ENTER, ENTER, ENTER, ENTER] });
    await assertConfig(['vovk.config.js'], assertConfig.makeConfig('vovk-yup'));

    await assertDeps({
      dependencies: ['vovk', 'vovk-yup', 'yup'],
      devDependencies: ['vovk-cli'],
    });

    await assertScripts({
      dev: 'vovk dev --next-dev',
      generate: 'vovk generate',
    });

    await assertTsConfig();
  });
});
