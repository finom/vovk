import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import { runScript } from '../../lib/runScript.mjs';
import path from 'node:path';
import getUserConfig from '../../../src/getProjectInfo/getUserConfig.mjs';
import { VovkConfig } from '../../../src/types.mjs';
import getFileSystemEntryType, { FileSystemEntryType } from '../../../src/utils/getFileSystemEntryType.mjs';

export default function initAssertions({ cwd, dir }: { cwd: string; dir: string }) {
  const projectDir = path.join(cwd, dir);

  async function createNextApp(extraParams?: string) {
    await runScript(`rm -rf ${projectDir}`);
    await runScript(
      `npx create-next-app ${dir} --ts --app --src-dir --no-eslint --no-tailwind --no-import-alias ${extraParams ?? ''}`,
      {
        cwd,
      }
    );
  }

  async function vovkInit(extraParams?: string) {
    await runScript(`./dist/index.mjs init ${dir} --channel=beta --log-level=debug ${extraParams}`, { cwd });
  }

  async function assertConfig(testConfigPaths: string[], testConfig: VovkConfig) {
    const { userConfig, configAbsolutePaths } = await getUserConfig({ cwd: projectDir });

    assert.deepStrictEqual(
      userConfig,
      testConfig,
      'Config does not match. Config paths: ' + JSON.stringify(configAbsolutePaths)
    );

    assert.deepStrictEqual(
      configAbsolutePaths,
      testConfigPaths.map((p) => path.join(projectDir, p)),
      'Config paths do not match'
    );
  }

  assertConfig.makeConfig = (validationLibrary: string | null) => ({
    ...(validationLibrary
      ? {
          validationLibrary,
          validateOnClient: `${validationLibrary}/validateOnClient`,
        }
      : {}),
    templates: {
      controller: `${validationLibrary ?? 'vovk-cli'}/templates/controller.ejs`,
      service: `${validationLibrary ?? 'vovk-cli'}/templates/service.ejs`,
      worker: 'vovk-cli/templates/worker.ejs',
    },
  });

  async function assertDirExists(dirPath: string) {
    assert.strictEqual(
      await getFileSystemEntryType(path.join(projectDir, dirPath)),
      FileSystemEntryType.DIRECTORY,
      `Directory ${dirPath} does not exist`
    );
  }

  async function assertFileExists(filePath: string) {
    assert.strictEqual(
      await getFileSystemEntryType(path.join(projectDir, filePath)),
      FileSystemEntryType.FILE,
      `File ${filePath} does not exist`
    );
  }

  async function assertDeps({ dependencies, devDependencies }: { dependencies: string[]; devDependencies: string[] }) {
    const packageJson = JSON.parse(await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    for (const dep of dependencies) {
      assert.ok(packageJson.dependencies[dep], `Dependency ${dep} not found`);
    }

    for (const dep of devDependencies) {
      assert.ok(packageJson.devDependencies[dep], `Dev dependency ${dep} not found`);
    }
  }

  async function assertNotExists(filePath: string) {
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, filePath)), null, `File ${filePath} exists`);
  }

  return {
    createNextApp,
    vovkInit,
    assertConfig,
    assertDirExists,
    assertFileExists,
    assertDeps,
    assertNotExists,
  };
}
