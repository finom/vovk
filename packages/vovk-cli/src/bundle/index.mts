import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkFullSchema } from 'vovk';
import { build } from 'tsdown';
import groupBy from 'lodash/groupBy.js';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import generate from '../generate/index.mjs';
import { BuiltInTemplateName } from '../getProjectInfo/getConfig/getTemplateDefs.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';

export default async function bundle({
  projectInfo,
  fullSchema,
}: {
  projectInfo: ProjectInfo;
  fullSchema: VovkFullSchema;
}) {
  const { config, log } = projectInfo;
  const { bundle: bundleConfig } = config;
  const cwd = process.cwd();
  const tsFullClientOutAbsoluteDirInput = path.join(cwd, bundleConfig.tsClientOutDir);
  await generate({
    isEnsuringClient: false,
    projectInfo,
    forceNothingWrittenLog: true,
    fullSchema,
    cliGenerateOptions: {
      fullFrom: [BuiltInTemplateName.ts],
      fullOut: bundleConfig.tsClientOutDir,
    },
  });

  const outDir = bundleConfig.outDir;

  if (!outDir) {
    throw new Error('No output directory specified for bundling');
  }

  await build({
    entry: path.join(tsFullClientOutAbsoluteDirInput, './index.ts'),
    dts: true,
    format: ['cjs', 'esm'],
    fixedExtension: true,
    outDir,
    sourcemap: bundleConfig.sourcemap,
  });

  const outDirAbsolute = path.resolve(cwd, outDir);

  log.info(`Bundled index.ts to ${chalkHighlightThing(outDirAbsolute)}`);

  await build({
    entry: path.join(tsFullClientOutAbsoluteDirInput, './fullSchema.ts'),
    dts: true,
    format: ['cjs'],
    fixedExtension: true,
    outDir,
    clean: false,
    sourcemap: bundleConfig.sourcemap,
  });

  log.info(`Bundled fullSchema.ts to ${chalkHighlightThing(outDirAbsolute)}`);

  const requiresGroup = groupBy(Object.entries(bundleConfig.requires), ([, relativePath]) => relativePath);

  for (const [relativePath, group] of Object.entries(requiresGroup)) {
    await generate({
      isEnsuringClient: false,
      projectInfo,
      forceNothingWrittenLog: true,
      fullSchema,
      cliGenerateOptions: {
        fullFrom: group.map(([templateName]) => templateName),
        fullOut: path.resolve(outDir, relativePath),
      },
    });
  }

  if (!bundleConfig.dontDeleteTsClientOutDirAfter) {
    await fs.rm(tsFullClientOutAbsoluteDirInput, { recursive: true, force: true });
    log.debug(
      `Deleted temporary TypeScript client output directory: ${chalkHighlightThing(tsFullClientOutAbsoluteDirInput)}`
    );
  } else {
    log.debug(
      `Temporary TypeScript client output directory not deleted: ${chalkHighlightThing(tsFullClientOutAbsoluteDirInput)}`
    );
  }

  log.info(`Bundled TypeScript client to ${outDirAbsolute}`);
}
