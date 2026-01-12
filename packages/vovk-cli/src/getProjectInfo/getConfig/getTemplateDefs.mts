import type { VovkStrictConfig } from 'vovk/internal';

export enum BuiltInTemplateName {
  // ts/js
  tsBase = 'tsBase',
  jsBase = 'jsBase',
  ts = 'ts',
  js = 'js',

  // schema
  schemaTs = 'schemaTs',
  schemaJs = 'schemaJs',
  schemaJson = 'schemaJson',

  // openapi
  openapiTs = 'openapiTs',
  openapiJs = 'openapiJs',
  openapiJson = 'openapiJson',

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

export function getTemplateDefs(
  userTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {}
): VovkStrictConfig['clientTemplateDefs'] {
  const defs: VovkStrictConfig['clientTemplateDefs'] = {};
  const builtInDefs: VovkStrictConfig['clientTemplateDefs'] = {
    [BuiltInTemplateName.openapiTs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.openapiTs}/`,
      requires: {
        [BuiltInTemplateName.openapiJson]: './',
      },
    },
    [BuiltInTemplateName.openapiJs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.openapiJs}/`,
      requires: {
        [BuiltInTemplateName.openapiJson]: './',
      },
    },
    [BuiltInTemplateName.openapiJson]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.openapiJson}/`,
    },
    [BuiltInTemplateName.tsBase]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.tsBase}/`,
      requires: {
        [BuiltInTemplateName.schemaTs]: './',
        [BuiltInTemplateName.mixins]: './', // used conditionally if OpenAPI mixins are used
      },
    },
    [BuiltInTemplateName.jsBase]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.jsBase}/`,
      requires: {
        [BuiltInTemplateName.schemaJs]: './',
        [BuiltInTemplateName.mixins]: './', // used conditionally if OpenAPI mixins are used
      },
    },
    [BuiltInTemplateName.ts]: {
      requires: {
        [BuiltInTemplateName.tsBase]: './',
        [BuiltInTemplateName.openapiTs]: './',
      },
    },
    [BuiltInTemplateName.js]: {
      requires: {
        [BuiltInTemplateName.jsBase]: './',
        [BuiltInTemplateName.openapiJs]: './',
      },
    },
    [BuiltInTemplateName.schemaTs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.schemaTs}/`,
    },
    [BuiltInTemplateName.schemaJs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.schemaJs}/`,
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
        [BuiltInTemplateName.schemaJson]: './',
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
          outputConfig: {
            ...builtIn.outputConfig,
            ...templateDef.outputConfig,
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
