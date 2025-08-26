import type { PackageJson } from 'type-fest';
import type { VovkGeneratorConfigCommon, VovkReadmeConfig, VovkSnippetsConfig, VovkSchema } from '../types';
import deepExtend from './deepExtend';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

export function getGeneratorConfig({
  schema,
  config,
  segmentName,
  isBundle,
}: {
  schema: VovkSchema;
  config?: VovkGeneratorConfigCommon;
  segmentName?: string;
  isBundle?: boolean;
}): {
  readme: VovkReadmeConfig;
  openAPIObject: OpenAPIObject;
  snippets: VovkSnippetsConfig;
  origin: string;
  package: PackageJson;
} {
  const packageJson = deepExtend(
    {} as PackageJson,
    schema.meta?.package,
    schema.meta?.config?.generatorConfig?.package,
    isBundle ? schema.meta?.config?.bundle?.generatorConfig?.package : undefined,
    segmentName ? schema.segments?.[segmentName]?.meta?.package : undefined,
    segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.package : undefined,
    segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.openAPIMixin?.package : undefined,
    config?.package
  );

  return {
    package: packageJson,
    openAPIObject: deepExtend(
      {} as OpenAPIObject,
      {
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
      config?.openAPIObject
    ),
    snippets: deepExtend(
      {},
      schema.meta?.config?.generatorConfig?.snippets,
      isBundle ? schema.meta?.config?.bundle?.generatorConfig?.snippets : undefined,
      segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.snippets : undefined,
      segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.openAPIMixin?.snippets : undefined,
      config?.snippets
    ),
    readme: deepExtend(
      {},
      schema.meta?.config?.generatorConfig?.readme,
      isBundle ? schema.meta?.config?.bundle?.generatorConfig?.readme : undefined,
      segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.readme : undefined,
      segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.openAPIMixin?.readme : undefined,
      config?.readme
    ),
    origin:
      config?.origin ||
      schema.meta?.config?.generatorConfig?.origin ||
      (segmentName ? schema.meta?.config?.generatorConfig?.segments?.[segmentName]?.origin : undefined) ||
      (isBundle ? schema.meta?.config?.bundle?.generatorConfig?.origin : undefined) ||
      '',
  };
}
