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
  const tsFullClientOutDirInput = cliBundleOptions?.tsClientOutDir
    ? path.resolve(cwd, cliBundleOptions.tsClientOutDir)
    : path.join(import.meta.dirname, '__tmp_ts_client__');
  await generate({
    isEnsuringClient: false,
    projectInfo,
    forceNothingWrittenLog: true,
    fullSchema,
    cliGenerateOptions: {
      fullClientFrom: [BuiltInTemplateName.ts],
      fullClientOut: tsFullClientOutDirInput,
    },
  });

  const outDir = cliBundleOptions?.outDir ?? projectInfo.config.bundle.outDir;

  if (!outDir) {
    throw new Error('No output directory specified for bundling');
  }

  await rollupBundle({
    tsFullClientOutDirInput,
    outDir,
    cwd,
  });
}
