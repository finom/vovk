import path from 'node:path';
import fs from 'node:fs/promises';
import ejs from 'ejs';
import matter from 'gray-matter';
import _ from 'lodash';
import type { VovkFullSchema } from 'vovk';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import prettify from '../utils/prettify.mjs';
import getClientTemplates, { ClientTemplate, DEFAULT_FULL_SCHEMA_FILE_NAME } from './getClientTemplates.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import type { GenerateOptions } from '../types.mjs';
import { ROOT_SEGMENT_SCHEMA_NAME, SEGMENTS_SCHEMA_DIR_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';
import pickSegmentFullSchema from '../utils/pickSegmentFullSchema.mjs';
import removeUnlistedDirectories from '../utils/removeUnlistedDirectories.mjs';

export type ClientImports = {
  fetcher: string;
  validateOnClient: string | null;
  createRPC: string;
};

async function writeOneClientFile({
  projectInfo,
  clientTemplate,
  fullSchema,
  prettifyClient,
  segmentName,
  imports,
  templateContent,
  matterResult: { data, content },
}: {
  projectInfo: ProjectInfo;
  clientTemplate: ClientTemplate;
  fullSchema: VovkFullSchema;
  prettifyClient: boolean;
  segmentName: string | null; // null for full cllient
  imports: ClientImports;
  templateContent: string;
  matterResult: {
    data: {
      imports?: string[];
    };
    content: string;
  };
}) {
  const { config, apiRoot, segments } = projectInfo;
  const { templatePath, outDir, origin } = clientTemplate;
  const outPath = path.join(
    outDir,
    typeof segmentName === 'string' ? segmentName || ROOT_SEGMENT_SCHEMA_NAME : '',
    path.basename(templatePath).replace('.ejs', '')
  );

  // Data for the EJS templates:
  const t = {
    _, // lodash
    ROOT_SEGMENT_SCHEMA_NAME,
    SEGMENTS_SCHEMA_DIR_NAME,
    apiRoot: origin ? `${origin}/${config.rootEntry}` : apiRoot,
    imports,
    fullSchema,
    schemaOutDir:
      typeof segmentName === 'string'
        ? path.relative(path.join(outDir, segmentName || ROOT_SEGMENT_SCHEMA_NAME), config.schemaOutDir)
        : path.relative(outDir, config.schemaOutDir),
    segmentMeta: Object.fromEntries(
      segments.map(({ segmentName: sName, routeFilePath, segmentImportPath }) => [
        sName,
        {
          routeFilePath,
          segmentImportPath:
            typeof segmentName === 'string'
              ? `${_.times((segmentName.match(/\//g)?.length ?? 0) + 1)
                  .map(() => '..')
                  .join('/')}/${segmentImportPath}`
              : segmentImportPath,
        },
      ])
    ),
  };

  if (data.imports instanceof Array) {
    for (const imp of data.imports) {
      t.imports = {
        ...t.imports,
        [imp]: await import(imp),
      };
    }
  }

  // Render the template
  let rendered = templatePath.endsWith('.ejs')
    ? ejs.render(
        content,
        { t },
        {
          filename: templatePath,
        }
      )
    : templateContent;

  // Optionally prettify
  if (prettifyClient || config.prettifyClient) {
    rendered = await prettify(rendered, outPath);
  }

  // Read existing file content to compare
  const existingContent = await fs.readFile(outPath, 'utf-8').catch(() => '');

  // Determine if we need to rewrite the file, ignore 1st line
  const needsWriting =
    existingContent.trim().split('\n').slice(1).join('\n') !== rendered.trim().split('\n').slice(1).join('\n');

  if (needsWriting) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, rendered);
  }

  return { written: needsWriting };
}

export default async function generate({
  projectInfo,
  forceNothingWrittenLog,
  templates,
  prettify: prettifyClient = false,
  fullSchema,
  emitFullSchema,
}: {
  projectInfo: ProjectInfo;
  forceNothingWrittenLog?: boolean;
  fullSchema: VovkFullSchema;
} & Pick<GenerateOptions, 'templates' | 'prettify' | 'emitFullSchema'>) {
  const now = Date.now();
  const generateFrom = templates ?? projectInfo.config.generateFrom;
  const noClient = templates?.[0] === 'none';
  const { config, cwd, log, clientImports, segments } = projectInfo;

  const { clientOutDirAbsolutePath, templateFiles } = await getClientTemplates({ config, cwd, generateFrom });
  // Ensure that each segment has a matching schema if it needs to be emitted:
  for (let i = 0; i < segments.length; i++) {
    const { segmentName } = segments[i];
    const schema = fullSchema.segments[segmentName];
    if (!schema) {
      throw new Error(`Unable to generate client. No schema found for ${formatLoggedSegmentName(segmentName)}`);
    }
    if (!schema.emitSchema) continue;
  }

  let written = false;
  const fullSchemaOutAbsolutePaths = new Map<string | null, string>();
  const usedTemplateNames = new Set<string>();

  // Process each template in parallel
  await Promise.all(
    templateFiles.map(async (clientTemplate) => {
      const { templatePath, templateName, outDir, fullSchemaJSONFileName } = clientTemplate;
      if (!noClient) {
        // Read the EJS template
        const templateContent = await fs.readFile(templatePath, 'utf-8');

        const matterResult = matter(templateContent) as {
          data: {
            imports?: string[];
          };
          content: string;
        };

        if (config.emitFullClient) {
          const { written: isWritten } = await writeOneClientFile({
            projectInfo,
            clientTemplate,
            fullSchema,
            prettifyClient,
            segmentName: null,
            imports: clientImports.fullClient,
            templateContent,
            matterResult,
          });

          if (isWritten) {
            usedTemplateNames.add(templateName);
          }

          written ||= isWritten;
        }

        // TODO Remove files if emitFullClient is false ???

        if (config.emitSegmentClient) {
          // Generate client files for each segment
          await Promise.all(
            segments.map(async ({ segmentName }) => {
              const segmentFullSchema = {
                config: fullSchema.config,
                segments: { [segmentName]: fullSchema.segments[segmentName] },
              };
              const { written: isWritten } = await writeOneClientFile({
                projectInfo,
                clientTemplate,
                fullSchema: segmentFullSchema,
                prettifyClient,
                segmentName,
                imports: clientImports.schemaClient[segmentName],
                templateContent,
                matterResult,
              });

              if (isWritten) {
                usedTemplateNames.add(templateName);
              }

              written ||= isWritten;
            })
          );

          await removeUnlistedDirectories(
            outDir,
            segments.map(({ segmentName }) => segmentName || ROOT_SEGMENT_SCHEMA_NAME)
          );
        } else {
          await removeUnlistedDirectories(outDir, []);
        }
      }

      if (config.emitFullClient) {
        const fullSchemaOutAbsolutePath = fullSchemaJSONFileName ? path.resolve(outDir, fullSchemaJSONFileName) : null;
        if (fullSchemaOutAbsolutePath) {
          fullSchemaOutAbsolutePaths.set(null, fullSchemaOutAbsolutePath);
        }
      }

      if (config.emitSegmentClient) {
        segments.forEach(({ segmentName }) => {
          const fullSchemaOutAbsolutePath = fullSchemaJSONFileName
            ? path.resolve(outDir, segmentName || ROOT_SEGMENT_SCHEMA_NAME, fullSchemaJSONFileName)
            : null;
          if (fullSchemaOutAbsolutePath) {
            fullSchemaOutAbsolutePaths.set(segmentName, fullSchemaOutAbsolutePath);
          }
        });
      }
    })
  );

  if (emitFullSchema) {
    const fullSchemaOutAbsolutePath = emitFullSchema
      ? path.resolve(
          clientOutDirAbsolutePath,
          emitFullSchema === 'string' ? emitFullSchema : DEFAULT_FULL_SCHEMA_FILE_NAME
        )
      : null;
    if (fullSchemaOutAbsolutePath) {
      fullSchemaOutAbsolutePaths.set(null, fullSchemaOutAbsolutePath);
    }
  }

  if (fullSchemaOutAbsolutePaths.size) {
    await Promise.all(
      Array.from(fullSchemaOutAbsolutePaths.entries()).map(async ([segmentName, outPath]) => {
        const schema = segmentName ? pickSegmentFullSchema(fullSchema, segmentName) : fullSchema;
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, JSON.stringify(schema, null, 2));
      })
    );

    log.info(
      `Full schema has been written to ${Array.from(fullSchemaOutAbsolutePaths)
        .map((s) => `"${s}"`)
        .join(', ')}`
    );
  }

  if (written) {
    log.info(
      `Client generated from template${usedTemplateNames.size !== 1 ? 's' : ''} ${chalkHighlightThing(
        Array.from(usedTemplateNames)
          .map((s) => `"${s}"`)
          .join(', ')
      )} in ${Date.now() - now}ms`
    );
  } else {
    const logOrDebug = forceNothingWrittenLog ? log.info : log.debug;
    logOrDebug(`Client is up to date and doesn't need to be regenerated (${Date.now() - now}ms)`);
  }
}
