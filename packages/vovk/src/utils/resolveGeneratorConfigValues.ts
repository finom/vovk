import type { PackageJson } from 'type-fest';
import type { VovkConfig, VovkOutputConfig, VovkPackageJson, VovkReadmeConfig, VovkSamplesConfig } from '../types';
import { deepExtend } from './deepExtend';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

// TODO: Refactor
export function resolveGeneratorConfigValues({
  config,
  outputConfigs,
  forceOutputConfigs,
  segmentName,
  isBundle,
  projectPackageJson,
}: {
  config: VovkConfig | undefined;
  outputConfigs: VovkOutputConfig[];
  forceOutputConfigs?: VovkOutputConfig[];
  segmentName: string | null;
  isBundle: boolean;
  projectPackageJson: PackageJson | undefined;
}): {
  readme: VovkReadmeConfig;
  openAPIObject: OpenAPIObject;
  samples: VovkSamplesConfig;
  origin: string;
  package: VovkPackageJson;
  imports: VovkOutputConfig['imports'];
  reExports: VovkOutputConfig['reExports'];
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
      },
    },
    Object.fromEntries(
      Object.entries(projectPackageJson ?? {}).filter(([key]) =>
        ['name', 'version', 'description', 'license', 'authors', 'repository', 'homepage', 'bugs', 'keywords'].includes(
          key
        )
      )
    ) as PackageJson,
    config?.outputConfig?.package,
    typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.package : undefined,
    outputConfigs?.reduce((acc, config) => deepExtend(acc, config.package), {} as PackageJson),
    isBundle ? config?.bundle?.outputConfig?.package : undefined
  );

  return {
    package: packageJson,
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
      config?.outputConfig?.openAPIObject,
      typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.openAPIObject : undefined,
      outputConfigs?.reduce((acc, config) => deepExtend(acc, config.openAPIObject), {} as OpenAPIObject),
      isBundle ? config?.bundle?.outputConfig?.openAPIObject : undefined,
      forceOutputConfigs?.reduce((acc, config) => deepExtend(acc, config.openAPIObject), {} as OpenAPIObject)
    ),
    samples: deepExtend(
      {},
      config?.outputConfig?.samples,
      typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.samples : undefined,
      outputConfigs?.reduce((acc, config) => deepExtend(acc, config.samples), {} as VovkSamplesConfig),
      isBundle ? config?.bundle?.outputConfig?.samples : undefined,
      forceOutputConfigs?.reduce((acc, config) => deepExtend(acc, config.samples), {} as VovkSamplesConfig)
    ),
    readme: deepExtend(
      {},
      config?.outputConfig?.readme,
      typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.readme : undefined,
      outputConfigs?.reduce((acc, config) => deepExtend(acc, config.readme), {} as VovkReadmeConfig),
      isBundle ? config?.bundle?.outputConfig?.readme : undefined,
      forceOutputConfigs?.reduce((acc, config) => deepExtend(acc, config.readme), {} as VovkReadmeConfig)
    ),
    origin:
      [
        config?.outputConfig?.origin,
        typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.origin : undefined,
        ...(outputConfigs?.map((config) => config.origin) ?? []),
        isBundle ? config?.bundle?.outputConfig?.origin : undefined,
        ...(forceOutputConfigs?.map((config) => config.origin) ?? []),
      ]
        .filter(Boolean)
        .at(-1)
        // remove trailing slash if any
        ?.replace(/\/$/, '') ?? '',
    imports: deepExtend(
      {
        fetcher: ['vovk'] as const,
        validateOnClient: null,
        createRPC: ['vovk'] as const,
      } as NonNullable<VovkOutputConfig['imports']>,
      config?.outputConfig?.imports,
      typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.imports : undefined,
      outputConfigs?.reduce(
        (acc, config) => deepExtend(acc, config.imports),
        {} as NonNullable<VovkOutputConfig['imports']>
      ),
      isBundle ? config?.bundle?.outputConfig?.imports : undefined,
      forceOutputConfigs?.reduce(
        (acc, config) => deepExtend(acc, config.imports),
        {} as NonNullable<VovkOutputConfig['imports']>
      )
    ),
    reExports: deepExtend(
      // segmentName can be an empty string (for the root segment) and null (for composed clients)
      // therefore, !segmentName indicates that this either a composed client or a root segment of a segmented client
      {} as NonNullable<VovkOutputConfig['reExports']>,
      !segmentName && config?.outputConfig?.reExports,
      // for segmented client, apply all reExports from all segments
      typeof segmentName !== 'string' &&
        Object.values(config?.outputConfig?.segments ?? {}).reduce(
          (acc, segmentConfig) => deepExtend(acc, segmentConfig.reExports ?? {}),
          {} as NonNullable<VovkOutputConfig['reExports']>
        ),
      // for a specific segment, apply reExports from that segment
      typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.reExports : undefined,
      outputConfigs?.reduce(
        (acc, config) => deepExtend(acc, config.reExports),
        {} as NonNullable<VovkOutputConfig['reExports']>
      ),
      isBundle ? config?.bundle?.outputConfig?.reExports : undefined,
      forceOutputConfigs?.reduce(
        (acc, config) => deepExtend(acc, config.reExports),
        {} as NonNullable<VovkOutputConfig['reExports']>
      )
    ),
  };
}
