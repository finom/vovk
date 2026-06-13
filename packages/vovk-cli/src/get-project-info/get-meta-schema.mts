import pick from 'lodash/pick.js';
import type { VovkConfig } from 'vovk';
import { type VovkMetaSchema, VovkSchemaIdEnum, type VovkStrictConfig } from 'vovk/internal';

export function getMetaSchema({ config }: { config: VovkStrictConfig }): VovkMetaSchema {
  return {
    $schema: VovkSchemaIdEnum.META,
    config: config
      ? pick(config, [...(config.exposeConfigKeys as (keyof VovkConfig)[]), '$schema'])
      : {
          $schema: VovkSchemaIdEnum.CONFIG,
        },
  };
}
