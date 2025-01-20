import path from 'node:path';
import fs from 'node:fs/promises';
import ejs from 'ejs';
import type { VovkSchema } from 'vovk';
import type { ProjectInfo } from './getProjectInfo/index.mjs';
import type { Segment } from './locateSegments.mjs';
import formatLoggedSegmentName from './utils/formatLoggedSegmentName.mjs';
import prettify from './utils/prettify.mjs';
import { GenerateOptions } from './types.mjs';

interface ClientTemplate { templatePath: string; outPath: string }

export default async function generateClient({
  projectInfo,
  segments,
  segmentsSchema,
  templates = ['ts', 'compiled'],
  prettify: prettifyClient,
  fullSchema,
  noClient,
}: {
  projectInfo: ProjectInfo;
  segments: Segment[];
  segmentsSchema: Record<string, VovkSchema>;
} & Pick<GenerateOptions, 'templates' | 'prettify' | 'fullSchema' | 'noClient'>): Promise<{ written: boolean; path: string }> {
  const {
    config,
    cwd,
    log,
    validateOnClientImportPath,
    apiEntryPoint,
    fetcherClientImportPath,
    schemaOutImportPath,
  } = projectInfo;
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const templatesDir = path.join(__dirname, '..', 'client-templates');
  const clientOutDirAbsolutePath = path.resolve(cwd, config.clientOutDir);
  const mapper = (dir: string) => (name: string): ClientTemplate => ({
    templatePath: path.resolve(templatesDir, dir, name),
    outPath: path.join(clientOutDirAbsolutePath, name.replace('.ejs', '')),
  })
  const builtInTemplatesMap = {
    ts: ['index.ts.ejs'].map(mapper('ts')),
    compiled: ['client.js.ejs', 'client.d.ts.ejs'].map(mapper('compiled')),
    python: ['__init__.py'].map(mapper('python')),
  }

  const templateFiles: ClientTemplate[] = templates.reduce((acc, template) => {
    if (template in builtInTemplatesMap) {
      return [...acc, ...builtInTemplatesMap[template as 'ts']];
    }
    return [...acc, { 
      templatePath: path.resolve(cwd, template), 
      outPath: path.join(clientOutDirAbsolutePath, path.basename(template).replace('.ejs', '')) 
    }];
  }, [] as ClientTemplate[]);

   // Ensure that each segment has a matching schema if it needs to be emitted:
   for (let i = 0; i < segments.length; i++) {
    const { segmentName } = segments[i];
    const schema = segmentsSchema[segmentName];
    if (!schema) {
      throw new Error(
        `Unable to generate client. No schema found for ${formatLoggedSegmentName(segmentName)}`
      );
    }
    if (!schema.emitSchema) continue;
  }

  const now = Date.now();

  // Data for the EJS templates:
  const ejsData = {
    apiEntryPoint,
    fetcherClientImportPath,
    schemaOutImportPath,
    validateOnClientImportPath,
    segments,
    segmentsSchema,
  };

  // 1. Process each template in parallel
  const processedTemplates = noClient ? [] : await Promise.all(
    templateFiles.map(async ({ templatePath, outPath }) => {
      // Read the EJS template
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Render the template
      let rendered = templatePath.endsWith('.ejs') ? ejs.render(templateContent, ejsData) : templateContent;

      // Optionally prettify
      if (prettifyClient || config.prettifyClient) {
        rendered = await prettify(rendered, outPath);
      }

      // Read existing file content to compare
      const existingContent = await fs.readFile(outPath, 'utf-8').catch(() => '');

      // Determine if we need to rewrite the file
      const needsWriting = existingContent !== rendered;

      return {
        outPath,
        rendered,
        needsWriting,
      };
    })
  );

  if(fullSchema) {
    const fullSchemaOutAbsolutePath = path.resolve(clientOutDirAbsolutePath, typeof fullSchema === 'string' ? fullSchema : 'full-schema.json');
    await fs.writeFile(fullSchemaOutAbsolutePath, JSON.stringify(segmentsSchema, null, 2));
    log.info(`Full schema written to ${fullSchemaOutAbsolutePath}`);
  }

  // 2. Check if any file needs rewriting
  const anyNeedsWriting = processedTemplates.some(({ needsWriting }) => needsWriting);
  if (!anyNeedsWriting) {
    log.debug(
      `Client is up to date and doesn't need to be regenerated (${Date.now() - now}ms)`
    );
    return { written: false, path: clientOutDirAbsolutePath };
  }

  // 3. Make sure the output directory exists
  await fs.mkdir(clientOutDirAbsolutePath, { recursive: true });

  // 4. Write updated files where needed
  await Promise.all(
    processedTemplates.map(({ outPath, rendered, needsWriting }) => {
      if (needsWriting) {
        return fs.writeFile(outPath, rendered);
      }
      return null;
    })
  );


  log.info(`Client generated in ${Date.now() - now}ms`);
  return { written: true, path: clientOutDirAbsolutePath };
}
