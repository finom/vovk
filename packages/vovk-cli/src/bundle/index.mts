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
import type { PackageJson } from 'type-fest';

export async function bundle({
  projectInfo,
  fullSchema,
  cliBundleOptions,
  vovkCliPackage,
}: {
  projectInfo: ProjectInfo;
  fullSchema: VovkSchema;
  cliBundleOptions: BundleOptions;
  vovkCliPackage: PackageJson;
}) {
  const { config, log, cwd, apiDirAbsolutePath } = projectInfo;
  const locatedSegments = await locateSegments({ dir: apiDirAbsolutePath, config, log });
  const { bundle: bundleConfig } = config;
  const tsFullClientOutAbsoluteDirInput = path.join(cwd, bundleConfig.tsClientOutDir);

  const tsClientOutDir = cliBundleOptions?.tsClientOutDir ?? bundleConfig.tsClientOutDir;
  const dontDeleteTsClientOutDirAfter =
    cliBundleOptions?.dontDeleteTsClientOutDirAfter ?? bundleConfig?.dontDeleteTsClientOutDirAfter ?? false;
  const sourcemap = cliBundleOptions?.sourcemap ?? bundleConfig?.sourcemap;

  if (!tsClientOutDir) {
    throw new Error('No output directory specified for composed client');
  }

  const outDir = cliBundleOptions?.outDir ?? bundleConfig.outDir;

  if (!outDir) {
    throw new Error('No output directory specified for bundling');
  }

  await generate({
    isEnsuringClient: false,
    projectInfo,
    forceNothingWrittenLog: true,
    fullSchema,
    locatedSegments,
    package: bundleConfig.package,
    readme: bundleConfig.readme,
    cliGenerateOptions: {
      openapiSpec: cliBundleOptions?.openapiSpec,
      openapiGetModuleName: cliBundleOptions?.openapiGetModuleName,
      openapiGetMethodName: cliBundleOptions?.openapiGetMethodName,
      openapiRootUrl: cliBundleOptions?.openapiRootUrl,
      composedFrom: [BuiltInTemplateName.ts],
      composedOut: tsClientOutDir,
      composedOnly: true,
      composedIncludeSegments: cliBundleOptions.includeSegments ?? bundleConfig.includeSegments,
      composedExcludeSegments: cliBundleOptions.excludeSegments ?? bundleConfig.excludeSegments,
      forceTsStandalone: cliBundleOptions.forceTsStandalone,
    },
    vovkCliPackage,
  });

  await build({
    entry: path.join(tsFullClientOutAbsoluteDirInput, './index.ts'),
    dts: true,
    format: ['cjs', 'esm'],
    fixedExtension: true,
    outDir,
    sourcemap: bundleConfig.sourcemap,
  });

  const outDirAbsolute = path.resolve(cwd, outDir);

  log.debug(`Bundled index.ts to ${chalkHighlightThing(outDirAbsolute)}`);

  await build({
    entry: path.join(tsFullClientOutAbsoluteDirInput, './schema.ts'),
    dts: true,
    format: ['cjs'],
    fixedExtension: true,
    outDir,
    clean: false,
    sourcemap,
  });

  log.debug(`Bundled schema.ts to ${chalkHighlightThing(outDirAbsolute)}`);

  const requiresGroup = groupBy(Object.entries(bundleConfig.requires), ([, relativePath]) => relativePath);

  for (const [relativePath, group] of Object.entries(requiresGroup)) {
    await generate({
      isEnsuringClient: false,
      projectInfo,
      forceNothingWrittenLog: true,
      fullSchema,
      locatedSegments,
      package: bundleConfig.package,
      readme: bundleConfig.readme,
      cliGenerateOptions: {
        composedFrom: group.map(([templateName]) => templateName),
        composedOut: path.resolve(outDir, relativePath),
        composedOnly: true,
      },
      vovkCliPackage,
    });
  }

  if (!dontDeleteTsClientOutDirAfter) {
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
