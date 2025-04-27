import type { VovkFullSchema } from 'vovk';

export default function pickSegmentFullSchema(fullSchema: VovkFullSchema, segmentNames: string[]): VovkFullSchema {
  return {
    config: fullSchema.config,
    segments: {
      ...Object.fromEntries(segmentNames.map((segmentName) => [segmentName, fullSchema.segments[segmentName]])),
    },
  };
}

export function omitSegmentFullSchema(fullSchema: VovkFullSchema, segmentNames: string[]): VovkFullSchema {
  return {
    config: fullSchema.config,
    segments: Object.fromEntries(
      Object.entries(fullSchema.segments).filter(([segmentName]) => !segmentNames.includes(segmentName))
    ),
  };
}
