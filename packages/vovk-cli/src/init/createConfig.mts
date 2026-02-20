import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkConfig } from 'vovk';
import type { VovkBundleConfig, VovkStrictConfig } from 'vovk/internal';
import type { getLogger } from '../utils/getLogger.mjs';
import { prettify } from '../utils/prettify.mjs';
import { getFileSystemEntryType, FileSystemEntryType } from '../utils/getFileSystemEntryType.mjs';
import type { InitOptions } from '../types.mjs';
import { updateConfigProperty } from '../utils/updateConfigProperty.mjs';

export const BUNDLE_BUILD_TSDOWN = async ({ entry, outDir }: Parameters<VovkStrictConfig['bundle']['build']>[0]) => {
  const { build } = await import('tsdown');
  await build({
    entry,
    dts: true,
    format: 'esm',
    hash: false,
    fixedExtension: true,
    clean: true,
    outDir,
    platform: 'neutral',
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
    outputOptions: {
      inlineDynamicImports: true,
    },
    inputOptions: {
      resolve: {
        mainFields: ['module', 'main'],
      },
    },
    noExternal: ['!next/**'],
  });
};

export async function createConfig({
  root,
  options: { validationLibrary, bundle, lang, dryRun },
}: {
  root: string;
  log: ReturnType<typeof getLogger>;
  options: Pick<InitOptions, 'validationLibrary' | 'bundle' | 'lang' | 'channel' | 'dryRun'>;
}) {
  const config: VovkConfig = {};
  const dotConfigPath = path.join(root, '.config');
  const dir = (await getFileSystemEntryType(dotConfigPath)) === FileSystemEntryType.DIRECTORY ? dotConfigPath : root;
  const configAbsolutePath = path.join(dir, 'vovk.config.js');

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

  config.outputConfig ??= {};
  config.outputConfig.imports ??= {};
  config.outputConfig.imports.validateOnClient = 'vovk-ajv';

  if (lang?.length) {
    config.composedClient ??= {};
    config.composedClient.fromTemplates = ['js', ...lang];
  }

  config.moduleTemplates = moduleTemplates;

  if (bundle) {
    config.bundle ??= {} as VovkBundleConfig;
    config.bundle.outputConfig ??= {
      imports: { validateOnClient: null },
      package: {
        type: 'module',
        main: './index.js',
        types: './index.d.ts',
        exports: {
          '.': {
            default: './index.js',
            types: './index.d.ts',
          },
        },
      },
    };
  }

  let configStr = `// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = ${JSON.stringify(config, null, 2)};

export default config;`;

  if (bundle) {
    configStr = await updateConfigProperty(configStr, ['bundle', 'build'], BUNDLE_BUILD_TSDOWN);
  }

  configStr = await prettify(configStr, configAbsolutePath);

  if (!dryRun) await fs.writeFile(configAbsolutePath, configStr, 'utf-8');

  return { configAbsolutePath };
}
