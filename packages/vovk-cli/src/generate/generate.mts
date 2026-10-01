import fs from 'node:fs/promises';
import path from 'node:path';
import { getTsconfig } from 'get-tsconfig';
import matter from 'gray-matter';
import _ from 'lodash';
import type { PackageJson } from 'type-fest';
import type { VovkSchema } from 'vovk';
import { openAPIToVovkSchema, type VovkOpenAPIMixin, type VovkStrictConfig, vovkSchemaToOpenAPI } from 'vovk/internal';
import { ROOT_SEGMENT_FILE_NAME } from '../dev/write-one-segment-schema-file.mjs';
import { BuiltInTemplateName } from '../get-project-info/get-config/get-template-defs.mjs';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import type { GenerateOptions } from '../types.mjs';
import { chalkHighlightThing } from '../utils/chalk-highlight-thing.mjs';
import { hasGeneratedBanner } from '../utils/generated-banner.mjs';
import type { Segment } from '../utils/locate-segments.mjs';
import { normalizeOpenAPIMixin } from '../utils/normalize-openapi-mixin.mjs';
import { pickSegmentFullSchema } from '../utils/pick-segment-full-schema.mjs';
import { removeUnlistedDirectories } from '../utils/remove-unlisted-directories.mjs';
import { getClientTemplateFiles } from './get-client-template-files.mjs';
import { normalizeOutTemplatePath, withSegmentPackageName, writeOneClientFile } from './write-one-client-file.mjs';

const getIncludedSegmentNames = (
  config: VovkStrictConfig,
  fullSchema: VovkSchema,
  configKey: 'segmentedClient' | 'composedClient',
  cliGenerateOptions: GenerateOptions | undefined
) => {
  const segments = Object.values(fullSchema.segments);
  const cliIncludeSegments =
    cliGenerateOptions?.[configKey === 'segmentedClient' ? 'segmentedIncludeSegments' : 'composedIncludeSegments'];
  const cliExcludeSegments =
    cliGenerateOptions?.[configKey === 'segmentedClient' ? 'segmentedExcludeSegments' : 'composedExcludeSegments'];
  // CLI options win as a pair so config exclude cannot conflict with CLI include
  const isFromCli = !!(cliIncludeSegments?.length || cliExcludeSegments?.length);
  const includeSegments = isFromCli ? cliIncludeSegments : config[configKey].includeSegments;
  const excludeSegments = isFromCli ? cliExcludeSegments : config[configKey].excludeSegments;
  if (includeSegments?.length && excludeSegments?.length) {
    throw new Error(
      `Both includeSegments and excludeSegments are set ${isFromCli ? 'as CLI options' : `in "${configKey}" config`}. Please use only one of them.`
    );
  }
  const segmentExists = (segmentName: string) => segments.some(({ segmentName: sName }) => sName === segmentName);

  if (includeSegments?.length) {
    for (const segmentName of includeSegments) {
      if (!segmentExists(segmentName)) {
        throw new Error(`Segment "${segmentName}" not found in the config for "${configKey}"`);
      }
    }
    return includeSegments;
  }

  if (excludeSegments?.length) {
    for (const segmentName of excludeSegments) {
      if (!segmentExists(segmentName)) {
        throw new Error(`Segment "${segmentName}" from excludeSegments not found in the config for "${configKey}"`);
      }
    }
    return segments
      .filter(({ segmentName }) => !excludeSegments.includes(segmentName))
      .map(({ segmentName }) => segmentName);
  }

  return segments.map(({ segmentName }) => segmentName);
};

interface GenerationResult {
  written: boolean;
  templateName: string;
  outAbsoluteDir: string;
  package: PackageJson;
  origin: string;
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
  const origins = _.uniq(results.map((result) => result.origin).filter((origin): origin is string => !!origin));
  const duration = Date.now() - startTime;
  const groupedByDir = _.groupBy(writtenResults, ({ outAbsoluteDir }) => outAbsoluteDir);
  const logOrDebug = forceNothingWrittenLog ? log.info : log.debug;

  if (writtenResults.length) {
    for (const [outAbsoluteDir, dirResults] of Object.entries(groupedByDir)) {
      const templateNames = _.uniq(dirResults.map(({ templateName }) => templateName));
      log.info(
        `${clientType} client${isEnsuringClient ? ' placeholder' : ''} is generated to ${chalkHighlightThing(normalizeOutTemplatePath(outAbsoluteDir, dirResults[0].package))} from template${templateNames.length !== 1 ? 's' : ''} ${chalkHighlightThing(
          templateNames.map((s) => `"${s}"`).join(', ')
        )}${origins.length && !isEnsuringClient ? ` with origin${origins.length !== 1 ? 's' : ''} ${chalkHighlightThing(origins.join(', '))}` : ''} in ${duration}ms`
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
  openapiFallback,
  openapiMixinName,
}: GenerateOptions): Record<string, NonNullable<VovkOpenAPIMixin>> => {
  return Object.fromEntries(
    (
      openapiSpec?.map((spec, i) => {
        return {
          source:
            spec.startsWith('http://') || spec.startsWith('https://')
              ? { url: spec, fallback: openapiFallback?.[i] }
              : { file: spec },
          apiRoot: openapiRootUrl?.[i] ?? '',
          getModuleName: openapiGetModuleName?.[i] ?? 'api',
          getMethodName: (openapiGetMethodName?.[i] as 'auto') ?? 'auto',
          mixinName: openapiMixinName?.[i] ?? `mixin${i > 0 ? i + 1 : ''}`,
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
  isBundle = false,
  projectInfo,
  forceNothingWrittenLog,
  fullSchema,
  locatedSegments,
  cliGenerateOptions,
}: {
  isEnsuringClient?: boolean;
  isBundle?: boolean;
  projectInfo: ProjectInfo;
  forceNothingWrittenLog?: boolean;
  fullSchema: VovkSchema;
  locatedSegments: Segment[];
  cliGenerateOptions?: GenerateOptions;
}) {
  fullSchema = {
    ...fullSchema,
    // sort segments by name to avoid unnecessary rendering
    segments: Object.fromEntries(
      Object.entries(fullSchema.segments)
        .sort(([a], [b]) => a.localeCompare(b))
        // preserve original object, so segments can be extended
        .map((segment) => ({ ...segment }))
    ),
  };
  const { config, cwd, log, srcRoot, vovkCliPackage, packageJson: projectPackageJson } = projectInfo;

  Object.entries(config.outputConfig.segments ?? {})
    .filter(([, segmentConfig]) => segmentConfig.openAPIMixin)
    .forEach(([segmentName, segmentConfig]) => {
      fullSchema.segments = {
        ...fullSchema.segments,
        // biome-ignore lint/style/noNonNullAssertion: TODO
        [segmentName]: openAPIToVovkSchema({ ...segmentConfig.openAPIMixin!, segmentName }).segments[segmentName],
      };
    });

  const cliMixins = cliOptionsToOpenAPIMixins(cliGenerateOptions ?? {});

  fullSchema.segments = {
    ...fullSchema.segments,
    ...Object.fromEntries(
      await Promise.all(
        Object.entries(cliMixins).map(async ([mixinName, mixinModule]) => {
          return [
            mixinName,
            openAPIToVovkSchema({
              segmentName: mixinName,
              ...(await normalizeOpenAPIMixin({ mixinModule, log })),
            }).segments[mixinName],
          ];
        })
      )
    ),
  };

  const { module, moduleResolution } = getTsconfig(cwd)?.config?.compilerOptions ?? {};
  // without moduleResolution TypeScript resolves like Node.js only for a node16+ module; no tsconfig at all is a Next.js default
  const isNodeNextResolution = /^node(16|18|20|next)$/i.test(moduleResolution ?? module ?? '');
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

        const {
          package: packageJson,
          readme,
          origin,
          samples,
          reExports,
          openAPIObject,
        } = vovkSchemaToOpenAPI({
          config: projectInfo.config,
          rootEntry: config.rootEntry,
          schema: fullSchema,
          outputConfigs: [config.composedClient.outputConfig ?? {}, templateDef.outputConfig ?? {}],
          forceOutputConfigs: [{ origin: cliGenerateOptions?.origin }],
          projectPackageJson,
          isBundle,
          segmentName: null,
        });

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
          prettifyClient: cliGenerateOptions?.prettify ?? config.composedClient.prettifyClient,
          segmentName: null,
          templateContent,
          matterResult,
          openAPIObject,
          package: packageJson,
          readme,
          samples,
          reExports,
          isEnsuringClient,
          outCwdRelativeDir,
          templateDef,
          locatedSegments,
          isNodeNextResolution,
          hasMixins,
          isVovkProject,
          vovkCliPackage,
          isBundle,
          origin,
          configKey: 'composedClient',
          cliSchemaPath: cliGenerateOptions?.schemaPath ?? null,
          projectConfig: config,
        });

        const outAbsoluteDir = path.resolve(cwd, outCwdRelativeDir);

        return {
          written,
          templateName,
          outAbsoluteDir,
          package: packageJson,
          origin,
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

        const results = await Promise.all(
          segmentNames.map(async (segmentName) => {
            const segmentedFullSchema = pickSegmentFullSchema(fullSchema, [segmentName]);
            const hasMixins = Object.values(segmentedFullSchema.segments).some(
              (segment) => segment.segmentType === 'mixin'
            );
            if (templateName === BuiltInTemplateName.mixins && !hasMixins) {
              return null;
            }

            const {
              package: resolvedPackageJson,
              readme,
              origin,
              samples,
              reExports,
              openAPIObject,
            } = vovkSchemaToOpenAPI({
              config: projectInfo.config,
              schema: fullSchema,
              rootEntry: config.rootEntry,
              segmentName,
              outputConfigs: [config.segmentedClient.outputConfig ?? {}, templateDef.outputConfig ?? {}],
              forceOutputConfigs: [{ origin: cliGenerateOptions?.origin }],
              isBundle,
              projectPackageJson,
            });
            // a name set in the segment's own config is used as is
            const packageJson = config.outputConfig.segments?.[segmentName]?.package?.name
              ? resolvedPackageJson
              : withSegmentPackageName(resolvedPackageJson, segmentName);

            const { written, content } = await writeOneClientFile({
              cwd,
              projectInfo,
              clientTemplateFile,
              fullSchema: segmentedFullSchema,
              prettifyClient: cliGenerateOptions?.prettify ?? config.segmentedClient.prettifyClient,
              segmentName,
              templateContent,
              matterResult,
              openAPIObject,
              package: packageJson,
              readme,
              samples,
              reExports,
              isEnsuringClient,
              outCwdRelativeDir,
              templateDef,
              locatedSegments,
              isNodeNextResolution,
              hasMixins,
              isVovkProject,
              vovkCliPackage,
              isBundle,
              origin,
              configKey: 'segmentedClient',
              cliSchemaPath: cliGenerateOptions?.schemaPath ?? null,
              projectConfig: config,
            });

            return {
              written,
              templateName,
              package: packageJson,
              origin,
              isStamped: hasGeneratedBanner(content),
            };
          })
        );
        const rendered = results.filter((result): result is NonNullable<typeof result> => !!result);

        return {
          written: rendered.some(({ written }) => written),
          templateName,
          outAbsoluteDir: path.resolve(cwd, outCwdRelativeDir),
          package: rendered[0]?.package || {},
          origin: rendered[0]?.origin || '',
          // what the file looks like inside a segment folder, the pruner tells generated files from user files by it
          relPath: path.join(clientTemplateFile.relativeDir, path.basename(templateFilePath).replace(/\.ejs$/, '')),
          isStamped: rendered.every(({ isStamped }) => isStamped),
        };
      })
    );

    // another configured output directory may sit inside a segmented one, it holds no segment
    const configuredOutDirs = [
      config.composedClient.outDir,
      config.segmentedClient.outDir,
      cliGenerateOptions?.composedOut,
      cliGenerateOptions?.segmentedOut,
      ...Object.values(config.clientTemplateDefs).flatMap((def) => [
        def.composedClient?.outDir,
        def.segmentedClient?.outDir,
      ]),
      config.bundle.outDir,
      config.bundle.prebundleOutDir,
    ].flatMap((dir) => (dir ? [path.resolve(cwd, dir)] : []));

    // once every segment is written, remove the folders of segments that are gone from each output directory
    for (const [outAbsoluteDir, dirResults] of Object.entries(
      _.groupBy(segmentedClientResults, ({ outAbsoluteDir }) => outAbsoluteDir)
    )) {
      const skippedDirs = await removeUnlistedDirectories(
        outAbsoluteDir,
        segmentNames.map((s) => s || ROOT_SEGMENT_FILE_NAME),
        dirResults.map(({ relPath }) => relPath),
        {
          unstampedRelPaths: dirResults.filter(({ isStamped }) => !isStamped).map(({ relPath }) => relPath),
          excludedDirs: configuredOutDirs.filter((dir) => dir !== outAbsoluteDir),
        }
      );

      for (const skippedDir of skippedDirs) {
        log.warn(
          `Directory ${chalkHighlightThing(skippedDir)} is not a known segment but holds files or folders the generator did not write, so it is left untouched.`
        );
      }
    }

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
