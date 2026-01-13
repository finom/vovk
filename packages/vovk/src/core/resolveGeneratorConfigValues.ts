import type { PackageJson } from 'type-fest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { VovkConfig, VovkOutputConfig, VovkPackageJson, VovkReadmeConfig, VovkSamplesConfig } from '../types.js';
import { deepExtend } from '../utils/deepExtend.js';

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
  const packageJson: PackageJson = deepExtend(
    Object.fromEntries(
      Object.entries(projectPackageJson ?? {}).filter(([key]) =>
        [
          'name',
          'version',
          'description',
          'license',
          'author',
          'contributors',
          'repository',
          'homepage',
          'bugs',
          'keywords',
        ].includes(key)
      )
    ),
    config?.outputConfig?.package,
    typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.package : undefined,
    outputConfigs?.reduce((acc, config) => deepExtend(acc, config.package), {} as PackageJson),
    isBundle ? config?.bundle?.outputConfig?.package : undefined
  );

  const openAPIObject: OpenAPIObject = deepExtend(
    {
      openapi: '3.1.0',
      info: {
        title: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
      },
    } as OpenAPIObject,
    config?.outputConfig?.openAPIObject,
    typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.openAPIObject : undefined,
    outputConfigs?.reduce((acc, config) => deepExtend(acc, config.openAPIObject), {} as OpenAPIObject),
    isBundle ? config?.bundle?.outputConfig?.openAPIObject : undefined,
    forceOutputConfigs?.reduce((acc, config) => deepExtend(acc, config.openAPIObject), {} as OpenAPIObject)
  );

  const samples: VovkSamplesConfig = deepExtend(
    {},
    config?.outputConfig?.samples,
    typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.samples : undefined,
    outputConfigs?.reduce((acc, config) => deepExtend(acc, config.samples), {} as VovkSamplesConfig),
    isBundle ? config?.bundle?.outputConfig?.samples : undefined,
    forceOutputConfigs?.reduce((acc, config) => deepExtend(acc, config.samples), {} as VovkSamplesConfig)
  );

  const readme: VovkReadmeConfig = deepExtend(
    {},
    config?.outputConfig?.readme,
    typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.readme : undefined,
    outputConfigs?.reduce((acc, config) => deepExtend(acc, config.readme), {}),
    isBundle ? config?.bundle?.outputConfig?.readme : undefined,
    forceOutputConfigs?.reduce((acc, config) => deepExtend(acc, config.readme), {})
  );

  const origin: string =
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
      ?.replace(/\/$/, '') ?? '';

  const imports: NonNullable<VovkOutputConfig['imports']> = deepExtend(
    {
      fetcher: 'vovk/fetcher',
      validateOnClient: null,
      createRPC: 'vovk/createRPC',
    },
    config?.outputConfig?.imports,
    typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.imports : undefined,
    outputConfigs?.reduce((acc, config) => deepExtend(acc, config.imports), {}),
    isBundle ? config?.bundle?.outputConfig?.imports : undefined,
    forceOutputConfigs?.reduce((acc, config) => deepExtend(acc, config.imports), {})
  );
  const reExports: NonNullable<VovkOutputConfig['reExports']> = deepExtend(
    // segmentName can be an empty string (for the root segment) and null (for composed clients)
    // therefore, !segmentName indicates that this either a composed client or a root segment of a segmented client
    {},
    !segmentName && config?.outputConfig?.reExports,
    // for segmented client, apply all reExports from all segments
    typeof segmentName !== 'string' &&
      Object.values(config?.outputConfig?.segments ?? {}).reduce(
        (acc, segmentConfig) => deepExtend(acc, segmentConfig.reExports ?? {}),
        {}
      ),
    // for a specific segment, apply reExports from that segment
    typeof segmentName === 'string' ? config?.outputConfig?.segments?.[segmentName]?.reExports : undefined,
    outputConfigs?.reduce((acc, config) => deepExtend(acc, config.reExports), {}),
    isBundle ? config?.bundle?.outputConfig?.reExports : undefined,
    forceOutputConfigs?.reduce((acc, config) => deepExtend(acc, config.reExports), {})
  );

  return {
    package: packageJson,
    openAPIObject,
    samples,
    readme,
    origin,
    imports,
    reExports,
  };
}
