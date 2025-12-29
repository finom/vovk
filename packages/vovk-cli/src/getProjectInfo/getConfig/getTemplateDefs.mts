import type { VovkStrictConfig } from 'vovk/internal';

export enum BuiltInTemplateName {
  // ts/js
  tsBase = 'tsBase',
  cjsBase = 'cjsBase',
  mjsBase = 'mjsBase',
  ts = 'ts',
  cjs = 'cjs',
  mjs = 'mjs',

  // schema
  schemaTs = 'schemaTs',
  schemaCjs = 'schemaCjs',
  schemaJson = 'schemaJson',

  // openapi
  openapiTs = 'openapiTs',
  openapiCjs = 'openapiCjs',
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
    [BuiltInTemplateName.openapiCjs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.openapiCjs}/`,
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
    [BuiltInTemplateName.cjsBase]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.cjsBase}/`,
      requires: {
        [BuiltInTemplateName.schemaCjs]: './',
        [BuiltInTemplateName.mixins]: './', // used conditionally if OpenAPI mixins are used
      },
    },
    [BuiltInTemplateName.mjsBase]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.mjsBase}/`,
      requires: {
        [BuiltInTemplateName.schemaCjs]: './',
        [BuiltInTemplateName.mixins]: './', // used conditionally if OpenAPI mixins are used
      },
    },
    [BuiltInTemplateName.ts]: {
      requires: {
        [BuiltInTemplateName.tsBase]: './',
        [BuiltInTemplateName.openapiTs]: './',
      },
    },
    [BuiltInTemplateName.cjs]: {
      requires: {
        [BuiltInTemplateName.cjsBase]: './',
        [BuiltInTemplateName.openapiCjs]: './',
      },
    },
    [BuiltInTemplateName.mjs]: {
      requires: {
        [BuiltInTemplateName.mjsBase]: './',
        [BuiltInTemplateName.openapiCjs]: './',
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
