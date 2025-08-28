import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkSchema } from 'vovk';
import { build } from 'tsdown';
import groupBy from 'lodash/groupBy.js';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import { generate } from '../generate/generate.mjs';
import { BuiltInTemplateName } from '../getProjectInfo/getConfig/getTemplateDefs.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
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
  const tsFullClientOutAbsoluteDirInput = path.join(cwd, bundleConfig.prebundleOutDir);

  const prebundleOutDir = cliBundleOptions?.prebundleOutDir ?? bundleConfig.prebundleOutDir;
  const keepPrebundleDir = cliBundleOptions?.keepPrebundleDir ?? bundleConfig?.keepPrebundleDir ?? false;

  if (!prebundleOutDir) {
    throw new Error('No output directory specified for composed client');
  }

  const outDir = cliBundleOptions?.outDir ?? bundleConfig.tsdownBuildOptions.outDir;
  const tsconfig = cliBundleOptions?.tsconfig ?? bundleConfig.tsdownBuildOptions.tsconfig;

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
      composedFrom: [BuiltInTemplateName.ts],
      composedOut: prebundleOutDir,
      composedOnly: true,
      composedIncludeSegments: cliBundleOptions.includeSegments ?? bundleConfig.includeSegments,
      composedExcludeSegments: cliBundleOptions.excludeSegments ?? bundleConfig.excludeSegments,
    },
  });

  await build({
    entry: path.join(tsFullClientOutAbsoluteDirInput, './index.ts'),
    dts: true,
    format: ['cjs', 'esm'],
    fixedExtension: true,
    clean: true,
    ...bundleConfig.tsdownBuildOptions,
    outDir: outDirAbsolute,
    tsconfig,
  });

  log.debug(`Bundled index.ts to ${chalkHighlightThing(outDirAbsolute)}`);

  await build({
    entry: path.join(tsFullClientOutAbsoluteDirInput, './schema.ts'),
    dts: true,
    format: ['cjs'],
    fixedExtension: true,
    outDir: outDirAbsolute,
    clean: false,
    tsconfig,
  });

  log.debug(`Bundled schema.ts to ${chalkHighlightThing(outDirAbsolute)}`);

  await build({
    entry: path.join(tsFullClientOutAbsoluteDirInput, './openapi.ts'),
    dts: true,
    format: ['cjs'],
    fixedExtension: true,
    outDir: outDirAbsolute,
    clean: false,
    tsconfig,
  });

  log.debug(`Bundled openapi.ts to ${chalkHighlightThing(outDirAbsolute)}`);

  const requiresGroup = groupBy(Object.entries(bundleConfig.requires), ([, relativePath]) => relativePath);

  for (const [relativePath, group] of Object.entries(requiresGroup)) {
    await generate({
      isEnsuringClient: false,
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
    await fs.rm(tsFullClientOutAbsoluteDirInput, { recursive: true, force: true });
    log.debug(
      `Deleted temporary TypeScript client output directory: ${chalkHighlightThing(tsFullClientOutAbsoluteDirInput)}`
    );
  } else {
    log.debug(
      `Temporary TypeScript client output directory not deleted: ${chalkHighlightThing(tsFullClientOutAbsoluteDirInput)}`
    );
  }

  log.info(`Bundled TypeScript client to ${chalkHighlightThing(outDirAbsolute)}`);
}
