import { VovkConfig, VovkSchemaIdEnum, VovkStrictConfig } from 'vovk';
import pick from 'lodash/pick.js';
import { PackageJson } from 'type-fest';

export default function getMetaSchema({
  config,
  package: packageJson,
}: {
  config: VovkStrictConfig;
  package: PackageJson;
}) {
  return {
    $schema: VovkSchemaIdEnum.META,
    package: {
      ...pick(packageJson, ['name', 'version', 'description', 'author', 'license']),
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
    ...{
      config: (config
        ? pick(config, [...(config.emitConfig as (keyof VovkConfig)[]), '$schema'])
        : {}) as VovkStrictConfig,
    },
  };
}
