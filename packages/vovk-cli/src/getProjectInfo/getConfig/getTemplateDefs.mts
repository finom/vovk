import type { VovkStrictConfig } from 'vovk';
import path from 'node:path';

export enum BuiltInTemplateName {
  ts = 'ts',
  cjs = 'cjs',
  mjs = 'mjs',
  readme = 'readme',
  packageJson = 'packageJson',
  fullSchemaTs = 'fullSchemaTs',
  fullSchemaCjs = 'fullSchemaCjs',
  fullSchemaJson = 'fullSchemaJson',
}

const templatesDir = path.join(import.meta.dirname, '../../..', 'client-templates');

export default function getTemplateDefs(
  userTemplateDefs: VovkStrictConfig['clientTemplateDefs'] = {}
): VovkStrictConfig['clientTemplateDefs'] {
  const defs: VovkStrictConfig['clientTemplateDefs'] = {};
  const builtInDefs: VovkStrictConfig['clientTemplateDefs'] = {
    [BuiltInTemplateName.ts]: {
      templatePath: path.resolve(templatesDir, 'ts/'),
      origin: null,
      requires: { [BuiltInTemplateName.fullSchemaTs]: '.' },
    },
    [BuiltInTemplateName.cjs]: {
      templatePath: path.resolve(templatesDir, 'cjs/'),
      origin: null,
      requires: { [BuiltInTemplateName.fullSchemaCjs]: '.' },
    },
    [BuiltInTemplateName.mjs]: {
      templatePath: path.resolve(templatesDir, 'mjs/'),
      origin: null,
      requires: { [BuiltInTemplateName.fullSchemaCjs]: '.' },
    },
    [BuiltInTemplateName.readme]: {
      templatePath: path.resolve(templatesDir, 'readme/'),
      origin: null,
    },
    [BuiltInTemplateName.packageJson]: {
      templatePath: path.resolve(templatesDir, 'packageJson/'),
      origin: null,
    },
    [BuiltInTemplateName.fullSchemaTs]: {
      templatePath: path.resolve(templatesDir, 'fullSchemaTs/'),
      origin: null,
    },
    [BuiltInTemplateName.fullSchemaCjs]: {
      templatePath: path.resolve(templatesDir, 'fullSchemaCjs/'),
      origin: null,
    },
    [BuiltInTemplateName.fullSchemaJson]: {
      templatePath: path.resolve(templatesDir, 'fullSchemaJson/'),
      origin: null,
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
