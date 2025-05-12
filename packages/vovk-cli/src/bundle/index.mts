import path from 'node:path';
import type { VovkFullSchema } from 'vovk';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import generate from '../generate/index.mjs';
import type { BundleOptions } from '../types.mjs';
import { BuiltInTemplateName } from '../getProjectInfo/getConfig/getTemplateDefs.mjs';
import { rollupBundle } from './rollupBundle.mjs';

export default async function bundle({
  projectInfo,
  fullSchema,
  cliBundleOptions,
}: {
  projectInfo: ProjectInfo;
  fullSchema: VovkFullSchema;
  cliBundleOptions?: BundleOptions;
}) {
  const cwd = process.cwd();
  const tsFullClientOutAbsoluteDirInput = path.join(cwd, projectInfo.config.bundle.tsClientOutDir);
  await generate({
    isEnsuringClient: false,
    projectInfo,
    forceNothingWrittenLog: true,
    fullSchema,
    cliGenerateOptions: {
      fullClientFrom: [BuiltInTemplateName.ts],
      fullClientOut: projectInfo.config.bundle.tsClientOutDir,
    },
  });

  const outDir = cliBundleOptions?.outDir ?? projectInfo.config.bundle.outDir;

  if (!outDir) {
    throw new Error('No output directory specified for bundling');
  }

  await rollupBundle({
    tsFullClientOutAbsoluteDirInput,
    outDir,
    cwd,
  });
}
