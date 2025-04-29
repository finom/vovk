import type { VovkStrictConfig } from 'vovk';
import path from 'node:path';

export enum BuiltInTemplateName {
  ts = 'ts',
  main = 'main',
  module = 'module',
  fullSchema = 'fullSchema',
  package = 'package',
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
      requires: { fullSchema: '.' },
    },
    [BuiltInTemplateName.main]: {
      templatePath: path.resolve(templatesDir, 'main/'),
      origin: null,
      requires: { fullSchema: '.' },
    },
    [BuiltInTemplateName.module]: {
      templatePath: path.resolve(templatesDir, 'module/'),
      origin: null,
      requires: { fullSchema: '.' },
    },
    [BuiltInTemplateName.fullSchema]: {
      templatePath: path.resolve(templatesDir, 'fullSchema/'),
      origin: null,
    },
    [BuiltInTemplateName.package]: {
      templatePath: path.resolve(templatesDir, 'package/'),
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
