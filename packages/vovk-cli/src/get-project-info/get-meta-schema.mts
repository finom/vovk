import pick from 'lodash/pick.js';
import type { VovkConfig } from 'vovk';
import { type VovkMetaSchema, VovkSchemaIdEnum, type VovkStrictConfig } from 'vovk/internal';

export function getMetaSchema({ config }: { config: VovkStrictConfig }): VovkMetaSchema {
  return {
    $schema: VovkSchemaIdEnum.META,
    config: config
      ? // every client builds its URLs from rootEntry, so it's exposed whatever exposeConfigKeys lists
        pick(config, [...(config.exposeConfigKeys as (keyof VovkConfig)[]), 'rootEntry', '$schema'])
      : {
          $schema: VovkSchemaIdEnum.CONFIG,
        },
  };
}
