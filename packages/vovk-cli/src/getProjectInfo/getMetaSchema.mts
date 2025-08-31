import { VovkSchemaIdEnum, type VovkConfig, type VovkStrictConfig } from 'vovk';
import pick from 'lodash/pick.js';

export default function getMetaSchema({ config, useEmitConfig }: { config: VovkStrictConfig; useEmitConfig: boolean }) {
  return {
    $schema: VovkSchemaIdEnum.META,
    ...{
      config: useEmitConfig
        ? ((config
            ? pick(config, [...(config.emitConfig as (keyof VovkConfig)[]), '$schema'])
            : {}) as VovkStrictConfig)
        : config,
    },
  };
}
