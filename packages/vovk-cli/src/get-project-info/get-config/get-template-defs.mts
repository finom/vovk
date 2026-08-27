import type { VovkStrictConfig } from 'vovk/internal';

// const object instead of enum, node 26 runs ts with erasable syntax only
export const BuiltInTemplateName = {
  // ts
  tsBase: 'tsBase',
  ts: 'ts',

  // schema
  schemaTs: 'schemaTs',
  schemaJson: 'schemaJson',

  // openapi
  openapiTs: 'openapiTs',
  openapiJson: 'openapiJson',

  // misc
  readme: 'readme',
  packageJson: 'packageJson',
  mixins: 'mixins',

  // other languages (packages installed separately)
  rsSrc: 'rsSrc',
  rsPkg: 'rsPkg',
  rsReadme: 'rsReadme',
  rs: 'rs',
  pySrc: 'pySrc',
  pyPkg: 'pyPkg',
  pyReadme: 'pyReadme',
  py: 'py',
} as const;
export type BuiltInTemplateName = (typeof BuiltInTemplateName)[keyof typeof BuiltInTemplateName];

export function getTemplateDefs(
  userTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {}
): VovkStrictConfig['clientTemplateDefs'] {
  const defs: VovkStrictConfig['clientTemplateDefs'] = {};
  const builtInDefs: VovkStrictConfig['clientTemplateDefs'] = {
    [BuiltInTemplateName.openapiTs]: {
      templatePath: 'vovk-cli/client-templates/openapi-ts/',
      requires: {
        [BuiltInTemplateName.openapiJson]: './',
      },
    },
    [BuiltInTemplateName.openapiJson]: {
      templatePath: 'vovk-cli/client-templates/openapi-json/',
    },
    [BuiltInTemplateName.tsBase]: {
      templatePath: 'vovk-cli/client-templates/ts-base/',
      requires: {
        [BuiltInTemplateName.schemaTs]: './',
        [BuiltInTemplateName.mixins]: './', // used conditionally if OpenAPI mixins are used
      },
    },
    [BuiltInTemplateName.ts]: {
      requires: {
        [BuiltInTemplateName.tsBase]: './',
        [BuiltInTemplateName.openapiTs]: './',
      },
    },
    [BuiltInTemplateName.schemaTs]: {
      templatePath: 'vovk-cli/client-templates/schema-ts/',
    },
    [BuiltInTemplateName.schemaJson]: {
      templatePath: 'vovk-cli/client-templates/schema-json/',
    },
    [BuiltInTemplateName.readme]: {
      templatePath: 'vovk-cli/client-templates/readme/',
    },
    [BuiltInTemplateName.packageJson]: {
      templatePath: 'vovk-cli/client-templates/package-json/',
    },

    [BuiltInTemplateName.mixins]: {
      templatePath: 'vovk-cli/client-templates/mixins/',
    },
    [BuiltInTemplateName.rsSrc]: {
      templatePath: 'vovk-rust/client-templates/rs-src/',
      requires: {
        [BuiltInTemplateName.schemaJson]: './',
      },
    },
    [BuiltInTemplateName.rsPkg]: {
      templatePath: 'vovk-rust/client-templates/rs-pkg/',
    },
    [BuiltInTemplateName.rsReadme]: {
      templatePath: 'vovk-rust/client-templates/rs-readme/',
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
      templatePath: 'vovk-python/client-templates/py-src/',
      requires: {
        [BuiltInTemplateName.schemaJson]: './',
      },
    },
    [BuiltInTemplateName.pyPkg]: {
      templatePath: 'vovk-python/client-templates/py-pkg/',
    },
    [BuiltInTemplateName.pyReadme]: {
      templatePath: 'vovk-python/client-templates/py-readme/',
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
