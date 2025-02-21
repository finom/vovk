// auto-generated 2025-02-20T12:48:31.902Z
import type { VovkSegmentSchema, VovkStrictConfig } from 'vovk';
import config from './config.json';
import segment0 from './segments/_root.json';
import segment1 from './segments/foo/client.json';
import segment2 from './segments/generated.json';
const fullSchema = {
  config: config as unknown as Partial<VovkStrictConfig>,
  segments: {
    '': segment0 as unknown as VovkSegmentSchema,
    'foo/client': segment1 as unknown as VovkSegmentSchema,
    'generated': segment2 as unknown as VovkSegmentSchema,
  }
};
export default fullSchema;