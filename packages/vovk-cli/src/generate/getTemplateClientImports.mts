import path from 'node:path';
import type { VovkStrictConfig } from 'vovk';
import type { Segment } from '../locateSegments.mjs';
import { ROOT_SEGMENT_SCHEMA_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';

export type ClientImports = {
  fetcher: string;
  validateOnClient: string | null;
  createRPC: string;
};

export default function getTemplateClientImports({
  config,
  segments,
  outCwdRelativeDir,
}: {
  config: VovkStrictConfig;
  segments: Segment[];
  outCwdRelativeDir: string;
}) {
  const { imports } = config;
  const getImportPath = (p: string, s = '') =>
    p.startsWith('.') ? path.relative(path.join(outCwdRelativeDir, s), p) : p;

  const clientImports: {
    composedClient: ClientImports & { module: ClientImports };
    segmentedClient: Record<string, ClientImports & { module: ClientImports }>;
  } = {
    composedClient: {
      fetcher: getImportPath(imports.fetcher[0]),
      createRPC: getImportPath(imports.createRPC[0]),
      validateOnClient: imports.validateOnClient ? getImportPath(imports.validateOnClient[0]) : null,
      module: {
        fetcher: getImportPath(imports.fetcher[1] ?? imports.fetcher[0]),
        createRPC: getImportPath(imports.createRPC[1] ?? imports.createRPC[0]),
        validateOnClient: imports.validateOnClient
          ? getImportPath(imports.validateOnClient[1] ?? imports.validateOnClient[0])
          : null,
      },
    },
    segmentedClient: Object.fromEntries(
      segments.map((segment) => [
        segment.segmentName,
        {
          fetcher: getImportPath(imports.fetcher[0], segment.segmentName || ROOT_SEGMENT_SCHEMA_NAME),
          createRPC: getImportPath(imports.createRPC[0], segment.segmentName || ROOT_SEGMENT_SCHEMA_NAME),
          validateOnClient: imports.validateOnClient
            ? getImportPath(imports.validateOnClient[0], segment.segmentName || ROOT_SEGMENT_SCHEMA_NAME)
            : null,
          module: {
            fetcher: getImportPath(
              imports.fetcher[1] ?? imports.fetcher[0],
              segment.segmentName || ROOT_SEGMENT_SCHEMA_NAME
            ),
            createRPC: getImportPath(
              imports.createRPC[1] ?? imports.createRPC[0],
              segment.segmentName || ROOT_SEGMENT_SCHEMA_NAME
            ),
            validateOnClient: imports.validateOnClient
              ? getImportPath(
                  imports.validateOnClient[1] ?? imports.validateOnClient[0],
                  segment.segmentName || ROOT_SEGMENT_SCHEMA_NAME
                )
              : null,
          },
        },
      ])
    ),
  };

  return clientImports;
}
