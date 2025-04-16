import path from 'node:path';
import fs from 'node:fs/promises';
import ejs from 'ejs';
import matter from 'gray-matter';
import _ from 'lodash';
import type { VovkFullSchema } from 'vovk';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import prettify from '../utils/prettify.mjs';
import getClientTemplateFiles, { type ClientTemplateFile } from './getClientTemplateFiles.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import type { GenerateOptions } from '../types.mjs';
import { ROOT_SEGMENT_SCHEMA_NAME, SEGMENTS_SCHEMA_DIR_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';
import pickSegmentFullSchema from '../utils/pickSegmentFullSchema.mjs';
import removeUnlistedDirectories from '../utils/removeUnlistedDirectories.mjs';
import type { PackageJson } from 'type-fest';
import getFileSystemEntryType from '../utils/getFileSystemEntryType.mjs';

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
  package: packageJson,
  isEnsuringClient,
}: {
  projectInfo: ProjectInfo;
  clientTemplate: ClientTemplateFile;
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
  package: PackageJson;
  isEnsuringClient: boolean;
}) {
  const { config, apiRoot, segments } = projectInfo;
  const { templatePath, outDir, origin, relativeDir } = clientTemplate;
  if (!templatePath) {
    throw new Error(`Template path is not defined for ${clientTemplate.templateName} but used at writeOneClientFile`);
  }
  const outPath = path.join(
    outDir,
    typeof segmentName === 'string' ? segmentName || ROOT_SEGMENT_SCHEMA_NAME : '',
    relativeDir,
    path.basename(templatePath).replace('.ejs', '')
  );

  let placeholder = `// This is a temporary placeholder to avoid compilation errors if client is imported before it's generated.
// If you still see this text, the client is not generated yet because of an unknown problem.
// Feel free to report an issue at https://github.com/finom/vovk/issues`;
  placeholder = outPath.endsWith('.py') ? placeholder.replace(/\/\//g, '#') : placeholder;

  // Data for the EJS templates:
  const t = {
    _, // lodash
    package: packageJson,
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

  if (isEnsuringClient) {
    rendered = rendered + `\n\n${placeholder}`;
  }

  // Read existing file content to compare
  const existingContent = await fs.readFile(outPath, 'utf-8').catch(() => null);

  // Determine if we need to rewrite the file, ignore 1st line
  const needsWriting = isEnsuringClient
    ? !!existingContent
    : !existingContent ||
      existingContent.trim().split('\n').slice(1).join('\n') !== rendered.trim().split('\n').slice(1).join('\n');

  if (needsWriting) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, rendered, 'utf-8');
  }

  return { written: needsWriting };
}

export default async function generate({
  isEnsuringClient = false,
  projectInfo,
  forceNothingWrittenLog,
  generateFrom: givenGenerateFrom,
  prettify: prettifyClient = false,
  fullSchema,
  fullSchemaJson,
}: {
  isEnsuringClient?: boolean;
  projectInfo: ProjectInfo;
  forceNothingWrittenLog?: boolean;
  fullSchema: VovkFullSchema;
} & Pick<GenerateOptions, 'generateFrom' | 'prettify' | 'fullSchemaJson'>) {
  const now = Date.now();
  const { config, cwd, log, clientImports, segments } = projectInfo;
  const generateFrom = givenGenerateFrom ?? config.generateFrom;

  const templateFiles = await getClientTemplateFiles({ config, cwd, generateFrom, fullSchemaJson, log });
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
      const { templatePath, templateName, outDir, fullSchemaJSONFileName, package: packageJson } = clientTemplate;
      if (templatePath) {
        // Read the EJS template
        const templateContent = await fs.readFile(templatePath, 'utf-8');

        const matterResult = templatePath.endsWith('.ejs')
          ? (matter(templateContent) as {
              data: {
                imports?: string[];
              };
              content: string;
            })
          : { data: { imports: [] }, content: templateContent };
        if (config.generateFullClient) {
          const { written: isWritten } = await writeOneClientFile({
            projectInfo,
            clientTemplate,
            fullSchema,
            prettifyClient,
            segmentName: null,
            imports: clientImports.fullClient,
            templateContent,
            matterResult,
            package: packageJson,
            isEnsuringClient,
          });

          if (isWritten) {
            usedTemplateNames.add(templateName);
          }

          written ||= isWritten;
        }

        // TODO Remove files if generateFullClient is false ???

        if (config.generateSegmentClient) {
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
                package: packageJson,
                isEnsuringClient,
              });

              if (isWritten) {
                usedTemplateNames.add(templateName);
              }

              written ||= isWritten;
            })
          );
        }
      }

      if (config.generateFullClient) {
        const fullSchemaOutAbsolutePath = fullSchemaJSONFileName ? path.resolve(outDir, fullSchemaJSONFileName) : null;
        if (fullSchemaOutAbsolutePath) {
          fullSchemaOutAbsolutePaths.set(null, fullSchemaOutAbsolutePath);
        }
      }

      if (config.generateSegmentClient) {
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

  const outDirs = new Set<string>(templateFiles.map(({ outDir }) => outDir));

  // Remove unlisted directories in the output directory
  await Promise.all(
    Array.from(outDirs).map(async (outDir) => {
      const allRelativePaths = templateFiles
        .filter(({ outDir: tOutDir }) => tOutDir === outDir)
        .map(({ relativeDir }) => relativeDir)
        .filter(Boolean);
      if (config.generateSegmentClient) {
        await removeUnlistedDirectories(
          outDir,
          segments.map(({ segmentName }) => segmentName || ROOT_SEGMENT_SCHEMA_NAME).concat(allRelativePaths)
        );
      } else {
        await removeUnlistedDirectories(outDir, allRelativePaths);
      }
    })
  );

  if (fullSchemaOutAbsolutePaths.size) {
    await Promise.all(
      Array.from(fullSchemaOutAbsolutePaths.entries()).map(async ([segmentName, outPath]) => {
        const schema = typeof segmentName === 'string' ? pickSegmentFullSchema(fullSchema, segmentName) : fullSchema;
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, JSON.stringify(schema, null, 2));
      })
    );

    log.info(
      `Full schema has been written to ${Array.from(fullSchemaOutAbsolutePaths.values())
        .map((s) => `"${s}"`)
        .join(', ')}`
    );
  }

  if (written) {
    if (isEnsuringClient) {
      log.info(
        `Empty client generated from template${usedTemplateNames.size !== 1 ? 's' : ''} ${chalkHighlightThing(
          Array.from(usedTemplateNames)
            .map((s) => `"${s}"`)
            .join(', ')
        )} in ${Date.now() - now}ms`
      );
    } else {
      log.info(
        `Client generated from template${usedTemplateNames.size !== 1 ? 's' : ''} ${chalkHighlightThing(
          Array.from(usedTemplateNames)
            .map((s) => `"${s}"`)
            .join(', ')
        )} in ${Date.now() - now}ms`
      );
    }
  } else if (!isEnsuringClient) {
    const logOrDebug = forceNothingWrittenLog ? log.info : log.debug;
    logOrDebug(`Client is up to date and doesn't need to be regenerated (${Date.now() - now}ms)`);
  }
}
