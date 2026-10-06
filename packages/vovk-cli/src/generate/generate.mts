import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import _ from 'lodash';
import type { PackageJson } from 'type-fest';
import type { VovkSchema } from 'vovk';
import {
  openAPIToVovkSchema,
  toIdentifier,
  type VovkOpenAPIMixin,
  type VovkStrictConfig,
  vovkSchemaToOpenAPI,
} from 'vovk/internal';
import { ROOT_SEGMENT_FILE_NAME } from '../dev/write-one-segment-schema-file.mjs';
import { BuiltInTemplateName } from '../get-project-info/get-config/get-template-defs.mjs';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import type { GenerateOptions } from '../types.mjs';
import { chalkHighlightThing } from '../utils/chalk-highlight-thing.mjs';
import { hasGeneratedBanner } from '../utils/generated-banner.mjs';
import { getTsImportOptions } from '../utils/get-ts-import-options.mjs';
import type { Segment } from '../utils/locate-segments.mjs';
import { normalizeOpenAPIMixin } from '../utils/normalize-openapi-mixin.mjs';
import { pickSegmentFullSchema } from '../utils/pick-segment-full-schema.mjs';
import { removeUnlistedDirectories } from '../utils/remove-unlisted-directories.mjs';
import { type ClientTemplateFile, getClientTemplateFiles } from './get-client-template-files.mjs';
import { validateComposedModuleNames, validateMixinModuleNames, validateMixinNames } from './validate-client-names.mjs';
import {
  type ClientFile,
  getOutputConfigs,
  normalizeOutTemplatePath,
  renderOneClientFile,
  withSegmentPackageName,
  writeClientFiles,
} from './write-one-client-file.mjs';

const getIncludedSegmentNames = (
  config: VovkStrictConfig,
  fullSchema: VovkSchema,
  configKey: 'segmentedClient' | 'composedClient',
  cliGenerateOptions: GenerateOptions | undefined,
  { templateName, templateDef }: Pick<ClientTemplateFile, 'templateName' | 'templateDef'>,
  mixinNames: string[]
) => {
  // a configured mixin counts before its spec is loaded, vovk dev starts without it
  const segmentNames = _.uniq([
    ...Object.values(fullSchema.segments).map(({ segmentName }) => segmentName),
    ...mixinNames,
  ]);
  const cliIncludeSegments =
    cliGenerateOptions?.[configKey === 'segmentedClient' ? 'segmentedIncludeSegments' : 'composedIncludeSegments'];
  const cliExcludeSegments =
    cliGenerateOptions?.[configKey === 'segmentedClient' ? 'segmentedExcludeSegments' : 'composedExcludeSegments'];
  const templateOptions = templateDef[configKey];
  // a pair wins as a whole so one source's exclude cannot conflict with another's include:
  // CLI options first, then the template's own, then the root config
  const [{ includeSegments, excludeSegments }, where] =
    cliIncludeSegments?.length || cliExcludeSegments?.length
      ? [{ includeSegments: cliIncludeSegments, excludeSegments: cliExcludeSegments }, 'as CLI options']
      : templateOptions?.includeSegments?.length || templateOptions?.excludeSegments?.length
        ? [templateOptions, `in "${configKey}" of template "${templateName}"`]
        : [config[configKey], `in "${configKey}" config`];
  if (includeSegments?.length && excludeSegments?.length) {
    throw new Error(`Both includeSegments and excludeSegments are set ${where}. Please use only one of them.`);
  }
  const segmentExists = (segmentName: string) => segmentNames.includes(segmentName);

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
    return segmentNames.filter((segmentName) => !excludeSegments.includes(segmentName));
  }

  return segmentNames;
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

// a module is named after its mixin; mixins named by default, mixin and mixin2, give api and api2
const toDefaultModuleName = (mixinName: string | undefined, i: number) =>
  mixinName === undefined
    ? `api${i > 0 ? i + 1 : ''}`
    : /^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(mixinName)
      ? mixinName
      : toIdentifier(mixinName);

const cliOptionsToOpenAPIMixins = ({
  openapiGetMethodName,
  openapiGetModuleName,
  openapiRootUrl,
  openapiSpec,
  openapiFallback,
  openapiMixinName,
}: GenerateOptions): [string, NonNullable<VovkOpenAPIMixin>][] =>
  (openapiSpec ?? []).map((spec, i) => {
    const mixinName = openapiMixinName?.[i] ?? `mixin${i > 0 ? i + 1 : ''}`;
    return [
      mixinName,
      {
        source:
          spec.startsWith('http://') || spec.startsWith('https://')
            ? { url: spec, fallback: openapiFallback?.[i] }
            : { file: spec },
        apiRoot: openapiRootUrl?.[i] ?? '',
        getModuleName: openapiGetModuleName?.[i] ?? toDefaultModuleName(openapiMixinName?.[i], i),
        getMethodName: (openapiGetMethodName?.[i] as 'auto') ?? 'auto',
        mixinName,
      },
    ];
  });

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

  const configMixins = Object.entries(config.outputConfig.segments ?? {}).filter(
    ([, segmentConfig]) => segmentConfig.openAPIMixin
  );
  const cliMixins = cliOptionsToOpenAPIMixins(cliGenerateOptions ?? {});
  validateMixinNames(
    Object.keys(fullSchema.segments),
    [...configMixins, ...cliMixins].map(([mixinName]) => mixinName)
  );

  configMixins.forEach(([segmentName, segmentConfig]) => {
    fullSchema.segments = {
      ...fullSchema.segments,
      // biome-ignore lint/style/noNonNullAssertion: TODO
      [segmentName]: openAPIToVovkSchema({ ...segmentConfig.openAPIMixin!, segmentName }).segments[segmentName],
    };
  });

  fullSchema.segments = {
    ...fullSchema.segments,
    ...Object.fromEntries(
      await Promise.all(
        cliMixins.map(async ([mixinName, mixinModule]) => {
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
  for (const [mixinName] of [...configMixins, ...cliMixins]) {
    validateMixinModuleNames(mixinName, fullSchema.segments[mixinName]);
  }

  const { module, isNodeNextResolution, tsExtension } = getTsImportOptions(cwd);
  const mixinNames = Object.keys(projectInfo.openAPIMixins ?? {});
  // a mixin whose spec isn't loaded yet keeps its client, but gets no new one
  const isRendered = (segmentName: string) => Object.hasOwn(fullSchema.segments, segmentName);
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

  // nothing is written until every client is rendered, so a refused file leaves all of them as they were
  const clientFiles: ClientFile[] = [];
  // pruning and logging follow the writes
  const afterWrite: (() => Promise<void>)[] = [];

  if (isComposedEnabled) {
    const now = Date.now();
    const { templateFiles: composedClientTemplateFiles, fromTemplates } = await getClientTemplateFiles({
      config,
      cwd,
      log,
      cliGenerateOptions,
      configKey: 'composedClient',
    });
    const segmentNamesOf = new Map(
      composedClientTemplateFiles.map((file) => [
        file,
        getIncludedSegmentNames(config, fullSchema, 'composedClient', cliGenerateOptions, file, mixinNames),
      ])
    );
    for (const segmentNames of _.uniqBy([...segmentNamesOf.values()], (names) => names.join('\0'))) {
      validateComposedModuleNames(fullSchema, segmentNames);
    }

    const composedClientResults = await Promise.all(
      composedClientTemplateFiles.map(async (clientTemplateFile) => {
        const { templateFilePath, templateName, templateDef, outCwdRelativeDir } = clientTemplateFile;
        const segmentNames = segmentNamesOf.get(clientTemplateFile) ?? [];
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
          outputConfigs: getOutputConfigs(config, templateDef, 'composedClient'),
          forceOutputConfigs: [{ origin: cliGenerateOptions?.origin }],
          projectPackageJson,
          isBundle,
          segmentName: null,
        });

        const composedFullSchema = pickSegmentFullSchema(fullSchema, segmentNames.filter(isRendered));
        const hasMixins = Object.values(composedFullSchema.segments).some((segment) => segment.segmentType === 'mixin');
        if (templateName === BuiltInTemplateName.mixins && !hasMixins) {
          return null;
        }

        const clientFile = await renderOneClientFile({
          cwd,
          projectInfo,
          clientTemplateFile,
          fullSchema: composedFullSchema,
          prettifyClient:
            cliGenerateOptions?.prettify ??
            templateDef.composedClient?.prettifyClient ??
            config.composedClient.prettifyClient,
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
          tsExtension,
          tsModule: module,
          hasMixins,
          isVovkProject,
          vovkCliPackage,
          isBundle,
          origin,
          configKey: 'composedClient',
          cliSchemaPath: cliGenerateOptions?.schemaPath ?? null,
          projectConfig: config,
        });

        clientFiles.push(clientFile);

        return {
          written: clientFile.needsWriting,
          templateName,
          outAbsoluteDir: path.resolve(cwd, outCwdRelativeDir),
          package: packageJson,
          origin,
        };
      })
    );

    if (composedClientTemplateFiles.length) {
      afterWrite.push(async () =>
        logClientGenerationResults({
          results: composedClientResults.filter((result): result is GenerationResult => !!result),
          log,
          isEnsuringClient,
          forceNothingWrittenLog,
          clientType: 'Composed',
          startTime: now,
          fromTemplates,
        })
      );
    } else {
      log.warn('No composed client template files found. Skipping composed client generation.');
    }
  }

  if (isSegmentedEnabled) {
    const now = Date.now();
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
        const segmentNames = getIncludedSegmentNames(
          config,
          fullSchema,
          'segmentedClient',
          cliGenerateOptions,
          clientTemplateFile,
          mixinNames
        );
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
          segmentNames.filter(isRendered).map(async (segmentName) => {
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
              outputConfigs: getOutputConfigs(config, templateDef, 'segmentedClient'),
              forceOutputConfigs: [{ origin: cliGenerateOptions?.origin }],
              isBundle,
              projectPackageJson,
            });
            const packageJson = withSegmentPackageName(
              resolvedPackageJson,
              segmentName,
              config.outputConfig.segments?.[segmentName]?.package
            );

            const clientFile = await renderOneClientFile({
              cwd,
              projectInfo,
              clientTemplateFile,
              fullSchema: segmentedFullSchema,
              prettifyClient:
                cliGenerateOptions?.prettify ??
                templateDef.segmentedClient?.prettifyClient ??
                config.segmentedClient.prettifyClient,
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
              tsExtension,
              tsModule: module,
              hasMixins,
              isVovkProject,
              vovkCliPackage,
              isBundle,
              origin,
              configKey: 'segmentedClient',
              cliSchemaPath: cliGenerateOptions?.schemaPath ?? null,
              projectConfig: config,
            });

            clientFiles.push(clientFile);

            return {
              written: clientFile.needsWriting,
              templateName,
              package: packageJson,
              origin,
              isStamped: hasGeneratedBanner(clientFile.content),
            };
          })
        );
        const rendered = results.filter((result): result is NonNullable<typeof result> => !!result);

        return {
          written: rendered.some(({ written }) => written),
          templateName,
          segmentNames,
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
    afterWrite.push(async () => {
      for (const [outAbsoluteDir, dirResults] of Object.entries(
        _.groupBy(segmentedClientResults, ({ outAbsoluteDir }) => outAbsoluteDir)
      )) {
        const skippedDirs = await removeUnlistedDirectories(
          outAbsoluteDir,
          _.uniq(dirResults.flatMap(({ segmentNames }) => segmentNames)).map((s) => s || ROOT_SEGMENT_FILE_NAME),
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
      }
    });

    if (!segmentedClientTemplateFiles.length) {
      log.warn('No segmented client template files found. Skipping segmented client generation.');
    }
  }

  await writeClientFiles(clientFiles, { cwd, log, force: cliGenerateOptions?.force });
  for (const step of afterWrite) await step();
}
