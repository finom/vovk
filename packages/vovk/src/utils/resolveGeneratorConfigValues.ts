import type { PackageJson } from 'type-fest';
import type { VovkGeneratorConfig, VovkReadmeConfig, VovkSamplesConfig, VovkSchema } from '../types';
import deepExtend from './deepExtend';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

export function resolveGeneratorConfigValues({
  schema,
  configs,
  segmentName,
  isBundle,
  projectPackageJson,
}: {
  schema: VovkSchema;
  configs?: VovkGeneratorConfig[];
  segmentName: string | null;
  isBundle?: boolean;
  projectPackageJson?: PackageJson;
}): {
  readme: VovkReadmeConfig;
  openAPIObject: OpenAPIObject;
  samples: VovkSamplesConfig;
  origin: string;
  package: PackageJson;
  imports: VovkGeneratorConfig['imports'];
  reExports: VovkGeneratorConfig['reExports'];
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
    typeof segmentName === 'string' ? schema.segments?.[segmentName]?.meta?.package : undefined,
    typeof segmentName === 'string'
      ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.package
      : undefined,
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
      typeof segmentName === 'string' ? schema?.segments?.[segmentName]?.meta?.openAPIObject : undefined,
      typeof segmentName === 'string'
        ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.openAPIObject
        : undefined,
      configs?.reduce((acc, config) => deepExtend(acc, config.openAPIObject), {} as OpenAPIObject)
    ),
    samples: deepExtend(
      {},
      schema.meta?.config?.generatorConfig?.samples,
      isBundle ? schema.meta?.config?.bundle?.generatorConfig?.samples : undefined,
      typeof segmentName === 'string'
        ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.samples
        : undefined,
      configs?.reduce((acc, config) => deepExtend(acc, config.samples), {} as VovkSamplesConfig)
    ),
    readme: deepExtend(
      {},
      schema.meta?.config?.generatorConfig?.readme,
      isBundle ? schema.meta?.config?.bundle?.generatorConfig?.readme : undefined,
      typeof segmentName === 'string'
        ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.readme
        : undefined,
      configs?.reduce((acc, config) => deepExtend(acc, config.readme), {} as VovkReadmeConfig)
    ),
    origin:
      [
        isBundle ? schema.meta?.config?.bundle?.generatorConfig?.origin : undefined,
        typeof segmentName === 'string'
          ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.origin
          : undefined,
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
      } as NonNullable<VovkGeneratorConfig['imports']>,
      schema.meta?.config?.generatorConfig?.imports,
      isBundle ? schema.meta?.config?.bundle?.generatorConfig?.imports : undefined,
      typeof segmentName === 'string'
        ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.imports
        : undefined,
      configs?.reduce(
        (acc, config) => deepExtend(acc, config.imports),
        {} as NonNullable<VovkGeneratorConfig['imports']>
      )
    ),
    reExports: deepExtend(
      // segmentName can be an empty string (for the root segment) and null (for composed clients)
      // therefore, !segmentName indicates that this either a composed client or a root segment of a segmented client
      {} as NonNullable<VovkGeneratorConfig['reExports']>,
      !segmentName && schema.meta?.config?.generatorConfig?.reExports,
      !segmentName && isBundle ? schema.meta?.config?.bundle?.generatorConfig?.reExports : undefined,
      // for segmented client, apply all reExports from all segments
      typeof segmentName !== 'string' &&
        Object.values(schema.meta?.config?.generatorConfig?.segments ?? {}).reduce(
          (acc, segmentConfig) => deepExtend(acc, segmentConfig.reExports ?? {}),
          {} as NonNullable<VovkGeneratorConfig['reExports']>
        ),
      // for a specific segment, apply reExports from that segment
      typeof segmentName === 'string'
        ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.reExports
        : undefined,
      configs?.reduce(
        (acc, config) => deepExtend(acc, config.reExports),
        {} as NonNullable<VovkGeneratorConfig['reExports']>
      )
    ),
  };
}
