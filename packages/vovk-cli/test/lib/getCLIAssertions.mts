import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import { runScript } from './runScript.mts';
import path from 'node:path';
import getUserConfig from '../../dist/getProjectInfo/getConfig/getUserConfig.mjs';
import type { VovkConfig } from 'vovk';
import getFileSystemEntryType, { FileSystemEntryType } from '../../dist/utils/getFileSystemEntryType.mjs';
import checkTSConfigForExperimentalDecorators from '../../dist/init/checkTSConfigForExperimentalDecorators.mjs';
import getConfig from '../../dist/getProjectInfo/getConfig/index.mjs';

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
      `npx create-next-app ${dir} --ts --app --src-dir --no-eslint --no-tailwind --no-react-compiler --no-import-alias ${extraParams ? (extraParams.includes('--turbopack') ? extraParams : `${extraParams} --no-turbopack`) : '--no-turbopack'}`,
      {
        cwd,
      }
    );
  }

  async function vovkInit(extraParams?: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) {
    // Use --channel=draft for draft features
    const script = `./dist/index.mjs init --prefix ${dir} --log-level=debug ${extraParams}`;
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

  assertConfig.makeConfig = (validationLibrary: string | null, extras?: Partial<VovkConfig>) => {
    const typeTemplates = {
      controller: 'vovk-cli/module-templates/type/controller.ts.ejs',
      service: 'vovk-cli/module-templates/type/service.ts.ejs',
    };

    const moduleTemplates: VovkConfig['moduleTemplates'] = {
      ...typeTemplates,
      ...{
        type: typeTemplates,
        zod: {
          controller: 'vovk-cli/module-templates/zod/controller.ts.ejs',
        },
        valibot: {
          controller: 'vovk-cli/module-templates/valibot/controller.ts.ejs',
        },
        arktype: {
          controller: 'vovk-cli/module-templates/arktype/controller.ts.ejs',
        },
      }[validationLibrary ?? 'type'],
    };

    const config: VovkConfig = {
      moduleTemplates,
    };
    config.outputConfig ??= {};
    config.outputConfig.imports ??= {};
    config.outputConfig.imports.validateOnClient = 'vovk-ajv';

    return { ...config, ...extras };
  };

  assertConfig.getStrictConfig = () => getConfig({ cwd: projectDir });

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
    const entryType = await getFileSystemEntryType(path.join(projectDir, filePath));
    assert.strictEqual(entryType, null, `${entryType?.toLocaleLowerCase()} ${filePath} exists`);
  }

  async function assertTsConfig(opposite?: boolean) {
    const hasDecorators = await checkTSConfigForExperimentalDecorators(projectDir);

    if (opposite) {
      assert.strictEqual(hasDecorators, false, 'Experimental decorators found');
    } else {
      assert.strictEqual(hasDecorators, true, 'Experimental decorators not found');
    }
  }

  async function assertFile(filePath: string, exp?: RegExp | string | RegExp[] | string[], opposite?: boolean) {
    let content;
    const p = path.join(projectDir, filePath);
    try {
      content = await fs.readFile(p, 'utf-8');
    } catch {
      assert.fail(`File ${p} does not exist`);
    }

    assert.ok(content, `File ${p} is empty`);

    if (exp) {
      if (typeof exp === 'string') {
        const val = content.replace(/\s+/g, '').includes(exp.replace(/\s+/g, ''));
        assert.ok(opposite ? !val : val, `File ${p} does not match the string "${exp}". Content: ${content}`);
      } else if (exp instanceof RegExp) {
        assert.ok(exp.test(content), `File ${p} does not match the regex "${exp}". Content: ${content}`);
      } else if (Array.isArray(exp)) {
        for (const e of exp) {
          if (typeof e === 'string') {
            const val = content.replace(/\s+/g, '').includes(e.replace(/\s+/g, ''));
            assert.ok(opposite ? !val : val, `File ${p} does not match the string "${e}". Content: ${content}`);
          } else if (e instanceof RegExp) {
            assert.ok(
              opposite ? e.test(content) : !e.test(content),
              `File ${p} does not match the regex "${e}". Content: ${content}`
            );
          }
        }
      }
    }
  }

  async function assertDirFileList(dirPath: string, files: string[]) {
    const dir = await fs.readdir(path.join(projectDir, dirPath));

    assert.deepStrictEqual(dir.sort(), files.sort(), `Directory ${dirPath} does not contain the correct files`);
  }

  async function vovkDevAndKill(vovkArguments?: string) {
    return runAtProjectDir(`../dist/index.mjs dev --next-dev --exit ${vovkArguments ?? ''} -- --turbo`);
  }

  return {
    projectDir,
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
