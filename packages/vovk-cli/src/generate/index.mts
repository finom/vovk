import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import _ from 'lodash';
import type { VovkFullSchema, VovkStrictConfig } from 'vovk';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import getClientTemplateFiles from './getClientTemplateFiles.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import { ClientGenerateType, type GenerateOptions } from '../types.mjs';
import { ROOT_SEGMENT_SCHEMA_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';
import pickSegmentFullSchema from '../utils/pickSegmentFullSchema.mjs';
import removeUnlistedDirectories from '../utils/removeUnlistedDirectories.mjs';
import type { PackageJson } from 'type-fest';
import getTemplateClientImports from './getTemplateClientImports.mjs';
import mergePackages from './mergePackages.mjs';
import writeOneClientFile from './writeOneClientFile.mjs';

const getIncludedSegmentNames = (
  config: VovkStrictConfig,
  segments: ProjectInfo['segments'],
  configKey: 'segmentedClient' | 'fullClient'
) => {
  if (
    ('includeSegments' satisfies keyof (typeof config)[typeof configKey]) in config[configKey] &&
    ('excludeSegments' satisfies keyof (typeof config)[typeof configKey]) in config[configKey]
  ) {
    throw new Error(
      `Both includeSegments and excludeSegments are set in ${configKey} config. Please use only one of them.`
    );
  }
  const includedSegmentNames =
    ('includeSegments' satisfies keyof (typeof config)[typeof configKey]) in config[configKey] &&
    Array.isArray(config[configKey].includeSegments)
      ? config[configKey].includeSegments.map((segmentName) => {
          const segment = segments.find(({ segmentName: sName }) => sName === segmentName);
          if (!segment) {
            throw new Error(`Segment "${segmentName}" not found in the config for ${configKey}`);
          }
          return segment.segmentName;
        })
      : ('excludeSegments' satisfies keyof (typeof config)[typeof configKey]) in config[configKey] &&
          Array.isArray(config[configKey].excludeSegments)
        ? segments
            .filter(({ segmentName }) => !config[configKey].excludeSegments?.includes(segmentName))
            .map(({ segmentName }) => segmentName)
        : segments.map(({ segmentName }) => segmentName);

  return includedSegmentNames;
};

interface GenerationResult {
  written: boolean;
  templateName: string;
  outAbsoluteDir: string;
}

function logClientGenerationResults({
  results,
  log,
  isEnsuringClient = false,
  forceNothingWrittenLog = false,
  clientType = 'Full',
  startTime,
}: {
  results: GenerationResult[];
  log: ProjectInfo['log'];
  isEnsuringClient?: boolean;
  forceNothingWrittenLog?: boolean;
  clientType?: string;
  startTime: number;
}): void {
  const writtenResults = results.filter(({ written }) => written);
  const duration = Date.now() - startTime;

  if (writtenResults.length) {
    const groupedByDir = _.groupBy(writtenResults, ({ outAbsoluteDir }) => outAbsoluteDir);

    for (const [outAbsoluteDir, dirResults] of Object.entries(groupedByDir)) {
      const templateNames = dirResults.map(({ templateName }) => templateName);
      log.info(
        `${clientType} client${isEnsuringClient ? ' placeholder' : ''} is generated to ${chalkHighlightThing(outAbsoluteDir)} from template${templateNames.length !== 1 ? 's' : ''} ${chalkHighlightThing(
          templateNames.map((s) => `"${s}"`).join(', ')
        )} in ${duration}ms`
      );
    }
  } else if (!isEnsuringClient) {
    const logOrDebug = forceNothingWrittenLog ? log.info : log.debug;
    logOrDebug(`${clientType} client is up to date and doesn't need to be regenerated (${duration}ms)`);
  }
}

export default async function generate({
  isEnsuringClient = false,
  projectInfo,
  forceNothingWrittenLog,
  fullSchema,
  cliOptions,
}: {
  isEnsuringClient?: boolean;
  projectInfo: ProjectInfo;
  forceNothingWrittenLog?: boolean;
  fullSchema: VovkFullSchema;
  cliOptions?: GenerateOptions;
}) {
  const { config, cwd, log, segments } = projectInfo;

  // Ensure that each segment has a matching schema if it needs to be emitted:
  for (let i = 0; i < segments.length; i++) {
    const { segmentName } = segments[i];
    const schema = fullSchema.segments[segmentName];
    if (!schema) {
      throw new Error(`Unable to generate client. No schema found for ${formatLoggedSegmentName(segmentName)}`);
    }
    if (!schema.emitSchema) continue;
  }

  if (config.fullClient.enabled) {
    const now = Date.now();
    const segmentNames = getIncludedSegmentNames(config, segments, 'fullClient');
    const fullClientTemplateFiles = await getClientTemplateFiles({
      config,
      cwd,
      log,
      cliOptions,
      type: ClientGenerateType.FULL,
    });

    const fullClientResults = await Promise.all(
      fullClientTemplateFiles.map(async (clientTemplateFile) => {
        const { templateFilePath, templateName, templateDef, outCwdRelativeDir } = clientTemplateFile;
        const templateContent = await fs.readFile(templateFilePath, 'utf-8');

        const matterResult = templateFilePath.endsWith('.ejs')
          ? (matter(templateContent) as {
              data: {
                imports?: string[];
              };
              content: string;
            })
          : { data: { imports: [] }, content: templateContent };
        const clientImports = await getTemplateClientImports({
          config,
          segments,
          outCwdRelativeDir,
        });

        const packageJson = await mergePackages({
          cwd,
          config,
          packages: [config.fullClient.package as PackageJson, templateDef.fullClient?.package as PackageJson],
        });

        const { written } = await writeOneClientFile({
          cwd,
          projectInfo,
          clientTemplateFile,
          fullSchema: pickSegmentFullSchema(fullSchema, segmentNames),
          prettifyClient: config.prettifyClient,
          segmentName: null,
          imports: clientImports.fullClient,
          templateContent,
          matterResult,
          package: packageJson,
          isEnsuringClient,
          outCwdRelativeDir,
          origin: config.origin ?? templateDef?.origin ?? null,
        });

        const outAbsoluteDir = path.join(cwd, outCwdRelativeDir);

        return {
          written,
          templateName,
          outAbsoluteDir,
        };
      })
    );

    logClientGenerationResults({
      results: fullClientResults,
      log,
      isEnsuringClient,
      forceNothingWrittenLog,
      clientType: 'Full',
      startTime: now,
    });
  }

  if (config.segmentedClient.enabled) {
    const now = Date.now();
    const segmentNames = getIncludedSegmentNames(config, segments, 'segmentedClient');
    const segmentedClientTemplateFiles = await getClientTemplateFiles({
      config,
      cwd,
      log,
      cliOptions,
      type: ClientGenerateType.SEGMENTED,
    });

    const segmentedClientResults = await Promise.all(
      segmentedClientTemplateFiles.map(async (clientTemplateFile) => {
        const { templateFilePath, templateName, templateDef, outCwdRelativeDir } = clientTemplateFile;
        const templateContent = await fs.readFile(templateFilePath, 'utf-8');

        const matterResult = templateFilePath.endsWith('.ejs')
          ? (matter(templateContent) as {
              data: {
                imports?: string[];
              };
              content: string;
            })
          : { data: { imports: [] }, content: templateContent };

        const results = await Promise.all(
          segmentNames.map(async (segmentName) => {
            const clientImports = await getTemplateClientImports({
              config,
              segments,
              outCwdRelativeDir: path.join(outCwdRelativeDir, segmentName || ROOT_SEGMENT_SCHEMA_NAME),
            });

            const packageJson = await mergePackages({
              cwd,
              config,
              packages: [
                config.segmentedClient.packages?.[segmentName] as PackageJson,
                templateDef.segmentedClient?.packages?.[segmentName] as PackageJson,
              ],
            });

            const { written } = await writeOneClientFile({
              cwd,
              projectInfo,
              clientTemplateFile,
              fullSchema: pickSegmentFullSchema(fullSchema, [segmentName]),
              prettifyClient: config.prettifyClient,
              segmentName,
              imports: clientImports.segmentedClient[segmentName],
              templateContent,
              matterResult,
              package: packageJson,
              isEnsuringClient,
              outCwdRelativeDir: path.join(outCwdRelativeDir, segmentName || ROOT_SEGMENT_SCHEMA_NAME),
              origin: config.origin ?? templateDef?.origin ?? null,
            });

            return {
              written,
              templateName,
            };
          })
        );
        const outAbsoluteDir = path.join(cwd, outCwdRelativeDir);

        // Remove unlisted directories in the output directory
        await removeUnlistedDirectories(outAbsoluteDir, segmentNames);

        return {
          written: results.some(({ written }) => written),
          templateName,
          outAbsoluteDir,
        };
      })
    );

    logClientGenerationResults({
      results: segmentedClientResults,
      log,
      isEnsuringClient,
      forceNothingWrittenLog,
      clientType: 'Segmented',
      startTime: now,
    });
  }
}
