import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkSchema } from 'vovk';
import groupBy from 'lodash/groupBy.js';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import { generate } from '../generate/generate.mjs';
import { BuiltInTemplateName } from '../getProjectInfo/getConfig/getTemplateDefs.mjs';
import { chalkHighlightThing } from '../utils/chalkHighlightThing.mjs';
import type { BundleOptions } from '../types.mjs';
import { locateSegments } from '../locateSegments.mjs';

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

  const keepPrebundleDir = cliBundleOptions?.keepPrebundleDir ?? bundleConfig?.keepPrebundleDir ?? false;
  const prebundleOutDirAbsolute = path.resolve(cwd, cliBundleOptions?.prebundleOutDir ?? bundleConfig.prebundleOutDir);
  const entry = path.join(prebundleOutDirAbsolute, 'index.ts');
  const outDir = cliBundleOptions?.outDir ?? bundleConfig.outDir;

  if (!outDir) {
    throw new Error('No output directory specified for bundling');
  }

  const outDirAbsolute = path.resolve(cwd, outDir);

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
      composedIncludeSegments: cliBundleOptions.includeSegments ?? bundleConfig.includeSegments,
      composedExcludeSegments: cliBundleOptions.excludeSegments ?? bundleConfig.excludeSegments,
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

  if (!keepPrebundleDir) {
    await fs.rm(prebundleOutDirAbsolute, { recursive: true, force: true });
    log.debug(`Deleted temporary TypeScript client output directory: ${chalkHighlightThing(prebundleOutDirAbsolute)}`);
  } else {
    log.debug(
      `Temporary TypeScript client output directory not deleted because it is marked to keep: ${chalkHighlightThing(prebundleOutDirAbsolute)}`
    );
  }

  log.info(`Bundled TypeScript client to ${chalkHighlightThing(outDirAbsolute)}`);
}
