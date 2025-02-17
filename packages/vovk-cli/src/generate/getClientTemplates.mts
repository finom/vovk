import path from 'node:path';
import type { VovkStrictConfig } from 'vovk';

interface ClientTemplate {
  templateName: string;
  templatePath: string;
  outPath: string;
  emitFullSchema?: string | boolean;
}

export default function getClientTemplates({
  config,
  cwd,
  generateFrom = [],
}: {
  config: VovkStrictConfig;
  cwd: string;
  generateFrom?: VovkStrictConfig['generateFrom'];
}) {
  const templatesDir = path.join(import.meta.dirname, '../..', 'client-templates');
  const clientOutDirAbsolutePath = path.resolve(cwd, config.clientOutDir);

  const mapper =
    (dir: string) =>
    (name: string): ClientTemplate => ({
      templateName: dir,
      templatePath: path.resolve(templatesDir, dir, name),
      outPath: path.join(clientOutDirAbsolutePath, name.replace('.ejs', '')),
    });
  const builtInTemplatesMap = {
    ts: ['index.ts.ejs'].map(mapper('ts')),
    main: ['main.cjs.ejs', 'main.d.cts.ejs'].map(mapper('main')),
    module: ['module.mjs.ejs', 'module.d.mts.ejs'].map(mapper('module')),
    python: ['__init__.py'].map(mapper('python')),
  };

  const templateFiles: ClientTemplate[] = (generateFrom ?? config.generateFrom).reduce((acc, template) => {
    if (typeof template === 'string') {
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
    }

    const outDirAbsolutePath = template.outDir ? path.resolve(cwd, template.outDir) : clientOutDirAbsolutePath;

    return [
      ...acc,
      {
        templateName: template.templateName ?? template.templatePath,
        templatePath: path.resolve(cwd, template.templatePath),
        outPath: path.join(outDirAbsolutePath, path.basename(template.templatePath).replace('.ejs', '')),
        fullSchema: template.fullSchema,
      },
    ];
  }, [] as ClientTemplate[]);

  return { clientOutDirAbsolutePath, templateFiles };
}
