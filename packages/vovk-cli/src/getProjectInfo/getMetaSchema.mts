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
    package: pick(packageJson, ['name', 'version', 'description', 'author', 'license']),
    ...{
      config: (config
        ? pick(config, [...(config.emitConfig as (keyof VovkConfig)[]), '$schema'])
        : {}) as VovkStrictConfig,
    },
  };
}
