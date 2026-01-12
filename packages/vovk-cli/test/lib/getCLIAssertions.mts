import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import { runScript } from './runScript.mts';
import path from 'node:path';
import { getUserConfig } from '../../dist/getProjectInfo/getConfig/getUserConfig.mjs';
import type { VovkConfig } from 'vovk';
import type { VovkStrictConfig } from 'vovk/internal';
import { getFileSystemEntryType, FileSystemEntryType } from '../../dist/utils/getFileSystemEntryType.mjs';
import { checkTSConfigForExperimentalDecorators } from '../../dist/init/checkTSConfigForExperimentalDecorators.mjs';
import { getConfig } from '../../dist/getProjectInfo/getConfig/index.mjs';
import { BUNDLE_BUILD_TSDOWN } from '../../dist/init/createConfig.mjs';

function escapeFlags(flags: string | undefined): string {
  return flags ? '_' + flags.replace(/[\s=]+/g, '_') : '';
}

type RunScriptReturn = ReturnType<typeof runScript>;

export default function getCLIAssertions({ cwd, dir }: { cwd: string; dir: string }): {
  projectDir: string;
  runAtCWD: (command: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) => RunScriptReturn;
  runAtProjectDir: (command: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) => RunScriptReturn;
  createVovkApp: (options: {
    cache?: boolean;
    nextFlags?: string;
    vovkInitFlags?: string;
    cacheKey?: string;
    runInCacheDir?: ({ cwd }: { cwd: string }) => Promise<void>;
  }) => Promise<void>;
  vovkDevAndKill: (vovkArguments?: string, options?: { cwd: string }) => RunScriptReturn;
  assertConfig: ((testConfigPaths: string[], testConfig: VovkConfig | null) => Promise<void>) & {
    makeConfig: (validationLibrary: string | null, extras?: Partial<VovkConfig>) => VovkConfig;
    getStrictConfig: () => ReturnType<typeof getConfig>;
  };
  assertScripts: (scripts: Record<string, string | undefined>) => Promise<void>;
  assertDirExists: (dirPath: string) => Promise<void>;
  assertFileExists: (filePath: string) => Promise<void>;
  assertDeps: (options: { dependencies?: string[]; devDependencies?: string[]; opposite?: boolean }) => Promise<void>;
  assertNotExists: (filePath: string) => Promise<void>;
  assertTsConfig: (opposite?: boolean) => Promise<void>;
  assertFile: (filePath: string, exp?: RegExp | string | RegExp[] | string[], opposite?: boolean) => Promise<void>;
  assertDirFileList: (options: { dirPath: string; files: string[]; allowExtraFiles?: boolean }) => Promise<void>;
  createNextApp: (flags?: string, targetDir?: string) => Promise<void>;
} {
  const projectDir = path.join(cwd, dir);

  function runAtCWD(command: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) {
    return runScript(command, { cwd, ...options });
  }

  function runAtProjectDir(command: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) {
    return runScript(command, { cwd: projectDir, ...options });
  }

  async function createNextApp(flags?: string, targetDir?: string) {
    const finalDir = targetDir ?? projectDir;
    const tmpNextjsProjectDir = path.join(cwd, `tmp_nextjs_projects_cache${escapeFlags(flags)}`);
    await runScript(`rm -rf ${finalDir}`);
    if (!(await getFileSystemEntryType(tmpNextjsProjectDir))) {
      await runScript(
        `npx create-next-app ${tmpNextjsProjectDir} --ts --app --src-dir --no-eslint --no-tailwind --no-react-compiler --no-import-alias ${flags ?? ''}`
      );
      // create .npmrc with prefer-offline=true
      await fs.writeFile(path.join(tmpNextjsProjectDir, '.npmrc'), 'prefer-offline=true\n');
    }

    await runScript(`cp -R ${tmpNextjsProjectDir} ${finalDir}`);
  }

  async function createVovkApp({
    cache = true,
    nextFlags,
    vovkInitFlags,
    cacheKey,
    runInCacheDir,
  }: {
    cache?: boolean;
    nextFlags?: string;
    vovkInitFlags?: string;
    cacheKey?: string;
    runInCacheDir?: ({ cwd }: { cwd: string }) => Promise<void>;
  }) {
    const tmpVovkProjectDir = path.join(
      cwd,
      `tmp_vovk_projects_cache${escapeFlags(nextFlags)}${escapeFlags(vovkInitFlags)}${escapeFlags(cacheKey)}`
    );
    await runScript(`rm -rf ${projectDir}`);

    const initVovkApp = async (dir: string) => {
      const vovkInitScript = `../dist/index.mjs init --log-level=debug ${vovkInitFlags ?? ''}`;
      await runScript(vovkInitScript, { cwd: dir });

      if (runInCacheDir) {
        await runInCacheDir({ cwd: dir });
      }
    };

    if (cache) {
      if (!(await getFileSystemEntryType(tmpVovkProjectDir))) {
        // Use createNextApp to create/copy the base Next.js project to the cache dir
        await createNextApp(nextFlags, tmpVovkProjectDir);
        // Then initialize Vovk on top of it
        await initVovkApp(tmpVovkProjectDir);
      }

      await runScript(`cp -R ${tmpVovkProjectDir} ${projectDir}`);
    } else {
      // Use createNextApp to create the base project directly
      await createNextApp(nextFlags, projectDir);
      await initVovkApp(projectDir);
    }
  }

  async function assertConfig(testConfigPaths: string[], testConfig: VovkConfig | null) {
    // eslint-disable-next-line prefer-const
    let { userConfig, configAbsolutePaths } = await getUserConfig({ cwd: projectDir });

    if (typeof userConfig?.bundle?.build === 'function') {
      // Convert functions to strings for comparison
      userConfig = {
        ...userConfig,
        bundle: {
          ...userConfig.bundle,
          build: userConfig.bundle.build
            .toString()
            .replace(/\s+/g, '') as unknown as VovkStrictConfig['bundle']['build'],
        },
      };

      testConfig = {
        ...testConfig,
        bundle: {
          ...testConfig?.bundle,
          build: testConfig?.bundle?.build
            ?.toString()
            .replace(/\s+/g, '') as unknown as VovkStrictConfig['bundle']['build'],
        },
      };
    }

    userConfig = JSON.parse(JSON.stringify(userConfig));
    testConfig = JSON.parse(JSON.stringify(testConfig));

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

    const config: VovkConfig = {};
    config.outputConfig ??= {};
    config.outputConfig.imports ??= {};
    config.outputConfig.imports.validateOnClient = 'vovk-ajv';

    config.moduleTemplates = moduleTemplates;

    if (!extras || !extras.bundle || extras.bundle.build !== undefined) {
      config.bundle ??= {} as VovkStrictConfig['bundle'];
      config.bundle!.build ??= BUNDLE_BUILD_TSDOWN;
    }

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

  async function assertDirFileList({
    dirPath,
    files,
    allowExtraFiles = false,
  }: {
    dirPath: string;
    files: string[];
    allowExtraFiles?: boolean;
  }) {
    const dir = await fs.readdir(path.join(projectDir, dirPath));

    if (allowExtraFiles) {
      for (const file of files) {
        assert.ok(dir.includes(file), `Expected file ${file} not found in directory ${dirPath}`);
      }
    } else {
      assert.deepStrictEqual(dir.sort(), files.sort(), `Directory ${dirPath} does not contain the correct files`);
    }
  }

  function vovkDevAndKill(vovkArguments?: string, { cwd }: { cwd: string } = { cwd: projectDir }) {
    return runAtProjectDir(`../dist/index.mjs dev --next-dev --exit ${vovkArguments ?? ''} -- --turbo`, { cwd });
  }

  return {
    projectDir,
    runAtCWD,
    runAtProjectDir,
    createVovkApp,
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
    createNextApp,
  };
}
