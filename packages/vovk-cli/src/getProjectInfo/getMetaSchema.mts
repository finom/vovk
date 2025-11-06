import { VovkSchemaIdEnum, type VovkConfig, type VovkStrictConfig } from 'vovk';
import pick from 'lodash/pick.js';
import mapValues from 'lodash/mapValues.js';
import omit from 'lodash/omit.js';

export default function getMetaSchema({ config }: { config: VovkStrictConfig }) {
  return {
    $schema: VovkSchemaIdEnum.META,
    ...{
      config: (config
        ? pick(
            {
              ...config,
              outputConfig: config.outputConfig
                ? {
                    ...config.outputConfig,
                    // TODO: Dirty fix! Need to think of a better way to avoid emission of mixins.
                    segments: config.outputConfig.segments
                      ? mapValues(config.outputConfig.segments, (segment) => omit(segment, ['openAPIMixin']))
                      : undefined,
                  }
                : undefined,
            },
            [...(config.exposeConfigKeys as (keyof VovkConfig)[]), '$schema']
          )
        : {}) as VovkStrictConfig,
    },
  };
}
