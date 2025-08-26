import type { VovkStrictConfig } from 'vovk';

export enum BuiltInTemplateName {
  // ts/js
  ts = 'ts',
  cjs = 'cjs',
  mjs = 'mjs',

  // schema
  schemaTs = 'schemaTs',
  schemaCjs = 'schemaCjs',
  schemaJson = 'schemaJson',

  // types
  standaloneTypesTs = 'standaloneTypesTs',

  // misc
  readme = 'readme',
  packageJson = 'packageJson',
  mixins = 'mixins',

  // other languages (packages installed separately)
  rsSrc = 'rsSrc',
  rsPkg = 'rsPkg',
  rsReadme = 'rsReadme',
  rs = 'rs',
  pySrc = 'pySrc',
  pyPkg = 'pyPkg',
  pyReadme = 'pyReadme',
  py = 'py',
}

export default function getTemplateDefs(
  userTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {}
): VovkStrictConfig['clientTemplateDefs'] {
  const defs: VovkStrictConfig['clientTemplateDefs'] = {};
  const builtInDefs: VovkStrictConfig['clientTemplateDefs'] = {
    [BuiltInTemplateName.ts]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.ts}/`,
      requires: {
        [BuiltInTemplateName.schemaTs]: '.',
        [BuiltInTemplateName.mixins]: '.', // used conditionally if OpenAPI mixins are used
      },
    },
    [BuiltInTemplateName.cjs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.cjs}/`,
      requires: {
        [BuiltInTemplateName.schemaCjs]: '.',
        [BuiltInTemplateName.mixins]: '.', // used conditionally if OpenAPI mixins are used
      },
    },
    [BuiltInTemplateName.mjs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.mjs}/`,
      requires: {
        [BuiltInTemplateName.schemaCjs]: '.',
        [BuiltInTemplateName.mixins]: '.', // used conditionally if OpenAPI mixins are used
      },
    },
    [BuiltInTemplateName.schemaTs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.schemaTs}/`,
    },
    [BuiltInTemplateName.schemaCjs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.schemaCjs}/`,
    },
    [BuiltInTemplateName.schemaJson]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.schemaJson}/`,
    },
    [BuiltInTemplateName.readme]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.readme}/`,
    },
    [BuiltInTemplateName.packageJson]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.packageJson}/`,
    },
    [BuiltInTemplateName.mixins]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.mixins}/`,
    },
    [BuiltInTemplateName.rsSrc]: {
      templatePath: `vovk-rust/client-templates/${BuiltInTemplateName.rsSrc}/`,
      requires: {
        [BuiltInTemplateName.schemaJson]: './',
      },
    },
    [BuiltInTemplateName.rsPkg]: {
      templatePath: `vovk-rust/client-templates/${BuiltInTemplateName.rsPkg}/`,
    },
    [BuiltInTemplateName.rsReadme]: {
      templatePath: `vovk-rust/client-templates/${BuiltInTemplateName.rsReadme}/`,
    },
    [BuiltInTemplateName.rs]: {
      composedClient: {
        outDir: 'dist_rust',
      },
      requires: {
        [BuiltInTemplateName.rsSrc]: './src/',
        [BuiltInTemplateName.rsPkg]: './',
        [BuiltInTemplateName.rsReadme]: './',
      },
    },
    [BuiltInTemplateName.pySrc]: {
      templatePath: `vovk-python/client-templates/${BuiltInTemplateName.pySrc}/`,
      requires: {
        [BuiltInTemplateName.schemaJson]: '.',
      },
    },
    [BuiltInTemplateName.pyPkg]: {
      templatePath: `vovk-python/client-templates/${BuiltInTemplateName.pyPkg}/`,
    },
    [BuiltInTemplateName.pyReadme]: {
      templatePath: `vovk-python/client-templates/${BuiltInTemplateName.pyReadme}/`,
    },
    [BuiltInTemplateName.py]: {
      composedClient: {
        outDir: 'dist_python',
      },
      requires: {
        [BuiltInTemplateName.pySrc]: './src/[package_name]/',
        [BuiltInTemplateName.pyPkg]: './',
        [BuiltInTemplateName.pyReadme]: './',
      },
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
          composedClient: {
            ...builtIn.composedClient,
            ...templateDef.composedClient,
          },
          segmentedClient: {
            ...builtIn.segmentedClient,
            ...templateDef.segmentedClient,
          },
          projectConfig: {
            ...builtIn.projectConfig,
            ...templateDef.projectConfig,
          },
          // 'requires' and other props will be overridden
        };
      }
    } else {
      defs[name] = templateDef;
    }
  }

  return { ...builtInDefs, ...defs };
}
