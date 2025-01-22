import path from 'node:path';
import { VovkConfig } from "../types.mjs";

interface ClientTemplate { templatePath: string; outPath: string }

export default function getClientTemplates ({ 
    config, cwd, templateNames = [],
}: { 
    config: Required<VovkConfig>; cwd: string; templateNames?: string[]; 
}): ClientTemplate[] {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const templatesDir = path.join(__dirname, '..', 'client-templates');
    const clientOutDirAbsolutePath = path.resolve(cwd, config.clientOutDir);
    const mapper = (dir: string) => (name: string): ClientTemplate => ({
        templatePath: path.resolve(templatesDir, dir, name),
        outPath: path.join(clientOutDirAbsolutePath, name.replace('.ejs', '')),
    });
    const builtInTemplatesMap = {
        ts: ['index.ts.ejs'].map(mapper('ts')),
        compiled: ['compiled.js.ejs', 'compiled.d.ts.ejs'].map(mapper('compiled')),
        python: ['__init__.py'].map(mapper('python')),
    }

    const templateFiles: ClientTemplate[] = (templateNames ?? config.clientGenerateTemplateNames).reduce((acc, template) => {
        if (template in builtInTemplatesMap) {
            return [...acc, ...builtInTemplatesMap[template as 'ts']];
        }
        return [...acc, { 
            templatePath: path.resolve(cwd, template), 
            outPath: path.join(clientOutDirAbsolutePath, path.basename(template).replace('.ejs', '')) 
        }];
    }, [] as ClientTemplate[]);

    return templateFiles;
}