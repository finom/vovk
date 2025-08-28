import path from 'node:path';
import { getGeneratorConfig, type VovkSchema } from 'vovk';
import { ROOT_SEGMENT_FILE_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';

export type ClientImports = {
  fetcher: string;
  validateOnClient: string | null;
  createRPC: string;
};

export default function getTemplateClientImports({
  fullSchema,
  outCwdRelativeDir,
  segmentName,
  isBundle,
}: {
  fullSchema: VovkSchema;
  outCwdRelativeDir: string;
  segmentName: string | null;
  isBundle: boolean;
}) {
  const { imports: configImports } = getGeneratorConfig({ schema: fullSchema, segmentName, isBundle });

  const validateOnClientImport = configImports?.validateOnClient ?? null;
  const fetcherImport = configImports?.fetcher ?? 'vovk';
  const createRPCImport = configImports?.createRPC ?? 'vovk';
  const imports = {
    fetcher: typeof fetcherImport === 'string' ? ([fetcherImport] as const) : fetcherImport,
    validateOnClient:
      typeof validateOnClientImport === 'string'
        ? ([validateOnClientImport] as const)
        : (validateOnClientImport ?? null),
    createRPC: typeof createRPCImport === 'string' ? ([createRPCImport] as const) : createRPCImport,
  };

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
      Object.values(fullSchema.segments).map((segment) => [
        segment.segmentName,
        {
          fetcher: getImportPath(imports.fetcher[0], segment.segmentName || ROOT_SEGMENT_FILE_NAME),
          createRPC: getImportPath(imports.createRPC[0], segment.segmentName || ROOT_SEGMENT_FILE_NAME),
          validateOnClient: imports.validateOnClient
            ? getImportPath(imports.validateOnClient[0], segment.segmentName || ROOT_SEGMENT_FILE_NAME)
            : null,
          module: {
            fetcher: getImportPath(
              imports.fetcher[1] ?? imports.fetcher[0],
              segment.segmentName || ROOT_SEGMENT_FILE_NAME
            ),
            createRPC: getImportPath(
              imports.createRPC[1] ?? imports.createRPC[0],
              segment.segmentName || ROOT_SEGMENT_FILE_NAME
            ),
            validateOnClient: imports.validateOnClient
              ? getImportPath(
                  imports.validateOnClient[1] ?? imports.validateOnClient[0],
                  segment.segmentName || ROOT_SEGMENT_FILE_NAME
                )
              : null,
          },
        },
      ])
    ),
  };

  return clientImports;
}
