import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import _ from 'lodash';
import type { VovkSchema, VovkStrictConfig } from 'vovk';
import type { PackageJson } from 'type-fest';
import getClientTemplateFiles from './getClientTemplateFiles.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import type { GenerateOptions } from '../types.mjs';
import pickSegmentFullSchema from '../utils/pickSegmentFullSchema.mjs';
import removeUnlistedDirectories from '../utils/removeUnlistedDirectories.mjs';
import getTemplateClientImports from './getTemplateClientImports.mjs';
import mergePackages from './mergePackages.mjs';
import writeOneClientFile from './writeOneClientFile.mjs';
import { ROOT_SEGMENT_SCHEMA_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';
import type { Segment } from '../locateSegments.mts';

const getIncludedSegmentNames = (
  config: VovkStrictConfig,
  fullSchema: VovkSchema,
  configKey: 'segmentedClient' | 'composedClient',
  cliGenerateOptions: GenerateOptions | undefined
) => {
  const segments = Object.values(fullSchema.segments);
  const includeSegments =
    cliGenerateOptions?.[configKey === 'segmentedClient' ? 'segmentedIncludeSegments' : 'composedIncludeSegments'] ??
    config[configKey].includeSegments;
  const excludeSegments =
    cliGenerateOptions?.[configKey === 'segmentedClient' ? 'segmentedExcludeSegments' : 'composedExcludeSegments'] ??
    config[configKey].excludeSegments;
  if (includeSegments?.length && excludeSegments?.length) {
    throw new Error(
      `Both includeSegments and excludeSegments are set in "${configKey}" config. Please use only one of them.`
    );
  }
  const includedSegmentNames =
    Array.isArray(includeSegments) && includeSegments.length
      ? includeSegments.map((segmentName) => {
          const segment = segments.find(({ segmentName: sName }) => sName === segmentName);
          if (!segment) {
            throw new Error(`Segment "${segmentName}" not found in the config for "${configKey}"`);
          }
          return segment.segmentName;
        })
      : Array.isArray(excludeSegments) && excludeSegments.length // TODO: Warn if excludeSegments includes a segment name that is not listed at segments
        ? segments
            .filter(({ segmentName }) => !excludeSegments?.includes(segmentName))
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
  clientType = 'Composed',
  startTime,
  fromTemplates,
}: {
  results: GenerationResult[];
  log: ProjectInfo['log'];
  isEnsuringClient?: boolean;
  forceNothingWrittenLog?: boolean;
  clientType?: string;
  startTime: number;
  fromTemplates: string[];
}): void {
  const writtenResults = results.filter(({ written }) => written);
  const duration = Date.now() - startTime;

  if (writtenResults.length) {
    const groupedByDir = _.groupBy(writtenResults, ({ outAbsoluteDir }) => outAbsoluteDir);

    for (const [outAbsoluteDir, dirResults] of Object.entries(groupedByDir)) {
      const templateNames = _.uniq(dirResults.map(({ templateName }) => templateName));
      log.info(
        `${clientType} client${isEnsuringClient ? ' placeholder' : ''} is generated to ${chalkHighlightThing(outAbsoluteDir)} from template${templateNames.length !== 1 ? 's' : ''} ${chalkHighlightThing(
          templateNames.map((s) => `"${s}"`).join(', ')
        )} in ${duration}ms`
      );
    }
  } else if (!isEnsuringClient && fromTemplates.length) {
    const logOrDebug = forceNothingWrittenLog ? log.info : log.debug;
    logOrDebug(`${clientType} client is up to date and doesn't need to be regenerated (${duration}ms)`);
  }
}

export default async function generate({
  isEnsuringClient = false,
  projectInfo,
  forceNothingWrittenLog,
  fullSchema,
  locatedSegments,
  cliGenerateOptions,
}: {
  isEnsuringClient?: boolean;
  projectInfo: ProjectInfo;
  forceNothingWrittenLog?: boolean;
  fullSchema: VovkSchema;
  locatedSegments: Segment[];
  cliGenerateOptions?: GenerateOptions;
}) {
  const { config, cwd, log } = projectInfo;
  const isComposedEnabled =
    cliGenerateOptions?.composedOnly ||
    !!cliGenerateOptions?.composedFrom ||
    !!cliGenerateOptions?.composedOut ||
    (config.composedClient?.enabled && !cliGenerateOptions?.segmentedOnly);

  const isSegmentedEnabled =
    cliGenerateOptions?.segmentedOnly ||
    !!cliGenerateOptions?.segmentedFrom ||
    !!cliGenerateOptions?.segmentedOut ||
    (config.segmentedClient?.enabled && !cliGenerateOptions?.composedOnly);

  if (isComposedEnabled) {
    const now = Date.now();
    const segmentNames = getIncludedSegmentNames(config, fullSchema, 'composedClient', cliGenerateOptions);
    const { templateFiles: composedClientTemplateFiles, fromTemplates } = await getClientTemplateFiles({
      config,
      cwd,
      log,
      cliGenerateOptions,
      configKey: 'composedClient',
    });

    const composedClientResults = await Promise.all(
      composedClientTemplateFiles.map(async (clientTemplateFile) => {
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
          fullSchema,
          outCwdRelativeDir,
        });

        const packageJson = await mergePackages({
          cwd,
          config,
          packages: [config.composedClient.package as PackageJson, templateDef.composedClient?.package as PackageJson],
        });

        const { written } = await writeOneClientFile({
          cwd,
          projectInfo,
          clientTemplateFile,
          fullSchema: pickSegmentFullSchema(fullSchema, segmentNames),
          prettifyClient: config.prettifyClient,
          segmentName: null,
          imports: clientImports.composedClient,
          templateContent,
          matterResult,
          package: packageJson,
          isEnsuringClient,
          outCwdRelativeDir,
          origin: config.origin ?? templateDef?.origin ?? null,
          templateDef,
          locatedSegments,
        });

        const outAbsoluteDir = path.join(cwd, outCwdRelativeDir);

        return {
          written,
          templateName,
          outAbsoluteDir,
        };
      })
    );

    if (composedClientTemplateFiles.length) {
      logClientGenerationResults({
        results: composedClientResults,
        log,
        isEnsuringClient,
        forceNothingWrittenLog,
        clientType: 'Composed',
        startTime: now,
        fromTemplates,
      });
    } else {
      log.warn('No composed client template files found. Skipping composed client generation.');
    }
  }

  if (isSegmentedEnabled) {
    const now = Date.now();
    const segmentNames = getIncludedSegmentNames(config, fullSchema, 'segmentedClient', cliGenerateOptions);
    const { templateFiles: segmentedClientTemplateFiles, fromTemplates } = await getClientTemplateFiles({
      config,
      cwd,
      log,
      cliGenerateOptions,
      configKey: 'segmentedClient',
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
              fullSchema,
              outCwdRelativeDir,
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
              outCwdRelativeDir,
              origin: config.origin ?? templateDef?.origin ?? null,
              templateDef,
              locatedSegments,
            });

            return {
              written,
              templateName,
            };
          })
        );
        const outAbsoluteDir = path.join(cwd, outCwdRelativeDir);

        // Remove unlisted directories in the output directory
        await removeUnlistedDirectories(
          outAbsoluteDir,
          segmentNames.map((s) => s || ROOT_SEGMENT_SCHEMA_NAME)
        );
        return {
          written: results.some(({ written }) => written),
          templateName,
          outAbsoluteDir,
        };
      })
    );

    if (segmentedClientTemplateFiles.length) {
      logClientGenerationResults({
        results: segmentedClientResults,
        log,
        isEnsuringClient,
        forceNothingWrittenLog,
        clientType: 'Segmented',
        startTime: now,
        fromTemplates,
      });
    } else {
      log.warn('No segmented client template files found. Skipping segmented client generation.');
    }
  }
}
