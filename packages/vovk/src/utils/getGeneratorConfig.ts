import type { PackageJson } from 'type-fest';
import type { VovkProjectConfigCommon, VovkReadmeConfig, VovkSnippetsConfig, VovkSchema } from '../types';
import deepExtend from './deepExtend';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

export function getGeneratorConfig({
  schema,
  config,
  segmentName,
  isBundle,
}: {
  schema: VovkSchema;
  config?: VovkProjectConfigCommon;
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
    schema.meta?.config?.projectConfig?.package,
    isBundle ? schema.meta?.config?.projectConfig?.bundle?.package : undefined,
    segmentName ? schema.segments?.[segmentName]?.meta?.package : undefined,
    segmentName ? schema.meta?.config?.projectConfig?.segments?.[segmentName]?.package : undefined,
    segmentName ? schema.meta?.config?.projectConfig?.segments?.[segmentName]?.openAPIMixin?.package : undefined,
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
      schema.meta?.config?.projectConfig?.openAPIObject,
      isBundle ? schema.meta?.config?.projectConfig?.bundle?.openAPIObject : undefined,
      segmentName ? schema.meta?.config?.projectConfig?.segments?.[segmentName]?.openAPIObject : undefined,
      config?.openAPIObject
    ),
    snippets: deepExtend(
      {},
      schema.meta?.config?.projectConfig?.snippets,
      isBundle ? schema.meta?.config?.projectConfig?.bundle?.snippets : undefined,
      segmentName ? schema.meta?.config?.projectConfig?.segments?.[segmentName]?.snippets : undefined,
      segmentName ? schema.meta?.config?.projectConfig?.segments?.[segmentName]?.openAPIMixin?.snippets : undefined,
      config?.snippets
    ),
    readme: deepExtend(
      {},
      schema.meta?.config?.projectConfig?.readme,
      isBundle ? schema.meta?.config?.projectConfig?.bundle?.readme : undefined,
      segmentName ? schema.meta?.config?.projectConfig?.segments?.[segmentName]?.readme : undefined,
      segmentName ? schema.meta?.config?.projectConfig?.segments?.[segmentName]?.openAPIMixin?.readme : undefined,
      config?.readme
    ),
    origin:
      config?.origin ||
      schema.meta?.config?.projectConfig?.origin ||
      (segmentName ? schema.meta?.config?.projectConfig?.segments?.[segmentName]?.origin : undefined) ||
      (isBundle ? schema.meta?.config?.projectConfig?.bundle?.origin : undefined) ||
      '',
  };
}
