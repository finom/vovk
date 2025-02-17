import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import { runScript } from './runScript.mjs';
import path from 'node:path';
import getUserConfig from '../../src/getProjectInfo/getUserConfig.mjs';
import type { VovkConfig } from 'vovk';
import getFileSystemEntryType, { FileSystemEntryType } from '../../src/utils/getFileSystemEntryType.mjs';
import checkTSConfigForExperimentalDecorators from '../../src/init/checkTSConfigForExperimentalDecorators.mjs';

export default function getCLIAssertions({ cwd, dir }: { cwd: string; dir: string }) {
  const projectDir = path.join(cwd, dir);

  function runAtCWD(command: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) {
    return runScript(command, { cwd, ...options });
  }

  function runAtProjectDir(command: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) {
    return runScript(command, { cwd: projectDir, ...options });
  }

  async function createNextApp(extraParams?: string) {
    await runScript(`rm -rf ${projectDir}`);
    await runScript(
      `npx create-next-app ${dir} --ts --app --src-dir --no-eslint --no-tailwind --no-import-alias ${extraParams ? (extraParams.includes('--turbopack') ? extraParams : `${extraParams} --no-turbopack`) : '--no-turbopack'}`,
      {
        cwd,
      }
    );
  }

  async function vovkInit(extraParams?: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) {
    const script = `./dist/index.mjs init ${dir} --channel=draft --log-level=debug ${extraParams}`;
    return runScript(script, {
      ...options,
      cwd,
    });
  }

  async function assertConfig(testConfigPaths: string[], testConfig: VovkConfig | null) {
    const { userConfig, configAbsolutePaths } = await getUserConfig({ cwd: projectDir });

    assert.deepStrictEqual(
      configAbsolutePaths,
      testConfigPaths.map((p) => path.join(projectDir, p)),
      'Config paths do not match'
    );

    assert.deepStrictEqual(
      userConfig,
      testConfig,
      'Config does not match. Config paths: ' + JSON.stringify(configAbsolutePaths)
    );
  }

  assertConfig.makeConfig = (validationLibrary: string | null, useReactQuery?: boolean) => ({
    ...(validationLibrary
      ? {
          validateOnClientImport: `${validationLibrary}/validateOnClient.js`,
        }
      : {}),
    ...(useReactQuery
      ? {
          createRPCImport: 'vovk-react-query',
        }
      : {}),
    templates: {
      controller: `${validationLibrary ?? 'vovk-cli'}/templates/controller.ejs`,
      service: 'vovk-cli/templates/service.ejs',
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

  async function assertDeps({
    dependencies,
    devDependencies,
    opposite,
  }: {
    dependencies?: string[];
    devDependencies?: string[];
    opposite?: boolean;
  }) {
    const packageJson = JSON.parse(await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    for (const dep of dependencies ?? []) {
      if (opposite) {
        assert.ok(!packageJson.dependencies[dep], `Dependency ${dep} found`);
      } else {
        assert.ok(packageJson.dependencies[dep], `Dependency ${dep} not found`);
      }
    }

    for (const dep of devDependencies ?? []) {
      if (opposite) {
        assert.ok(!packageJson.devDependencies[dep], `Dev dependency ${dep} found`);
      } else {
        assert.ok(packageJson.devDependencies[dep], `Dev dependency ${dep} not found`);
      }
    }
  }

  async function assertScripts(scripts: Record<string, string | undefined>) {
    // TODO move read/write package.json to a helper function
    const packageJson = JSON.parse(await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8')) as {
      scripts: Record<string, string>;
    };

    for (const [script, command] of Object.entries(scripts)) {
      if (typeof command === 'undefined') {
        assert.ok(!packageJson.scripts[script], `Script ${script} found`);
        continue;
      } else {
        assert.strictEqual(packageJson.scripts[script], command, `Script ${script} not found`);
      }
    }
  }

  async function assertNotExists(filePath: string) {
    assert.strictEqual(await getFileSystemEntryType(path.join(projectDir, filePath)), null, `File ${filePath} exists`);
  }

  async function assertTsConfig(opposite?: boolean) {
    const hasDecorators = await checkTSConfigForExperimentalDecorators(projectDir);

    if (opposite) {
      assert.strictEqual(hasDecorators, false, 'Experimental decorators found');
    } else {
      assert.strictEqual(hasDecorators, true, 'Experimental decorators not found');
    }
  }

  async function assertFile(filePath: string, exp?: RegExp | string | RegExp[] | string[]) {
    let content;
    try {
      content = await fs.readFile(path.join(projectDir, filePath), 'utf-8');
    } catch {
      assert.fail(`File ${filePath} does not exist`);
    }

    assert.ok(content, `File ${filePath} is empty`);

    if (exp) {
      if (typeof exp === 'string') {
        assert.ok(
          content.replace(/\s+/g, '').includes(exp.replace(/\s+/g, '')),
          `File ${filePath} does not match the string "${exp}". Content: ${content}`
        );
      } else if (exp instanceof RegExp) {
        assert.ok(exp.test(content), `File ${filePath} does not match the regex "${exp}". Content: ${content}`);
      } else if (Array.isArray(exp)) {
        for (const e of exp) {
          if (typeof e === 'string') {
            assert.ok(
              content.replace(/\s+/g, '').includes(e.replace(/\s+/g, '')),
              `File ${filePath} does not match the string "${e}". Content: ${content}`
            );
          } else if (e instanceof RegExp) {
            assert.ok(e.test(content), `File ${filePath} does not match the regex "${e}". Content: ${content}`);
          }
        }
      }
    }
  }

  async function assertDirFileList(dirPath: string, files: string[]) {
    const dir = await fs.readdir(path.join(projectDir, dirPath));

    assert.deepStrictEqual(dir.sort(), files.sort(), `Directory ${dirPath} does not contain the correct files`);
  }

  async function vovkDevAndKill() {
    return runAtProjectDir(`../dist/index.mjs dev --next-dev --exit -- --turbo`);
  }

  return {
    runAtCWD,
    runAtProjectDir,
    createNextApp,
    vovkInit,
    vovkDevAndKill,
    assertConfig,
    assertScripts,
    assertDirExists,
    assertFileExists,
    assertDeps,
    assertNotExists,
    assertTsConfig,
    assertFile,
    assertDirFileList,
  };
}
