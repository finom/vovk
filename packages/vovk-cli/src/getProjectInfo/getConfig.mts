import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkEnv, VovkStrictConfig } from 'vovk';
import getUserConfig from './getUserConfig.mjs';
import getRelativeSrcRoot from './getRelativeSrcRoot.mjs';
import pick from 'lodash/pick.js';

const templatesDir = path.join(import.meta.dirname, '../..', 'client-templates');

export enum BuiltInTemplateName {
  ts = 'ts',
  main = 'main',
  module = 'module',
  fullSchema = 'fullSchema',
  package = 'package',
  none = 'none',
}

const getTemplateDefs = (
  clientOutDirAbsolutePath: string,
  userTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {}
): VovkStrictConfig['clientTemplateDefs'] => {
  const defs: VovkStrictConfig['clientTemplateDefs'] = {};
  const builtInDefs: VovkStrictConfig['clientTemplateDefs'] = {
    [BuiltInTemplateName.ts]: {
      templatePath: path.resolve(templatesDir, 'ts/'),
      clientOutDir: clientOutDirAbsolutePath,
      fullSchemaJson: false,
      origin: null,
      package: {},
    },
    [BuiltInTemplateName.main]: {
      templatePath: path.resolve(templatesDir, 'main/'),
      clientOutDir: clientOutDirAbsolutePath,
      fullSchemaJson: false,
      origin: null,
      package: {},
    },
    [BuiltInTemplateName.module]: {
      templatePath: path.resolve(templatesDir, 'module/'),
      clientOutDir: clientOutDirAbsolutePath,
      fullSchemaJson: false,
      origin: null,
      package: {},
    },
    [BuiltInTemplateName.fullSchema]: {
      templatePath: path.resolve(templatesDir, 'fullSchema/'),
      clientOutDir: clientOutDirAbsolutePath,
      fullSchemaJson: false,
      origin: null,
      package: {},
    },
    [BuiltInTemplateName.package]: {
      templatePath: path.resolve(templatesDir, 'package/'),
      clientOutDir: clientOutDirAbsolutePath,
      fullSchemaJson: false,
      origin: null,
      package: {},
    },
    [BuiltInTemplateName.none]: {
      templatePath: null,
      clientOutDir: clientOutDirAbsolutePath,
      fullSchemaJson: false,
      origin: null,
      package: {},
    },
  };

  for (const [name, templateDef] of Object.entries(userTemplateDefs)) {
    if ('extends' in templateDef) {
      if (templateDef.extends) {
        const builtIn = builtInDefs[templateDef.extends];

        if (!builtIn) {
          throw new Error(`Unknown template extends: ${templateDef.extends}`);
        }

        defs[name] = {
          ...builtIn,
          ...templateDef,
        };
      }
    } else {
      defs[name] = templateDef;
    }
  }

  return { ...builtInDefs, ...defs };
};

export default async function getConfig({
  clientOutDir: givenClientOutDir,
  configPath,
  cwd,
}: {
  clientOutDir?: string;
  configPath?: string;
  cwd: string;
}) {
  const { configAbsolutePaths, error, userConfig } = await getUserConfig({ configPath, cwd });
  const originalPackageJson = pick(JSON.parse(await fs.readFile(path.join(cwd, 'package.json'), 'utf-8')), [
    'name',
    'version',
    'description',
    'author',
    'license',
    'repository',
    'homepage',
    'bugs',
    'keywords',
  ]);
  const conf = userConfig ?? {};
  const env = process.env as VovkEnv;
  const clientOutDir =
    givenClientOutDir ?? env.VOVK_CLIENT_OUT_DIR ?? conf.clientOutDir ?? './node_modules/.vovk-client';
  const clientOutDirAbsolutePath = path.resolve(cwd, clientOutDir);
  const clientTemplateDefs = getTemplateDefs(clientOutDirAbsolutePath, conf.clientTemplateDefs);

  const srcRoot = await getRelativeSrcRoot({ cwd });

  const validateOnClientImport = env.VOVK_IMPORTS_VALIDATE_ON_CLIENT ?? conf.imports?.validateOnClient ?? null;
  const fetcherImport = env.VOVK_IMPORTS_FETCHER ?? conf.imports?.fetcher ?? 'vovk';
  const createRPCImport = env.VOVK_IMPORTS_CREATE_RPC ?? conf.imports?.createRPC ?? 'vovk';
  const config: VovkStrictConfig = {
    clientOutDir,
    clientTemplateDefs,
    emitConfig: [],
    generateFullClient:
      'VOVK_GENERATE_FULL_CLIENT' in env ? !!env.VOVK_GENERATE_FULL_CLIENT : (conf.generateFullClient ?? true),
    generateSegmentClient:
      'VOVK_GENERATE_SEGMENT_CLIENT' in env
        ? !!env.VOVK_GENERATE_SEGMENT_CLIENT
        : (conf.generateSegmentClient ?? false),
    modulesDir: env.VOVK_MODULES_DIR ?? conf.modulesDir ?? './' + [srcRoot, 'modules'].filter(Boolean).join('/'),
    imports: {
      fetcher: typeof fetcherImport === 'string' ? [fetcherImport] : fetcherImport,
      validateOnClient:
        typeof validateOnClientImport === 'string' ? [validateOnClientImport] : (validateOnClientImport ?? null),
      createRPC: typeof createRPCImport === 'string' ? [createRPCImport, 'vovk'] : createRPCImport,
    },
    schemaOutDir: env.VOVK_SCHEMA_OUT_DIR ?? conf.schemaOutDir ?? './.vovk-schema',
    origin: (env.VOVK_ORIGIN ?? conf.origin ?? '').replace(/\/$/, ''), // Remove trailing slash
    rootEntry: env.VOVK_ROOT_ENTRY ?? conf.rootEntry ?? 'api',
    rootSegmentModulesDirName: env.VOVK_ROOT_SEGMENT_MODULES_DIR_NAME ?? conf.rootSegmentModulesDirName ?? '',
    logLevel: env.VOVK_LOG_LEVEL ?? conf.logLevel ?? 'info',
    prettifyClient: (env.VOVK_PRETTIFY_CLIENT ? !!env.VOVK_PRETTIFY_CLIENT : null) ?? conf.prettifyClient ?? false,
    devHttps: (env.VOVK_DEV_HTTPS ? !!env.VOVK_DEV_HTTPS : null) ?? conf.devHttps ?? false,
    generateFrom: conf.generateFrom ?? ['module', 'main'],
    moduleTemplates: {
      service: 'vovk-cli/templates/service.ts.ejs',
      controller: 'vovk-cli/templates/controller.ts.ejs',
      ...conf.moduleTemplates,
    },
    libs: conf.libs ?? {},
    package: {
      ...originalPackageJson,
      ...conf.package,
    },
  };

  if (typeof conf.emitConfig === 'undefined') {
    config.emitConfig = ['libs'];
  } else if (conf.emitConfig === true) {
    config.emitConfig = Object.keys(config) as (keyof VovkStrictConfig)[];
  } else if (Array.isArray(conf.emitConfig)) {
    config.emitConfig = conf.emitConfig;
  } // else it's false and emitConfig already is []

  return { config, srcRoot, configAbsolutePaths, userConfig, error };
}
