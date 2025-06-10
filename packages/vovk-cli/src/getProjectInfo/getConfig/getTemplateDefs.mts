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

  // other languages (packages installed separately)
  rs = 'rs',
  py = 'py',
}

export default function getTemplateDefs(
  userTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {}
): VovkStrictConfig['clientTemplateDefs'] {
  const defs: VovkStrictConfig['clientTemplateDefs'] = {};
  const builtInDefs: VovkStrictConfig['clientTemplateDefs'] = {
    [BuiltInTemplateName.ts]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.ts}/`,
      requires: { [BuiltInTemplateName.schemaTs]: '.' },
      isTsClient: true,
    },
    [BuiltInTemplateName.cjs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.cjs}/`,
      requires: { [BuiltInTemplateName.schemaCjs]: '.' },
      isTsClient: true,
    },
    [BuiltInTemplateName.mjs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.mjs}/`,
      requires: { [BuiltInTemplateName.schemaCjs]: '.' },
      isTsClient: true,
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
    [BuiltInTemplateName.standaloneTypesTs]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.standaloneTypesTs}/`,
      requires: { [BuiltInTemplateName.schemaJson]: '.' },
    },
    [BuiltInTemplateName.readme]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.readme}/`,
    },
    [BuiltInTemplateName.packageJson]: {
      templatePath: `vovk-cli/client-templates/${BuiltInTemplateName.packageJson}/`,
    },
    [BuiltInTemplateName.rs]: {
      templatePath: 'vovk-rust/template/',
      composedClient: {
        outDir: 'dist_rust',
      },
      requires: {
        [BuiltInTemplateName.schemaJson]: './data',
      },
    },
    [BuiltInTemplateName.py]: {
      templatePath: 'vovk-python/template/',
      composedClient: {
        outDir: 'dist_python',
      },
      requires: {
        [BuiltInTemplateName.schemaJson]: './data',
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
        };
      }
    } else {
      defs[name] = templateDef;
    }
  }

  return { ...builtInDefs, ...defs };
}
