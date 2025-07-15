import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import _ from 'lodash';
import { openAPIToVovkSchema, VovkConfig, type VovkSchema, type VovkStrictConfig } from 'vovk';
import type { PackageJson } from 'type-fest';
import getClientTemplateFiles from './getClientTemplateFiles.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import type { GenerateOptions } from '../types.mjs';
import pickSegmentFullSchema from '../utils/pickSegmentFullSchema.mjs';
import removeUnlistedDirectories from '../utils/removeUnlistedDirectories.mjs';
import getTemplateClientImports from './getTemplateClientImports.mjs';
import mergePackages from './mergePackages.mjs';
import writeOneClientFile, { normalizeOutTemplatePath } from './writeOneClientFile.mjs';
import { ROOT_SEGMENT_FILE_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';
import type { Segment } from '../locateSegments.mjs';
import { getTsconfig } from 'get-tsconfig';
import { normalizeOpenAPIMixins } from '../utils/normalizeOpenAPIMixins.mjs';
import { BuiltInTemplateName } from '../getProjectInfo/getConfig/getTemplateDefs.mjs';

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
  package: PackageJson;
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
  const groupedByDir = _.groupBy(writtenResults, ({ outAbsoluteDir }) => outAbsoluteDir);
  const logOrDebug = forceNothingWrittenLog ? log.info : log.debug;

  if (writtenResults.length) {
    for (const [outAbsoluteDir, dirResults] of Object.entries(groupedByDir)) {
      const templateNames = _.uniq(dirResults.map(({ templateName }) => templateName));
      log.info(
        `${clientType} client${isEnsuringClient ? ' placeholder' : ''} is generated to ${chalkHighlightThing(normalizeOutTemplatePath(outAbsoluteDir, dirResults[0].package))} from template${templateNames.length !== 1 ? 's' : ''} ${chalkHighlightThing(
          templateNames.map((s) => `"${s}"`).join(', ')
        )} in ${duration}ms`
      );
    }
  } else if (fromTemplates.length) {
    if (!writtenResults.length) {
      logOrDebug(`${clientType} client${isEnsuringClient ? ' placeholder' : ''} is up to date (${duration}ms)`);
    } else if (!isEnsuringClient) {
      for (const [outAbsoluteDir, dirResults] of Object.entries(groupedByDir)) {
        const templateNames = _.uniq(dirResults.map(({ templateName }) => templateName));
        logOrDebug(
          `${clientType} client that was generated to ${chalkHighlightThing(normalizeOutTemplatePath(outAbsoluteDir, dirResults[0].package))} from template${templateNames.length !== 1 ? 's' : ''} ${chalkHighlightThing(
            templateNames.map((s) => `"${s}"`).join(', ')
          )} is up to date and doesn't need to be regenerated (${duration}ms)`
        );
      }
    }
  } else {
    logOrDebug(
      `${clientType} client${isEnsuringClient ? ' placeholder' : ''} is not generated because no files were written (${duration}ms)`
    );
  }
}

const cliOptionsToOpenAPIMixins = ({
  openapiGetMethodName,
  openapiGetModuleName,
  openapiRootUrl,
  openapiSpec,
  openapiMixinName,
}: GenerateOptions): NonNullable<VovkConfig['openApiMixins']> => {
  return Object.fromEntries(
    (
      openapiSpec?.map((spec, i) => {
        return {
          source: spec.startsWith('http://') || spec.startsWith('https://') ? { url: spec } : { file: spec },
          apiRoot: openapiRootUrl?.[i] ?? '/',
          getModuleName: openapiGetModuleName?.[i] ?? undefined,
          getMethodName: (openapiGetMethodName?.[i] as 'auto') ?? 'auto',
          mixinName: openapiMixinName?.[i],
        };
      }) || []
    ).map(({ source, apiRoot, getModuleName, getMethodName, mixinName }) => [
      mixinName,
      {
        source,
        apiRoot,
        getModuleName,
        getMethodName,
        mixinName,
      },
    ])
  );
};

export async function generate({
  isEnsuringClient = false,
  projectInfo,
  forceNothingWrittenLog,
  fullSchema,
  locatedSegments,
  cliGenerateOptions,
  package: argPackageJson,
  readme: argReadme,
}: {
  isEnsuringClient?: boolean;
  projectInfo: ProjectInfo;
  forceNothingWrittenLog?: boolean;
  fullSchema: VovkSchema;
  locatedSegments: Segment[];
  cliGenerateOptions?: GenerateOptions;
  package?: PackageJson;
  readme?: VovkStrictConfig['bundle']['readme'];
}) {
  fullSchema = {
    ...fullSchema,
    // sort segments by name to avoid unnecessary rendering
    segments: Object.fromEntries(Object.entries(fullSchema.segments).sort(([a], [b]) => a.localeCompare(b))),
  };
  const { config, cwd, log, srcRoot, packageJson: rootPackageJson, vovkCliPackage } = projectInfo;
  const allOpenAPIMixins = {
    ...config.openApiMixins,
    ...cliOptionsToOpenAPIMixins(cliGenerateOptions ?? {}),
  };
  if (Object.keys(allOpenAPIMixins).length) {
    const mixins = Object.fromEntries(
      Object.entries(await normalizeOpenAPIMixins({ mixinModules: allOpenAPIMixins, log })).map(([mixinName, conf]) => [
        mixinName,
        openAPIToVovkSchema({ ...conf, mixinName }).segments[mixinName],
      ])
    );

    fullSchema = {
      ...fullSchema,
      segments: {
        ...fullSchema.segments,
        ...mixins,
      },
    };
  }
  const isNodeNextResolution = ['node16', 'nodenext'].includes(
    (await getTsconfig(cwd)?.config?.compilerOptions?.moduleResolution?.toLowerCase()) ?? ''
  );
  const isVovkProject = !!srcRoot;
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
          log,
          rootPackageJson,
          packages: [config.composedClient.package, templateDef.composedClient?.package, argPackageJson],
        });

        const readme = Object.assign({}, config.composedClient.readme, templateDef.composedClient?.readme, argReadme);

        const composedFullSchema = pickSegmentFullSchema(fullSchema, segmentNames);
        const hasMixins = Object.values(composedFullSchema.segments).some((segment) => segment.segmentType === 'mixin');
        if (templateName === BuiltInTemplateName.mixins && !hasMixins) {
          return null;
        }

        const { written } = await writeOneClientFile({
          cwd,
          projectInfo,
          clientTemplateFile,
          fullSchema: composedFullSchema,
          prettifyClient: config.prettifyClient,
          segmentName: null,
          imports: clientImports.composedClient,
          templateContent,
          matterResult,
          package: packageJson,
          readme,
          isEnsuringClient,
          outCwdRelativeDir,
          origin: config.origin ?? templateDef?.origin ?? null,
          templateDef,
          locatedSegments,
          isNodeNextResolution,
          hasMixins,
          isVovkProject,
          vovkCliPackage,
        });

        const outAbsoluteDir = path.resolve(cwd, outCwdRelativeDir);

        return {
          written,
          templateName,
          outAbsoluteDir,
          package: packageJson,
        };
      })
    );

    if (composedClientTemplateFiles.length) {
      logClientGenerationResults({
        results: composedClientResults.filter((result): result is GenerationResult => !!result),
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
        const clientImports = await getTemplateClientImports({
          config,
          fullSchema,
          outCwdRelativeDir,
        });
        const results = await Promise.all(
          segmentNames.map(async (segmentName) => {
            const packageJson = await mergePackages({
              log,
              rootPackageJson,
              packages: [
                config.segmentedClient.packages?.[segmentName],
                templateDef.segmentedClient?.packages?.[segmentName],
                argPackageJson,
              ],
            });

            const readme = Object.assign(
              {},
              config.segmentedClient.readmes?.[segmentName],
              templateDef.segmentedClient?.readmes?.[segmentName],
              argReadme
            );

            const segmentedFullSchema = pickSegmentFullSchema(fullSchema, [segmentName]);
            const hasMixins = Object.values(segmentedFullSchema.segments).some(
              (segment) => segment.segmentType === 'mixin'
            );
            if (templateName === BuiltInTemplateName.mixins && !hasMixins) {
              return null;
            }

            const { written } = await writeOneClientFile({
              cwd,
              projectInfo,
              clientTemplateFile,
              fullSchema: segmentedFullSchema,
              prettifyClient: config.prettifyClient,
              segmentName,
              imports: clientImports.segmentedClient[segmentName],
              templateContent,
              matterResult,
              package: packageJson,
              readme,
              isEnsuringClient,
              outCwdRelativeDir,
              origin: config.origin ?? templateDef?.origin ?? null,
              templateDef,
              locatedSegments,
              isNodeNextResolution,
              hasMixins,
              isVovkProject,
              vovkCliPackage,
            });

            return {
              written,
              templateName,
              package: packageJson,
            };
          })
        );
        const outAbsoluteDir = path.resolve(cwd, outCwdRelativeDir);

        // Remove unlisted directories in the output directory
        await removeUnlistedDirectories(
          outAbsoluteDir,
          segmentNames.map((s) => s || ROOT_SEGMENT_FILE_NAME)
        );
        return {
          written: results.filter((result): result is GenerationResult => !!result).some(({ written }) => written),
          templateName,
          outAbsoluteDir,
          package: results[0]?.package || {}, // TODO: Might be wrong in Python segmented client (unknown use case)
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
