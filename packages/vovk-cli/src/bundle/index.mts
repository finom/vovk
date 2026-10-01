import fs from 'node:fs/promises';
import path from 'node:path';
import groupBy from 'lodash/groupBy.js';
import type { VovkSchema } from 'vovk';
import { generate } from '../generate/generate.mjs';
import { getClientTemplateFiles } from '../generate/get-client-template-files.mjs';
import { BuiltInTemplateName } from '../get-project-info/get-config/get-template-defs.mjs';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import type { BundleOptions, GenerateOptions } from '../types.mjs';
import { chalkHighlightThing } from '../utils/chalk-highlight-thing.mjs';
import { locateSegments } from '../utils/locate-segments.mjs';
import { getDirectoryOrigin } from '../utils/remove-unlisted-directories.mjs';

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
  const entry = path.join(prebundleOutDirAbsolute, 'index.ts');
  const outDir = cliBundleOptions?.outDir ?? bundleConfig.outDir;

  if (!outDir) {
    throw new Error('No output directory specified for bundling');
  }

  await assertPrebundleDir({ projectInfo, prebundleOutDir, outDir });

  // CLI options win as a pair so config exclude cannot conflict with CLI include
  const [includeSegments, excludeSegments] =
    cliBundleOptions.includeSegments?.length || cliBundleOptions.excludeSegments?.length
      ? [cliBundleOptions.includeSegments, cliBundleOptions.excludeSegments]
      : [bundleConfig.includeSegments, bundleConfig.excludeSegments];

  if (includeSegments?.length && excludeSegments?.length) {
    throw new Error('Both includeSegments and excludeSegments are set for the bundle. Please use only one of them.');
  }

  const outDirAbsolute = path.resolve(cwd, outDir);

  // README.md and package.json describe the bundled code, so they are generated from the same segments and mixins
  const generateOptions = {
    schemaPath: cliBundleOptions?.schemaPath,
    origin: cliBundleOptions?.origin,
    openapiSpec: cliBundleOptions?.openapiSpec,
    openapiGetModuleName: cliBundleOptions?.openapiGetModuleName,
    openapiGetMethodName: cliBundleOptions?.openapiGetMethodName,
    openapiRootUrl: cliBundleOptions?.openapiRootUrl,
    openapiMixinName: cliBundleOptions?.openapiMixinName,
    openapiFallback: cliBundleOptions?.openapiFallback,
    composedOnly: true,
    composedIncludeSegments: includeSegments,
    composedExcludeSegments: excludeSegments,
  } satisfies GenerateOptions;

  try {
    await generate({
      isEnsuringClient: false,
      isBundle: true,
      projectInfo,
      forceNothingWrittenLog: true,
      fullSchema,
      locatedSegments,
      cliGenerateOptions: {
        ...generateOptions,
        composedFrom: [BuiltInTemplateName.tsBase],
        composedOut: prebundleOutDirAbsolute,
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
          ...generateOptions,
          composedFrom: group.map(([templateName]) => templateName),
          composedOut: path.resolve(outDirAbsolute, relativePath),
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

// the prebundle directory is generated into and then removed recursively, so it must hold nothing else
async function assertPrebundleDir({
  projectInfo: { cwd, config, log },
  prebundleOutDir,
  outDir,
}: {
  projectInfo: ProjectInfo;
  prebundleOutDir: string;
  outDir: string;
}) {
  const prebundleOutDirAbsolute = path.resolve(cwd, prebundleOutDir);
  const outDirAbsolute = path.resolve(cwd, outDir);
  const invalid = (reason: string) =>
    new Error(
      `Invalid prebundle output directory ${JSON.stringify(prebundleOutDir)}. It is deleted after bundling, so ${reason}.`
    );
  // a directory counts as inside itself
  const isInside = (dir: string, parent: string) => {
    const relative = path.relative(parent, dir);
    return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
  };

  if (prebundleOutDirAbsolute === cwd || !isInside(prebundleOutDirAbsolute, cwd)) {
    throw invalid('it must be a subdirectory of the project, such as "tmp_prebundle"');
  }

  if (isInside(prebundleOutDirAbsolute, outDirAbsolute) || isInside(outDirAbsolute, prebundleOutDirAbsolute)) {
    throw invalid(`it must stay apart from the bundle output directory ${JSON.stringify(outDir)}`);
  }

  const stats = await fs.stat(prebundleOutDirAbsolute).catch(() => null);
  if (!stats) return;
  if (!stats.isDirectory()) throw invalid('it must be a directory');

  // a directory kept by an earlier bundle holds only what the prebundle template writes
  const { templateFiles } = await getClientTemplateFiles({
    config,
    cwd,
    log,
    configKey: 'composedClient',
    cliGenerateOptions: { composedFrom: [BuiltInTemplateName.tsBase], composedOut: prebundleOutDirAbsolute },
  });
  const generatedRelPaths = templateFiles.map(({ outCwdRelativeDir, relativeDir, templateFilePath }) =>
    path.relative(
      prebundleOutDirAbsolute,
      path.resolve(cwd, outCwdRelativeDir, relativeDir, path.basename(templateFilePath).replace(/\.ejs$/, ''))
    )
  );

  if ((await getDirectoryOrigin(prebundleOutDirAbsolute, generatedRelPaths)) === 'foreign') {
    throw invalid('it must be new, empty or kept by an earlier bundle, but it holds files the bundle did not write');
  }
}
