import path from 'node:path';
import fs from 'node:fs/promises';
import ejs from 'ejs';
import type { VovkSchema } from 'vovk';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import type { Segment } from '../locateSegments.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import prettify from '../utils/prettify.mjs';
import { GenerateOptions } from '../types.mjs';
import getClientTemplates from './getClientTemplates.mjs';

export default async function generate({
  projectInfo,
  segments,
  segmentsSchema,
  templates,
  prettify: prettifyClient,
  fullSchema,
}: {
  projectInfo: ProjectInfo;
  segments: Segment[];
  segmentsSchema: Record<string, VovkSchema>;
} & Pick<GenerateOptions, 'templates' | 'prettify' | 'fullSchema'>): Promise<{ written: boolean; path: string }> {
  templates = templates ?? projectInfo.config.clientGenerateTemplateNames;
  const noClient = templates?.[0] === 'none';
  const {
    config,
    cwd,
    log,
    validateOnClientImportPath,
    apiRoot,
    fetcherClientImportPath,
    schemaOutImportPath,
  } = projectInfo;
  const clientOutDirAbsolutePath = path.resolve(cwd, config.clientOutDir);

  const templateFiles = getClientTemplates({ config, cwd, templateNames: templates });
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
    apiRoot,
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
    log.info(`Full schema has ben written to ${fullSchemaOutAbsolutePath}`);
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
