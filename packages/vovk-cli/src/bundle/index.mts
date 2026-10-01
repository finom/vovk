import fs from 'node:fs/promises';
import path from 'node:path';
import groupBy from 'lodash/groupBy.js';
import type { VovkSchema } from 'vovk';
import { generate } from '../generate/generate.mjs';
import { BuiltInTemplateName } from '../get-project-info/get-config/get-template-defs.mjs';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import type { BundleOptions } from '../types.mjs';
import { chalkHighlightThing } from '../utils/chalk-highlight-thing.mjs';
import { locateSegments } from '../utils/locate-segments.mjs';

export async function bundle({
  projectInfo,
  fullSchema,
  cliBundleOptions,
}: {
  projectInfo: ProjectInfo;
  fullSchema: VovkSchema;
  cliBundleOptions: BundleOptions;
}) {
  const { config, log, cwd, apiDirAbsolutePath } = projectInfo;
  const locatedSegments = await locateSegments({ dir: apiDirAbsolutePath, config, log });
  const { bundle: bundleConfig } = config;

  if ((bundleConfig.build as { isMissingBuild?: boolean }).isMissingBuild) {
    throw new Error('No bundle.build function specified in the config. See https://vovk.dev/bundle for details.');
  }

  const keepPrebundleDir = cliBundleOptions?.keepPrebundleDir ?? bundleConfig?.keepPrebundleDir ?? false;
  const prebundleOutDir = cliBundleOptions?.prebundleOutDir ?? bundleConfig.prebundleOutDir;
  const prebundleOutDirAbsolute = path.resolve(cwd, prebundleOutDir);

  // this directory gets removed recursively, so it must be a directory of our own inside the project
  const relativeToCwd = path.relative(cwd, prebundleOutDirAbsolute);
  const escapesCwd = relativeToCwd === '..' || relativeToCwd.startsWith(`..${path.sep}`);
  if (!relativeToCwd || escapesCwd || path.isAbsolute(relativeToCwd)) {
    throw new Error(
      `Invalid prebundle output directory ${JSON.stringify(prebundleOutDir)}. It is deleted after bundling, so it must be a subdirectory of the project, such as "tmp_prebundle".`
    );
  }
  const entry = path.join(prebundleOutDirAbsolute, 'index.ts');
  const outDir = cliBundleOptions?.outDir ?? bundleConfig.outDir;

  if (!outDir) {
    throw new Error('No output directory specified for bundling');
  }

  // CLI options win as a pair so config exclude cannot conflict with CLI include
  const [includeSegments, excludeSegments] =
    cliBundleOptions.includeSegments?.length || cliBundleOptions.excludeSegments?.length
      ? [cliBundleOptions.includeSegments, cliBundleOptions.excludeSegments]
      : [bundleConfig.includeSegments, bundleConfig.excludeSegments];

  if (includeSegments?.length && excludeSegments?.length) {
    throw new Error('Both includeSegments and excludeSegments are set for the bundle. Please use only one of them.');
  }

  const outDirAbsolute = path.resolve(cwd, outDir);

  try {
    await generate({
      isEnsuringClient: false,
      isBundle: true,
      projectInfo,
      forceNothingWrittenLog: true,
      fullSchema,
      locatedSegments,
      cliGenerateOptions: {
        schemaPath: cliBundleOptions?.schemaPath,
        origin: cliBundleOptions?.origin,
        openapiSpec: cliBundleOptions?.openapiSpec,
        openapiGetModuleName: cliBundleOptions?.openapiGetModuleName,
        openapiGetMethodName: cliBundleOptions?.openapiGetMethodName,
        openapiRootUrl: cliBundleOptions?.openapiRootUrl,
        openapiMixinName: cliBundleOptions?.openapiMixinName,
        openapiFallback: cliBundleOptions?.openapiFallback,
        composedFrom: [BuiltInTemplateName.tsBase],
        composedOut: prebundleOutDirAbsolute,
        composedOnly: true,
        composedIncludeSegments: includeSegments,
        composedExcludeSegments: excludeSegments,
      },
    });

    log.debug(`Bundling ${chalkHighlightThing(entry)} to ${chalkHighlightThing(outDirAbsolute)}`);

    await bundleConfig.build({
      outDir: outDirAbsolute,
      prebundleDir: prebundleOutDirAbsolute,
      entry,
    });

    log.debug(`Bundled index.ts to ${chalkHighlightThing(outDirAbsolute)}`);

    const requiresGroup = groupBy(Object.entries(bundleConfig.requires), ([, relativePath]) => relativePath);

    for (const [relativePath, group] of Object.entries(requiresGroup)) {
      await generate({
        isEnsuringClient: false,
        isBundle: true,
        projectInfo,
        forceNothingWrittenLog: true,
        fullSchema,
        locatedSegments,
        cliGenerateOptions: {
          schemaPath: cliBundleOptions?.schemaPath,
          origin: cliBundleOptions?.origin,
          composedFrom: group.map(([templateName]) => templateName),
          composedOut: path.resolve(outDirAbsolute, relativePath),
          composedOnly: true,
        },
      });
    }
  } finally {
    // clean up the prebundle dir even when generation or build fails
    if (!keepPrebundleDir) {
      await fs.rm(prebundleOutDirAbsolute, { recursive: true, force: true });
      log.debug(
        `Deleted temporary TypeScript client output directory: ${chalkHighlightThing(prebundleOutDirAbsolute)}`
      );
    } else {
      log.debug(
        `Temporary TypeScript client output directory not deleted because it is marked to keep: ${chalkHighlightThing(prebundleOutDirAbsolute)}`
      );
    }
  }

  log.info(`Bundled TypeScript client to ${chalkHighlightThing(outDirAbsolute)}`);
}
