import { VovkSchemaIdEnum, type VovkConfig, type VovkStrictConfig } from 'vovk';
import pick from 'lodash/pick.js';

export function getMetaSchema({ config }: { config: VovkStrictConfig }) {
  return {
    $schema: VovkSchemaIdEnum.META,
    config: config
      ? pick(config, [...(config.exposeConfigKeys as (keyof VovkConfig)[]), '$schema'])
      : {
          $schema: VovkSchemaIdEnum.CONFIG,
        },
  };
}
