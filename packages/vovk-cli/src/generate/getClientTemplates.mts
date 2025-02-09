import path from 'node:path';
import { VovkConfig } from '../types.mjs';

interface ClientTemplate {
  templateName: string;
  templatePath: string;
  outPath: string;
}

export default function getClientTemplates({
  config,
  cwd,
  templateNames = [],
}: {
  config: Required<VovkConfig>;
  cwd: string;
  templateNames?: string[];
}) {
  const templatesDir = path.join(import.meta.dirname, '../..', 'client-templates');
  const clientOutDirAbsolutePath = path.resolve(cwd, config.clientOutDir);

  const mapper =
    (dir: string) =>
    (name: string): ClientTemplate => ({
      templateName: name,
      templatePath: path.resolve(templatesDir, dir, name),
      outPath: path.join(clientOutDirAbsolutePath, name.replace('.ejs', '')),
    });
  const builtInTemplatesMap = {
    ts: ['index.ts.ejs'].map(mapper('ts')),
    main: ['main.cjs.ejs', 'main.d.cts.ejs'].map(mapper('main')),
    module: ['module.mjs.ejs', 'module.d.mts.ejs'].map(mapper('module')),
    python: ['__init__.py'].map(mapper('python')),
  };

  const templateFiles: ClientTemplate[] = (templateNames ?? config.experimental_clientGenerateTemplateNames).reduce(
    (acc, template) => {
      if (template in builtInTemplatesMap) {
        return [...acc, ...builtInTemplatesMap[template as 'ts']];
      }
      return [
        ...acc,
        {
          templateName: template,
          templatePath: path.resolve(cwd, template),
          outPath: path.join(clientOutDirAbsolutePath, path.basename(template).replace('.ejs', '')),
        },
      ];
    },
    [] as ClientTemplate[]
  );

  return { clientOutDirAbsolutePath, templateFiles };
}
