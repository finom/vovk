import type { PackageJson } from 'type-fest';
import type {
  VovkGeneratorConfigCommon,
  VovkReadmeConfig,
  VovkSnippetsConfig,
  VovkSchema,
  VovkGeneratorConfigStrict,
} from '../types';
import deepExtend from './deepExtend';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

export function getGeneratorConfig({
  schema,
  configs,
  segmentName,
  isBundle,
  projectPackageJson,
}: {
  schema: VovkSchema;
  configs?: VovkGeneratorConfigCommon[];
  segmentName: string | null;
  isBundle?: boolean;
  projectPackageJson?: PackageJson;
}): {
  readme: VovkReadmeConfig;
  openAPIObject: OpenAPIObject;
  snippets: VovkSnippetsConfig;
  origin: string;
  package: PackageJson;
  imports: VovkGeneratorConfigStrict['imports'];
  reExports: VovkGeneratorConfigStrict['reExports'];
} {
  const packageJson = deepExtend(
    {} as PackageJson,
    {
      main: './index.cjs',
      module: './index.mjs',
      types: './index.d.mts',
      exports: {
        '.': {
          import: './index.mjs',
          require: './index.cjs',
          types: './index.d.mts',
        },
        './schema': {
          import: './schema.cjs',
          require: './schema.cjs',
          types: './schema.d.cts',
        },
        './openapi': {
          import: './openapi.cjs',
          require: './openapi.cjs',
          types: './openapi.d.cts',
        },
      },
    },
    projectPackageJson,
    schema.meta?.config?.generatorConfig?.package,
    isBundle ? schema.meta?.config?.bundle?.generatorConfig?.package : undefined,
    segmentName ? schema.segments?.[segmentName]?.meta?.package : undefined,
    segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.package : undefined,
    configs?.reduce((acc, config) => deepExtend(acc, config.package), {} as PackageJson)
  );

  return {
    package: Object.fromEntries(
      Object.entries(packageJson).filter(([key]) =>
        ['name', 'version', 'description', 'license', 'authors', 'repository', 'homepage', 'bugs', 'keywords'].includes(
          key
        )
      )
    ) as PackageJson,
    openAPIObject: deepExtend(
      {} as OpenAPIObject,
      {
        openapi: '3.1.0',
        info: {
          title: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
        },
      },
      schema.meta?.config?.generatorConfig?.openAPIObject,
      isBundle ? schema.meta?.config?.bundle?.generatorConfig?.openAPIObject : undefined,
      segmentName ? schema?.segments?.[segmentName]?.meta?.openAPIObject : undefined,
      segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.openAPIObject : undefined,
      configs?.reduce((acc, config) => deepExtend(acc, config.openAPIObject), {} as OpenAPIObject)
    ),
    snippets: deepExtend(
      {},
      schema.meta?.config?.generatorConfig?.snippets,
      isBundle ? schema.meta?.config?.bundle?.generatorConfig?.snippets : undefined,
      segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.snippets : undefined,
      configs?.reduce((acc, config) => deepExtend(acc, config.snippets), {} as VovkSnippetsConfig)
    ),
    readme: deepExtend(
      {},
      schema.meta?.config?.generatorConfig?.readme,
      isBundle ? schema.meta?.config?.bundle?.generatorConfig?.readme : undefined,
      segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.readme : undefined,
      configs?.reduce((acc, config) => deepExtend(acc, config.readme), {} as VovkReadmeConfig)
    ),
    origin:
      [
        isBundle ? schema.meta?.config?.bundle?.generatorConfig?.origin : undefined,
        segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.origin : undefined,
        schema.meta?.config?.generatorConfig?.origin,
        ...(configs?.map((config) => config.origin) ?? []),
      ]
        .filter(Boolean)
        .at(-1) ?? '',
    imports: deepExtend(
      {
        fetcher: ['vovk'] as const,
        validateOnClient: null,
        createRPC: ['vovk'] as const,
      } as NonNullable<VovkGeneratorConfigStrict['imports']>,
      schema.meta?.config?.generatorConfig?.imports,
      isBundle ? schema.meta?.config?.bundle?.generatorConfig?.imports : undefined,
      segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.imports : undefined,
      configs?.reduce(
        (acc, config) => deepExtend(acc, config.imports),
        {} as NonNullable<VovkGeneratorConfigStrict['imports']>
      )
    ),
    reExports: deepExtend(
      // segmentName can be an empty string (for the root segment) and null (for composed clients)
      // therefore, !segmentName indicates that this either a composed client or a root segment of a segmented client
      {} as NonNullable<VovkGeneratorConfigStrict['reExports']>,
      !segmentName && schema.meta?.config?.generatorConfig?.reExports,
      !segmentName && isBundle ? schema.meta?.config?.bundle?.generatorConfig?.reExports : undefined,
      segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.reExports : undefined,
      configs?.reduce(
        (acc, config) => deepExtend(acc, config.reExports),
        {} as NonNullable<VovkGeneratorConfigStrict['reExports']>
      )
    ),
  };
}
