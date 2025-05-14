import type { VovkStrictConfig } from 'vovk';
import path from 'node:path';

export enum BuiltInTemplateName {
  // ts/js
  ts = 'ts',
  cjs = 'cjs',
  mjs = 'mjs',

  // schema
  fullSchemaTs = 'fullSchemaTs',
  fullSchemaCjs = 'fullSchemaCjs',
  fullSchemaJson = 'fullSchemaJson',

  // misc
  readme = 'readme',
  packageJson = 'packageJson',

  // other languages
  rs = 'rs',
  py = 'py',
}

const templatesDir = path.join(import.meta.dirname, '../../..', 'client-templates');

export default function getTemplateDefs(
  userTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {}
): VovkStrictConfig['clientTemplateDefs'] {
  const defs: VovkStrictConfig['clientTemplateDefs'] = {};
  const builtInDefs: VovkStrictConfig['clientTemplateDefs'] = {
    [BuiltInTemplateName.ts]: {
      templatePath: `vovk-cli/module-templates/${BuiltInTemplateName.ts}/`,
      origin: null,
      requires: { [BuiltInTemplateName.fullSchemaTs]: '.' },
    },
    [BuiltInTemplateName.cjs]: {
      templatePath: `vovk-cli/module-templates/${BuiltInTemplateName.cjs}/`,
      origin: null,
      requires: { [BuiltInTemplateName.fullSchemaCjs]: '.' },
    },
    [BuiltInTemplateName.mjs]: {
      templatePath: `vovk-cli/module-templates/${BuiltInTemplateName.mjs}/`,
      origin: null,
      requires: { [BuiltInTemplateName.fullSchemaCjs]: '.' },
    },
    [BuiltInTemplateName.readme]: {
      templatePath: `vovk-cli/module-templates/${BuiltInTemplateName.readme}/`,
      origin: null,
    },
    [BuiltInTemplateName.packageJson]: {
      templatePath: `vovk-cli/module-templates/${BuiltInTemplateName.packageJson}/`,
      origin: null,
    },
    [BuiltInTemplateName.fullSchemaTs]: {
      templatePath: `vovk-cli/module-templates/${BuiltInTemplateName.fullSchemaTs}/`,
      origin: null,
    },
    [BuiltInTemplateName.fullSchemaCjs]: {
      templatePath: `vovk-cli/module-templates/${BuiltInTemplateName.fullSchemaCjs}/`,
      origin: null,
    },
    [BuiltInTemplateName.fullSchemaJson]: {
      templatePath: `vovk-cli/module-templates/${BuiltInTemplateName.fullSchemaJson}/`,
      origin: null,
    },
    [BuiltInTemplateName.rs]: {
      templatePath: 'vovk-rust-client/template/',
      fullClient: {
        outDir: 'dist_rust',
      },
      requires: {
        fullSchemaJson: './data',
      },
    },
    [BuiltInTemplateName.py]: {
      templatePath: 'vovk-python-client/template/',
      fullClient: {
        outDir: 'dist_python',
      },
      requires: {
        fullSchemaJson: './data',
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
