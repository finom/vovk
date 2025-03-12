import type { VovkFullSchema } from 'vovk';

export default function pickSegmentFullSchema(fullSchema: VovkFullSchema, segmentName: string): VovkFullSchema {
  return {
    config: fullSchema.config,
    segments: {
      [segmentName]: fullSchema.segments[segmentName],
    },
  };
}
