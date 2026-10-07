import path from 'node:path';
import type { VovkSchema } from 'vovk';
import { resolveGeneratorConfigValues, type VovkStrictConfig } from 'vovk/internal';
import { ROOT_SEGMENT_FILE_NAME } from '../dev/write-one-segment-schema-file.mjs';
import { toImportPath } from '../utils/to-import-path.mjs';

export type ClientImports = {
  fetcher: string;
  validateOnClient: string | null;
  createRPC: string;
};

// a TypeScript file named by its own extension, as the v3 client in node_modules needed, goes by the name TypeScript
// resolves: none under bundler resolution, the .js one under node16+; .mts and .cts always by .mjs and .cjs
function toImportExtension(importPath: string, isNodeNextResolution: boolean, tsExtension: string) {
  if (tsExtension === '.ts') return importPath;
  return importPath.replace(/\.([mc])ts$/, '.$1js').replace(/\.tsx?$/, isNodeNextResolution ? '.js' : '');
}

export function getTemplateClientImports({
  config,
  fullSchema,
  outCwdRelativeDir,
  relativeDir = '',
  segmentName,
  isBundle,
  outputConfigs,
  isNodeNextResolution,
  tsExtension,
}: {
  config: VovkStrictConfig;
  fullSchema: VovkSchema;
  outCwdRelativeDir: string;
  // where the file goes inside the client, a segmented client puts the segment folder before it
  relativeDir?: string;
  segmentName: string | null;
  isBundle: boolean;
  outputConfigs: VovkStrictConfig['outputConfig'][];
  isNodeNextResolution: boolean;
  // .ts when TypeScript may import .ts files
  tsExtension: string;
}) {
  const { imports: configImports } = resolveGeneratorConfigValues({
    config,
    segmentName,
    isBundle,
    projectPackageJson: undefined,
    outputConfigs,
  });

  const imports = {
    fetcher: configImports?.fetcher ?? 'vovk/fetcher',
    validateOnClient: configImports?.validateOnClient ?? null,
    createRPC: configImports?.createRPC ?? 'vovk/create-rpc',
  };

  const getImportPath = (p: string, s = '') =>
    p.startsWith('.')
      ? toImportExtension(
          toImportPath(path.relative(path.join(outCwdRelativeDir, s, relativeDir), p)),
          isNodeNextResolution,
          tsExtension
        )
      : p;

  const clientImports: {
    composedClient: ClientImports;
    segmentedClient: Record<string, ClientImports>;
  } = {
    composedClient: {
      fetcher: getImportPath(imports.fetcher),
      createRPC: getImportPath(imports.createRPC),
      validateOnClient: imports.validateOnClient ? getImportPath(imports.validateOnClient) : null,
    },
    segmentedClient: Object.fromEntries(
      Object.values(fullSchema.segments).map((segment) => [
        segment.segmentName,
        {
          fetcher: getImportPath(imports.fetcher, segment.segmentName || ROOT_SEGMENT_FILE_NAME),
          createRPC: getImportPath(imports.createRPC, segment.segmentName || ROOT_SEGMENT_FILE_NAME),
          validateOnClient: imports.validateOnClient
            ? getImportPath(imports.validateOnClient, segment.segmentName || ROOT_SEGMENT_FILE_NAME)
            : null,
        },
      ])
    ),
  };

  return clientImports;
}
