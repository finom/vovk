import { VovkSchemaIdEnum, type VovkConfig, type VovkStrictConfig } from 'vovk';
import pick from 'lodash/pick.js';
import mapValues from 'lodash/mapValues.js';
import omit from 'lodash/omit.js';

export default function getMetaSchema({ config, useEmitConfig }: { config: VovkStrictConfig; useEmitConfig: boolean }) {
  return {
    $schema: VovkSchemaIdEnum.META,
    ...{
      config: useEmitConfig
        ? ((config
            ? pick(
                {
                  ...config,
                  generatorConfig: config.generatorConfig
                    ? {
                        ...config.generatorConfig,
                        // TODO: Dirty fix! Need to think of a better way to avoid emission of mixins.
                        segments: config.generatorConfig.segments
                          ? mapValues(config.generatorConfig.segments, (segment) => omit(segment, ['openAPIMixin']))
                          : undefined,
                      }
                    : undefined,
                },
                [...(config.emitConfig as (keyof VovkConfig)[]), '$schema']
              )
            : {}) as VovkStrictConfig)
        : config,
    },
  };
}
