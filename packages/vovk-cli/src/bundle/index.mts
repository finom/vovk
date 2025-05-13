import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkFullSchema } from 'vovk';
import { build } from 'tsdown';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import generate from '../generate/index.mjs';
import { BuiltInTemplateName } from '../getProjectInfo/getConfig/getTemplateDefs.mjs';
import type { GenerateOptions } from '../types.mjs';
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

  log.debug(`Bundled TypeScript client to ${chalkHighlightThing(outDir)}`);

  await build({
    entry: path.join(tsFullClientOutAbsoluteDirInput, './fullSchema.ts'),
    dts: true,
    format: ['cjs'],
    fixedExtension: true,
    outDir,
    clean: false,
    sourcemap: bundleConfig.sourcemap,
  });

  log.debug(`Bundled fullSchema.ts to ${chalkHighlightThing(outDir)}`);

  const fullFrom: GenerateOptions['fullFrom'] = [];

  if (!bundleConfig.noReadme) {
    fullFrom.push(BuiltInTemplateName.readme);
  }
  if (!bundleConfig.noPackage) {
    fullFrom.push(BuiltInTemplateName.packageJson);
  }
  if (fullFrom.length) {
    await generate({
      isEnsuringClient: false,
      projectInfo,
      forceNothingWrittenLog: true,
      fullSchema,
      cliGenerateOptions: {
        fullFrom,
        fullOut: outDir,
      },
    });
  } else {
    log.debug('No README or package.json generated');
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

  log.info(`Bundled TypeScript client to ${outDir}`);
}
